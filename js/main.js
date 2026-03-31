document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // THEME TOGGLER
    // ==========================================
    const themeBtn = document.getElementById('theme-btn');
    const htmlEl = document.documentElement;

    // Default to dark mode as per requirements
    htmlEl.setAttribute('data-theme', 'dark');

    themeBtn.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            htmlEl.setAttribute('data-theme', 'light');
            themeBtn.innerHTML = '<i class="ph ph-moon"></i>';
        } else {
            htmlEl.setAttribute('data-theme', 'dark');
            themeBtn.innerHTML = '<i class="ph ph-sun"></i>';
        }
    });

    // ==========================================
    // MOBILE BURGER MENU
    // ==========================================
    const burgerBtn = document.getElementById('mobile-menu-btn');
    const mobileTray = document.getElementById('mobile-tray');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (burgerBtn && mobileTray) {
        burgerBtn.addEventListener('click', () => {
            mobileTray.classList.toggle('active');
            const icon = burgerBtn.querySelector('i');
            if (mobileTray.classList.contains('active')) {
                icon.classList.replace('ph-list', 'ph-x');
            } else {
                icon.classList.replace('ph-x', 'ph-list');
            }
        });

        // Close when clicking a link
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileTray.classList.remove('active');
                const icon = burgerBtn.querySelector('i');
                icon.classList.replace('ph-x', 'ph-list');
            });
        });
    }

    // ==========================================
    // BLURRED SECRETS REVEAL (Custom Modal)
    // ==========================================
    const revealBtns = document.querySelectorAll('.blur-reveal-container');
    const captchaModal = document.getElementById('captcha-modal');
    const captchaQuestion = document.getElementById('captcha-question');
    const captchaInput = document.getElementById('captcha-input');
    const captchaSubmitBtn = document.getElementById('captcha-submit');
    const captchaError = document.getElementById('captcha-error');
    const closeCaptchaBtn = document.querySelector('.close-captcha-btn');

    let currentCaptchaAnswer = 0;
    let targetRevealBtn = null;

    revealBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('revealed')) return;

            targetRevealBtn = btn;
            const a = Math.floor(Math.random() * 5) + 1;
            const b = Math.floor(Math.random() * 5) + 1;
            currentCaptchaAnswer = a + b;

            captchaQuestion.textContent = `Security Check: What is ${a} + ${b}?`;
            captchaInput.value = '';

            if (captchaError) captchaError.classList.add('hidden');
            if (captchaModal) captchaModal.classList.remove('hidden');

            setTimeout(() => {
                if (captchaInput) captchaInput.focus();
            }, 100);
        });
    });

    function verifyCaptcha() {
        if (!targetRevealBtn) return;

        const answer = parseInt(captchaInput.value);
        if (answer === currentCaptchaAnswer) {
            targetRevealBtn.classList.add('revealed');
            const overlay = targetRevealBtn.querySelector('.reveal-overlay');
            if (overlay) overlay.innerHTML = '<i class="ph ph-check-circle"></i> Verified Human';
            closeCaptcha();
        } else {
            if (captchaError) captchaError.classList.remove('hidden');
            if (captchaInput) {
                captchaInput.value = '';
                captchaInput.focus();
            }
        }
    }

    if (captchaSubmitBtn) {
        captchaSubmitBtn.addEventListener('click', verifyCaptcha);
    }

    if (captchaInput) {
        captchaInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') verifyCaptcha();
        });
    }

    function closeCaptcha() {
        if (captchaModal) captchaModal.classList.add('hidden');
        targetRevealBtn = null;
    }

    if (closeCaptchaBtn) {
        closeCaptchaBtn.addEventListener('click', closeCaptcha);
    }

    // ==========================================
    // SKILLS GALAXY TOOLTIPS
    // ==========================================
    const tooltip = document.getElementById('skill-tooltip');
    const tooltipTitle = document.getElementById('tooltip-title');
    const tooltipDesc = document.getElementById('tooltip-desc');

    function bindSkillTooltips() {
        const skillsNodes = document.querySelectorAll('.ui-skill');
        if (!skillsNodes || !tooltip) return;
        
        skillsNodes.forEach(node => {
            // Remove old listeners to avoid duplicates if rebound
            const new_node = node.cloneNode(true);
            node.parentNode.replaceChild(new_node, node);
            
            new_node.addEventListener('mouseenter', (e) => {
                const title = new_node.textContent;
                const desc = new_node.getAttribute('data-desc');

                tooltipTitle.textContent = title;
                tooltipDesc.textContent = desc;

                const rect = new_node.getBoundingClientRect();
                tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
                tooltip.style.top = `${rect.top + window.scrollY - 60}px`;

                tooltip.classList.remove('hidden');
                setTimeout(() => tooltip.classList.add('show'), 10);
            });

            new_node.addEventListener('mouseleave', () => {
                tooltip.classList.remove('show');
                setTimeout(() => tooltip.classList.add('hidden'), 300);
            });
        });
    }

    // In case static ones exist at load
    bindSkillTooltips();

    // ==========================================
    // DYNAMIC PORTFOLIO INTEGRATION
    // ==========================================
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyMhtlR9TC6Inaq29Eoi8Z0p66YfKMzx4PfXAtgng3Xibvc6ckLc3k8UanXVHJL1-h7/exec";

    // Projects Elements
    const modal = document.getElementById('project-modal');
    const closeBtn = document.querySelector('.close-modal-btn');
    const body = document.body;
    let dynamicProjectData = {};
    const projectsGrid = document.getElementById('dynamic-projects-grid');
    const projectsLoader = document.getElementById('projects-loader');

    // Skills Elements
    const skillsContainer = document.getElementById('skills-nodes');
    const skillsLoader = document.getElementById('skills-loader');

    // Experience Elements
    const timelineContainer = document.querySelector('.timeline');
    const expLoader = document.getElementById('experience-loader');
    const timelineLine = document.querySelector('.timeline-line');

    if (projectsGrid) {
        // Appending &t=${Date.now()} busts Google's aggressive GET Cache so updates are instant.
        fetch(`${SCRIPT_URL}?action=getPortfolioData&t=${Date.now()}`)
            .then(response => response.json())
            .then(jsonResponse => {
                const payload = jsonResponse.data || {};
                
                // --- 1. RENDER SKILLS ---
                const skillsArray = payload.skills || [];
                if (skillsArray.length > 0 && skillsContainer) {
                    if (skillsLoader) skillsLoader.style.display = 'none';
                    skillsArray.forEach(skill => {
                        if(!skill.Title) return;
                        const iconClass = skill.Icon || 'ph-code';
                        const skillHtml = `<div class="skill-node ui-skill" data-desc="${skill.Description || ''}"><i class="ph ${iconClass}"></i> ${skill.Title}</div>`;
                        skillsContainer.insertAdjacentHTML('beforeend', skillHtml);
                    });
                    bindSkillTooltips();
                    if(window.recalculateSkillsGalaxy) window.recalculateSkillsGalaxy();
                }

                // --- 2. RENDER EXPERIENCE ---
                const expArray = payload.experience || [];
                console.log("AJAX Experience Data:", expArray);
                if (expLoader) expLoader.style.display = 'none';
                
                if (expArray.length > 0 && timelineContainer) {
                    expArray.forEach(exp => {
                        const role = exp.Role || exp.role || exp.Title || '';
                        const date = exp.Date || exp.date || '';
                        const desc = exp.Description || exp.description || '';
                        const highlight = String(exp.Highlight || exp.highlight || '').toUpperCase();
                        
                        if(!role && !desc) return;
                        
                        const isGlow = (highlight === "TRUE" || highlight === "YES" || highlight === "1") ? "block-glow" : "";
                        const expHtml = `
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content glass-panel">
                                    <span class="timeline-date ${isGlow}">${date}</span>
                                    <h3 class="timeline-role">${role}</h3>
                                    <p class="timeline-desc">${desc}</p>
                                </div>
                            </div>
                        `;
                        timelineContainer.insertAdjacentHTML('beforeend', expHtml);
                    });
                } else if (timelineContainer) {
                    timelineContainer.insertAdjacentHTML('beforeend', '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No experience timeline data found.</p>');
                }

                // --- 3. RENDER PROJECTS ---
                let projectsArray = payload.projects || [];
                if (!projectsArray || projectsArray.length === 0) {
                    if (projectsLoader) projectsLoader.innerHTML = "<p>No active projects available right now. Check back soon!</p>";
                } else {
                    if (projectsLoader) projectsLoader.style.display = 'none';
                }

                projectsArray.forEach((proj, index) => {
                    // Requires at minimum a Title to display
                    if (!proj.Title) return;

                    const id = `proj_${index}`;
                    
                    let tagsArray = [];
                    if (proj.Tags) {
                        tagsArray = proj.Tags.toString().split(',').map(tag => tag.trim());
                    }

                    dynamicProjectData[id] = {
                        title: proj.Title,
                        tags: tagsArray,
                        problem: proj.Problem || 'No problem described.',
                        solution: proj.Solution || 'No solution described.',
                        impact: proj.Impact || 'No impact metrics available.',
                        image: proj.ImageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop', // Fallback thumbnail
                        demoUrl: proj.DemoUrl || '' // Make sure to add column 'DemoUrl' in sheet
                    };

                    const card = document.createElement('article');
                    card.className = 'project-card interactive-hover';
                    card.setAttribute('data-project', id);

                    // Apply image background to avoid plain pattern look
                    let bgStyle = `background-image: url('${dynamicProjectData[id].image}'); background-size: cover; background-position: center;`;

                    const techBadgesHtml = tagsArray.slice(0, 3).map(tag => `<span class="badge">${tag}</span>`).join('');

                    card.innerHTML = `
                        <div class="project-image-wrapper">
                            <div class="gradient-overlay"></div>
                            <div class="project-placeholder bg-pattern-${(index % 2) + 1}" style="${bgStyle}"></div>
                        </div>
                        <div class="project-info glass-panel">
                            <div class="tech-badges">
                                ${techBadgesHtml}
                            </div>
                            <h3 class="project-card-title">${proj.Title}</h3>
                            <button class="btn-text open-modal-btn">View Case Study <i class="ph ph-arrow-right"></i></button>
                        </div>
                    `;

                    projectsGrid.appendChild(card);
                });

                // Trigger Animations on new elements
                if (typeof window.bindExperienceAnimations === 'function') {
                    window.bindExperienceAnimations();
                }
                if (typeof window.bindProjectAnimations === 'function') {
                    window.bindProjectAnimations();
                }

                bindModalEvents();
                // Refresh ScrollTrigger hooks for new elements if GSAP is loaded
                if (typeof ScrollTrigger !== 'undefined') {
                    setTimeout(() => ScrollTrigger.refresh(), 100);
                }
            })
            .catch(error => {
                console.error("Error fetching portfolio backend:", error);
                if (projectsLoader) projectsLoader.innerHTML = `<p style="color: #ef4444;">Failed to load projects API.</p>`;
            });
    }

    function bindModalEvents() {
        const openBtns = document.querySelectorAll('.open-modal-btn');
        openBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = e.target.closest('.project-card');
                const projectId = card.getAttribute('data-project');
                const data = dynamicProjectData[projectId];

                if (data) {
                    document.getElementById('modal-title-hero').textContent = data.title;
                    document.getElementById('modal-title').textContent = data.title;
                    document.getElementById('modal-problem').innerText = data.problem;
                    document.getElementById('modal-solution').innerText = data.solution;
                    // safely allow simple HTML like lists or <br> if we replace newlines
                    document.getElementById('modal-impact').innerHTML = data.impact.replace(/\n/g, '<br/>');

                    const tagsContainer = document.getElementById('modal-tags');
                    tagsContainer.innerHTML = '';
                    data.tags.forEach(tag => {
                        const span = document.createElement('span');
                        span.className = 'badge';
                        span.textContent = tag;
                        tagsContainer.appendChild(span);
                    });

                    // Update Hero Image
                    const modalHero = document.querySelector('.modal-banner-placeholder');
                    if (data.image && modalHero) {
                        modalHero.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.3), var(--bg-primary)), url('${data.image}')`;
                        modalHero.style.backgroundSize = 'cover';
                        modalHero.style.backgroundPosition = 'center';
                    }

                    // Setup Demo Button visibility
                    const demoBtn = document.getElementById('modal-demo-btn');
                    if (demoBtn) {
                        if (data.demoUrl) {
                            demoBtn.href = data.demoUrl;
                            demoBtn.style.display = 'inline-flex';
                        } else {
                            demoBtn.style.display = 'none';
                            demoBtn.href = '#';
                        }
                    }

                    modal.classList.remove('hidden');
                    modal.setAttribute('aria-hidden', 'false');
                    body.classList.add('no-scroll');

                    // Animate entry
                    if (typeof gsap !== 'undefined') {
                        gsap.fromTo('.modal-content-container',
                            { y: "100%", opacity: 0 },
                            { y: "0%", opacity: 1, duration: 0.6, ease: 'power4.out' }
                        );
                    }
                }
            });
        });
    }

    closeBtn.addEventListener('click', () => {
        gsap.to('.modal-content-container', {
            y: "100%",
            opacity: 0,
            duration: 0.5,
            ease: 'power3.in',
            onComplete: () => {
                modal.classList.add('hidden');
                modal.setAttribute('aria-hidden', 'true');
                body.classList.remove('no-scroll');
            }
        });
    });

    // ==========================================
    // CONTACT FORM (GOOGLE APPS SCRIPT CMS)
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text-content');
    const btnIcon = submitBtn.querySelector('i');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const formMessage = document.getElementById('form-message');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic validation check
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const idea = document.getElementById('idea').value;

        if (!name || !email || !idea) return;

        // UI Loading state
        btnText.textContent = "Transmitting...";
        btnIcon.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        submitBtn.disabled = true;

        const formData = new FormData(contactForm);

        fetch(SCRIPT_URL, {
            method: 'POST',
            body: formData,
            // mode: 'no-cors' // Use this if CORS issues arise, but response tracking will be limited
        })
            .then(() => {
                // Success state
                formMessage.classList.remove('hidden');
                contactForm.reset();
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                // Even if it fails, maybe show success to user if you use mode: 'no-cors'
                // formMessage.textContent = "Offline? Try reaching out on LinkedIn instead.";
            })
            .finally(() => {
                // Reset UI
                btnText.textContent = "Send Transmission";
                btnIcon.classList.remove('hidden');
                btnLoader.classList.add('hidden');
                submitBtn.disabled = false;

                setTimeout(() => {
                    formMessage.classList.add('hidden');
                }, 5000);
            });
    });
});
