const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

/* 
 INITIALISING TABLES
*/
// Start: Fetch data to display user information table
async function fetchUserInfoTableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT * FROM Users WHERE Username = 'frodo'`);
        return result.rows;
    }).catch(() => {
        return [];
    });
 }
 // End: Fetch data to display user information table
 
 // Start: Fetch data to display user investment account table
 async function fetchUserInvestAccTableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT Total_Balance, Cash_Balance, Equity_Balance, Date_Opened FROM Managed_Investment_Account WHERE Account_Number = 'ACC005'`);
        return result.rows;
    }).catch(() => {
        return [];
    });
 }
 // End: Fetch data to display user investment account table 
 
 // Start: Fetch data to display user investment account table
 async function fetchUserRetireAccTableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT Total_Balance, Cash_Balance, Equity_Balance, Date_Opened FROM Managed_Investment_Account WHERE Account_Number = 'ACC006'`);
        return result.rows;
    }).catch(() => {
        return [];
    });
 }
 // End: Fetch data to display user investment account table 
 
 // Start: Fetch data to display user banking table
 async function fetchUserBankTableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT Type, Bank_Account_Number, Institution_Number, Transit_Number FROM Managed_Bank_Account WHERE Username = 'frodo'`);

        return result.rows;
    }).catch(() => {
        return [];
    });
 }
 // End: Fetch data to display user banking table 

 async function fetchUserInvestmentAccs() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT Account_Number FROM Managed_Investment_Account WHERE Username = 'frodo'`);
        return result.rows;
    }).catch(() => {
        return [];
    });
 }

 async function fetchEquities() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT Ticker_Symbol FROM Listed_Equity`);
        return result.rows;
    }).catch(() => {
        return [];
    });
 }

 async function fetchTransa() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT ct.Transaction_Number, ct.Account_Number, ct.Amount, ct.Time FROM Completed_Transaction ct, Managed_Investment_Account mic WHERE ct.Account_Number = mic.Account_Number AND mic.Username = 'frodo'`);
        return result.rows;
    }).catch(() => {
        return [];
    });
 }
/* 
QUERIES
*/
// Start: Insert function for buying equity
// 
async function insertTransaction(account, ticker, quantity) {
    return await withOracleDB(async (connection) => {

        // Get amount to be paid for quantity requested
        const price = await connection.execute(
            `SELECT Price FROM Listed_Equity WHERE Ticker_Symbol = :ticker`,
            [ticker]
        );
        const amount = price.rows * quantity;

        // Check for sufficient funds (cash)
        const funds = await connection.execute(
            `SELECT Cash_Balance FROM Managed_Investment_Account WHERE Account_Number = :account`,
            [account]
        )
        const cashRemaining = funds.rows - amount;
        if (cashRemaining < 0) {
            throw new Error(`Insufficient funds!`);
            // return false;
        }

        // Get next sequential transaction number for given account
        const trans = await connection.execute(
            `SELECT COUNT(*) FROM Completed_Transaction WHERE Account_Number = :account`,
            [account]
        );
        const num = parseInt(trans.rows) + 1;
        const transactionNumber = "TXN00"+num;

        // Add new Completed_Transaction tuple
        const transactionResult = await connection.execute(
            `INSERT INTO Completed_Transaction VALUES (:transactionNumber, :account, :amount, sysdate)`,
            [transactionNumber, account, amount],
            { autoCommit: false }
        );

        // Add new Transfers tuple
        const transferResult = await connection.execute(
            `INSERT INTO Transfers VALUES (:transactionNumber, :account, :ticker, :quantity, sysdate)`,
            [transactionNumber, account, ticker, quantity],
            { autoCommit: false }
        );

        // Add new Holds tuple
        // Check if already holding equity
        const alreadyHeld = await connection.execute(
            `SELECT Quantity FROM Holds WHERE Ticker_Symbol = :ticker AND Account_Number = :account`,
            [ticker, account]
        )
        let holdResult = 0;
        if (!parseInt(alreadyHeld.rows)) {
                // If no, insert new tuple
            holdResult = await connection.execute(
                `INSERT INTO Holds VALUES (:account, :ticker, :quantity)`,
                [account, ticker, quantity],
                { autoCommit: false }
            );
                // If yes, update tuple
        } else {
            holdResult = await connection.execute(
                `UPDATE Holds SET quantity = ${parseInt(alreadyHeld.rows) + quantity} WHERE Ticker_Symbol = :ticker AND Account_Number = :account`,
                [ticker, account],
                { autoCommit: false }
            )
        }

        // Update Managed_Investment_Account cash balance
        const investCashResult = await connection.execute(
            `UPDATE Managed_Investment_Account SET Cash_Balance = :cashRemaining WHERE Account_Number = :account`,
            [cashRemaining, account],
            { autoCommit: false }
        );

        // Get equity balance before purchase
        const equity = await connection.execute(
            `SELECT Equity_Balance FROM Managed_Investment_Account WHERE Account_Number = :account`,
            [account]
        )
        const newEquity = parseInt(equity.rows) + amount;

        // Update Managed_Investment_Account equity balance
        const investEquityResult = await connection.execute(
            `UPDATE Managed_Investment_Account SET Equity_Balance = :newEquity WHERE Account_Number = :account`,
            [newEquity, account],
            { autoCommit: false }
        );

        // Get total balance before purchase
        const totalBal = await connection.execute(
            'SELECT Total_Balance FROM Managed_Investment_Account WHERE Account_Number = :account',
            [account]
        )

        // Update Managed_Investment_Account total balance
        const investTotalResult = await connection.execute(
            `UPDATE Managed_Investment_Account SET Total_Balance = :totBal WHERE Account_Number = :account`,
            [totalBal.rows - amount, account],
            { autoCommit: false }
        );

        const result = transactionResult.rowsAffected && transferResult.rowsAffected && holdResult.rowsAffected && investCashResult.rowsAffected && investEquityResult.rowsAffected && investTotalResult.rowsAffected;
        if (result > 0) {
            await connection.execute('Commit');
        }
        return result;
    }).catch(() => {
        return false;
    });
}
// End: Insert function for buying equity

// Start: Update functions for User table

async function updateUserTable(column, oldValue, newValue) {
    const allowedColumns = ['Name', 'SIN_SSN', 'Address', 'DOB', 'PostalCode'];

    if (!allowedColumns.includes(column)) {
        throw new Error(`Invalid column name: ${column}`);
    }

    let query = '';
    if (column == 'DOB') {
        query = `UPDATE Users SET ${column} = TO_DATE(:newValue, 'dd-mm-yyyy') WHERE ${column} = TO_DATE(:oldValue, 'dd-mm-yyyy') AND Username = 'frodo'`;
    } else {
        query = `UPDATE Users SET ${column} = :newValue WHERE ${column} = :oldValue AND Username = 'frodo'`;
    }

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            query,
            { newValue, oldValue },
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error(`Failed to update ${column}:`, error);
        return false;
    });
}

async function updateName(oldName, newName) {
    return await updateUserTable('Name', oldName, newName);
}

async function updateSIN(oldSIN, newSIN) {
    return await updateUserTable('SIN_SSN', oldSIN, newSIN);
}

async function updateAddress(oldAddress, newAddress) {
    return await updateUserTable('Address', oldAddress, newAddress);
}

async function updateDOB(oldDOB, newDOB) {
    return await updateUserTable('DOB', oldDOB, newDOB);
}

async function updatePostalCode(oldPC, newPC) {
    return await updateUserTable('PostalCode', oldPC, newPC);
}
// End: Update functions for User table

// Start: Delete function for Managed_Bank_Account
async function deleteBankAccount(Institution_Number, Transit_Number, Bank_Account_Number) {

    const query = `DELETE FROM Managed_Bank_Account WHERE Transit_Number = ${Transit_Number} 
        AND Institution_Number = ${Institution_Number}
        AND Bank_Account_Number = '${Bank_Account_Number}'`;

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(query);
        await connection.execute('Commit');

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((err) => {
        return false;
    });
}
// End: Delete function for Managed_Bank_Account

// Start: Delete function for Watched_Equity
async function deleteWatchedEquity(ID, Ticker_Symbol) {

    const query = `DELETE FROM Watched_Equity WHERE ID = ${ID} 
        AND Ticker_Symbol = '${Ticker_Symbol}'`;

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(query);
        await connection.execute('Commit');

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((err) => {
        return false;
    });
}
// End: Delete function for Watched_Equity

// Start: Projection function for Completed_Transactions
const allowedProjectionFields = ['Transaction_Number', 'Account_Number', 'Amount'];

function validateFields(requestedFields) {
    if (!requestedFields || requestedFields.length === 0) {
        return allowedProjectionFields;
    }

    const validatedFields = [];

    for (const field of requestedFields) {
        if (allowedProjectionFields.includes(field)) {
            validatedFields.push(`ct.${field}`);
        } else {
            throw new Error(`Invalid field requested: ${field}`);
        }
    }
    return validatedFields;
}
async function getTransactionsByFields(fields) {
    // validate
    const selectedColumns = validateFields(fields);
    const columnsStr = selectedColumns.join(', ');

    // query
    const query = `SELECT ${columnsStr} FROM Completed_Transaction ct, Managed_Investment_Account mic WHERE ct.Account_Number = mic.Account_Number AND mic.Username = 'frodo'`;

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            query,
            [],
            { outFormat: connection.OUT_FORMAT_OBJECT }
        );
        return result.rows;
    }).catch((error) => {
        console.error('Error fetching Transactions:', error);
        throw error;
    });
}
// End: Projection function for Completed_Transactions

// Start: Join query with Hosted_Company and Stock_Exchange_Country
//async function joinStockCompany(country) {
//    return await withOracleDB(async (connection) => {
//        const result = await connection.execute('SELECT * FROM Hosted_Company c, Stock_Exchange_Country s WHERE c.country = s.country');
//        return result.rows;
//    }).catch(() => {
//        return -1;
//    });
//}
// End: Join query with Hosted_Company and Stock_Exchange_Country

// Start: Aggregation with group by function for transactions
const allowedGroupByFields = ['Transaction_Number', 'Account_Number', 'Amount', 'Ticker_Symbol'];

function validateGroupByFields(requestedFields) {
    if (!requestedFields || requestedFields.length === 0) {
        return allowedGroupByFields;
    }

    const validatedFields = [];

    for (const field of requestedFields) {
        if (allowedGroupByFields.includes(field)) {
            let tempfield = field
            if (field === 'Amount') {
                tempfield = 'Quantity';
            }
            validatedFields.push(`t.${tempfield}`);
        } else {
            throw new Error(`Invalid group field requested: ${field}`);
        }
    }
    return validatedFields;
}

async function getGroupByFields(fields) {
    const selectedFields = validateGroupByFields(fields);
    //const fieldsStr = fields;
    const fieldsStr = selectedFields.join(', ');

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT ${fieldsStr}, COUNT(*) FROM Transfers t, Managed_Investment_Account mic WHERE t.Account_Number = mic.Account_Number AND mic.Username = 'frodo' GROUP BY ${fieldsStr}`);
        return result.rows;
    }).catch((error) => {
        //console.error('Error grouping Transfers:', error);
        throw error;
    });
}
// End: Aggregation with group by function for transactions


// Start: Nested aggregation with group by function -- not in use (another version further down)
// async function aggGroupByQuery() {
//     return await withOracleDB(async (connection) => {

//         // Using views cause aint no way im doing that in one query
//         const stockView = "CREATE VIEW Stock_View AS "
//             + "SELECT e.Company_Name, COUNT(*) AS Stock_Count "
//             + "FROM Listed_Equity e "
//             + "INNER JOIN Stock s ON e.Ticker_Symbol = s.Ticker_Symbol "
//             + "GROUP BY e.Company_Name"

//         const StockViewDrop = "DROP View Stock_View"

//         const etfView = "CREATE VIEW ETF_View AS "
//             + "SELECT e.Company_Name, COUNT(*) AS ETF_Count "
//             + "FROM Listed_Equity e "
//             + "INNER JOIN ETF etf ON e.Ticker_Symbol = etf.Ticker_Symbol "
//             + "GROUP BY e.Company_Name"

//         const etfViewDrop = "DROP View ETF_View"

//         const cdrView = "CREATE VIEW CDR_View AS "
//             + "SELECT e.Company_Name, COUNT(*) AS CDR_Count "
//             + "FROM Listed_Equity e "
//             + "INNER JOIN CDR cdr ON e.Ticker_Symbol = cdr.Ticker_Symbol "
//             + "GROUP BY e.Company_Name"
        
//         const cdrViewDrop = "DROP View CDR_View"

//         const mfView = "CREATE VIEW Mutual_Fund_View AS "
//             + "SELECT e.Company_Name, COUNT(*) AS Mutual_Fund_Count "
//             + "FROM Listed_Equity e "
//             + "INNER JOIN Mutual_Funds mf ON e.Ticker_Symbol = mf.Ticker_Symbol "
//             + "GROUP BY e.Company_Name"

//         const mfViewDrop = "DROP View Mutual_Fund_View"

//         const combinedQuery = "SELECT e.Company_Name, etf.ETF_Count, cdr.CDR_Count, mf.Mutual_Fund_Count, st.Stock_Count "
//             + "FROM Listed_Equity e "
//             + "LEFT OUTER JOIN ETF_View etf ON e.Company_Name = etf.Company_Name "
//             + "LEFT OUTER JOIN CDR_View cdr ON e.Company_Name = cdr.Company_Name "
//             + "LEFT OUTER JOIN Mutual_Fund_View mf ON e.Company_Name = mf.Company_Name "
//             + "LEFT OUTER JOIN Stock_View st ON e.Company_Name = st.Company_Name "
//             //+ "GROUP BY e.Company_Name"

//         // Could use promises instead of this horrific non async
//         await connection.execute(etfViewDrop);
//         await connection.execute(etfView);
//         await connection.execute(StockViewDrop);
//         await connection.execute(stockView);
//         await connection.execute(cdrViewDrop);
//         await connection.execute(cdrView);
//         await connection.execute(mfViewDrop);
//         await connection.execute(mfView);
//         const result = await connection.execute(combinedQuery);
//         return result
//     }).catch(() => {
//         throw new error();
//     });
// }
// End: Nested aggregation with group by function

// Start: Aggregation with having function for transfers
async function havingTransfers(quantity) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`select t.Ticker_Symbol, count(*) from Transfers t, Managed_Investment_Account mic where t.Account_Number = mic.Account_Number and mic.Username = 'frodo' and t.Quantity > ${quantity} group by t.Ticker_Symbol having count(*) > 0`);
        return result.rows;
    }).catch(() => {
        return [];
    });
}
// End: Aggregation with having function for transfers



// appService functions for research page
async function fetchUniqueStockExchanges() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT DISTINCT Stock_Exchange FROM Listed_Equity ORDER BY Stock_Exchange`,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows.map(row => row.STOCK_EXCHANGE);
    });
}

async function fetchUniqueCompanies() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT DISTINCT Company_Name FROM Listed_Equity ORDER BY Company_Name`,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows.map(row => row.COMPANY_NAME);
    });
}

async function fetchUniqueEquityTypes() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `
            SELECT DISTINCT
                CASE
                    WHEN etf.Ticker_Symbol IS NOT NULL THEN 'ETF'
                    WHEN cdr.Ticker_Symbol IS NOT NULL THEN 'CDR'
                    WHEN mf.Ticker_Symbol IS NOT NULL THEN 'Mutual Fund'
                    WHEN st.Ticker_Symbol IS NOT NULL THEN 'Stock'
                    ELSE 'Unknown'
                END AS TYPE
            FROM Listed_Equity le
            LEFT JOIN ETF etf ON le.Ticker_Symbol = etf.Ticker_Symbol
            LEFT JOIN CDR cdr ON le.Ticker_Symbol = cdr.Ticker_Symbol
            LEFT JOIN Mutual_Funds mf ON le.Ticker_Symbol = mf.Ticker_Symbol
            LEFT JOIN Stock st ON le.Ticker_Symbol = st.Ticker_Symbol
            ORDER BY TYPE
            `,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows.map(row => row.TYPE);
    });
}

// Start: Selection function
async function selectAllListedEquities(stockExchanges = [], companies = [], equityTypes = []) {
    let sql = `
        SELECT
            le.Ticker_Symbol AS "Ticker_Symbol",
            le.Company_Name AS "Company_Name",
            le.Stock_Exchange AS "Stock_Exchange",
            CASE
                WHEN etf.Ticker_Symbol IS NOT NULL THEN 'ETF'
                WHEN cdr.Ticker_Symbol IS NOT NULL THEN 'CDR'
                WHEN mf.Ticker_Symbol IS NOT NULL THEN 'Mutual Fund'
                WHEN st.Ticker_Symbol IS NOT NULL THEN 'Stock'
                ELSE 'Unknown'
            END AS "Type",
            le.Price AS "Price",
            le.Issue_Date AS "Issue_Date",
            le.Currency AS "Currency",
            le.Quantity AS "Quantity"
        FROM
            Listed_Equity le
        LEFT JOIN ETF etf ON le.Ticker_Symbol = etf.Ticker_Symbol
        LEFT JOIN CDR cdr ON le.Ticker_Symbol = cdr.Ticker_Symbol
        LEFT JOIN Mutual_Funds mf ON le.Ticker_Symbol = mf.Ticker_Symbol
        LEFT JOIN Stock st ON le.Ticker_Symbol = st.Ticker_Symbol
    `;

    const whereClauses = [];
    const bindParams = {};

    function addInClause(column, values, paramPrefix) {
        if (values.length === 0) return '';
        const placeholders = values.map((_, idx) => `:${paramPrefix}${idx}`).join(', ');
        values.forEach((value, idx) => {
            bindParams[`${paramPrefix}${idx}`] = value;
        });
        return `${column} IN (${placeholders})`;
    }

    if (stockExchanges.length > 0) {
        const exchangeClause = addInClause('le.Stock_Exchange', stockExchanges, 'se');
        if (exchangeClause) whereClauses.push(exchangeClause);
    }

    if (companies.length > 0) {
        const companyClause = addInClause('le.Company_Name', companies, 'comp');
        if (companyClause) whereClauses.push(companyClause);
    }

    if (equityTypes.length > 0) {
        const equityTypeConditions = equityTypes.map((type, idx) => {
            const param = `eqType${idx}`;
            bindParams[param] = type.trim();
            return `
                CASE
                    WHEN etf.Ticker_Symbol IS NOT NULL THEN 'ETF'
                    WHEN cdr.Ticker_Symbol IS NOT NULL THEN 'CDR'
                    WHEN mf.Ticker_Symbol IS NOT NULL THEN 'Mutual Fund'
                    WHEN st.Ticker_Symbol IS NOT NULL THEN 'Stock'
                    ELSE 'Unknown'
                END = :${param}
            `;
        });
        const equityClause = equityTypeConditions.join(' OR ');
        whereClauses.push(`(${equityClause})`);
    }

    if (whereClauses.length > 0) {
        sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    sql += ' ORDER BY le.Ticker_Symbol';

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            sql,
            bindParams,
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows;
    });
}
// End: Selection function

async function fetchUniqueCountries() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT DISTINCT Country FROM Hosted_Company ORDER BY Country`,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows.map(row => row.COUNTRY);
    });
}

// Old company select using countries
//async function selectAllListedCompanies(countries = []) {
//    let sql = `
//        SELECT
//            Name AS "Company_Name",
//            Stock_Exchange_Name AS "Stock_Exchange",
//            Market_Cap AS "Market_Cap",
//            Country AS "Country"
//        FROM
//            Hosted_Company
//    `;
//
//    const whereClauses = [];
//    const bindParams = {};
//
//    if (countries.length > 0) {
//        const placeholders = countries.map((_, idx) => `:country${idx}`).join(', ');
//        countries.forEach((country, idx) => {
//            bindParams[`country${idx}`] = country;
//        });
//        whereClauses.push(`Country IN (${placeholders})`);
//    }
//
//    if (whereClauses.length > 0) {
//        sql += ' WHERE ' + whereClauses.join(' AND ');
//    }
//
//    sql += ' ORDER BY Name';
//
//    return await withOracleDB(async (connection) => {
//        const result = await connection.execute(
//            sql,
//            bindParams,
//            { outFormat: oracledb.OUT_FORMAT_OBJECT }
//        );
//        return result.rows;
//    });
//}

async function selectAllListedCompanies(countries = []) {
    let sql = `
        SELECT
            hc.Name AS "Company_Name",
            hc.Stock_Exchange_Name AS "Stock_Exchange",
            hc.Market_Cap AS "Market_Cap",
            hc.Country AS "Company_Country"
        FROM
            Hosted_Company hc
        JOIN
            Stock_Exchange_Country se
        ON
            hc.Country = se.Country
    `;

    const bindParams = {};

    if (countries.length > 0) {
        sql += ` WHERE hc.Country IN (${countries.map((_, idx) => `:country${idx}`).join(', ')})`;
        countries.forEach((country, idx) => {
            bindParams[`country${idx}`] = country;
        });
    }

    sql += ' ORDER BY hc.Name';

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            sql,
            bindParams,
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows;
    });
}

/* 
Watchlists would have been an additional functionality to build out for fun, but was unable to be done in time
*/
//async function addEquitiesToWatchlist(watchlistId, equities) {
//    let connection = await oracledb.getConnection(dbConfig);
//    const addedEquities = [];
//    const failedEquities = [];
//
//    for (const ticker of equities) {
//        const equityCheck = await connection.execute(
//            `SELECT 1 FROM Watched_Equity WHERE ID = :watchlistId AND Ticker_Symbol = :ticker`,
//            { watchlistId, ticker },
//            { outFormat: oracledb.OUT_FORMAT_OBJECT }
//        );
//
//        if (equityCheck.rows.length > 0) {
//            failedEquities.push(ticker);
//            continue;
//        }
//
//        await connection.execute(
//            `INSERT INTO Watched_Equity (ID, Ticker_Symbol, Start_Date) VALUES (:watchlistId, :ticker, SYSDATE)`,
//            { watchlistId, ticker },
//            { autoCommit: false }
//        );
//
//        addedEquities.push(ticker);
//    }
//
//    if (addedEquities.length > 0) {
//        await connection.execute(
//            `UPDATE Managed_Watchlist SET Num_Watched = Num_Watched + :count WHERE ID = :watchlistId`,
//            { count: addedEquities.length, watchlistId },
//            { autoCommit: false }
//        );
//    }
//
//    await connection.commit();
//    await connection.close();
//    return { success: true, addedEquities, failedEquities };
//}
//
//async function fetchUserWatchlists(username) {
//    return await withOracleDB(async (connection) => {
//        const result = await connection.execute(
//            `SELECT ID, Name, Num_Watched FROM Managed_Watchlist WHERE Username = :username`,
//            { username },
//            { outFormat: oracledb.OUT_FORMAT_OBJECT }
//        );
//        return result.rows.map(watchlist => ({
//            id: watchlist.ID,
//            name: watchlist.NAME,
//            numWatched: watchlist.NUM_WATCHED
//        }));
//    });
//}

// Start: Division function
async function divisionQuery() {
    return await withOracleDB(async (connection) => {
        const query = `
            SELECT c.Name AS Company_Name
            FROM Hosted_Company c
            WHERE NOT EXISTS (
                (SELECT 'Stock' AS Listing_Type FROM dual
                    UNION
                    SELECT 'CDR' AS Listing_Type FROM dual
                )
                MINUS(
                    SELECT 'Stock'
                    FROM Listed_Equity le
                    JOIN Stock s ON le.Ticker_Symbol = s.Ticker_Symbol
                    WHERE le.Company_Name = c.Name
                    UNION
                    SELECT 'CDR'
                    FROM Listed_Equity le
                    JOIN CDR cd ON le.Ticker_Symbol = cd.Ticker_Symbol
                    WHERE le.Company_Name = c.Name
                )
            )
        `;
        const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        return result.rows.map(row => row.COMPANY_NAME);
    });
}
// End: Division function
// Start: Nested aggregation with group by function
async function getEquityTypeCounts() { 
    return await withOracleDB(async (connection) => {
        const query = `
            SELECT
                sub.Company_Name,
                sub.Equity_Type,
                COUNT(*) AS Count
            FROM(
                SELECT
                    c.Name AS Company_Name,
                    CASE
                        WHEN etf.Ticker_Symbol IS NOT NULL THEN 'ETF'
                        WHEN cdr.Ticker_Symbol IS NOT NULL THEN 'CDR'
                        WHEN mf.Ticker_Symbol IS NOT NULL THEN 'Mutual Fund'
                        WHEN st.Ticker_Symbol IS NOT NULL THEN 'Stock'
                        ELSE 'Unknown'
                    END AS Equity_Type
                FROM
                    Hosted_Company c
                JOIN
                    Listed_Equity le ON c.Name = le.Company_Name
                LEFT JOIN
                    ETF etf ON le.Ticker_Symbol = etf.Ticker_Symbol
                LEFT JOIN
                    CDR cdr ON le.Ticker_Symbol = cdr.Ticker_Symbol
                LEFT JOIN
                    Mutual_Funds mf ON le.Ticker_Symbol = mf.Ticker_Symbol
                LEFT JOIN
                    Stock st ON le.Ticker_Symbol = st.Ticker_Symbol
            ) sub
            GROUP BY
                sub.Company_Name,
                sub.Equity_Type
            ORDER BY
                sub.Company_Name,
                sub.Equity_Type
        `;
        const result = await connection.execute(
            query,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows;
    });
}
// End: Nested aggregation with group by function

module.exports = {
    testOracleConnection,
    insertTransaction,
    fetchUserInfoTableFromDb,
    fetchUserInvestAccTableFromDb,
    fetchUserRetireAccTableFromDb,
    fetchUserBankTableFromDb,
    fetchUserInvestmentAccs,
    fetchEquities,
    fetchTransa,
    updateUserTable,
    updateName,
    updateSIN,
    updateAddress,
    updateDOB,
    updatePostalCode,
    deleteBankAccount,
    deleteWatchedEquity,
    getTransactionsByFields,
    //joinStockCompany,
    getGroupByFields,
    divisionQuery,
    // aggGroupByQuery,
    havingTransfers,
    selectAllListedEquities,
    fetchUniqueStockExchanges,
    fetchUniqueCompanies,
    fetchUniqueEquityTypes,
    fetchUniqueCountries,
    selectAllListedCompanies,
//    fetchUserWatchlists,
//    addEquitiesToWatchlist,
    getEquityTypeCounts
};