// script.js

document.addEventListener('DOMContentLoaded', (event) => {
    
    // --- 1. Scroll Animation Logic for Sections (.scroll-animate) ---
    const sectionObserverOptions = {
        root: null, 
        rootMargin: '0px',
        threshold: 0.12 
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                el.classList.add('visible');
                observer.unobserve(el);
                // Clear the stagger delay once the reveal finishes so hovers stay instant
                const index = parseInt(el.style.getPropertyValue('--i'), 10) || 0;
                const staggerOffset = el.closest('.project-cards-grid, .expertise-grid, .about-details') ? index * 100 : 0;
                setTimeout(() => el.classList.add('revealed'), 900 + staggerOffset);
            } 
        });
    }, sectionObserverOptions);

    const elementsToAnimate = document.querySelectorAll('.scroll-animate');
    elementsToAnimate.forEach(el => {
        // Assign a stagger index for grid children so they reveal one after another
        if (el.closest('.project-cards-grid, .expertise-grid, .about-details')) {
            const siblings = Array.from(el.parentElement.children)
                .filter(node => node.classList && node.classList.contains('scroll-animate'));
            el.style.setProperty('--i', siblings.indexOf(el));
        }
        sectionObserver.observe(el);
    });


    // --- 2. Sticky Header Fade-in Animation ---
    const header = document.getElementById('main-header');
    
    setTimeout(() => {
        header.classList.add('header-visible');
    }, 100); 


    // --- 3. Mobile Menu Toggle (Professional Slide-in Sidebar) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const backdrop = document.getElementById('nav-backdrop');
    const navLinks = document.querySelectorAll('.nav-link');

    function setMobileMenu(open) {
        if (!mainNav || !menuToggle) return;
        mainNav.classList.toggle('is-open', open);
        menuToggle.classList.toggle('is-active', open);
        menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (backdrop) {
            backdrop.classList.toggle('is-open', open);
        }
        document.body.classList.toggle('menu-open', open);
    }

    function closeMobileMenu() {
        setMobileMenu(false);
    }

    menuToggle.addEventListener('click', () => {
        setMobileMenu(!mainNav.classList.contains('is-open'));
    });

    // Menu link click karne par menu close ho jaaye
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('is-open')) {
                closeMobileMenu();
            }
        });
    });

    // Close when backdrop is clicked
    if (backdrop) {
        backdrop.addEventListener('click', () => {
            closeMobileMenu();
        });
    }

    // Close when the X button inside the sidebar is clicked
    const navClose = document.querySelector('.nav-close');
    if (navClose) {
        navClose.addEventListener('click', () => {
            closeMobileMenu();
        });
    }

    // Close when clicking a menu link or its slider
    document.addEventListener('click', (event) => {
        if (!mainNav.classList.contains('is-open')) return;
        if (mainNav.contains(event.target) || menuToggle.contains(event.target) || (backdrop && backdrop.contains(event.target))) return;
        closeMobileMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMobileMenu();
        }
    });


    // --- 4. Active Navigation Link Detection (Current Page) ---
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const currentHash = window.location.hash;
    
    // Current page ke basis par active link set karo
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        // Privacy Policy page
        if (currentPage === 'privacy-policy.html' && linkHref === 'privacy-policy.html') {
            link.classList.add('active-link');
        } else if (currentPage === 'index.html' || currentPage === '') {
            if (linkHref === 'index.html' || linkHref === '#hero-intro') {
                link.classList.add('active-link');
            }
        }
    });

    // --- 5. Active Navigation Link Animation (Tracking Section) - Only for index.html ---
    if (currentPage === 'index.html' || currentPage === '') {
        const sections = document.querySelectorAll('section.content-section');
        
        const activeLinkObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.id;
                    
                    // Puraane active links se class hatao (including Home link)
                    navLinks.forEach(link => {
                        const linkHref = link.getAttribute('href');
                        if (linkHref.startsWith('#') || linkHref === 'index.html') {
                            link.classList.remove('active-link');
                        }
                    });
                    
                    // Naye active link par class lagao
                    const newActiveLink = document.querySelector(`nav a[href="#${currentId}"]`);
                    if (newActiveLink) {
                        newActiveLink.classList.add('active-link');
                    }
                }
            });
        }, {
            root: null,
            rootMargin: '-30% 0px -30% 0px', 
            threshold: 0 
        });

        sections.forEach(section => {
            activeLinkObserver.observe(section);
        });

        // Hero section ke liye alag se handling, jab woh top par ho
        const heroSection = document.getElementById('hero-intro');
        if (heroSection) {
            const heroObserver = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    // Sabhi section links se active-link hatao
                    navLinks.forEach(link => {
                        const linkHref = link.getAttribute('href');
                        if (linkHref.startsWith('#')) {
                            link.classList.remove('active-link');
                        }
                    });
                    // Home link ko active karo jab hero section visible ho
                    const homeLink = document.querySelector('nav a[href="#hero-intro"]');
                    if (homeLink) {
                        homeLink.classList.add('active-link');
                    }
                }
            }, {
                root: null,
                threshold: 0.5 
            });
            heroObserver.observe(heroSection);
        }
    }

    // --- 6. Custom Smooth Scroll Animation Easing ---
    function smoothScrollTo(targetPosition, duration = 600) {
        const startPosition = window.pageYOffset || document.documentElement.scrollTop;
        const distance = targetPosition - startPosition;
        const startTime = performance.now();

        function easeInOutCubic(t) {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeInOutCubic(progress);
            window.scrollTo(0, Math.round(startPosition + distance * eased));

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    // --- 7. Back to Top Button with Custom Easing ---
    const backToTopBtn = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        if (backToTopBtn) {
            if (winScroll > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
    }, { passive: true });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            backToTopBtn.classList.add('scrolling');
            smoothScrollTo(0, 500);
            window.setTimeout(() => {
                backToTopBtn.classList.remove('scrolling');
            }, 550);
        });
    }

    // --- 8. Smooth Scrolling for all Internal Links with Offset Adjustment ---
    document.querySelectorAll('a[href^="#"], a[href^="index.html#"], a[href="index.html"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            let href = this.getAttribute('href');

            // Handle plain index.html link (Home)  -  smooth scroll to top
            if (href === 'index.html') {
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                if (currentPage === 'index.html' || currentPage === '') {
                    e.preventDefault();
                    smoothScrollTo(0, 600);
                    return;
                }
                return; // let default navigation happen on other pages
            }
            
            // Check if it is a hash target relative to current index page
            if (href.startsWith('index.html#')) {
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                if (currentPage === 'index.html' || currentPage === '') {
                    href = href.replace('index.html', '');
                } else {
                    return; // Allow default redirect to home page hash
                }
            }

            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    const headerOffset = 95; // Offset to account for fixed navbar height
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    smoothScrollTo(offsetPosition, 600);
                }
            }
        });
    });

    // --- Smooth Scroll to hash URL on load ---
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 300);
        }
    }

    // --- Auto-expand contact textarea ---
    const projectDetailsTextarea = document.getElementById('message');
    if (projectDetailsTextarea) {
        const autoResizeTextarea = () => {
            projectDetailsTextarea.style.height = 'auto';
            projectDetailsTextarea.style.height = `${projectDetailsTextarea.scrollHeight}px`;
        };

        projectDetailsTextarea.addEventListener('input', autoResizeTextarea);
        autoResizeTextarea();
    }

    // --- 7. Custom Toast System ---
    window.showToast = function(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = document.createElement('div');
        icon.className = 'toast-icon';
        
        const content = document.createElement('div');
        content.className = 'toast-content';
        content.textContent = message;
        
        toast.appendChild(icon);
        toast.appendChild(content);
        toastContainer.appendChild(toast);
        
        // Triggers slide in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Slide out and remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 4000);
    };

    // --- 8. Dynamic Auto-Typing Subtitle ---
    const typingText = document.getElementById('typing-text');
    if (typingText) {
        const roles = [
            "Frontend Web Developer",
            "WordPress Developer",
            "Canva Designer",
            "Office Automation Specialist"
        ];
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let delay = 100; // Typing speed

        function type() {
            const currentRole = roles[roleIndex];
            
            if (isDeleting) {
                typingText.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
                delay = 40; // Deleting speed
            } else {
                typingText.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
                delay = 100; // Typing speed
            }

            if (!isDeleting && charIndex === currentRole.length) {
                // Pause at complete word
                delay = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                delay = 500; // Pause before typing next word
            }

            setTimeout(type, delay);
        }
        
        // Start typing
        setTimeout(type, 500);
    }

    // --- 9. AI Neural Network Particle Background ---
    const canvas = document.getElementById('hero-canvas');
    const heroSec = document.getElementById('hero-intro');

    if (canvas && heroSec) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 150 };
        let animationId = null;

        // Set canvas dimensions
        function resizeCanvas() {
            canvas.width = heroSec.offsetWidth;
            canvas.height = heroSec.offsetHeight;
        }
        resizeCanvas();

        // Particle class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 30) + 10;
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;
            }

            draw() {
                ctx.fillStyle = '#58a6ff';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
                if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < mouse.radius) {
                        let force = (mouse.radius - distance) / mouse.radius;
                        let directionX = dx / distance;
                        let directionY = dy / distance;
                        
                        this.x -= directionX * force * 3;
                        this.y -= directionY * force * 3;
                    }
                }
            }
        }

        // Initialize particles
        function initParticles() {
            particles = [];
            const isMobile = window.innerWidth < 768;
            const numberOfParticles = isMobile ? 30 : Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        }
        initParticles();

        // Draw connecting lines
        function connectParticles() {
            let opacityValue = 1;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 110) {
                        opacityValue = 1 - (distance / 110);
                        ctx.strokeStyle = `rgba(88, 166, 255, ${opacityValue * 0.15})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Animation loop
        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            connectParticles();
            animationId = requestAnimationFrame(animateParticles);
        }
        animateParticles();

        // Debounced resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (animationId) cancelAnimationFrame(animationId);
                resizeCanvas();
                initParticles();
                animateParticles();
            }, 200);
        });

        // rAF-throttled mouse for particles
        let particleMousePending = false;
        heroSec.addEventListener('mousemove', (e) => {
            if (!particleMousePending) {
                particleMousePending = true;
                requestAnimationFrame(() => {
                    const rect = heroSec.getBoundingClientRect();
                    mouse.x = e.clientX - rect.left;
                    mouse.y = e.clientY - rect.top;
                    particleMousePending = false;
                });
            }
        });

        heroSec.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Pause particles when hero is not visible (performance)
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!animationId) animateParticles();
                } else {
                    if (animationId) {
                        cancelAnimationFrame(animationId);
                        animationId = null;
                    }
                }
            });
        }, { threshold: 0 });
        heroObserver.observe(heroSec);
    }

    // --- 10. rAF-Throttled Mouse Glow + 3D Card Tilt ---
    const mouseGlow = document.createElement('div');
    mouseGlow.className = 'mouse-glow';
    document.body.appendChild(mouseGlow);

    const tiltElements = document.querySelectorAll('.service-card, .project-card');
    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
        mouseGlow.style.opacity = '0';
    });

    function handleMouseEffects() {
        // Mouse glow
        mouseGlow.style.left = mouseX + 'px';
        mouseGlow.style.top = mouseY + 'px';
        mouseGlow.style.opacity = '1';

        // Card tilt
        if (tiltElements.length > 0 && mouseX !== 0) {
            tiltElements.forEach(element => {
                const rect = element.getBoundingClientRect();
                if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
                    const x = mouseX - rect.left;
                    const y = mouseY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((centerY - y) / centerY) * 8;
                    const rotateY = ((x - centerX) / centerX) * 8;
                    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
                } else if (!element.matches(':hover')) {
                    element.style.transform = '';
                }
            });
        }

        requestAnimationFrame(handleMouseEffects);
    }
    requestAnimationFrame(handleMouseEffects);

    // --- 11. Projects Filter & See More Toggle Logic ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const seeMoreBtn = document.getElementById('see-more-btn');
    
    let currentFilter = 'all';
    let isExpanded = false;
    const PROJECTS_LIMIT = 6;

    function updateProjectsDisplay() {
        let visibleCount = 0;
        let matchingCount = 0;

        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const isMatch = (currentFilter === 'all' || category === currentFilter);

            if (isMatch) {
                matchingCount++;
                if (isExpanded || visibleCount < PROJECTS_LIMIT) {
                    card.classList.remove('hidden');
                    // Trigger reflow to restart fade-in animations on reveal
                    void card.offsetWidth;
                    card.classList.add('show-card');
                    visibleCount++;
                } else {
                    card.classList.add('hidden');
                    card.classList.remove('show-card');
                }
            } else {
                card.classList.add('hidden');
                card.classList.remove('show-card');
            }
        });

        // Manage See More button display and labeling based on visible project count
        if (seeMoreBtn) {
            if (matchingCount > PROJECTS_LIMIT) {
                seeMoreBtn.style.display = 'inline-block';
                if (isExpanded) {
                    seeMoreBtn.textContent = 'See Less Projects';
                    seeMoreBtn.setAttribute('aria-label', 'Collapse project list');
                } else {
                    seeMoreBtn.textContent = 'See More Projects';
                    seeMoreBtn.setAttribute('aria-label', 'Load more projects');
                }
            } else {
                seeMoreBtn.style.display = 'none';
            }
        }
    }

    // Initialize project grid view on load
    updateProjectsDisplay();

    if (filterBtns.length > 0 && projectCards.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');

                currentFilter = btn.getAttribute('data-filter');
                // Reset expansion state to collapsed upon switching project filter categories
                isExpanded = false;
                updateProjectsDisplay();
            });
        });
    }

    if (seeMoreBtn) {
        seeMoreBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            updateProjectsDisplay();
            
            if (!isExpanded) {
                // Smooth scroll back to projects section heading when collapsing
                const projectsSection = document.getElementById('projects');
                if (projectsSection) {
                    const headerOffset = 95;
                    const elementPosition = projectsSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    smoothScrollTo(offsetPosition, 600);
                }
            }
        });
    }

    // --- 12. AJAX Form Submission with Toast Notifications ---
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent standard page redirect
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            
            // Change button state to loading
            submitBtn.textContent = 'Sending Message...';
            submitBtn.disabled = true;
            
            const formData = new FormData(contactForm);
            const action = contactForm.getAttribute('action');
            
            fetch(action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    showToast('Thank you! Your message has been sent successfully.', 'success');
                    contactForm.reset(); // Reset form inputs
                } else {
                    response.json().then(data => {
                        if (Object.prototype.hasOwnProperty.call(data, 'errors')) {
                            showToast(data.errors.map(error => error.message).join(", "), 'error');
                        } else {
                            showToast('Oops! There was a problem submitting your form.', 'error');
                        }
                    });
                }
            })
            .catch(error => {
                showToast('Failed to connect to form server. Please check your network connection.', 'error');
            })
            .finally(() => {
                // Restore button state
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            });
        });
    }

    // --- 13. Keydown Event for Textarea (Enter to Submit, Shift+Enter for Newline) ---
    const messageTextarea = document.getElementById('message');
    if (messageTextarea && contactForm) {
        messageTextarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent standard newline
                if (contactForm.reportValidity()) {
                    contactForm.requestSubmit(); // Safely trigger AJAX submit handler
                }
            }
        });
    }

    // --- 14. Skill Tag Hover Project Highlights ---
    const skillItems = document.querySelectorAll('.skill-item');
    if (skillItems.length > 0 && projectCards.length > 0) {
        skillItems.forEach(skill => {
            const skillName = skill.getAttribute('data-skill');
            if (!skillName) return;

            skill.addEventListener('mouseenter', () => {
                projectCards.forEach(card => {
                    const cardSkills = card.getAttribute('data-skills');
                    if (cardSkills) {
                        const skillsList = cardSkills.split(',');
                        if (skillsList.includes(skillName)) {
                            card.classList.add('project-highlight');
                        } else {
                            card.classList.add('project-fade');
                        }
                    } else {
                        card.classList.add('project-fade');
                    }
                });
            });

            skill.addEventListener('mouseleave', () => {
                projectCards.forEach(card => {
                    card.classList.remove('project-highlight');
                    card.classList.remove('project-fade');
                });
            });
        });
    }
});



