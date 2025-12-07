// Services Page - Cost Calculator

document.addEventListener('DOMContentLoaded', function () {
    const calculator = document.getElementById('cost-calculator');
    if (!calculator) return;

    const projectTypeSelect = document.getElementById('project-type');
    const pagesInput = document.getElementById('pages-count');
    const featureCheckboxes = document.querySelectorAll('input[name="feature"]');
    const costDisplay = document.getElementById('calculated-cost');
    const requestQuoteBtn = document.getElementById('request-quote');

    // Base prices
    const basePrices = {
        mobile: 400,
        web: 300,
        both: 650,
        design: 250
    };

    const pricePerPage = 30;

    // Calculate cost
    function calculateCost() {
        const projectType = projectTypeSelect.value;
        const pagesCount = parseInt(pagesInput.value) || 5;

        if (!projectType) {
            costDisplay.textContent = '0';
            return;
        }

        let totalCost = basePrices[projectType] || 0;

        // Add cost based on pages
        if (pagesCount > 5) {
            totalCost += (pagesCount - 5) * pricePerPage;
        }

        // Add features cost
        featureCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                totalCost += parseInt(checkbox.value) || 0;
            }
        });

        // Animate the number change
        animateValue(costDisplay, parseInt(costDisplay.textContent), totalCost, 500);
    }

    // Animate number
    function animateValue(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.round(current);
        }, 16);
    }

    // Event listeners
    projectTypeSelect.addEventListener('change', calculateCost);
    pagesInput.addEventListener('input', calculateCost);
    featureCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculateCost);
    });

    // Request Quote
    requestQuoteBtn.addEventListener('click', function () {
        const projectType = projectTypeSelect.value;
        const pagesCount = pagesInput.value;
        const selectedFeatures = [];

        featureCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const label = checkbox.nextElementSibling.textContent;
                selectedFeatures.push(label);
            }
        });

        const estimatedCost = costDisplay.textContent;

        if (!projectType) {
            alert(getCurrentLang() === 'ar' ? 'الرجاء اختيار نوع المشروع' : 'Please select project type');
            return;
        }

        // Create email body
        const lang = getCurrentLang();
        const subject = lang === 'ar' ? 'طلب عرض سعر' : 'Request for Quote';

        let body = lang === 'ar' ?
            `السلام عليكم،\n\nأرغب في الحصول على عرض سعر للمشروع التالي:\n\n` :
            `Hello,\n\nI would like to request a quote for the following project:\n\n`;

        body += lang === 'ar' ?
            `نوع المشروع: ${getProjectTypeText(projectType)}\n` :
            `Project Type: ${getProjectTypeText(projectType)}\n`;

        body += lang === 'ar' ?
            `عدد الصفحات/الشاشات: ${pagesCount}\n` :
            `Number of Pages/Screens: ${pagesCount}\n`;

        if (selectedFeatures.length > 0) {
            body += lang === 'ar' ?
                `\nالميزات المطلوبة:\n${selectedFeatures.map(f => `- ${f}`).join('\n')}\n` :
                `\nRequired Features:\n${selectedFeatures.map(f => `- ${f}`).join('\n')}\n`;
        }

        body += lang === 'ar' ?
            `\nالتكلفة التقريبية: $${estimatedCost}\n\n` :
            `\nEstimated Cost: $${estimatedCost}\n\n`;

        body += lang === 'ar' ?
            `يرجى التواصل معي لمناقشة التفاصيل.\n\nشكراً` :
            `Please contact me to discuss the details.\n\nThank you`;

        // Open email client
        const emailLink = `mailto:bnbmwmrnrnmb@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = emailLink;
    });

    // Get project type text
    function getProjectTypeText(type) {
        const lang = getCurrentLang();
        const types = {
            mobile: lang === 'ar' ? 'تطبيق موبايل' : 'Mobile App',
            web: lang === 'ar' ? 'موقع ويب' : 'Website',
            both: lang === 'ar' ? 'تطبيق وموقع' : 'App & Website',
            design: lang === 'ar' ? 'تصميم فقط' : 'Design Only'
        };
        return types[type] || type;
    }

    // Get current language
    function getCurrentLang() {
        return localStorage.getItem('lang') || 'ar';
    }

    // Initialize
    calculateCost();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    // Trigger initial translation update if available
    if (window.updateTranslations) {
        window.updateTranslations();
    }
});
