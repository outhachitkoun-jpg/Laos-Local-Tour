document.addEventListener('DOMContentLoaded', () => {

    // ========== 📱 WHATSAPP CLICK TRACKING NOTIFIER ==========
    const notifyWhatsAppClick = (url) => {
        if (!url || typeof url !== 'string' || (!url.includes('wa.me') && !url.includes('whatsapp.com'))) return;

        try {
            const pageName = document.title || window.location.pathname;
            const message = `A guest clicked to initiate a WhatsApp inquiry!\n\nPage: ${pageName}\nWebsite URL: ${window.location.href}\nTarget Link: ${url}`;

            const formData = new FormData();
            formData.append('_subject', `New WhatsApp Inquiry Alert! -> ${pageName}`);
            formData.append('email', 'noreply@laosdreamdestination.com');
            formData.append('message', message);

            // Append some extra details
            formData.append('Source Page', pageName);
            formData.append('Page URL', window.location.href);
            formData.append('WhatsApp Destination', url);

            fetch('https://formsubmit.co/ajax/luangprabangdreamdestination@gmail.com', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).catch(e => console.log('Silently ignored Notification', e));
        } catch (e) { }
    };

    // Track standard link clicks anywhere on the document
    document.body.addEventListener('click', (e) => {
        const target = e.target.closest('a');
        if (target && target.href) {
            notifyWhatsAppClick(target.href);
        }
    });

    // Track programmatic window.open calls (like those from forms)
    const originalWindowOpen = window.open;
    window.open = function (url, target, features) {
        notifyWhatsAppClick(url);
        return originalWindowOpen.call(window, url, target, features);
    };

    // ========== 🕵️ HEADER SCROLL LOGIC ==========
    const header = document.querySelector('.site-header');
    const handleScroll = () => {
        if (!header) return;
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
            header.classList.remove('site-header--glass');
        } else {
            header.classList.remove('scrolled');
            header.classList.add('site-header--glass');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // ========== 📱 MOBILE MENU ==========
    const menuToggle = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('main-nav');

    // Create overlay if it doesn't exist
    let overlay = document.querySelector('.nav-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
    }

    const toggleMenu = () => {
        if (!nav || !menuToggle) return;
        nav.classList.toggle('active');
        menuToggle.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    };

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
    }

    // ========== 📱 MOBILE DROPDOWNS ==========
    const dropdowns = document.querySelectorAll('.has-dropdown, .has-subdropdown');
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 991) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    });

    // ========== 🌍 LANGUAGE PICKER ==========
    const langDropdown = document.querySelector('.lang-dropdown');
    if (langDropdown) {
        langDropdown.addEventListener('click', (e) => {
            if (!e.target.closest('.lang-btn')) {
                langDropdown.classList.toggle('active');
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (langDropdown && !langDropdown.contains(e.target)) {
            langDropdown.classList.remove('active');
        }
    });

    // ========== 🌊 SCROLL REVEAL (Intersection Observer) ==========
    const revealElements = document.querySelectorAll('.reveal');
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    // ========== ⚓ SMOOTH SCROLL ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ========== 📱 DYNAMIC MOBILE COMPONENTS ==========
    const injectMobileExtras = () => {
        // 1. Bottom Nav Tab Bar
        const bottomNav = document.createElement('nav');
        bottomNav.className = 'mobile-bottom-nav';

        // Determine active state
        const path = window.location.pathname;
        const isHome = path.includes('index.html') || path.endsWith('/');
        const isTours = path.includes('tour') || path.includes('tours.html');
        const isRentals = path.includes('rental');

        bottomNav.innerHTML = `
            <a href="index.html" class="mobile-nav-item ${isHome ? 'active' : ''}">
                <i class="fas fa-home"></i>
                <span data-i18n="nav_home">Home</span>
            </a>
            <a href="tours.html" class="mobile-nav-item ${isTours ? 'active' : ''}">
                <i class="fas fa-map-marked-alt"></i>
                <span data-i18n="nav_tours">Tours</span>
            </a>
            <a href="car-rentals.html" class="mobile-nav-item ${isRentals ? 'active' : ''}">
                <i class="fas fa-car"></i>
                <span data-i18n="nav_rentals">Rentals</span>
            </a>
            <a href="https://wa.me/8562098457614" class="mobile-nav-item">
                <i class="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
            </a>
        `;
        document.body.appendChild(bottomNav);

        // 2. WhatsApp Pulsed Floating Button
        if (!document.querySelector('.whatsapp-float')) {
            const waButton = document.createElement('a');
            waButton.href = 'https://wa.me/8562098457614';
            waButton.className = 'whatsapp-float';
            waButton.target = '_blank';
            waButton.innerHTML = '<i class="fab fa-whatsapp"></i>';
            document.body.appendChild(waButton);
        }

        // 3. Sticky Bottom CTA (Only on Tour/Rental sub-pages)
        const isSubPage = (path.includes('tour-') || path.includes('eco-dyeing') || path.includes('rentals.html') || path.includes('motorbike'));
        if (isSubPage) {
            const h1 = document.querySelector('h1')?.textContent || 'This Tour';
            let priceText = 'Best Price';
            const priceTags = Array.from(document.querySelectorAll('span, li, p')).filter(el => el.textContent.includes('$') || el.textContent.includes('KIP'));
            if (priceTags.length > 0) {
                priceTags.sort((a, b) => a.textContent.length - b.textContent.length);
                priceText = priceTags[0].textContent.trim();
            }

            const stickyCta = document.createElement('div');
            stickyCta.className = 'sticky-mobile-cta';
            stickyCta.innerHTML = `
                <div class="sticky-cta-info">
                    <span class="label">Now Booking</span>
                    <span class="price">${priceText}</span>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.bookFromSticky('${h1}', '${priceText}')">Inquire & Book</button>
            `;
            document.body.appendChild(stickyCta);
        }
    };

    window.bookFromSticky = (name, price) => {
        bookProduct(name, price);
    };

    // ========== ⚡ SMART IMAGE OPTIMIZER (Lazy Loading) ==========
    const optimizeImages = () => {
        const allImages = document.querySelectorAll('img');

        allImages.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            img.classList.add('img-lazy');

            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                });
            }
        });

        const imgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    imgObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        allImages.forEach(img => imgObserver.observe(img));
    };

    optimizeImages();
    injectMobileExtras();

    // ========== ❓ FAQ ACCORDION ==========
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => {
                    item.classList.toggle('active');
                    faqItems.forEach(other => {
                        if (other !== item) other.classList.remove('active');
                    });
                });
            }
        });
    }
});

// ========== 📩 FORM-FIRST INQUIRY LOGIC ==========
window.handleInquiry = async (mode, tourName) => {
    const name = document.getElementById('book-name')?.value;
    const phone = document.getElementById('book-phone')?.value;
    const date = document.getElementById('book-date')?.value;
    const packageVal = document.getElementById('book-package')?.value;
    const guests = document.getElementById('book-guests')?.value;
    const notes = document.getElementById('book-notes')?.value || '';

    if (!name || !phone || !date) {
        showToast('Missing Info', 'Please fill in your name, phone, and date.', 'warning');
        return;
    }

    let message = `Sabaidee! 👋 I'm ${name}. I'm interested in the ${tourName}${packageVal ? ' (' + packageVal + ')' : ''}.
📅 Date: ${date}
👥 Guests: ${guests}
📱 Contact: ${phone}`;

    if (notes) {
        message += `\n📝 Message: ${notes}`;
    }

    if (mode === 'whatsapp') {
        const encodedMsg = encodeURIComponent(message);
        const waUrl = `https://wa.me/8562098457614?text=${encodedMsg}`;
        window.open(waUrl, '_blank');
        showToast('Opening WhatsApp...', 'Connecting you to our team.', 'success');
    } else {
        // Email Flow via FormSubmit
        showToast('Sending Inquiry...', 'Please wait a moment.', 'info');

        try {
            const formData = new FormData();
            formData.append('Tour', tourName);
            formData.append('Package', packageVal || 'Standard');
            formData.append('Name', name);
            formData.append('WhatsApp/Phone', phone);
            formData.append('Travel Date', date);
            formData.append('Guests', guests);
            formData.append('Message/Notes', notes);
            formData.append('_subject', `New Inquiry: ${tourName} from ${name}`);

            const response = await fetch('https://formsubmit.co/ajax/luangprabangdreamdestination@gmail.com', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                showToast('Inquiry Sent!', "We'll contact you shortly via WhatsApp or Email.", 'success');
                document.getElementById('booking-form')?.reset();
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            showToast('Submission Error', 'Please try WhatsApp instead.', 'error');
        }
    }
};

// ========== 🛒 CHECKOUT LOGIC ==========
function bookProduct(name, price, date = '', guests = 1) {
    localStorage.setItem('selected_product_name', name);
    localStorage.setItem('selected_product_price', price);
    localStorage.setItem('selected_product_date', date);
    localStorage.setItem('selected_product_guests', guests);

    showToast('Ready to book!', `Added ${name} to your inquiry.`, 'success');

    setTimeout(() => {
        window.location.href = 'checkout.html';
    }, 1500);
}

// ========== 🔔 NOTIFICATION SYSTEM (TOASTS) ==========
function showToast(title, message, type = 'info', duration = 4000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    const icon = icons[type] || icons.info;

    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icon}"></i></div>
        <div class="toast-content">
            <strong class="toast-title">${title}</strong>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
        <div class="toast-progress" style="animation: progress-load ${duration}ms linear forwards"></div>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    const dismissToast = () => {
        toast.style.animation = 'toast-out 0.5s ease forwards';
        setTimeout(() => toast.remove(), 500);
    };

    if (closeBtn) closeBtn.onclick = dismissToast;
    setTimeout(dismissToast, duration);
}

// ========== 📅 PREMIUM DATE PICKER (FLATPICKR) ==========
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('book-date');
    if (dateInput && typeof flatpickr !== 'undefined') {
        flatpickr(dateInput, {
            altInput: true,
            altFormat: "F j, Y",
            dateFormat: "Y-m-d",
            minDate: "today",
            theme: "emerald",
            disableMobile: "true" // Force flatpickr on mobile for consistency
        });
    }
});

