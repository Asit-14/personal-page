document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONFIGURATION ---
    const CONFIG = {
        tilt: {
            max: 10,          // Max tilt angle (degrees)
            perspective: 1000,
            scale: 1.02,      // Scale on hover
            speed: 1000,      // Transition speed (for reset)
            easing: "cubic-bezier(.03,.98,.52,.99)"
        },
        lerpFactor: 0.1       // Smoothness factor (lower = smoother)
    };

    // --- 2. 3D TILT ENGINE (Vanilla JS) ---
    const tiltWrappers = document.querySelectorAll('[data-tilt]');

    class TiltCard {
        constructor(el) {
            this.el = el;
            // The card element that actually rotates
            this.card = el.querySelector('.tilt-card, .glass-card, .glass-card-solid');
            // The content that is pushed forward (translateZ)
            this.content = el.querySelector('.tilt-content');
            
            if(!this.card) return;

            this.width = this.el.offsetWidth;
            this.height = this.el.offsetHeight;
            this.left = this.el.offsetLeft;
            this.top = this.el.offsetTop;
            
            this.targetRotateX = 0;
            this.targetRotateY = 0;
            this.currentRotateX = 0;
            this.currentRotateY = 0;
            
            this.isHovering = false;
            this.rafId = null;

            this.init();
        }

        init() {
            this.el.addEventListener('mouseenter', this.handleEnter.bind(this));
            this.el.addEventListener('mousemove', this.handleMove.bind(this));
            this.el.addEventListener('mouseleave', this.handleLeave.bind(this));
            window.addEventListener('resize', this.handleResize.bind(this));
        }

        handleResize() {
            this.width = this.el.offsetWidth;
            this.height = this.el.offsetHeight;
            const rect = this.el.getBoundingClientRect();
            this.left = rect.left + window.scrollX;
            this.top = rect.top + window.scrollY;
        }

        handleEnter() {
            this.isHovering = true;
            this.handleResize(); // Recalculate positions
            // Start the animation loop
            if (!this.rafId) {
                this.rafId = requestAnimationFrame(this.update.bind(this));
            }
            // Kill CSS transition for JS control during hover
            this.card.style.transition = 'none'; 
        }

        handleMove(e) {
            // Mouse position relative to the element
            const rect = this.el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Center is (0.5, 0.5)
            const centerX = this.width / 2;
            const centerY = this.height / 2;

            // Calculate rotation
            // rotateX is based on Y position (tilt up/down)
            // rotateY is based on X position (tilt left/right)
            const percentX = (x - centerX) / centerX;
            const percentY = (y - centerY) / centerY;

            this.targetRotateY = percentX * CONFIG.tilt.max;
            this.targetRotateX = -percentY * CONFIG.tilt.max;
        }

        handleLeave() {
            this.isHovering = false;
            this.targetRotateX = 0;
            this.targetRotateY = 0;
            
            // Restore CSS transition for smooth reset
            this.card.style.transition = `transform 0.5s ${CONFIG.tilt.easing}`;
        }

        lerp(start, end, factor) {
            return start + (end - start) * factor;
        }

        update() {
            // Interpolate current values towards target values
            this.currentRotateX = this.lerp(this.currentRotateX, this.targetRotateX, CONFIG.lerpFactor);
            this.currentRotateY = this.lerp(this.currentRotateY, this.targetRotateY, CONFIG.lerpFactor);

            // Optimization: Stop loop if close to target and not hovering
            const deltaX = Math.abs(this.targetRotateX - this.currentRotateX);
            const deltaY = Math.abs(this.targetRotateY - this.currentRotateY);

            if (this.isHovering || deltaX > 0.05 || deltaY > 0.05) {
                this.card.style.transform = `
                    perspective(${CONFIG.tilt.perspective}px) 
                    rotateX(${this.currentRotateX}deg) 
                    rotateY(${this.currentRotateY}deg)
                    scale3d(${CONFIG.tilt.scale}, ${CONFIG.tilt.scale}, ${CONFIG.tilt.scale})
                `;
                
                this.rafId = requestAnimationFrame(this.update.bind(this));
            } else {
                this.rafId = null;
                // Ensure perfect reset
                if(!this.isHovering) {
                   this.card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
                }
            }
        }
    }

    // Initialize Tilt for all elements
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
        tiltWrappers.forEach(el => new TiltCard(el));
    }


    // --- 3. SCROLL REVEAL OBSERVER ---
    const revealElements = document.querySelectorAll('.reveal-text, .reveal-up');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before element is fully in view
    });

    revealElements.forEach(el => revealObserver.observe(el));


    // --- 4. NAVIGATION LOGIC ---
    const header = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky Header Blur Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.style.background = 'rgba(5, 5, 5, 0.7)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.01)'; // Almost transparent
        }
    }, { passive: true });

    // Mobile Menu
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Close menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if(navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });

    

    // --- 5. SMOOTH SCROLL ANCHORS ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
    

});

