// Daily Expenses Record App - Core JavaScript
class PaksaExpenseTracker {
    constructor() {
        this.db = new PaksaDB();
        this.expenses = [];
        this.income = [];
        this.accounts = JSON.parse(localStorage.getItem('paksa_accounts')) || this.getDefaultAccounts();
        this.settings = JSON.parse(localStorage.getItem('paksa_settings')) || this.getDefaultSettings();
        this.budgets = JSON.parse(localStorage.getItem('paksa_budgets')) || this.getDefaultBudgets();
        this.isOnline = navigator.onLine;
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
        this.loadStoredCategories();
        this.initDB();
    }
    
    async initDB() {
        try {
            await this.db.init();
            await this.loadDataFromDB();
            this.init();
        } catch (error) {
            console.warn('IndexedDB not available, using localStorage:', error);
            this.loadDataFromLocalStorage();
            this.init();
        }
    }
    
    async loadDataFromDB() {
        try {
            this.expenses = await this.db.getAllExpenses() || [];
            this.income = await this.db.getAllIncome() || [];
            
            if (this.expenses.length === 0) {
                const sampleExpenses = this.getSampleExpenses();
                for (const expense of sampleExpenses) {
                    await this.db.addExpense(expense);
                }
                this.expenses = sampleExpenses;
            }
            
            if (this.income.length === 0) {
                const sampleIncome = this.getSampleIncome();
                for (const income of sampleIncome) {
                    await this.db.addIncome(income);
                }
                this.income = sampleIncome;
            }
        } catch (error) {
            console.error('Error loading from DB:', error);
        }
    }
    
    loadDataFromLocalStorage() {
        this.expenses = JSON.parse(localStorage.getItem('paksa_expenses')) || this.getSampleExpenses();
        this.income = JSON.parse(localStorage.getItem('paksa_income')) || this.getSampleIncome();
        
        if (this.expenses.length > 0 && !localStorage.getItem('paksa_expenses')) {
            this.saveToStorage();
        }
        if (this.income.length > 0 && !localStorage.getItem('paksa_income')) {
            this.saveIncomeToStorage();
        }
    }
    
    loadStoredCategories() {
        const storedCategories = localStorage.getItem('paksa_categories');
        if (storedCategories) {
            const customCategories = JSON.parse(storedCategories);
            this.categories = [...this.categories, ...customCategories.filter(cat => cat.type === 'custom')];
        }
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

    getSampleExpenses() {
        const today = new Date();
        const thisMonth = today.getMonth();
        const thisYear = today.getFullYear();
        
        return [
            {
                id: '1',
                date: new Date(thisYear, thisMonth, today.getDate() - 1).toISOString().split('T')[0],
                amount: 45.99,
                category: 'Business Operations',
                description: 'Office supplies and stationery',
                taxDeductible: true,
                taxAmount: 10.12,
                paymentMethod: 'credit',
                account: 'checking',
                tags: ['business', 'office'],
                vendor: 'Office Depot',
                project: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '2',
                date: new Date(thisYear, thisMonth, today.getDate() - 2).toISOString().split('T')[0],
                amount: 125.50,
                category: 'Medical & Health',
                description: 'Doctor consultation and prescription',
                taxDeductible: true,
                taxAmount: 27.61,
                paymentMethod: 'debit',
                account: 'checking',
                tags: ['medical', 'health'],
                vendor: 'City Medical Center',
                project: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '3',
                date: new Date(thisYear, thisMonth, today.getDate() - 3).toISOString().split('T')[0],
                amount: 89.25,
                category: 'Travel & Transportation',
                description: 'Business trip - gas and parking',
                taxDeductible: true,
                taxAmount: 19.64,
                paymentMethod: 'credit',
                account: 'credit',
                tags: ['business', 'travel'],
                vendor: 'Shell Gas Station',
                project: 'Client Meeting',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '4',
                date: new Date(thisYear, thisMonth, today.getDate() - 4).toISOString().split('T')[0],
                amount: 32.75,
                category: 'Dining Out',
                description: 'Lunch with family',
                taxDeductible: false,
                taxAmount: 0,
                paymentMethod: 'cash',
                account: 'cash',
                tags: ['personal', 'food'],
                vendor: 'Local Restaurant',
                project: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '5',
                date: new Date(thisYear, thisMonth, today.getDate() - 5).toISOString().split('T')[0],
                amount: 199.99,
                category: 'Equipment & Software',
                description: 'Software license renewal',
                taxDeductible: true,
                taxAmount: 44.00,
                paymentMethod: 'credit',
                account: 'credit',
                tags: ['business', 'software'],
                vendor: 'Adobe Systems',
                project: 'Business Operations',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
    }

    getSampleIncome() {
        const today = new Date();
        const thisMonth = today.getMonth();
        const thisYear = today.getFullYear();
        
        return [
            {
                id: 'inc1',
                date: new Date(thisYear, thisMonth, 1).toISOString().split('T')[0],
                amount: 5000.00,
                source: 'Salary',
                description: 'Monthly salary payment',
                category: 'Employment',
                taxable: true,
                account: 'checking',
                createdAt: new Date().toISOString()
            },
            {
                id: 'inc2',
                date: new Date(thisYear, thisMonth, 15).toISOString().split('T')[0],
                amount: 1200.00,
                source: 'Freelance Project',
                description: 'Web development project',
                category: 'Business',
                taxable: true,
                account: 'checking',
                createdAt: new Date().toISOString()
            }
        ];
    }

    getDefaultBudgets() {
        return {
            monthly: {
                'Business Operations': 500,
                'Medical & Health': 300,
                'Travel & Transportation': 400,
                'Dining Out': 200,
                'Entertainment': 150
            },
            totalMonthly: 2000
        };
    }

    init() {
        try {
            this.setupEventListeners();
            this.loadPageContent();
            this.updateTotals();
            this.initializeAnimations();
            this.setupPerformanceOptimizations();
            this.initializeAdvancedFeatures();
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showErrorMessage('Application failed to initialize. Please refresh the page.');
        }
    }

    setupEventListeners() {
        // Form submission
        const expenseForm = document.getElementById('expenseForm');
        if (expenseForm) {
            expenseForm.addEventListener('submit', (e) => this.handleExpenseSubmit(e));
        }

        const incomeForm = document.getElementById('incomeForm');
        if (incomeForm) {
            incomeForm.addEventListener('submit', (e) => this.handleIncomeSubmit(e));
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

        // Mobile menu toggle
        const mobileMenuBtn = document.querySelector('[onclick="toggleMobileMenu()"]');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', this.toggleMobileMenu);
        }
    }

    loadPageContent() {
        try {
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
                case 'budget.html':
                    this.loadBudgetPage();
                    break;
            }
        } catch (error) {
            console.error('Error loading page content:', error);
        }
    }

    loadSettings() {
        this.loadUserSettings();
        this.renderCategoryList();
        this.initializeSettingsForm();
    }

    loadUserSettings() {
        const savedSettings = localStorage.getItem('paksa_settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
    }

    initializeSettingsForm() {
        // Load existing settings into form fields
        if (this.settings.profile) {
            const fullNameField = document.getElementById('fullName');
            const emailField = document.getElementById('email');
            const businessNameField = document.getElementById('businessName');
            const taxIdField = document.getElementById('taxId');
            
            if (fullNameField) fullNameField.value = this.settings.profile.fullName || '';
            if (emailField) emailField.value = this.settings.profile.email || '';
            if (businessNameField) businessNameField.value = this.settings.profile.businessName || '';
            if (taxIdField) taxIdField.value = this.settings.profile.taxId || '';
        }

        // Load tax settings
        if (this.settings.tax) {
            const taxRateField = document.getElementById('defaultTaxRate');
            const taxYearField = document.getElementById('taxYear');
            const filingStatusField = document.getElementById('filingStatus');
            
            if (taxRateField) taxRateField.value = this.settings.tax.defaultTaxRate || 22;
            if (taxYearField) taxYearField.value = this.settings.tax.taxYear || new Date().getFullYear();
            if (filingStatusField) filingStatusField.value = this.settings.tax.filingStatus || 'single';
        }

        // Load app preferences
        if (this.settings.app) {
            const currencyField = document.getElementById('defaultCurrency');
            const dateFormatField = document.getElementById('dateFormat');
            const darkModeField = document.getElementById('darkMode');
            
            if (currencyField) currencyField.value = this.settings.app.defaultCurrency || 'USD';
            if (dateFormatField) dateFormatField.value = this.settings.app.dateFormat || 'MM/DD/YYYY';
            if (darkModeField) darkModeField.checked = this.settings.app.darkMode || false;
        }
    }

    loadExport() {
        this.updateExportSummary();
        this.initializeExportOptions();
    }

    updateExportSummary() {
        const totalRecords = this.expenses.length;
        const totalAmount = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const taxDeductible = this.expenses
            .filter(expense => expense.taxDeductible)
            .reduce((sum, expense) => sum + expense.amount, 0);
        const taxSavings = taxDeductible * (this.settings.tax.defaultTaxRate / 100);

        const totalRecordsEl = document.getElementById('totalRecords');
        const totalAmountEl = document.getElementById('totalAmount');
        const taxDeductibleAmountEl = document.getElementById('taxDeductibleAmount');
        const taxSavingsAmountEl = document.getElementById('taxSavingsAmount');

        if (totalRecordsEl) totalRecordsEl.textContent = totalRecords;
        if (totalAmountEl) totalAmountEl.textContent = this.formatCurrency(totalAmount);
        if (taxDeductibleAmountEl) taxDeductibleAmountEl.textContent = this.formatCurrency(taxDeductible);
        if (taxSavingsAmountEl) taxSavingsAmountEl.textContent = this.formatCurrency(taxSavings);
    }

    initializeExportOptions() {
        // Set default date range to current year
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), 0, 1);
        
        const startDateEl = document.getElementById('startDate');
        const endDateEl = document.getElementById('endDate');
        
        if (startDateEl) startDateEl.value = firstDay.toISOString().split('T')[0];
        if (endDateEl) endDateEl.value = today.toISOString().split('T')[0];
    }

    loadDashboard() {
        this.renderExpenseList();
        this.populateCategorySelect();
        this.updateSummaryCards();
        this.updateFinancialSummary();
        this.initializeQuickStats();
        this.setTodayDate();
    }

    updateFinancialSummary() {
        const summary = this.getFinancialSummary();
        
        const totalIncomeEl = document.getElementById('totalIncomeDisplay');
        const totalExpensesEl = document.getElementById('totalExpensesDisplay');
        const netWorthEl = document.getElementById('netWorthDisplay');
        const taxSavingsEl = document.getElementById('taxSavingsDisplay');
        
        if (totalIncomeEl) totalIncomeEl.textContent = this.formatCurrency(summary.totalIncome);
        if (totalExpensesEl) totalExpensesEl.textContent = this.formatCurrency(summary.totalExpenses);
        if (netWorthEl) netWorthEl.textContent = this.formatCurrency(summary.netWorth);
        if (taxSavingsEl) taxSavingsEl.textContent = this.formatCurrency(summary.estimatedTaxSavings);
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateField = document.getElementById('date');
        const incomeDateField = document.getElementById('incomeDate');
        
        if (dateField) dateField.value = today;
        if (incomeDateField) incomeDateField.value = today;
    }

    async handleExpenseSubmit(e) {
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
            await this.addExpense(expense);
            this.updateAccountBalance(expense.account, -expense.amount);
            e.target.reset();
            this.setTodayDate();
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

    async addExpense(expense) {
        this.expenses.unshift(expense);
        
        try {
            if (this.db.db) {
                await this.db.addExpense(expense);
            } else {
                this.saveToStorage();
            }
        } catch (error) {
            console.error('Error saving expense:', error);
            this.saveToStorage(); // Fallback
        }
        
        this.renderExpenseList();
        this.updateTotals();
        this.updateSummaryCards();
        this.updateFinancialSummary();
    }

    async handleIncomeSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const income = {
            id: 'inc' + Date.now().toString(),
            date: formData.get('date') || new Date().toISOString().split('T')[0],
            amount: parseFloat(formData.get('amount')),
            source: formData.get('source'),
            description: formData.get('description') || '',
            category: 'Income',
            taxable: true,
            account: 'checking',
            createdAt: new Date().toISOString()
        };

        if (this.validateIncome(income)) {
            await this.addIncome(income);
            e.target.reset();
            this.setTodayDate();
            this.showSuccessMessage('Income added successfully!');
        }
    }

    validateIncome(income) {
        if (!income.amount || income.amount <= 0) {
            this.showErrorMessage('Please enter a valid amount');
            return false;
        }
        if (!income.source) {
            this.showErrorMessage('Please enter income source');
            return false;
        }
        return true;
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
            // Remove from list but don't delete from storage yet
            this.expenses = this.expenses.filter(exp => exp.id !== id);
            this.renderExpenseList();
            this.updateTotals();
            this.updateSummaryCards();
            this.updateFinancialSummary();
            // Restore account balance
            this.updateAccountBalance(expense.account, expense.amount);
        }
    }

    duplicateExpense(id) {
        const expense = this.expenses.find(exp => exp.id === id);
        if (expense) {
            const duplicated = {
                ...expense,
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.addExpense(duplicated);
            this.showSuccessMessage('Expense duplicated successfully!');
        }
    }

    populateForm(expense) {
        const form = document.getElementById('expenseForm');
        if (form) {
            form.querySelector('[name="date"]').value = expense.date;
            form.querySelector('[name="amount"]').value = expense.amount;
            form.querySelector('[name="category"]').value = expense.category;
            form.querySelector('[name="description"]').value = expense.description || '';
            form.querySelector('[name="taxAmount"]').value = expense.taxAmount || 0;
            form.querySelector('[name="paymentMethod"]').value = expense.paymentMethod;
            form.querySelector('[name="account"]').value = expense.account;
            form.querySelector('[name="vendor"]').value = expense.vendor || '';
            form.querySelector('[name="project"]').value = expense.project || '';
            form.querySelector('[name="tags"]').value = expense.tags ? expense.tags.join(', ') : '';
            form.querySelector('[name="taxDeductible"]').checked = expense.taxDeductible;
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
                            ${expense.vendor ? `<span>Vendor: ${expense.vendor}</span>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="expenseTracker.editExpense('${expense.id}')" class="edit-btn p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit expense">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button onclick="expenseTracker.duplicateExpense('${expense.id}')" class="duplicate-btn p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Duplicate expense">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                        </button>
                        <button onclick="expenseTracker.deleteExpense('${expense.id}')" class="delete-btn p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete expense">
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
        if (!searchTerm.trim()) {
            this.renderExpenseList();
            return;
        }
        
        const filtered = this.expenses.filter(expense => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (expense.description && expense.description.toLowerCase().includes(searchLower)) ||
                (expense.category && expense.category.toLowerCase().includes(searchLower)) ||
                (expense.vendor && expense.vendor.toLowerCase().includes(searchLower)) ||
                (expense.project && expense.project.toLowerCase().includes(searchLower)) ||
                expense.amount.toString().includes(searchTerm) ||
                (expense.tags && expense.tags.some(tag => tag.toLowerCase().includes(searchLower)))
            );
        });
        
        this.renderExpenseList(filtered);
        
        // Show search results count
        this.showSearchResults(filtered.length, this.expenses.length);
    }
    
    showSearchResults(filteredCount, totalCount) {
        const existingMessage = document.getElementById('searchResults');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        if (filteredCount < totalCount) {
            const message = document.createElement('div');
            message.id = 'searchResults';
            message.className = 'bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-blue-800';
            message.innerHTML = `
                <div class="flex items-center justify-between">
                    <span>Showing ${filteredCount} of ${totalCount} expenses</span>
                    <button onclick="this.parentElement.parentElement.remove(); expenseTracker.renderExpenseList();" class="text-blue-600 hover:text-blue-800">
                        Clear filter
                    </button>
                </div>
            `;
            
            const expenseList = document.getElementById('expenseList');
            if (expenseList) {
                expenseList.parentNode.insertBefore(message, expenseList);
            }
        }
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

        const monthlyIncome = this.income.filter(income => {
            const incomeDate = new Date(income.date);
            return incomeDate.getMonth() === thisMonth && incomeDate.getFullYear() === thisYear;
        });

        const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const monthlyIncomeTotal = monthlyIncome.reduce((sum, income) => sum + income.amount, 0);
        const netIncome = monthlyIncomeTotal - monthlyTotal;
        const monthlyDeductible = monthlyExpenses
            .filter(expense => expense.taxDeductible)
            .reduce((sum, expense) => sum + expense.amount, 0);

        const monthlyElement = document.getElementById('monthlyTotal');
        const monthlyDeductibleElement = document.getElementById('monthlyDeductible');
        const netIncomeElement = document.getElementById('netIncome');

        if (monthlyElement) monthlyElement.textContent = `$${monthlyTotal.toFixed(2)}`;
        if (monthlyDeductibleElement) monthlyDeductibleElement.textContent = `$${monthlyDeductible.toFixed(2)}`;
        if (netIncomeElement) netIncomeElement.textContent = `$${netIncome.toFixed(2)}`;
    }

    async addIncome(income) {
        this.income.unshift(income);
        
        try {
            if (this.db.db) {
                await this.db.addIncome(income);
            } else {
                this.saveIncomeToStorage();
            }
        } catch (error) {
            console.error('Error saving income:', error);
            this.saveIncomeToStorage(); // Fallback
        }
        
        this.updateAccountBalance(income.account, income.amount);
        this.updateSummaryCards();
        this.updateFinancialSummary();
    }

    saveIncomeToStorage() {
        localStorage.setItem('paksa_income', JSON.stringify(this.income));
    }

    getFinancialSummary() {
        const totalIncome = this.income.reduce((sum, income) => sum + income.amount, 0);
        const totalExpenses = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const netWorth = totalIncome - totalExpenses;
        const taxableIncome = this.income.filter(inc => inc.taxable).reduce((sum, inc) => sum + inc.amount, 0);
        const deductibleExpenses = this.expenses.filter(exp => exp.taxDeductible).reduce((sum, exp) => sum + exp.amount, 0);
        
        return {
            totalIncome,
            totalExpenses,
            netWorth,
            taxableIncome,
            deductibleExpenses,
            estimatedTaxSavings: deductibleExpenses * (this.settings.tax.defaultTaxRate / 100)
        };
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
        this.playNotificationSound('success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
        this.playNotificationSound('error');
    }
    
    showInfoMessage(message) {
        this.showMessage(message, 'info');
    }
    
    showWarningMessage(message) {
        this.showMessage(message, 'warning');
    }

    showMessage(message, type) {
        // Remove existing messages of the same type
        document.querySelectorAll(`.toast-${type}`).forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `toast-${type} fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center space-x-3 max-w-md`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white',
            warning: 'bg-yellow-500 text-black'
        };
        
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            warning: '⚠'
        };
        
        messageDiv.className += ` ${colors[type]}`;
        messageDiv.innerHTML = `
            <span class="text-lg font-bold">${icons[type]}</span>
            <span class="flex-1">${message}</span>
            <button onclick="this.parentElement.remove()" class="text-white hover:text-gray-200">
                ✕
            </button>
        `;
        
        document.body.appendChild(messageDiv);
        
        // Animate in
        if (typeof anime !== 'undefined') {
            anime({
                targets: messageDiv,
                translateX: [300, 0],
                opacity: [0, 1],
                duration: 300,
                easing: 'easeOutQuart'
            });
        }
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: messageDiv,
                        translateX: [0, 300],
                        opacity: [1, 0],
                        duration: 300,
                        easing: 'easeInQuart',
                        complete: () => messageDiv.remove()
                    });
                } else {
                    messageDiv.remove();
                }
            }
        }, 5000);
    }
    
    playNotificationSound(type) {
        if (!this.settings.app.soundNotifications) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            const frequency = type === 'success' ? 800 : 400;
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            // Fallback for browsers that don't support Web Audio API
            console.log('Sound notification not supported');
        }
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

    // Performance optimizations
    setupPerformanceOptimizations() {
        // Debounce search input
        this.debounceSearch = this.debounce((searchTerm) => {
            this.filterExpenses(searchTerm);
        }, 300);
        
        // Lazy load charts
        this.lazyLoadCharts();
        
        // Optimize animations
        this.optimizeAnimations();
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    lazyLoadCharts() {
        if ('IntersectionObserver' in window) {
            const chartObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadChartForElement(entry.target);
                        chartObserver.unobserve(entry.target);
                    }
                });
            });
            
            document.querySelectorAll('[id$="Chart"]').forEach(chart => {
                chartObserver.observe(chart);
            });
        }
    }
    
    loadChartForElement(element) {
        const chartId = element.id;
        switch(chartId) {
            case 'expenseChart':
                this.renderExpenseChart();
                break;
            case 'categoryChart':
                this.renderCategoryChart();
                break;
            case 'taxChart':
                this.renderTaxChart();
                break;
        }
    }
    
    optimizeAnimations() {
        // Reduce animations on low-end devices
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
            document.documentElement.style.setProperty('--animation-duration', '0.1s');
        }
    }
    
    // Advanced features initialization
    initializeAdvancedFeatures() {
        this.setupAutoSave();
        this.initializeNotifications();
        this.setupDataBackup();
        this.initializeKeyboardShortcuts();
        this.setupOfflineSupport();
    }
    
    setupAutoSave() {
        if (this.settings.app.autoSave) {
            setInterval(() => {
                this.autoSaveData();
            }, 30000); // Auto-save every 30 seconds
        }
    }
    
    autoSaveData() {
        try {
            this.saveToStorage();
            this.saveIncomeToStorage();
            localStorage.setItem('paksa_settings', JSON.stringify(this.settings));
            localStorage.setItem('paksa_accounts', JSON.stringify(this.accounts));
            localStorage.setItem('paksa_budgets', JSON.stringify(this.budgets));
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }
    
    initializeNotifications() {
        if ('Notification' in window && this.settings.app.soundNotifications) {
            Notification.requestPermission();
        }
    }
    
    setupDataBackup() {
        // Create automatic backup every week
        const lastBackup = localStorage.getItem('paksa_last_backup');
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        
        if (!lastBackup || (Date.now() - parseInt(lastBackup)) > oneWeek) {
            this.createAutomaticBackup();
        }
    }
    
    createAutomaticBackup() {
        try {
            const backupData = {
                expenses: this.expenses,
                income: this.income,
                settings: this.settings,
                accounts: this.accounts,
                budgets: this.budgets,
                categories: this.categories,
                backupDate: new Date().toISOString(),
                version: '2.0'
            };
            
            localStorage.setItem('paksa_backup', JSON.stringify(backupData));
            localStorage.setItem('paksa_last_backup', Date.now().toString());
        } catch (error) {
            console.error('Backup creation failed:', error);
        }
    }
    
    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N: New expense
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                document.getElementById('amount')?.focus();
            }
            
            // Ctrl/Cmd + S: Save settings
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (this.currentPage === 'settings.html') {
                    this.saveSettings();
                }
            }
            
            // Ctrl/Cmd + E: Export
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                if (this.currentPage === 'export.html') {
                    this.handleExport('csv');
                }
            }
            
            // Escape: Close modals
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                    modal.classList.add('hidden');
                });
            }
        });
    }
    
    setupOfflineSupport() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncOfflineData();
            this.showSuccessMessage('Connection restored. Data synced.');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showErrorMessage('You are offline. Data will be saved locally.');
        });
    }
    
    syncOfflineData() {
        // Sync any offline data when connection is restored
        const offlineData = localStorage.getItem('paksa_offline_queue');
        if (offlineData) {
            try {
                const queue = JSON.parse(offlineData);
                queue.forEach(item => {
                    if (item.type === 'expense') {
                        this.addExpense(item.data);
                    } else if (item.type === 'income') {
                        this.addIncome(item.data);
                    }
                });
                localStorage.removeItem('paksa_offline_queue');
            } catch (error) {
                console.error('Offline sync failed:', error);
            }
        }
    }
    
    // Enhanced export functionality
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
        try {
            const headers = [
                'Date', 'Amount', 'Category', 'Description', 'Tax Deductible', 
                'Tax Amount', 'Payment Method', 'Account', 'Vendor', 'Project', 
                'Tags', 'Created At', 'Updated At'
            ];
            
            const csvContent = [
                headers.join(','),
                ...expenses.map(expense => [
                    expense.date,
                    expense.amount,
                    `"${expense.category || ''}"`,
                    `"${(expense.description || '').replace(/"/g, '""')}"`,
                    expense.taxDeductible ? 'Yes' : 'No',
                    expense.taxAmount || 0,
                    expense.paymentMethod || '',
                    expense.account || '',
                    `"${(expense.vendor || '').replace(/"/g, '""')}"`,
                    `"${(expense.project || '').replace(/"/g, '""')}"`,
                    `"${(expense.tags || []).join(', ')}"`,
                    expense.createdAt || '',
                    expense.updatedAt || ''
                ].join(','))
            ];
            
            // Add summary if requested
            if (options.includeSummary) {
                const summary = this.generateExportSummary(expenses);
                csvContent.push('', '--- SUMMARY ---');
                csvContent.push(`Total Records,${summary.totalRecords}`);
                csvContent.push(`Total Amount,${summary.totalAmount}`);
                csvContent.push(`Tax Deductible Amount,${summary.taxDeductibleAmount}`);
                csvContent.push(`Estimated Tax Savings,${summary.estimatedTaxSavings}`);
            }

            const filename = this.generateFilename('csv', options);
            this.downloadFile(csvContent.join('\n'), filename, 'text/csv');
            this.showSuccessMessage(`CSV export completed! ${expenses.length} records exported.`);
            
            // Track export for analytics
            this.trackExport('csv', expenses.length);
        } catch (error) {
            console.error('CSV export failed:', error);
            this.showErrorMessage('CSV export failed. Please try again.');
        }
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
        try {
            const htmlContent = this.generateHTMLReport(expenses, options);
            
            // Create a new window for PDF generation
            const newWindow = window.open('', '_blank');
            if (!newWindow) {
                throw new Error('Popup blocked. Please allow popups for this site.');
            }
            
            newWindow.document.write(htmlContent);
            newWindow.document.close();
            
            // Auto-trigger print dialog after content loads
            newWindow.onload = () => {
                setTimeout(() => {
                    newWindow.print();
                }, 500);
            };
            
            this.showSuccessMessage(`PDF report generated! ${expenses.length} records included.`);
            this.trackExport('pdf', expenses.length);
        } catch (error) {
            console.error('PDF export failed:', error);
            this.showErrorMessage('PDF export failed: ' + error.message);
        }
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
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();
        
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Paksa Daily Expense - Professional Tax Report</title>
    <meta charset="UTF-8">
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .page-break { page-break-before: always; }
        }
        
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 20px; 
            line-height: 1.6;
            color: #333;
        }
        
        .header { 
            text-align: center; 
            border-bottom: 3px solid #4299e1; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #1a365d;
            margin: 0;
            font-size: 2.5em;
        }
        
        .header h2 {
            color: #4299e1;
            margin: 10px 0;
            font-weight: normal;
        }
        
        .company-info {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        
        .summary { 
            background: #f8fafc; 
            padding: 25px; 
            margin: 20px 0; 
            border-radius: 10px;
            border-left: 5px solid #4299e1;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .summary-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .summary-item .value {
            font-size: 1.5em;
            font-weight: bold;
            color: #4299e1;
        }
        
        .expense-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 10px;
            overflow: hidden;
        }
        
        .expense-table th, .expense-table td { 
            border: 1px solid #e2e8f0; 
            padding: 12px 8px; 
            text-align: left; 
        }
        
        .expense-table th { 
            background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85em;
            letter-spacing: 0.5px;
        }
        
        .expense-table tbody tr:nth-child(even) {
            background-color: #f8fafc;
        }
        
        .expense-table tbody tr:hover {
            background-color: #e6fffa;
        }
        
        .tax-deductible {
            background-color: #d4edda !important;
            border-left: 4px solid #28a745;
        }
        
        .footer { 
            margin-top: 40px; 
            text-align: center; 
            color: #666;
            border-top: 2px solid #e2e8f0;
            padding-top: 20px;
        }
        
        .print-button {
            background: #4299e1;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
        }
        
        .print-button:hover {
            background: #3182ce;
        }
        
        .category-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: 500;
            background: #e2e8f0;
            color: #4a5568;
        }
    </style>
</head>
<body>
    <div class="no-print">
        <button class="print-button" onclick="window.print()">🖨️ Print Report</button>
        <button class="print-button" onclick="window.close()">❌ Close</button>
    </div>
    
    <div class="header">
        <h1>Paksa Daily Expense</h1>
        <h2>Professional Tax & Financial Report</h2>
        <p><strong>Generated:</strong> ${currentDate} at ${currentTime}</p>
        <p><strong>Report Type:</strong> ${options.taxReport ? 'Tax Deductible Expenses' : 'Complete Expense Report'}</p>
    </div>
    
    <div class="company-info">
        <h3>📊 Report Information</h3>
        <p><strong>Business:</strong> ${this.settings.profile?.businessName || 'Personal Expenses'}</p>
        <p><strong>Tax Year:</strong> ${this.settings.tax?.taxYear || new Date().getFullYear()}</p>
        <p><strong>Filing Status:</strong> ${this.settings.tax?.filingStatus || 'Not specified'}</p>
        <p><strong>Tax Rate:</strong> ${this.settings.tax?.defaultTaxRate || 22}%</p>
    </div>
    
    <div class="summary">
        <h3>📈 Financial Summary</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="label">Total Records</div>
                <div class="value">${summary.totalRecords}</div>
            </div>
            <div class="summary-item">
                <div class="label">Total Amount</div>
                <div class="value">$${summary.totalAmount.toFixed(2)}</div>
            </div>
            <div class="summary-item">
                <div class="label">Tax Deductible</div>
                <div class="value">$${summary.taxDeductibleAmount.toFixed(2)}</div>
            </div>
            <div class="summary-item">
                <div class="label">Est. Tax Savings</div>
                <div class="value">$${summary.estimatedTaxSavings.toFixed(2)}</div>
            </div>
        </div>
        <p><strong>📅 Report Period:</strong> ${summary.dateRange.start || 'N/A'} to ${summary.dateRange.end || 'N/A'}</p>
    </div>
    
    <h3>📋 Detailed Expense Records</h3>
    <table class="expense-table">
        <thead>
            <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Description</th>
                <th>Vendor</th>
                <th>Tax Deductible</th>
                <th>Tax Amount</th>
            </tr>
        </thead>
        <tbody>
            ${expenses.map(expense => `
                <tr class="${expense.taxDeductible ? 'tax-deductible' : ''}">
                    <td>${new Date(expense.date).toLocaleDateString()}</td>
                    <td><strong>$${expense.amount.toFixed(2)}</strong></td>
                    <td><span class="category-badge">${expense.category}</span></td>
                    <td>${expense.description || 'No description'}</td>
                    <td>${expense.vendor || 'N/A'}</td>
                    <td>${expense.taxDeductible ? '✅ Yes' : '❌ No'}</td>
                    <td>$${(expense.taxAmount || 0).toFixed(2)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    ${this.generateCategorySummaryTable(expenses)}
    
    <div class="footer">
        <h4>📄 Report Generated by Paksa Daily Expense</h4>
        <p><strong>© 2025 Paksa IT Solutions</strong></p>
        <p>This report is generated for tax preparation and financial analysis purposes.</p>
        <p><em>Please consult with a qualified tax professional for tax advice.</em></p>
        <p><small>Report ID: ${Date.now().toString(36).toUpperCase()}</small></p>
    </div>
</body>
</html>
        `;
    }
    
    generateCategorySummaryTable(expenses) {
        const categoryTotals = {};
        const categoryTaxDeductible = {};
        
        expenses.forEach(expense => {
            const category = expense.category;
            categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
            if (expense.taxDeductible) {
                categoryTaxDeductible[category] = (categoryTaxDeductible[category] || 0) + expense.amount;
            }
        });
        
        const sortedCategories = Object.entries(categoryTotals)
            .sort(([,a], [,b]) => b - a);
        
        return `
            <div class="page-break"></div>
            <h3>📊 Category Summary</h3>
            <table class="expense-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Total Amount</th>
                        <th>Tax Deductible</th>
                        <th>Percentage of Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedCategories.map(([category, total]) => {
                        const taxDeductible = categoryTaxDeductible[category] || 0;
                        const percentage = ((total / expenses.reduce((sum, exp) => sum + exp.amount, 0)) * 100).toFixed(1);
                        return `
                            <tr>
                                <td><span class="category-badge">${category}</span></td>
                                <td><strong>$${total.toFixed(2)}</strong></td>
                                <td>$${taxDeductible.toFixed(2)}</td>
                                <td>${percentage}%</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }
    
    trackExport(format, recordCount) {
        try {
            const exportLog = JSON.parse(localStorage.getItem('paksa_export_log') || '[]');
            exportLog.push({
                format,
                recordCount,
                timestamp: new Date().toISOString(),
                page: this.currentPage
            });
            
            // Keep only last 50 exports
            if (exportLog.length > 50) {
                exportLog.splice(0, exportLog.length - 50);
            }
            
            localStorage.setItem('paksa_export_log', JSON.stringify(exportLog));
        } catch (error) {
            console.error('Failed to track export:', error);
        }
    }

    generateFilename(format, options) {
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
        
        let prefix = 'paksa-expenses';
        if (options.taxReport) {
            prefix = 'paksa-tax-report';
        } else if (options.categories && options.categories.length === 1 && options.categories[0] !== 'all') {
            prefix = `paksa-${options.categories[0].toLowerCase().replace(/\s+/g, '-')}`;
        }
        
        const businessName = this.settings.profile?.businessName;
        if (businessName) {
            prefix += `-${businessName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
        }
        
        return `${prefix}-${date}-${time}.${format}`;
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
        // Wait for ECharts to be available
        if (typeof echarts !== 'undefined') {
            this.renderCharts();
        } else {
            // Retry after a short delay
            setTimeout(() => this.loadAnalytics(), 500);
        }
        this.updateAnalyticsSummary();
    }

    renderCharts() {
        try {
            if (typeof echarts !== 'undefined') {
                this.renderExpenseChart();
                this.renderCategoryChart();
                this.renderTaxChart();
            }
        } catch (error) {
            console.error('Error rendering charts:', error);
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
        
        // Make chart responsive
        window.addEventListener('resize', () => {
            myChart.resize();
        });
    }

    renderCategoryList() {
        const categoryList = document.getElementById('categoryList');
        if (!categoryList) return;

        categoryList.innerHTML = this.categories.map(category => `
            <div class="category-item flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center space-x-3">
                    <div class="color-picker" style="background-color: ${category.color};"></div>
                    <div>
                        <p class="font-medium text-gray-900">${category.name}</p>
                        <p class="text-sm text-gray-500">${category.taxDeductible ? 'Tax deductible' : 'Not tax deductible'} • ${category.type}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-sm text-green-600 font-medium">Active</span>
                    <button onclick="expenseTracker.editCategory('${category.name}')" class="text-blue-600 hover:text-blue-800">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    handleCategorySubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const newCategory = {
            name: formData.get('categoryName'),
            color: formData.get('selectedColor') || '#4299e1',
            taxDeductible: formData.get('isTaxDeductible') === 'on',
            type: 'custom'
        };

        if (this.validateCategory(newCategory)) {
            this.categories.push(newCategory);
            this.saveCategoriesToStorage();
            this.renderCategoryList();
            this.populateCategorySelect();
            this.closeAddCategoryModal();
            this.showSuccessMessage('Category added successfully!');
        }
    }

    validateCategory(category) {
        if (!category.name || category.name.trim() === '') {
            this.showErrorMessage('Please enter a category name');
            return false;
        }
        
        if (this.categories.some(cat => cat.name.toLowerCase() === category.name.toLowerCase())) {
            this.showErrorMessage('Category already exists');
            return false;
        }
        
        return true;
    }

    editCategory(categoryName) {
        const category = this.categories.find(cat => cat.name === categoryName);
        if (category) {
            alert(`Edit functionality for ${categoryName} would open an edit modal with current values:\nName: ${category.name}\nColor: ${category.color}\nTax Deductible: ${category.taxDeductible}`);
        }
    }

    closeAddCategoryModal() {
        const modal = document.getElementById('addCategoryModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    saveCategoriesToStorage() {
        localStorage.setItem('paksa_categories', JSON.stringify(this.categories));
    }

    saveSettings() {
        const settings = {
            profile: {
                fullName: document.getElementById('fullName')?.value || '',
                email: document.getElementById('email')?.value || '',
                businessName: document.getElementById('businessName')?.value || '',
                taxId: document.getElementById('taxId')?.value || ''
            },
            tax: {
                defaultTaxRate: parseFloat(document.getElementById('defaultTaxRate')?.value) || 22,
                taxYear: parseInt(document.getElementById('taxYear')?.value) || new Date().getFullYear(),
                filingStatus: document.getElementById('filingStatus')?.value || 'single',
                stateTaxRate: parseFloat(document.getElementById('stateTaxRate')?.value) || 0
            },
            app: {
                defaultCurrency: document.getElementById('defaultCurrency')?.value || 'USD',
                dateFormat: document.getElementById('dateFormat')?.value || 'MM/DD/YYYY',
                darkMode: document.getElementById('darkMode')?.checked || false,
                autoSave: document.getElementById('autoSave')?.checked !== false,
                spendingInsights: document.getElementById('spendingInsights')?.checked !== false
            },
            export: {
                defaultFormat: document.getElementById('defaultExportFormat')?.value || 'csv',
                includeReceipts: document.getElementById('includeReceipts')?.checked || false,
                includeSummary: document.getElementById('includeSummary')?.checked !== false
            }
        };

        this.settings = { ...this.settings, ...settings };
        localStorage.setItem('paksa_settings', JSON.stringify(this.settings));
        this.showSuccessMessage('Settings saved successfully!');
    }

    formatCurrency(amount) {
        const currency = this.settings.app.defaultCurrency || 'USD';
        const symbols = {
            'USD': '$', 'EUR': '€', 'GBP': '£', 'CAD': 'C$',
            'AUD': 'A$', 'JPY': '¥', 'CHF': 'Fr', 'CNY': '¥'
        };
        return `${symbols[currency] || '$'}${amount.toFixed(2)}`;
    }

    loadBudgetPage() {
        this.renderBudgetList();
        this.updateBudgetSummary();
    }

    renderBudgetList() {
        const budgetList = document.getElementById('budgetList');
        if (!budgetList) return;

        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        
        const monthlyExpenses = this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear;
        });

        budgetList.innerHTML = Object.entries(this.budgets.monthly).map(([category, budget]) => {
            const spent = monthlyExpenses
                .filter(expense => expense.category === category)
                .reduce((sum, expense) => sum + expense.amount, 0);
            
            const percentage = budget > 0 ? (spent / budget) * 100 : 0;
            const remaining = budget - spent;
            
            let statusClass = 'under-budget';
            let statusText = 'On Track';
            
            if (percentage > 100) {
                statusClass = 'over-budget';
                statusText = 'Over Budget';
            } else if (percentage > 80) {
                statusClass = 'near-budget';
                statusText = 'Near Limit';
            }
            
            return `
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="font-medium text-gray-900">${category}</h3>
                        <span class="text-sm font-medium ${percentage > 100 ? 'text-red-600' : percentage > 80 ? 'text-yellow-600' : 'text-green-600'}">
                            ${statusText}
                        </span>
                    </div>
                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Spent: $${spent.toFixed(2)}</span>
                        <span>Budget: $${budget.toFixed(2)}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div class="budget-progress ${statusClass} h-2 rounded-full" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                    <div class="text-sm ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}">
                        ${remaining >= 0 ? 'Remaining' : 'Over by'}: $${Math.abs(remaining).toFixed(2)}
                    </div>
                </div>
            `;
        }).join('');
    }

    updateBudgetSummary() {
        const totalBudget = Object.values(this.budgets.monthly).reduce((sum, budget) => sum + budget, 0);
        
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        
        const monthlyExpenses = this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear;
        });
        
        const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalRemaining = totalBudget - totalSpent;
        
        const totalBudgetEl = document.getElementById('totalBudget');
        const totalSpentEl = document.getElementById('totalSpent');
        const totalRemainingEl = document.getElementById('totalRemaining');
        
        if (totalBudgetEl) totalBudgetEl.textContent = `$${totalBudget.toFixed(2)}`;
        if (totalSpentEl) totalSpentEl.textContent = `$${totalSpent.toFixed(2)}`;
        if (totalRemainingEl) {
            totalRemainingEl.textContent = `$${totalRemaining.toFixed(2)}`;
            totalRemainingEl.className = `text-3xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`;
        }
    }

    showRecurringExpenses() {
        const vendors = {};
        this.expenses.forEach(expense => {
            if (expense.vendor) {
                vendors[expense.vendor] = (vendors[expense.vendor] || 0) + 1;
            }
        });
        
        const recurring = Object.entries(vendors)
            .filter(([vendor, count]) => count >= 3)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        if (recurring.length > 0) {
            const list = recurring.map(([vendor, count]) => `${vendor} (${count} times)`).join('\n');
            alert(`Recurring Vendors:\n\n${list}`);
        } else {
            alert('No recurring vendors found (need 3+ transactions)');
        }
    }

    showRecentVendors() {
        const recentVendors = [...new Set(
            this.expenses
                .filter(expense => expense.vendor)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10)
                .map(expense => expense.vendor)
        )];
        
        if (recentVendors.length > 0) {
            const vendorField = document.getElementById('vendor');
            if (vendorField) {
                vendorField.value = recentVendors[0];
                vendorField.focus();
            }
            alert(`Recent Vendors:\n\n${recentVendors.join('\n')}`);
        } else {
            alert('No recent vendors found');
        }
    }

    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            mobileMenu.classList.toggle('hidden');
        }
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
    try {
        window.expenseTracker = new PaksaExpenseTracker();
    } catch (error) {
        console.error('Error initializing expense tracker:', error);
        // Fallback initialization
        window.expenseTracker = {
            expenses: [],
            income: [],
            categories: [],
            settings: {},
            handleExport: function(format) {
                alert('Export functionality is currently unavailable');
            },
            loadBudgetPage: function() {
                console.log('Budget page loaded');
            },
            loadAnalytics: function() {
                console.log('Analytics page loaded');
            },
            loadSettings: function() {
                console.log('Settings page loaded');
            },
            loadExport: function() {
                console.log('Export page loaded');
            }
        };
    }
});

// Utility functions for responsive design and interactions
function toggleMobileMenu() {
    if (window.expenseTracker) {
        window.expenseTracker.toggleMobileMenu();
    }
}

// Settings page specific functions
function saveSettings() {
    if (window.expenseTracker) {
        window.expenseTracker.saveSettings();
    }
}

function openAddCategoryModal() {
    const modal = document.getElementById('addCategoryModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeAddCategoryModal() {
    if (window.expenseTracker) {
        window.expenseTracker.closeAddCategoryModal();
    }
}

function selectColor(color) {
    const selectedColorInput = document.getElementById('selectedColor');
    if (selectedColorInput) {
        selectedColorInput.value = color;
    }
    
    // Update visual selection
    document.querySelectorAll('.color-picker').forEach(picker => {
        picker.style.border = '2px solid #e2e8f0';
    });
    
    if (event && event.target) {
        event.target.style.border = '2px solid #1a365d';
    }
}

// Export page specific functions
function generateExport() {
    if (window.expenseTracker) {
        const selectedFormat = document.querySelector('.format-button.selected')?.onclick?.toString().match(/selectFormat\('(.+?)'\)/)?.[1] || 'csv';
        window.expenseTracker.handleExport(selectedFormat);
    }
}

function selectFormat(format) {
    // Update visual selection
    document.querySelectorAll('.format-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    if (event && event.target) {
        event.target.closest('.format-button').classList.add('selected');
    }
}

function quickExport(template) {
    // Set default dates
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const startDateEl = document.getElementById('startDate');
    const endDateEl = document.getElementById('endDate');
    
    if (startDateEl) startDateEl.value = firstDay.toISOString().split('T')[0];
    if (endDateEl) endDateEl.value = today.toISOString().split('T')[0];
    
    // Set format based on template
    if (template === 'tax-summary') {
        selectFormat('pdf');
    } else if (template === 'monthly-report') {
        selectFormat('csv');
    } else if (template === 'backup') {
        selectFormat('json');
    }
    
    // Generate export
    generateExport();
}

function resetExportOptions() {
    // Reset form to default values
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), 0, 1);
    
    const startDateEl = document.getElementById('startDate');
    const endDateEl = document.getElementById('endDate');
    
    if (startDateEl) startDateEl.value = firstDay.toISOString().split('T')[0];
    if (endDateEl) endDateEl.value = today.toISOString().split('T')[0];
    
    // Reset checkboxes
    const includeTaxDeductible = document.getElementById('includeTaxDeductible');
    const includeReceipts = document.getElementById('includeReceipts');
    const includeSummary = document.getElementById('includeSummary');
    
    if (includeTaxDeductible) includeTaxDeductible.checked = true;
    if (includeReceipts) includeReceipts.checked = false;
    if (includeSummary) includeSummary.checked = true;
    
    // Reset format selection
    document.querySelectorAll('.format-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    const csvButton = document.querySelector('[onclick*="csv"]');
    if (csvButton) csvButton.classList.add('selected');
    
    alert('Export options have been reset to defaults!');
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