/* ============================================
   SNOW VIEW — main.js
   Snow canvas + navbar + scroll animations
   ============================================ */

/* === NAVBAR MOBILE TOGGLE === */
function initNavbar() {
  const toggle = document.querySelector('.nav-mobile-toggle');
  const links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  // Close on link click
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  // Active link
  const path = location.pathname.split('/').pop() || 'index.html';
  links.querySelectorAll('a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}

/* === SNOW CANVAS (hero only) === */
function initSnow() {
  const canvas = document.getElementById('snow-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x    = Math.random() * W;
      this.y    = initial ? Math.random() * H : -8;
      this.r    = Math.random() * 2 + 0.5;
      this.vy   = Math.random() * 0.6 + 0.2;
      this.vx   = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.y += this.vy;
      this.x += this.vx;
      if (this.y > H + 8) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 176, 255, ${this.alpha})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: 120 }, () => new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  init();
  loop();
}

/* === SCROLL FADE-IN === */
function initFadeUp() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}

/* === VALIDATION HELPERS === */

/* Inject error styles once */
const validationStyle = document.createElement('style');
validationStyle.textContent = `
  .field-error {
    border-color: #ff4d6d !important;
    box-shadow: 0 0 0 3px rgba(255,77,109,0.15) !important;
  }
  .error-msg {
    display: block;
    color: #ff4d6d;
    font-size: 0.78rem;
    margin-top: 4px;
    font-weight: 500;
  }
  .field-ok {
    border-color: #00c9a7 !important;
    box-shadow: 0 0 0 3px rgba(0,201,167,0.12) !important;
  }
`;
document.head.appendChild(validationStyle);

function showError(input, message) {
  input.classList.add('field-error');
  input.classList.remove('field-ok');
  let msg = input.parentElement.querySelector('.error-msg');
  if (!msg) {
    msg = document.createElement('span');
    msg.className = 'error-msg';
    input.parentElement.appendChild(msg);
  }
  msg.textContent = message;
}

function clearError(input) {
  input.classList.remove('field-error');
  input.classList.add('field-ok');
  const msg = input.parentElement.querySelector('.error-msg');
  if (msg) msg.textContent = '';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username) {
  return /^@?[a-zA-Z0-9_]{3,}$/.test(username);
}

function validateField(input) {
  const val = input.value.trim();
  const id  = input.id || input.name || '';

  if (input.hasAttribute('required') && val === '') {
    showError(input, 'Ce champ est obligatoire.');
    return false;
  }
  if ((id === 'email' || input.type === 'email') && val !== '') {
    if (!isValidEmail(val)) {
      showError(input, 'Adresse email invalide (ex: nom@example.com).');
      return false;
    }
  }
  if (id === 'username' && val !== '') {
    if (!isValidUsername(val)) {
      showError(input, 'Pseudo invalide — min. 3 caractères, lettres, chiffres ou _');
      return false;
    }
  }
  if (id === 'password' && val !== '') {
    if (val.length < 8) {
      showError(input, 'Le mot de passe doit contenir au moins 8 caractères.');
      return false;
    }
  }
  if (input.tagName === 'SELECT' && input.hasAttribute('required') && val === '') {
    showError(input, 'Veuillez choisir une option.');
    return false;
  }
  clearError(input);
  return true;
}

/* === FORM HANDLERS === */
function initForms() {

  /* Live validation on blur */
  document.querySelectorAll('input[required], select[required], textarea[required], input[id="username"], input[id="password"], input[type="email"]').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('field-error')) validateField(input);
    });
  });

  /* ---- SIGNUP FORM ---- */
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const fields = this.querySelectorAll('input[required], select[required], input[id="username"], input[id="password"]');
      let valid = true;
      fields.forEach(f => { if (!validateField(f)) valid = false; });

      if (!valid) {
        /* Shake the button to signal error */
        const btn = this.querySelector('.form-submit');
        btn.style.animation = 'none';
        btn.textContent = '⚠ Corrige les erreurs ci-dessus';
        btn.style.background = '#ff4d6d';
        setTimeout(() => {
          btn.textContent = 'Créer mon compte gratuit →';
          btn.style.background = '';
        }, 2000);
        /* Scroll to first error */
        const firstError = this.querySelector('.field-error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const btn = this.querySelector('.form-submit');
      btn.textContent = 'Inscription en cours…';
      btn.disabled = true;
      setTimeout(() => {
        document.getElementById('signup-form-inner').style.display = 'none';
        document.getElementById('signup-success').style.display = 'block';
      }, 1200);
    });
  }

  /* ---- CONTACT FORM ---- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const fields = this.querySelectorAll('input[required], select[required], textarea[required]');
      let valid = true;
      fields.forEach(f => { if (!validateField(f)) valid = false; });

      if (!valid) {
        const btn = this.querySelector('.form-submit');
        btn.textContent = '⚠ Corrige les erreurs ci-dessus';
        btn.style.background = '#ff4d6d';
        setTimeout(() => {
          btn.textContent = 'Envoyer le message →';
          btn.style.background = '';
        }, 2000);
        const firstError = this.querySelector('.field-error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const btn = this.querySelector('.form-submit');
      btn.textContent = 'Envoi en cours…';
      btn.disabled = true;
      setTimeout(() => {
        document.getElementById('contact-form-inner').style.display = 'none';
        document.getElementById('contact-success').style.display = 'block';
      }, 1200);
    });
  }
}

/* === COUNTER ANIMATION (stats) === */
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const dur    = 1800;
      const step   = 16;
      let current  = 0;
      const inc = target / (dur / step);
      const timer = setInterval(() => {
        current += inc;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current).toLocaleString() + suffix;
      }, step);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => io.observe(c));
}

/* === INIT === */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSnow();
  initFadeUp();
  initForms();
  animateCounters();
});
