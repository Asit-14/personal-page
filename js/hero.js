/**
 * Hero Section Module
 * Staggered fade-in, name word reveal, typing animation,
 * subtle mouse parallax, button ripple effect
 */
(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- Staggered Reveal ----
    function staggerReveal() {
        var elements = [
            { el: document.querySelector('.hero-greeting'), delay: 100 },
            { el: document.querySelector('.hero-name'), delay: 300 },
            { el: document.querySelector('.hero-role'), delay: 550 },
            { el: document.querySelector('.hero-desc'), delay: 750 },
            { el: document.querySelector('.hero-cta-group'), delay: 950 }
        ];

        elements.forEach(function (item) {
            if (!item.el) return;
            if (prefersReducedMotion) {
                item.el.style.opacity = '1';
                item.el.style.transform = 'translateY(0)';
                return;
            }
            setTimeout(function () {
                item.el.classList.add('hero-revealed');
            }, item.delay);
        });
    }

    // ---- Name Word-by-Word Reveal ----
    function initNameReveal() {
        var nameEl = document.querySelector('.hero-name');
        if (!nameEl) return;

        var text = nameEl.textContent.trim();
        var words = text.split(/\s+/);

        nameEl.innerHTML = '';

        words.forEach(function (word, index) {
            var span = document.createElement('span');
            span.className = 'hero-word';
            span.textContent = word;
            span.style.animationDelay = (index * 100 + 300) + 'ms';
            nameEl.appendChild(span);
            if (index < words.length - 1) {
                nameEl.appendChild(document.createTextNode(' '));
            }
        });

        if (prefersReducedMotion) {
            nameEl.querySelectorAll('.hero-word').forEach(function (w) {
                w.style.opacity = '1';
                w.style.transform = 'none';
            });
            return;
        }

        // Trigger animation
        requestAnimationFrame(function () {
            nameEl.classList.add('animate-active');
        });
    }

    // ---- Typing Animation ----
    function initTypingAnimation() {
        var textEl = document.getElementById('typing-text');
        var cursorEl = document.querySelector('.terminal-cursor');
        if (!textEl) return;

        var phrases = [
            'Designing Secure APIs',
            'Optimizing Database Queries',
            'Building Scalable Systems',
            'Architecting Microservices',
            'Crafting Clean Code'
        ];

        var phraseIndex = 0;
        var charIndex = 0;
        var isDeleting = false;
        var typeSpeed = 65;
        var deleteSpeed = 35;
        var pauseEnd = 2000;
        var pauseStart = 400;

        function type() {
            var currentPhrase = phrases[phraseIndex];

            if (!isDeleting) {
                textEl.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;

                if (charIndex === currentPhrase.length) {
                    isDeleting = true;
                    setTimeout(type, pauseEnd);
                    return;
                }
                setTimeout(type, typeSpeed);
            } else {
                textEl.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;

                if (charIndex === 0) {
                    isDeleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    setTimeout(type, pauseStart);
                    return;
                }
                setTimeout(type, deleteSpeed);
            }
        }

        // Start typing after initial reveal
        setTimeout(type, 1200);
    }

    // ---- Mouse Parallax on Hero Visual ----
    function initParallax() {
        if (prefersReducedMotion) return;

        var visual = document.querySelector('.hero-visual');
        if (!visual) return;

        var heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        heroSection.addEventListener('mousemove', function (e) {
            var rect = heroSection.getBoundingClientRect();
            var x = (e.clientX - rect.left) / rect.width - 0.5;
            var y = (e.clientY - rect.top) / rect.height - 0.5;

            visual.style.transform = 'translate(' + (x * 12) + 'px, ' + (y * 8) + 'px)';
        });

        heroSection.addEventListener('mouseleave', function () {
            visual.style.transform = 'translate(0, 0)';
            visual.style.transition = 'transform 0.4s ease';
            setTimeout(function () {
                visual.style.transition = '';
            }, 400);
        });
    }

    // ---- Button Ripple Effect ----
    function initRipple() {
        var buttons = document.querySelectorAll('.btn-hero-primary, .btn-hero-outline');

        buttons.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                var ripple = document.createElement('span');
                ripple.className = 'ripple';

                var rect = btn.getBoundingClientRect();
                var size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

                btn.appendChild(ripple);

                setTimeout(function () {
                    ripple.remove();
                }, 600);
            });
        });
    }

    // ---- Initialize ----
    document.addEventListener('DOMContentLoaded', function () {
        initNameReveal();
        staggerReveal();
        initTypingAnimation();
        initParallax();
        initRipple();
    });
})();
