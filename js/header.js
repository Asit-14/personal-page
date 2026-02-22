/**
 * Navbar Module — Premium Navigation
 * Debounced scroll, glassmorphism toggle, mobile panel,
 * active section tracking, keyboard navigation, accessibility
 */
(function () {
    'use strict';

    // ---- Elements ----
    var scrollProgress = document.getElementById('scroll-progress');
    var navbar = document.getElementById('navbar');
    var hamburger = document.getElementById('hamburger');
    var mobilePanel = document.getElementById('mobile-panel');
    var navLinks = document.querySelectorAll('.nav-link');
    var mobileLinks = document.querySelectorAll('.mobile-link');
    var mobileCta = document.querySelector('.mobile-cta');
    var sections = document.querySelectorAll('section[id]');

    // ---- Debounced Scroll ----
    var ticking = false;

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(function () {
                updateScrollProgress();
                updateNavbar();
                updateActiveNav();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // ---- Scroll Progress Bar ----
    function updateScrollProgress() {
        if (!scrollProgress) return;
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgress.style.width = progress + '%';
    }

    // ---- Navbar Scroll State ----
    function updateNavbar() {
        if (!navbar) return;
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    }

    // ---- Active Nav Link on Scroll ----
    function updateActiveNav() {
        var scrollY = window.scrollY + 150;
        var found = false;

        // Iterate in reverse to find the deepest matching section
        for (var i = sections.length - 1; i >= 0; i--) {
            var section = sections[i];
            var top = section.offsetTop;
            var height = section.offsetHeight;
            var id = section.getAttribute('id');

            if (scrollY >= top && scrollY < top + height) {
                // Update desktop nav
                navLinks.forEach(function (l) { l.classList.remove('active'); });
                var activeLink = document.querySelector('.nav-link[href="#' + id + '"]');
                if (activeLink) activeLink.classList.add('active');

                // Update mobile nav
                mobileLinks.forEach(function (l) { l.classList.remove('active'); });
                var activeMobile = document.querySelector('.mobile-link[href="#' + id + '"]');
                if (activeMobile) activeMobile.classList.add('active');

                found = true;
                break;
            }
        }

        // If at top, activate Home
        if (!found && window.scrollY < 100) {
            navLinks.forEach(function (l) { l.classList.remove('active'); });
            mobileLinks.forEach(function (l) { l.classList.remove('active'); });
            var homeNav = document.querySelector('.nav-link[href="#home"]');
            var homeMobile = document.querySelector('.mobile-link[href="#home"]');
            if (homeNav) homeNav.classList.add('active');
            if (homeMobile) homeMobile.classList.add('active');
        }
    }

    // ---- Mobile Panel Toggle ----
    var mobileOpen = false;

    function openMobile() {
        mobileOpen = true;
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        mobilePanel.classList.add('open');
        mobilePanel.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Focus first link for keyboard access
        var firstLink = mobilePanel.querySelector('.mobile-link');
        if (firstLink) {
            setTimeout(function () { firstLink.focus(); }, 350);
        }
    }

    function closeMobile() {
        mobileOpen = false;
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        mobilePanel.classList.remove('open');
        mobilePanel.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        // Reset stagger animation state
        var links = mobilePanel.querySelectorAll('.mobile-link, .mobile-cta');
        links.forEach(function (link) {
            link.style.opacity = '';
            link.style.transform = '';
        });
    }

    if (hamburger) {
        hamburger.addEventListener('click', function () {
            if (mobileOpen) {
                closeMobile();
            } else {
                openMobile();
            }
        });
    }

    // Close mobile on link click
    mobileLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            closeMobile();
        });
    });

    if (mobileCta) {
        mobileCta.addEventListener('click', function () {
            closeMobile();
        });
    }

    // Close mobile on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mobileOpen) {
            closeMobile();
            hamburger.focus();
        }
    });

    // Trap focus inside mobile panel when open
    if (mobilePanel) {
        mobilePanel.addEventListener('keydown', function (e) {
            if (e.key !== 'Tab' || !mobileOpen) return;

            var focusable = mobilePanel.querySelectorAll('a, button');
            if (focusable.length === 0) return;

            var first = focusable[0];
            var last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    }

    // Close mobile panel on window resize past breakpoint
    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if (window.innerWidth > 768 && mobileOpen) {
                closeMobile();
            }
        }, 100);
    });

    // ---- Smooth Scroll for Anchor Links ----
    function smoothScroll(targetId) {
        if (!targetId || targetId === '#') return;
        var target = document.querySelector(targetId);
        if (!target) return;

        var navHeight = navbar ? navbar.offsetHeight : 80;
        var top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 8;
        window.scrollTo({ top: top, behavior: 'smooth' });
    }

    // Desktop nav links
    navLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                smoothScroll(href);
            }
        });
    });

    // Mobile nav links
    mobileLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                smoothScroll(href);
            }
        });
    });

    // Other anchor links on the page (CTA buttons, etc.)
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        // Skip nav links already handled
        if (anchor.classList.contains('nav-link') || anchor.classList.contains('mobile-link')) return;

        anchor.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                smoothScroll(href);
                // Close mobile if open
                if (mobileOpen) closeMobile();
            }
        });
    });

    // ---- Initial State ----
    updateNavbar();
    updateScrollProgress();
    updateActiveNav();

})();
