/* ─── ANNOUNCE BAR ─────────────────────────────────────────────── */
document.getElementById('announce-close').addEventListener('click', () => {
  document.getElementById('announce-bar').classList.add('hidden');
});

/* ─── NAV SCROLL SHADOW ────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ─── MOBILE NAV ───────────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('nav-mobile');
hamburger.addEventListener('click', () => mobileNav.classList.toggle('open'));
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

/* ─── SMOOTH SCROLL ────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = document.getElementById('navbar').offsetHeight + 8;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});

/* ─── FAQ ACCORDION ────────────────────────────────────────────── */
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const open = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
    if (!open) item.classList.add('open');
  });
});

/* ─── ARCHIVE ACCORDION ────────────────────────────────────────── */
document.querySelectorAll('.archive-item').forEach(item => {
  item.querySelector('.archive-btn').addEventListener('click', () => {
    const open = item.classList.contains('open');
    document.querySelectorAll('.archive-item.open').forEach(o => o.classList.remove('open'));
    if (!open) item.classList.add('open');
  });
});

/* ─── STAT COUNTER ANIMATION ───────────────────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  if (isNaN(target)) return;
  const duration = 1200, step = 16;
  let current = 0;
  const inc = target / (duration / step);
  const t = setInterval(() => {
    current += inc;
    if (current >= target) { el.textContent = target.toLocaleString(); clearInterval(t); }
    else el.textContent = Math.floor(current).toLocaleString();
  }, step);
}
const statObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCounter(e.target); statObserver.unobserve(e.target); }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-number[data-target]').forEach(n => statObserver.observe(n));

/* ─── SCROLL FADE-IN ───────────────────────────────────────────── */
const fadeEls = document.querySelectorAll(
  '.stat-cell, .format-card, .about-text, .about-photo-wrap, ' +
  '.results-card, .archive-item, .faq-item, .register-sidebar, ' +
  '.form-card, .panelist-card, .chart-card, .jeopardy-banner'
);
fadeEls.forEach(el => el.classList.add('fade-up'));
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 45);
      fadeObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });
fadeEls.forEach(el => fadeObserver.observe(el));

/* ─── SCORE DISTRIBUTION CHARTS (2026) ─────────────────────────── */
/*
  Native SVG bar charts recreated from the official 2026 results,
  replacing the old scoredistribution.png image.
*/
function buildBarChart(mountId, opts) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  const { values, labels, yMax, yTicks, rotateLabels = false, labelEvery = 1 } = opts;
  const W = 640, H = 320;
  const padL = 34, padR = 12, padT = 16, padB = rotateLabels ? 54 : 34;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const n = values.length;
  const slot = plotW / n;
  const barW = slot * 0.72;

  const x = i => padL + i * slot + (slot - barW) / 2;
  const y = v => padT + plotH - (v / yMax) * plotH;

  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" preserveAspectRatio="xMidYMid meet">`;

  // horizontal grid lines + y-axis labels
  yTicks.forEach(t => {
    const yy = y(t);
    svg += `<line class="chart-grid-line" x1="${padL}" y1="${yy.toFixed(1)}" x2="${W - padR}" y2="${yy.toFixed(1)}"/>`;
    svg += `<text class="chart-axis-label" x="${padL - 6}" y="${(yy + 3.5).toFixed(1)}" text-anchor="end">${t}</text>`;
  });

  // bars
  values.forEach((v, i) => {
    if (v <= 0) return;
    const bh = (v / yMax) * plotH;
    svg += `<rect class="chart-bar" x="${x(i).toFixed(1)}" y="${y(v).toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="1.5"><title>${labels[i]}: ${v}</title></rect>`;
  });

  // baseline
  svg += `<line class="chart-baseline" x1="${padL}" y1="${(padT + plotH).toFixed(1)}" x2="${W - padR}" y2="${(padT + plotH).toFixed(1)}"/>`;

  // x-axis labels
  labels.forEach((lbl, i) => {
    if (i % labelEvery !== 0) return;
    const cx = padL + i * slot + slot / 2;
    const yy = padT + plotH + (rotateLabels ? 12 : 16);
    if (rotateLabels) {
      svg += `<text class="chart-axis-label" x="${cx.toFixed(1)}" y="${yy.toFixed(1)}" text-anchor="end" transform="rotate(-45 ${cx.toFixed(1)} ${yy.toFixed(1)})">${lbl}</text>`;
    } else {
      svg += `<text class="chart-axis-label" x="${cx.toFixed(1)}" y="${yy.toFixed(1)}" text-anchor="middle">${lbl}</text>`;
    }
  });

  svg += `</svg>`;
  mount.innerHTML = svg;
}

// Individual Round — scores 1..20, count of students at each score
buildBarChart('chart-individual', {
  values: [0, 0, 3, 6, 3, 12, 19, 23, 18, 24, 29, 22, 23, 16, 10, 10, 2, 1, 1, 0],
  labels: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20'],
  yMax: 30,
  yTicks: [0, 10, 20, 30]
});

// Guts Round — team totals bucketed in bins of 10 (0–170)
buildBarChart('chart-guts', {
  values: [3, 14, 9, 6, 6, 7, 4, 3, 2, 2, 0, 1, 2, 1, 0, 0, 1],
  labels: ['0','10','20','30','40','50','60','70','80','90','100','110','120','130','140','150','160'],
  yMax: 15,
  yTicks: [0, 5, 10, 15],
  rotateLabels: true
});

/* ─── GALLERY LIGHTBOX ─────────────────────────────────────────── */
const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
lightbox.innerHTML = '<button id="lightbox-close" aria-label="Close">✕</button><img id="lightbox-img" src="" alt="" />';
document.body.appendChild(lightbox);
const lbImg = document.getElementById('lightbox-img');

document.getElementById('gallery-grid').addEventListener('click', e => {
  const img = e.target.closest('img');
  if (!img) return;
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (typeof gtag === 'function') gtag('event', 'view_photo', { photo: img.alt });
});
document.getElementById('lightbox-close').addEventListener('click', closeLb);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
function closeLb() { lightbox.classList.remove('open'); document.body.style.overflow = ''; }

/* ─── INTEREST FORM ────────────────────────────────────────────── */
/*
  BACKEND SETUP (Google Sheets via Apps Script) — the previous
  deployment was deleted, so the form must be reconnected to a NEW sheet:
  1. Create a NEW Google Sheet (the form auto-creates a "2027TKAMT Signups" tab).
  2. Extensions → Apps Script → paste apps-script.gs → Deploy → New deployment
     → Web App (Execute as: Me, Access: Anyone) → copy the /exec URL.
  3. Paste that URL below, replacing YOUR_APPS_SCRIPT_URL_HERE.
  Until then, the guard below runs the form in dev mode (logs, no save).
*/
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwK9znbunplNgszr6GApNeu4NVFWEDm6_tBqX05E5097dwOhb119mAW7G9EYwkN0sk-Gg/exec';

const form        = document.getElementById('interest-form');
const formStep    = document.getElementById('form-step');
const successStep = document.getElementById('success-step');
const submitBtn   = document.getElementById('form-submit');
const btnText     = document.getElementById('btn-text');
const btnSpinner  = document.getElementById('btn-spinner');
const globalErr   = document.getElementById('form-error-global');

function validate() {
  let ok = true;
  [['field-name','err-name','Required'],
   ['field-email','err-email','Valid email required'],
   ['field-school','err-school','Required'],
   ['field-role','err-role','Please select a role']].forEach(([id, errId, msg]) => {
    const el  = document.getElementById(id);
    const err = document.getElementById(errId);
    const val = el.value.trim();
    const bad = !val || (id === 'field-email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
    el.classList.toggle('invalid', bad);
    err.textContent = bad ? msg : '';
    if (bad) ok = false;
  });
  return ok;
}
['field-name','field-email','field-school','field-role'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    document.getElementById(id).classList.remove('invalid');
  });
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!validate()) return;

  submitBtn.disabled = true;
  btnText.textContent = 'Submitting…';
  btnSpinner.classList.remove('hidden');
  globalErr.classList.add('hidden');

  const data = {
    name:      document.getElementById('field-name').value.trim(),
    email:     document.getElementById('field-email').value.trim(),
    school:    document.getElementById('field-school').value.trim(),
    role:      document.getElementById('field-role').value,
    teams:     document.getElementById('field-teams').value || 'Not sure',
    hear:      document.getElementById('field-hear').value || 'Not specified',
    timestamp: new Date().toISOString()
  };

  try {
    if (APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
      // Dev mode: simulate submission until backend is wired
      console.log('Form submission (backend not yet configured):', data);
      await new Promise(r => setTimeout(r, 700));
    } else {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }

    if (typeof gtag === 'function') gtag('event', 'sign_up', { school: data.school, role: data.role });

    document.getElementById('success-name').textContent  = data.name.split(' ')[0];
    document.getElementById('success-email').textContent = data.email;
    formStep.classList.remove('active');
    successStep.classList.add('active');

  } catch {
    globalErr.classList.remove('hidden');
    submitBtn.disabled = false;
    btnText.textContent = 'Count Me In';
    btnSpinner.classList.add('hidden');
  }
});

/* ─── GA: track section views ──────────────────────────────────── */
if (typeof gtag === 'function') {
  const secObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) gtag('event', 'section_view', { section_id: e.target.id });
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('section[id]').forEach(s => secObs.observe(s));
}
