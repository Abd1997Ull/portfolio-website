// Admin Panel JavaScript - Smart Bilingual Support
const PROJECTS_KEY = 'portfolio_projects';

let projects = [];
let editingId = null;
let deleteId = null;
let currentLang = 'ar';
let currentTheme = 'light';

// Load from localStorage
try {
    currentLang = localStorage.getItem('lang') || 'ar';
    currentTheme = localStorage.getItem('theme') || 'light';
    const stored = localStorage.getItem(PROJECTS_KEY);
    if (stored) {
        projects = JSON.parse(stored);
    }
} catch (e) {
    console.error('Error loading data:', e);
}

// DOM Elements
const projectForm = document.getElementById('project-form');
const projectsList = document.getElementById('projects-list');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const formTitle = document.getElementById('form-title');
const submitText = document.getElementById('submit-text');
const cancelBtn = document.getElementById('cancel-btn');
const deleteModal = document.getElementById('delete-modal');
const themeToggle = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');

// Initialize
function init() {
    setTheme(currentTheme);
    setLanguage(currentLang);
    renderProjects();
    setupEventListeners();
}

// Theme
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    currentTheme = theme;
    if (themeToggle) {
        themeToggle.innerHTML = theme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }
}

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Language
function setLanguage(lang) {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('lang', lang);
    currentLang = lang;

    // Update all text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (adminTranslations[lang][key]) {
            el.textContent = adminTranslations[lang][key];
        }
    });

    // Update all placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (adminTranslations[lang][key]) {
            el.placeholder = adminTranslations[lang][key];
        }
    });

    // Update language toggle button
    if (langToggle) {
        langToggle.textContent = lang === 'en' ? 'AR' : 'EN';
    }

    // Re-render projects to update category badges
    renderProjects();
}

function toggleLanguage() {
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
}

// Save projects
function saveProjects() {
    try {
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
        return true;
    } catch (e) {
        console.error('Error saving:', e);
        alert('خطأ في الحفظ. قد تكون المساحة ممتلئة.');
        return false;
    }
}

// Add/Update Project
function handleSubmit(e) {
    e.preventDefault();

    const titleAr = document.getElementById('title-ar').value.trim();
    const titleEn = document.getElementById('title-en').value.trim();
    const descAr = document.getElementById('desc-ar').value.trim();
    const descEn = document.getElementById('desc-en').value.trim();

    const projectData = {
        id: editingId || Date.now(),
        title: {
            ar: titleAr,
            en: titleEn || titleAr  // إذا الإنجليزي فاضي، استخدم العربي
        },
        desc: {
            ar: descAr,
            en: descEn || descAr  // إذا الإنجليزي فاضي، استخدم العربي
        },
        category: document.getElementById('category').value,
        image: document.getElementById('image').value.trim(),
        tech: document.getElementById('tech').value.split(',').map(t => t.trim()).filter(t => t),
        link: document.getElementById('link').value.trim() || '#',
        apkUrl: document.getElementById('apk-url').value.trim() || null
    };

    if (editingId) {
        const index = projects.findIndex(p => p.id === editingId);
        if (index !== -1) {
            projects[index] = projectData;
        }
    } else {
        projects.unshift(projectData);
    }

    if (saveProjects()) {
        resetForm();
        renderProjects();
        showNotification(editingId ? 'تم تحديث المشروع بنجاح!' : 'تم إضافة المشروع بنجاح!');
    }
}

// Edit Project
function editProject(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    editingId = id;

    document.getElementById('title-ar').value = project.title.ar;
    // فقط اعرض الإنجليزي إذا كان مختلف عن العربي
    document.getElementById('title-en').value = (project.title.en !== project.title.ar) ? project.title.en : '';

    document.getElementById('desc-ar').value = project.desc.ar;
    // فقط اعرض الإنجليزي إذا كان مختلف عن العربي
    document.getElementById('desc-en').value = (project.desc.en !== project.desc.ar) ? project.desc.en : '';

    document.getElementById('category').value = project.category;
    document.getElementById('image').value = project.image;
    document.getElementById('tech').value = project.tech.join(', ');
    document.getElementById('link').value = project.link === '#' ? '' : project.link;
    document.getElementById('apk-url').value = project.apkUrl || '';

    formTitle.textContent = 'تعديل المشروع';
    submitText.textContent = 'تحديث المشروع';
    cancelBtn.style.display = 'inline-flex';

    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// Delete Project
function confirmDelete(id) {
    deleteId = id;
    deleteModal.classList.add('active');
}

function deleteProject() {
    projects = projects.filter(p => p.id !== deleteId);
    if (saveProjects()) {
        renderProjects();
        showNotification('تم حذف المشروع بنجاح!');
    }
    deleteModal.classList.remove('active');
    deleteId = null;
}

// Reset Form
function resetForm() {
    projectForm.reset();
    editingId = null;
    formTitle.textContent = 'إضافة مشروع جديد';
    submitText.textContent = 'إضافة مشروع';
    cancelBtn.style.display = 'none';
}

// Render Projects
function renderProjects(filter = '') {
    const filtered = filter
        ? projects.filter(p =>
            p.title.en.toLowerCase().includes(filter.toLowerCase()) ||
            p.title.ar.includes(filter) ||
            p.desc.en.toLowerCase().includes(filter.toLowerCase()) ||
            p.desc.ar.includes(filter)
        )
        : projects;

    if (filtered.length === 0) {
        projectsList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    projectsList.innerHTML = filtered.map(project => `
        <div class="project-card">
            <img src="${project.image}" alt="${project.title.ar}" onerror="this.src='https://via.placeholder.com/400x200/6366f1/ffffff?text=No+Image'">
            <div class="project-card-body">
                <h3>${project.title[currentLang]}</h3>
                <p>${project.desc[currentLang].substring(0, 100)}...</p>
                
                <div class="project-meta">
                    <span class="badge ${project.category === 'mobile' ? 'badge-mobile' : 'badge-web'}">
                        ${project.category === 'mobile' ? 'تطبيق موبايل' : 'موقع ويب'}
                    </span>
                </div>
                
                <div class="project-tech">
                    ${project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                </div>
                
                <div class="project-actions">
                    <button class="btn btn-edit" onclick="editProject(${project.id})">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="btn btn-delete" onclick="confirmDelete(${project.id})">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Search
function handleSearch(e) {
    renderProjects(e.target.value);
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Event Listeners
function setupEventListeners() {
    projectForm.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', resetForm);
    searchInput.addEventListener('input', handleSearch);

    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (langToggle) langToggle.addEventListener('click', toggleLanguage);

    document.getElementById('cancel-delete').addEventListener('click', () => {
        deleteModal.classList.remove('active');
    });

    document.getElementById('confirm-delete').addEventListener('click', deleteProject);

    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            deleteModal.classList.remove('active');
        }
    });
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Start
document.addEventListener('DOMContentLoaded', init);
