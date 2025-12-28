// Particles Background Animation System
class ParticlesBackground {
    constructor(containerId = 'particles-container') {
        this.container = null;
        this.containerId = containerId;
        this.particles = [];
        this.particleCount = this.getParticleCount();
        this.colors = ['var(--accent-primary)', 'var(--accent-secondary)', 'var(--accent-tertiary)'];
        this.init();
    }

    getParticleCount() {
        const width = window.innerWidth;
        if (width < 768) return 15; // Mobile
        if (width < 1200) return 25; // Tablet
        return 40; // Desktop
    }

    init() {
        // Create container if it doesn't exist
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = this.containerId;
            this.container.className = 'particles-container';
            document.body.insertBefore(this.container, document.body.firstChild);
        }

        this.createParticles();
        this.setupMouseInteraction();
        this.handleResize();
    }

    createParticles() {
        // Clear existing particles
        this.container.innerHTML = '';
        this.particles = [];

        for (let i = 0; i < this.particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // Random position
            const x = Math.random() * 100;
            const y = Math.random() * 100;

            // Random size (3-10px)
            const size = Math.random() * 7 + 3;

            // Random animation duration (10-25s)
            const duration = Math.random() * 15 + 10;

            // Random delay (0-10s)
            const delay = Math.random() * 10;

            // Random color from palette
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];

            particle.style.cssText = `
                left: ${x}%;
                top: ${y}%;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                animation-duration: ${duration}s;
                animation-delay: -${delay}s;
                opacity: ${Math.random() * 0.4 + 0.2};
            `;

            this.container.appendChild(particle);
            this.particles.push(particle);
        }
    }

    setupMouseInteraction() {
        let mouseX = 0;
        let mouseY = 0;
        let isMoving = false;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!isMoving) {
                isMoving = true;
                requestAnimationFrame(() => {
                    this.repelParticles(mouseX, mouseY);
                    isMoving = false;
                });
            }
        });
    }

    repelParticles(mouseX, mouseY) {
        const repelRadius = 100;

        this.particles.forEach(particle => {
            const rect = particle.getBoundingClientRect();
            const particleX = rect.left + rect.width / 2;
            const particleY = rect.top + rect.height / 2;

            const dx = particleX - mouseX;
            const dy = particleY - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < repelRadius) {
                const force = (repelRadius - distance) / repelRadius;
                const moveX = (dx / distance) * force * 20;
                const moveY = (dy / distance) * force * 20;

                particle.style.transform = `translate(${moveX}px, ${moveY}px)`;
                particle.style.opacity = '0.8';
            } else {
                particle.style.transform = '';
                particle.style.opacity = '';
            }
        });
    }

    handleResize() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.particleCount = this.getParticleCount();
                this.createParticles();
            }, 250);
        });
    }

    // Method to pause/resume animation (for performance)
    pause() {
        this.particles.forEach(p => p.style.animationPlayState = 'paused');
    }

    resume() {
        this.particles.forEach(p => p.style.animationPlayState = 'running');
    }
}

// Animated Service Icons Enhancement
class AnimatedServiceIcons {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupIcons());
        } else {
            this.setupIcons();
        }
    }

    setupIcons() {
        // Find all service card icon containers and add animation classes
        const serviceCards = document.querySelectorAll('#services .glass');

        serviceCards.forEach((card, index) => {
            // Add service-card class
            card.classList.add('service-card');

            // Find the icon container (first div inside the card)
            const iconContainer = card.querySelector('div');
            if (iconContainer && iconContainer.querySelector('i')) {
                iconContainer.classList.add('service-icon-animated');

                // Add floating animation with staggered delay
                iconContainer.classList.add('floating');
                iconContainer.style.animationDelay = `${index * 0.2}s`;

                // Add entrance animation
                this.animateOnScroll(card, index);
            }
        });
    }

    animateOnScroll(card, index) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        // Set initial state
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        observer.observe(card);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particles background
    window.particlesBackground = new ParticlesBackground();

    // Initialize animated service icons
    window.animatedServiceIcons = new AnimatedServiceIcons();

    console.log('✨ Particles and animated icons initialized');
});

// Pause animations when page is not visible (performance optimization)
document.addEventListener('visibilitychange', () => {
    if (window.particlesBackground) {
        if (document.hidden) {
            window.particlesBackground.pause();
        } else {
            window.particlesBackground.resume();
        }
    }
});
