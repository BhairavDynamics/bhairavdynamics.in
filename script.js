// =======================================================
// Main JavaScript file for Bhairav Dynamics Website
// (Opportunity forms removed — only contact form remains)
// =======================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeAnimations();
    initializeHeroLogo();
    initializeContactForm();
    initializeModal();
    initializeScrollAnimations();
    addFadeInAnimation();
    addHoverEffects();
});

// ---------------- Navigation ----------------
function initializeNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMobile = document.getElementById('navMobile');
    
    if (hamburger && navMobile) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMobile.classList.toggle('active');
        });
        
        navMobile.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMobile.classList.remove('active');
            });
        });

        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navMobile.contains(event.target)) {
                hamburger.classList.remove('active');
                navMobile.classList.remove('active');
            }
        });
    }
}

// ---------------- Hero Logo ----------------
function initializeHeroLogo() {
    const heroLogo = document.getElementById('heroLogo');
    
    if (heroLogo) {
        heroLogo.addEventListener('click', function() {
            this.style.animation = 'rotate 2s linear';
            setTimeout(() => {
                this.style.animation = 'rotate 10s linear infinite';
            }, 2000);
        });
        
        heroLogo.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;
            const angle = Math.atan2(mouseY, mouseX) * (180 / Math.PI);
            this.style.transform = `rotate(${angle}deg)`;
        });
        
        heroLogo.addEventListener('mouseleave', function() {
            this.style.transform = 'rotate(0deg)';
            this.style.transition = 'transform 0.5s ease';
            setTimeout(() => this.style.transition = '', 500);
        });
    }
}

// ---------------- Scroll Animations ----------------
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animated-text');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('animate');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    animatedElements.forEach(el => observer.observe(el));
}

// ---------------- Animations ----------------
function initializeAnimations() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
    window.addEventListener('load', () => document.body.classList.add('loaded'));
}

// ---------------- Modal ----------------
function initializeModal() {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');

    window.openModal = function(imageSrc) {
        if (modal && modalImage) {
            modal.style.display = 'block';
            modalImage.src = imageSrc.replace(/\\/g, '/');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeModal = function() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    if (modal) {
        modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });
}

// ---------------- Contact Form ----------------
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async event => {
        event.preventDefault();
        setFormLoading(contactForm, true);

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showThankYouModal();
                contactForm.reset();
            } else {
                alert('Failed to submit. Try again later.');
            }
        } catch (err) {
            console.error('Contact form error:', err);
            alert('Network error. Please try again.');
        } finally {
            setFormLoading(contactForm, false);
        }
    });
}

// ---------------- Thank You Modal ----------------
function showThankYouModal() {
    const modal = document.getElementById('thankYouModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        setTimeout(() => closeThankYouModal(), 3000); // auto close after 3 sec
    }
}

window.closeThankYouModal = function() {
    const modal = document.getElementById('thankYouModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// ---------------- Helpers ----------------
function setFormLoading(form, isLoading) {
    const submitBtn = form.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? 'Submitting...' : 'Submit';
    }
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''));
}

// ---------------- Fade-in Animation ----------------
function addFadeInAnimation() {
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });
}

// ---------------- Hover Effects ----------------
function addHoverEffects() {
    const buttons = document.querySelectorAll('.submit-btn, .next-btn, .btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px) scale(1.05)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0) scale(1)';
        });
    });

    const cards = document.querySelectorAll('.about-section, .contact-info, .value-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        });
    });
}

// ---------------- Typing Effect ----------------
window.addEventListener('load', function() {
    const heroTagline = document.querySelector('.hero-tagline');
    if (heroTagline) {
        const text = heroTagline.textContent;
        heroTagline.textContent = '';
        let i = 0;
        (function type() {
            if (i < text.length) {
                heroTagline.textContent += text.charAt(i);
                i++;
                setTimeout(type, 80);
            }
        })();
    }
});

// ---------------- Parallax ----------------
window.addEventListener('scroll', debounce(() => {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
}, 10));

function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
