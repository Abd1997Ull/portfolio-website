// Schema.org Structured Data (JSON-LD)

// Generate Person Schema for Developer
function generatePersonSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Abdullah Salam",
        "alternateName": "AbdullahStudio",
        "jobTitle": "Flutter & Web Developer",
        "description": "Professional Flutter and Web Developer with 4 years of experience in building modern digital solutions",
        "url": "https://abdullahstudio.netlify.app/",
        "image": "https://abdullahstudio.netlify.app/favicon.png",
        "email": "bnbmwmrnrnmb@gmail.com",
        "telephone": "+964-788-2930896",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "IQ"
        },
        "sameAs": [
            "https://github.com/abdullahsalam",
            "https://linkedin.com/in/abdullahsalam",
            "https://wa.me/9647882930896"
        ],
        "knowsAbout": [
            "Flutter Development",
            "Web Development",
            "HTML5",
            "CSS3",
            "JavaScript",
            "Firebase",
            "UI/UX Design",
            "Mobile App Development"
        ]
    };
}

// Generate WebSite Schema
function generateWebSiteSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "AbdullahStudio - Portfolio",
        "description": "Professional Flutter and Web Developer Portfolio showcasing mobile apps and responsive websites",
        "url": "https://abdullahstudio.netlify.app/",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://abdullahstudio.netlify.app/#portfolio?search={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };
}

// Generate CreativeWork Schema for Project
function generateProjectSchema(project) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": project.title.en || project.title.ar,
        "description": project.desc.en || project.desc.ar,
        "image": project.image,
        "creator": {
            "@type": "Person",
            "name": "Abdullah Salam"
        },
        "keywords": project.tech ? project.tech.join(", ") : ""
    };

    // Add URL if available
    if (project.link && project.link !== '#') {
        schema.url = project.link;
    }

    // Add aggregate rating if available
    if (project.averageRating && project.reviewCount) {
        schema.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": (project.totalRating / project.reviewCount).toFixed(1),
            "reviewCount": project.reviewCount
        };
    }

    return schema;
}

// Generate Review Schema
function generateReviewSchema(review, project) {
    return {
        "@context": "https://schema.org",
        "@type": "Review",
        "itemReviewed": {
            "@type": "CreativeWork",
            "name": project.title.en || project.title.ar
        },
        "author": {
            "@type": "Person",
            "name": review.userName
        },
        "reviewRating": {
            "@type": "Rating",
            "ratingValue": review.rating,
            "bestRating": 5,
            "worstRating": 1
        },
        "reviewBody": review.comment || "",
        "datePublished": review.createdAt ? new Date(review.createdAt.toDate()).toISOString() : new Date().toISOString()
    };
}

// Generate Organization Schema
function generateOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "AbdullahStudio",
        "url": "https://abdullahstudio.netlify.app/",
        "logo": "https://abdullahstudio.netlify.app/favicon.png",
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+964-788-2930896",
            "contactType": "customer service",
            "availableLanguage": ["Arabic", "English"]
        },
        "sameAs": [
            "https://github.com/abdullahsalam",
            "https://linkedin.com/in/abdullahsalam"
        ]
    };
}

// Inject Schema to Page
function injectSchema(schemaObject) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaObject);
    document.head.appendChild(script);
}

// Initialize All Schemas on Page Load
function initializeSchemas() {
    // Add Person Schema
    injectSchema(generatePersonSchema());

    // Add WebSite Schema
    injectSchema(generateWebSiteSchema());

    // Add Organization Schema
    injectSchema(generateOrganizationSchema());

    console.log('✅ Schema.org structured data injected');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSchemas);
} else {
    initializeSchemas();
}

// Export functions for use in other files
if (typeof window !== 'undefined') {
    window.generateProjectSchema = generateProjectSchema;
    window.generateReviewSchema = generateReviewSchema;
    window.injectSchema = injectSchema;
}

