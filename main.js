document.addEventListener('DOMContentLoaded', function() {
    // ========== THEME TOGGLE ==========
    function setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;
        
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        let currentTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
        
        // Apply initial theme
        document.documentElement.classList.toggle('dark', currentTheme === 'dark');
        
        themeToggle.addEventListener('click', () => {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.classList.toggle('dark', currentTheme === 'dark');
            localStorage.setItem('theme', currentTheme);
            
            // Update ARIA label for accessibility
            themeToggle.setAttribute('aria-label', 
                currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        });
        
        // Set initial ARIA label
        themeToggle.setAttribute('aria-label', 
            currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
    
    // Initialize theme toggle
    setupThemeToggle();

    // ========== NAVBAR SCROLL EFFECT ==========
    const navbar = document.querySelector('nav');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
                navbar.classList.remove('bg-opacity-90');
            } else {
                navbar.classList.remove('scrolled');
                navbar.classList.add('bg-opacity-90');
            }
        });
    }

    // ========== MOBILE MENU TOGGLE ==========
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        const toggleMenu = () => {
            const isOpen = mobileMenu.classList.toggle('open');
            mobileMenuButton.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
            
            if (isOpen) {
                document.addEventListener('click', closeMenuOnOutsideClick);
                document.addEventListener('keydown', handleMenuKeyEvents);
            } else {
                document.removeEventListener('click', closeMenuOnOutsideClick);
                document.removeEventListener('keydown', handleMenuKeyEvents);
            }
        };

        const closeMenuOnOutsideClick = (e) => {
            if (!mobileMenu.contains(e.target) && e.target !== mobileMenuButton) {
                toggleMenu();
            }
        };

        const handleMenuKeyEvents = (e) => {
            if (e.key === 'Escape') {
                toggleMenu();
            }
        };

        mobileMenuButton.addEventListener('click', toggleMenu);

        // Close when clicking links
        document.querySelectorAll('.mobile-menu a').forEach(link => {
            link.addEventListener('click', toggleMenu);
        });
    }

    // ========== ACTIVITY FILTERING ==========
    const filterButtons = document.querySelectorAll('.filter-btn');
    const activityCards = document.querySelectorAll('.activity-card');
    
    if (filterButtons.length && activityCards.length) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.dataset.filter;
                
                // Add transition effect
                activityCards.forEach(activity => {
                    activity.style.opacity = '0';
                    activity.style.transition = 'opacity 0.3s ease';
                });

                setTimeout(() => {
                    filterButtons.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    activityCards.forEach(activity => {
                        const shouldShow = filter === 'all' || 
                                        activity.dataset.category.split(' ').includes(filter);
                        activity.style.display = shouldShow ? 'block' : 'none';
                        if (shouldShow) {
                            setTimeout(() => {
                                activity.style.opacity = '1';
                            }, 50);
                        }
                    });
                }, 50);
            });
        });
    }

    // ========== SMOOTH SCROLLING ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('nav')?.offsetHeight || 100;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                
                window.scrollTo({
                    top: targetPosition - headerHeight,
                    behavior: 'smooth'
                });

                // Update URL without page jump
                history.pushState(null, null, targetId);

                // Close mobile menu if open
                if (mobileMenu && mobileMenu.classList.contains('open')) {
                    mobileMenu.classList.remove('open');
                    if (mobileMenuButton) {
                        mobileMenuButton.setAttribute('aria-expanded', 'false');
                        document.body.style.overflow = '';
                    }
                }
            }
        });
    });

    // ========== BACK TO TOP BUTTON ==========
    const backToTopButton = document.createElement('button');
    backToTopButton.className = 'back-to-top';
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopButton.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTopButton);

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ========== ANIMATION ON SCROLL ==========
    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeIn');
                animateOnScroll.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    });

    // Observe all cards that should animate
    document.querySelectorAll('.featured-card, .activity-card, .testimonial-card, .stat-card').forEach(card => {
        animateOnScroll.observe(card);
    });

    // ========== STAT CARD HOVER EFFECTS ==========
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('hover-effect');
        });
        card.addEventListener('mouseleave', () => {
            card.classList.remove('hover-effect');
        });
    });

    // ========== LAZY LOAD IMAGES ==========
    const lazyLoadImages = () => {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        if ('loading' in HTMLImageElement.prototype) {
            lazyImages.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.onerror = () => {
                        img.src = 'images/fallback.jpg';
                        img.alt = 'Image not available';
                    };
                }
            });
        } else {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.onerror = () => {
                                img.src = 'images/fallback.jpg';
                                img.alt = 'Image not available';
                            };
                            observer.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '200px 0px'
            });

            lazyImages.forEach(img => observer.observe(img));
        }
    };

    lazyLoadImages();

    // ========== BUTTON EFFECTS ==========
    document.querySelectorAll('button').forEach(button => {
        const addActive = () => button.classList.add('active-state');
        const removeActive = () => button.classList.remove('active-state');
        
        button.addEventListener('mousedown', addActive);
        button.addEventListener('mouseup', removeActive);
        button.addEventListener('mouseleave', removeActive);
        
        // For touch devices
        button.addEventListener('touchstart', addActive, {passive: true});
        button.addEventListener('touchend', removeActive);
        button.addEventListener('touchcancel', removeActive);
    });

    // ========== FAQ TOGGLE FUNCTIONALITY ==========
    document.querySelectorAll('.faq-toggle').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const icon = button.querySelector('i');
            const isExpanded = button.getAttribute('aria-expanded') === 'true';

            if (content && icon) {
                content.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
                button.setAttribute('aria-expanded', !isExpanded);
            }
        });
    });

    // ========== CLEANUP ==========
    window.addEventListener('beforeunload', () => {
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.removeEventListener('click', toggleMenu);
            document.removeEventListener('click', closeMenuOnOutsideClick);
            document.removeEventListener('keydown', handleMenuKeyEvents);
        }
        
        if (animateOnScroll) animateOnScroll.disconnect();
    });
});