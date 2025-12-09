/* global translations, emailjs, toast */
import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// State
let currentLang = 'en';
let currentTheme = 'light';
let projects = []; // Initialize as empty, will be filled from Firebase

// Safe LocalStorage Access (Theme & Lang only)
try {
    // Auto-detect browser language if not set
    if (!localStorage.getItem('lang')) {
        const browserLang = navigator.language || navigator.userLanguage;
        // Check if browser language is Arabic
        if (browserLang.startsWith('ar')) {
            currentLang = 'ar';
        } else {
            currentLang = 'en';
        }
        console.log('Auto-detected browser language:', browserLang, '-> Using:', currentLang);
    } else {
        currentLang = localStorage.getItem('lang');
    }

    // Auto-detect browser theme preference if not set
    if (!localStorage.getItem('theme')) {
        // Check if browser prefers dark mode
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            currentTheme = 'dark';
            console.log('Auto-detected dark theme preference');
        } else {
            currentTheme = 'light';
            console.log('Auto-detected light theme preference');
        }
    } else {
        currentTheme = localStorage.getItem('theme');
    }
} catch (e) {
    console.warn('LocalStorage access denied:', e);
    // Fallback to browser detection even without localStorage
    const browserLang = navigator.language || navigator.userLanguage;
    currentLang = browserLang.startsWith('ar') ? 'ar' : 'en';
    currentTheme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
}

// Fetch Projects from Firebase
async function fetchProjects() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    if (portfolioGrid) {
        // Show skeleton loading
        portfolioGrid.innerHTML = `
            <div class="skeleton-project-card">
                <div class="skeleton skeleton-project-image"></div>
                <div class="skeleton-project-content">
                    <div class="skeleton skeleton-project-title"></div>
                    <div class="skeleton skeleton-project-desc"></div>
                    <div class="skeleton skeleton-project-desc"></div>
                    <div class="skeleton-project-tags">
                        <div class="skeleton skeleton-tag"></div>
                        <div class="skeleton skeleton-tag"></div>
                        <div class="skeleton skeleton-tag"></div>
                    </div>
                </div>
            </div>
        `.repeat(3);
    }

    try {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        projects = [];
        querySnapshot.forEach((doc) => {
            projects.push({ id: doc.id, ...doc.data() });
        });

        console.log("Projects fetched:", projects);
        renderProjects(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        if (portfolioGrid) {
            portfolioGrid.innerHTML = '<p class="error-msg">Failed to load projects. Please try again later.</p>';
        }
        // Show error toast
        if (window.toast) {
            window.toast.error(
                translations[currentLang]['error'] || 'Error',
                translations[currentLang]['projects_load_error'] || 'Failed to load projects'
            );
        }
    }
}


// DOM Elements
const html = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');
const portfolioGrid = document.getElementById('portfolio-grid');
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
const modal = document.getElementById('project-modal');
const modalClose = document.getElementById('modal-close');

// Initialization
function init() {
    console.log('Init started');
    try {
        console.log('Setting theme...');
        setTheme(currentTheme);
        console.log('Setting language...');
        setLanguage(currentLang);
        console.log('Fetching projects from Firebase...');
        fetchProjects();
        console.log('Setting up event listeners...');
        setupEventListeners();
        console.log('Initializing animations...');
        initScrollAnimations();
        initParallax();
        // initTypingEffect(); // Handled by setLanguage
        initActiveLinkHighlight();
        console.log('Init complete');
    } catch (e) {
        console.error('Initialization error:', e);
        document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }
}

// Theme Logic
function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    try {
        localStorage.setItem('theme', theme);
    } catch (e) { console.warn('LocalStorage write failed:', e); }
    currentTheme = theme;
    updateThemeIcon();
}

// Make toggleTheme global so it works with onclick in HTML
window.toggleTheme = function () {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function updateThemeIcon() {
    if (themeToggle) {
        themeToggle.innerHTML = currentTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }
}

// Language Logic
function setLanguage(lang) {
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    try {
        localStorage.setItem('lang', lang);
    } catch (e) { console.warn('LocalStorage write failed:', e); }
    currentLang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    // CV Download Link logic removed - using Modal instead
    updateLangToggleText();
    initTypingEffect();
}

// Make toggleLanguage global so it works with onclick in HTML
window.toggleLanguage = function () {
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    updateLangToggleText();
}

function updateLangToggleText() {
    if (langToggle) {
        langToggle.textContent = currentLang === 'en' ? 'AR' : 'EN';
    }
}

// Portfolio Logic
function renderProjects(items) {
    if (!portfolioGrid) return;
    portfolioGrid.innerHTML = items.map(project => `
        <div class="project-card fade-in-up" onclick="showProjectDetails('${project.id}')">
            <img src="${project.image}" alt="${getLocalizedText(project.title)}" class="project-img">
            <div class="project-info">
                <h3 class="project-title">${getLocalizedText(project.title)}</h3>
                <p class="project-desc">${getLocalizedText(project.desc)}</p>
                <div class="project-tags">
                    ${project.tech.map(t => `<span class="tag">${t}</span>`).join('')}
                </div>
                ${(project.apkUrl || (project.link && project.link !== '#')) ? `
                    <div class="project-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        ${project.apkUrl ? `
                            <a href="${project.apkUrl}" 
                               class="btn-download" 
                               download
                               onclick="event.stopPropagation()"
                               style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 600; transition: all 0.3s; border: none;">
                                <i class="fas fa-download"></i>
                                <span>${translations[currentLang]['download_apk']}</span>
                            </a>
                        ` : ''}
                        ${(project.link && project.link !== '#') ? `
                            <a href="${project.link}" 
                               target="_blank"
                               onclick="event.stopPropagation()"
                               class="btn-link" 
                               style="background: var(--glass-bg); color: var(--text-primary); padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 600; border: 1px solid var(--glass-border); transition: all 0.3s;">
                                <i class="fas fa-external-link-alt"></i>
                                <span>${translations[currentLang]['view_project']}</span>
                            </a>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Helper function to get localized text
function getLocalizedText(textObj) {
    if (typeof textObj === 'string') return textObj;
    return textObj[currentLang] || textObj.en || '';
}

function filterProjects(category) {
    if (category === 'all') {
        renderProjects(projects);
    } else {
        const filtered = projects.filter(p => p.category === category);
        renderProjects(filtered);
    }
}

function searchProjects(query) {
    const lowerQuery = query.toLowerCase();
    const filtered = projects.filter(p =>
        getLocalizedText(p.title).toLowerCase().includes(lowerQuery) ||
        getLocalizedText(p.desc).toLowerCase().includes(lowerQuery)
    );
    renderProjects(filtered);
}

// Upload Logic
window.handleUpload = function (e) {
    e.preventDefault();

    const titleValue = document.getElementById('p-title').value;
    const descValue = document.getElementById('p-desc').value;

    const newProject = {
        id: Date.now(),
        title: {
            en: titleValue,
            ar: titleValue
        },
        desc: {
            en: descValue,
            ar: descValue
        },
        category: document.getElementById('p-category').value,
        image: document.getElementById('p-image').value || 'https://via.placeholder.com/400x300',
        tech: document.getElementById('p-tech').value.split(',').map(t => t.trim()),
        link: document.getElementById('p-link').value,
        apkUrl: document.getElementById('p-apk').value || null  // Capture APK URL
    };

    projects.unshift(newProject);
    try {
        localStorage.setItem('projects', JSON.stringify(projects));
    } catch (err) { console.warn('LocalStorage write failed:', err); }
    renderProjects(projects);
    e.target.reset();
    alert('Project uploaded successfully!');
}

// Modal Functions
function showProjectDetails(id) {
    const project = projects.find(p => p.id === id);
    if (!project || !modal) return;

    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div style="display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 1.5rem;">
            <img src="${project.image}" alt="${getLocalizedText(project.title)}" style="flex: 1; max-width: 60%; border-radius: var(--radius-md); object-fit: cover;">
            <button onclick="closeModal()" style="background: var(--accent-color); color: white; border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; flex-shrink: 0; transition: var(--transition-fast);" onmouseover="this.style.transform='rotate(90deg)'" onmouseout="this.style.transform='rotate(0deg)'">&times;</button>
        </div>
        <h2 style="margin-bottom: 1rem;">${getLocalizedText(project.title)}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">${getLocalizedText(project.desc)}</p>
        <div style="margin-bottom: 1.5rem;">
            <h3 style="margin-bottom: 0.5rem;">Technologies Used:</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${project.tech.map(t => `<span class="tag" style="background: var(--accent-glow); padding: 0.5rem 1rem; border-radius: var(--radius-full); color: var(--accent-color);">${t}</span>`).join('')}
            </div>
        </div>
        ${project.link ? `<a href="${project.link}" class="btn ripple" target="_blank" rel="noopener">View Project</a>` : ''}
        `;
}

function closeModal() {
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// CV Modal Functions
window.openCVModal = function () {
    const cvModal = document.getElementById('cv-modal');
    if (cvModal) {
        cvModal.style.display = 'flex';
        // Small delay to allow display:flex to apply before adding opacity class
        setTimeout(() => {
            cvModal.classList.add('active');
        }, 10);
        document.body.style.overflow = 'hidden';
    } else {
        console.error('CV Modal not found!');
    }
};

window.closeCVModal = function () {
    const cvModal = document.getElementById('cv-modal');
    if (cvModal) {
        cvModal.classList.remove('active');
        setTimeout(() => {
            cvModal.style.display = 'none';
        }, 300); // Match transition duration
        document.body.style.overflow = 'auto';
    }
};

// Scroll Animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
        observer.observe(el);
    });
}

// Parallax Effect
function initParallax() {
    const parallaxShapes = document.querySelectorAll('.parallax-shape');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        parallaxShapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.1);
            shape.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Typing Effect
let typingTimeout;
function initTypingEffect() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;

    // Clear any existing timeout
    if (typingTimeout) clearTimeout(typingTimeout);

    // Get the correct text based on current language
    const key = typingElement.getAttribute('data-i18n');
    const text = translations[currentLang][key] || typingElement.textContent;

    typingElement.textContent = '';
    typingElement.style.borderRight = '3px solid var(--accent-color)'; // Add cursor
    let index = 0;

    function type() {
        if (index < text.length) {
            typingElement.textContent += text.charAt(index);
            index++;
            typingTimeout = setTimeout(type, 80);
        } else {
            // Remove cursor when done
            setTimeout(() => {
                typingElement.style.borderRight = 'none';
            }, 500);
        }
    }

    typingTimeout = setTimeout(type, 300);
}

// Make available globally for click effect
window.initTypingEffect = initTypingEffect;

// Active Link Highlight
function initActiveLinkHighlight() {
    const sections = document.querySelectorAll('section');
    const navLinksElements = document.querySelectorAll('.nav-link');

    function updateActiveLink() {
        let current = '';
        const scrollPosition = (window.pageYOffset || document.documentElement.scrollTop) + 150; // Increased offset for better detection

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        // Special case for top of page
        if ((window.pageYOffset || document.documentElement.scrollTop) < 100) {
            current = 'home';
        }

        // Update nav links
        navLinksElements.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');

            // Handle internal links
            if (href && href.startsWith('#')) {
                if (href.substring(1) === current) {
                    link.classList.add('active');
                }
            }
            // Handle external links (like services.html) - check if current URL matches
            else if (href && window.location.pathname.endsWith(href)) {
                link.classList.add('active');
            }
        });
    }

    // Run on scroll
    window.addEventListener('scroll', updateActiveLink);

    // Run on load to set initial state
    updateActiveLink();
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    if (hamburger) hamburger.classList.toggle('active');
    if (navLinks) navLinks.classList.toggle('active');
}

// Event Listeners
function setupEventListeners() {
    // Theme and language toggles are handled via onclick in HTML
    // No need to add listeners here since they're global functions

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (hamburger) hamburger.addEventListener('click', toggleMobileMenu);

    // Search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => searchProjects(e.target.value));
    }

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterProjects(e.target.dataset.filter);
        });
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (navLinks.classList.contains('active')) {
                    toggleMobileMenu();
                }
            }
        });
    });

    // Close modal on outside click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Contact form - EmailJS Integration
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        // Initialize EmailJS
        emailjs.init("eyvbKUHPnYG6Ulm7T");

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get submit button to show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Show loading
            submitBtn.innerHTML = currentLang === 'ar' ?
                '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...' :
                '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            // Get form values
            const params = {
                name: document.getElementById('contact-name').value.trim(),
                email: document.getElementById('contact-email').value.trim(),
                message: document.getElementById('contact-message').value.trim()
            };

            // Send email
            emailjs.send("service_abdullah10sala", "template_q625jq6", params)
                .then(function (response) {
                    console.log('SUCCESS!', response.status, response.text);

                    // Show success toast
                    if (window.toast) {
                        window.toast.success(
                            currentLang === 'ar' ? 'نجح الإرسال!' : 'Success!',
                            currentLang === 'ar' ? 'تم إرسال رسالتك بنجاح! شكراً لتواصلك.' : 'Message sent successfully! Thank you for contacting me.'
                        );
                        if (window.triggerConfetti) window.triggerConfetti();
                    }
                    contactForm.reset();
                }, function (error) {
                    console.error('FAILED...', error);

                    // Show error toast
                    if (window.toast) {
                        window.toast.error(
                            currentLang === 'ar' ? 'خطأ!' : 'Error!',
                            currentLang === 'ar' ? 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.' : 'Failed to send message. Please try again.'
                        );
                    }
                })
                .finally(() => {
                    // Restore button state
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
        });
    }
}

// Start
document.addEventListener('DOMContentLoaded', init);
