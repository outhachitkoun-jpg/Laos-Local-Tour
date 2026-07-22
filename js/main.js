document.addEventListener('DOMContentLoaded', async () => {
    const loadFragment = async (placeholderSelector, sourceUrl, elementSelector) => {
        const placeholder = document.querySelector(placeholderSelector);
        if (!placeholder) return;
        try {
            const response = await fetch(sourceUrl);
            if (!response.ok) return;
            const html = await response.text();
            const parser = new DOMParser();
            const fragmentDoc = parser.parseFromString(html, 'text/html');
            const fragment = fragmentDoc.querySelector(elementSelector);
            if (fragment) {
                placeholder.replaceWith(fragment);
            }
        } catch (error) {
            console.warn(`Unable to load fragment from ${sourceUrl}:`, error);
        }
    };

    await loadFragment('#header-placeholder', 'header.html', 'header.site-header');
    await loadFragment('#footer-placeholder', 'footer.html', 'footer.site-footer');

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

            fetch('https://formsubmit.co/ajax/laoslocaltour@gmail.com', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).catch(e => console.log('Silently ignored Notification', e));
        } catch (e) { }
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

    // ==========  SCROLL REVEAL (Intersection Observer) ==========
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

            const response = await fetch('https://formsubmit.co/ajax/laoslocaltour@gmail.com', {
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
function bookProduct(name, price, date = '', guests = 1, destination = '', duration = '') {
    localStorage.setItem('selected_product_name', name);
    localStorage.setItem('selected_product_price', price);
    localStorage.setItem('selected_product_date', date);
    localStorage.setItem('selected_product_guests', guests);
    if (destination) localStorage.setItem('selected_product_destination', destination);
    if (duration) localStorage.setItem('selected_product_duration', duration);

    showToast('Ready to book!', `Added ${name} to your inquiry.`, 'success');

    setTimeout(() => {
        window.location.href = 'checkout.html';
    }, 1500);
}

// Start inquiry from a tour detail page: save any inline form values and redirect to checkout
function startInquiry(name, price, date = '', guests = 1, destination = '', duration = '') {
    try {
        const pageDate = document.getElementById('book-date')?.value || '';
        const pageGuests = document.getElementById('book-guests')?.value || 1;
        const bookName = document.getElementById('book-name')?.value || '';
        const bookPhone = document.getElementById('book-phone')?.value || '';

        localStorage.setItem('selected_product_name', name);
        localStorage.setItem('selected_product_price', price);
        if (date || pageDate) localStorage.setItem('selected_product_date', date || pageDate);
        localStorage.setItem('selected_product_guests', guests || pageGuests);
        if (destination) localStorage.setItem('selected_product_destination', destination);
        if (duration) localStorage.setItem('selected_product_duration', duration);

        // Prefill checkout form fields if user already entered them on detail page
        if (bookName) localStorage.setItem('form_cust-name', bookName);
        if (bookPhone) localStorage.setItem('form_cust-whatsapp', bookPhone);
    } catch (e) { console.warn('startInquiry error', e); }

    showToast('Redirecting to Inquiry', 'Please complete your contact details to send an inquiry.', 'info');
    setTimeout(() => window.location.href = 'checkout.html', 600);
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

    createBookingModal();
    initializeTourStickyCTA();
});

// ========== 🛍️ BOOKING MODAL (Reusable across pages) ==========
function createBookingModal() {
        if (document.getElementById('booking-modal')) return;

        const modalHtml = `
        <div id="booking-modal" class="booking-modal" style="position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:20000;">
            <div class="booking-overlay" style="position:absolute;inset:0;background:rgba(0,0,0,0.6);"></div>
            <div class="booking-panel" style="position:relative;background:#fff;border-radius:12px;max-width:760px;width:94%;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,0.4);z-index:20001;">
                <button id="booking-close" style="position:absolute;right:14px;top:14px;background:transparent;border:none;font-size:1.2rem;color:#333;">&times;</button>
                <h3 id="modal-tour-title" style="margin-top:0;font-size:1.25rem;color:var(--primary);">Book Activity</h3>
                <div style="display:grid;grid-template-columns:1fr 320px;gap:16px;align-items:start;">
                    <div>
                        <div style="margin-bottom:8px;"><input id="book-name" placeholder="Your name *" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;"></div>
                        <div style="margin-bottom:8px;"><input id="book-phone" placeholder="WhatsApp / Phone *" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;"></div>
                        <div style="margin-bottom:8px;display:flex;gap:8px;"><input id="book-date" type="date" style="flex:1;padding:10px;border:1px solid #ddd;border-radius:6px;"><input id="book-guests" type="number" min="1" value="1" style="width:110px;padding:10px;border:1px solid #ddd;border-radius:6px;"></div>
                        <div style="margin-bottom:8px;"><select id="book-package" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;"><option value="Standard">Standard</option><option value="Private">Private</option></select></div>
                        <div style="margin-bottom:8px;"><textarea id="book-notes" placeholder="Notes / Special requirements" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;min-height:80px;"></textarea></div>
                    </div>
                    <div style="background:#fafafa;padding:16px;border-radius:8px;border:1px solid #eee;">
                        <div style="font-size:0.95rem;color:#666;margin-bottom:10px;">Selected</div>
                        <div id="modal-tour-name" style="font-weight:700;margin-bottom:6px;">—</div>
                        <div id="modal-tour-price" style="color:var(--primary);font-weight:800;margin-bottom:12px;">—</div>
                        <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
                            <button id="modal-wa" class="btn" style="background:#25D366;color:#fff;">Send Inquiry (WhatsApp)</button>
                            <button id="modal-email" class="btn btn-outline">Send Inquiry (Email)</button>
                            <button id="modal-checkout" class="btn btn-primary">Go to Checkout</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modal = document.getElementById('booking-modal');
        const closeBtn = document.getElementById('booking-close');
        const overlay = modal.querySelector('.booking-overlay');

        function closeModal() { modal.style.display = 'none'; }
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);

        // Wire modal buttons
        document.getElementById('modal-wa').addEventListener('click', () => {
                const title = document.getElementById('modal-tour-name').textContent;
                handleInquiry('whatsapp', title);
        });
        document.getElementById('modal-email').addEventListener('click', () => {
                const title = document.getElementById('modal-tour-name').textContent;
                handleInquiry('email', title);
        });
        document.getElementById('modal-checkout').addEventListener('click', () => {
                // Save to localStorage and go to checkout
                const title = document.getElementById('modal-tour-name').textContent;
                const price = document.getElementById('modal-tour-price').textContent;
                const date = document.getElementById('book-date').value || '';
                const guests = document.getElementById('book-guests').value || 1;
                localStorage.setItem('selected_product_name', title);
                localStorage.setItem('selected_product_price', price);
                if (date) localStorage.setItem('selected_product_date', date);
                localStorage.setItem('selected_product_guests', guests);
                modal.style.display = 'none';
                window.location.href = 'checkout.html';
        });
}

function openBookingModal(name, price) {
        createBookingModal();
        const modal = document.getElementById('booking-modal');
        if (!modal) return;
        document.getElementById('modal-tour-title').textContent = `Book: ${name}`;
        document.getElementById('modal-tour-name').textContent = name;
        document.getElementById('modal-tour-price').textContent = price;
        // Prefill fields from localStorage if available
        const savedName = localStorage.getItem('form_cust-name') || '';
        const savedPhone = localStorage.getItem('form_cust-whatsapp') || '';
        const savedDate = localStorage.getItem('form_travel-date') || localStorage.getItem('selected_product_date') || '';
        const savedGuests = localStorage.getItem('selected_product_guests') || 1;
        document.getElementById('book-name').value = savedName;
        document.getElementById('book-phone').value = savedPhone;
        document.getElementById('book-date').value = savedDate;
        document.getElementById('book-guests').value = savedGuests;
        modal.style.display = 'flex';
}

// ========== 📖 MANIFA PROGRAM DETAILS MODAL & FILTERS ==========
function openProgramDetailsModal(code) {
    if (!window.MANIFA_PROGRAMS) return;
    const prog = window.MANIFA_PROGRAMS.find(p => p.code.toLowerCase() === code.toLowerCase() || p.id === code.toLowerCase());
    if (!prog) return;

    let modal = document.getElementById('program-details-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'program-details-modal';
        modal.style.cssText = 'position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:20000;padding:20px;';
        document.body.appendChild(modal);
    }

    const highlightsHtml = prog.highlights.map(h => `<li style="margin-bottom:8px;"><i class="fas fa-check-circle" style="color:#10b981;margin-right:8px;"></i>${h}</li>`).join('');
    const inclusionsHtml = prog.inclusions.map(inc => `<li style="margin-bottom:6px;"><i class="fas fa-check" style="color:var(--primary);margin-right:8px;"></i>${inc}</li>`).join('');
    const scheduleHtml = prog.schedule ? prog.schedule.map(s => `
        <div style="margin-bottom:12px;padding-left:14px;border-left:3px solid var(--primary-soft);">
            <strong style="color:var(--primary);font-size:0.85rem;">${s.time}</strong>
            <p style="margin:2px 0 0;font-size:0.92rem;color:#334155;">${s.text}</p>
        </div>
    `).join('') : '';

    const safeTitle = prog.title.replace(/'/g, "\\'");

    modal.innerHTML = `
        <div class="booking-overlay" style="position:absolute;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);" onclick="document.getElementById('program-details-modal').style.display='none'"></div>
        <div class="program-modal-panel">
            <button class="program-modal-close" onclick="document.getElementById('program-details-modal').style.display='none'">&times;</button>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                <span class="badge badge-paylater" style="background:#0f172a;color:#fcd34d;font-weight:800;">${prog.code}</span>
                <span style="font-size:0.85rem;color:#64748b;font-weight:600;">${prog.duration}</span>
                ${prog.seasonalNotice ? `<span style="font-size:0.75rem;background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:12px;font-weight:700;">${prog.seasonalNotice}</span>` : ''}
            </div>
            <h2 style="font-family:'Playfair Display',serif;font-size:1.6rem;color:var(--primary-alt);margin-bottom:16px;">${prog.title}</h2>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
                <div>
                    <h4 style="font-family:'Outfit',sans-serif;color:var(--primary);margin-bottom:10px;">✨ Program Highlights</h4>
                    <ul style="list-style:none;padding:0;font-size:0.92rem;">${highlightsHtml}</ul>
                </div>
                <div>
                    <h4 style="font-family:'Outfit',sans-serif;color:var(--primary);margin-bottom:10px;">✓ Inclusions</h4>
                    <ul style="list-style:none;padding:0;font-size:0.88rem;">${inclusionsHtml}</ul>
                </div>
            </div>

            ${scheduleHtml ? `
                <h4 style="font-family:'Outfit',sans-serif;color:var(--primary);margin-bottom:12px;">📅 Itinerary & Schedule</h4>
                <div style="margin-bottom:24px;background:#f8fafc;padding:16px;border-radius:12px;border:1px solid #e2e8f0;">${scheduleHtml}</div>
            ` : ''}

            <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #e2e8f0;padding-top:20px;flex-wrap:wrap;gap:16px;">
                <div>
                    <span style="font-size:0.8rem;color:#64748b;display:block;">Price per person</span>
                    <strong style="font-size:1.6rem;color:#10b981;">${prog.price}</strong>
                </div>
                <div style="display:flex;gap:10px;">
                    <button class="btn btn-secondary" onclick="document.getElementById('program-details-modal').style.display='none';openBookingModal('${safeTitle}', '${prog.price}')">
                        <i class="fas fa-calendar-check"></i> Book Now
                    </button>
                    <button class="btn btn-outline" onclick="window.open('https://wa.me/8562098457614?text=Hi!%20I%20want%20to%20inquire%20about%20${encodeURIComponent(prog.code + ': ' + prog.title)}', '_blank')">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

function filterTours(category, btnElement) {
    const cards = document.querySelectorAll('.tour-card-premium');
    cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (category === 'all' || cat === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });

    if (btnElement) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');
    }
}


function initializeTourStickyCTA() {
    const hero = document.querySelector('.tour-hero');
    if (!hero) return;

    const name = hero.querySelector('h1')?.textContent.trim() || document.title;
    let price = '';

    document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
        try {
            const data = JSON.parse(script.textContent || '{}');
            if (data && typeof data.price === 'string' && data.price.trim()) {
                price = data.price.trim();
                if (/^\d+(?:\.\d+)?$/.test(price)) {
                    price = '$' + price;
                }
            }
        } catch (error) {
            // ignore invalid JSON
        }
    });

    if (!price) {
        const priceMatch = document.body.textContent.match(/\$\s?\d+[\d,.]*/);
        if (priceMatch) {
            price = priceMatch[0].trim();
        }
    }

    if (!price) {
        price = '$45';
    }

    const sticky = document.createElement('div');
    sticky.className = 'sticky-tour-booking show';
    sticky.innerHTML = `
        <div class="sticky-cta-info">
            <div class="label">Tour starting from</div>
            <span class="price">${price}</span>
            <span class="tour-name">${name}</span>
        </div>
        <button type="button" class="btn btn-primary btn-sm btn-book-now">Book Now</button>
    `;

    sticky.querySelector('button')?.addEventListener('click', () => {
        bookProduct(name, price);
    });

    document.body.appendChild(sticky);
}

// Ensure modal exists on initial load
document.addEventListener('DOMContentLoaded', createBookingModal);


