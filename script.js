/**
 * Portfolio — Pure Light Warm Theme
 * Metrics simulation, architecture interactivity,
 * schema viewer, scroll reveals, project filters/modals.
 * Header & Hero logic moved to js/header.js and js/hero.js
 */
document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ============================
    // 1. PAGE LOADER
    // ============================
    const pageLoader = document.getElementById('page-loader');
    if (pageLoader) {
        window.addEventListener('load', () => {
            setTimeout(() => pageLoader.classList.add('hidden'), 800);
        });
        setTimeout(() => pageLoader.classList.add('hidden'), 2500);
    }

    // ============================
    // 5. SCROLL REVEAL
    // ============================
    const revealElements = document.querySelectorAll('.reveal-text, .reveal-up');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ============================
    // 6. ANIMATED SKILL BARS
    // ============================
    const skillFills = document.querySelectorAll('.skill-fill');
    const skillObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const width = fill.getAttribute('data-width');
                fill.style.setProperty('--fill-width', width + '%');
                fill.classList.add('animated');
                observer.unobserve(fill);
            }
        });
    }, { threshold: 0.3 });

    skillFills.forEach(el => skillObserver.observe(el));

    // ============================
    // 7. PROJECT FILTERS
    // ============================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ============================
    // 8. PROJECT MODAL
    // ============================
    const projectData = {
        'task-system': {
            title: 'Task & Project System',
            desc: 'A secure, scalable backend-focused web application built with Node.js, Express, and MongoDB. Features JWT authentication, role-based access control (RBAC), and a clean modular architecture designed for team project management workflows.',
            tags: ['Node.js', 'Express', 'MongoDB', 'JWT', 'RBAC'],
            links: []
        },
        'internship-recommender': {
            title: 'Smart Internship Recommender',
            desc: 'A government-backed AI platform that provides personalized internship recommendations using machine learning algorithms. Features explainable AI, support for 13 Indian languages, and intelligent matching based on student profiles and preferences.',
            tags: ['Python', 'ML', 'NLP', 'Flask', 'AI'],
            links: [
                { text: 'GitHub', url: 'https://github.com/Asit-14/Smart-Internship-Recommender', type: 'secondary' }
            ]
        },
        'echosphere': {
            title: 'EchoSphere - Real-Time Chat',
            desc: 'A full-featured real-time chat application with seamless cross-device communication, secure Google/GitHub OAuth authentication, and instant message delivery powered by Socket.io. Live and used at techinc.app.',
            tags: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'OAuth'],
            links: [
                { text: 'Live Demo', url: 'https://www.techinc.app', type: 'primary' }
            ]
        },
        'face-recognition': {
            title: 'Face Recognition System',
            desc: 'A real-time biometric recognition system built with Python, OpenCV, and dlib. Capable of detecting and matching faces from live webcam feeds with high accuracy using deep learning-based face encoding.',
            tags: ['Python', 'OpenCV', 'dlib', 'Deep Learning'],
            links: [
                { text: 'GitHub', url: 'https://github.com/Asit-14/Face-Recognition-project', type: 'secondary' }
            ]
        }
    };

    const modal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalTags = document.getElementById('modal-tags');
    const modalLinks = document.getElementById('modal-links');

    document.querySelectorAll('.project-preview-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-project');
            const data = projectData[key];
            if (!data) return;

            modalTitle.textContent = data.title;
            modalDesc.textContent = data.desc;

            modalTags.innerHTML = data.tags.map(t =>
                `<span class="tag">${t}</span>`
            ).join('');

            modalLinks.innerHTML = data.links.map(l =>
                `<a href="${l.url}" target="_blank" rel="noopener" class="btn btn-${l.type}">${l.text}</a>`
            ).join('');

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeModal() {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // ============================
    // 9. CONTACT FORM
    // ============================
    const contactForm = document.getElementById('contact-form');
    const sendBtn = document.getElementById('send-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (sendBtn) {
                sendBtn.classList.add('sent');
                sendBtn.disabled = true;
                setTimeout(() => {
                    sendBtn.classList.remove('sent');
                    sendBtn.disabled = false;
                    contactForm.reset();
                }, 3000);
            }
        });
    }

    // ============================
    // 10. FLOATING LABEL FIX
    // ============================
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
        if (!input.getAttribute('placeholder')) {
            input.setAttribute('placeholder', ' ');
        }
    });

    // ============================
    // 11. ARCHITECTURE INTERACTIVITY
    // ============================
    const archNodes = document.querySelectorAll('.arch-node');

    archNodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            const currentName = node.getAttribute('data-node');
            const connects = (node.getAttribute('data-connects') || '').split(',').filter(Boolean);
            const related = new Set([currentName, ...connects]);

            // Also highlight nodes that connect TO this node
            archNodes.forEach(n => {
                const nConnects = (n.getAttribute('data-connects') || '').split(',').filter(Boolean);
                if (nConnects.includes(currentName)) {
                    related.add(n.getAttribute('data-node'));
                }
            });

            archNodes.forEach(n => {
                const nName = n.getAttribute('data-node');
                if (related.has(nName)) {
                    n.classList.add('highlight');
                    n.classList.remove('dimmed');
                } else {
                    n.classList.add('dimmed');
                    n.classList.remove('highlight');
                }
            });
        });

        node.addEventListener('mouseleave', () => {
            archNodes.forEach(n => {
                n.classList.remove('highlight', 'dimmed');
            });
        });
    });

    // ============================
    // 12. SCHEMA VIEWER (Expand/Collapse)
    // ============================
    document.querySelectorAll('.schema-header').forEach(header => {
        header.addEventListener('click', () => {
            const table = header.closest('.schema-table');
            if (!table) return;

            const isExpanded = table.getAttribute('data-expanded') === 'true';
            table.setAttribute('data-expanded', isExpanded ? 'false' : 'true');
            header.setAttribute('aria-expanded', !isExpanded);
        });
    });

    // ============================
    // 13. METRICS SIMULATION
    // ============================
    const metricRpm = document.getElementById('metric-rpm');
    const metricLatency = document.getElementById('metric-latency');
    const metricErrors = document.getElementById('metric-errors');
    const metricHealth = document.getElementById('metric-health');
    const metricRpmBar = document.getElementById('metric-rpm-bar');
    const metricLatencyBar = document.getElementById('metric-latency-bar');
    const metricErrorsBar = document.getElementById('metric-errors-bar');
    const metricHealthBar = document.getElementById('metric-health-bar');

    function randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    function updateMetrics() {
        // Requests per minute: 80-200
        const rpm = Math.floor(randomBetween(80, 200));
        if (metricRpm) metricRpm.textContent = rpm;
        if (metricRpmBar) metricRpmBar.style.width = (rpm / 200 * 100) + '%';

        // Avg latency: 12-65ms
        const latency = Math.floor(randomBetween(12, 65));
        if (metricLatency) metricLatency.innerHTML = latency + '<small>ms</small>';
        if (metricLatencyBar) metricLatencyBar.style.width = (latency / 100 * 100) + '%';

        // Error rate: 0.0-2.5%
        const errorRate = randomBetween(0, 2.5).toFixed(1);
        if (metricErrors) metricErrors.innerHTML = errorRate + '<small>%</small>';
        if (metricErrorsBar) metricErrorsBar.style.width = (errorRate / 5 * 100) + '%';

        // Update status dots based on values
        const statusDots = document.querySelectorAll('.metric-card-status');
        statusDots.forEach((dot, i) => {
            dot.className = 'metric-card-status';
            if (i === 0) { // RPM
                dot.classList.add(rpm > 150 ? 'status-green' : 'status-yellow');
            } else if (i === 1) { // Latency
                dot.classList.add(latency < 40 ? 'status-green' : latency < 60 ? 'status-yellow' : 'status-red');
            } else if (i === 2) { // Error rate
                dot.classList.add(errorRate < 1 ? 'status-green' : errorRate < 2 ? 'status-yellow' : 'status-red');
            } else if (i === 3) { // Health
                const healthScore = 100 - (latency * 0.3 + errorRate * 10);
                const healthPct = Math.max(60, Math.min(100, healthScore));
                if (metricHealth) {
                    metricHealth.textContent = healthPct > 90 ? 'Operational' : healthPct > 75 ? 'Degraded' : 'Warning';
                    metricHealth.style.color = healthPct > 90 ? 'var(--green)' : healthPct > 75 ? '#D4A843' : 'var(--red)';
                }
                if (metricHealthBar) metricHealthBar.style.width = healthPct + '%';
                dot.classList.add(healthPct > 90 ? 'status-green' : healthPct > 75 ? 'status-yellow' : 'status-red');
            }
        });
    }

    // Only run metrics simulation when visible
    const metricsSection = document.querySelector('.metrics-dashboard');
    if (metricsSection) {
        let metricsInterval = null;
        const metricsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!metricsInterval) {
                        updateMetrics();
                        metricsInterval = setInterval(updateMetrics, 3000);
                    }
                } else {
                    if (metricsInterval) {
                        clearInterval(metricsInterval);
                        metricsInterval = null;
                    }
                }
            });
        }, { threshold: 0.2 });

        metricsObserver.observe(metricsSection);
    }

});
