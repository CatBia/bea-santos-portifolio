// Smooth scroll behavior
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

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            entry.target.classList.add('revealed');
        }
    });
}, observerOptions);

// Observe project cards with staggered animation
document.querySelectorAll('.project-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Observe principle cards with reveal animation
document.querySelectorAll('.principle-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateX(-30px)';
    card.style.transition = `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`;
    observer.observe(card);
});

// Reveal principle cards on scroll
const principleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.principle-card').forEach(card => {
    principleObserver.observe(card);
});

// Add parallax effect to background and reverse engineering section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const background = document.querySelector('.background-animation');
    const reSection = document.querySelector('.reverse-engineering-section');
    
    if (background) {
        background.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
    
    // Parallax effect for reverse engineering section
    if (reSection) {
        const rect = reSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const offset = (window.innerHeight - rect.top) * 0.1;
            reSection.style.transform = `translateY(${offset}px)`;
        }
    }
});

// Add hover effect to project cards
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Add typing effect to name (optional enhancement)
const nameElement = document.querySelector('.name');
if (nameElement) {
    const originalText = nameElement.textContent;
    // This is just a placeholder - you can add a typing effect if desired
}

// Add floating animation to principle icons
document.querySelectorAll('.principle-icon').forEach(icon => {
    icon.addEventListener('mouseenter', function() {
        this.style.animation = 'bounce 0.6s ease';
    });
    
    icon.addEventListener('animationend', function() {
        this.style.animation = '';
    });
});

// Add cursor trail effect on reverse engineering section (optional enhancement)
const reSection = document.querySelector('.reverse-engineering-section');
if (reSection) {
    reSection.addEventListener('mousemove', (e) => {
        const rect = reSection.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Create subtle glow effect
        reSection.style.background = `
            linear-gradient(135deg, #000000 0%, #1a1a1a 100%),
            radial-gradient(circle at ${x}px ${y}px, rgba(99, 102, 241, 0.1) 0%, transparent 50%)
        `;
    });
}

// Smooth reveal for reverse engineering section
const reObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('re-visible');
        }
    });
}, { threshold: 0.2 });

if (reSection) {
    reObserver.observe(reSection);
}

console.log('Portfolio loaded successfully! 🚀');
console.log('Reverse Engineering section initialized! 🔧');

