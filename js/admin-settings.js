// Admin settings management

class AdminSettings {
    constructor() {
        this.settings = {};
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupTabs();
        this.setupForms();
        this.populateSettings();
    }
    
    loadSettings() {
        this.settings = Storage.get('adminSettings', {
            store: {
                name: 'SuperMart',
                status: true,
                description: 'Your premium supermarket for fresh groceries and daily essentials.',
                phone: '+91 98765 43210',
                email: 'info@supermart.com',
                address: '123 Market Street, Mumbai, Maharashtra 400001'
            },
            delivery: {
                standardFee: 49,
                expressFee: 99,
                freeDeliveryMin: 500,
                taxRate: 18
            },
            integrations: {
                blinkit: false,
                zepto: false,
                swiggy: false,
                stripe: true
            },
            notifications: {
                newOrder: true,
                orderStatus: true,
                lowStock: true,
                outOfStock: true,
                adminEmail: 'admin@supermart.com'
            }
        });
    }
    
    saveSettings() {
        Storage.set('adminSettings', this.settings);
        
        // Update global settings that affect the app
        Storage.set('standardDeliveryFee', this.settings.delivery.standardFee);
        Storage.set('expressDeliveryFee', this.settings.delivery.expressFee);
        Storage.set('freeDeliveryMin', this.settings.delivery.freeDeliveryMin);
        Storage.set('taxRate', this.settings.delivery.taxRate);
    }
    
    setupTabs() {
        const tabBtns = document.querySelectorAll('.settings-tab');
        const tabPanes = document.querySelectorAll('.settings-content .tab-pane');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                
                // Update active tab button
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active tab pane
                tabPanes.forEach(pane => {
                    pane.classList.toggle('active', pane.id === `${tabName}Tab`);
                });
            });
        });
    }
    
    setupForms() {
        this.setupStoreForm();
        this.setupDeliveryForm();
        this.setupIntegrations();
        this.setupNotificationForm();
        this.setupSecurityForm();
        this.setupDataActions();
    }
    
    populateSettings() {
        // Store settings
        document.getElementById('storeName').value = this.settings.store.name;
        document.getElementById('storeStatus').checked = this.settings.store.status;
        document.getElementById('storeDescription').value = this.settings.store.description;
        document.getElementById('storePhone').value = this.settings.store.phone;
        document.getElementById('storeEmail').value = this.settings.store.email;
        document.getElementById('storeAddress').value = this.settings.store.address;
        
        // Delivery settings
        document.getElementById('standardDeliveryFee').value = this.settings.delivery.standardFee;
        document.getElementById('expressDeliveryFee').value = this.settings.delivery.expressFee;
        document.getElementById('freeDeliveryMin').value = this.settings.delivery.freeDeliveryMin;
        document.getElementById('taxRate').value = this.settings.delivery.taxRate;
        
        // Integrations
        document.getElementById('blinkitIntegration').checked = this.settings.integrations.blinkit;
        document.getElementById('zeptoIntegration').checked = this.settings.integrations.zepto;
        document.getElementById('swiggyIntegration').checked = this.settings.integrations.swiggy;
        document.getElementById('stripeIntegration').checked = this.settings.integrations.stripe;
        
        // Notifications
        document.getElementById('newOrderNotif').checked = this.settings.notifications.newOrder;
        document.getElementById('orderStatusNotif').checked = this.settings.notifications.orderStatus;
        document.getElementById('lowStockNotif').checked = this.settings.notifications.lowStock;
        document.getElementById('outOfStockNotif').checked = this.settings.notifications.outOfStock;
        document.getElementById('adminEmail').value = this.settings.notifications.adminEmail;
        
        // Update toggle text
        this.updateStoreStatusText();
    }
    
    setupStoreForm() {
        const storeForm = document.getElementById('storeForm');
        const storeStatus = document.getElementById('storeStatus');
        
        if (storeForm) {
            storeForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveStoreSettings();
            });
        }
        
        if (storeStatus) {
            storeStatus.addEventListener('change', () => {
                this.updateStoreStatusText();
            });
        }
    }
    
    updateStoreStatusText() {
        const storeStatus = document.getElementById('storeStatus');
        const toggleText = document.querySelector('.toggle-text');
        
        if (storeStatus && toggleText) {
            toggleText.textContent = storeStatus.checked ? 'Open' : 'Closed';
        }
    }
    
    async saveStoreSettings() {
        try {
            const saveBtn = document.querySelector('#storeForm .save-btn');
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;
            
            await API.delay(1000);
            
            this.settings.store = {
                name: document.getElementById('storeName').value,
                status: document.getElementById('storeStatus').checked,
                description: document.getElementById('storeDescription').value,
                phone: document.getElementById('storePhone').value,
                email: document.getElementById('storeEmail').value,
                address: document.getElementById('storeAddress').value
            };
            
            this.saveSettings();
            showToast('Store settings saved successfully', 'success');
            
        } catch (error) {
            showToast('Failed to save store settings', 'error');
        } finally {
            const saveBtn = document.querySelector('#storeForm .save-btn');
            saveBtn.textContent = 'Save Changes';
            saveBtn.disabled = false;
        }
    }
    
    setupDeliveryForm() {
        const deliveryForm = document.getElementById('deliveryForm');
        
        if (deliveryForm) {
            deliveryForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveDeliverySettings();
            });
        }
    }
    
    async saveDeliverySettings() {
        try {
            const saveBtn = document.querySelector('#deliveryForm .save-btn');
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;
            
            await API.delay(1000);
            
            this.settings.delivery = {
                standardFee: parseFloat(document.getElementById('standardDeliveryFee').value),
                expressFee: parseFloat(document.getElementById('expressDeliveryFee').value),
                freeDeliveryMin: parseFloat(document.getElementById('freeDeliveryMin').value),
                taxRate: parseFloat(document.getElementById('taxRate').value)
            };
            
            this.saveSettings();
            showToast('Delivery settings saved successfully', 'success');
            
        } catch (error) {
            showToast('Failed to save delivery settings', 'error');
        } finally {
            const saveBtn = document.querySelector('#deliveryForm .save-btn');
            saveBtn.textContent = 'Save Changes';
            saveBtn.disabled = false;
        }
    }
    
    setupIntegrations() {
        const integrationToggles = document.querySelectorAll('#integrationsTab input[type="checkbox"]');
        
        integrationToggles.forEach(toggle => {
            toggle.addEventListener('change', () => {
                this.updateIntegration(toggle.id, toggle.checked);
            });
        });
    }
    
    updateIntegration(integrationId, enabled) {
        const integrationMap = {
            'blinkitIntegration': 'blinkit',
            'zeptoIntegration': 'zepto',
            'swiggyIntegration': 'swiggy',
            'stripeIntegration': 'stripe'
        };
        
        const integrationKey = integrationMap[integrationId];
        if (integrationKey) {
            this.settings.integrations[integrationKey] = enabled;
            this.saveSettings();
            
            const integrationName = integrationKey.charAt(0).toUpperCase() + integrationKey.slice(1);
            showToast(`${integrationName} integration ${enabled ? 'enabled' : 'disabled'}`, 'success');
        }
    }
    
    setupNotificationForm() {
        const notificationForm = document.getElementById('notificationForm');
        
        if (notificationForm) {
            notificationForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveNotificationSettings();
            });
        }
    }
    
    async saveNotificationSettings() {
        try {
            const saveBtn = document.querySelector('#notificationForm .save-btn');
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;
            
            await API.delay(1000);
            
            this.settings.notifications = {
                newOrder: document.getElementById('newOrderNotif').checked,
                orderStatus: document.getElementById('orderStatusNotif').checked,
                lowStock: document.getElementById('lowStockNotif').checked,
                outOfStock: document.getElementById('outOfStockNotif').checked,
                adminEmail: document.getElementById('adminEmail').value
            };
            
            this.saveSettings();
            showToast('Notification settings saved successfully', 'success');
            
        } catch (error) {
            showToast('Failed to save notification settings', 'error');
        } finally {
            const saveBtn = document.querySelector('#notificationForm .save-btn');
            saveBtn.textContent = 'Save Changes';
            saveBtn.disabled = false;
        }
    }
    
    setupSecurityForm() {
        const securityForm = document.getElementById('securityForm');
        
        if (securityForm) {
            securityForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.changePassword();
            });
        }
    }
    
    async changePassword() {
        const currentPassword = document.querySelector('#securityForm input[type="password"]:nth-child(1)').value;
        const newPassword = document.querySelector('#securityForm input[type="password"]:nth-child(2)').value;
        const confirmPassword = document.querySelector('#securityForm input[type="password"]:nth-child(3)').value;
        
        const admin = adminAuthManager.getCurrentAdmin();
        
        // For demo purposes, we'll assume current password is correct
        if (!Validation.password(newPassword)) {
            showToast('New password must be at least 6 characters long', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }
        
        try {
            const saveBtn = document.querySelector('#securityForm .save-btn');
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Changing...';
            saveBtn.disabled = true;
            
            await API.delay(1000);
            
            // In a real app, this would update the admin password
            showToast('Password changed successfully', 'success');
            document.getElementById('securityForm').reset();
            
        } catch (error) {
            showToast('Failed to change password', 'error');
        } finally {
            const saveBtn = document.querySelector('#securityForm .save-btn');
            saveBtn.textContent = 'Change Password';
            saveBtn.disabled = false;
        }
    }
    
    setupDataActions() {
        const exportBtn = document.getElementById('exportData');
        const clearBtn = document.getElementById('clearData');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.showClearDataConfirmation();
            });
        }
        
        this.setupConfirmModal();
    }
    
    exportData() {
        try {
            const data = {
                products: Storage.get('products', []),
                orders: Storage.get('orders', []),
                users: Storage.get('users', []),
                feedback: Storage.get('feedback', []),
                settings: this.settings,
                exportDate: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `supermart-data-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            showToast('Data exported successfully', 'success');
            
        } catch (error) {
            showToast('Failed to export data', 'error');
        }
    }
    
    showClearDataConfirmation() {
        const modal = document.getElementById('confirmModal');
        const title = document.getElementById('confirmTitle');
        const message = document.getElementById('confirmMessage');
        
        if (modal && title && message) {
            title.textContent = 'Clear All Data';
            message.textContent = 'Are you sure you want to clear all data? This action cannot be undone and will remove all products, orders, users, and settings.';
            
            modal.dataset.action = 'clearData';
            modal.style.display = 'block';
            Animation.fadeIn(modal);
        }
    }
    
    setupConfirmModal() {
        const modal = document.getElementById('confirmModal');
        if (!modal) return;
        
        const closeBtn = modal.querySelector('.close-btn');
        const cancelBtn = document.getElementById('cancelConfirm');
        const confirmBtn = document.getElementById('confirmAction');
        
        // Close modal
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideConfirmModal();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideConfirmModal();
            });
        }
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideConfirmModal();
            }
        });
        
        // Confirm action
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                const action = modal.dataset.action;
                if (action === 'clearData') {
                    this.clearAllData();
                }
            });
        }
    }
    
    hideConfirmModal() {
        const modal = document.getElementById('confirmModal');
        if (modal) {
            Animation.fadeOut(modal);
            setTimeout(() => {
                modal.style.display = 'none';
                delete modal.dataset.action;
            }, 300);
        }
    }
    
    async clearAllData() {
        try {
            const confirmBtn = document.getElementById('confirmAction');
            const originalText = confirmBtn.textContent;
            confirmBtn.textContent = 'Clearing...';
            confirmBtn.disabled = true;
            
            await API.delay(2000);
            
            // Clear all data except admin auth
            const keysToKeep = ['currentAdmin', 'theme'];
            const allKeys = Object.keys(localStorage);
            
            allKeys.forEach(key => {
                if (!keysToKeep.includes(key)) {
                    localStorage.removeItem(key);
                }
            });
            
            showToast('All data cleared successfully', 'success');
            this.hideConfirmModal();
            
            // Reload page to reset everything
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        } catch (error) {
            showToast('Failed to clear data', 'error');
        } finally {
            const confirmBtn = document.getElementById('confirmAction');
            if (confirmBtn) {
                confirmBtn.textContent = 'Confirm';
                confirmBtn.disabled = false;
            }
        }
    }
}

// Initialize admin settings
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin/settings.html')) {
        new AdminSettings();
    }
});