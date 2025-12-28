// Reviews & Ratings System

import { db } from './firebase-config.js';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    doc,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Initialize Reviews for a Project
export async function initReviews(projectId) {
    const reviewsSection = document.getElementById('project-reviews');
    if (!reviewsSection) return;

    // Load existing reviews
    await loadReviews(projectId);

    // Setup review form
    setupReviewForm(projectId);
}

// Load Reviews from Firebase
export async function loadReviews(projectId) {
    try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(
            reviewsRef,
            where('projectId', '==', projectId),
            where('approved', '==', true),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        const snapshot = await getDocs(q);
        const reviews = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderReviews(reviews, projectId);
        updateRatingSummary(reviews);
    } catch (error) {
        console.error('Error loading reviews:', error);
        showReviewsError();
    }
}

// Render Reviews
function renderReviews(reviews, projectId) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;

    if (reviews.length === 0) {
        reviewsList.innerHTML = `
            <div class="reviews-empty">
                <i class="fas fa-comments"></i>
                <p data-i18n="no_reviews">لا توجد تقييمات بعد. كن أول من يقيّم!</p>
            </div>
        `;
        return;
    }

    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="review-author">
                    <div class="review-avatar">${getInitials(review.userName)}</div>
                    <div class="review-author-info">
                        <h5>${escapeHtml(review.userName)}</h5>
                        <span class="review-date">${formatDate(review.createdAt)}</span>
                    </div>
                </div>
                <div class="review-rating">
                    ${generateStars(review.rating)}
                </div>
            </div>
            ${review.comment ? `<p class="review-comment">${escapeHtml(review.comment)}</p>` : ''}
        </div>
    `).join('');

    // Update language
    if (window.updateTranslations) {
        window.updateTranslations();
    }
}

// Update Rating Summary
function updateRatingSummary(reviews) {
    const summaryContainer = document.getElementById('rating-summary');
    if (!summaryContainer || reviews.length === 0) {
        if (summaryContainer) {
            summaryContainer.innerHTML = `
                <div class="average-rating">
                    <div class="rating-number">0.0</div>
                    <div class="rating-stars">${generateStars(0)}</div>
                    <div class="rating-count" data-i18n="no_ratings">لا تقييمات</div>
                </div>
            `;
        }
        return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);

    summaryContainer.innerHTML = `
        <div class="average-rating">
            <div class="rating-number">${averageRating}</div>
            <div class="rating-stars">${generateStars(parseFloat(averageRating))}</div>
            <div class="rating-count">${reviews.length} <span data-i18n="reviews_count">تقييم</span></div>
        </div>
    `;

    // Update language
    if (window.updateTranslations) {
        window.updateTranslations();
    }
}

// Setup Review Form
function setupReviewForm(projectId) {
    const reviewForm = document.getElementById('review-form');
    if (!reviewForm) return;

    const starInputs = reviewForm.querySelectorAll('.star-input .star');
    let selectedRating = 0;

    // Star rating interaction
    starInputs.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            updateStarInput(starInputs, selectedRating);
        });

        star.addEventListener('mouseenter', () => {
            updateStarInput(starInputs, index + 1);
        });
    });

    const starInputContainer = document.querySelector('.star-input');
    if (starInputContainer) {
        starInputContainer.addEventListener('mouseleave', () => {
            updateStarInput(starInputs, selectedRating);
        });
    }

    // Form submission
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (selectedRating === 0) {
            if (window.showToast) {
                window.showToast(getCurrentLang() === 'ar' ? 'الرجاء اختيار التقييم' : 'Please select a rating', 'warning');
            } else {
                alert(getCurrentLang() === 'ar' ? 'الرجاءاختيار التقييم' : 'Please select a rating');
            }
            return;
        }

        const userName = document.getElementById('reviewer-name').value.trim();
        const userEmail = document.getElementById('reviewer-email').value.trim();
        const comment = document.getElementById('review-comment').value.trim();

        if (!userName || !userEmail) {
            if (window.showToast) {
                window.showToast(getCurrentLang() === 'ar' ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill all required fields', 'warning');
            }
            return;
        }

        try {
            // Add review to Firestore
            await addDoc(collection(db, 'reviews'), {
                projectId: projectId,
                userName: userName,
                userEmail: userEmail,
                rating: selectedRating,
                comment: comment,
                createdAt: serverTimestamp(),
                approved: true // Auto-approve for now, can add moderation later
            });

            // Update project's rating statistics
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, {
                reviewCount: increment(1),
                totalRating: increment(selectedRating)
            });

            // Show success message
            if (window.showToast) {
                window.showToast(
                    getCurrentLang() === 'ar' ? 'شكراً! تم إضافة تقييمك بنجاح' : 'Thank you! Your review has been added',
                    'success'
                );
            }

            // Reset form
            reviewForm.reset();
            selectedRating = 0;
            updateStarInput(starInputs, 0);

            // Reload reviews
            await loadReviews(projectId);

        } catch (error) {
            console.error('Error submitting review:', error);
            if (window.showToast) {
                window.showToast(
                    getCurrentLang() === 'ar' ? 'حدث خطأ أثناء إضافة التقييم' : 'Error submitting review',
                    'error'
                );
            }
        }
    });
}

// Update Star Input Visual
function updateStarInput(stars, rating) {
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });
}

// Generate Star HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let html = '';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
        html += '<i class="fas fa-star star filled"></i>';
    }

    // Half star
    if (hasHalfStar) {
        html += '<i class="fas fa-star-half-alt star half-filled"></i>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        html += '<i class="far fa-star star"></i>';
    }

    return html;
}

// Get user initials for avatar
function getInitials(name) {
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// Format date
function formatDate(timestamp) {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const lang = getCurrentLang();

    if (diffDays === 0) {
        return lang === 'ar' ? 'اليوم' : 'Today';
    } else if (diffDays === 1) {
        return lang === 'ar' ? 'أمس' : 'Yesterday';
    } else if (diffDays < 7) {
        return lang === 'ar' ? `منذ ${diffDays} أيام` : `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Get current language
function getCurrentLang() {
    return localStorage.getItem('lang') || 'ar';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show error state
function showReviewsError() {
    const reviewsList = document.getElementById('reviews-list');
    if (reviewsList) {
        reviewsList.innerHTML = `
            <div class="reviews-empty">
                <i class="fas fa-exclamation-circle"></i>
                <p data-i18n="reviews_error">حدث خطأ في تحميل التقييمات</p>
            </div>
        `;
    }
}

// Load Top Reviews for Testimonials Section
export async function loadTopTestimonials() {
    try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(
            reviewsRef,
            where('approved', '==', true),
            where('rating', '>=', 4),
            orderBy('rating', 'desc'),
            orderBy('createdAt', 'desc'),
            limit(5)
        );

        const snapshot = await getDocs(q);
        const testimonials = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return testimonials;
    } catch (error) {
        console.error('Error loading testimonials:', error);
        return [];
    }
}

// Initialize Testimonials Carousel
export async function initTestimonialsCarousel() {
    const carousel = document.getElementById('testimonials-carousel');
    if (!carousel) return;

    const testimonials = await loadTopTestimonials();

    if (testimonials.length === 0) {
        carousel.innerHTML = `
            <div class="reviews-empty">
                <p data-i18n="no_testimonials">لا توجد تقييمات بعد</p>
            </div>
        `;
        return;
    }

    renderTestimonials(testimonials);
    startCarousel();
}

// Render Testimonials
function renderTestimonials(testimonials) {
    const carousel = document.getElementById('testimonials-carousel');
    if (!carousel) return;

    carousel.innerHTML = `
        ${testimonials.map((testimonial, index) => `
            <div class="testimonial-card ${index === 0 ? 'active' : ''}" data-index="${index}">
                <div class="testimonial-rating">${generateStars(testimonial.rating)}</div>
                <p class="testimonial-comment">"${escapeHtml(testimonial.comment || '')}"</p>
                <div class="testimonial-author">${escapeHtml(testimonial.userName)}</div>
            </div>
        `).join('')}
        
        <div class="carousel-controls">
            <button class="carousel-btn" id="prev-testimonial">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="carousel-btn" id="next-testimonial">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
        
        <div class="carousel-indicators">
            ${testimonials.map((_, index) => `
                <span class="indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
            `).join('')}
        </div>
    `;

    // Setup controls
    document.getElementById('prev-testimonial')?.addEventListener('click', () => navigateCarousel(-1));
    document.getElementById('next-testimonial')?.addEventListener('click', () => navigateCarousel(1));

    document.querySelectorAll('.indicator').forEach(indicator => {
        indicator.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            showTestimonial(index);
        });
    });
}

let currentTestimonialIndex = 0;
let carouselInterval;

// Start Auto Carousel
function startCarousel() {
    carouselInterval = setInterval(() => {
        navigateCarousel(1);
    }, 5000); // Change every 5 seconds
}

// Navigate Carousel
function navigateCarousel(direction) {
    const testimonials = document.querySelectorAll('.testimonial-card');
    const totalTestimonials = testimonials.length;

    currentTestimonialIndex = (currentTestimonialIndex + direction + totalTestimonials) % totalTestimonials;
    showTestimonial(currentTestimonialIndex);
}

// Show Specific Testimonial
function showTestimonial(index) {
    const testimonials = document.querySelectorAll('.testimonial-card');
    const indicators = document.querySelectorAll('.indicator');

    testimonials.forEach((card, i) => {
        card.classList.toggle('active', i === index);
    });

    indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
    });

    currentTestimonialIndex = index;
}
