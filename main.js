// Daily Expenses Record App - Core JavaScript
class PaksaExpenseTracker {
    constructor() {
        this.expenses = JSON.parse(localStorage.getItem('paksa_expenses')) || [];
        this.accounts = JSON.parse(localStorage.getItem('paksa_accounts')) || this.getDefaultAccounts();
        this.settings = JSON.parse(localStorage.getItem('paksa_settings')) || this.getDefaultSettings();
        this.categories = [
            // Business & Professional
            { name: 'Business Operations', color: '#4299e1', taxDeductible: true, type: 'business' },
            { name: 'Marketing & Advertising', color: '#38a169', taxDeductible: true, type: 'business' },
            { name: 'Professional Services', color: '#9f7aea', taxDeductible: true, type: 'business' },
            { name: 'Office Supplies', color: '#d69e2e', taxDeductible: true, type: 'business' },
            { name: 'Travel & Transportation', color: '#f56565', taxDeductible: true, type: 'business' },
            { name: 'Training & Education', color: '#48bb78', taxDeductible: true, type: 'business' },
            { name: 'Insurance', color: '#ed8936', taxDeductible: true, type: 'business' },
            { name: 'Equipment & Software', color: '#9f7aea', taxDeductible: true, type: 'business' },
            
            // Personal & Lifestyle
            { name: 'Personal Care', color: '#f56565', taxDeductible: false, type: 'personal' },
            { name: 'Entertainment', color: '#ed8936', taxDeductible: false, type: 'personal' },
            { name: 'Shopping', color: '#9f7aea', taxDeductible: false, type: 'personal' },
            { name: 'Dining Out', color: '#48bb78', taxDeductible: false, type: 'personal' },
            { name: 'Hobbies & Recreation', color: '#4299e1', taxDeductible: false, type: 'personal' },
            { name: 'Gifts & Donations', color: '#38a169', taxDeductible: false, type: 'personal' },
            
            // Health & Medical
            { name: 'Medical & Health', color: '#38a169', taxDeductible: true, type: 'health' },
            { name: 'Pharmacy', color: '#48bb78', taxDeductible: true, type: 'health' },
            { name: 'Fitness & Wellness', color: '#4299e1', taxDeductible: false, type: 'health' },
            { name: 'Dental & Vision', color: '#9f7aea', taxDeductible: true, type: 'health' },
            
            // Home & Utilities
            { name: 'Rent & Mortgage', color: '#f56565', taxDeductible: false, type: 'home' },
            { name: 'Utilities', color: '#ed8936', taxDeductible: false, type: 'home' },
            { name: 'Home Maintenance', color: '#48bb78', taxDeductible: false, type: 'home' },
            { name: 'Home Improvements', color: '#4299e1', taxDeductible: false, type: 'home' },
            { name: 'Property Tax', color: '#38a169', taxDeductible: true, type: 'home' },
            
            // Transportation
            { name: 'Fuel & Gas', color: '#ed8936', taxDeductible: false, type: 'transport' },
            { name: 'Vehicle Maintenance', color: '#48bb78', taxDeductible: false, type: 'transport' },
            { name: 'Public Transportation', color: '#4299e1', taxDeductible: false, type: 'transport' },
            { name: 'Vehicle Insurance', color: '#38a169', taxDeductible: false, type: 'transport' },
            
            // Financial
            { name: 'Banking Fees', color: '#718096', taxDeductible: false, type: 'financial' },
            { name: 'Investment Expenses', color: '#4299e1', taxDeductible: true, type: 'financial' },
            { name: 'Loan Payments', color: '#f56565', taxDeductible: false, type: 'financial' },
            { name: 'Tax Preparation', color: '#38a169', taxDeductible: true, type: 'financial' }
        ];
        this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
        this.init();
    }
    
    getDefaultAccounts() {
        return {
            checking: { name: 'Checking Account', type: 'checking', balance: 0, currency: 'USD' },
            savings: { name: 'Savings Account', type: 'savings', balance: 0, currency: 'USD' },
            credit: { name: 'Credit Card', type: 'credit', balance: 0, currency: 'USD' },
            cash: { name: 'Cash Wallet', type: 'cash', balance: 0, currency: 'USD' }
        };
    }

    getDefaultSettings() {
        return {
            profile: {
                fullName: '',
                email: '',
                businessName: '',
                taxId: '',
                currency: 'USD',
                dateFormat: 'MM/DD/YYYY',
                company: 'Paksa IT Solutions'
            },
            tax: {
                defaultTaxRate: 22,
                taxYear: new Date().getFullYear(),
                filingStatus: 'single',
                stateTaxRate: 0,
                autoCategorize: true,
                taxNotifications: true,
                standardDeductionOptimizer: true
            },
            app: {
                darkMode: false,
                autoSave: true,
                spendingInsights: true,
                soundNotifications: true,
                compactMode: false,
                defaultCurrency: 'USD',
                dateFormat: 'MM/DD/YYYY',
                timeZone: 'local',
                language: 'en',
                theme: 'professional'
            },
            export: {
                defaultFormat: 'csv',
                includeReceipts: false,
                includeSummary: true,
                dateRange: 'yearly',
                autoTaxReports: true
            },
            accounts: {
                defaultAccount: 'checking',
                trackTransfers: true,
                reconcileAccounts: true
            }
        };
    }

    init() {
        this.setupEventListeners();
        this.loadPageContent();
        this.updateTotals();
        this.initializeAnimations();
    }

    setupEventListeners() {
        // Form submission
        const expenseForm = document.getElementById('expenseForm');
        if (expenseForm) {
            expenseForm.addEventListener('submit', (e) => this.handleExpenseSubmit(e));
        }

        // Filter and search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterExpenses(e.target.value));
        }

        // Category filters
        const categoryFilters = document.querySelectorAll('.category-filter');
        categoryFilters.forEach(filter => {
            filter.addEventListener('click', (e) => this.toggleCategoryFilter(e.target));
        });

        // Date range picker
        const dateRange = document.getElementById('dateRange');
        if (dateRange) {
            dateRange.addEventListener('change', (e) => this.filterByDateRange(e.target.value));
        }

        // Export functionality
        const exportButtons = document.querySelectorAll('.export-btn');
        exportButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleExport(e.target.dataset.format));
        });

        // Settings and category management
        const categoryForm = document.getElementById('categoryForm');
        if (categoryForm) {
            categoryForm.addEventListener('submit', (e) => this.handleCategorySubmit(e));
        }
    }

    loadPageContent() {
        switch(this.currentPage) {
            case 'index.html':
            case '':
                this.loadDashboard();
                break;
            case 'analytics.html':
                this.loadAnalytics();
                break;
            case 'settings.html':
                this.loadSettings();
                break;
            case 'export.html':
                this.loadExport();
                break;
        }
    }

    loadDashboard() {
        this.renderExpenseList();
        this.populateCategorySelect();
        this.updateSummaryCards();
        this.initializeQuickStats();
    }

    handleExpenseSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const expense = {
            id: Date.now().toString(),
            date: formData.get('date') || new Date().toISOString().split('T')[0],
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category'),
            description: formData.get('description'),
            taxDeductible: formData.get('taxDeductible') === 'true',
            taxAmount: parseFloat(formData.get('taxAmount')) || 0,
            paymentMethod: formData.get('paymentMethod') || 'cash',
            account: formData.get('account') || this.settings.accounts.defaultAccount,
            tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
            receipt: formData.get('receipt') || null,
            vendor: formData.get('vendor') || '',
            project: formData.get('project') || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (this.validateExpense(expense)) {
            this.addExpense(expense);
            this.updateAccountBalance(expense.account, -expense.amount);
            e.target.reset();
            this.showSuccessMessage('Expense added successfully!');
            this.animateNewExpense();
        }
    }

    validateExpense(expense) {
        if (!expense.amount || expense.amount <= 0) {
            this.showErrorMessage('Please enter a valid amount');
            return false;
        }
        if (!expense.category) {
            this.showErrorMessage('Please select a category');
            return false;
        }
        return true;
    }

    addExpense(expense) {
        this.expenses.unshift(expense);
        this.saveToStorage();
        this.renderExpenseList();
        this.updateTotals();
        this.updateSummaryCards();
    }

    deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            const expense = this.expenses.find(exp => exp.id === id);
            if (expense) {
                this.updateAccountBalance(expense.account, expense.amount);
            }
            this.expenses = this.expenses.filter(expense => expense.id !== id);
            this.saveToStorage();
            this.renderExpenseList();
            this.updateTotals();
            this.updateSummaryCards();
            this.showSuccessMessage('Expense deleted successfully!');
        }
    }

    updateAccountBalance(accountId, amount) {
        if (this.accounts[accountId]) {
            this.accounts[accountId].balance += amount;
            this.saveAccountsToStorage();
        }
    }

    saveAccountsToStorage() {
        localStorage.setItem('paksa_accounts', JSON.stringify(this.accounts));
    }

    editExpense(id) {
        const expense = this.expenses.find(exp => exp.id === id);
        if (expense) {
            this.populateForm(expense);
            this.deleteExpense(id);
        }
    }

    populateForm(expense) {
        const form = document.getElementById('expenseForm');
        if (form) {
            form.querySelector('[name="date"]').value = expense.date;
            form.querySelector('[name="amount"]').value = expense.amount;
            form.querySelector('[name="category"]').value = expense.category;
            form.querySelector('[name="description"]').value = expense.description;
            form.querySelector('[name="taxAmount"]').value = expense.taxAmount;
            form.querySelector('[name="paymentMethod"]').value = expense.paymentMethod;
        }
    }

    renderExpenseList(filteredExpenses = null) {
        const expenseList = document.getElementById('expenseList');
        if (!expenseList) return;

        const expenses = filteredExpenses || this.expenses;
        
        if (expenses.length === 0) {
            expenseList.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-gray-400 text-6xl mb-4">💸</div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No expenses recorded yet</h3>
                    <p class="text-gray-500">Start tracking your expenses to see them here</p>
                </div>
            `;
            return;
        }

        expenseList.innerHTML = expenses.map(expense => `
            <div class="expense-item bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200" data-id="${expense.id}">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <span class="category-badge px-3 py-1 rounded-full text-xs font-medium" style="background-color: ${this.getCategoryColor(expense.category)}20; color: ${this.getCategoryColor(expense.category)}">
                                ${expense.category}
                            </span>
                            <span class="text-sm text-gray-500">${this.formatDate(expense.date)}</span>
                            ${expense.taxDeductible ? '<span class="tax-badge bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Tax Deductible</span>' : ''}
                        </div>
                        <h4 class="font-medium text-gray-900 mb-1">${expense.description || 'No description'}</h4>
                        <div class="flex items-center gap-4 text-sm text-gray-600">
                            <span>Amount: <strong>$${expense.amount.toFixed(2)}</strong></span>
                            ${expense.taxAmount > 0 ? `<span>Tax: $${expense.taxAmount.toFixed(2)}</span>` : ''}
                            <span>Method: ${expense.paymentMethod}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="expenseTracker.editExpense('${expense.id}')" class="edit-btn p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button onclick="expenseTracker.deleteExpense('${expense.id}')" class="delete-btn p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        this.animateExpenseList();
    }

    filterExpenses(searchTerm) {
        const filtered = this.expenses.filter(expense => 
            expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.amount.toString().includes(searchTerm)
        );
        this.renderExpenseList(filtered);
    }

    toggleCategoryFilter(element) {
        element.classList.toggle('active');
        const selectedCategories = Array.from(document.querySelectorAll('.category-filter.active'))
            .map(el => el.dataset.category);
        
        if (selectedCategories.length === 0) {
            this.renderExpenseList();
        } else {
            const filtered = this.expenses.filter(expense => 
                selectedCategories.includes(expense.category)
            );
            this.renderExpenseList(filtered);
        }
    }

    updateTotals() {
        const totalExpenses = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const taxDeductible = this.expenses
            .filter(expense => expense.taxDeductible)
            .reduce((sum, expense) => sum + expense.amount, 0);
        const totalTax = this.expenses.reduce((sum, expense) => sum + (expense.taxAmount || 0), 0);

        // Update summary cards
        const totalElement = document.getElementById('totalExpenses');
        const deductibleElement = document.getElementById('taxDeductible');
        const taxElement = document.getElementById('totalTax');

        if (totalElement) totalElement.textContent = `$${totalExpenses.toFixed(2)}`;
        if (deductibleElement) deductibleElement.textContent = `$${taxDeductible.toFixed(2)}`;
        if (taxElement) taxElement.textContent = `$${totalTax.toFixed(2)}`;

        this.animateNumbers();
    }

    updateSummaryCards() {
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        
        const monthlyExpenses = this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear;
        });

        const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const monthlyDeductible = monthlyExpenses
            .filter(expense => expense.taxDeductible)
            .reduce((sum, expense) => sum + expense.amount, 0);

        const monthlyElement = document.getElementById('monthlyTotal');
        const monthlyDeductibleElement = document.getElementById('monthlyDeductible');

        if (monthlyElement) monthlyElement.textContent = `$${monthlyTotal.toFixed(2)}`;
        if (monthlyDeductibleElement) monthlyDeductibleElement.textContent = `$${monthlyDeductible.toFixed(2)}`;
    }

    populateCategorySelect() {
        const select = document.getElementById('categorySelect');
        if (!select) return;

        select.innerHTML = this.categories.map(category => 
            `<option value="${category.name}" style="color: ${category.color}">${category.name}</option>`
        ).join('');
    }

    getCategoryColor(categoryName) {
        const category = this.categories.find(cat => cat.name === categoryName);
        return category ? category.color : '#718096';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    }

    saveToStorage() {
        localStorage.setItem('paksa_expenses', JSON.stringify(this.expenses));
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    initializeAnimations() {
        // Initialize Anime.js animations
        if (typeof anime !== 'undefined') {
            this.animatePageLoad();
        }
    }

    animatePageLoad() {
        anime({
            targets: '.animate-on-load',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(100),
            duration: 600,
            easing: 'easeOutQuart'
        });
    }

    animateNewExpense() {
        const firstItem = document.querySelector('.expense-item');
        if (firstItem && typeof anime !== 'undefined') {
            anime({
                targets: firstItem,
                scale: [0.9, 1],
                opacity: [0, 1],
                duration: 400,
                easing: 'easeOutBack'
            });
        }
    }

    animateExpenseList() {
        if (typeof anime !== 'undefined') {
            anime({
                targets: '.expense-item',
                opacity: [0, 1],
                translateX: [-20, 0],
                delay: anime.stagger(50),
                duration: 300,
                easing: 'easeOutQuart'
            });
        }
    }

    animateNumbers() {
        const numberElements = document.querySelectorAll('[id$="Total"], [id$="Expenses"], [id$="Tax"], [id$="Deductible"]');
        
        if (typeof anime !== 'undefined') {
            anime({
                targets: numberElements,
                scale: [1.1, 1],
                duration: 300,
                easing: 'easeOutBack'
            });
        }
    }

    initializeQuickStats() {
        // Initialize typewriter effect for hero text
        if (typeof Typed !== 'undefined') {
            const heroText = document.getElementById('heroTypedText');
            if (heroText) {
                new Typed('#heroTypedText', {
                    strings: [
                        'Track your daily expenses',
                        'Maximize tax deductions',
                        'Organize financial records',
                        'Prepare for tax season'
                    ],
                    typeSpeed: 50,
                    backSpeed: 30,
                    backDelay: 2000,
                    loop: true
                });
            }
        }
    }

    // Export functionality
    handleExport(format, options = {}) {
        const exportOptions = {
            dateRange: options.dateRange || { start: null, end: null },
            categories: options.categories || [],
            includeTaxDeductible: options.includeTaxDeductible !== false,
            includeReceipts: options.includeReceipts || false,
            includeSummary: options.includeSummary !== false,
            ...options
        };

        // Filter expenses based on options
        let expensesToExport = this.expenses;
        
        if (exportOptions.dateRange.start && exportOptions.dateRange.end) {
            expensesToExport = expensesToExport.filter(expense => 
                expense.date >= exportOptions.dateRange.start && 
                expense.date <= exportOptions.dateRange.end
            );
        }
        
        if (exportOptions.categories && exportOptions.categories.length > 0 && !exportOptions.categories.includes('all')) {
            expensesToExport = expensesToExport.filter(expense => 
                exportOptions.categories.includes(expense.category)
            );
        }
        
        if (exportOptions.includeTaxDeductible) {
            expensesToExport = expensesToExport.filter(expense => expense.taxDeductible);
        }

        switch(format) {
            case 'csv':
                this.exportToCSV(expensesToExport, exportOptions);
                break;
            case 'json':
                this.exportToJSON(expensesToExport, exportOptions);
                break;
            case 'pdf':
                this.exportToPDF(expensesToExport, exportOptions);
                break;
            case 'xml':
                this.exportToXML(expensesToExport, exportOptions);
                break;
        }
    }

    exportToCSV(expenses, options) {
        const headers = [
            'Date', 
            'Amount', 
            'Category', 
            'Description', 
            'Tax Deductible', 
            'Tax Amount', 
            'Payment Method',
            'Created At'
        ];
        
        const csvContent = [
            headers.join(','),
            ...expenses.map(expense => [
                expense.date,
                expense.amount,
                expense.category,
                `"${expense.description || ''}"`,
                expense.taxDeductible ? 'Yes' : 'No',
                expense.taxAmount || 0,
                expense.paymentMethod,
                expense.createdAt
            ].join(','))
        ].join('\n');

        const filename = this.generateFilename('csv', options);
        this.downloadFile(csvContent, filename, 'text/csv');
        this.showSuccessMessage('CSV export completed successfully!');
    }

    exportToJSON(expenses, options) {
        const exportData = {
            expenses: expenses,
            summary: this.generateExportSummary(expenses),
            settings: this.settings,
            exportDate: new Date().toISOString(),
            totalRecords: expenses.length
        };
        
        const jsonContent = JSON.stringify(exportData, null, 2);
        const filename = this.generateFilename('json', options);
        this.downloadFile(jsonContent, filename, 'application/json');
        this.showSuccessMessage('JSON export completed successfully!');
    }

    exportToPDF(expenses, options) {
        // Create a comprehensive PDF report
        const reportContent = this.generatePDFReport(expenses, options);
        const htmlContent = this.generateHTMLReport(expenses, options);
        
        // For now, create an HTML report that can be printed to PDF
        const newWindow = window.open('', '_blank');
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        
        this.showSuccessMessage('PDF report generated successfully!');
    }

    exportToXML(expenses, options) {
        let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xmlContent += '<expense-report>\n';
        xmlContent += '  <metadata>\n';
        xmlContent += `    <export-date>${new Date().toISOString()}</export-date>\n`;
        xmlContent += `    <total-records>${expenses.length}</total-records>\n`;
        xmlContent += `    <total-amount>${expenses.reduce((sum, exp) => sum + exp.amount, 0)}</total-amount>\n`;
        xmlContent += '  </metadata>\n';
        xmlContent += '  <expenses>\n';
        
        expenses.forEach(expense => {
            xmlContent += '    <expense>\n';
            Object.entries(expense).forEach(([key, value]) => {
                xmlContent += `      <${key}>${value}</${key}>\n`;
            });
            xmlContent += '    </expense>\n';
        });
        
        xmlContent += '  </expenses>\n';
        
        if (options.includeSummary) {
            xmlContent += '  <summary>\n';
            const summary = this.generateExportSummary(expenses);
            Object.entries(summary).forEach(([key, value]) => {
                xmlContent += `    <${key}>${value}</${key}>\n`;
            });
            xmlContent += '  </summary>\n';
        }
        
        xmlContent += '</expense-report>';
        
        const filename = this.generateFilename('xml', options);
        this.downloadFile(xmlContent, filename, 'application/xml');
        this.showSuccessMessage('XML export completed successfully!');
    }

    generateExportSummary(expenses) {
        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const taxDeductibleAmount = expenses
            .filter(expense => expense.taxDeductible)
            .reduce((sum, expense) => sum + expense.amount, 0);
        const totalTaxAmount = expenses.reduce((sum, expense) => sum + (expense.taxAmount || 0), 0);
        
        return {
            totalRecords: expenses.length,
            totalAmount: totalAmount,
            taxDeductibleAmount: taxDeductibleAmount,
            totalTaxAmount: totalTaxAmount,
            estimatedTaxSavings: taxDeductibleAmount * (this.settings.tax.defaultTaxRate / 100),
            dateRange: {
                start: expenses.length > 0 ? Math.min(...expenses.map(e => e.date)) : null,
                end: expenses.length > 0 ? Math.max(...expenses.map(e => e.date)) : null
            }
        };
    }

    generatePDFReport(expenses, options) {
        const summary = this.generateExportSummary(expenses);
        
        return {
            title: 'ExpenseTracker Pro - Tax Report',
            generatedDate: new Date().toISOString(),
            summary: summary,
            expenses: expenses,
            settings: this.settings
        };
    }

    generateHTMLReport(expenses, options) {
        const summary = this.generateExportSummary(expenses);
        
        return `
<!DOCTYPE html>
<html>
<head>
    <title>ExpenseTracker Pro - Tax Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #4299e1; padding-bottom: 20px; }
        .summary { background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .expense-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .expense-table th, .expense-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .expense-table th { background-color: #4299e1; color: white; }
        .footer { margin-top: 40px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>ExpenseTracker Pro</h1>
        <h2>Tax Deductible Expenses Report</h2>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="summary">
        <h3>Summary</h3>
        <p><strong>Total Records:</strong> ${summary.totalRecords}</p>
        <p><strong>Total Amount:</strong> $${summary.totalAmount.toFixed(2)}</p>
        <p><strong>Tax Deductible Amount:</strong> $${summary.taxDeductibleAmount.toFixed(2)}</p>
        <p><strong>Estimated Tax Savings:</strong> $${summary.estimatedTaxSavings.toFixed(2)}</p>
        <p><strong>Report Period:</strong> ${summary.dateRange.start} to ${summary.dateRange.end}</p>
    </div>
    
    <table class="expense-table">
        <thead>
            <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Description</th>
                <th>Tax Amount</th>
            </tr>
        </thead>
        <tbody>
            ${expenses.map(expense => `
                <tr>
                    <td>${expense.date}</td>
                    <td>$${expense.amount.toFixed(2)}</td>
                    <td>${expense.category}</td>
                    <td>${expense.description || ''}</td>
                    <td>$${(expense.taxAmount || 0).toFixed(2)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="footer">
        <p>This report was generated by ExpenseTracker Pro</p>
        <p>For tax preparation purposes - please consult with a tax professional</p>
    </div>
</body>
</html>
        `;
    }

    generateFilename(format, options) {
        const date = new Date().toISOString().split('T')[0];
        const prefix = options.taxReport ? 'tax-report' : 'expenses';
        return `${prefix}-${date}.${format}`;
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Analytics functionality
    loadAnalytics() {
        this.renderCharts();
        this.updateAnalyticsSummary();
    }

    renderCharts() {
        if (typeof echarts !== 'undefined') {
            this.renderExpenseChart();
            this.renderCategoryChart();
            this.renderTaxChart();
        }
    }

    renderExpenseChart() {
        const chartDom = document.getElementById('expenseChart');
        if (!chartDom) return;

        const myChart = echarts.init(chartDom);
        const monthlyData = this.getMonthlyData();

        const option = {
            title: {
                text: 'Monthly Expenses',
                textStyle: { color: '#1a365d', fontSize: 16, fontWeight: 'bold' }
            },
            tooltip: { trigger: 'axis' },
            xAxis: {
                type: 'category',
                data: monthlyData.months
            },
            yAxis: { type: 'value' },
            series: [{
                data: monthlyData.amounts,
                type: 'line',
                smooth: true,
                itemStyle: { color: '#4299e1' },
                areaStyle: { color: 'rgba(66, 153, 225, 0.1)' }
            }]
        };

        myChart.setOption(option);
    }

    renderCategoryChart() {
        const chartDom = document.getElementById('categoryChart');
        if (!chartDom) return;

        const myChart = echarts.init(chartDom);
        const categoryData = this.getCategoryData();

        const option = {
            title: {
                text: 'Expenses by Category',
                textStyle: { color: '#1a365d', fontSize: 16, fontWeight: 'bold' }
            },
            tooltip: { trigger: 'item' },
            series: [{
                type: 'pie',
                radius: '70%',
                data: categoryData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };

        myChart.setOption(option);
    }

    renderTaxChart() {
        const chartDom = document.getElementById('taxChart');
        if (!chartDom) return;

        const myChart = echarts.init(chartDom);
        const taxData = this.getTaxData();

        const option = {
            title: {
                text: 'Tax Deductible vs Non-Deductible',
                textStyle: { color: '#1a365d', fontSize: 16, fontWeight: 'bold' }
            },
            tooltip: { trigger: 'item' },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                data: taxData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };

        myChart.setOption(option);
    }

    getMonthlyData() {
        const monthlyTotals = {};
        
        this.expenses.forEach(expense => {
            const month = expense.date.substring(0, 7); // YYYY-MM
            monthlyTotals[month] = (monthlyTotals[month] || 0) + expense.amount;
        });

        const months = Object.keys(monthlyTotals).sort();
        const amounts = months.map(month => monthlyTotals[month]);

        return { months, amounts };
    }

    getCategoryData() {
        const categoryTotals = {};
        
        this.expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });

        return Object.entries(categoryTotals).map(([category, amount]) => ({
            name: category,
            value: amount,
            itemStyle: { color: this.getCategoryColor(category) }
        }));
    }

    getTaxData() {
        const deductible = this.expenses
            .filter(expense => expense.taxDeductible)
            .reduce((sum, expense) => sum + expense.amount, 0);
        
        const nonDeductible = this.expenses
            .filter(expense => !expense.taxDeductible)
            .reduce((sum, expense) => sum + expense.amount, 0);

        return [
            { name: 'Tax Deductible', value: deductible, itemStyle: { color: '#38a169' } },
            { name: 'Non-Deductible', value: nonDeductible, itemStyle: { color: '#718096' } }
        ];
    }

    updateAnalyticsSummary() {
        const totalExpenses = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const taxDeductible = this.expenses
            .filter(expense => expense.taxDeductible)
            .reduce((sum, expense) => sum + expense.amount, 0);
        const estimatedTaxSavings = taxDeductible * 0.22; // Assuming 22% tax rate

        const summaryElement = document.getElementById('analyticsSummary');
        if (summaryElement) {
            summaryElement.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Total Expenses</h3>
                        <p class="text-3xl font-bold text-blue-600">$${totalExpenses.toFixed(2)}</p>
                    </div>
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Tax Deductible</h3>
                        <p class="text-3xl font-bold text-green-600">$${taxDeductible.toFixed(2)}</p>
                    </div>
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Est. Tax Savings</h3>
                        <p class="text-3xl font-bold text-purple-600">$${estimatedTaxSavings.toFixed(2)}</p>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.expenseTracker = new PaksaExpenseTracker();
});

// Utility functions for responsive design and interactions
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}