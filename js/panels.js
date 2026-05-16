/**
 * Panel System — Dialog-style centered modals
 * Open/close panels, navbar hide, prev/next nav, tabs, form
 */
(function () {
    'use strict';

    var overlay     = null;
    var navbar      = null;
    var currentPanel = null;
    var panels      = {};

    // ---- Init ----
    function init() {
        overlay = document.getElementById('panel-overlay');
        navbar  = document.getElementById('navbar');

        document.querySelectorAll('.side-panel').forEach(function (el) {
            var id = el.id.replace('panel-', '');
            panels[id] = el;
        });

        bindCloseButtons();
        bindOverlay();
        bindKeyboard();
        bindNavTriggers();
        bindNavArrows();
        initProjectTabs();
        initContactForm();

        document.addEventListener('graph:open', function (e) {
            openPanel(e.detail.panelId);
        });
    }

    // ---- Open Panel ----
    function openPanel(id) {
        var panel = panels[id];
        if (!panel) return;

        // Close existing without animation delay
        if (currentPanel && currentPanel !== panel) {
            currentPanel.classList.remove('panel-open');
        }

        currentPanel = panel;
        panel.classList.add('panel-open');
        overlay.classList.add('active');

        // Hide navbar
        if (navbar) navbar.classList.add('navbar--hidden');

        // Trap focus inside dialog
        panel.setAttribute('aria-hidden', 'false');
        var focusable = panel.querySelector('button, a, input, textarea, [tabindex]');
        if (focusable) setTimeout(function () { focusable.focus(); }, 350);

        // Highlight graph node
        if (window.GraphEngine) window.GraphEngine.setActiveNode(id);

        // Mark active nav link
        document.querySelectorAll('[data-panel]').forEach(function (el) {
            el.classList.toggle('nav-active', el.getAttribute('data-panel') === id);
        });
    }

    // ---- Close Panel ----
    function closePanel() {
        if (!currentPanel) return;
        currentPanel.classList.remove('panel-open');
        currentPanel.setAttribute('aria-hidden', 'true');
        overlay.classList.remove('active');
        currentPanel = null;

        // Show navbar again
        if (navbar) navbar.classList.remove('navbar--hidden');

        document.querySelectorAll('[data-panel]').forEach(function (el) {
            el.classList.remove('nav-active');
        });

        if (window.GraphEngine) window.GraphEngine.setActiveNode(null);
    }

    // ---- Close Buttons (X) ----
    function bindCloseButtons() {
        document.querySelectorAll('.panel-close').forEach(function (btn) {
            btn.addEventListener('click', closePanel);
        });
    }

    // ---- Overlay Click ----
    function bindOverlay() {
        if (overlay) overlay.addEventListener('click', closePanel);
    }

    // ---- Keyboard ----
    function bindKeyboard() {
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && currentPanel) closePanel();
        });
    }

    // ---- Nav link triggers (navbar + graph nodes + inline links) ----
    function bindNavTriggers() {
        document.querySelectorAll('[data-panel]').forEach(function (el) {
            if (el.tagName === 'A' || el.tagName === 'BUTTON') {
                el.addEventListener('click', function (e) {
                    var id = el.getAttribute('data-panel');
                    if (id && panels[id]) {
                        e.preventDefault();
                        openPanel(id);
                    }
                });
            }
        });
    }

    // ---- Prev / Next arrows ----
    function bindNavArrows() {
        document.querySelectorAll('.panel-nav-btn[data-nav-to]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var target = btn.getAttribute('data-nav-to');
                if (target && panels[target]) openPanel(target);
            });
        });
    }

    // ---- Project Tabs ----
    function initProjectTabs() {
        document.querySelectorAll('.proj-tabs').forEach(function (container) {
            var tabs      = container.querySelectorAll('.proj-tab');
            var panelBody = container.closest('.side-panel').querySelector('.panel-body');

            tabs.forEach(function (tab) {
                tab.addEventListener('click', function () {
                    var idx = tab.getAttribute('data-proj');
                    tabs.forEach(function (t) { t.classList.remove('active'); });
                    tab.classList.add('active');
                    panelBody.querySelectorAll('.proj-content').forEach(function (c) {
                        c.classList.remove('active');
                    });
                    var content = panelBody.querySelector('.proj-content[data-proj-content="' + idx + '"]');
                    if (content) {
                        content.classList.add('active');
                        panelBody.scrollTop = 0;
                    }
                });
            });
        });
    }

    // ---- Contact Form ----
    function initContactForm() {
        var form    = document.getElementById('contact-form');
        var sendBtn = document.getElementById('send-btn');
        if (!form) return;

        form.querySelectorAll('input, textarea').forEach(function (el) {
            if (!el.getAttribute('placeholder')) el.setAttribute('placeholder', ' ');
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!sendBtn) return;
            sendBtn.classList.add('sent');
            sendBtn.disabled = true;
            setTimeout(function () {
                sendBtn.classList.remove('sent');
                sendBtn.disabled = false;
                form.reset();
            }, 3000);
        });
    }

    // ---- Boot ----
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.PanelSystem = { open: openPanel, close: closePanel };
})();
