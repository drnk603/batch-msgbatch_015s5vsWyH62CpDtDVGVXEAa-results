(function() {
  'use strict';

  const App = {
    init() {
      if (this._initialized) return;
      this._initialized = true;

      this.initBurgerMenu();
      this.initSmoothScroll();
      this.initScrollSpy();
      this.initForms();
      this.initScrollToTop();
      this.initImageFallback();
      this.initCountUp();
      this.initRippleEffect();
    },

    initBurgerMenu() {
      const toggle = document.querySelector('.navbar-toggler, .c-nav__toggle');
      const nav = document.querySelector('.navbar-collapse, .c-nav');
      const body = document.body;

      if (!toggle || !nav) return;

      let isOpen = false;

      const open = () => {
        isOpen = true;
        nav.classList.add('show');
        toggle.setAttribute('aria-expanded', 'true');
        body.classList.add('u-no-scroll');
      };

      const close = () => {
        isOpen = false;
        nav.classList.remove('show');
        toggle.setAttribute('aria-expanded', 'false');
        body.classList.remove('u-no-scroll');
      };

      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        isOpen ? close() : open();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) close();
      });

      document.addEventListener('click', (e) => {
        if (isOpen && !nav.contains(e.target) && !toggle.contains(e.target)) {
          close();
        }
      });

      const links = nav.querySelectorAll('a');
      links.forEach(link => {
        link.addEventListener('click', () => {
          if (isOpen) close();
        });
      });

      window.addEventListener('resize', this.debounce(() => {
        if (window.innerWidth >= 1024 && isOpen) close();
      }, 150));
    },

    initSmoothScroll() {
      document.addEventListener('click', (e) => {
        let target = e.target;
        while (target && target.tagName !== 'A') {
          target = target.parentElement;
        }
        if (!target) return;

        const href = target.getAttribute('href');
        if (!href || href === '#' || href === '#!') return;

        const isHashLink = href.startsWith('#');
        const isHomeHashLink = href.startsWith('/#');

        if (isHashLink) {
          e.preventDefault();
          const id = href.substring(1);
          this.scrollToSection(id);
        } else if (isHomeHashLink) {
          const isHome = ['/', '/index.html'].includes(window.location.pathname) || 
                        window.location.pathname.endsWith('/');
          if (isHome) {
            e.preventDefault();
            const id = href.substring(2);
            this.scrollToSection(id);
          }
        }
      });
    },

    scrollToSection(id) {
      const section = document.getElementById(id);
      if (!section) return;

      const header = document.querySelector('.l-header, .navbar');
      const offset = header ? header.offsetHeight : 80;
      const top = section.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top: top,
        behavior: 'smooth'
      });
    },

    initScrollSpy() {
      const sections = document.querySelectorAll('[id]');
      const navLinks = document.querySelectorAll('.nav-link, .c-nav__link');

      if (sections.length === 0 || navLinks.length === 0) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              const href = link.getAttribute('href');
              if (href === `#${id}` || href === `/#${id}`) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
              } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
              }
            });
          }
        });
      }, {
        rootMargin: '-100px 0px -80% 0px'
      });

      sections.forEach(section => observer.observe(section));
    },

    initForms() {
      const forms = document.querySelectorAll('form');
      if (forms.length === 0) return;

      forms.forEach(form => {
        form.addEventListener('submit', (e) => {
          e.preventDefault();

          const isValid = this.validateForm(form);
          if (!isValid) return;

          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.disabled = true;
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Wird gesendet...';

            setTimeout(() => {
              submitBtn.disabled = false;
              submitBtn.textContent = originalText;
              window.location.href = 'thank_you.html';
            }, 1000);
          } else {
            window.location.href = 'thank_you.html';
          }
        });
      });
    },

    validateForm(form) {
      let isValid = true;
      const fields = form.querySelectorAll('input, textarea, select');

      fields.forEach(field => {
        const error = this.validateField(field);
        const errorEl = field.parentElement.querySelector('.c-form__error, .invalid-feedback') ||
                        this.createErrorElement();

        if (error) {
          isValid = false;
          field.classList.add('is-invalid');
          field.parentElement.classList.add('is-invalid');
          errorEl.textContent = error;
          if (!field.parentElement.contains(errorEl)) {
            field.parentElement.appendChild(errorEl);
          }
        } else {
          field.classList.remove('is-invalid');
          field.parentElement.classList.remove('is-invalid');
          if (errorEl.parentElement) {
            errorEl.remove();
          }
        }
      });

      return isValid;
    },

    validateField(field) {
      const value = field.value.trim();
      const type = field.type;
      const name = field.name || field.id;

      if (field.hasAttribute('required') && !value) {
        return 'Dieses Feld ist erforderlich';
      }

      if (!value) return null;

      if (type === 'email' || name === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
        }
      }

      if (type === 'tel' || name === 'phone') {
        const phoneRegex = /^[\+\d\s\(\)\-]{10,20}$/;
        if (!phoneRegex.test(value)) {
          return 'Bitte geben Sie eine gültige Telefonnummer ein';
        }
      }

      if (name === 'firstName' || name === 'lastName') {
        const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
        if (!nameRegex.test(value)) {
          return 'Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen)';
        }
      }

      if (field.tagName === 'TEXTAREA' || name === 'message') {
        if (value.length < 10) {
          return 'Die Nachricht muss mindestens 10 Zeichen enthalten';
        }
      }

      if (type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
        return 'Sie müssen diesem Punkt zustimmen';
      }

      return null;
    },

    createErrorElement() {
      const el = document.createElement('div');
      el.className = 'c-form__error invalid-feedback';
      return el;
    },

    initScrollToTop() {
      const scrollBtn = document.createElement('button');
      scrollBtn.className = 'scroll-to-top';
      scrollBtn.setAttribute('aria-label', 'Nach oben scrollen');
      scrollBtn.innerHTML = '↑';
      scrollBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--color-accent);
        color: white;
        border: none;
        cursor: pointer;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;
        z-index: 999;
        font-size: 24px;
      `;

      document.body.appendChild(scrollBtn);

      window.addEventListener('scroll', this.throttle(() => {
        if (window.pageYOffset > 300) {
          scrollBtn.style.opacity = '1';
          scrollBtn.style.pointerEvents = 'auto';
        } else {
          scrollBtn.style.opacity = '0';
          scrollBtn.style.pointerEvents = 'none';
        }
      }, 100));

      scrollBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    },

    initImageFallback() {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }

        img.addEventListener('error', function() {
          if (this.dataset._fallback) return;
          this.dataset._fallback = 'true';
          this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999" font-size="18"%3EBild nicht verfügbar%3C/text%3E%3C/svg%3E';
        });
      });
    },

    initCountUp() {
      const counters = document.querySelectorAll('[data-count]');
      if (counters.length === 0) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.dataset._counted) {
            entry.target.dataset._counted = 'true';
            const target = parseInt(entry.target.dataset.count);
            const duration = 2000;
            const start = 0;
            const increment = target / (duration / 16);
            let current = start;

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                entry.target.textContent = target;
                clearInterval(timer);
              } else {
                entry.target.textContent = Math.floor(current);
              }
            }, 16);
          }
        });
      }, { threshold: 0.5 });

      counters.forEach(counter => observer.observe(counter));
    },

    initRippleEffect() {
      const buttons = document.querySelectorAll('.c-button, .btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
          const ripple = document.createElement('span');
          const rect = this.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;

          ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            animation: ripple 0.6s ease-out;
          `;

          this.appendChild(ripple);
          setTimeout(() => ripple.remove(), 600);
        });
      });

      const style = document.createElement('style');
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    },

    debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    },

    throttle(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }
})();