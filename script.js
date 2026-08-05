/* script.js - Transparent Terminal Portfolio */

(function () {
    'use strict';

    var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
    var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ===== 0. Lenis smooth scroll ===== */
    var lenis = null;
    if (window.Lenis && !reducedMotion) {
        var isTouch = window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;
        lenis = new Lenis({
            duration: isTouch ? 0.9 : 1.1,
            easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
            smoothWheel: true,
            syncTouch: false,
            touchMultiplier: 1.0
        });
        function lenisRaf(time) {
            lenis.raf(time);
            requestAnimationFrame(lenisRaf);
        }
        requestAnimationFrame(lenisRaf);
    }

    /* ===== 1. Reveal on Scroll ===== */
    var revealEls = $$('.reveal');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(function (el) { io.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('in-view'); });
    }

    /* Reveal safety net: force-show anything in the initial viewport that the
       observer may have missed (load/resize only, NOT on scroll to avoid layout reads). */
    function forceReveal() {
        var vh = window.innerHeight || document.documentElement.clientHeight;
        revealEls.forEach(function (el) {
            if (el.classList.contains('in-view')) return;
            var r = el.getBoundingClientRect();
            if (r.top < vh && r.bottom > 0) el.classList.add('in-view');
        });
    }
    window.addEventListener('resize', forceReveal, { passive: true });
    window.addEventListener('load', function () { setTimeout(forceReveal, 200); });
    forceReveal();

    /* Staggered reveal for grids (cascade effect) */
    $$('.project-card.reveal, .skill-group.reveal, .social-card.reveal, .privacy-card.reveal, .cert-card.reveal').forEach(function (el, i) {
        el.style.transitionDelay = (i % 3) * 0.1 + 's';
        el.addEventListener('transitionend', function handler(e) {
            if (e.propertyName === 'opacity') {
                el.style.transitionDelay = '0s';
                el.removeEventListener('transitionend', handler);
            }
        });
    });

    /* ===== 2. Typewriter ===== */
    var typedEl = $('#hero-typed');
    var roles = ['Developer', 'Designer', 'Builder', 'Problem Solver'];
    if (typedEl) {
        var wordIdx = 0, charIdx = 0, deleting = false;
        function typeLoop() {
            var word = roles[wordIdx];
            var speed = deleting ? 45 : 95;
            charIdx += deleting ? -1 : 1;
            typedEl.textContent = word.substring(0, charIdx);
            if (!deleting && charIdx === word.length) {
                deleting = true;
                speed = 1600;
            } else if (deleting && charIdx === 0) {
                deleting = false;
                wordIdx = (wordIdx + 1) % roles.length;
                speed = 300;
            }
            setTimeout(typeLoop, speed);
        }
        typeLoop();
    }

    /* ===== 3. Mobile Nav ===== */
    var menuToggle = $('#menu-toggle');
    var navLinks = $('#nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function () {
            var open = navLinks.classList.toggle('open');
            menuToggle.classList.toggle('open', open);
            menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        $$('.nav-link', navLinks).forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('open');
                menuToggle.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ===== 4. Scroll-spy (nav links + tab bar) ===== */
    var sections = $$('.section');
    var navLinkEls = $$('.nav-link');
    var tabs = $$('.tab');
    function setActive(id) {
        navLinkEls.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + id); });
        tabs.forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-target') === id); });
    }
    var sectionPositions = [];
    function cachePositions() {
        sectionPositions = sections.map(function (s) { return s.offsetTop; });
    }
    cachePositions();
    window.addEventListener('resize', cachePositions, { passive: true });
    var scrollTicking = false;
    function onScroll() {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(function () {
            var pos = window.scrollY + window.innerHeight / 2;
            var current = null;
            for (var i = 0; i < sections.length; i++) {
                if (pos >= sectionPositions[i]) current = sections[i].id;
            }
            if (current) setActive(current);
            if (window.scrollY > 300) { document.body.classList.add('scrolled'); }
            else { document.body.classList.remove('scrolled'); }
            scrollTicking = false;
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ===== 5. Smooth scroll for anchors + tab bar ===== */
    var scrollAnimId = null;
    function smoothScrollTo(targetY, duration) {
        if (lenis) {
            lenis.scrollTo(targetY, { duration: (duration || 1600) / 1000, force: true });
            return;
        }
        if (scrollAnimId) { cancelAnimationFrame(scrollAnimId); scrollAnimId = null; }
        duration = duration || 1600;
        var startY = window.pageYOffset;
        var diff = targetY - startY;
        var start = performance.now();
        function easeInOutQuint(t) { return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2; }
        function step(now) {
            var p = Math.min((now - start) / duration, 1);
            window.scrollTo(0, startY + diff * easeInOutQuint(p));
            if (p < 1) scrollAnimId = requestAnimationFrame(step);
            else scrollAnimId = null;
        }
        if (reducedMotion) {
            window.scrollTo(0, targetY);
            return;
        }
        scrollAnimId = requestAnimationFrame(step);
    }
    function scrollToSection(id) {
        var el = document.getElementById(id);
        if (!el) return;
        var header = 24;
        var target = el.getBoundingClientRect().top + window.pageYOffset - header;
        smoothScrollTo(Math.max(target, 0), 1600);
    }
    $$('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var id = this.getAttribute('href').slice(1);
            if (id && document.getElementById(id)) {
                e.preventDefault();
                scrollToSection(id);
            }
        });
    });
    tabs.forEach(function (t) {
        t.addEventListener('click', function (e) {
            e.preventDefault();
            scrollToSection(this.getAttribute('data-target'));
        });
    });

    /* ===== 6. Project filter ===== */
    var filterPills = $$('.filter-pill');
    var projectCards = $$('.project-card');
    filterPills.forEach(function (pill) {
        pill.addEventListener('click', function () {
            filterPills.forEach(function (p) { p.classList.remove('active'); });
            this.classList.add('active');
            var filter = this.getAttribute('data-filter');
            projectCards.forEach(function (card) {
                var match = filter === 'all' || card.getAttribute('data-category') === filter;
                card.classList.toggle('hidden', !match);
            });
        });
    });

    /* ===== 7. Mouse glow ===== */
    var glow = $('#mouse-glow');
    if (glow) {
        var ticking = false;
        window.addEventListener('mousemove', function (e) {
            if (!ticking) {
                requestAnimationFrame(function () {
                    glow.style.transform = 'translate(' + (e.clientX - 170) + 'px,' + (e.clientY - 170) + 'px)';
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    /* ===== 8. Toast ===== */
    var toastEl = $('#toast');
    var toastTimer = null;
    function toast(msg) {
        if (!toastEl) return;
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
    }

    /* ===== 8b. Contact form ===== */
    var contactForm = $('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var submitBtn = contactForm.querySelector('button[type="submit"]');
            var original = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) { submitBtn.textContent = 'Sending...'; submitBtn.disabled = true; }
            var payload = new FormData(contactForm);
            fetch(contactForm.getAttribute('action'), {
                method: 'POST',
                body: payload,
                headers: { 'Accept': 'application/json' }
            }).then(function (res) {
                if (res.ok) {
                    toast('Message sent! I will reply soon.');
                    contactForm.reset();
                } else {
                    throw new Error('bad response');
                }
            }).catch(function () {
                toast('Something went wrong. Please email me directly.');
            }).then(function () {
                if (submitBtn) { submitBtn.textContent = original; submitBtn.disabled = false; }
            });
        });
    }

    /* ===== 9. Terminal ===== */
    var terminal = $('#terminal');
    var terminalBody = $('#terminal-body');
    var terminalInput = $('#terminal-input');
    var termClose = $('#term-close');
    var termToggle = $('#terminal-toggle');

    var PROMPT = 'msaleem@portfolio:~$';
    var cmdHistory = [];
    var histIdx = -1;

    var themes = {
        dracula: ['#282a36', '#f8f8f2', '#bd93f9'],
        onedark: ['#21252b', '#abb2bf', '#61afef'],
        tokyo: ['#1a1b26', '#c0caf5', '#7aa2f7'],
        monokai: ['#272822', '#f8f8f2', '#f92672'],
        gruvbox: ['#282828', '#ebdbb2', '#fabd2f'],
        default: ['#050505', '#ffffff', '#3b82f6']
    };
    var activeTheme = 'default';

    function termWrite(html, cls) {
        var div = document.createElement('div');
        div.className = 'term-line ' + (cls || 'out');
        div.innerHTML = html;
        terminalBody.appendChild(div);
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }
    function termSpace() {
        var div = document.createElement('div');
        div.className = 'term-space';
        terminalBody.appendChild(div);
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function openTerminal() {
        if (!terminal) return;
        terminal.classList.add('open');
        terminal.setAttribute('aria-hidden', 'false');
        setTimeout(function () { terminalInput.focus(); }, 60);
    }
    function closeTerminal() {
        if (!terminal) return;
        terminal.classList.remove('open');
        terminal.setAttribute('aria-hidden', 'true');
    }
    if (termToggle) termToggle.addEventListener('click', openTerminal);
    if (termClose) termClose.addEventListener('click', closeTerminal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && terminal.classList.contains('open')) closeTerminal();
        if (e.key === 'Tab' && terminal.classList.contains('open')) e.preventDefault();
    });

    function printHelp() {
        termSpace();
        termWrite('Available commands:', 'acc');
        var commands = [
            ['help', 'show this list'],
            ['whoami', 'about me'],
            ['about', 'my background'],
            ['projects', 'featured work'],
            ['skills', 'my stack'],
            ['certs', 'my certifications'],
            ['contact', 'reach me'],
            ['themes', 'list / set themes'],
            ['glow on|off', 'toggle ambient glow'],
            ['clear', 'clear terminal'],
            ['gui / exit', 'close terminal']
        ];
        commands.forEach(function (c) {
            termWrite('<span class="term-cmd">' + c[0] + '</span> <span class="dim">-</span> <span class="dim">' + c[1] + '</span>');
        });
        termSpace();
    }

    function printWhoami() {
        termSpace();
        termWrite('<span class="acc">Muhammad Saleem</span>');
        termWrite('<span class="dim">Frontend &amp; WordPress Developer | Pakistan</span>');
        termSpace();
        termWrite('<span class="dim">I build fast, responsive websites and WooCommerce stores with clean HTML/CSS, WordPress, Elementor and Canva. Focused on performance, usability and polished results.</span>');
        termSpace();
        termWrite('<span class="acc">github:</span> <span class="dim">/dev-muhammadsaleem</span>');
        termWrite('<span class="acc">linkedin:</span> <span class="dim">/in/muhammad-saleem-2b0851383</span>');
        termWrite('<span class="acc">email:</span> <span class="dim">dev.muhammadsaleem@gmail.com</span>');
        termSpace();
    }

    function printAbout() {
        termSpace();
        termWrite('Based in Pakistan. Frontend &amp; WordPress developer with strong HTML/CSS skills, hands-on Elementor, WooCommerce, Canva and Microsoft Office. WordPress certification from Coursera, and always learning through real projects.', 'dim');
        termSpace();
    }

    function printProjects() {
        termSpace();
        var projects = [
            ['MSaleem Studio', 'WordPress + Elementor marketing agency site', 'https://msaleemstudio.wasmer.app/'],
            ['Ali Law Associates', 'WordPress + Elementor legal consultancy site', 'https://alilawfirmspk.ct.ws/'],
            ['E-commerce Hub', 'WooCommerce store concept', 'coming soon'],
            ['SaaS Dashboard', 'analytics dashboard concept', 'coming soon'],
            ['HealthTech Portal', 'healthcare portal concept', 'coming soon'],
            ['FinTech Landing Page', 'conversion-focused landing page', 'coming soon']
        ];
        projects.forEach(function (p) {
            termWrite('<span class="term-cmd">' + p[0] + '</span> <span class="dim">-</span> ' + p[1]);
            termWrite('<span class="dim">' + p[2] + '</span>');
        });
        termSpace();
    }

    function printSkills() {
        termSpace();
        var groups = [
            ['Frontend', 'HTML, CSS, Responsive Design'],
            ['CMS &amp; E-commerce', 'WordPress, Elementor, WooCommerce'],
            ['Design', 'Canva, Graphic Design'],
            ['Tools', 'Word, Excel, PowerPoint']
        ];
        groups.forEach(function (g) {
            termWrite('<span class="acc">' + g[0] + ':</span> <span class="dim">' + g[1] + '</span>');
        });
        termSpace();
    }

    function printCerts() {
        termSpace();
        termWrite('<span class="acc">WordPress Developer Certification</span> <span class="dim">- Coursera</span>');
        termWrite('<span class="dim">Certifications/cert-coursera.pdf</span>');
        termSpace();
    }

    function printContact() {
        termSpace();
        termWrite('Email: dev.muhammadsaleem@gmail.com');
        termWrite('Phone: +92 313 3253853');
        termWrite('GitHub: /dev-muhammadsaleem');
        termWrite('LinkedIn: /in/muhammad-saleem-2b0851383');
        termWrite('Instagram: /dev.msaleem');
        termSpace();
    }

    function printThemes(args) {
        if (args && args.length > 0) {
            var name = args[0].toLowerCase();
            if (themes[name]) {
                activeTheme = name;
                var t = themes[name];
                terminal.style.background = t[0];
                terminalBody.style.background = t[0];
                terminalBody.style.color = t[1];
                termWrite('Theme set to <span class="acc">' + name + '</span>', 'acc');
                return;
            }
            termWrite('Unknown theme. Type "themes" to see options.', 'err');
            return;
        }
        termSpace();
        Object.keys(themes).forEach(function (k) {
            termWrite(k + (k === activeTheme ? ' <span class="acc">(active)</span>' : ''), 'dim');
        });
        termSpace();
    }

    function handleCommand(raw) {
        var text = raw.trim();
        termWrite('<span class="prompt-line">' + PROMPT + '</span> <span class="term-cmd">' + escapeHtml(text) + '</span>');
        if (!text) return;
        var parts = text.split(/\s+/);
        var cmd = parts[0].toLowerCase();
        var args = parts.slice(1);

        switch (cmd) {
            case 'help': printHelp(); break;
            case 'whoami': printWhoami(); break;
            case 'about': printAbout(); break;
            case 'projects': printProjects(); break;
            case 'skills': printSkills(); break;
            case 'certs': printCerts(); break;
            case 'contact': printContact(); break;
            case 'themes': printThemes(args); break;
            case 'glow':
                if (args[0] === 'on') { document.body.classList.add('glow-on'); termWrite('Ambient glow: on', 'acc'); }
                else if (args[0] === 'off') { document.body.classList.remove('glow-on'); termWrite('Ambient glow: off', 'acc'); }
                else termWrite('Usage: glow on | off', 'dim');
                break;
            case 'clear': terminalBody.innerHTML = ''; break;
            case 'gui':
            case 'exit':
                termWrite('Switching to GUI mode...', 'dim');
                setTimeout(closeTerminal, 450);
                break;
            default:
                termWrite('command not found: ' + cmd + '. Type "help" for available commands.', 'err');
        }
    }

    function escapeHtml(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    if (terminalInput) {
        terminalInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                var val = this.value;
                handleCommand(val);
                if (val.trim()) {
                    cmdHistory.push(val.trim());
                    histIdx = cmdHistory.length;
                }
                this.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (cmdHistory.length === 0) return;
                histIdx = Math.max(0, histIdx - 1);
                this.value = cmdHistory[histIdx];
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (cmdHistory.length === 0) return;
                histIdx = Math.min(cmdHistory.length, histIdx + 1);
                this.value = histIdx === cmdHistory.length ? '' : cmdHistory[histIdx];
            }
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === '`' || e.key === '~') {
            e.preventDefault();
            if (terminal.classList.contains('open')) closeTerminal();
            else openTerminal();
        }
    });

    /* ===== 10. Ambience ===== */
    if (window.innerWidth > 900) {
        var idle = null;
        window.addEventListener('scroll', function () {
            clearTimeout(idle);
            idle = setTimeout(function () {
                var blob = $('.bg-blob');
                if (blob) blob.style.animationPlayState = 'running';
            }, 200);
        }, { passive: true });
    }

    console.log('%c MSaleem Builds %c portfolio ready. Press ` to open terminal.',
        'background:#3b82f6;color:#000;font-weight:bold;padding:2px 6px;border-radius:4px;',
        'color:#3b82f6');
})();
