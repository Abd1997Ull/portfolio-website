// Animated Counters
class AnimatedCounter {
    constructor(element, target, duration = 2000) {
        this.element = element;
        this.target = target;
        this.duration = duration;
        this.started = false;
    }

    animate() {
        if (this.started) return;
        this.started = true;

        const start = 0;
        const increment = this.target / (this.duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= this.target) {
                current = this.target;
                clearInterval(timer);
            }
            this.element.textContent = Math.floor(current);
        }, 16);
    }
}

// Initialize counters on scroll
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                const counter = new AnimatedCounter(entry.target, target);
                counter.animate();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

// Testimonials Carousel
class TestimonialsCarousel {
    constructor() {
        this.currentIndex = 0;
        this.testimonials = document.querySelectorAll('.testimonial-card');
        this.indicators = document.querySelectorAll('.indicator');
        this.init();
    }

    init() {
        if (this.testimonials.length === 0) return;

        // Show first testimonial
        this.show(0);

        // Auto-play
        setInterval(() => this.next(), 5000);

        // Controls
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');

        if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
        if (nextBtn) nextBtn.addEventListener('click', () => this.next());

        // Indicators
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.show(index));
        });
    }

    show(index) {
        this.testimonials.forEach(t => t.classList.remove('active'));
        this.indicators.forEach(i => i.classList.remove('active'));

        this.currentIndex = index;
        this.testimonials[index].classList.add('active');
        this.indicators[index].classList.add('active');
    }

    next() {
        const nextIndex = (this.currentIndex + 1) % this.testimonials.length;
        this.show(nextIndex);
    }

    prev() {
        const prevIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
        this.show(prevIndex);
    }
}

// Confetti Effect
function triggerConfetti() {
    if (typeof confetti === 'undefined') {
        console.warn('Confetti library not loaded');
        return;
    }

    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initCounters();
    new TestimonialsCarousel();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AnimatedCounter, TestimonialsCarousel, triggerConfetti };
}
