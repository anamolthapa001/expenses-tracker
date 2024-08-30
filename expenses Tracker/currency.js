const exchangeRates = {
    "NPR": 1,
    "USD": 0.0074,
    "EUR": 0.0067,
    "JPY": 1.15,
    "GBP": 0.0060,
    "CAD": 0.010,
    "INR": 0.62,
    "CNY": 0.055,
    "CHF": 0.0069,
    "ZAR": 0.14
};

// Function to convert amount to selected currency
function convertCurrency(amount, fromCurrency, toCurrency) {
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    return (amount / fromRate) * toRate;
}

// Function to update displayed amounts based on selected currency
function updateCurrency() {
    const selectedCurrency = document.getElementById("currency").value;
    
    // Update balance, income, and expense amounts
    const balanceAmount = parseFloat(document.getElementById("balanceAmount").getAttribute("data-original-amount"));
    const incomeAmount = parseFloat(document.getElementById("incomeAmount").getAttribute("data-original-amount"));
    const expenseAmount = parseFloat(document.getElementById("expenseAmount").getAttribute("data-original-amount"));

    document.getElementById("balanceAmount").textContent = convertCurrency(balanceAmount, "NPR", selectedCurrency).toFixed(2);
    document.getElementById("incomeAmount").textContent = convertCurrency(incomeAmount, "NPR", selectedCurrency).toFixed(2);
    document.getElementById("expenseAmount").textContent = convertCurrency(expenseAmount, "NPR", selectedCurrency).toFixed(2);

    // Update the currency label in transaction history
    const transactionRows = document.querySelectorAll("#transactionHistory tbody tr");
    transactionRows.forEach(row => {
        const amountCell = row.querySelector("td:nth-child(3)");
        const originalCurrency = row.querySelector("td:nth-child(4)").textContent;
        const originalAmount = parseFloat(amountCell.getAttribute("data-original-amount"));

        if (originalAmount && originalCurrency) {
            const convertedAmount = convertCurrency(originalAmount, originalCurrency, selectedCurrency).toFixed(2);
            amountCell.textContent = `${convertedAmount} ${selectedCurrency}`;
        }
    });
}

// Add event listener to currency dropdown
document.getElementById("currency").addEventListener("change", updateCurrency);

// Function to add transaction (simplified)
function addTransaction(event) {
    event.preventDefault();
    
    const name = document.getElementById("name").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;
    const notes = document.getElementById("notes").value;
    const currency = document.getElementById("currency").value;

    const tbody = document.querySelector("#transactionHistory tbody");

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${date}</td>
        <td>${name}</td>
        <td data-original-amount="${amount}">${amount.toFixed(2)} ${currency}</td>
        <td>${currency}</td>
        <td>${type}</td>
        <td>${category}</td>
        <td>${notes}</td>
        <td><button onclick="removeTransaction(this)">Remove</button></td>
    `;

    tbody.appendChild(row);

    // Update the balance, income, and expense with original values in NPR
    updateSummary(type, amount, currency);

    // Clear the form
    document.getElementById("expenseForm").reset();

    // Update the displayed currency
    updateCurrency();
}

// Function to update summary (balance, income, expenses)
function updateSummary(type, amount, currency) {
    // Convert amount to NPR if it's not already in NPR
    const amountInNPR = convertCurrency(amount, currency, "NPR");

    let balance = parseFloat(document.getElementById("balanceAmount").getAttribute("data-original-amount")) || 0;
    let income = parseFloat(document.getElementById("incomeAmount").getAttribute("data-original-amount")) || 0;
    let expense = parseFloat(document.getElementById("expenseAmount").getAttribute("data-original-amount")) || 0;

    if (type === "income") {
        income += amountInNPR;
    } else {
        expense += amountInNPR;
    }

    balance = income - expense;

    // Store the original amounts in NPR
    document.getElementById("balanceAmount").setAttribute("data-original-amount", balance.toFixed(2));
    document.getElementById("incomeAmount").setAttribute("data-original-amount", income.toFixed(2));
    document.getElementById("expenseAmount").setAttribute("data-original-amount", expense.toFixed(2));
}

// Function to remove a transaction
function removeTransaction(button) {
    const row = button.closest("tr");
    const amount = parseFloat(row.querySelector("td:nth-child(3)").getAttribute("data-original-amount"));
    const type = row.querySelector("td:nth-child(5)").textContent;
    const currency = row.querySelector("td:nth-child(4)").textContent;

    // Update the summary before removing the transaction
    if (type === "income") {
        updateSummary("expense", amount, currency);
    } else {
        updateSummary("income", amount, currency);
    }

    row.remove();

    // Update the displayed currency
    updateCurrency();
}

// Add event listener to form submission
document.getElementById("expenseForm").addEventListener("submit", addTransaction);
