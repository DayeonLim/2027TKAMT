/* ─── NAV SCROLL ───────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* ─── MOBILE NAV ───────────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('nav-mobile');
hamburger.addEventListener('click', () => mobileNav.classList.toggle('open'));
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

/* ─── FAQ ACCORDION ────────────────────────────────────────────── */
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-question').addEventListener('click', () => {
    const open = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
    if (!open) item.classList.add('open');
  });
});

/* ─── ARCHIVE ACCORDION ────────────────────────────────────────── */
document.querySelectorAll('.archive-item').forEach(item => {
  item.querySelector('.archive-header').addEventListener('click', () => {
    const open = item.classList.contains('open');
    document.querySelectorAll('.archive-item.open').forEach(o => o.classList.remove('open'));
    if (!open) item.classList.add('open');
  });
});
const firstArchive = document.querySelector('.archive-item');
if (firstArchive) firstArchive.classList.add('open');

/* ─── STAT COUNTER ANIMATION ───────────────────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  if (isNaN(target)) return;
  const duration = 1400, step = 16;
  let current = 0;
  const inc = target / (duration / step);
  const t = setInterval(() => {
    current += inc;
    if (current >= target) { el.textContent = target.toLocaleString(); clearInterval(t); }
    else el.textContent = Math.floor(current).toLocaleString();
  }, step);
}
const statObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); statObserver.unobserve(e.target); } });
}, { threshold: 0.4 });
document.querySelectorAll('.stat-number[data-target]').forEach(n => statObserver.observe(n));

/* ─── SCROLL FADE-IN ───────────────────────────────────────────── */
const fadeEls = document.querySelectorAll(
  '.stat-card, .event-card, .about-text, .about-image-wrap, .winner-card, .archive-item, .faq-item, .register-benefits, .form-card'
);
fadeEls.forEach(el => el.classList.add('fade-up'));
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 55);
      fadeObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
fadeEls.forEach(el => fadeObserver.observe(el));

/* ─── GALLERY LIGHTBOX ─────────────────────────────────────────── */
const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
lightbox.innerHTML = '<span id="lightbox-close">✕</span><img id="lightbox-img" src="" alt="Gallery photo"/>';
document.body.appendChild(lightbox);
const lbImg = document.getElementById('lightbox-img');
document.getElementById('gallery-grid').addEventListener('click', e => {
  const img = e.target.closest('img');
  if (!img) return;
  lbImg.src = img.src; lbImg.alt = img.alt;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (typeof gtag === 'function') gtag('event', 'view_photo', { photo_src: img.src });
});
document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
function closeLightbox() { lightbox.classList.remove('open'); document.body.style.overflow = ''; }

/* ─── GALLERY LOAD MORE ────────────────────────────────────────── */
document.getElementById('gallery-load-more').addEventListener('click', function () {
  this.textContent = 'All photos loaded'; this.disabled = true; this.style.opacity = '.5';
});

/* ─── SMOOTH SCROLL ────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return; e.preventDefault();
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
  });
});

/* ─── INTEREST FORM ────────────────────────────────────────────── */
/*
  HOW TO WIRE UP THE BACKEND (Google Sheets via Apps Script):
  1. Open sheets.google.com → create a new sheet named "TKAMT Signups"
     Columns: Timestamp | Name | Email | School | Role | Teams | Heard From
  2. Extensions → Apps Script → paste the code from apps-script.js (included below)
  3. Deploy → New Deployment → Web App
     - Execute as: Me
     - Who has access: Anyone
  4. Copy the web app URL and replace APPS_SCRIPT_URL below
  5. That's it — every submission appends a row to your sheet.
*/
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';

const form       = document.getElementById('interest-form');
const formStep   = document.getElementById('form-step');
const successStep = document.getElementById('success-step');
const submitBtn  = document.getElementById('form-submit');
const btnText    = document.getElementById('btn-text');
const btnSpinner = document.getElementById('btn-spinner');
const globalErr  = document.getElementById('form-error-global');

function validate() {
  let ok = true;
  [['field-name','err-name','Name is required'],
   ['field-email','err-email','Valid email required'],
   ['field-school','err-school','School name is required'],
   ['field-role','err-role','Please select your role']].forEach(([id, errId, msg]) => {
    const el = document.getElementById(id);
    const err = document.getElementById(errId);
    const val = el.value.trim();
    const invalid = !val || (id === 'field-email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
    el.classList.toggle('invalid', invalid);
    err.textContent = invalid ? msg : '';
    if (invalid) ok = false;
  });
  return ok;
}

// Clear invalid state on input
['field-name','field-email','field-school','field-role'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    document.getElementById(id).classList.remove('invalid');
  });
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!validate()) return;

  // Loading state
  submitBtn.disabled = true;
  btnText.textContent = 'Submitting…';
  btnSpinner.classList.remove('hidden');
  globalErr.classList.add('hidden');

  const data = {
    name:   document.getElementById('field-name').value.trim(),
    email:  document.getElementById('field-email').value.trim(),
    school: document.getElementById('field-school').value.trim(),
    role:   document.getElementById('field-role').value,
    teams:  document.getElementById('field-teams').value || 'Not sure yet',
    hear:   document.getElementById('field-hear').value || 'Not specified',
    timestamp: new Date().toISOString()
  };

  try {
    if (APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
      // Dev mode: log to console until real URL is set
      console.log('Form submission (no backend configured):', data);
      await new Promise(r => setTimeout(r, 600));
    } else {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',   // Apps Script requires no-cors
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }

    // Analytics event
    if (typeof gtag === 'function') {
      gtag('event', 'sign_up', { school: data.school, role: data.role });
    }

    // Show success
    document.getElementById('success-name').textContent  = data.name.split(' ')[0];
    document.getElementById('success-email').textContent = data.email;
    formStep.classList.remove('active');
    successStep.classList.add('active');

    // Bump school counter
    const countEl = document.getElementById('signupCount');
    if (countEl && countEl.textContent !== '—') {
      countEl.textContent = parseInt(countEl.textContent, 10) + 1;
    }

  } catch {
    globalErr.classList.remove('hidden');
    submitBtn.disabled = false;
    btnText.textContent = 'Count Me In';
    btnSpinner.classList.add('hidden');
  }
});

/* ─── GOOGLE ANALYTICS: track section views ────────────────────── */
if (typeof gtag === 'function') {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) gtag('event', 'section_view', { section_id: e.target.id });
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));
}
