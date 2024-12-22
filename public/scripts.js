/*
 * These functions below are for various webpage functionalities.
 */


// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    //loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    //statusElem.style.display = 'inline';

    response.text()
    .then((text) => {
        statusElem.textContent = text;
    })
    .catch((error) => {
        statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
    });
}

// Fetches data from the Users table and displays it.
async function fetchAndDisplayUserInfo() {
    const tableElement = document.getElementById('userInfo');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/userInfoTable', {
        method: 'GET'
    });

    const responseData = await response.json();
    const userInfoContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    const row = tableBody.insertRow();
    const name = row.insertCell();
    name.textContent = userInfoContent[0][1];
    const dob = row.insertCell();
    dob.textContent = userInfoContent[0][2];
    const sin = row.insertCell();
    sin.textContent = userInfoContent[0][3];
    const user = row.insertCell();
    user.textContent = userInfoContent[0][0];
    const add = row.insertCell();
    add.textContent = userInfoContent[0][4];
    const postal = row.insertCell();
    postal.textContent = userInfoContent[0][5];
}

// Fetches data about user's investment account and displays it.
async function fetchAndDisplayUserInvestAcc() {
    const tableElement = document.getElementById('userInvestAcc');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/userInvestAccTable', {
        method: 'GET'
    });

    const responseData = await response.json();
    const userInfoContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    const row = tableBody.insertRow();
    const total = row.insertCell();
    total.textContent = "CA$" + userInfoContent[0][0];
    const cash = row.insertCell();
    cash.textContent = "CA$" + userInfoContent[0][1];
    const equity = row.insertCell();
    equity.textContent = "CA$" + userInfoContent[0][2];
    const open = row.insertCell();
    open.textContent = userInfoContent[0][3];
}

// Fetches data about user's investment account and displays it.
async function fetchAndDisplayUserRetireAcc() {
    const tableElement = document.getElementById('userRetireAcc');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/userRetireAccTable', {
        method: 'GET'
    });

    const responseData = await response.json();
    const userInfoContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    const row = tableBody.insertRow();
    const total = row.insertCell();
    total.textContent = "CA$" + userInfoContent[0][0];
    const cash = row.insertCell();
    cash.textContent = "CA$" + userInfoContent[0][1];
    const equity = row.insertCell();
    equity.textContent = "CA$" + userInfoContent[0][2];
    const open = row.insertCell();
    open.textContent = userInfoContent[0][3];
}

// Fetches data about user's banking information and displays it.
async function fetchAndDisplayUserBanking() {
    const tableElement = document.getElementById('userBank');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/userBankTable', {
        method: 'GET'
    });

    const responseData = await response.json();
    const userInfoContent = responseData.data;
    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    const row1 = tableBody.insertRow();
    const type1 = row1.insertCell();
    type1.textContent = userInfoContent[0][0];
    const num1 = row1.insertCell();
    num1.textContent = userInfoContent[0][1];
    const inst1 = row1.insertCell();
    inst1.textContent = userInfoContent[0][2];
    const trans1 = row1.insertCell();
    trans1.textContent = userInfoContent[0][3];
    const row2 = tableBody.insertRow();
    const type2 = row2.insertCell();
    type2.textContent = userInfoContent[1][0];
    const num2 = row2.insertCell();
    num2.textContent = userInfoContent[1][1];
    const inst2 = row2.insertCell();
    inst2.textContent = userInfoContent[1][2];
    const trans2 = row2.insertCell();
    trans2.textContent = userInfoContent[1][3];
}


// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    fetchAndDisplayUserInfo();
    fetchAndDisplayUserInvestAcc();
    fetchAndDisplayUserRetireAcc();
    fetchAndDisplayUserBanking();
}


// Updates user's name
async function updateUserTable1(event) {
    event.preventDefault();

    const oldFieldContents = document.getElementById('field1').value;
    const oldValueContents = document.getElementById('oldValue1').value;
    const newValueContents = document.getElementById('newValue1').value;

    const response = await fetch('/update-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            field: oldFieldContents,
            oldValue: oldValueContents,
            newValue: newValueContents
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateUserResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Name updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating!";
    }
}

// Updates user's DOB
async function updateUserTable2(event) {
    event.preventDefault();

    const oldFieldContents = document.getElementById('field2').value;
    const oldValueContents = document.getElementById('oldValue2').value;
    const newValueContents = document.getElementById('newValue2').value;

    const response = await fetch('/update-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            field: oldFieldContents,
            oldValue: oldValueContents,
            newValue: newValueContents
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateUserResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Date of birth updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating!";
    }
}

// Updates user's SIN/SSN
async function updateUserTable3(event) {
    event.preventDefault();

    const oldFieldContents = document.getElementById('field3').value;
    const oldValueContents = document.getElementById('oldValue3').value;
    const newValueContents = document.getElementById('newValue3').value;

    const response = await fetch('/update-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            field: oldFieldContents,
            oldValue: oldValueContents,
            newValue: newValueContents
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateUserResultMsg');

    if (responseData.success) {
        messageElement.textContent = "SIN/SSN updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating!";
    }
}

// Updates user's address
async function updateUserTable4(event) {
    event.preventDefault();

    const oldFieldContents = document.getElementById('field4').value;
    const oldValueContents = document.getElementById('oldValue4').value;
    const newValueContents = document.getElementById('newValue4').value;

    const response = await fetch('/update-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            field: oldFieldContents,
            oldValue: oldValueContents,
            newValue: newValueContents
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateUserResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Address updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating!";
    }
}

// Updates user's postal code
async function updateUserTable5(event) {
    event.preventDefault();

    const oldFieldContents = document.getElementById('field5').value;
    const oldValueContents = document.getElementById('oldValue5').value;
    const newValueContents = document.getElementById('newValue5').value;

    const response = await fetch('/update-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            field: oldFieldContents,
            oldValue: oldValueContents,
            newValue: newValueContents
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateUserResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Postal code updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating!";
    }
}

// Deletes user banking info.
async function deleteUserBank(event) {
    event.preventDefault();

    const oldInst = document.getElementById('inst').value;
    const oldTrans = document.getElementById('trans').value;
    const oldAcc = document.getElementById('acc').value;

    const response = await fetch('/delete-bank-account', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Institution_Number: oldInst,
            Transit_Number: oldTrans,
            Bank_Account_Number: oldAcc
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('deleteBankResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Banking information deleted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error deleting!";
    }
}

async function populateDropdown() {
    const accountOptions = document.getElementById("Account");
    const equityOptions = document.getElementById("Equity");

    accountOptions.innerHTML = "<option disabled selected value=''>Account</option>";
    equityOptions.innerHTML = "<option disabled selected value=''>Equity</option>";

    try {
        const responseAccount = await fetch(`/userAccs`);
        const responseEquity = await fetch(`/allEquities`);
        const dataAccount = await responseAccount.json();
        const dataEquity = await responseEquity.json();
    
        if (!dataAccount.success) {
          alert(dataAccount.message || "Failed to fetch Account data.");
          return;
        }

        if (!dataEquity.success) {
            alert(dataAccount.message || "Failed to fetch Equity data.");
            return;
          }

        dataAccount.data.forEach(accountArr => {
            const account = accountArr[0];
            const option = document.createElement("option");
            option.value = account
            option.textContent = account;
            accountOptions.appendChild(option);
        });

        dataEquity.data.forEach(accountArr => {
            const account = accountArr[0];
            const option = document.createElement("option");
            option.value = account
            option.textContent = account;
            equityOptions.appendChild(option);
        });

    } catch (error) {
        console.error("Error fetching Account data:", error);
        alert("An error occurred while loading accounts");
    }
}

async function handleTradingSubmit(event) {
    event.preventDefault();

    const dataSubmit = {
        account: document.getElementById("Account").value,
        ticker: document.getElementById("Equity").value,
        quantity: document.getElementById("numberInput").value
    };

    try {
        const response = await fetch(`/insert-transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(dataSubmit)
        });
        const data = await response.json();
    
        if (!data.success) {
          alert(data.message || "Failed to complete transaction.");
          return;
        }

        await populateTransactionHistory()
        alert("Thank you for your purchase!")
      } catch (error) {
        console.error("Error posting data:", error);
        alert("An error occurred while purchasing");
    }
}

async function populateTransactionHistory() {
    const tableBody = document.getElementById("ProjectionTable").querySelector("tbody");
    tableBody.innerHTML = "";

    try {
        const response = await fetch(`/allTransa`);
        const data = await response.json();
    
        if (!data.success) {
          alert(data.message || "Failed to fetch transaction data.");
          return;
        }
    
        const transactions = data.data;
    
        if (transactions.length > 0) {
          transactions.forEach(transaction => {
            const tr = document.createElement("tr");
            transaction.forEach(data => {
                const td = document.createElement("td");
                td.textContent = data;
                tr.appendChild(td);
            })
            tableBody.appendChild(tr);
          });
        } else {
          const tr = document.createElement("tr");
          const td = document.createElement("td");
          td.textContent = "No transactions found.";
          td.setAttribute("colspan", 3);
          tr.appendChild(td);
          tableBody.appendChild(tr);
        }
      } catch (error) {
        console.error("Error fetching transaction data:", error);
        alert("An error occurred while fetching transaction data.");
    }
}

async function handleTradingProjection(event) {
    event.preventDefault();

    const checkboxes = document.querySelectorAll(`input[type="checkbox"]`);
    // Filter checked checkboxes and map to their values
    const projectionType = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    const tableBody = document.getElementById("ProjectionTable").querySelector("tbody");
    tableBody.innerHTML = "";

    if (projectionType.length === 0) {
        await populateTransactionHistory();
        return
    }

    if (!projectionType) {
        alert("Please select a projection type.");
        return;
    }

    try {
        const response = await fetch(`/completed_transaction?fields=${projectionType}`);
        const data = await response.json();
    
        if (!data.success) {
          alert(data.message || "Failed to fetch transaction data.");
          return;
        }
    
        const transactions = data.data;
    
        if (transactions.length > 0) {
          transactions.forEach(transaction => {
            const tr = document.createElement("tr");
            transaction.forEach(data => {
                const td = document.createElement("td");
                td.textContent = data;
                tr.appendChild(td);
            })
            tableBody.appendChild(tr);
          });
        } else {
          const tr = document.createElement("tr");
          const td = document.createElement("td");
          td.textContent = "No transactions found.";
          td.setAttribute("colspan", 3);
          tr.appendChild(td);
          tableBody.appendChild(tr);
        }
      } catch (error) {
        console.error("Error fetching transaction data:", error);
        alert("An error occurred while fetching transaction data");
    }
}


async function handleGroupBy(event) {
    event.preventDefault();

    const projectionType = document.getElementById("TransactionType").value;
    if (!projectionType) {
        alert("Please select a projection type.");
        return;
    }

    try {
        const response = await fetch(`/groupby?fields=${projectionType}`);
        const data = await response.json();
        
    
        if (!data.success) {
          alert(data.message || "Failed to fetch transaction data.");
          return;
        }
        const table = document.getElementById("GroupTable");
        if (table.style.display === "none" || table.style.display === "") {
            table.style.display = "table"; 
        } else {
            table.style.display = "none"; 
        }
        const tableBody = document.getElementById("GroupTable").querySelector("tbody");
        tableBody.innerHTML = "";
    
        const transactions = data.data;
    
        if (transactions.length > 0) {
          transactions.forEach(transaction => {
            const tr = document.createElement("tr");
            const tdQuery = document.createElement("td");
            const tdCount = document.createElement("td");
            tdQuery.textContent = transaction[0];
            tdCount.textContent = transaction[1];
            tr.appendChild(tdQuery);
            tr.appendChild(tdCount);
            tableBody.appendChild(tr);
          });
        } else {
          const tr = document.createElement("tr");
          const td = document.createElement("td");
          td.textContent = "No transactions found.";
          td.setAttribute("colspan", 2);
          tr.appendChild(td);
          tableBody.appendChild(tr);
        }
      } catch (error) {
        console.error("Error fetching transaction data:", error);
        alert("An error occurred while fetching transaction data. Check the console for details.");
    }
}

async function handleHaving(event) {
    event.preventDefault();

    let quantity = document.getElementById("GreaterThanInput").value;
    if (quantity === "") {
        quantity = "0";
    }
    
    try {
        const response = await fetch(`/having?quantity=${quantity}`);
        const data = await response.json();
    
        if (!data.success) {
            alert(data.message || "Failed to fetch transaction data.");
            return;
          }
      
        const transactions = data.data;

        const table = document.getElementById("HavingTable");
        if (table.style.display === "none" || table.style.display === "") {
            table.style.display = "table"; 
        } else {
            table.style.display = "none"; 
        }

        const tableBody = document.getElementById("HavingTable").querySelector("tbody");
        tableBody.innerHTML = "";
      
        if (transactions.length > 0) {
            transactions.forEach(transaction => {
              const tr = document.createElement("tr");
              transaction.forEach(data => {
                  const td = document.createElement("td");
                  td.textContent = data;
                  tr.appendChild(td);
              })
              tableBody.appendChild(tr);
            });
        } else {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.textContent = "No transactions found.";
            td.setAttribute("colspan", 3);
            tr.appendChild(td);
            tableBody.appendChild(tr);
            }
        } catch (error) {
        console.error("Error fetching transaction data:", error);
        alert("An error occurred while fetching transaction data");
    }
}



/*
* Research Page functions
*/

// Show equities in table
async function fetchAndDisplayEquities(queryString = '') {
    const tableElement = document.getElementById('stockInfo');
    const tableBody = tableElement.querySelector('tbody');
    const loadingElem = document.getElementById('loading');

    loadingElem.style.display = 'block';

    let url = '/select-equities';
    if (queryString) {
        url += `?${queryString}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    populateEquityTable(tableBody, data.data);

    loadingElem.style.display = 'none';
}

// Populate the equity table with data
function populateEquityTable(tbody, data) {
    tbody.innerHTML = '';

    data.forEach(equity => {
        const row = tbody.insertRow();

        const selectCell = row.insertCell();
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = equity.Ticker_Symbol;
        checkbox.classList.add('select-equity');
        selectCell.appendChild(checkbox);

        const cellTicker = row.insertCell();
        cellTicker.textContent = equity.Ticker_Symbol || 'N/A';

        const cellCompany = row.insertCell();
        cellCompany.textContent = equity.Company_Name || 'N/A';

        const cellExchange = row.insertCell();
        cellExchange.textContent = equity.Stock_Exchange || 'N/A';

        const cellType = row.insertCell();
        cellType.textContent = equity.Type || 'N/A';

        const cellPrice = row.insertCell();
        cellPrice.textContent = equity.Price !== undefined ? `$${parseFloat(equity.Price).toFixed(2)}` : 'N/A';

        const cellIssueDate = row.insertCell();
        cellIssueDate.textContent = equity.Issue_Date ? new Date(equity.Issue_Date).toLocaleDateString() : 'N/A';

        const cellCurrency = row.insertCell();
        cellCurrency.textContent = equity.Currency || 'N/A';

        const cellQuantity = row.insertCell();
        cellQuantity.textContent = equity.Quantity !== undefined ? equity.Quantity : 'N/A';
    });
}

// Populate filter dropdowns
async function populateFilterDropdowns() {
    const loadingElem = document.getElementById('dropdownLoading');
    loadingElem.style.display = 'block';

    await populateStockExchangeDropdown();
    await populateCompanyDropdown();
    await populateEquityTypeDropdown();

    loadingElem.style.display = 'none';
}

// Fetch and populate Stock Exchange dropdown
async function populateStockExchangeDropdown() {
    const stockExchangeSelect = document.getElementById('stockExchangeSelect');

    const response = await fetch('/unique-stock-exchanges', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    data.data.forEach(exchange => {
        const option = document.createElement('option');
        option.value = exchange;
        option.textContent = exchange;
        stockExchangeSelect.appendChild(option);
    });
}

// Fetch and populate Company dropdown
async function populateCompanyDropdown() {
    const companySelect = document.getElementById('companySelect');

    const response = await fetch('/unique-companies', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    data.data.forEach(company => {
        const option = document.createElement('option');
        option.value = company;
        option.textContent = company;
        companySelect.appendChild(option);
    });
}

async function populateEquityTypeDropdown() {
    const equityTypeSelect = document.getElementById('equityTypeSelect');

    const response = await fetch('/unique-equity-types', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    data.data.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        equityTypeSelect.appendChild(option);
    });
}

// Apply filters
async function applyFilters() {
    const stockExchangeSelect = document.getElementById('stockExchangeSelect');
    const companySelect = document.getElementById('companySelect');
    const equityTypeSelect = document.getElementById('equityTypeSelect');

    const selectedStockExchanges = Array.from(stockExchangeSelect.selectedOptions).map(option => option.value);
    const selectedCompanies = Array.from(companySelect.selectedOptions).map(option => option.value);
    const selectedEquityTypes = Array.from(equityTypeSelect.selectedOptions).map(option => option.value);

    let queryString = '';
    if (selectedStockExchanges.length > 0) {
        queryString += `stockExchanges=${encodeURIComponent(selectedStockExchanges.join(','))}&`;
    }
    if (selectedCompanies.length > 0) {
        queryString += `companies=${encodeURIComponent(selectedCompanies.join(','))}&`;
    }
    if (selectedEquityTypes.length > 0) {
        queryString += `equityTypes=${encodeURIComponent(selectedEquityTypes.join(','))}&`;
    }

    if (queryString.endsWith('&')) {
        queryString = queryString.slice(0, -1);
    }

    fetchAndDisplayEquities(queryString);
}

// Reset filters
function resetFilters() {
    const stockExchangeSelect = document.getElementById('stockExchangeSelect');
    const companySelect = document.getElementById('companySelect');
    const equityTypeSelect = document.getElementById('equityTypeSelect');

    Array.from(stockExchangeSelect.options).forEach(option => option.selected = false);
    Array.from(companySelect.options).forEach(option => option.selected = false);
    Array.from(equityTypeSelect.options).forEach(option => option.selected = false);

    fetchAndDisplayEquities();
}

// Handle adding selected equities to a watchlist
//function handleAddToWatchlist() {
//    const addToWatchlistButton = document.getElementById('addToWatchlistButton');
//    const watchlistSelect = document.getElementById('watchlistSelect');
//
//    addToWatchlistButton.addEventListener('click', function() {
//        const selectedEquities = Array.from(document.querySelectorAll('.select-equity:checked')).map(cb => cb.value);
//        const selectedWatchlist = watchlistSelect.value;
//
//        fetch('/add-to-watchlist', {
//            method: 'POST',
//            headers: {
//                'Content-Type': 'application/json'
//            },
//            body: JSON.stringify({
//                watchlist: selectedWatchlist,
//                equities: selectedEquities
//            })
//        })
//        .then(response => response.json())
//        .then(data => {
//            fetchAndDisplayEquities();
//            document.querySelectorAll('.select-equity').forEach(cb => cb.checked = false);
//        });
//    });
//}
//
//function fetchAndPopulateWatchlists() {
//    fetch('/getWatchlists')
//        .then(response => response.json())
//        .then(data => {
//            const watchlistSelect = document.getElementById('watchlistSelect');
//            watchlistSelect.innerHTML = '';
//
//            if (data.data.length === 0) {
//                const placeholderOption = document.createElement('option');
//                placeholderOption.value = '';
//                placeholderOption.textContent = 'No Watchlists Available';
//                watchlistSelect.appendChild(placeholderOption);
//            } else {
//                data.data.forEach(watchlist => {
//                    const option = document.createElement('option');
//                    option.value = watchlist.id;
//                    option.textContent = watchlist.name;
//                    watchlistSelect.appendChild(option);
//                });
//            }
//        });
//}

// Fetch and display companies
async function fetchAndDisplayCompanies(queryString = '') {
    const tableElement = document.getElementById('companyInfo');
    const tableBody = tableElement.querySelector('tbody');
    const loadingElem = document.getElementById('loading');

    loadingElem.style.display = 'block';

    let url = '/select-companies';
    if (queryString) {
        url += `?${queryString}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    populateCompanyTable(tableBody, data.data);

    loadingElem.style.display = 'none';
}

// Populate the company table with data
function populateCompanyTable(tbody, data) {
    tbody.innerHTML = '';

    data.forEach(company => {
        const row = tbody.insertRow();

        const cellCompany = row.insertCell();
        cellCompany.textContent = company.Company_Name || 'N/A';

        const cellExchange = row.insertCell();
        cellExchange.textContent = company.Stock_Exchange || 'N/A';

        const cellMarketCap = row.insertCell();
        cellMarketCap.textContent = company.Market_Cap !== undefined ? `$${parseFloat(company.Market_Cap).toLocaleString()}` : 'N/A';

        const cellCountry = row.insertCell();
        cellCountry.textContent = company.Company_Country || 'N/A';
    });
}

// Populate company filter dropdowns
async function populateCompanyFilterDropdowns() {
    const loadingElem = document.getElementById('dropdownLoading');
    loadingElem.style.display = 'block';

    await populateCountryDropdown();

    loadingElem.style.display = 'none';
}

// Fetch and populate Country dropdown
async function populateCountryDropdown() {
    const countrySelect = document.getElementById('countrySelect');

    const response = await fetch('/unique-countries', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    data.data.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
}

// Apply company filters
async function applyCompanyFilters() {
    const countrySelect = document.getElementById('countrySelect');

    const selectedCountries = Array.from(countrySelect.selectedOptions).map(option => option.value);

    let queryString = '';
    if (selectedCountries.length > 0) {
        queryString += `countries=${encodeURIComponent(selectedCountries.join(','))}&`;
    }

    if (queryString.endsWith('&')) {
        queryString = queryString.slice(0, -1);
    }

    fetchAndDisplayCompanies(queryString);
}

// Reset company filters
function resetCompanyFilters() {
    const countrySelect = document.getElementById('countrySelect');

    Array.from(countrySelect.options).forEach(option => option.selected = false);

    fetchAndDisplayCompanies();
}

function setupDivisionButton() {
    const divisionButton = document.getElementById('divisionButton');
    const divisionTableBody = document.getElementById('divisionTable').getElementsByTagName('tbody')[0];
    const divisionTable = document.getElementById('divisionTable');

    divisionButton.addEventListener('click', async () => {
        if (divisionTable.style.display === 'table') {
            divisionTable.style.display = 'none';
            divisionButton.textContent = 'Show Companies with Both Stock and CDR';
            return;
        }

        divisionButton.disabled = true;
        divisionButton.textContent = 'Loading...';
        divisionTableBody.innerHTML = '';

        const response = await fetch('/division', { method: 'GET' });
        const data = await response.json();

        const companies = data.data;

        if (companies.length === 0) {
            const row = divisionTableBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 1;
            cell.textContent = 'No companies found offering both Stock and CDR.';
        } else {
            companies.forEach(company => {
                const row = divisionTableBody.insertRow();
                const cell1 = row.insertCell();
                cell1.textContent = company || 'N/A';
            });
        }

        divisionTable.style.display = 'table';
        divisionButton.textContent = 'Hide Companies with Both Stock and CDR';

        divisionButton.disabled = false;
    });
}

// Handle equity type counts
async function handleEquityTypeCounts() {
    const response = await fetch('/equity-type-counts', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    populateEquityTypeCountsTable(data.data);
}

// Populate the Equity Type Counts table
function populateEquityTypeCountsTable(data) {
    const tableBody = document.getElementById('equityTypeCountsTable').querySelector('tbody');
    tableBody.innerHTML = '';

    data.forEach(record => {
        const row = tableBody.insertRow();

        const companyCell = row.insertCell();
        companyCell.textContent = record.COMPANY_NAME || 'N/A';

        const typeCell = row.insertCell();
        typeCell.textContent = record.EQUITY_TYPE || 'N/A';

        const countCell = row.insertCell();
        countCell.textContent = record.COUNT !== undefined ? record.COUNT : 'N/A';
    });
}

function setupEquityTypeCountsButton() {
    const equityTypeCountsButton = document.getElementById('countEquityTypesButton');
    const equityTypeCountsTable = document.getElementById('equityTypeCountsTable');
    const equityTypeCountsTableBody = equityTypeCountsTable.querySelector('tbody');

    equityTypeCountsButton.addEventListener('click', async () => {
        const isTableVisible = equityTypeCountsTable.style.display === 'table';

        if (isTableVisible) {
            equityTypeCountsTable.style.display = 'none';
            equityTypeCountsButton.textContent = 'Show Equity Type Counts';
            return;
        }

        equityTypeCountsButton.disabled = true;
        equityTypeCountsButton.textContent = 'Loading...';

        equityTypeCountsTableBody.innerHTML = '';

        const response = await fetch('/equity-type-counts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        populateEquityTypeCountsTable(data.data);
        equityTypeCountsTable.style.display = 'table';
        equityTypeCountsButton.textContent = 'Hide Equity Type Counts';

        equityTypeCountsButton.disabled = false;
    });
}


// Initialize functions
function initialize() {
    checkDbConnection();
//    attachAccountPageEventListeners();
    //fetchAndPopulateWatchlists();
    const url = new URL(window.location.href);
    if (url.pathname.includes("research")) {
        attachResearchPageEventListeners();
    } else if (url.pathname.includes("index")) {
        attachAccountPageEventListeners();
    }
    //handleAddToWatchlist();

}

// Attach Research Page Event Listeners
function attachResearchPageEventListeners() {

    populateFilterDropdowns();
    fetchAndDisplayEquities();
    populateCompanyFilterDropdowns();
    fetchAndDisplayCompanies();
    setupDivisionButton();
    setupEquityTypeCountsButton();


    // Equity Search
    const equityFilterButton = document.getElementById("filterButton");
    const equityResetFilterButton = document.getElementById("resetFilterButton");

    if (equityFilterButton) {
        equityFilterButton.addEventListener("click", function() {
            console.log("Equity Filter button clicked!");
            applyFilters();
        });
    }

    if (equityResetFilterButton) {
        equityResetFilterButton.addEventListener("click", function() {
            console.log("Equity Reset Filter button clicked!");
            resetFilters();
        });
    }

    // Company Search
    const companyFilterButton = document.getElementById("countryFilterButton");
    const companyResetFilterButton = document.getElementById("countryResetFilterButton");

    if (companyFilterButton) {
        companyFilterButton.addEventListener("click", function() {
            console.log("Company Filter button clicked!");
            applyCompanyFilters();
        });
    }

    if (companyResetFilterButton) {
        companyResetFilterButton.addEventListener("click", function() {
            console.log("Company Reset Filter button clicked!");
            resetCompanyFilters();
        });
    }

}

// Attach Account Page Event Listeners
function attachAccountPageEventListeners() {

    fetchTableData();
    const updateUserTableForm1 = document.getElementById("updateUserTable1");
    const updateUserTableForm2 = document.getElementById("updateUserTable2");
    const updateUserTableForm3 = document.getElementById("updateUserTable3");
    const updateUserTableForm4 = document.getElementById("updateUserTable4");
    const updateUserTableForm5 = document.getElementById("updateUserTable5");
    const deleteUserBankForm = document.getElementById("deleteUserBank");

    if (updateUserTableForm1) {
        updateUserTableForm1.addEventListener("submit", updateUserTable1);
    }
    if (updateUserTableForm2) {
        updateUserTableForm2.addEventListener("submit", updateUserTable2);
    }
    if (updateUserTableForm3) {
        updateUserTableForm3.addEventListener("submit", updateUserTable3);
    }
    if (updateUserTableForm4) {
        updateUserTableForm4.addEventListener("submit", updateUserTable4);
    }
    if (updateUserTableForm5) {
        updateUserTableForm5.addEventListener("submit", updateUserTable5);
    }

    if (deleteUserBankForm) {
        deleteUserBankForm.addEventListener("submit", deleteUserBank);
    }
}

window.addEventListener('load', initialize);