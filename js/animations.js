// Ensure GSAP plugins are registered
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // CUSTOM CURSOR
    // ==========================================
    const cursor = document.querySelector('.cursor-glow');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.8,
                ease: 'power2.out'
            });
        });
    }

    // ==========================================
    // ENTRY EXPERIENCE (Galaxy / Stars Canvas)
    // ==========================================
    const canvas = document.getElementById('galaxy-canvas');
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let stars = [];
    const numStars = 200;

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Star {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.z = Math.random() * width;
            this.radius = Math.random() * 1.5;
        }

        update() {
            this.z -= 0.5; // speed of moving towards viewer
            if (this.z <= 0) {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.z = width;
            }
        }

        draw() {
            let x, y, radius, scale;
            scale = width / this.z;
            x = (this.x - width / 2) * scale + width / 2;
            y = (this.y - height / 2) * scale + height / 2;
            radius = this.radius * scale;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${1 - this.z / width})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
    }

    let animationId;
    function animateStars() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // creates trailing effect
        ctx.fillRect(0, 0, width, height);
        
        stars.forEach(star => {
            star.update();
            star.draw();
        });
        animationId = requestAnimationFrame(animateStars);
    }
    animateStars();

    // ==========================================
    // ENTRY TIMELINE
    // ==========================================
    const tlInfo = gsap.timeline();
    const mainApp = document.getElementById('main-app');
    const entryScreen = document.getElementById('entry-experience');

    tlInfo
        // Step 1: Wait a sec, then fade in name
        .to('.entry-name', { opacity: 1, y: -20, duration: 2, ease: 'power3.out' })
        // Step 2: Show loading line
        .to('.loading-line, .loading-status', { opacity: 1, duration: 1 })
        // Step 3: Fake progress fill
        .to('.loading-progress', { width: '100%', duration: 1.5, ease: 'power2.inOut' })
        // Step 4: Zoom & transform stars to website background
        .to('.entry-content', { scale: 1.5, opacity: 0, duration: 1, ease: 'power4.in' }, "+=0.5")
        .to(canvas, { scale: 3, opacity: 0, duration: 1, ease: 'power4.in' }, "<")
        .call(() => {
            // Stop canvas loop
            cancelAnimationFrame(animationId);
            entryScreen.classList.add('hidden');
            mainApp.classList.remove('hidden');
            // Trigger Hero Setup
            initMainAnimations();
        });

    // ==========================================
    // MAIN APP ANIMATIONS (ScrollTriggers & Hero)
    // ==========================================
    function initMainAnimations() {
        
        // --- HERO TYPING ---
        const typingText = document.getElementById("typing-text");
        const words = ["Full Stack Developer", "React & Node.js Engineer", "Automation Specialist", "Problem Solver"];
        let count = 0;
        let index = 0;
        let currentText = "";
        let letter = "";
        
        function type() {
            if (count === words.length) { count = 0; }
            currentText = words[count];
            letter = currentText.slice(0, ++index);
            typingText.textContent = letter;
            if (letter.length === currentText.length) {
                setTimeout(erase, 2000);
            } else {
                setTimeout(type, 100);
            }
        }
        function erase() {
            currentText = words[count];
            letter = currentText.slice(0, --index);
            typingText.textContent = letter;
            if (letter.length === 0) {
                count++;
                setTimeout(type, 500);
            } else {
                setTimeout(erase, 50);
            }
        }
        type(); // start typing

        // --- HERO LOAD ANIMATIONS ---
        gsap.from('.hero-greeting', { opacity: 0, y: 20, duration: 1, delay: 0.2 });
        gsap.from('.hero-title', { opacity: 0, y: 20, duration: 1, delay: 0.4 });
        gsap.from('.hero-subtitle', { opacity: 0, y: 20, duration: 1, delay: 0.6 });
        gsap.from('.hero-actions', { opacity: 0, y: 20, duration: 1, delay: 0.8 });
        gsap.from('.hero-card', { opacity: 0, scale: 0.8, rotationY: 15, duration: 1.5, delay: 1, ease: 'back.out(1.5)' });

        // --- NAVIGATION HIDDEN ON SCROLL DOWN (Desktop Only) ---
        let lastScroll = 0;
        const nav = document.querySelector('.glass-nav');
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (window.innerWidth > 768) {
                if (currentScroll > 100 && currentScroll > lastScroll) {
                    nav.classList.add('nav-hidden');
                } else {
                    nav.classList.remove('nav-hidden');
                }
            } else {
                // Lock on mobile
                nav.classList.remove('nav-hidden');
            }
            lastScroll = currentScroll;
        });

        // --- STORY REVEALS (ABOUT SECTION) ---
        gsap.utils.toArray('.story-block').forEach((block, i) => {
            ScrollTrigger.create({
                trigger: block,
                start: "top 80%",
                onEnter: () => gsap.to(block, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' })
            });
        });

        // --- TIMELINE REVEALS (EXPERIENCE) ---
        window.bindExperienceAnimations = function() {
            gsap.utils.toArray('.timeline-item:not(.animated)').forEach((item, index) => {
                item.classList.add('animated');
                
                // Immediately animate async items in so they never get stuck hidden
                gsap.fromTo(item, 
                    { opacity: 0, x: -50 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        delay: index * 0.2, // basic stagger
                        ease: 'back.out(1)'
                    }
                );
            });
        };

        // --- SKILL NODES PLACEMENT ---
        // Dynamically recalculate because these might load from Google Sheets
        window.recalculateSkillsGalaxy = function() {
            const skillsContainer = document.getElementById('skills-nodes');
            const uiSkills = document.querySelectorAll('.ui-skill');
            if(!skillsContainer || uiSkills.length === 0) return;
            
            const isMobile = window.innerWidth <= 650;
            // Radii must match CSS orbit widths
            const radiusInner = isMobile ? 110 : 175; 
            const radiusOuter = isMobile ? 165 : 275; 
            
            // Center points based on CSS widths (300px mobile, 600px desktop)
            const cx = isMobile ? 150 : 300;
            const cy = isMobile ? 150 : 300;
            
            uiSkills.forEach((skill, index) => {
                const radius = (index % 2 === 0) ? radiusInner : radiusOuter;
                const angle = (index / uiSkills.length) * (2 * Math.PI);
                
                const x = cx + radius * Math.cos(angle);
                const y = cy + radius * Math.sin(angle);
                
                skill.style.left = `${x}px`;
                skill.style.top = `${y}px`;
                
                // Re-apply floating animation correctly
                gsap.killTweensOf(skill);
                gsap.to(skill, {
                    y: y - 10,
                    duration: 2 + Math.random(),
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            });
        };

        window.recalculateSkillsGalaxy();
        window.addEventListener('resize', window.recalculateSkillsGalaxy);

        // --- PROJECTS REVEALS ---
        window.bindProjectAnimations = function() {
            const cards = gsap.utils.toArray('.project-card:not(.animated)');
            if(cards.length === 0) return;
            
            cards.forEach(card => card.classList.add('animated'));
            
            gsap.fromTo(cards, 
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: "power2.out"
                }
            );
        };

        // If the background AJAX data fetch finished *before* the intro animation completed, 
        // the items were injected with 0 opacity but never triggered to appear. 
        // We call them here to mathematically guarantee any loaded data becomes visible.
        if (typeof window.bindExperienceAnimations === 'function') window.bindExperienceAnimations();
        if (typeof window.bindProjectAnimations === 'function') window.bindProjectAnimations();
    }
});
