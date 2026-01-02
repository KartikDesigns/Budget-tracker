// === Smart Suggestions System ===
class SmartSuggestions {
  constructor(transactions) {
    this.transactions = transactions;
    this.descInput = document.getElementById("desc");
    this.amountInput = document.getElementById("amount");
    this.typeSelect = document.getElementById("type");
    this.categoryInput = document.getElementById("category");
    this.descSuggestions = document.getElementById("desc-suggestions");
    this.categorySuggestions = document.getElementById("category-suggestions");
    
    // Check if all required elements exist
    if (!this.descInput || !this.amountInput || !this.typeSelect || 
        !this.categoryInput || !this.descSuggestions || !this.categorySuggestions) {
      console.error("Required DOM elements not found for SmartSuggestions");
      return;
    }
    
    this.descHighlightedIndex = -1;
    this.categoryHighlightedIndex = -1;
    
    // Common income sources
    this.commonIncomeSources = [
      "Salary", "Freelance Work", "Consulting Fee", "Business Revenue", 
      "Investment Income", "Dividends", "Rental Income", "Bonus", 
      "Commission", "Gift Money", "Tax Refund", "Insurance Payout",
      "Loan Repayment", "Grant", "Scholarship", "Pension", 
      "Royalties", "Online Sales", "Service Payment", "Project Payment"
    ];
    
    // Common expense categories
    this.commonExpenseCategories = [
      "Groceries", "Rent", "Utilities", "Transportation", 
      "Dining Out", "Entertainment", "Shopping", "Healthcare", 
      "Insurance", "Education", "Travel", "Subscriptions", 
      "Loan Payment", "Credit Card", "Taxes", "Home Maintenance", 
      "Personal Care", "Gifts", "Donations", "Investments",
      "Fuel", "Parking", "Public Transport", "Internet", 
      "Phone Bill", "Streaming Services", "Gym Membership", "Clothing",
      "Electronics", "Home Decor", "Pet Expenses", "Childcare"
    ];
    
    // Common recovery sources
    this.commonRecoverySources = [
      "Debt Recovery", "Loan Return", "Deposit Refund", "Security Deposit",
      "Insurance Claim", "Warranty Claim", "Tax Refund", "Reimbursement",
      "Returned Purchase", "Cancelled Service Refund", "Overpayment Refund"
    ];
    
    this.init();
  }
  
  init() {
    // Check if initialization was successful
    if (!this.descInput) {
      console.error("SmartSuggestions initialization failed - required elements not found");
      return;
    }
    
    // Description suggestions
    this.descInput.addEventListener("input", (e) => {
      this.showDescriptionSuggestions(e.target.value);
    });
    
    this.descInput.addEventListener("focus", (e) => {
      // Show recent suggestions when input is focused
      if (!e.target.value) {
        this.showDescriptionSuggestions("");
      }
    });
    
    this.descInput.addEventListener("keydown", (e) => {
      this.handleDescKeyNavigation(e);
    });
    
    this.descInput.addEventListener("blur", () => {
      // Delay hiding to allow clicking on suggestions
      setTimeout(() => {
        this.hideDescriptionSuggestions();
        this.descHighlightedIndex = -1;
      }, 200);
    });
    
    // Amount-based suggestions
    this.amountInput.addEventListener("input", (e) => {
      this.showAmountBasedSuggestions(e.target.value);
    });
    
    this.amountInput.addEventListener("focus", (e) => {
      // Show suggestions when amount input is focused
      if (e.target.value) {
        this.showAmountBasedSuggestions(e.target.value);
      }
    });
    
    this.amountInput.addEventListener("blur", () => {
      // Delay hiding to allow clicking on suggestions
      setTimeout(() => {
        const amountSuggestions = document.getElementById("amount-suggestions");
        if (amountSuggestions) {
          amountSuggestions.classList.remove("show");
        }
      }, 200);
    });
    
    // Type-based suggestions (for income)
    this.typeSelect.addEventListener("change", (e) => {
      if (e.target.value === "income") {
        this.showIncomeSuggestions();
      }
    });
    
    // Category suggestions
    this.categoryInput.addEventListener("input", (e) => {
      this.showCategorySuggestions(e.target.value);
    });
    
    this.categoryInput.addEventListener("focus", (e) => {
      // Show recent suggestions when input is focused
      if (!e.target.value) {
        this.showCategorySuggestions("");
      }
    });
    
    this.categoryInput.addEventListener("keydown", (e) => {
      this.handleCategoryKeyNavigation(e);
    });
    
    this.categoryInput.addEventListener("blur", () => {
      // Delay hiding to allow clicking on suggestions
      setTimeout(() => {
        this.hideCategorySuggestions();
        this.categoryHighlightedIndex = -1;
      }, 200);
    });
    
    // Show all suggestions button
    const showAllSuggestionsBtn = document.getElementById("show-all-suggestions");
    if (showAllSuggestionsBtn) {
      showAllSuggestionsBtn.addEventListener("click", () => {
        this.showAllSuggestions();
      });
    }
  }
  
  // Show all suggestions in a modal
  showAllSuggestions() {
    // Create modal for all suggestions
    const modal = document.createElement("div");
    modal.className = "all-suggestions-modal";
    modal.innerHTML = `
      <div class="all-suggestions-content">
        <div class="modal-header">
          <h3><i class="fas fa-lightbulb"></i> All Transaction Suggestions</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="suggestions-tabs">
          <button class="tab-button active" data-tab="income">Income</button>
          <button class="tab-button" data-tab="expense">Expenses</button>
          <button class="tab-button" data-tab="recovery">Recovery</button>
          <button class="tab-button" data-tab="recent">Recent</button>
          <button class="tab-button" data-tab="categories">Categories</button>
        </div>
        <div class="tab-content">
          <div class="tab-pane active" id="income-tab">
            <h4>Common Income Sources</h4>
            <div class="suggestions-grid" id="income-suggestions-grid"></div>
          </div>
          <div class="tab-pane" id="expense-tab">
            <h4>Common Expense Categories</h4>
            <div class="suggestions-grid" id="expense-suggestions-grid"></div>
          </div>
          <div class="tab-pane" id="recovery-tab">
            <h4>Common Recovery Sources</h4>
            <div class="suggestions-grid" id="recovery-suggestions-grid"></div>
          </div>
          <div class="tab-pane" id="recent-tab">
            <h4>Recent Transactions</h4>
            <div class="suggestions-list" id="recent-suggestions-list"></div>
          </div>
          <div class="tab-pane" id="categories-tab">
            <h4>Common Categories</h4>
            <div class="suggestions-grid" id="categories-suggestions-grid"></div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners for tabs
    const tabButtons = modal.querySelectorAll(".tab-button");
    tabButtons.forEach(button => {
      button.addEventListener("click", () => {
        // Remove active class from all buttons and panes
        modal.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
        modal.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
        
        // Add active class to clicked button
        button.classList.add("active");
        
        // Show corresponding pane
        const tabId = button.getAttribute("data-tab");
        modal.querySelector(`#${tabId}-tab`).classList.add("active");
      });
    });
    
    // Close modal
    const closeBtn = modal.querySelector(".close-modal");
    closeBtn.addEventListener("click", () => {
      document.body.removeChild(modal);
    });
    
    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
    
    // Populate suggestions
    this.populateAllSuggestions(modal);
  }
  
  // Populate all suggestions in the modal
  populateAllSuggestions(modal) {
    // Income suggestions (combine common sources with user's income)
    const userIncomeDescriptions = [...new Set(this.transactions
      .filter(t => t.type === "income")
      .map(t => t.desc))];
    
    // Combine common sources with user's income, prioritizing user's data
    const allIncomeSources = [...new Set([...userIncomeDescriptions, ...this.commonIncomeSources])];
    
    const incomeGrid = modal.querySelector("#income-suggestions-grid");
    
    allIncomeSources.slice(0, 16).forEach(desc => {
      const item = document.createElement("div");
      item.className = "suggestion-card income-card";
      
      // Check if this is a user's income source
      const isUserSource = userIncomeDescriptions.includes(desc);
      const usageCount = isUserSource ? 
        this.transactions.filter(t => t.desc === desc).length : 0;
      
      item.innerHTML = `
        <div class="card-content">
          <h5>${desc}</h5>
          ${isUserSource ? 
            `<span class="usage-count">${usageCount} times</span>` : 
            `<span class="common-source">Common source</span>`}
        </div>
      `;
      
      item.addEventListener("click", () => {
        this.descInput.value = desc;
        if (!this.typeSelect.value) {
          this.typeSelect.value = "income";
        }
        document.body.removeChild(document.querySelector(".all-suggestions-modal"));
        this.descInput.focus();
        showNotification(`Selected: ${desc}`, "success");
      });
      
      incomeGrid.appendChild(item);
    });
    
    // Expense suggestions (combine common categories with user's expenses)
    const userExpenseDescriptions = [...new Set(this.transactions
      .filter(t => t.type === "expense")
      .map(t => t.desc))];
    
    // Combine common categories with user's expenses, prioritizing user's data
    const allExpenseSources = [...new Set([...userExpenseDescriptions, ...this.commonExpenseCategories])];
    
    const expenseGrid = modal.querySelector("#expense-suggestions-grid");
    
    allExpenseSources.slice(0, 16).forEach(desc => {
      const item = document.createElement("div");
      item.className = "suggestion-card expense-card";
      
      // Check if this is a user's expense source
      const isUserSource = userExpenseDescriptions.includes(desc);
      const usageCount = isUserSource ? 
        this.transactions.filter(t => t.desc === desc).length : 0;
      
      item.innerHTML = `
        <div class="card-content">
          <h5>${desc}</h5>
          ${isUserSource ? 
            `<span class="usage-count">${usageCount} times</span>` : 
            `<span class="common-source">Common source</span>`}
        </div>
      `;
      
      item.addEventListener("click", () => {
        this.descInput.value = desc;
        if (!this.typeSelect.value) {
          this.typeSelect.value = "expense";
        }
        document.body.removeChild(document.querySelector(".all-suggestions-modal"));
        this.descInput.focus();
        showNotification(`Selected: ${desc}`, "success");
      });
      
      expenseGrid.appendChild(item);
    });
    
    // Recovery suggestions (combine common sources with user's recovery)
    const userRecoveryDescriptions = [...new Set(this.transactions
      .filter(t => t.type === "recovery")
      .map(t => t.desc))];
    
    // Combine common sources with user's recovery, prioritizing user's data
    const allRecoverySources = [...new Set([...userRecoveryDescriptions, ...this.commonRecoverySources])];
    
    const recoveryGrid = modal.querySelector("#recovery-suggestions-grid");
    
    allRecoverySources.slice(0, 16).forEach(desc => {
      const item = document.createElement("div");
      item.className = "suggestion-card recovery-card";
      
      // Check if this is a user's recovery source
      const isUserSource = userRecoveryDescriptions.includes(desc);
      const usageCount = isUserSource ? 
        this.transactions.filter(t => t.desc === desc).length : 0;
      
      item.innerHTML = `
        <div class="card-content">
          <h5>${desc}</h5>
          ${isUserSource ? 
            `<span class="usage-count">${usageCount} times</span>` : 
            `<span class="common-source">Common source</span>`}
        </div>
      `;
      
      item.addEventListener("click", () => {
        this.descInput.value = desc;
        if (!this.typeSelect.value) {
          this.typeSelect.value = "recovery";
        }
        document.body.removeChild(document.querySelector(".all-suggestions-modal"));
        this.descInput.focus();
        showNotification(`Selected: ${desc}`, "success");
      });
      
      recoveryGrid.appendChild(item);
    });
    
    // Recent suggestions
    const recentTransactions = [...this.transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 15);
    
    const recentList = modal.querySelector("#recent-suggestions-list");
    
    recentTransactions.forEach(transaction => {
      const item = document.createElement("div");
      item.className = "recent-transaction-item";
      
      const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(transaction.amount);
      
      const typeIcon = transaction.type === "income" ? "↑" : 
                      transaction.type === "expense" ? "↓" : "↺";
      const typeClass = transaction.type === "income" ? "text-green" : 
                       transaction.type === "expense" ? "text-red" : "";
      
      item.innerHTML = `
        <div class="transaction-info">
          <div class="transaction-desc">${transaction.desc}</div>
          <div class="transaction-meta">
            <span class="${typeClass}">${typeIcon} ${transaction.type}</span>
            <span>${formattedAmount}</span>
            <span>${transaction.date}</span>
          </div>
        </div>
        <div class="transaction-category">${transaction.category || "No category"}</div>
      `;
      
      item.addEventListener("click", () => {
        this.descInput.value = transaction.desc;
        this.categoryInput.value = transaction.category || "";
        if (!this.typeSelect.value) {
          this.typeSelect.value = transaction.type;
        }
        document.body.removeChild(document.querySelector(".all-suggestions-modal"));
        this.descInput.focus();
        showNotification(`Loaded transaction: ${transaction.desc}`, "success");
      });
      
      recentList.appendChild(item);
    });
    
    // Category suggestions
    const userCategories = [...new Set(this.transactions
      .filter(t => t.category)
      .map(t => t.category))];
    
    // Combine common categories with user's categories, prioritizing user's data
    const allCategories = [...new Set([...userCategories, ...this.commonExpenseCategories])];
    
    const categoriesGrid = modal.querySelector("#categories-suggestions-grid");
    
    allCategories.slice(0, 16).forEach(cat => {
      const item = document.createElement("div");
      item.className = "suggestion-card category-card";
      
      // Check if this is a user's category
      const isUserCategory = userCategories.includes(cat);
      const usageCount = isUserCategory ? 
        this.transactions.filter(t => t.category === cat).length : 0;
      
      item.innerHTML = `
        <div class="card-content">
          <h5>${cat}</h5>
          ${isUserCategory ? 
            `<span class="usage-count">${usageCount} times</span>` : 
            `<span class="common-source">Common category</span>`}
        </div>
      `;
      
      item.addEventListener("click", () => {
        this.categoryInput.value = cat;
        document.body.removeChild(document.querySelector(".all-suggestions-modal"));
        this.categoryInput.focus();
        showNotification(`Selected category: ${cat}`, "success");
      });
      
      categoriesGrid.appendChild(item);
    });
  }
  
  // Show income-specific suggestions
  showIncomeSuggestions() {
    // Get recent income transactions
    const recentIncome = this.transactions
      .filter(t => t.type === "income")
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    if (recentIncome.length === 0) return;
    
    // Show notification with income suggestions
    let message = "Recent income sources:\n";
    recentIncome.forEach((t, i) => {
      const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(t.amount);
      message += `${i + 1}. ${t.desc} (${formattedAmount})\n`;
    });
    
    showNotification("Check recent income sources for reference", "info", 3000);
  }
  
  // Show amount-based suggestions for high-value transactions
  showAmountBasedSuggestions(amountValue) {
    const amount = parseFloat(amountValue);
    
    // Show suggestions for all amounts
    if (isNaN(amount) || amount <= 0) {
      const amountSuggestions = document.getElementById("amount-suggestions");
      if (amountSuggestions) {
        amountSuggestions.classList.remove("show");
      }
      return;
    }
    
    // Create or get amount suggestions container
    let amountSuggestions = document.getElementById("amount-suggestions");
    if (!amountSuggestions) {
      amountSuggestions = document.createElement("div");
      amountSuggestions.id = "amount-suggestions";
      amountSuggestions.className = "suggestions-dropdown";
      this.amountInput.parentNode.insertBefore(amountSuggestions, this.amountInput.nextSibling);
    }
    
    // Get transaction suggestions of any value
    const highValueTransactions = this.transactions
      .sort((a, b) => Math.abs(b.amount - amount) - Math.abs(a.amount - amount)) // Sort by closest amount
      .slice(0, 10); // Increase limit to 10 suggestions
    
    if (highValueTransactions.length === 0) {
      amountSuggestions.innerHTML = `<div class="suggestion-item no-suggestions">No similar transactions found</div>`;
      amountSuggestions.classList.add("show");
      return;
    }
    
    amountSuggestions.innerHTML = "";
    
    // Add header
    const header = document.createElement("div");
    header.className = "suggestion-item suggestion-header";
    header.innerHTML = `<div class="suggestion-text">Transaction suggestions</div>`;
    amountSuggestions.appendChild(header);
    
    highValueTransactions.forEach((transaction, index) => {
      const suggestionItem = document.createElement("div");
      suggestionItem.className = "suggestion-item";
      
      const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(transaction.amount);
      
      suggestionItem.innerHTML = `
        <div class="suggestion-text">${transaction.desc}</div>
        <div class="suggestion-meta">${formattedAmount} • ${transaction.category || 'No category'} • ${transaction.date}</div>
      `;
      
      suggestionItem.addEventListener("click", () => {
        // Populate form with suggestion data
        this.descInput.value = transaction.desc;
        this.categoryInput.value = transaction.category || "";
        showNotification(`Loaded transaction: ${transaction.desc}`, "info");
        amountSuggestions.classList.remove("show");
      });
      
      amountSuggestions.appendChild(suggestionItem);
    });
    
    amountSuggestions.classList.add("show");
  }
  
  // Get unique descriptions from transactions with enhanced suggestions
  getUniqueDescriptions(searchTerm = "") {
    // Filter by transaction type if selected
    const selectedType = this.typeSelect.value;
    let filteredTransactions = this.transactions;
    
    if (selectedType) {
      filteredTransactions = this.transactions.filter(t => t.type === selectedType);
    }
    
    if (!searchTerm.trim()) {
      // If no search term, show most recently used descriptions
      const recentTransactions = [...filteredTransactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      const descriptions = new Set();
      recentTransactions.forEach(t => {
        if (t.desc && !descriptions.has(t.desc)) {
          descriptions.add(t.desc);
        }
      });
      
      // For income, prioritize common income sources
      if (selectedType === "income") {
        const incomeKeywords = ["salary", "wage", "payment", "income", "earnings", "revenue", "bonus", "commission"];
        const incomeDescriptions = filteredTransactions
          .filter(t => incomeKeywords.some(keyword => 
            t.desc.toLowerCase().includes(keyword)))
          .map(t => t.desc);
        
        // Combine recent and income-specific descriptions
        return [...new Set([...incomeDescriptions.slice(0, 5), ...Array.from(descriptions).slice(0, 10)])];
      }
      
      // For expenses, prioritize common expense categories
      if (selectedType === "expense") {
        const expenseKeywords = ["grocery", "rent", "utility", "transport", "food", "dining", "shopping", "health"];
        const expenseDescriptions = filteredTransactions
          .filter(t => expenseKeywords.some(keyword => 
            t.desc.toLowerCase().includes(keyword)))
          .map(t => t.desc);
        
        // Combine recent and expense-specific descriptions
        return [...new Set([...expenseDescriptions.slice(0, 5), ...Array.from(descriptions).slice(0, 10)])];
      }
      
      // For recovery, prioritize common recovery sources
      if (selectedType === "recovery") {
        const recoveryKeywords = ["refund", "recovery", "return", "claim", "reimbursement"];
        const recoveryDescriptions = filteredTransactions
          .filter(t => recoveryKeywords.some(keyword => 
            t.desc.toLowerCase().includes(keyword)))
          .map(t => t.desc);
        
        // Combine recent and recovery-specific descriptions
        return [...new Set([...recoveryDescriptions.slice(0, 5), ...Array.from(descriptions).slice(0, 10)])];
      }
      
      return Array.from(descriptions).slice(0, 10); // Show up to 10 recent descriptions
    }
    
    // Filter transactions based on search term
    const searchFilteredTransactions = filteredTransactions.filter(t => 
      t.desc && t.desc.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Sort by recency and frequency
    const descCount = {};
    const descLastUsed = {};
    const descType = {}; // Track transaction type for each description
    
    searchFilteredTransactions.forEach(t => {
      descCount[t.desc] = (descCount[t.desc] || 0) + 1;
      descType[t.desc] = t.type;
      // Update last used date if this transaction is more recent
      if (!descLastUsed[t.desc] || new Date(t.date) > new Date(descLastUsed[t.desc])) {
        descLastUsed[t.desc] = t.date;
      }
    });
    
    // Convert to array and sort by relevance (frequency * recency weight)
    return Object.keys(descCount)
      .map(desc => {
        const frequency = descCount[desc];
        const daysSinceLastUse = (Date.now() - new Date(descLastUsed[desc]).getTime()) / (1000 * 60 * 60 * 24);
        // More recent = higher score, higher frequency = higher score
        // Boost type-related descriptions when type is selected
        let boost = 1;
        if (selectedType === "income" && descType[desc] === "income") boost = 1.5;
        if (selectedType === "expense" && descType[desc] === "expense") boost = 1.5;
        if (selectedType === "recovery" && descType[desc] === "recovery") boost = 1.5;
        const relevanceScore = frequency * Math.max(1, 30 / (daysSinceLastUse + 1)) * boost;
        return { desc, frequency, lastUsed: descLastUsed[desc], type: descType[desc], relevanceScore };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .map(item => item.desc)
      .slice(0, 15); // Increased limit to 15 suggestions
  }
  
  // Get unique categories from transactions with enhanced suggestions
  getUniqueCategories(searchTerm = "") {
    // Filter by transaction type if selected
    const selectedType = this.typeSelect.value;
    let filteredTransactions = this.transactions;
    
    if (selectedType) {
      filteredTransactions = this.transactions.filter(t => t.type === selectedType);
    }
    
    if (!searchTerm.trim()) {
      // If no search term, show most recently used categories
      const recentTransactions = [...filteredTransactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      const categories = new Set();
      recentTransactions.forEach(t => {
        if (t.category && !categories.has(t.category)) {
          categories.add(t.category);
        }
      });
      
      // For income, prioritize common income categories
      if (selectedType === "income") {
        const incomeCategories = ["Salary", "Freelance", "Business", "Investment", "Bonus", "Commission", "Gift", "Other Income"];
        const existingIncomeCategories = filteredTransactions
          .filter(t => incomeCategories.includes(t.category))
          .map(t => t.category);
        
        // Combine recent and income-specific categories
        return [...new Set([...existingIncomeCategories, ...Array.from(categories).slice(0, 10)])];
      }
      
      // For expenses, prioritize common expense categories
      if (selectedType === "expense") {
        const expenseCategories = ["Groceries", "Rent", "Utilities", "Transportation", "Dining Out", "Entertainment", "Shopping", "Healthcare"];
        const existingExpenseCategories = filteredTransactions
          .filter(t => expenseCategories.includes(t.category))
          .map(t => t.category);
        
        // Combine recent and expense-specific categories
        return [...new Set([...existingExpenseCategories, ...Array.from(categories).slice(0, 10)])];
      }
      
      // For recovery, prioritize common recovery categories
      if (selectedType === "recovery") {
        const recoveryCategories = ["Refund", "Reimbursement", "Claim", "Return", "Recovery"];
        const existingRecoveryCategories = filteredTransactions
          .filter(t => recoveryCategories.includes(t.category))
          .map(t => t.category);
        
        // Combine recent and recovery-specific categories
        return [...new Set([...existingRecoveryCategories, ...Array.from(categories).slice(0, 10)])];
      }
      
      return Array.from(categories).slice(0, 10); // Show up to 10 recent categories
    }
    
    // Filter transactions based on search term
    const filteredTransactionsByTerm = filteredTransactions.filter(t => 
      t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Sort by recency and frequency
    const categoryCount = {};
    const categoryLastUsed = {};
    const categoryType = {}; // Track transaction type for each category
    
    filteredTransactionsByTerm.forEach(t => {
      if (t.category) {
        categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
        categoryType[t.category] = t.type;
        // Update last used date if this transaction is more recent
        if (!categoryLastUsed[t.category] || new Date(t.date) > new Date(categoryLastUsed[t.category])) {
          categoryLastUsed[t.category] = t.date;
        }
      }
    });
    
    // Convert to array and sort by relevance (frequency * recency weight)
    return Object.keys(categoryCount)
      .map(cat => {
        const frequency = categoryCount[cat];
        const daysSinceLastUse = (Date.now() - new Date(categoryLastUsed[cat]).getTime()) / (1000 * 60 * 60 * 24);
        // More recent = higher score, higher frequency = higher score
        // Boost type-related categories when type is selected
        let boost = 1;
        if (selectedType === "income" && categoryType[cat] === "income") boost = 1.5;
        if (selectedType === "expense" && categoryType[cat] === "expense") boost = 1.5;
        if (selectedType === "recovery" && categoryType[cat] === "recovery") boost = 1.5;
        const relevanceScore = frequency * Math.max(1, 30 / (daysSinceLastUse + 1)) * boost;
        return { cat, frequency, lastUsed: categoryLastUsed[cat], type: categoryType[cat], relevanceScore };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .map(item => item.cat)
      .slice(0, 15); // Increased limit to 15 suggestions
  }
  
  // Show description suggestions
  showDescriptionSuggestions(searchTerm) {
    // Show suggestions even for empty search (recent items)
    const suggestions = this.getUniqueDescriptions(searchTerm);
    
    if (suggestions.length === 0) {
      // Show "No suggestions" message when there are no matches
      if (searchTerm.trim()) {
        this.descSuggestions.innerHTML = `<div class="suggestion-item no-suggestions">No matching descriptions found</div>`;
        this.descSuggestions.classList.add("show");
      } else {
        this.hideDescriptionSuggestions();
      }
      return;
    }
    
    this.descSuggestions.innerHTML = "";
    
    suggestions.forEach((desc, index) => {
      const suggestionItem = document.createElement("div");
      suggestionItem.className = "suggestion-item";
      
      // Find transaction with this description for additional info
      const transaction = this.transactions.find(t => t.desc === desc);
      const type = transaction ? transaction.type : "";
      const typeIcon = type === "income" ? "↑" : type === "expense" ? "↓" : "↺";
      const typeClass = type === "income" ? "text-green" : type === "expense" ? "text-red" : "";
      const suggestionClass = type ? `${type}-suggestion` : "";
      
      // Add type-specific class
      if (suggestionClass) {
        suggestionItem.classList.add(suggestionClass);
      }
      
      suggestionItem.innerHTML = `
        <div class="suggestion-text">${desc}</div>
        ${type ? `<div class="suggestion-meta ${type}-meta">${typeIcon} ${type.charAt(0).toUpperCase() + type.slice(1)}</div>` : ""}
      `;
      
      suggestionItem.addEventListener("click", () => {
        this.descInput.value = desc;
        // Auto-select type if not already selected
        if (type && !this.typeSelect.value) {
          this.typeSelect.value = type;
        }
        this.hideDescriptionSuggestions();
        this.descInput.focus();
      });
      
      this.descSuggestions.appendChild(suggestionItem);
    });
    
    this.descSuggestions.classList.add("show");
    this.descHighlightedIndex = -1;
  }
  
  // Show category suggestions
  showCategorySuggestions(searchTerm) {
    // Show suggestions even for empty search (recent items)
    const suggestions = this.getUniqueCategories(searchTerm);
    
    if (suggestions.length === 0) {
      // Show "No suggestions" message when there are no matches
      if (searchTerm.trim()) {
        this.categorySuggestions.innerHTML = `<div class="suggestion-item no-suggestions">No matching categories found</div>`;
        this.categorySuggestions.classList.add("show");
      } else {
        this.hideCategorySuggestions();
      }
      return;
    }
    
    this.categorySuggestions.innerHTML = "";
    
    suggestions.forEach((cat, index) => {
      const suggestionItem = document.createElement("div");
      suggestionItem.className = "suggestion-item";
      
      // Count how many transactions use this category and get type distribution
      const categoryTransactions = this.transactions.filter(t => t.category === cat);
      const usageCount = categoryTransactions.length;
      
      // Get most common type for this category
      const typeCount = {};
      categoryTransactions.forEach(t => {
        typeCount[t.type] = (typeCount[t.type] || 0) + 1;
      });
      
      const mostCommonType = Object.keys(typeCount).reduce((a, b) => 
        typeCount[a] > typeCount[b] ? a : b
      );
      
      const typeIcon = mostCommonType === "income" ? "↑" : 
                      mostCommonType === "expense" ? "↓" : "↺";
      const typeColorClass = mostCommonType === "income" ? "income-meta" : 
                            mostCommonType === "expense" ? "expense-meta" : "";
      
      suggestionItem.innerHTML = `
        <div class="suggestion-text">${cat}</div>
        <div class="suggestion-meta ${typeColorClass}">${usageCount} transaction${usageCount !== 1 ? "s" : ""} ${typeIcon}</div>
      `;
      
      suggestionItem.addEventListener("click", () => {
        this.categoryInput.value = cat;
        // Auto-select type if not already selected and it's the dominant type
        if (mostCommonType && !this.typeSelect.value) {
          this.typeSelect.value = mostCommonType;
        }
        this.hideCategorySuggestions();
        this.categoryInput.focus();
      });
      
      this.categorySuggestions.appendChild(suggestionItem);
    });
    
    this.categorySuggestions.classList.add("show");
    this.categoryHighlightedIndex = -1;
  }
  
  // Hide description suggestions
  hideDescriptionSuggestions() {
    this.descSuggestions.classList.remove("show");
  }
  
  // Hide category suggestions
  hideCategorySuggestions() {
    this.categorySuggestions.classList.remove("show");
  }
  
  // Handle keyboard navigation for descriptions
  handleDescKeyNavigation(e) {
    const suggestions = this.descSuggestions.querySelectorAll(".suggestion-item");
    
    if (suggestions.length === 0) return;
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.descHighlightedIndex = Math.min(this.descHighlightedIndex + 1, suggestions.length - 1);
        this.highlightDescSuggestion(suggestions);
        break;
        
      case "ArrowUp":
        e.preventDefault();
        this.descHighlightedIndex = Math.max(this.descHighlightedIndex - 1, -1);
        this.highlightDescSuggestion(suggestions);
        break;
        
      case "Enter":
        e.preventDefault();
        if (this.descHighlightedIndex >= 0 && this.descHighlightedIndex < suggestions.length) {
          const selectedText = suggestions[this.descHighlightedIndex].querySelector(".suggestion-text").textContent;
          this.descInput.value = selectedText;
          this.hideDescriptionSuggestions();
          this.descHighlightedIndex = -1;
        } else if (suggestions.length > 0 && this.descHighlightedIndex === -1) {
          // If no selection but suggestions exist, select first one
          const selectedText = suggestions[0].querySelector(".suggestion-text").textContent;
          this.descInput.value = selectedText;
          this.hideDescriptionSuggestions();
        }
        break;
        
      case "Escape":
        this.hideDescriptionSuggestions();
        this.descHighlightedIndex = -1;
        break;
    }
  }
  
  // Handle keyboard navigation for categories
  handleCategoryKeyNavigation(e) {
    const suggestions = this.categorySuggestions.querySelectorAll(".suggestion-item");
    
    if (suggestions.length === 0) return;
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.categoryHighlightedIndex = Math.min(this.categoryHighlightedIndex + 1, suggestions.length - 1);
        this.highlightCategorySuggestion(suggestions);
        break;
        
      case "ArrowUp":
        e.preventDefault();
        this.categoryHighlightedIndex = Math.max(this.categoryHighlightedIndex - 1, -1);
        this.highlightCategorySuggestion(suggestions);
        break;
        
      case "Enter":
        e.preventDefault();
        if (this.categoryHighlightedIndex >= 0 && this.categoryHighlightedIndex < suggestions.length) {
          const selectedText = suggestions[this.categoryHighlightedIndex].querySelector(".suggestion-text").textContent;
          this.categoryInput.value = selectedText;
          this.hideCategorySuggestions();
          this.categoryHighlightedIndex = -1;
        } else if (suggestions.length > 0 && this.categoryHighlightedIndex === -1) {
          // If no selection but suggestions exist, select first one
          const selectedText = suggestions[0].querySelector(".suggestion-text").textContent;
          this.categoryInput.value = selectedText;
          this.hideCategorySuggestions();
        }
        break;
        
      case "Escape":
        this.hideCategorySuggestions();
        this.categoryHighlightedIndex = -1;
        break;
    }
  }
  
  // Highlight description suggestion
  highlightDescSuggestion(suggestions) {
    suggestions.forEach((suggestion, index) => {
      if (index === this.descHighlightedIndex) {
        suggestion.classList.add("highlighted");
      } else {
        suggestion.classList.remove("highlighted");
      }
    });
  }
  
  // Highlight category suggestion
  highlightCategorySuggestion(suggestions) {
    suggestions.forEach((suggestion, index) => {
      if (index === this.categoryHighlightedIndex) {
        suggestion.classList.add("highlighted");
      } else {
        suggestion.classList.remove("highlighted");
      }
    });
  }
  
  // Update transactions data
  updateTransactions(newTransactions) {
    this.transactions = newTransactions;
  }
}

// === Notification System ===
function showNotification(message, type = "info", duration = 2000) {
  // Remove any existing notifications
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button class="close-btn">&times;</button>
  `;
  
  // Add close button functionality
  const closeBtn = notification.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  });
  
  // Add to document
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);
  
  // Auto-hide after duration
  if (duration > 0) {
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, duration);
  }
}

// === Main Application ===
class BudgetTracker {
  constructor() {
    this.transactions = this.loadTransactions();
    
    // Initialize SmartSuggestions with error handling
    try {
      this.smartSuggestions = new SmartSuggestions(this.transactions);
    } catch (error) {
      console.error("Error initializing SmartSuggestions:", error);
      this.smartSuggestions = null;
    }
    
    this.chart = null;
    this.currency = this.loadCurrency();
    this.chartType = this.loadChartType();
    this.init();
  }
  
  init() {
    // Load transactions and update UI
    this.updateUI();
    
    // Ensure date input allows future dates
    this.setupDateInput();
    
    // Set up form submission
    const form = document.getElementById("transaction-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.addTransaction();
      });
    } else {
      console.error("Transaction form not found");
    }
    
    // Set up delete confirmation
    const modalConfirm = document.getElementById("modal-confirm");
    const modalCancel = document.getElementById("modal-cancel");
    const modal = document.getElementById("modal");
    
    console.log('Modal setup - elements found:', {
      modalConfirm: !!modalConfirm,
      modalCancel: !!modalCancel,
      modal: !!modal
    });
    
    if (modalConfirm && modalCancel) {
      modalConfirm.addEventListener("click", () => {
        console.log('Delete confirmed for transaction:', this.transactionToDelete);
        if (this.transactionToDelete) {
          this.deleteTransaction(this.transactionToDelete);
          this.hideModal();
        } else {
          console.error('No transaction ID stored for deletion');
          showNotification("Error: No transaction selected for deletion", "error");
        }
      });
      
      modalCancel.addEventListener("click", () => {
        console.log('Delete cancelled');
        this.hideModal();
      });
    } else {
      console.error("Modal buttons not found:", {
        modalConfirm: !!modalConfirm,
        modalCancel: !!modalCancel
      });
    }
    
    // Add keyboard support for modal
    if (modal) {
      document.addEventListener("keydown", (e) => {
        if (modal.style.display === "flex") {
          if (e.key === "Escape") {
            console.log('Modal closed with Escape key');
            this.hideModal();
          } else if (e.key === "Enter") {
            // Prevent accidental deletion with Enter key
            e.preventDefault();
          }
        }
      });
      
      // Close modal when clicking outside
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          console.log('Modal closed by clicking outside');
          this.hideModal();
        }
      });
    } else {
      console.error("Modal element not found for keyboard/click setup");
    }
    
    // Set up currency selector
    const currencySelector = document.getElementById("currency-selector");
    if (currencySelector) {
      currencySelector.addEventListener("change", (e) => {
        this.currency = e.target.value;
        this.saveCurrency();
        this.updateUI();
      });
    } else {
      console.warn("Currency selector element not found");
    }
    
    // Set up chart type switcher
    const doughnutBtn = document.getElementById("doughnut-chart-btn");
    const barBtn = document.getElementById("bar-chart-btn");
    
    if (doughnutBtn && barBtn) {
      doughnutBtn.addEventListener("click", () => {
        this.switchChartType('doughnut');
      });
      
      barBtn.addEventListener("click", () => {
        this.switchChartType('bar');
      });
    } else {
      console.warn("Chart type buttons not found");
    }
    
    // Set up backup and restore functionality
    const backupBtn = document.getElementById("backup-btn");
    const restoreBtn = document.getElementById("restore-btn");
    const exportCSVBtn = document.getElementById("export-csv-btn");
    const restoreFile = document.getElementById("restore-file");
    
    if (backupBtn) {
      backupBtn.addEventListener("click", () => {
        this.backupData();
      });
    }
    
    if (exportCSVBtn) {
      exportCSVBtn.addEventListener("click", () => {
        this.exportToCSV();
      });
    }
    
    if (restoreBtn) {
      restoreBtn.addEventListener("click", () => {
        restoreFile.click();
      });
    }
    
    if (restoreFile) {
      restoreFile.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
          this.restoreData(e.target.files[0]);
          // Reset the file input so the same file can be selected again
          e.target.value = '';
        }
      });
    }
    
    // Update chart on window resize
    window.addEventListener("resize", () => {
      if (this.chart) {
        this.chart.resize();
      }
    });
  }
  
  // Setup date input to allow future dates
  setupDateInput() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
      // Remove any max attribute restrictions
      dateInput.removeAttribute('max');
      
      // Set a reasonable min date (e.g., 10 years ago) but no max date
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
      dateInput.setAttribute('min', tenYearsAgo.toISOString().split('T')[0]);
      
      console.log('Date input configured - future dates allowed');
    }
  }
  
  // Check for overspending and show alert
  checkOverspending() {
    const { income, expense, recovery, balance } = this.calculateTotals();
    
    // Only show alert if expenses exceed income + recovery (negative balance)
    if (balance < 0) {
      const overspendAmount = Math.abs(balance);
      this.showOverspendingAlert(overspendAmount);
    }
  }
  
  // Show overspending alert
  showOverspendingAlert(overspendAmount) {
    // Remove any existing overspending alert
    const existingAlert = document.querySelector('.overspending-alert');
    if (existingAlert) {
      existingAlert.remove();
    }
    
    // Create overspending alert
    const alert = document.createElement('div');
    alert.className = 'overspending-alert';
    alert.innerHTML = `
      <div class="alert-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <div class="alert-content">
        <div class="alert-title">Overspending Alert!</div>
        <div class="alert-message">
          You've exceeded your budget by ${this.formatCurrency(overspendAmount)}
        </div>
      </div>
      <button class="close-btn" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Add to document
    document.body.appendChild(alert);
    
    // Show alert with animation
    setTimeout(() => {
      alert.classList.add('show');
    }, 100);
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.classList.remove('show');
        setTimeout(() => {
          if (alert.parentNode) {
            alert.remove();
          }
        }, 400);
      }
    }, 8000);
  }
  
  // Helper method for currency formatting
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: this.currency,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  // Load transactions from localStorage
  loadTransactions() {
    try {
      const transactions = localStorage.getItem("budgetTransactions");
      return transactions ? JSON.parse(transactions) : [];
    } catch (error) {
      console.error("Error loading transactions from localStorage:", error);
      showNotification("Error loading data. Starting fresh.", "error");
      return [];
    }
  }
  
  // Save transactions to localStorage
  saveTransactions() {
    try {
      // Check if localStorage is available
      if (typeof Storage === "undefined") {
        showNotification("Local storage not supported in this browser.", "error");
        return;
      }
      
      // Check if we have enough storage space by testing with a small addition
      const testItem = JSON.stringify({test: "test"});
      localStorage.setItem("storageTest", testItem);
      localStorage.removeItem("storageTest");
      
      localStorage.setItem("budgetTransactions", JSON.stringify(this.transactions));
    } catch (error) {
      console.error("Error saving transactions to localStorage:", error);
      if (error.name === 'QuotaExceededError') {
        showNotification("Storage quota exceeded. Please delete some transactions.", "error");
      } else if (error.name === 'SecurityError') {
        showNotification("Storage access denied. Please check browser settings.", "error");
      } else {
        showNotification("Error saving data. Please check storage space.", "error");
      }
    }
  }
  
  // Load currency from localStorage
  loadCurrency() {
    try {
      const currency = localStorage.getItem("budgetCurrency");
      return currency || 'INR';
    } catch (error) {
      console.error("Error loading currency from localStorage:", error);
      return 'INR';
    }
  }
  
  // Save currency to localStorage
  saveCurrency() {
    try {
      localStorage.setItem("budgetCurrency", this.currency);
    } catch (error) {
      console.error("Error saving currency to localStorage:", error);
      showNotification("Error saving currency preference.", "error");
    }
  }
  
  // Load chart type from localStorage
  loadChartType() {
    try {
      const chartType = localStorage.getItem("budgetChartType");
      return chartType || 'doughnut';
    } catch (error) {
      console.error("Error loading chart type from localStorage:", error);
      return 'doughnut';
    }
  }
  
  // Save chart type to localStorage
  saveChartType() {
    try {
      localStorage.setItem("budgetChartType", this.chartType);
    } catch (error) {
      console.error("Error saving chart type to localStorage:", error);
      showNotification("Error saving chart type preference.", "error");
    }
  }
  
  // Add a new transaction
  addTransaction() {
    const descEl = document.getElementById("desc");
    const amountEl = document.getElementById("amount");
    const dateEl = document.getElementById("date");
    const typeEl = document.getElementById("type");
    const categoryEl = document.getElementById("category");
    
    // Check if all required elements exist
    if (!descEl || !amountEl || !dateEl || !typeEl || !categoryEl) {
      console.error("Required form elements not found");
      showNotification("Form elements not found. Please refresh the page.", "error");
      return;
    }
    
    const desc = descEl.value.trim();
    const amount = parseFloat(amountEl.value);
    const date = dateEl.value;
    const type = typeEl.value;
    const category = categoryEl.value.trim();
    
    if (!desc || isNaN(amount) || amount <= 0 || !date || !type) {
      showNotification("Please fill all required fields with valid values.", "error");
      return;
    }
    
    // Check if amount is extremely large (to prevent potential overflow issues)
    if (amount > Number.MAX_SAFE_INTEGER) {
      showNotification("Amount is too large to be processed.", "error");
      return;
    }
    
    // Date validation removed - future dates are now allowed
    
    const transaction = {
      id: Date.now(),
      desc,
      amount,
      date,
      type,
      category: category || undefined
    };
    
    this.transactions.push(transaction);
    this.saveTransactions();
    this.updateUI();
    
    // Reset form
    const form = document.getElementById("transaction-form");
    if (form) {
      form.reset();
    }
    
    // Clear suggestions
    if (this.smartSuggestions) {
      this.smartSuggestions.hideDescriptionSuggestions();
      this.smartSuggestions.hideCategorySuggestions();
    }
    
    showNotification("Transaction added successfully!", "success");
  }
  
  // Delete a transaction
  deleteTransaction(id) {
    console.log('deleteTransaction called with id:', id);
    console.log('Current transactions count:', this.transactions.length);
    
    // Find the transaction before deleting to show in notification
    const transaction = this.transactions.find(t => t.id === id);
    console.log('Transaction to delete:', transaction);
    
    if (!transaction) {
      console.error('Transaction not found with id:', id);
      showNotification("Transaction not found!", "error");
      return;
    }
    
    // Filter out the transaction
    const originalCount = this.transactions.length;
    this.transactions = this.transactions.filter(t => t.id !== id);
    const newCount = this.transactions.length;
    
    console.log('Transactions count after deletion:', newCount, '(was:', originalCount, ')');
    
    if (originalCount === newCount) {
      console.error('Transaction was not actually deleted');
      showNotification("Failed to delete transaction!", "error");
      return;
    }
    
    // Save and update UI
    this.saveTransactions();
    this.updateUI();
    
    showNotification(`Transaction "${transaction.desc}" deleted successfully!`, "success");
    console.log('Transaction deleted successfully');
  }
  
  // Show delete confirmation modal
  showDeleteModal(id) {
    console.log('showDeleteModal called with id:', id, 'type:', typeof id);
    
    // Ensure ID is a number
    const transactionId = parseInt(id);
    if (isNaN(transactionId)) {
      console.error('Invalid transaction ID:', id);
      showNotification("Invalid transaction ID", "error");
      return;
    }
    
    this.transactionToDelete = transactionId;
    
    const modal = document.getElementById("modal");
    const message = document.getElementById("modal-message");
    const transactionPreview = document.getElementById("transaction-preview");
    
    console.log('Modal elements found:', {
      modal: !!modal,
      message: !!message,
      transactionPreview: !!transactionPreview
    });
    
    if (!modal) {
      console.error("Modal element not found");
      return;
    }
    
    const transaction = this.transactions.find(t => t.id === transactionId);
    console.log('Transaction found:', transaction);
    
    if (transaction && message && transactionPreview) {
      const formattedAmount = this.formatCurrency(transaction.amount);
      
      // Update modal message
      message.textContent = `Are you sure you want to delete this transaction?`;
      
      // Populate transaction preview
      const typeIcon = transaction.type === "income" ? "↑" : 
                      transaction.type === "expense" ? "↓" : "↺";
      const typeClass = transaction.type === "income" ? "income" : 
                       transaction.type === "expense" ? "expense" : "recovery";
      
      transactionPreview.innerHTML = `
        <div class="preview-desc">${transaction.desc}</div>
        <div class="preview-details">
          <div class="preview-amount ${typeClass}">${typeIcon} ${formattedAmount}</div>
          <div class="preview-meta">
            <div>${transaction.date}</div>
            ${transaction.category ? `<div>${transaction.category}</div>` : ''}
            <div class="transaction-type">${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</div>
          </div>
        </div>
      `;
      
      // Update preview styling based on transaction type
      transactionPreview.style.borderLeftColor = 
        transaction.type === "income" ? "#00c896" : 
        transaction.type === "expense" ? "#d9536f" : "#ffae42";
    } else if (message && transactionPreview) {
      message.textContent = "Are you sure you want to delete this transaction?";
      transactionPreview.innerHTML = `
        <div class="preview-desc">Transaction not found</div>
        <div class="preview-details">
          <div class="preview-amount">Unknown</div>
        </div>
      `;
    }
    
    // Show modal
    modal.style.display = "flex";
    console.log('Modal should now be visible');
  }
  
  // Backup data to JSON file
  backupData() {
    const data = {
      transactions: this.transactions,
      currency: this.currency,
      chartType: this.chartType,
      backupDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `budget-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification("Data backup created successfully!", "success");
  }
  
  // Restore data from JSON file
  restoreData(file) {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // Validate the data structure
        if (!data.transactions || !Array.isArray(data.transactions)) {
          showNotification("Invalid backup file format.", "error");
          return;
        }
        
        // Restore the data
        this.transactions = data.transactions;
        
        // Restore currency if present
        if (data.currency) {
          this.currency = data.currency;
          this.saveCurrency();
          
          // Update the currency selector UI
          const currencySelector = document.getElementById("currency-selector");
          if (currencySelector) {
            currencySelector.value = this.currency;
          }
        }
        
        // Restore chart type if present
        if (data.chartType) {
          this.chartType = data.chartType;
          this.saveChartType();
          
          // Update the chart type UI
          this.updateChartTypeButtons();
        }
        
        // Save transactions and update UI
        this.saveTransactions();
        this.updateUI();
        
        showNotification("Data restored successfully!", "success");
      } catch (error) {
        console.error("Error restoring data:", error);
        showNotification("Error restoring data. Invalid file format.", "error");
      }
    };
    
    reader.onerror = () => {
      showNotification("Error reading backup file.", "error");
    };
    
    reader.readAsText(file);
  }
  
  // Update chart type buttons UI
  updateChartTypeButtons() {
    const doughnutBtn = document.getElementById("doughnut-chart-btn");
    const barBtn = document.getElementById("bar-chart-btn");
    
    if (doughnutBtn && barBtn) {
      doughnutBtn.classList.toggle("active", this.chartType === "doughnut");
      barBtn.classList.toggle("active", this.chartType === "bar");
    }
  }
  
  // Export transactions to CSV
  exportToCSV() {
    if (this.transactions.length === 0) {
      showNotification("No transactions to export.", "info");
      return;
    }
    
    // Create CSV header
    let csvContent = "ID,Description,Amount,Date,Type,Category\n";
    
    // Add each transaction as a row
    this.transactions.forEach(transaction => {
      // Escape commas and quotes in description and category
      const desc = transaction.desc.replace(/"/g, '""');
      const category = transaction.category ? transaction.category.replace(/"/g, '""') : '';
      
      // Format the amount with proper currency formatting
      const formattedAmount = transaction.amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      csvContent += `${transaction.id},"${desc}",${formattedAmount},"${transaction.date}","${transaction.type}","${category}"\n`;
    });
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `budget-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification("Transactions exported to CSV successfully!", "success");
  }
  
  // Hide delete confirmation modal
  hideModal() {
    const modal = document.getElementById("modal");
    if (modal) {
      modal.style.display = "none";
      console.log('Modal hidden');
    } else {
      console.error('Modal element not found when trying to hide');
    }
  }
  
  // Calculate totals
  calculateTotals() {
    let income = 0;
    let expense = 0;
    let recovery = 0;
    
    this.transactions.forEach(transaction => {
      switch (transaction.type) {
        case "income":
          income += transaction.amount;
          break;
        case "expense":
          expense += transaction.amount;
          break;
        case "recovery":
          recovery += transaction.amount;
          break;
      }
    });
    
    const balance = income + recovery - expense;
    
    return { income, expense, recovery, balance };
  }
  
  // Update UI with current data
  updateUI() {
    this.updateTotals();
    this.updateTransactionsList();
    this.updateChart();
    this.checkOverspending();
    
    // Update smart suggestions if available
    if (this.smartSuggestions) {
      this.smartSuggestions.updateTransactions(this.transactions);
    }
    
    // Update currency selector UI
    const currencySelector = document.getElementById("currency-selector");
    if (currencySelector) {
      currencySelector.value = this.currency;
    }
    
    // Update chart type buttons UI
    this.updateChartTypeButtons();
  }
  
  // Update totals display
  updateTotals() {
    const { income, expense, recovery, balance } = this.calculateTotals();
    
    // Format currency
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: this.currency,
      maximumFractionDigits: 0
    });
    
    // Update total elements with null checks
    const totalIncomeEl = document.getElementById("total-income");
    const totalExpenseEl = document.getElementById("total-expense");
    const totalRecoveryEl = document.getElementById("total-recovery");
    const balanceEl = document.getElementById("balance");
    
    if (totalIncomeEl) totalIncomeEl.textContent = formatter.format(income);
    if (totalExpenseEl) totalExpenseEl.textContent = formatter.format(expense);
    if (totalRecoveryEl) totalRecoveryEl.textContent = formatter.format(recovery);
    if (balanceEl) balanceEl.textContent = formatter.format(balance);
    
    // Add warning class if balance is negative
    if (balanceEl) {
      if (balance < 0) {
        balanceEl.classList.add("balance-warning");
      } else {
        balanceEl.classList.remove("balance-warning");
      }
    }
  }
  
  // Update transactions list display
  updateTransactionsList() {
    const transactionsList = document.getElementById("transactions-list");
    if (!transactionsList) {
      console.warn("Transactions list element not found");
      return;
    }
    
    const recentTransactions = [...this.transactions].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    if (recentTransactions.length === 0) {
      transactionsList.innerHTML = '<div class="empty">No transactions yet</div>';
      return;
    }
    
    transactionsList.innerHTML = "";
    
    recentTransactions.forEach((transaction, index) => {
      const transactionElement = document.createElement("div");
      transactionElement.className = `transaction ${transaction.type}`;
      transactionElement.style.animationDelay = `${index * 0.1}s`;
      
      // Format currency
      const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: this.currency,
        maximumFractionDigits: 0
      });
      
      const formattedAmount = formatter.format(transaction.amount);
      const typeIcon = transaction.type === "income" ? "↑" : 
                      transaction.type === "expense" ? "↓" : "↺";
      
      transactionElement.innerHTML = `
        <div class="transaction-info">
          <div class="transaction-desc">${transaction.desc}</div>
          <div class="transaction-meta">
            <span class="transaction-amount">${typeIcon} ${formattedAmount}</span>
            <span class="transaction-date">${transaction.date}</span>
            ${transaction.category ? `<span class="transaction-category">${transaction.category}</span>` : ""}
          </div>
        </div>
        <div class="actions">
          <button class="delete-btn" data-id="${transaction.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      
      transactionsList.appendChild(transactionElement);
    });
    
    // Add event listeners to delete buttons using event delegation
    const transactionsListElement = document.getElementById("transactions-list");
    if (transactionsListElement) {
      // Remove any existing event listeners
      if (this.handleDeleteClick) {
        transactionsListElement.removeEventListener("click", this.handleDeleteClick);
      }
      
      // Add new event listener with proper binding
      this.handleDeleteClick = (e) => {
        if (e.target.closest(".delete-btn")) {
          const deleteBtn = e.target.closest(".delete-btn");
          const id = parseInt(deleteBtn.getAttribute("data-id"));
          console.log('Delete button clicked for transaction ID:', id);
          this.showDeleteModal(id);
        }
      };
      
      transactionsListElement.addEventListener("click", this.handleDeleteClick);
      console.log('Delete button event listeners attached via delegation');
    } else {
      console.error('Transactions list not found for event delegation');
    }
  }
  
  // Switch chart type
  switchChartType(type) {
    this.chartType = type;
    this.saveChartType();
    
    // Update button states
    document.getElementById("doughnut-chart-btn").classList.toggle("active", type === "doughnut");
    document.getElementById("bar-chart-btn").classList.toggle("active", type === "bar");
    
    // Update chart
    this.updateChart();
  }
  
  // Update chart display
  updateChart() {
    const ctx = document.getElementById("budget-chart");
    if (!ctx) {
      console.warn("Chart canvas element not found");
      return;
    }
    
    const { income, expense, recovery } = this.calculateTotals();
    
    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }
    
    try {
      // Create chart based on selected type
      if (this.chartType === 'bar') {
        // Filter out zero values and their corresponding labels for better display
        const data = [];
        const labels = [];
        const backgroundColors = [];
        const borderColors = [];
        
        if (income > 0) {
          data.push(income);
          labels.push("Income");
          backgroundColors.push("rgba(0, 200, 150, 0.7)");
          borderColors.push("rgba(0, 200, 150, 1)");
        }
        
        if (expense > 0) {
          data.push(expense);
          labels.push("Expenses");
          backgroundColors.push("rgba(217, 83, 111, 0.7)");
          borderColors.push("rgba(217, 83, 111, 1)");
        }
        
        if (recovery > 0) {
          data.push(recovery);
          labels.push("Recovery");
          backgroundColors.push("rgba(255, 174, 66, 0.7)");
          borderColors.push("rgba(255, 174, 66, 1)");
        }
        
        // If no data, show all categories with zero values
        if (data.length === 0) {
          data.push(0, 0, 0);
          labels.push("Income", "Expenses", "Recovery");
          backgroundColors.push(
            "rgba(0, 200, 150, 0.7)",
            "rgba(217, 83, 111, 0.7)",
            "rgba(255, 174, 66, 0.7)"
          );
          borderColors.push(
            "rgba(0, 200, 150, 1)",
            "rgba(217, 83, 111, 1)",
            "rgba(255, 174, 66, 1)"
          );
        }
        
        this.chart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [{
              label: "Amount",
              data: data,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              intersect: false,
              mode: 'index'
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(106, 90, 205, 0.5)',
                borderWidth: 1,
                cornerRadius: 8,
                callbacks: {
                  label: (context) => {
                    const formatter = new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: this.currency,
                      maximumFractionDigits: 0
                    });
                    return `${context.label}: ${formatter.format(context.raw)}`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  color: "#e0e0f0",
                  font: {
                    size: 11
                  },
                  callback: (value) => {
                    // Format large numbers with abbreviations
                    if (value >= 1e12) {
                      return (value / 1e12).toFixed(1) + 'T';
                    } else if (value >= 1e9) {
                      return (value / 1e9).toFixed(1) + 'B';
                    } else if (value >= 1e6) {
                      return (value / 1e6).toFixed(1) + 'M';
                    } else if (value >= 1e3) {
                      return (value / 1e3).toFixed(1) + 'K';
                    } else {
                      return value.toLocaleString();
                    }
                  }
                },
                grid: {
                  color: "rgba(106, 90, 205, 0.2)",
                  drawBorder: false
                },
                border: {
                  display: false
                }
              },
              x: {
                ticks: {
                  color: "#e0e0f0",
                  font: {
                    size: 12,
                    weight: 'bold'
                  }
                },
                grid: {
                  display: false
                },
                border: {
                  display: false
                }
              }
            },
            animation: {
              duration: 1000,
              easing: 'easeOutQuart'
            },
            layout: {
              padding: {
                top: 20,
                bottom: 10,
                left: 10,
                right: 10
              }
            }
          }
        });
      } else {
        // Default doughnut chart
        this.chart = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Income", "Expenses", "Recovery"],
            datasets: [{
              data: [income, expense, recovery],
              backgroundColor: [
                "#00c896", // Income - teal
                "#d9536f", // Expense - pink-red
                "#ffae42"  // Recovery - golden
              ],
              borderColor: [
                "#00b886",
                "#c9435f",
                "#e59e32"
              ],
              borderWidth: 2,
              hoverOffset: 10
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  color: "#e0e0f0",
                  font: {
                    size: 12
                  },
                  padding: 20
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const formatter = new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: this.currency,
                      maximumFractionDigits: 0
                    });
                    return `${context.label}: ${formatter.format(context.raw)}`;
                  }
                }
              }
            },
            animation: {
              animateRotate: true,
              animateScale: true,
              duration: 1000
            }
          }
        });
      }
    } catch (error) {
      console.error("Error creating chart:", error);
      showNotification("Error creating chart. Chart.js may not be loaded.", "error");
    }
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if critical elements exist before initializing
  const criticalElements = [
    'total-income', 'total-expense', 'total-recovery', 'balance',
    'transactions-list', 'transaction-form'
  ];
  
  const missingElements = criticalElements.filter(id => !document.getElementById(id));
  
  if (missingElements.length > 0) {
    console.error("Critical elements missing:", missingElements);
    // Still try to initialize, but with warnings
    console.warn("Some features may not work properly due to missing elements");
  }
  
  // Date input setup - future dates are now allowed
  const dateInput = document.getElementById('date');
  if (dateInput) {
    // Explicitly remove any max attribute to ensure future dates are allowed
    dateInput.removeAttribute('max');
    console.log('Date input initialized - future dates allowed, max attribute removed');
  }
  
  try {
    new BudgetTracker();
  } catch (error) {
    console.error("Error initializing BudgetTracker:", error);
    // Show user-friendly error message
    const container = document.querySelector('.container');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 50px; color: #e0e0f0;">
          <h2>⚠️ Application Error</h2>
          <p>There was an error loading the Budget Tracker.</p>
          <p>Please refresh the page or check the browser console for details.</p>
          <button onclick="location.reload()" style="
            background: linear-gradient(135deg, #6a5acd, #4b6cb7);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 20px;
          ">Refresh Page</button>
        </div>
      `;
    }
  }
});

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('ServiceWorker registered successfully: ', registration.scope);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

// PWA install prompt handling

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Show install button if we want to manually trigger the install
  showInstallButton();
});

function showInstallButton() {
  // Create an install button if one doesn't exist
  if (!document.getElementById('pwa-install-btn')) {
    const backupRestoreSection = document.querySelector('.backup-restore-buttons');
    if (backupRestoreSection) {
      const installBtn = document.createElement('button');
      installBtn.id = 'pwa-install-btn';
      installBtn.className = 'secondary-button';
      installBtn.innerHTML = '<i class="fas fa-mobile-alt"></i> Install App';
      installBtn.addEventListener('click', triggerPWAInstall);
      backupRestoreSection.appendChild(installBtn);
    }
  }
}

function triggerPWAInstall() {
  if (deferredPrompt) {
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  }
}

// Handle app being launched from home screen
window.addEventListener('load', () => {
  // Check if app is launched in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('App is running in standalone mode');
    // Additional logic when running as installed app
  }
});