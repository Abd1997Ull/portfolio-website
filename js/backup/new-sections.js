// FAQ Toggle Function
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');

    // Close all other FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });

    // Toggle current item
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Chat Widget Functions
function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
        chatWindow.classList.toggle('active');
    }
}

function sendQuickReply(type) {
    const currentLang = localStorage.getItem('lang') || 'en';
    const responses = {
        en: {
            pricing: {
                question: "What are your prices?",
                answer: "My pricing starts from $150 for basic projects. Professional packages start at $400, and enterprise solutions from $800+. Check the Pricing section for details or contact me for a custom quote!"
            },
            timeline: {
                question: "How long does development take?",
                answer: "Development time varies: Simple apps/websites take 1-2 weeks, medium projects 2-4 weeks, and complex solutions 1-2 months. I'll give you an accurate estimate after discussing your requirements."
            },
            contact: {
                question: "How can I contact you?",
                answer: "You can reach me via:\n📧 Email: bnbmwmrnrnmb@gmail.com\n📱 WhatsApp: +964 788 293 0896\n\nOr use the contact form on this website. I typically respond within 24 hours!"
            }
        },
        ar: {
            pricing: {
                question: "ما هي أسعارك؟",
                answer: "أسعاري تبدأ من 150$ للمشاريع البسيطة. الباقة الاحترافية تبدأ من 400$، والحلول المتكاملة من 800$ وأكثر. شوف قسم الأسعار للتفاصيل أو تواصل معي لعرض سعر مخصص!"
            },
            timeline: {
                question: "كم يستغرق التطوير؟",
                answer: "الوقت يختلف حسب المشروع: التطبيقات البسيطة 1-2 أسبوع، المشاريع المتوسطة 2-4 أسابيع، والحلول المعقدة 1-2 شهر. راح أعطيك تقدير دقيق بعد مناقشة متطلباتك."
            },
            contact: {
                question: "كيف أتواصل معك؟",
                answer: "تقدر تتواصل معي عن طريق:\n📧 الإيميل: bnbmwmrnrnmb@gmail.com\n📱 واتساب: +964 788 293 0896\n\nأو استخدم نموذج التواصل بالموقع. عادةً أرد خلال 24 ساعة!"
            }
        }
    };

    const lang = responses[currentLang] ? currentLang : 'en';
    const response = responses[lang][type];

    if (response) {
        addChatMessage(response.question, 'user');
        setTimeout(() => {
            addChatMessage(response.answer, 'bot');
        }, 500);
    }
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (message) {
        addChatMessage(message, 'user');
        input.value = '';

        // Auto-reply
        setTimeout(() => {
            const currentLang = localStorage.getItem('lang') || 'en';
            const autoReply = currentLang === 'ar'
                ? "شكراً لرسالتك! 😊 راح أرد عليك قريباً. للتواصل السريع، راسلني على واتساب: +964 788 293 0896"
                : "Thanks for your message! 😊 I'll get back to you soon. For faster response, message me on WhatsApp: +964 788 293 0896";
            addChatMessage(autoReply, 'bot');
        }, 1000);
    }
}

function addChatMessage(text, type) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;

    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function handleChatEnter(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

// Counter Animation for Stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                if (counter.id === 'stat-satisfaction') {
                    counter.textContent = Math.floor(current) + '%';
                }
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
                if (counter.id === 'stat-satisfaction') {
                    counter.textContent = target + '%';
                }
            }
        };

        updateCounter();
    });
}

// Intersection Observer for counter animation
const statsSection = document.querySelector('.stats-grid');
if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
}

// Add pricing link to navigation
document.addEventListener('DOMContentLoaded', function () {
    // Add Pricing and FAQ to navigation (if nav exists)
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        // Check if pricing link already exists
        if (!document.querySelector('a[href="#pricing"]')) {
            const pricingLi = document.createElement('li');
            pricingLi.innerHTML = '<a href="#pricing" class="nav-link" data-i18n="pricing" onclick="setActiveLink(this)">Pricing</a>';

            // Insert before contact
            const contactLi = navLinks.querySelector('a[href="#contact"]')?.parentElement;
            if (contactLi) {
                navLinks.insertBefore(pricingLi, contactLi);
            }
        }
    }
});

console.log('✅ New sections loaded: FAQ, Pricing, Chat Bot');
