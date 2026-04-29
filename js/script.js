// Using global variables: supabase, translations

// Mobile logo swap: use transparent logo on mobile (<= 991px)
(function() {
    var MOBILE_BP = 991;
    var TRANSPARENT_SRC = 'images/logo-mobile.png';

    function getOriginalSrc(img) {
        return img.dataset.originalSrc || img.src;
    }

    function swapLogos() {
        var logoImgs = document.querySelectorAll('.logo img');
        var isMobile = window.innerWidth <= MOBILE_BP;
        logoImgs.forEach(function(img) {
            if (!img.dataset.originalSrc) {
                img.dataset.originalSrc = img.src;
            }
            if (isMobile) {
                img.src = TRANSPARENT_SRC;
            } else {
                img.src = img.dataset.originalSrc;
            }
        });
    }

    document.addEventListener('DOMContentLoaded', swapLogos);
    window.addEventListener('resize', swapLogos);
})();

// Initialize animations and interactive elements
document.addEventListener('DOMContentLoaded', () => {
    console.log("Metropolitan Agency - Дигитално съвършенство инициирано.");
    
    const addCursorHover = () => {
        const interactiveElements = 'a, button, .btn-primary, .btn-secondary, .service-card, .work-card, .approach-card, .nav-dropdown > a';
        document.querySelectorAll(interactiveElements).forEach(el => {
            if (!el.dataset.cursorBound) {
                el.dataset.cursorBound = 'true';
                // Cursor hover logic removed as per user request
            }
        });
    };
    addCursorHover();
    setInterval(addCursorHover, 1000);

    // --- MAGNETIC CTA BUTTONS ---
    const initMagneticButtons = () => {
        const magneticButtons = document.querySelectorAll('.btn-large, .btn-primary, .btn-secondary');
        magneticButtons.forEach(btn => {
            if(!btn.dataset.magneticInit) {
                btn.dataset.magneticInit = 'true';
                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
                    const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
                    btn.style.transform = `translate(${x}px, ${y}px) rotateX(${(y / rect.height) * -20}deg) rotateY(${(x / rect.width) * 20}deg)`;
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = `translate(0px, 0px) rotateX(0deg) rotateY(0deg)`;
                    setTimeout(() => { btn.style.transform = ''; }, 300);
                });
            }
        });
    };
    initMagneticButtons();
    setTimeout(initMagneticButtons, 1000);



    
    // Language Switching Logic
    const langToggle = document.getElementById('lang-toggle');
    window.currentLang = localStorage.getItem('preferredLang') || 'bg';

    const updateLanguage = (lang) => {
        window.currentLang = lang;
        document.querySelectorAll('[data-t]').forEach(el => {
            const key = el.getAttribute('data-t');
            if (translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            } else {
                console.warn(`Missing translation for key: ${key} in language: ${lang}`);
            }
        });
        
        // Update placeholders for inputs
        document.querySelectorAll('[data-t-placeholder]').forEach(el => {
            const key = el.getAttribute('data-t-placeholder');
            if (translations[lang] && translations[lang][key]) {
                el.placeholder = translations[lang][key];
            }
        });

        // Update active state of toggle
        if (langToggle) {
            langToggle.innerHTML = lang === 'bg' ? 'EN' : 'BG';
        }

        document.documentElement.lang = lang === 'bg' ? 'bg-BG' : 'en-US';
        localStorage.setItem('preferredLang', lang);

        // Re-run dynamic content loading to apply translations to dynamically created items
        loadDynamicContent();
    };

    const attachLangListeners = () => {
        const langToggles = document.querySelectorAll('#lang-toggle');
        langToggles.forEach(toggle => {
            if (!toggle.dataset.listenerAttached) {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    const nextLang = window.currentLang === 'bg' ? 'en' : 'bg';
                    updateLanguage(nextLang);
                });
                toggle.dataset.listenerAttached = 'true';
            }
        });
    };

    attachLangListeners();

    // --- REFACTORED DYNAMIC CONTENT LOADING ---
    function loadDynamicContent() {
        // Portfolio Grid on Homepage
        const portfolioGrid = document.querySelector('.work-grid');
        if(portfolioGrid) {
            window.supabase.from('portfolio').select('*').limit(4).then(({data, error}) => {
                let projects = (!error && data) ? [...data] : [];
                
                // Static Fallbacks if Supabase is offline or empty
                if (projects.length === 0) {
                    projects.push({
                        id: 'hoodwear',
                        title: 'hoodwear_title',
                        client_name: 'Hood Wear Ltd.',
                        image_url: 'images/hoodwear/hood-cover-final.jpg'

                    }, {
                        id: 'greenlife',
                        title: 'GreenLife',
                        client_name: 'GreenLife',
                        image_url: 'images/greenlife-cover.png'
                    }, {
                        id: 'urbanshop',
                        title: 'UrbanShop',
                        client_name: 'UrbanShop',
                        image_url: 'images/urbanshop-cover.png'
                    });
                } else {
                    projects.unshift({
                        id: 'hoodwear',
                        title: 'hoodwear_title',
                        client_name: 'Hood Wear Ltd.',
                        image_url: 'images/hoodwear/hood-cover-final.jpg'
                    });
                }
                
                projects = projects.slice(0, 4);
                portfolioGrid.innerHTML = '';
                if(projects.length === 0) {
                     portfolioGrid.innerHTML = `<p style="text-align: center; width:100%; color:#B3B3B3;">${window.currentLang === 'bg' ? 'Няма проекти.' : 'No projects.'}</p>`;
                } else {
                    projects.forEach(p => {
                        const title = translations[window.currentLang][p.title] || p.title;
                        const clientName = p.client_name || (window.currentLang === 'bg' ? 'Проект' : 'Project');
                        const isVertical = p.image_url && p.image_url.includes('design.png');
                        portfolioGrid.innerHTML += `
                            <div class="work-card card-${p.id} animate-on-scroll visible" style="background-image: url('${p.image_url || ''}'); background-size: cover; background-position: ${isVertical ? 'top center' : 'center'};" onclick="location.href='portfolio-details.html?id=${p.id}'">
                                <div class="card-puzzle"><i class="fa-solid fa-puzzle-piece"></i></div>
                                <div class="work-content">
                                    <span class="work-category">${clientName}</span>
                                    <h3>${title}</h3>
                                </div>
                            </div>
                        `;
                    });
                }
            });
        }

        // All Services Page
        const allServicesGrid = document.getElementById('all-services-grid');
        if(allServicesGrid) {
            window.supabase.from('services').select('*').order('created_at', { ascending: false }).then(({data, error}) => {
                if(error || !data) {
                    allServicesGrid.innerHTML = `<p style="text-align:center; color:#B3B3B3;">Грешка при зареждане. / Error loading.</p>`;
                } else if(data.length === 0) {
                    const noServices = window.currentLang === 'bg' ? 'В момента няма добавени услуги.' : 'No services added at the moment.';
                    allServicesGrid.innerHTML = `<p style="text-align:center; color:#B3B3B3;">${noServices}</p>`;
                } else {
                    allServicesGrid.innerHTML = '';
                    data.forEach(s => {
                        const title = translations[window.currentLang][s.title] || s.title;
                        const category = translations[window.currentLang][s.category] || s.category;
                        const detailsLabel = window.currentLang === 'bg' ? 'Детайли' : 'Details';
                        allServicesGrid.innerHTML += `
                            <div class="service-card animate-on-scroll visible">
                                <div class="service-icon"><i class="fa-solid fa-briefcase"></i></div>
                                <h3>${title}</h3>
                                <p>${category}</p>
                                <a href="service-details.html?id=${s.id}" class="btn-primary" style="margin-top: 20px; display: inline-block; width: 100%; text-align: center;">${detailsLabel}</a>
                            </div>
                        `;
                    });
                }
            });
        }

        // Service Details Page
        const serviceDetailsContainer = document.getElementById('service-details-container');
        if(serviceDetailsContainer) {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');
            if(id) {
                window.supabase.from('services').select('*').eq('id', id).single().then(({data, error}) => {
                    if(data) {
                        const title = translations[window.currentLang][data.title] || data.title;
                        const category = translations[window.currentLang][data.category] || data.category;
                        const cta = translations[window.currentLang]['contact_inquiry_this'];
                        const priceLabel = translations[window.currentLang]['price'];
                        const backLabel = translations[window.currentLang]['service_details_back'];

                        document.title = title + " | Metropolitan Agency";
                        serviceDetailsContainer.innerHTML = `
                            <div class="hero-badge" style="margin: 0 auto; margin-bottom: 20px;">${category}</div>
                            <h1 class="hero-title" style="font-size: clamp(2rem, 4vw, 3rem);">${title}</h1>
                            <p style="color: var(--text-secondary); margin-top: 30px; font-size: 1.2rem; line-height: 1.8;">${data.description}</p>
                            ${data.price ? `<p style="margin-top: 20px; font-size: 1.5rem; color: var(--accent-color); font-weight: bold;">${priceLabel}: ${data.price}</p>` : ''}
                            ${data.image_url ? `<img src="${data.image_url}" style="width: 100%; border-radius: 15px; margin-top: 40px; border: 1px solid var(--surface-border);">` : ''}
                            <div style="margin-top: 50px;">
                                <a href="index.html#contact" class="btn-primary">${cta}</a>
                            </div>
                            <div style="margin-top: 20px;">
                                <a href="services.html" style="color: var(--text-secondary); text-decoration: none;"><i class="fa-solid fa-arrow-left"></i> ${backLabel}</a>
                            </div>
                        `;
                    }
                });
            }
        }

        // All Portfolio Page
        const allPortfolioGrid = document.getElementById('all-portfolio-grid');
        if(allPortfolioGrid) {
            window.supabase.from('portfolio').select('*').order('created_at', { ascending: false }).then(({data, error}) => {
                let projects = (!error && data) ? [...data] : [];
                
                if (projects.length === 0) {
                    projects.push({
                        id: 'hoodwear',
                        title: 'hoodwear_title',
                        client_name: 'Hood Wear Ltd.',
                        image_url: 'images/hoodwear/hood-cover-final.jpg'

                    }, {
                        id: 'greenlife',
                        title: 'GreenLife',
                        client_name: 'GreenLife',
                        image_url: 'images/greenlife-cover.png'
                    }, {
                        id: 'urbanshop',
                        title: 'UrbanShop',
                        client_name: 'UrbanShop',
                        image_url: 'images/urbanshop-cover.png'
                    });
                } else {
                    projects.unshift({
                        id: 'hoodwear',
                        title: 'hoodwear_title',
                        client_name: 'Hood Wear Ltd.',
                        image_url: 'images/hoodwear/hood-cover-final.jpg'
                    });
                }
                
                allPortfolioGrid.innerHTML = '';
                if(projects.length === 0) {
                    const noProjects = window.currentLang === 'bg' ? 'В момента няма активни кампании.' : 'No active campaigns at the moment.';
                    allPortfolioGrid.innerHTML = `<p style="text-align:center; color:#B3B3B3;">${noProjects}</p>`;
                } else {
                    projects.forEach(p => {
                        const title = translations[window.currentLang][p.title] || p.title;
                        const projectLabel = window.currentLang === 'bg' ? 'Проект' : 'Project';
                        const isVertical = p.image_url.includes('design.png');
                        allPortfolioGrid.innerHTML += `
                            <a href="portfolio-details.html?id=${p.id}" class="work-card card-${p.id} animate-on-scroll" style="background-image: url('${p.image_url || ''}'); background-size: cover; background-position: ${isVertical ? 'top center' : 'center'};">
                                <div class="card-puzzle"><i class="fa-solid fa-puzzle-piece"></i></div>
                                <div class="work-content">
                                    <span class="work-category">${p.client_name || projectLabel}</span>
                                    <h3>${title}</h3>
                                </div>
                            </a>
                        `;
                    });
                }
            });
        }

        // Portfolio Details Page
        const portfolioDetailsContainer = document.getElementById('portfolio-details-container');
        if(portfolioDetailsContainer) {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');
            if(id) {
                function renderPortfolio(project) {
                    const title = translations[window.currentLang] && translations[window.currentLang][project.title] ? translations[window.currentLang][project.title] : project.title;
                    const servicesHtml = project.services && project.services.length > 0 ? 
                        `<div class="project-services" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 30px;">
                            ${project.services.map(s => `<span style="background: rgba(34, 71, 102, 0.1); color: var(--puzzle-bg-1); padding: 8px 16px; border-radius: 50px; font-size: 0.9rem; font-weight: 600; border: 1px solid rgba(34, 71, 102, 0.3);">${s}</span>`).join('')}
                        </div>` : '';

                    portfolioDetailsContainer.innerHTML = `
                        <div class="project-header">
                            <h1>${title}</h1>
                            <p class="client-name"><span data-t="client">КЛИЕНТ</span>: <strong>${project.client_name || ''}</strong></p>
                        </div>
                        <div class="project-content">
                            ${servicesHtml}
                            ${project.description ? `<p style="font-size: 1.1rem; line-height: 1.8; color: var(--text-light); margin-bottom: 40px;">${project.description}</p>` : ''}
                            
                            ${project.id === 'hoodwear' ? `
                                <div style="margin: 60px 0; border-top: 1px solid var(--surface-border); border-bottom: 1px solid var(--surface-border); padding: 50px 0;">
                                    <div style="display: flex; flex-wrap: wrap; gap: 40px; align-items: center;">
                                        <div style="flex: 1; min-width: 300px;">
                                            <h3 style="margin-bottom: 20px; font-size: 1.8rem;">Лого Дизайн</h3>
                                            <p style="color: var(--text-light); line-height: 1.8; font-size: 1.1rem; margin-bottom: 20px;">
                                                Като част от изграждането на цялостната идентичност на Hood Wear, нашият екип проектира това лого, за да отразява модерния streetwear дух на бранда. Минималистичните линии и агресивната типография създават силно визуално присъствие.
                                            </p>
                                        </div>
                                        <div style="flex: 1; min-width: 300px; display: flex; justify-content: center; background: #EFEFEF; border-radius: var(--border-radius); padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
                                            <img src="images/hoodwear/hood_logo_extracted.png" alt="Hood Wear Logo" style="max-width: 100%; height: auto; border-radius: 5px;">
                                        </div>
                                    </div>
                                </div>
                            ` : project.pdf_url ? `
                                <div style="margin-top: 30px; margin-bottom: 50px;">
                                    <a href="${project.pdf_url}" target="_blank" class="btn-secondary" data-t="view_brandbook" style="display: inline-flex; align-items: center; gap: 10px;"><i class="fa-solid fa-file-pdf"></i> Разгледай Brandbook</a>
                                </div>
                            ` : ''}

                            ${project.images && project.images.length > 0 ? `
                                <h3 style="margin-top: 50px; margin-bottom: 20px;">${window.currentLang === 'bg' ? 'Допълнителни Материали' : 'Supplemental Materials'}</h3>
                                <div class="project-gallery" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
                                    ${project.images.map(img => `<img src="${img}" alt="Project Image" style="width:100%; border-radius: var(--border-radius); box-shadow: 0 5px 15px rgba(0,0,0,0.2);">`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }

                if (id === 'hoodwear') {
                    renderPortfolio({
                        id: 'hoodwear',
                        title: 'hoodwear_title',
                        client_name: 'Hood Wear Ltd.',
                        description: translations[window.currentLang]['hoodwear_desc'],
                        image_url: 'images/hoodwear/hood-cover-final.jpg',
                        images: ['images/hoodwear/hood-giff.gif'],
                        services: ['Брандинг', 'Лого Дизайн', 'Маркетинг Стратегия', 'E-commerce']
                    });
                } else if (id === 'greenlife') {
                    renderPortfolio({
                        id: 'greenlife',
                        title: 'GreenLife Brand Identity',
                        client_name: 'GreenLife',
                        description: 'Цялостно изграждане на бранд идентичност за еко бранд — от лого и опаковки до пълна стратегия за социални мрежи. Създадохме визуална система, която комуникира устойчивост и премиум качество. Кампанията доведе до 120% увеличение на ангажираността и 35% ръст в продажбите.',
                        image_url: 'images/greenlife-cover.png',
                        images: ['images/greenlife-cover.png'],
                        services: ['Брандинг', 'Опаковъчен Дизайн', 'Social Media', 'Копирайтинг', 'Фотография']
                    });
                } else if (id === 'urbanshop') {
                    renderPortfolio({
                        id: 'urbanshop',
                        title: 'UrbanShop E-commerce Platform',
                        client_name: 'UrbanShop',
                        description: 'Изграждане на пълнофункционален онлайн магазин с модерен UX дизайн и мащабни PPC рекламни кампании. Платформата обработва над 500 поръчки месечно с конверсия от 4.2%, а ROAS на рекламните кампании достигна 8.5x за първото тримесечие.',
                        image_url: 'images/urbanshop-cover.png',
                        images: ['images/urbanshop-cover.png'],
                        services: ['E-commerce Платформа', 'PPC Реклама', 'Конверсии', 'UX Дизайн', 'Email Маркетинг']
                    });
                } else {
                    window.supabase.from('portfolio').select('*').eq('id', id).single().then(({data, error}) => {
                        if(data) {
                            renderPortfolio(data);
                        } else {
                            portfolioDetailsContainer.innerHTML = `<p style="text-align:center; color:#B3B3B3;">Проектът не е намерен / Project not found.</p>`;
                        }
                    });
                }
            }
        }
    }

    // Set initial language and load content
    updateLanguage(window.currentLang);
    
    // Mobile Nav Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const scrollProgress = document.createElement('div');
    scrollProgress.className = 'scroll-progress';
    document.body.appendChild(scrollProgress);
    
    if(hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const navbar = document.querySelector('.navbar'); if(navbar) navbar.classList.toggle('menu-open');
            const isActive = navLinks.classList.contains('active');
            hamburger.innerHTML = isActive ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
            if (isActive) {
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
            } else {
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
            }
        });
    }

    // Mobile Dropdown Toggle (touch devices can't hover)
    const navDropdown = document.querySelector('.nav-dropdown > a');
    if (navDropdown) {
        navDropdown.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdown = navDropdown.closest('.nav-dropdown');
            dropdown.classList.toggle('open');
        });
    }

    // Close mobile nav when clicking a link
    document.querySelectorAll('.nav-links a:not(.nav-dropdown > a)').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (hamburger) hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
            }
        });
    });

    // Scroll Progress Tracking
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        scrollProgress.style.width = scrolled + "%";
    });

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Scroll Observer for Animations (Enhanced)
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.classList.remove('hide-before-scroll', 'reveal-fade-up', 'reveal-fade-in', 'reveal-zoom-in', 'reveal-slide-left', 'reveal-slide-right');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll, [class*="reveal-"]').forEach((el) => {
        if (!el.classList.contains('visible')) {
            el.classList.add('hide-before-scroll');
        }
        observer.observe(el);
    });

    // Failsafe: Ensure all elements become visible after 3 seconds regardless of scroll (prevents invisible content bug)
    setTimeout(() => {
        document.querySelectorAll('.animate-on-scroll, [class*="reveal-"]').forEach(el => {
            if (!el.classList.contains('visible')) {
                el.classList.add('visible');
                el.classList.remove('hide-before-scroll', 'reveal-fade-up', 'reveal-fade-in', 'reveal-zoom-in', 'reveal-slide-left', 'reveal-slide-right');
            }
        });
    }, 3000);

    // Subtle Hero Parallax
    const spheres = document.querySelectorAll('.gradient-sphere');
    window.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        spheres.forEach((sphere, index) => {
            const speed = (index + 1) * 30;
            const xOffset = (x - 0.5) * speed;
            const yOffset = (y - 0.5) * speed;
            sphere.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });
    });

    // Handle Contact Form / Lead Generation
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = translations[window.currentLang]['sending'];
            submitBtn.disabled = true;

            const inputs = contactForm.querySelectorAll('input, select, textarea');
            const name = inputs[0]?.value || '';
            const email = inputs[1]?.value || '';
            const service = inputs[2]?.value || '';
            const message = inputs[3]?.value || '';
            
            // Push to Supabase Leads Table
            try {
                const { data, error } = await window.supabase
                    .from('leads')
                    .insert([
                        { name, email, service, message, budget: 'Не е посочен' }
                    ]);

                if (error) {
                    console.error("Supabase Error:", error);
                    alert(translations[window.currentLang]['alert_error']);
                } else {
                    contactForm.reset();
                    openSuccessModal();
                }
            } catch(err) {
                console.error("Network/Supabase Error:", err);
                alert(translations[window.currentLang]['alert_error']);
            }
            
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        });
    }
});

// ── Success Modal ────────────────────────────────────────────────
function openSuccessModal() {
    const overlay = document.getElementById('successModal');
    if (!overlay) return;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeSuccessModal() {
    const overlay = document.getElementById('successModal');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}
// Close on backdrop click
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('successModal');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeSuccessModal();
        });
    }
});
