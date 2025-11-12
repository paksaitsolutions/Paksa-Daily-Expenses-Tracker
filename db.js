// IndexedDB Database Manager for Paksa Expense Tracker
class PaksaDB {
    constructor() {
        this.dbName = 'PaksaExpenseDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Expenses store
                if (!db.objectStoreNames.contains('expenses')) {
                    const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
                    expenseStore.createIndex('date', 'date');
                    expenseStore.createIndex('category', 'category');
                    expenseStore.createIndex('taxDeductible', 'taxDeductible');
                }
                
                // Income store
                if (!db.objectStoreNames.contains('income')) {
                    const incomeStore = db.createObjectStore('income', { keyPath: 'id' });
                    incomeStore.createIndex('date', 'date');
                    incomeStore.createIndex('source', 'source');
                }
                
                // Settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
                
                // Budgets store
                if (!db.objectStoreNames.contains('budgets')) {
                    db.createObjectStore('budgets', { keyPath: 'category' });
                }
            };
        });
    }

    async addExpense(expense) {
        const transaction = this.db.transaction(['expenses'], 'readwrite');
        const store = transaction.objectStore('expenses');
        return store.add(expense);
    }

    async updateExpense(expense) {
        const transaction = this.db.transaction(['expenses'], 'readwrite');
        const store = transaction.objectStore('expenses');
        return store.put(expense);
    }

    async deleteExpense(id) {
        const transaction = this.db.transaction(['expenses'], 'readwrite');
        const store = transaction.objectStore('expenses');
        return store.delete(id);
    }

    async getAllExpenses() {
        const transaction = this.db.transaction(['expenses'], 'readonly');
        const store = transaction.objectStore('expenses');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async addIncome(income) {
        const transaction = this.db.transaction(['income'], 'readwrite');
        const store = transaction.objectStore('income');
        return store.add(income);
    }

    async getAllIncome() {
        const transaction = this.db.transaction(['income'], 'readonly');
        const store = transaction.objectStore('income');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveSetting(key, value) {
        const transaction = this.db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        return store.put({ key, value });
    }

    async getSetting(key) {
        const transaction = this.db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result?.value);
            request.onerror = () => reject(request.error);
        });
    }
}