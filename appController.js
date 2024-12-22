const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

/* 
 INITIALISING TABLES
*/
// Start: Fetch data to display user information table
router.get('/userInfoTable', async (req, res) => {
    const tableContent = await appService.fetchUserInfoTableFromDb();
    res.json({data: tableContent});
 });
// End: Fetch data to display user information table

 // Start: Fetch data to display user investment account table
router.get('/userInvestAccTable', async (req, res) => {
    const tableContent = await appService.fetchUserInvestAccTableFromDb();
    res.json({data: tableContent});
 });
// End: Fetch data to display user investment account table

 // Start: Fetch data to display user retirement account table
router.get('/userRetireAccTable', async (req, res) => {
    const tableContent = await appService.fetchUserRetireAccTableFromDb();
    res.json({data: tableContent});
 });
// End: Fetch data to display user retirement account table

 // Start: Fetch data to display user banking table
router.get('/userBankTable', async (req, res) => {
    const tableContent = await appService.fetchUserBankTableFromDb();
    res.json({data: tableContent});
 });
// End: Fetch data to display user banking table

router.get('/userAccs', async (req, res) => {
    const accs = await appService.fetchUserInvestmentAccs();
    res.json({success: true, data: accs});
})

router.get('/allEquities', async (req, res) => {
    const accs = await appService.fetchEquities();
    res.json({success: true, data: accs});
})

router.get('/allTransa', async (req, res) => {
    const accs = await appService.fetchTransa();
    res.json({success: true, data: accs});
})
/* 
 QUERIES
*/
// Start: Insert function for buying equity
router.post('/insert-transaction', async (req, res) => {
    const { account, ticker, quantity } = req.body;
    const insertResult = await appService.insertTransaction(account, ticker, quantity);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false});
    }
});
// End: Insert function for buying equity

// Start: Update functions for User table
// Needs field, oldValue, and newValue to post
const allowedUpdateFields = ['Name', 'SIN_SSN', 'Address', 'DOB', 'PostalCode'];
router.post('/update-user', async (req, res) => {
    try {
        const { field, oldValue, newValue } = req.body;

        // check if all params are present
        if (!field || oldValue === undefined || newValue === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required parameters: field, oldValue, newValue.' });
        }

        // check field
        if (!allowedUpdateFields.includes(field)) {
            return res.status(400).json({ success: false, message: `Invalid field: ${field}.` });
        }

        // update
        const updateResult = await appService.updateUserTable(field, oldValue, newValue);

        if (updateResult) {
            return res.json({ success: true, message: `${field} updated successfully.` });
        } else {
            return res.status(500).json({ success: false, message: `Failed to update ${field}.` });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
});
// End: Update functions for User table

// Start: Delete function for Managed_Bank_Account
router.delete('/delete-bank-account', async (req, res) => {
    try {
        const {Institution_Number, Transit_Number, Bank_Account_Number} = req.body;

        if (Institution_Number === undefined || Transit_Number === undefined || Bank_Account_Number === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required Primary Key' });
        }

        const deleteResult = await appService.deleteBankAccount(Institution_Number, Transit_Number, Bank_Account_Number);

        if (deleteResult) {
            return res.json({success: true, message: `bank account Inst: ${Institution_Number}, Trans: ${Transit_Number}, Acc: ${Bank_Account_Number} deleted successfully`})
        } else {
            return res.status(500).json({success: false, message: `bank account Inst: ${Institution_Number}, Trans: ${Transit_Number}, Acc: ${Bank_Account_Number} failed to delete`})
        }
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
});
// End: Delete function for Managed_Bank_Account

// Start: Delete function for Watched_Equity
//router.delete('/delete-watched-equity', async (req, res) => {
//    try {
//        const {ID, Ticker_Symbol} = req.body;
//
//        if (ID === undefined || Ticker_Symbol === undefined) {
//            return res.status(400).json({ success: false, message: 'Missing required Primary Key' });
//        }
//
//        const deleteResult = await appService.deleteWatchedEquity(ID, Ticker_Symbol);
//
//        if (deleteResult) {
//            return res.json({success: true, message: `Watched Equity ID: ${ID}, Ticker: ${Ticker_Symbol} deleted successfully`})
//        } else {
//            return res.status(404).json({success: false, message: `Watched Equity ID: ${ID}, Ticker: ${Ticker_Symbol} not found`})
//        }
//    } catch (error) {
//        console.error('Error updating user:', error);
//        return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
//    }
//});
//// End: Delete functions for Watched_Equity


// Start: Projection functions for Completed_Transactions
function parseFields(fieldsParam) {
    if (!fieldsParam) {
        return [];
    }

    return fieldsParam.split(',').map(field => field.trim()).filter(field => field.length > 0);
}

router.get('/completed_transaction', async (req, res) => {
    try {
        const fieldsParam = req.query.fields;
        const fields = parseFields(fieldsParam);

        const transactions = await appService.getTransactionsByFields(fields);

        return res.json({ success: true, data: transactions });
    } catch (error) {
        if (error.message.startsWith('Invalid field')) {
            return res.status(400).json({ success: false, message: error.message });
        }

        console.error('Error in GET /completed_transaction:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// End: Projection functions for Completed_Transactions

// Start: Join query with Hosted_Company and Stock_Exchange_Country
//router.get('/join', async (req, res) => {
//    const country = req.body;
//    const tableContent = await appService.joinStockCompany(country);
//    if (tableContent >= 0) {
//        res.json({
//            success: true,
//            join: tableContent
//        });
//    } else {
//        res.status(500).json({
//            success: false,
//            join: tableContent
//        });
//    }
//});
// End: Having function for Transfers

// Start: Groupby function for Transfers
router.get('/groupby', async (req, res) => {
    try {
        const groupFieldsParam = req.query.fields
        const groupFields = parseFields(groupFieldsParam);
        const groups = await appService.getGroupByFields(groupFields);

        return res.json({success: true, data: groups});
    } catch (err) {
        if (err.message.startsWith('Invalid group field')) {
            return res.status(400).json({success: false, message: err.message});
        }
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }

});
// End: Groupby function for Tranfers

// Start: aggregate group by function for Company and Stock Exchange
//router.get('/aggGroupBy', async (req, res) => {
//    try {
//
//        const companies = await appService.aggGroupByQuery();
//
//        // replacing "NULL" with 0.
//        for (let row of companies.rows) {
//            for (let key in row) {
//                if (row[key] === null) {
//                    row[key] = 0;
//                }
//            }
//        }
//
//        return res.json({success: true, data: companies});
//    } catch (err) {
//         return res.status(400).json({success: false, message: "Internal server error processing query"});
//    }
//
//});
// End: aggregate group by function for Company and Stock Exchange

// Start: Having function for Transfers
router.get('/having', async (req, res) => {
    const quantity  = req.query.quantity
    const tableContent = await appService.havingTransfers(quantity);
    res.json({success: true, data: tableContent});
});
// End: Having function for Transfers




// endpoints for research page

// Start: Selection of Listed_Equities
// assumes req comes in format similar to:
// body : {
//     "exchange": [
//         "NYSE",
//         "NASDAQ"
//     ],
//     "company": [
//         "Apple",
//         "Google"
//     ],
//     "ticker": []
// }

router.get('/unique-stock-exchanges', async (req, res) => {
    const exchanges = await appService.fetchUniqueStockExchanges();
    res.json({ success: true, data: exchanges });
});

router.get('/unique-companies', async (req, res) => {
    const companies = await appService.fetchUniqueCompanies();
    res.json({ success: true, data: companies });
});

router.get('/unique-equity-types', async (req, res) => {
    const equityTypes = await appService.fetchUniqueEquityTypes();
    res.json({ success: true, data: equityTypes });
});

router.get('/select-equities', async (req, res) => {
    const stockExchanges = req.query.stockExchanges
        ? req.query.stockExchanges.split(',').map(s => s.trim())
        : [];
    const companies = req.query.companies
        ? req.query.companies.split(',').map(s => s.trim())
        : [];
    const equityTypes = req.query.equityTypes
        ? req.query.equityTypes.split(',').map(s => s.trim())
        : [];

    const tableContent = await appService.selectAllListedEquities(stockExchanges, companies, equityTypes);

    res.json({
        success: true,
        data: tableContent,
        message: tableContent.length === 0 ? 'No equities found matching the selected filters.' : undefined
    });
});

//router.post('/add-to-watchlist', async (req, res) => {
//    const { watchlist, equities } = req.body;
//    const addResult = await appService.addEquitiesToWatchlist(watchlist, equities);
//    res.json({
//        success: true,
//        message: 'Equities added to watchlist successfully.',
//        addedEquities: addResult.addedEquities,
//        failedEquities: addResult.failedEquities
//    });
//});
//
//router.get('/getWatchlists', async (req, res) => {
//    const username = 'frodo';
//    const watchlists = await appService.fetchUserWatchlists(username);
//    res.json({ success: true, data: watchlists });
//});

router.get('/unique-countries', async (req, res) => {
    const countries = await appService.fetchUniqueCountries();
    res.json({ success: true, data: countries });
});

router.get('/select-companies', async (req, res) => {
    const countries = req.query.countries
        ? req.query.countries.split(',').map(s => s.trim())
        : [];
    const tableContent = await appService.selectAllListedCompanies(countries);
    res.json({
        success: true,
        data: tableContent,
        message: tableContent.length === 0 ? 'No companies found matching the selected filters.' : undefined
    });
});

router.get('/division', async (req, res) => {
    const companies = await appService.divisionQuery();
    res.json({ success: true, data: companies });
});

router.get('/equity-type-counts', async (req, res) => {
    const counts = await appService.getEquityTypeCounts();
    res.json({ success: true, data: counts });
});

module.exports = router;