// Admin Panel JavaScript - Firebase Integration
import { auth, db, storage } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// State
let projects = [];
let editingId = null;
let deleteId = null;
let currentLang = 'ar';
let currentTheme = 'light';
let currentUser = null;
let uploadedImageFile = null;

// Load from localStorage
try {
    currentLang = localStorage.getItem('lang') || 'ar';
    currentTheme = localStorage.getItem('theme') || 'light';
} catch (e) {
    console.error('Error loading settings:', e);
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
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('image-preview');

// Check Authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log('✅ User authenticated:', user.email);
        init();
    } else {
        // Redirect to login
        window.location.href = 'admin-login.html';
    }
});

// Initialize
async function init() {
    setTheme(currentTheme);
    setLanguage(currentLang);
    await loadProjects();
    setupEventListeners();
    addLogoutButton();
}

// Add Logout Button
function addLogoutButton() {
    const headerControls = document.querySelector('.header-controls');
    if (headerControls && !document.getElementById('logout-btn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.className = 'btn-secondary';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> <span>تسجيل الخروج</span>';
        logoutBtn.onclick = handleLogout;
        headerControls.insertBefore(logoutBtn, headerControls.firstChild);
    }
}

// Logout
async function handleLogout() {
    try {
        await signOut(auth);
        window.location.href = 'admin-login.html';
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('خطأ في تسجيل الخروج', 'error');
    }
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

    // Re-render projects
    renderProjects();
}

function toggleLanguage() {
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
}

// Load Projects from Firestore
async function loadProjects() {
    try {
        showLoading(true);
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        projects = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderProjects();
        console.log(`✅ Loaded ${projects.length} projects from Firestore`);
    } catch (error) {
        console.error('Error loading projects:', error);
        showNotification('خطأ في تحميل المشاريع', 'error');
    } finally {
        showLoading(false);
    }
}

// Upload Image to Firebase Storage
async function uploadImage(file) {
    try {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `projects/${fileName}`);

        showNotification('جاري رفع الصورة...', 'info');

        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        showNotification('تم رفع الصورة بنجاح!', 'success');
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        showNotification('خطأ في رفع الصورة', 'error');
        throw error;
    }
}

// Add/Update Project
async function handleSubmit(e) {
    e.preventDefault();

    const titleAr = document.getElementById('title-ar').value.trim();
    const titleEn = document.getElementById('title-en').value.trim();
    const descAr = document.getElementById('desc-ar').value.trim();
    const descEn = document.getElementById('desc-en').value.trim();

    let imageUrl = document.getElementById('image').value.trim();

    // If user selected a file, upload it
    if (uploadedImageFile) {
        try {
            imageUrl = await uploadImage(uploadedImageFile);
        } catch (error) {
            return; // Stop if image upload fails
        }
    }

    const projectData = {
        title: {
            ar: titleAr,
            en: titleEn || titleAr
        },
        desc: {
            ar: descAr,
            en: descEn || descAr
        },
        category: document.getElementById('category').value,
        image: imageUrl,
        tech: document.getElementById('tech').value.split(',').map(t => t.trim()).filter(t => t),
        link: document.getElementById('link').value.trim() || '#',
        apkUrl: document.getElementById('apk-url').value.trim() || null,
        updatedAt: serverTimestamp()
    };

    try {
        showLoading(true);

        if (editingId) {
            // Update existing project
            const projectRef = doc(db, 'projects', editingId);
            await updateDoc(projectRef, projectData);
            showNotification('تم تحديث المشروع بنجاح!', 'success');
        } else {
            // Add new project
            projectData.createdAt = serverTimestamp();
            await addDoc(collection(db, 'projects'), projectData);
            showNotification('تم إضافة المشروع بنجاح!', 'success');
        }

        resetForm();
        await loadProjects();
    } catch (error) {
        console.error('Error saving project:', error);
        showNotification('خطأ في حفظ المشروع', 'error');
    } finally {
        showLoading(false);
    }
}

// Edit Project
function editProject(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    editingId = id;

    document.getElementById('title-ar').value = project.title.ar;
    document.getElementById('title-en').value = (project.title.en !== project.title.ar) ? project.title.en : '';

    document.getElementById('desc-ar').value = project.desc.ar;
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

async function deleteProject() {
    try {
        showLoading(true);
        await deleteDoc(doc(db, 'projects', deleteId));
        showNotification('تم حذف المشروع بنجاح!', 'success');
        await loadProjects();
    } catch (error) {
        console.error('Error deleting project:', error);
        showNotification('خطأ في حذف المشروع', 'error');
    } finally {
        showLoading(false);
        deleteModal.classList.remove('active');
        deleteId = null;
    }
}

// Reset Form
function resetForm() {
    projectForm.reset();
    editingId = null;
    uploadedImageFile = null;
    if (imagePreview) imagePreview.innerHTML = '';
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
                    <button class="btn btn-edit" onclick="editProject('${project.id}')">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="btn btn-delete" onclick="confirmDelete('${project.id}')">
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

// Show Loading
function showLoading(show) {
    const loadingDiv = document.getElementById('loading') || createLoadingDiv();
    loadingDiv.style.display = show ? 'flex' : 'none';
}

function createLoadingDiv() {
    const div = document.createElement('div');
    div.id = 'loading';
    div.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    div.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 10px; text-align: center;">
            <div class="spinner" style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--accent-color); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
            <p style="color: #333;">جاري التحميل...</p>
        </div>
    `;
    document.body.appendChild(div);
    return div;
}

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6'
    };

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.success};
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

// Handle Image File Selection
function handleImageSelect(e) {
    const file = e.target.files[0];
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('الرجاء اختيار صورة فقط', 'error');
            e.target.value = '';
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('حجم الصورة يجب أن يكون أقل من 5 ميجابايت', 'error');
            e.target.value = '';
            return;
        }

        uploadedImageFile = file;

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            if (imagePreview) {
                imagePreview.innerHTML = `
                    <img src="${e.target.result}" style="max-width: 200px; border-radius: 10px; margin-top: 10px;">
                    <p style="margin-top: 5px; color: var(--text-secondary);">سيتم رفع الصورة عند حفظ المشروع</p>
                `;
            }
        };
        reader.readAsDataURL(file);
    }
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

    // Image file input listener
    const imageFileInput = document.getElementById('image-file');
    if (imageFileInput) {
        imageFileInput.addEventListener('change', handleImageSelect);
    }
}

// Make functions global
window.editProject = editProject;
window.confirmDelete = confirmDelete;

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
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
