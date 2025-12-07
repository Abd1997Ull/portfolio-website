// PWA Registration and Management
class PWAManager {
    constructor() {
        this.init();
    }

    init() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                this.registerServiceWorker();
            });
        }

        // Handle install prompt
        this.setupInstallPrompt();
    }

    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('ServiceWorker registered with scope:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version available
                        this.showUpdateNotification();
                    }
                });
            });
        } catch (error) {
            console.log('ServiceWorker registration failed:', error);
        }
    }

    setupInstallPrompt() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent default prompt
            e.preventDefault();
            deferredPrompt = e;

            // Show custom install button (optional)
            this.showInstallButton(deferredPrompt);
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            deferredPrompt = null;

            // Show thank you message
            if (window.toast) {
                window.toast.success(
                    'تم التثبيت!',
                    'تم تثبيت التطبيق بنجاح!'
                );
            }
        });
    }

    showInstallButton(prompt) {
        // Create install button (optional feature)
        const installBtn = document.createElement('button');
        installBtn.textContent = 'تثبيت التطبيق';
        installBtn.className = 'pwa-install-btn';
        installBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            padding: 12px 24px;
            background: var(--accent-gradient);
            color: white;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
            z-index: 1000;
            animation: slideInLeft 0.3s ease;
        `;

        installBtn.addEventListener('click', async () => {
            installBtn.style.display = 'none';
            prompt.prompt();
            const { outcome } = await prompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);
        });

        // Don't show if already installed or dismissed before
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed && !window.matchMedia('(display-mode: standalone)').matches) {
            document.body.appendChild(installBtn);

            // Add close button
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '×';
            closeBtn.style.cssText = `
                position:absolute;
                top:-8px;
                right:-8px;
                width:24px;
                height:24px;
                border-radius:50%;
                background:white;
                color:#000;
                border:none;
                cursor:pointer;
                font-size:18px;
                line-height:18px;
            `;
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                installBtn.remove();
                localStorage.setItem('pwa-install-dismissed', 'true');
            });
            installBtn.style.position = 'relative';
            installBtn.appendChild(closeBtn);
        }
    }

    showUpdateNotification() {
        if (window.toast) {
            window.toast.info(
                'تحديث متاح',
                'يوجد تحديث جديد. قم بتحديث الصفحة للحصول على آخر التحسينات.'
            );
        }
    }
}

// Initialize PWA manager
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pwaManager = new PWAManager();
    });
} else {
    window.pwaManager = new PWAManager();
}

// Check if running as PWA
if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('Running as PWA');
    document.documentElement.classList.add('pwa-mode');
}
