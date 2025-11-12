

// Main JavaScript file for Bhairav Dynamics Website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeNavigation();
    initializeAnimations();
    initializeHeroLogo();
    initializeForms();
    initializeModal();
    initializeScrollAnimations();
});

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMobile = document.getElementById('navMobile');
    
    if (hamburger && navMobile) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMobile.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on links
        const mobileLinks = navMobile.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMobile.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navMobile.contains(event.target)) {
                hamburger.classList.remove('active');
                navMobile.classList.remove('active');
            }
        });
    }
}

// Hero logo rotation functionality
function initializeHeroLogo() {
    const heroLogo = document.getElementById('heroLogo');
    
    if (heroLogo) {
        heroLogo.addEventListener('click', function() {
            this.style.animation = 'rotate 2s linear';
            setTimeout(() => {
                this.style.animation = 'rotate 10s linear infinite';
            }, 2000);
        });
        
        // Mouse rotation effect
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
            setTimeout(() => {
                this.style.transition = '';
            }, 500);
        });
    }
}

// Scroll animations
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animated-text');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Animation effects
function initializeAnimations() {
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add loading animation
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });
}

// Modal functionality
function initializeModal() {
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');

  // Make openModal and closeModal global
  window.openModal = function(imageSrc) {
    if (modal && modalImage) {
      modal.style.display = 'block';
      modalImage.src = imageSrc.replace(/\\/g, '/'); // ensure forward slashes
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeModal = function() {
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  };

  // Close modal when clicking outside the image
  if (modal) {
    modal.addEventListener('click', function(event) {
      if (event.target === modal) {
        closeModal();
      }
    });
  }
}


// ✅ Initialize after DOM is ready
window.addEventListener('DOMContentLoaded', initializeModal);{


    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
}

// Form handling
function initializeForms() {
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Opportunity forms
    const jobForm = document.getElementById('jobForm');
    const vendorForm = document.getElementById('vendorForm');
    const fundingForm = document.getElementById('fundingForm');
    
    if (jobForm) jobForm.addEventListener('submit', handleJobForm);
    if (vendorForm) vendorForm.addEventListener('submit', handleVendorForm);
    if (fundingForm) fundingForm.addEventListener('submit', handleFundingForm);
}

// Contact form handler
async function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('https://bhairavdynamics-in.onrender.com/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showThankYouModal();
            event.target.reset();
        } else {
            throw new Error('Failed to submit form');
        }
    } catch (error) {
        console.error('Error submitting contact form:', error);
        // Show thank you modal anyway for demo purposes
        showThankYouModal();
        event.target.reset();
    }
}

// Opportunity form navigation

// -------------------------------
// 🧩 OPPORTUNITY FORM SCRIPT
// -------------------------------

document.addEventListener("DOMContentLoaded", function() {
  console.log("Script loaded and running!");

  // Select all forms and elements
  const initialForm = document.getElementById("initialForm");
  const nextBtn = document.getElementById("nextBtn");
  const opportunityType = document.getElementById("opportunityType");

  const internshipForm = document.getElementById("internshipForm");
  const partnershipForm = document.getElementById("partnershipForm");
  const investmentForm = document.getElementById("investmentForm");

  const thankYouModal = document.getElementById("thankYouModal");

  // ✅ Function: validate main form
  function validateInitialForm() {
    const inputs = initialForm.querySelectorAll("input[required], select[required], textarea[required]");
    for (let input of inputs) {
      if (!input.value.trim()) {
        input.focus();
        return false;
      }
    }
    return true;
  }

  // ✅ Function: Show Thank You modal
  function showThankYouModal() {
    thankYouModal.style.display = "block";
  }

  // ✅ Function: Close modal
  window.closeThankYouModal = function() {
    thankYouModal.style.display = "none";
    location.reload(); // reload page after close
  };

  // ✅ "Next" Button Click
  nextBtn.addEventListener("click", function() {
    if (!validateInitialForm()) {
      alert("Please fill in all required fields!");
      return;
    }

    const selectedType = opportunityType.value;

    if (!selectedType) {
      alert("Please select an opportunity type.");
      return;
    }

    // Hide the initial form
    initialForm.classList.add("hidden");

    // Show the correct next form
    if (selectedType === "internship") {
      internshipForm.classList.remove("hidden");
    } else if (selectedType === "partnership") {
      partnershipForm.classList.remove("hidden");
    } else if (selectedType === "investment") {
      investmentForm.classList.remove("hidden");
    }
  });

  // ✅ Handle all 3 submissions
  function handleFormSubmission(form) {
    form.addEventListener("submit", function(event) {
      event.preventDefault(); // stop normal reload
      showThankYouModal();
    });
  }

  handleFormSubmission(document.getElementById("jobForm"));
  handleFormSubmission(document.getElementById("vendorForm"));
  handleFormSubmission(document.getElementById("fundingForm"));
});

// Thank you modal
function showThankYouModal() {
    const modal = document.getElementById('thankYouModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

window.closeThankYouModal = function() {
    const modal = document.getElementById('thankYouModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// Smooth scrolling for better UX
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Add loading states for forms
function setFormLoading(form, isLoading) {
    const submitBtn = form.querySelector('.submit-btn');
    if (submitBtn) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    }
}

// Form validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Add real-time form validation
document.addEventListener('input', function(event) {
    const target = event.target;
    
    if (target.type === 'email') {
        if (target.value && !validateEmail(target.value)) {
            target.style.borderColor = '#ff4444';
        } else {
            target.style.borderColor = '#ddd';
        }
    }
    
    if (target.type === 'tel') {
        if (target.value && !validatePhone(target.value)) {
            target.style.borderColor = '#ff4444';
        } else {
            target.style.borderColor = '#ddd';
        }
    }
});

// Add parallax effect to hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');
    
    if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add typing effect for hero tagline
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
window.addEventListener('load', function() {
    const heroTagline = document.querySelector('.hero-tagline');
    if (heroTagline) {
        const originalText = heroTagline.textContent;
        setTimeout(() => {
            typeWriter(heroTagline, originalText, 80);
        }, 1000);
    }
});

// Add fade-in animation for sections
function addFadeInAnimation() {
    const sections = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });
}

// Initialize fade-in animations
document.addEventListener('DOMContentLoaded', addFadeInAnimation);

// Add hover effects for interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effect to buttons
    const buttons = document.querySelectorAll('.submit-btn, .next-btn, .btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add hover effect to cards
    const cards = document.querySelectorAll('.about-section, .contact-info, .value-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        });
    });
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(function() {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');
    
    if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
}, 10);

window.addEventListener('scroll', debouncedScrollHandler); 
