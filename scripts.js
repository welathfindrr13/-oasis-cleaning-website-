// Oasis International Cleaning Services - Main JavaScript

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Form Validation
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        quoteForm.addEventListener('submit', handleQuoteSubmit);
    }
    
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    const careerForm = document.getElementById('career-form');
    if (careerForm) {
        careerForm.addEventListener('submit', handleCareerSubmit);
    }
    
    // Before/After Gallery Toggles (deprecated - only runs if elements exist)
    const galleryToggles = document.querySelectorAll('.gallery-toggle');
    if (galleryToggles.length > 0) {
        galleryToggles.forEach(toggle => {
            toggle.addEventListener('click', handleGalleryToggle);
        });
    }
    
    // Lazy Load Images
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
});

// UK Postcode Validation Regex (from spec)
const UK_POSTCODE_REGEX = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z]))))\s?[0-9][A-Za-z]{2})$/;

// Email Validation (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Form Validation Functions
function validateEmail(email) {
    return EMAIL_REGEX.test(email);
}

function validatePostcode(postcode) {
    return UK_POSTCODE_REGEX.test(postcode.trim());
}

function validatePhone(phone) {
    // UK phone number: digits, spaces, + allowed
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return /^(\+44|0)[0-9]{10}$/.test(cleanPhone) || /^[0-9]{10,11}$/.test(cleanPhone);
}

function validateRequired(value) {
    return value.trim().length >= 2;
}

function showError(field, message) {
    const errorDiv = field.parentElement.querySelector('.form-error') || document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    
    if (!field.parentElement.querySelector('.form-error')) {
        field.parentElement.appendChild(errorDiv);
    }
    
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', errorDiv.id || 'error-' + field.name);
}

function clearError(field) {
    const errorDiv = field.parentElement.querySelector('.form-error');
    if (errorDiv) {
        errorDiv.remove();
    }
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
}

function clearAllErrors(form) {
    form.querySelectorAll('.form-field').forEach(field => clearError(field));
}

// Quote Form Handler
async function handleQuoteSubmit(e) {
    e.preventDefault();
    clearAllErrors(e.target);
    
    const formData = new FormData(e.target);
    let isValid = true;
    let firstInvalidField = null;
    
    // Validate full_name
    const fullName = formData.get('full_name');
    if (!validateRequired(fullName)) {
        const field = e.target.querySelector('[name="full_name"]');
        showError(field, 'Please enter your full name (minimum 2 characters)');
        if (!firstInvalidField) firstInvalidField = field;
        isValid = false;
    }
    
    // Validate email
    const email = formData.get('email');
    if (!validateEmail(email)) {
        const field = e.target.querySelector('[name="email"]');
        showError(field, 'Please enter a valid email address');
        if (!firstInvalidField) firstInvalidField = field;
        isValid = false;
    }
    
    // Validate phone
    const phone = formData.get('phone');
    if (!validatePhone(phone)) {
        const field = e.target.querySelector('[name="phone"]');
        showError(field, 'Please enter a valid UK phone number');
        if (!firstInvalidField) firstInvalidField = field;
        isValid = false;
    }
    
    // Validate postcode
    const postcode = formData.get('postcode');
    if (!validatePostcode(postcode)) {
        const field = e.target.querySelector('[name="postcode"]');
        showError(field, 'Please enter a valid UK postcode');
        if (!firstInvalidField) firstInvalidField = field;
        isValid = false;
    }
    
    // Validate service_type
    const serviceType = formData.get('service_type');
    if (!serviceType) {
        const field = e.target.querySelector('[name="service_type"]');
        showError(field, 'Please select a service type');
        if (!firstInvalidField) firstInvalidField = field;
        isValid = false;
    }
    
    // Validate frequency
    const frequency = formData.get('frequency');
    if (!frequency) {
        const field = e.target.querySelector('[name="frequency"]');
        showError(field, 'Please select a frequency');
        if (!firstInvalidField) firstInvalidField = field;
        isValid = false;
    }
    
    // Message is optional but check length if provided
    const message = formData.get('message');
    if (message && message.length > 1000) {
        const field = e.target.querySelector('[name="message"]');
        showError(field, 'Message must be less than 1000 characters');
        if (!firstInvalidField) firstInvalidField = field;
        isValid = false;
    }
    
    if (!isValid) {
        firstInvalidField.focus();
        return false;
    }
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    
    try {
        // Convert FormData to JSON
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        
        // Get API endpoint from environment or use default
        const API_ENDPOINT = window.QUOTE_API_ENDPOINT || 'http://localhost:3000/api/quote';
        
        // Send to backend API
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObject)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to submit quote request');
        }
        
        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-8';
        successDiv.innerHTML = `
            <h3 class="text-h3 text-grey-900 mb-3">Thanks—your request has been received</h3>
            <p class="text-body text-grey-700 mb-4">A member of our team will contact you within one working day using the details provided.</p>
            <div class="text-small text-grey-700">
                <p><strong>Name:</strong> ${fullName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Service:</strong> ${serviceType}</p>
                <p><strong>Frequency:</strong> ${frequency}</p>
                <p><strong>Postcode:</strong> ${postcode}</p>
                ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
            </div>
        `;
        
        e.target.style.display = 'none';
        e.target.parentElement.insertBefore(successDiv, e.target);
        
        // Scroll to success message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
    } catch (error) {
        console.error('Error submitting quote:', error);
        
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-6';
        errorDiv.innerHTML = `
            <h3 class="text-h3 text-grey-900 mb-3">Submission Failed</h3>
            <p class="text-body text-grey-700 mb-4">${error.message || 'Unable to submit your quote request at this time.'}</p>
            <p class="text-body text-grey-700">Please try again or call us directly at <a href="tel:+442037508878" class="text-green-500 hover:underline font-semibold">020 3750 8878</a></p>
        `;
        
        e.target.parentElement.insertBefore(errorDiv, e.target);
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove error message after 10 seconds
        setTimeout(() => errorDiv.remove(), 10000);
        
        // Reset button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
    
    return false;
}

// Contact Form Handler
function handleContactSubmit(e) {
    e.preventDefault();
    clearAllErrors(e.target);
    
    const formData = new FormData(e.target);
    let isValid = true;
    let firstInvalidField = null;
    
    const fullName = formData.get('full_name');
    if (!validateRequired(fullName)) {
        const field = e.target.querySelector('[name="full_name"]');
        showError(field, 'Please enter your full name');
        if (!firstInvalidField) firstInvalidField = field;
        isValid = false;
    }
    
    const email = formData.get('email');
    if (!validateEmail(email)) {
        const field = e.target.querySelector('[name="email"]');
        showError(field, 'Please enter a valid email address');
        if (!firstInvalidField) firstInvalidField = field;
        isValid = false;
    }
    
    const phone = formData.get('phone');
    if (!validatePhone(phone)) {
        const field = e.target.querySelector('[name="phone"]');
        showError(field, 'Please enter a valid UK phone number');
        if (!firstInvalidField) firstInvalidField = field;
        isValid = false;
    }
    
    if (!isValid) {
        firstInvalidField.focus();
        return false;
    }
    
    // Show success
    const successDiv = document.createElement('div');
    successDiv.className = 'bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-8';
    successDiv.innerHTML = `
        <h3 class="text-h3 text-grey-900 mb-3">Message received</h3>
        <p class="text-body text-grey-700">We'll respond within one working day.</p>
    `;
    
    e.target.style.display = 'none';
    e.target.parentElement.insertBefore(successDiv, e.target);
    
    return false;
}

// Career Form Handler
function handleCareerSubmit(e) {
    e.preventDefault();
    clearAllErrors(e.target);
    
    const formData = new FormData(e.target);
    let isValid = true;
    let firstInvalidField = null;
    
    const fullName = formData.get('full_name');
    if (!validateRequired(fullName)) {
        const field = e.target.querySelector('[name="full_name"]');
        showError(field, 'Please enter your full name');
        if (!firstInvalidField) firstInvalidField = field;
        isValid = false;
    }
    
    const email = formData.get('email');
    if (!validateEmail(email)) {
        const field = e.target.querySelector('[name="email"]');
        showError(field, 'Please enter a valid email address');
        if (!firstInvalidField) firstInvalidField = field;
        isValid = false;
    }
    
    const phone = formData.get('phone');
    if (!validatePhone(phone)) {
        const field = e.target.querySelector('[name="phone"]');
        showError(field, 'Please enter a valid UK phone number');
        if (!firstInvalidField) firstInvalidField = field;
        isValid = false;
    }
    
    const rightToWork = formData.get('right_to_work');
    if (!rightToWork) {
        const field = e.target.querySelector('[name="right_to_work"]');
        showError(field, 'Please confirm you have the right to work in the UK');
        if (!firstInvalidField) firstInvalidField = field;
        isValid = false;
    }
    
    if (!isValid) {
        firstInvalidField.focus();
        return false;
    }
    
    // Show success
    const successDiv = document.createElement('div');
    successDiv.className = 'bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-8';
    successDiv.innerHTML = `
        <h3 class="text-h3 text-grey-900 mb-3">Application received</h3>
        <p class="text-body text-grey-700">Thank you for your interest. We'll review your application and be in touch.</p>
    `;
    
    e.target.style.display = 'none';
    e.target.parentElement.insertBefore(successDiv, e.target);
    
    return false;
}

// Gallery Toggle Handler
function handleGalleryToggle(e) {
    const button = e.currentTarget;
    const container = button.closest('.gallery-item');
    const beforeImg = container.querySelector('.before-img');
    const afterImg = container.querySelector('.after-img');
    const buttons = container.querySelectorAll('.gallery-toggle');
    
    if (button.dataset.view === 'before') {
        beforeImg.classList.remove('hidden');
        afterImg.classList.add('hidden');
        buttons[0].classList.add('active');
        buttons[1].classList.remove('active');
        buttons[0].setAttribute('aria-expanded', 'true');
        buttons[1].setAttribute('aria-expanded', 'false');
    } else {
        beforeImg.classList.add('hidden');
        afterImg.classList.remove('hidden');
        buttons[0].classList.remove('active');
        buttons[1].classList.add('active');
        buttons[0].setAttribute('aria-expanded', 'false');
        buttons[1].setAttribute('aria-expanded', 'true');
    }
}

// Cookie Banner (Simple localStorage implementation)
if (!localStorage.getItem('cookies-accepted')) {
    const banner = document.createElement('div');
    banner.className = 'fixed bottom-0 left-0 right-0 bg-grey-900 text-white p-4 z-50';
    banner.innerHTML = `
        <div class="max-w-container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p class="text-body">We use essential cookies to ensure the website functions correctly.</p>
            <button id="accept-cookies" class="btn-primary">Accept</button>
        </div>
    `;
    document.body.appendChild(banner);
    
    document.getElementById('accept-cookies').addEventListener('click', function() {
        localStorage.setItem('cookies-accepted', 'true');
        banner.remove();
    });
}
