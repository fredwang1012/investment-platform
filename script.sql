set define off

DROP TABLE Users CASCADE CONSTRAINTS;
DROP TABLE Managed_Bank_Account CASCADE CONSTRAINTS;
DROP TABLE Managed_Investment_Account CASCADE CONSTRAINTS;
DROP TABLE Transfers_To CASCADE CONSTRAINTS;
DROP TABLE Completed_Transaction CASCADE CONSTRAINTS;
DROP TABLE Transfers CASCADE CONSTRAINTS;
DROP TABLE Holds CASCADE CONSTRAINTS;
DROP TABLE Listed_Equity CASCADE CONSTRAINTS;
DROP TABLE Stock_Exchange_Country CASCADE CONSTRAINTS;
DROP TABLE Stock_Exchange_Currency CASCADE CONSTRAINTS;
DROP TABLE Hosted_Company CASCADE CONSTRAINTS;
DROP TABLE Managed_Watchlist CASCADE CONSTRAINTS;
DROP TABLE Watched_Equity CASCADE CONSTRAINTS;
DROP TABLE Days_Watched_Equity CASCADE CONSTRAINTS;
DROP TABLE ETF CASCADE CONSTRAINTS;
DROP TABLE CDR CASCADE CONSTRAINTS;
DROP TABLE Mutual_Funds CASCADE CONSTRAINTS;
DROP TABLE Stock CASCADE CONSTRAINTS;

CREATE TABLE Users(
    Username VARCHAR(50) PRIMARY KEY,
    Name VARCHAR(50) NOT NULL,
    DOB DATE NOT NULL,
    SIN_SSN VARCHAR(50) NOT NULL UNIQUE,
    Address VARCHAR(50) NOT NULL,
    PostalCode VARCHAR(50) NOT NULL
);

CREATE TABLE Managed_Bank_Account(
    Institution_Number VARCHAR(50),
    Transit_Number VARCHAR(50),
    Bank_Account_Number VARCHAR(50),
    Username VARCHAR(50) NOT NULL,
    Type VARCHAR(50) NOT NULL,
    PRIMARY KEY (Institution_Number, Transit_Number, Bank_Account_Number),
    FOREIGN KEY (Username) REFERENCES Users(Username)
        ON DELETE CASCADE
);

CREATE TABLE Managed_Investment_Account(
    Account_Number VARCHAR(50) PRIMARY KEY,
    Type VARCHAR(50) NOT NULL,
    Total_Balance DECIMAL(15, 2) NOT NULL,
    Cash_Balance DECIMAL(15, 2) NOT NULL,
    Equity_Balance DECIMAL(15, 2) NOT NULL,
    Date_Opened DATE NOT NULL,
    Username VARCHAR(50),
    FOREIGN KEY (Username) 
        REFERENCES Users(Username) 
        ON DELETE CASCADE
);

CREATE TABLE Transfers_To(
    Investment_Account_Number VARCHAR(50),
    Institution_Number VARCHAR(50),
    Transit_Number VARCHAR(50),
    Bank_Account_Number VARCHAR(50),
    Amount DECIMAL(15, 2) NOT NULL,
    Currency VARCHAR(50) NOT NULL,
    Type VARCHAR(50) NOT NULL,
    Time TIMESTAMP,
    PRIMARY KEY (Investment_Account_Number, Institution_Number, Transit_Number, Bank_Account_Number, Time),
    FOREIGN KEY (Investment_Account_Number)
        REFERENCES Managed_Investment_Account(Account_Number)
        ON DELETE CASCADE,
    FOREIGN KEY (Institution_Number, Transit_Number, Bank_Account_Number)
        REFERENCES Managed_Bank_Account(Institution_Number, Transit_Number, Bank_Account_Number)
        ON DELETE CASCADE
);

CREATE TABLE Completed_Transaction(
    Transaction_Number VARCHAR(50),
    Account_Number VARCHAR(50),
    Amount DECIMAL(15, 2) NOT NULL,
    Time TIMESTAMP NOT NULL,
    PRIMARY KEY (Transaction_Number, Account_Number),
    FOREIGN KEY (Account_Number) REFERENCES Managed_Investment_Account(Account_Number)
        ON DELETE CASCADE
);

CREATE TABLE Stock_Exchange_Currency(
    Country VARCHAR(50) PRIMARY KEY,
    Currency VARCHAR(50) NOT NULL
);

CREATE TABLE Stock_Exchange_Country(
    Name VARCHAR(50) PRIMARY KEY,
    Country VARCHAR(50) NOT NULL,
    FOREIGN KEY (Country) REFERENCES Stock_Exchange_Currency(Country)
        ON DELETE CASCADE
);

	CREATE TABLE Hosted_Company(
    Name VARCHAR(50) PRIMARY KEY,
    Stock_Exchange_Name VARCHAR(50),
    Market_Cap INTEGER,
    Country VARCHAR(50) NOT NULL,
    FOREIGN KEY (Stock_Exchange_Name)
        REFERENCES Stock_Exchange_Country(Name)
        ON DELETE SET NULL
);

	CREATE TABLE Listed_Equity(
    Ticker_Symbol VARCHAR(50) PRIMARY KEY,
    Stock_Exchange VARCHAR(50),
    Company_Name VARCHAR(50) NOT NULL,
    Price DECIMAL(15, 2) NOT NULL,
    Issue_Date DATE NOT NULL,
    Currency VARCHAR(50) NOT NULL,
    Quantity INTEGER NOT NULL,
    FOREIGN KEY (Stock_Exchange)
        REFERENCES Stock_Exchange_Country(Name)
            ON DELETE SET NULL,
    FOREIGN KEY (Company_Name) REFERENCES Hosted_Company(Name)
        ON DELETE CASCADE
);

CREATE TABLE Transfers(
    Transaction_Number VARCHAR(50),
    Account_Number VARCHAR(50),
    Ticker_Symbol VARCHAR(50),
    Quantity INTEGER NOT NULL,
    Time TIMESTAMP NOT NULL,
    PRIMARY KEY (Transaction_Number, Account_Number, Ticker_Symbol),
    FOREIGN KEY (Transaction_Number, Account_Number)
        REFERENCES Completed_Transaction(Transaction_Number, Account_Number)
        ON DELETE CASCADE,
    FOREIGN KEY (Ticker_Symbol)
        REFERENCES Listed_Equity(Ticker_Symbol)
        ON DELETE SET NULL
);

CREATE TABLE Holds(
    Account_Number VARCHAR(50),
    Ticker_Symbol VARCHAR(50),
    Quantity INTEGER NOT NULL,
    PRIMARY KEY (Account_Number, Ticker_Symbol),
    FOREIGN KEY (Account_Number)
        REFERENCES Managed_Investment_Account(Account_Number)
        ON DELETE CASCADE,
    FOREIGN KEY (Ticker_Symbol)
        REFERENCES Listed_Equity(Ticker_Symbol)
        ON DELETE CASCADE
);

CREATE TABLE Managed_Watchlist(
    ID INTEGER PRIMARY KEY,
    Username VARCHAR(50),
    Name VARCHAR(100) NOT NULL,
    Num_Watched INTEGER NOT NULL,
    FOREIGN KEY (Username) REFERENCES Users(Username)
        ON DELETE CASCADE,
    CONSTRAINT unique_watchlist_name_per_user UNIQUE (Username, Name)
);


CREATE TABLE Days_Watched_Equity(
    Start_Date DATE PRIMARY KEY,
    Days_Watched INTEGER NOT NULL
);

	CREATE TABLE Watched_Equity(
    ID INTEGER,
    Ticker_Symbol VARCHAR(50),
    Start_Date DATE NOT NULL,
    PRIMARY KEY (ID, Ticker_Symbol),
    FOREIGN KEY (ID)
        REFERENCES Managed_Watchlist(ID)
        ON DELETE CASCADE,
    FOREIGN KEY (Ticker_Symbol)
        REFERENCES Listed_Equity(Ticker_Symbol)
            ON DELETE CASCADE,
    FOREIGN KEY (Start_Date)
        REFERENCES Days_Watched_Equity(Start_Date)
            ON DELETE CASCADE
);

	CREATE TABLE ETF (
    Ticker_Symbol VARCHAR(50) PRIMARY KEY,
    Index_Tracked VARCHAR(50) NOT NULL,
    FOREIGN KEY (Ticker_Symbol) REFERENCES Listed_Equity(Ticker_Symbol)
        ON DELETE CASCADE
);

	CREATE TABLE CDR(
    Ticker_Symbol VARCHAR(50) PRIMARY KEY,
    Stock_Tracked VARCHAR(50) NOT NULL,
    FOREIGN KEY (Ticker_Symbol) REFERENCES Listed_Equity(Ticker_Symbol)
        ON DELETE CASCADE
);

CREATE TABLE Mutual_Funds(
    Ticker_Symbol VARCHAR(50) PRIMARY KEY,
    Type VARCHAR(50) NOT NULL,
    FOREIGN KEY (Ticker_Symbol) REFERENCES Listed_Equity(Ticker_Symbol)
        ON DELETE CASCADE
);

CREATE TABLE Stock(
    Ticker_Symbol VARCHAR(50) PRIMARY KEY,
    Sector VARCHAR(50) NOT NULL,
    FOREIGN KEY (Ticker_Symbol) REFERENCES Listed_Equity(Ticker_Symbol)
        ON DELETE CASCADE
);



-- 1. User Table (Denormalized)
INSERT INTO Users (Username, Name, DOB, SIN_SSN, Address, PostalCode) VALUES
    ('aragorn', 'Aragorn Elessar', DATE '2931-03-01', 'SIN001', '123 Main Street, Toronto, ON', 'M1A 1A1');
INSERT INTO Users (Username, Name, DOB, SIN_SSN, Address, PostalCode) VALUES
    ('legolas', 'Legolas Greenleaf', DATE '2931-05-02', 'SIN002', '456 Queen Street, Vancouver, BC', 'V5K 0A1');
INSERT INTO Users (Username, Name, DOB, SIN_SSN, Address, PostalCode) VALUES
    ('gimli', 'Gimli Gloinsson', DATE '2879-07-12', 'SIN003', '789 King Street, Montreal, QC', 'H3B 2Y5');
INSERT INTO Users (Username, Name, DOB, SIN_SSN, Address, PostalCode) VALUES
    ('gandalf', 'Gandalf the Grey', DATE '2019-10-25', 'SIN004', '321 Bloor Street, Ottawa, ON', 'K1P 1A6');
INSERT INTO Users (Username, Name, DOB, SIN_SSN, Address, PostalCode) VALUES
    ('frodo', 'Frodo Baggins', DATE '2968-09-22', 'SIN005', '654 Yonge Street, Calgary, AB', 'T2P 1J9');

-- 2. Managed_Bank_Account
INSERT INTO Managed_Bank_Account (Institution_Number, Transit_Number, Bank_Account_Number, Username, Type) VALUES
    ('001', '12345', 'BANKACC001', 'aragorn', 'Checking');
INSERT INTO Managed_Bank_Account (Institution_Number, Transit_Number, Bank_Account_Number, Username, Type) VALUES
    ('003', '23456', 'BANKACC002', 'legolas', 'Savings');
INSERT INTO Managed_Bank_Account (Institution_Number, Transit_Number, Bank_Account_Number, Username, Type) VALUES
    ('004', '34567', 'BANKACC003', 'gimli', 'Checking');
INSERT INTO Managed_Bank_Account (Institution_Number, Transit_Number, Bank_Account_Number, Username, Type) VALUES
    ('002', '45678', 'BANKACC004', 'gandalf', 'Savings');
INSERT INTO Managed_Bank_Account (Institution_Number, Transit_Number, Bank_Account_Number, Username, Type) VALUES
    ('010', '56789', 'BANKACC005', 'frodo', 'Checking');
INSERT INTO Managed_Bank_Account (Institution_Number, Transit_Number, Bank_Account_Number, Username, Type) VALUES
    ('010', '56789', 'BANKACC006', 'frodo', 'Savings');

-- 3. Managed_Investment_Account (Denormalized)
INSERT INTO Managed_Investment_Account (Account_Number, Type, Total_Balance, Cash_Balance, Equity_Balance, Date_Opened, Username) VALUES
    ('ACC001', 'Investment', 60000.00, 10000.00, 50000.00, DATE '2020-01-15', 'aragorn');
INSERT INTO Managed_Investment_Account (Account_Number, Type, Total_Balance, Cash_Balance, Equity_Balance, Date_Opened, Username) VALUES
    ('ACC002', 'Retirement', 95000.00, 20000.00, 75000.00, DATE '2021-06-20', 'legolas');
INSERT INTO Managed_Investment_Account (Account_Number, Type, Total_Balance, Cash_Balance, Equity_Balance, Date_Opened, Username) VALUES
    ('ACC003', 'Investment', 75000.00, 15000.00, 60000.00, DATE '2019-03-10', 'gimli');
INSERT INTO Managed_Investment_Account (Account_Number, Type, Total_Balance, Cash_Balance, Equity_Balance, Date_Opened, Username) VALUES
    ('ACC004', 'Retirement', 105000.00, 25000.00, 80000.00, DATE '2022-11-05', 'gandalf');
INSERT INTO Managed_Investment_Account (Account_Number, Type, Total_Balance, Cash_Balance, Equity_Balance, Date_Opened, Username) VALUES
    ('ACC005', 'Investment', 233000.00, 18000.00, 215000.00, DATE '2023-07-25', 'frodo');
INSERT INTO Managed_Investment_Account (Account_Number, Type, Total_Balance, Cash_Balance, Equity_Balance, Date_Opened, Username) VALUES
    ('ACC006', 'Retirement', 83250.00, 13250.00, 70000.00, DATE '2023-07-26', 'frodo');
-- INSERT INTO Managed_Investment_Account (Account_Number, Type, Total_Balance, Cash_Balance, Equity_Balance, Date_Opened, Username) VALUES
--     ('ACC005', 'Investment', 233000.00, 999999999.00, 215000.00, DATE '2023-07-25', 'frodo');
-- INSERT INTO Managed_Investment_Account (Account_Number, Type, Total_Balance, Cash_Balance, Equity_Balance, Date_Opened, Username) VALUES
--     ('ACC006', 'Retirement', 83250.00, 999999999.00, 70000.00, DATE '2023-07-26', 'frodo');

-- 4. Transfers_To
INSERT INTO Transfers_To (Investment_Account_Number, Institution_Number, Transit_Number, Bank_Account_Number, Amount, Currency, Type, Time) VALUES
    ('ACC001', '001', '12345', 'BANKACC001', 5000.00, 'USD', 'Deposit', TIMESTAMP '2024-07-01 10:00:00');
INSERT INTO Transfers_To (Investment_Account_Number, Institution_Number, Transit_Number, Bank_Account_Number, Amount, Currency, Type, Time) VALUES
    ('ACC002', '003', '23456', 'BANKACC002', 3000.00, 'USD', 'Withdrawal', TIMESTAMP '2024-07-02 11:30:00');
INSERT INTO Transfers_To (Investment_Account_Number, Institution_Number, Transit_Number, Bank_Account_Number, Amount, Currency, Type, Time) VALUES
    ('ACC003', '004', '34567', 'BANKACC003', 4000.00, 'USD', 'Deposit', TIMESTAMP '2024-07-03 09:15:00');
INSERT INTO Transfers_To (Investment_Account_Number, Institution_Number, Transit_Number, Bank_Account_Number, Amount, Currency, Type, Time) VALUES
    ('ACC004', '002', '45678', 'BANKACC004', 2000.00, 'USD', 'Withdrawal', TIMESTAMP '2024-07-04 14:45:00');
INSERT INTO Transfers_To (Investment_Account_Number, Institution_Number, Transit_Number, Bank_Account_Number, Amount, Currency, Type, Time) VALUES
    ('ACC005', '010', '56789', 'BANKACC005', 3500.00, 'USD', 'Deposit', TIMESTAMP '2024-07-05 16:20:00');
INSERT INTO Transfers_To (Investment_Account_Number, Institution_Number, Transit_Number, Bank_Account_Number, Amount, Currency, Type, Time) VALUES
    ('ACC005', '010', '56789', 'BANKACC005', 6000.00, 'USD', 'Deposit', TIMESTAMP '2024-07-06 16:20:00');
INSERT INTO Transfers_To (Investment_Account_Number, Institution_Number, Transit_Number, Bank_Account_Number, Amount, Currency, Type, Time) VALUES
    ('ACC006', '010', '56789', 'BANKACC006', 5750.00, 'USD', 'Deposit', TIMESTAMP '2024-07-07 16:20:00');

-- 5. Completed_Transaction
INSERT INTO Completed_Transaction (Transaction_Number, Account_Number, Amount, Time) VALUES
    ('TXN001', 'ACC001', 5000.00, TIMESTAMP '2024-07-01 10:05:00');
INSERT INTO Completed_Transaction (Transaction_Number, Account_Number, Amount, Time) VALUES
    ('TXN001', 'ACC002', 3000.00, TIMESTAMP '2024-07-02 11:35:00');
INSERT INTO Completed_Transaction (Transaction_Number, Account_Number, Amount, Time) VALUES
    ('TXN001', 'ACC003', 4000.00, TIMESTAMP '2024-07-03 09:20:00');
INSERT INTO Completed_Transaction (Transaction_Number, Account_Number, Amount, Time) VALUES
    ('TXN001', 'ACC004', 2000.00, TIMESTAMP '2024-07-04 14:50:00');
INSERT INTO Completed_Transaction (Transaction_Number, Account_Number, Amount, Time) VALUES
    ('TXN001', 'ACC005', 3500.00, TIMESTAMP '2024-07-05 16:25:00');
INSERT INTO Completed_Transaction (Transaction_Number, Account_Number, Amount, Time) VALUES
    ('TXN002', 'ACC005', 5000.0, TIMESTAMP '2024-07-06 16:25:00');
INSERT INTO Completed_Transaction (Transaction_Number, Account_Number, Amount, Time) VALUES
    ('TXN003', 'ACC005', 3000.0, TIMESTAMP '2024-07-07 16:25:00');
INSERT INTO Completed_Transaction (Transaction_Number, Account_Number, Amount, Time) VALUES
    ('TXN004', 'ACC005', 4000.0, TIMESTAMP '2024-07-08 16:25:00');
INSERT INTO Completed_Transaction (Transaction_Number, Account_Number, Amount, Time) VALUES
    ('TXN001', 'ACC006', 2000.0, TIMESTAMP '2024-07-09 16:25:00');
INSERT INTO Completed_Transaction (Transaction_Number, Account_Number, Amount, Time) VALUES
    ('TXN002', 'ACC006', 3000.0, TIMESTAMP '2024-07-10 16:25:00');

-- 6. Stock_Exchange_Currency
INSERT INTO Stock_Exchange_Currency (Country, Currency) VALUES
    ('USA', 'USD');
INSERT INTO Stock_Exchange_Currency (Country, Currency) VALUES
    ('UK', 'GBP');
INSERT INTO Stock_Exchange_Currency (Country, Currency) VALUES
    ('Canada', 'CAD');
INSERT INTO Stock_Exchange_Currency (Country, Currency) VALUES
    ('Germany', 'EUR');
INSERT INTO Stock_Exchange_Currency (Country, Currency) VALUES
    ('Japan', 'JPY');

-- 7. Stock_Exchange_Country
INSERT INTO Stock_Exchange_Country (Name, Country) VALUES
    ('NYSE', 'USA');
INSERT INTO Stock_Exchange_Country (Name, Country) VALUES
    ('LSE', 'UK');
INSERT INTO Stock_Exchange_Country (Name, Country) VALUES
    ('TSX', 'Canada');
INSERT INTO Stock_Exchange_Country (Name, Country) VALUES
    ('FWB', 'Germany');
INSERT INTO Stock_Exchange_Country (Name, Country) VALUES
    ('TSE', 'Japan');
INSERT INTO Stock_Exchange_Country (Name, Country) VALUES
    ('NASDAQ', 'USA');

-- 8. Hosted_Company
-- Stocks
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('Apple Inc.', 'NASDAQ', 2600000000000, 'USA');
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('NVIDIA Corporation', 'NASDAQ', 1000000000000, 'USA');
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('Microsoft Corporation', 'NASDAQ', 2400000000000, 'USA');
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('Alphabet Inc.', 'NASDAQ', 1600000000000, 'USA');
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('Amazon.com Inc.', 'NASDAQ', 1400000000000, 'USA');
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('Tesla Inc.', 'NASDAQ', 900000000000, 'USA');
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('Royal Bank of Canada', 'TSX', 200000000000, 'Canada');
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('Toronto-Dominion Bank', 'TSX', 150000000000, 'Canada');
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('Enbridge Inc.', 'TSX', 80000000000, 'Canada');
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('Shopify Inc.', 'TSX', 50000000000, 'Canada');
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('Brookfield Asset Management', 'TSX', 60000000000, 'Canada');
    -- ETFs
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('SPDR S&P 500 ETF Trust', 'NYSE', 539000000000, 'USA');
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('iShares Core S&P 500 ETF', 'NYSE', 567000000000, 'USA');
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('Vanguard S&P 500 ETF', 'NYSE', 570000000000, 'USA');
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('Invesco QQQ Trust', 'NASDAQ', 200000000000, 'USA');
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('Vanguard Total Stock Market ETF', 'NYSE', 189000000000, 'USA');
    -- Mutual Funds
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('Vanguard 500 Index Fund', 'NASDAQ', 262000000000, 'USA');
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('Schwab S&P 500 Index Fund', 'NASDAQ', 327000000000, 'USA');
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('Fidelity Contrafund', 'NASDAQ', 559000000000, 'USA');
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('Vanguard Total International Stock Index Fund', 'NASDAQ', 94000000000, 'USA');
INSERT INTO Hosted_Company (Name, Stock_Exchange_Name, Market_Cap, Country) VALUES
    ('Vanguard Total Stock Market Index Fund', 'NASDAQ', 865000000000, 'USA');

-- 9. Listed_Equity
-- Stocks
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('AAPL', 'NASDAQ', 'Apple Inc.', 150.00, DATE '1980-12-12', 'USD', 1000000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('AAPLE', 'NASDAQ', 'Apple Inc.', 150.00, DATE '1980-12-12', 'USD', 1000000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('NVDA', 'NASDAQ', 'NVIDIA Corporation', 700.00, DATE '1999-01-22', 'USD', 500000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('MSFT', 'NASDAQ', 'Microsoft Corporation', 300.00, DATE '1986-03-13', 'USD', 800000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('GOOG', 'NASDAQ', 'Alphabet Inc.', 2800.00, DATE '2004-08-19', 'USD', 600000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('GOOGL', 'NASDAQ', 'Alphabet Inc.', 2800.00, DATE '2004-08-19', 'USD', 600000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('GOOGLE', 'NASDAQ', 'Alphabet Inc.', 2800.00, DATE '2004-08-19', 'USD', 600000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('TSLA', 'NASDAQ', 'Tesla Inc.', 900.00, DATE '2010-06-29', 'USD', 400000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('AMZN', 'NASDAQ', 'Amazon.com Inc.', 3300.00, DATE '1997-05-15', 'USD', 700000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('RY', 'TSX', 'Royal Bank of Canada', 120.00, DATE '1864-06-10', 'CAD', 2000000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('TD', 'TSX', 'Toronto-Dominion Bank', 85.00, DATE '1955-02-14', 'CAD', 1800000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('ENB', 'TSX', 'Enbridge Inc.', 50.00, DATE '1998-10-12', 'CAD', 1500000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('SHOP', 'TSX', 'Shopify Inc.', 60.00, DATE '2015-05-21', 'CAD', 1000000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('BAM', 'TSX', 'Brookfield Asset Management', 40.00, DATE '1997-09-09', 'CAD', 1300000);
-- ETFs
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('SPY', 'NYSE', 'SPDR S&P 500 ETF Trust', 450.00, DATE '1993-01-22', 'USD', 1000000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('IVV', 'NYSE', 'iShares Core S&P 500 ETF', 400.00, DATE '2000-05-15', 'USD', 800000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('VOO', 'NYSE', 'Vanguard S&P 500 ETF', 420.00, DATE '2010-09-07', 'USD', 900000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('QQQ', 'NASDAQ', 'Invesco QQQ Trust', 350.00, DATE '1999-03-10', 'USD', 750000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('VTI', 'NYSE', 'Vanguard Total Stock Market ETF', 220.00, DATE '2001-05-24', 'USD', 600000);
-- Mutual Funds
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('VFINX', 'NASDAQ', 'Vanguard 500 Index Fund', 250.00, DATE '1976-08-31', 'USD', 500000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('SWPPX', 'NASDAQ', 'Schwab S&P 500 Index Fund', 200.00, DATE '1997-11-05', 'USD', 450000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('FCNTX', 'NASDAQ', 'Fidelity Contrafund', 300.00, DATE '1967-12-31', 'USD', 400000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('VGTSX', 'NASDAQ', 'Vanguard Total International Stock Index Fund', 350.00, DATE '1996-06-01', 'USD', 550000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('VTSMX', 'NASDAQ', 'Vanguard Total Stock Market Index Fund', 280.00, DATE '1992-04-01', 'USD', 480000);
-- CDRs
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('AAPL.NE', 'NASDAQ', 'Apple Inc.', 150.00, DATE '2024-01-01', 'USD', 10000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('MSFT.NE', 'NASDAQ', 'Microsoft Corporation', 300.00, DATE '2024-01-01', 'USD', 10000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('AMZN.NE', 'NASDAQ', 'Amazon.com Inc.', 3300.00, DATE '2024-01-01', 'USD', 10000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('GOOGL.NE', 'NASDAQ', 'Alphabet Inc.', 2800.00, DATE '2024-01-01', 'USD', 10000);
INSERT INTO Listed_Equity (Ticker_Symbol, Stock_Exchange, Company_Name, Price, Issue_Date, Currency, Quantity) VALUES
    ('TSLA.NE', 'NASDAQ', 'Tesla Inc.', 900.00, DATE '2024-01-01', 'USD', 10000);

-- 10. Managed_Watchlist
INSERT INTO Managed_Watchlist (ID, Username, Name, Num_Watched) VALUES
    (1, 'aragorn', 'Aragorn''s Portfolio', 3);
INSERT INTO Managed_Watchlist (ID, Username, Name, Num_Watched) VALUES
    (2, 'legolas', 'Legolas'' Tech Watchlist', 2);
INSERT INTO Managed_Watchlist (ID, Username, Name, Num_Watched) VALUES
    (3, 'gimli', 'Gimli''s Growth Funds', 4);
INSERT INTO Managed_Watchlist (ID, Username, Name, Num_Watched) VALUES
    (4, 'gandalf', 'Gandalf''s Retirement Plan', 5);
INSERT INTO Managed_Watchlist (ID, Username, Name, Num_Watched) VALUES
    (5, 'frodo', 'Frodo''s Personal Watchlist', 3);


-- 11. Days_Watched_Equity
INSERT INTO Days_Watched_Equity (Start_Date, Days_Watched) VALUES
    (DATE '2024-01-01', 100);
INSERT INTO Days_Watched_Equity (Start_Date, Days_Watched) VALUES
    (DATE '2024-02-15', 80);
INSERT INTO Days_Watched_Equity (Start_Date, Days_Watched) VALUES
    (DATE '2024-03-10', 60);
INSERT INTO Days_Watched_Equity (Start_Date, Days_Watched) VALUES
    (DATE '2024-04-05', 40);
INSERT INTO Days_Watched_Equity (Start_Date, Days_Watched) VALUES
    (DATE '2024-05-20', 20);

-- 12. Watched_Equity
INSERT INTO Watched_Equity (ID, Ticker_Symbol, Start_Date) VALUES
    (1, 'AAPL', DATE '2024-01-01');
INSERT INTO Watched_Equity (ID, Ticker_Symbol, Start_Date) VALUES
    (1, 'MSFT', DATE '2024-02-15');
INSERT INTO Watched_Equity (ID, Ticker_Symbol, Start_Date) VALUES
    (1, 'GOOG', DATE '2024-03-10');
INSERT INTO Watched_Equity (ID, Ticker_Symbol, Start_Date) VALUES
    (2, 'NVDA', DATE '2024-04-05');
INSERT INTO Watched_Equity (ID, Ticker_Symbol, Start_Date) VALUES
    (2, 'TSLA', DATE '2024-05-20');
INSERT INTO Watched_Equity (ID, Ticker_Symbol, Start_Date) VALUES
    (3, 'AAPL', DATE '2024-01-01');
INSERT INTO Watched_Equity (ID, Ticker_Symbol, Start_Date) VALUES
    (3, 'MSFT', DATE '2024-02-15');
INSERT INTO Watched_Equity (ID, Ticker_Symbol, Start_Date) VALUES
    (3, 'NVDA', DATE '2024-03-10');
INSERT INTO Watched_Equity (ID, Ticker_Symbol, Start_Date) VALUES
    (4, 'GOOG', DATE '2024-04-05');
INSERT INTO Watched_Equity (ID, Ticker_Symbol, Start_Date) VALUES
    (4, 'TSLA', DATE '2024-05-20');
INSERT INTO Watched_Equity (ID, Ticker_Symbol, Start_Date) VALUES
    (5, 'AAPL', DATE '2024-01-01');
INSERT INTO Watched_Equity (ID, Ticker_Symbol, Start_Date) VALUES
    (5, 'TSLA', DATE '2024-01-01');
INSERT INTO Watched_Equity (ID, Ticker_Symbol, Start_Date) VALUES
    (5, 'GOOG', DATE '2024-01-01');

-- 13. ETF
INSERT INTO ETF (Ticker_Symbol, Index_Tracked) VALUES
    ('SPY', 'S&P 500');
INSERT INTO ETF (Ticker_Symbol, Index_Tracked) VALUES
    ('IVV', 'S&P 500');
INSERT INTO ETF (Ticker_Symbol, Index_Tracked) VALUES
    ('VOO', 'S&P 500');
INSERT INTO ETF (Ticker_Symbol, Index_Tracked) VALUES
    ('QQQ', 'NASDAQ-100');
INSERT INTO ETF (Ticker_Symbol, Index_Tracked) VALUES
    ('VTI', 'Total Stock Market');

-- 14. CDR
INSERT INTO CDR (Ticker_Symbol, Stock_Tracked) VALUES
    ('AAPL.NE', 'AAPL');
INSERT INTO CDR (Ticker_Symbol, Stock_Tracked) VALUES
    ('MSFT.NE', 'MSFT');
INSERT INTO CDR (Ticker_Symbol, Stock_Tracked) VALUES
    ('AMZN.NE', 'AMZN');
INSERT INTO CDR (Ticker_Symbol, Stock_Tracked) VALUES
    ('GOOGL.NE', 'GOOG');
INSERT INTO CDR (Ticker_Symbol, Stock_Tracked) VALUES
    ('TSLA.NE', 'TSLA');

-- 15. Mutual_Funds
INSERT INTO Mutual_Funds (Ticker_Symbol, Type) VALUES
    ('VFINX', 'Index Fund');
INSERT INTO Mutual_Funds (Ticker_Symbol, Type) VALUES
    ('SWPPX', 'Index Fund');
INSERT INTO Mutual_Funds (Ticker_Symbol, Type) VALUES
    ('FCNTX', 'Growth Fund');
INSERT INTO Mutual_Funds (Ticker_Symbol, Type) VALUES
    ('VGTSX', 'International Fund');
INSERT INTO Mutual_Funds (Ticker_Symbol, Type) VALUES
    ('VTSMX', 'Total Market Fund');

-- 16. Stock
INSERT INTO Stock (Ticker_Symbol, Sector) VALUES
    ('AAPL', 'Technology');
INSERT INTO Stock (Ticker_Symbol, Sector) VALUES
    ('AAPLE', 'Technology');
INSERT INTO Stock (Ticker_Symbol, Sector) VALUES
    ('AMZN', 'Technology');
INSERT INTO Stock (Ticker_Symbol, Sector) VALUES
    ('NVDA', 'Semiconductors');
INSERT INTO Stock (Ticker_Symbol, Sector) VALUES
    ('MSFT', 'Technology');
INSERT INTO Stock (Ticker_Symbol, Sector) VALUES
    ('GOOG', 'Technology');
INSERT INTO Stock (Ticker_Symbol, Sector) VALUES
    ('GOOGL', 'Technology');
INSERT INTO Stock (Ticker_Symbol, Sector) VALUES
    ('GOOGLE', 'Technology');
INSERT INTO Stock (Ticker_Symbol, Sector) VALUES
    ('TSLA', 'Automotive');
INSERT INTO Stock (Ticker_Symbol, Sector) VALUES
    ('RY', 'Financial Services');
INSERT INTO Stock (Ticker_Symbol, Sector) VALUES
    ('TD', 'Financial Services');
INSERT INTO Stock (Ticker_Symbol, Sector) VALUES
    ('ENB', 'Energy');
INSERT INTO Stock (Ticker_Symbol, Sector) VALUES
    ('SHOP', 'Technology');
INSERT INTO Stock (Ticker_Symbol, Sector) VALUES
    ('BAM', 'Financial Services');

-- 17. Transfers
INSERT INTO Transfers (Transaction_Number, Account_Number, Ticker_Symbol, Quantity, Time) VALUES
    ('TXN001', 'ACC001', 'AAPL', 50, TIMESTAMP '2024-07-01 10:10:00');
INSERT INTO Transfers (Transaction_Number, Account_Number, Ticker_Symbol, Quantity, Time) VALUES
    ('TXN001', 'ACC002', 'MSFT', 30, TIMESTAMP '2024-07-02 11:40:00');
INSERT INTO Transfers (Transaction_Number, Account_Number, Ticker_Symbol, Quantity, Time) VALUES
    ('TXN001', 'ACC003', 'NVDA', 20, TIMESTAMP '2024-07-03 09:25:00');
INSERT INTO Transfers (Transaction_Number, Account_Number, Ticker_Symbol, Quantity, Time) VALUES
    ('TXN001', 'ACC004', 'GOOG', 10, TIMESTAMP '2024-07-04 14:55:00');
INSERT INTO Transfers (Transaction_Number, Account_Number, Ticker_Symbol, Quantity, Time) VALUES
    ('TXN001', 'ACC005', 'TSLA', 15, TIMESTAMP '2024-07-05 16:30:00');
INSERT INTO Transfers (Transaction_Number, Account_Number, Ticker_Symbol, Quantity, Time) VALUES
    ('TXN002', 'ACC005', 'AAPL', 50, TIMESTAMP '2024-07-05 16:30:00');
INSERT INTO Transfers (Transaction_Number, Account_Number, Ticker_Symbol, Quantity, Time) VALUES
    ('TXN003', 'ACC005', 'MSFT', 30, TIMESTAMP '2024-07-06 16:30:00');
INSERT INTO Transfers (Transaction_Number, Account_Number, Ticker_Symbol, Quantity, Time) VALUES
    ('TXN004', 'ACC005', 'NVDA', 20, TIMESTAMP '2024-07-07 16:30:00');
INSERT INTO Transfers (Transaction_Number, Account_Number, Ticker_Symbol, Quantity, Time) VALUES
    ('TXN001', 'ACC006', 'GOOG', 10, TIMESTAMP '2024-07-08 16:30:00');
INSERT INTO Transfers (Transaction_Number, Account_Number, Ticker_Symbol, Quantity, Time) VALUES
    ('TXN002', 'ACC006', 'GOOG', 15, TIMESTAMP '2024-07-09 16:30:00');

-- 18. Holds
INSERT INTO Holds (Account_Number, Ticker_Symbol, Quantity) VALUES
    ('ACC001', 'AAPL', 100);
INSERT INTO Holds (Account_Number, Ticker_Symbol, Quantity) VALUES
    ('ACC002', 'MSFT', 150);
INSERT INTO Holds (Account_Number, Ticker_Symbol, Quantity) VALUES
    ('ACC003', 'NVDA', 200);
INSERT INTO Holds (Account_Number, Ticker_Symbol, Quantity) VALUES
    ('ACC004', 'GOOG', 120);
INSERT INTO Holds (Account_Number, Ticker_Symbol, Quantity) VALUES
    ('ACC005', 'TSLA', 180);
INSERT INTO Holds (Account_Number, Ticker_Symbol, Quantity) VALUES
    ('ACC005', 'AAPL', 60);
INSERT INTO Holds (Account_Number, Ticker_Symbol, Quantity) VALUES
    ('ACC005', 'MSFT', 100);
INSERT INTO Holds (Account_Number, Ticker_Symbol, Quantity) VALUES
    ('ACC005', 'NVDA', 20);
INSERT INTO Holds (Account_Number, Ticker_Symbol, Quantity) VALUES
    ('ACC006', 'GOOG', 25);
