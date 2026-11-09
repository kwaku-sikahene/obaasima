'use strict';

/* =========================================================
   ObaaSima — "a mature woman" in Asante Twi.
   A private, offline-first period & pregnancy companion (PWA).
   All data lives in this browser's localStorage; nothing is
   sent over the network.
   ========================================================= */

const KEY = 'obaasima-data-v1';
const LEGACY_KEY = 'lune-data-v1';

const FLOWS = [
  ['none', 'None', ''],
  ['spotting', 'Spotting', '·'],
  ['light', 'Light', '●'],
  ['medium', 'Medium', '●●'],
  ['heavy', 'Heavy', '●●●'],
];
const PERIOD_FLOWS = new Set(['light', 'medium', 'heavy']);
const FEELINGS = [['great', '😄', 'Great'], ['good', '🙂', 'Good'], ['okay', '😐', 'Okay'], ['low', '😕', 'Low'], ['sad', '😢', 'Sad']];
const SYMPTOMS = [
  ['Cramps', '🌀'], ['Headache', '🤕'], ['Breast tenderness', '💗'],
  ['Bloating', '🎈'], ['Mood swings', '🎭'], ['Fatigue', '😴'],
];
const INTIMACY = [['none', 'None', ''], ['protected', 'Protected', '🛡️'], ['unprotected', 'Unprotected', '💞']];
const CLOSENESS = [['Kissing', '💋'], ['Self-love', '🌹']];
const MORE_SYMPTOMS = [
  ['Backache', '🦴'], ['Acne', '✨'], ['Nausea', '🤢'], ['Cravings', '🍫'], ['Insomnia', '🌙'],
  ['Dizziness', '💫'], ['Anxious', '😟'], ['Irritable', '😤'], ['Digestive issues', '🫧'],
  ['Discharge', '💧'], ['High energy', '⚡'], ['High libido', '🔥'],
];

const LOTUS = `<svg class="lotus" viewBox="0 0 120 100" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M60 10C72 24 74 48 60 70C46 48 48 24 60 10Z"/><path d="M60 70C52 54 42 40 28 33C27 52 38 66 60 70Z"/>
  <path d="M60 70C68 54 78 40 92 33C93 52 82 66 60 70Z"/><path d="M58 72C42 72 22 64 10 50C16 68 34 78 58 72Z"/>
  <path d="M62 72C78 72 98 64 110 50C104 68 86 78 62 72Z"/><path d="M34 86Q60 94 86 86"/></svg>`;

const BLOOM = cls => `<svg class="bloom ${cls}" viewBox="0 0 200 220" aria-hidden="true">
  <defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f9bfd5"/><stop offset="1" stop-color="#c58ad9"/></linearGradient></defs>
  <path d="M40 220C60 180 90 140 108 100" stroke="#d3a0dc" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M70 170C40 160 28 132 34 112C58 120 72 142 70 170Z" fill="#e7bfe6" opacity=".7"/>
  <g transform="translate(110 92)">
    ${[0, 72, 144, 216, 288].map(a => `<path transform="rotate(${a})" d="M0 0C-24 -18 -30 -64 0 -86C30 -64 24 -18 0 0Z" fill="url(#pg)" opacity=".78"/><path transform="rotate(${a})" d="M0 -8L0 -66" stroke="#fff" stroke-opacity=".45" stroke-width="1.5"/>`).join('')}
    <circle r="10" fill="#f6d27f"/><circle r="5" fill="#eeb257"/>
  </g></svg>`;

const ICON = {
  drop: '<svg viewBox="0 0 24 30" aria-hidden="true"><path d="M12 2S3 13 3 19.5a9 9 0 0 0 18 0C21 13 12 2 12 2z" fill="currentColor"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/></svg>',
  dropLine: '<svg viewBox="0 0 24 24"><path d="M12 3s-6 7-6 11.5a6 6 0 0 0 12 0C18 10 12 3 12 3z"/></svg>',
  cal: '<svg viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="14.5" rx="3"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4M10 15l1.5 1.5L14.5 13"/></svg>',
  leaf: '<svg viewBox="0 0 24 24"><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14zM5 19l7-7"/></svg>',
  baby: '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="5"/><path d="M10 9h.01M14 9h.01M10.5 11.2c.8.6 2.2.6 3 0M7 20c1-2.5 3-3.5 5-3.5s4 1 5 3.5"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  history: '<svg viewBox="0 0 24 24"><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6L3.5 8.5M3.5 4v4.5H8M12 8v4l3 2"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/></svg>',
  sliders: '<svg viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  phone: '<svg viewBox="0 0 24 24"><rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M12 8v6M9.5 11.5 12 14l2.5-2.5"/></svg>',
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M5 20V13M10 20V9M15 20v-6M20 20V5"/></svg>',
  todayCal: '<svg viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="14.5" rx="3"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/><rect x="13" y="13" width="3.5" height="3.5" rx=".8" fill="currentColor" stroke="none"/></svg>',
};

const PHASE_MSG = {
  Menstrual: 'Be gentle with yourself today 🌸',
  Follicular: 'Your energy is rising ✨',
  Fertile: 'You’re in your fertile window ✨',
  Ovulation: 'Ovulation day — your peak fertility ✨',
  Luteal: 'Slow down and nourish yourself 🌙',
  Late: 'Your period is running a little late',
};

const TIPS = {
  Menstrual: [['🔥', 'Warmth helps — a hot water bottle on your lower belly can ease cramps.'],
    ['🥬', 'Iron-rich foods like kontomire, beans and leafy greens help replace what you lose.'],
    ['🚶🏾‍♀️', 'Gentle movement — a slow walk or stretching — can lift your mood.'],
    ['🛌🏾', 'Rest is productive. Give yourself permission to slow down.']],
  Follicular: [['⚡', 'Energy is rising — a lovely time for new plans and stronger workouts.'],
    ['🥭', 'Fresh fruit, eggs and fish help fuel your body as it rebuilds.'],
    ['💬', 'Many women feel more social and creative now. Say yes to something new.']],
  Fertile: [['🌸', 'Trying to conceive? This is your most fertile time.'],
    ['🛡️', 'Avoiding pregnancy? Use protection — predictions are estimates, not contraception.'],
    ['💧', 'Stay hydrated. Clear, stretchy discharge around now is completely normal.']],
  Luteal: [['🍠', 'Cravings are normal — reach for slow carbs like oats, yam or sweet potato.'],
    ['🥜', 'Magnesium-rich groundnuts, dark chocolate and greens may ease PMS.'],
    ['🌙', 'Prioritise sleep and wind down a little earlier.'],
    ['💗', 'Feelings may run deeper this week. Be kind to yourself.']],
  Late: [['🧘🏾‍♀️', 'Stress, travel, illness and poor sleep can all delay a period.'],
    ['🧪', 'If you could be pregnant, a home test is most accurate from the first day of a missed period.'],
    ['🩺', 'If your cycles are often irregular, a clinician can help you understand why.']],
  Pregnant: [['💊', 'Take folic acid and any supplements your midwife recommends, every day.'],
    ['🏥', 'Keep up with your antenatal (ANC) visits — they protect you and your baby.'],
    ['💧', 'Drink plenty of water and rest when your body asks.'],
    ['🚨', 'Bleeding, severe headache, blurred vision or swelling? Seek care right away.']],
};

const AFFIRMATIONS = [
  ['You’re doing amazing!', 'A healthy body is the foundation for your dreams.'],
  ['Obaa sima', 'A woman of grace, wisdom and strength — that’s you.'],
  ['Listen to your body', 'She has been speaking to you all along.'],
  ['Rest is sacred', 'Rest is not a reward. It is your right.'],
  ['Every cycle is a new beginning', 'Honour where you are today.'],
  ['You are enough', 'Exactly as you are, right now.'],
  ['Wo ho yɛ fɛ', 'You are beautiful — inside and out.'],
];

// Baby size by week, with a few Ghanaian favourites.
const FRUITS = {
  4: ['a poppy seed', '🌱'], 5: ['a sesame seed', '🌱'], 6: ['a lentil', '🫘'], 7: ['a blueberry', '🫐'],
  8: ['a raspberry', '🍇'], 9: ['a cherry', '🍒'], 10: ['a strawberry', '🍓'], 11: ['a lime', '🍋'],
  12: ['a lime', '🍋'], 13: ['a lemon', '🍋'], 14: ['a peach', '🍑'], 15: ['an apple', '🍎'],
  16: ['an avocado', '🥑'], 17: ['a pear', '🍐'], 18: ['a bell pepper', '🫑'], 19: ['a mango', '🥭'],
  20: ['a ripe plantain', '🍌'], 21: ['a carrot', '🥕'], 22: ['a pawpaw', '🍈'], 23: ['a grapefruit', '🍊'],
  24: ['an ear of corn', '🌽'], 25: ['a cauliflower', '🥦'], 26: ['a lettuce', '🥬'], 27: ['a cabbage', '🥬'],
  28: ['a garden egg', '🍆'], 29: ['a butternut squash', '🎃'], 30: ['a cucumber', '🥒'], 31: ['a coconut', '🥥'],
  32: ['a yam', '🍠'], 33: ['a pineapple', '🍍'], 34: ['a cantaloupe', '🍈'], 35: ['a honeydew melon', '🍈'],
  36: ['a big pawpaw', '🍈'], 37: ['a bunch of kontomire', '🥬'], 38: ['a leek', '🥬'], 39: ['a watermelon', '🍉'],
  40: ['a small pumpkin', '🎃'],
};

const DEFAULTS = {
  settings: {
    name: '', photo: null, cycleLength: 28, periodLength: 5, lutealLength: 14,
    reminders: false, onboarded: false, lastNotified: null, pregnancy: { on: false, lmp: null },
  },
  days: {},
};

/* ---------------- date helpers (local, DST-safe) ---------------- */
function pad(n) { return String(n).padStart(2, '0'); }
function toKey(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function fromKey(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function diff(a, b) {
  return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) -
    Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 864e5);
}
function today() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function fmt(d, opts = { day: 'numeric', month: 'short' }) { return d.toLocaleDateString(undefined, opts); }
function fmtLong(d) { return fmt(d, { weekday: 'short', day: 'numeric', month: 'short' }); }
function plural(n, w) { return `${n} ${w}${n === 1 ? '' : 's'}`; }
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function median(arr) { const a = [...arr].sort((x, y) => x - y); const m = a.length >> 1; return a.length % 2 ? a[m] : Math.round((a[m - 1] + a[m]) / 2); }
function dayOfYear(d) { return diff(new Date(d.getFullYear(), 0, 1), d); }

/* ---------------- storage ---------------- */
function load() {
  try {
    const raw = localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      const settings = { ...DEFAULTS.settings, ...(s.settings || {}) };
      settings.pregnancy = { ...DEFAULTS.settings.pregnancy, ...(settings.pregnancy || {}) };
      return { settings, days: s.days || {} };
    }
  } catch (e) { /* storage unavailable or corrupt: start fresh */ }
  return structuredClone(DEFAULTS);
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (e) { toast('Couldn’t save — storage is unavailable in this browser mode'); }
}

let state = load();
const ui = { tab: 'home', sub: null, month: startOfMonth(today()), edit: false, sheetDate: null, more: false, step: 0 };

function getDay(k) { return state.days[k] || {}; }
function setDay(k, patch) {
  const d = { ...getDay(k), ...patch };
  if (!d.flow || d.flow === 'none') delete d.flow;
  if (!d.feeling) delete d.feeling;
  if (!d.symptoms || !d.symptoms.length) delete d.symptoms;
  if (!d.moods || !d.moods.length) delete d.moods;
  if (!d.notes || !d.notes.trim()) delete d.notes;
  if (d.temp == null || Number.isNaN(d.temp)) delete d.temp;
  if (!d.intimacy || d.intimacy === 'none') delete d.intimacy;
  if (!d.closeness || !d.closeness.length) delete d.closeness;
  if (!d.medicine || !d.medicine.trim()) delete d.medicine;
  if (d.weight == null || Number.isNaN(d.weight)) delete d.weight;
  if (Object.keys(d).length) state.days[k] = d; else delete state.days[k];
  save();
}

/* ---------------- cycle model & predictions ---------------- */

// Group logged bleeding days into periods. Spotting alone never starts a period;
// one unlogged day inside a period is tolerated.
function periods() {
  const keys = Object.keys(state.days).filter(k => PERIOD_FLOWS.has(state.days[k].flow)).sort();
  const out = [];
  for (const k of keys) {
    const d = fromKey(k), last = out[out.length - 1];
    if (last && diff(last.end, d) <= 2) last.end = d;
    else out.push({ start: d, end: d });
  }
  return out.map(p => ({ ...p, length: diff(p.start, p.end) + 1 }));
}

function model() {
  const s = state.settings, t = today();
  const ps = periods();
  const last = ps[ps.length - 1] || null;

  const cycles = [];
  for (let i = 1; i < ps.length; i++) {
    const len = diff(ps[i - 1].start, ps[i].start);
    if (len >= 15 && len <= 60) cycles.push({ start: ps[i - 1].start, length: len, periodLength: ps[i - 1].length });
  }

  // Recency-weighted mean & spread of the last 6 cycles, blended with the
  // user's default until there are 3 cycles of history.
  const recent = cycles.slice(-6);
  let cycleLen = s.cycleLength, sd = null;
  if (recent.length) {
    let wsum = 0, mean = 0;
    recent.forEach((c, i) => { wsum += i + 1; mean += (i + 1) * c.length; });
    mean /= wsum;
    let v = 0;
    recent.forEach((c, i) => { v += (i + 1) * (c.length - mean) ** 2; });
    sd = Math.sqrt(v / wsum);
    const n = recent.length;
    cycleLen = n >= 3 ? mean : (mean * n + s.cycleLength * (3 - n)) / 3;
  }

  const ongoing = !!last && diff(last.end, t) <= 1 && diff(last.start, t) >= 0 && diff(last.start, t) < 12;
  const finished = ps.filter((p, i) => i < ps.length - 1 || !ongoing).slice(-6);
  const periodLen = finished.length ? finished.reduce((a, p) => a + p.length, 0) / finished.length : s.periodLength;

  const cl = Math.round(cycleLen);
  const pl = Math.max(1, Math.round(periodLen));
  const range = sd == null ? 3 : Math.min(7, Math.max(1, Math.round(sd + (recent.length < 3 ? 1 : 0))));
  const regular = recent.length >= 3 ? (Math.max(...recent.map(c => c.length)) - Math.min(...recent.map(c => c.length)) <= 7) : null;

  const out = { ps, last, cycles, cl, pl, sd, range, regular, ongoing, late: 0, preds: [], ovs: [],
    predSet: new Set(), fertSet: new Set(), ovuSet: new Set(), pregnant: !!s.pregnancy.on };
  if (out.pregnant) { out.phase = 'Pregnant'; return out; }
  if (!last) return out;

  const origNext = addDays(last.start, cl);
  let nextStart = origNext;
  if (!ongoing && diff(origNext, t) > 0) { out.late = diff(origNext, t); nextStart = t; }

  for (let i = 0; i < 12; i++) {
    const start = addDays(nextStart, cl * i);
    const ovulation = addDays(i === 0 ? origNext : start, -s.lutealLength);
    out.preds.push({ start, end: addDays(start, pl - 1), ovulation });
  }
  out.preds.forEach(p => { for (let d = 0; d < pl; d++) out.predSet.add(toKey(addDays(p.start, d))); });

  // Ovulation ≈ luteal-length days before the following period (actual or predicted).
  out.ovs = [...ps.slice(1).map(p => addDays(p.start, -s.lutealLength)), ...out.preds.map(p => p.ovulation)];
  out.ovs.forEach(o => {
    out.ovuSet.add(toKey(o));
    for (let d = -5; d <= 1; d++) out.fertSet.add(toKey(addDays(o, d)));
  });

  out.origNext = origNext;
  out.nextStart = nextStart;
  out.nextPeriod = ongoing ? out.preds[0].start : nextStart;
  out.curOv = addDays(origNext, -s.lutealLength);
  out.cycleDay = diff(last.start, t) + 1;
  out.upOv = out.ovs.find(o => diff(t, o) >= -1);

  const tk = toKey(t);
  if (ongoing) out.phase = 'Menstrual';
  else if (out.late) out.phase = 'Late';
  else if (out.ovuSet.has(tk)) out.phase = 'Ovulation';
  else if (out.fertSet.has(tk)) out.phase = 'Fertile';
  else if (t < out.curOv) out.phase = 'Follicular';
  else out.phase = 'Luteal';
  return out;
}

function pregnancy() {
  const p = state.settings.pregnancy;
  if (!p.on || !p.lmp) return null;
  const lmp = fromKey(p.lmp), t = today();
  const days = Math.max(0, diff(lmp, t));
  const week = Math.floor(days / 7), day = days % 7;
  const due = addDays(lmp, 280);
  const trimester = week < 13 ? 1 : week < 27 ? 2 : 3;
  const fruit = week >= 4 ? FRUITS[Math.min(40, week)] : null;
  return { lmp, week, day, due, trimester, fruit, daysLeft: diff(t, due), pct: Math.min(1, days / 280) };
}

/* ---------------- rendering ---------------- */
const $ = sel => document.querySelector(sel);

function render() {
  const view = $('#view');
  const onboarding = !state.settings.onboarded;
  document.body.classList.toggle('bare', onboarding);
  if (onboarding) { view.innerHTML = ui.step === 0 ? renderSplash() : renderOnboarding(); return; }
  const M = model();
  const views = { home: renderHome, calendar: renderCalendar, insights: renderInsights, profile: renderProfile };
  view.innerHTML = views[ui.tab](M);
  document.querySelectorAll('.tabbar [data-tab]').forEach(b => {
    const on = b.dataset.tab === ui.tab;
    b.classList.toggle('active', on);
    b.setAttribute('aria-current', on ? 'page' : 'false');
  });
}

function head(title, { back = false, right = '', center = false } = {}) {
  return `<header class="page-head ${center ? 'center' : ''}">
    ${back ? `<button class="icon-btn" data-action="back" aria-label="Back">${ICON.back}</button>` : ''}
    <h1>${title}</h1>${right || (back ? '<span style="width:42px"></span>' : '')}</header>`;
}

function renderSplash() {
  return `
  <section class="splash">
    <svg class="rings" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none" stroke="#fff">
      <circle cx="200" cy="250" r="120"/><circle cx="200" cy="250" r="180"/><circle cx="200" cy="250" r="250"/><circle cx="200" cy="250" r="330"/>
    </svg>
    ${LOTUS}
    <h1>ObaaSima</h1>
    <p class="tagline">Know your body.<br>Embrace your journey.</p>
    <p class="meaning"><i>Obaa sima</i> — in Asante Twi, a mature, graceful woman. Your private companion for every season of womanhood.</p>
    <div class="cta">
      <button class="btn light block" data-action="welcome-next">Get Started <span class="arr">→</span></button>
      <button class="btn clear block" data-action="import">Restore from a backup</button>
      <input type="file" id="importFile" accept="application/json,.json" hidden>
    </div>
  </section>`;
}

function renderOnboarding() {
  const tk = toKey(today());
  return `
  <section class="onboard">
    <button class="icon-btn" data-action="welcome-back" aria-label="Back">${ICON.back}</button>
    ${LOTUS}
    <h1>Akwaaba!</h1>
    <p>Welcome. Let’s get to know you — it only takes a minute, and it all stays on your phone.</p>
    <form id="onboardForm" class="card" style="margin-top:18px">
      <label class="field"><span>What should we call you?</span>
        <input type="text" name="name" placeholder="Your name" autocomplete="given-name" maxlength="30"></label>
      <label class="field"><span>When did your last period start?</span>
        <input type="date" name="start" max="${tk}">
        <small>Don’t remember? Leave it blank and log it later.</small></label>
      <label class="field"><span>How many days does it usually last?</span>
        <input type="number" name="plen" value="5" min="1" max="12" inputmode="numeric"></label>
      <label class="field"><span>How long is your cycle, usually?</span>
        <input type="number" name="clen" value="28" min="15" max="60" inputmode="numeric">
        <small>Not sure? 28 days is a fine place to start — ObaaSima learns as you go.</small></label>
      <button class="btn primary block" type="submit" style="margin-top:8px">Begin my journey <span class="arr">→</span></button>
    </form>
  </section>`;
}

function greeting() {
  const h = new Date().getHours();
  const g = h < 12 ? 'Maakye' : h < 17 ? 'Maaha' : 'Maadwo';
  const name = state.settings.name.trim();
  return name ? `${g}, ${esc(name)}` : g;
}

function ring(frac, inner) {
  const R = 76, C = 2 * Math.PI * R, f = Math.max(0.02, Math.min(1, frac));
  return `
  <div class="ring">
    <svg viewBox="0 0 180 180" aria-hidden="true">
      <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--lav)"/><stop offset="1" stop-color="var(--plum-2)"/></linearGradient></defs>
      <circle cx="90" cy="90" r="${R}" fill="none" stroke="var(--rose-soft)" stroke-width="12"/>
      <circle cx="90" cy="90" r="${R}" fill="none" stroke="url(#rg)" stroke-width="12" stroke-linecap="round"
        stroke-dasharray="${f * C} ${C}" transform="rotate(-90 90 90)"/>
    </svg>
    <div class="center">${inner}</div>
  </div>`;
}

function phaseLabel(M) {
  return { Menstrual: 'Period', Follicular: 'Follicular phase', Fertile: 'Fertile Window', Ovulation: 'Ovulation Day', Luteal: 'Luteal phase', Late: 'Period late' }[M.phase];
}

function quickActions(M) {
  const q = (action, icon, label) => `<button data-action="${action}"><span class="qi">${icon}</span>${label}</button>`;
  return `<div class="quick">
    ${q('log-period', ICON.dropLine, M.ongoing ? 'Log<br>Flow' : 'Log<br>Period')}
    ${q('log-today', ICON.heart, 'Track<br>Symptoms')}
    ${q('pregnancy', ICON.baby, M.pregnant ? 'My<br>Pregnancy' : 'Pregnancy<br>Mode')}
    ${q('tips', ICON.leaf, 'Wellness<br>Tips')}
  </div>`;
}

function affirmation() {
  const [title, body] = AFFIRMATIONS[dayOfYear(today()) % AFFIRMATIONS.length];
  return `<section class="card blush note-card"><div class="ico">💗</div><div><b class="serif" style="font-size:17px">${title}</b><span>${body}</span></div></section>`;
}

function todayLog(tk) {
  const d = getDay(tk), tags = [];
  if (d.feeling) { const f = FEELINGS.find(x => x[0] === d.feeling); tags.push(`<span class="tag">${f[1]} ${f[2]}</span>`); }
  if (d.flow) tags.push(`<span class="tag flow">${FLOWS.find(f => f[0] === d.flow)[1]} flow</span>`);
  (d.symptoms || []).forEach(x => tags.push(`<span class="tag">${esc(x)}</span>`));
  (d.moods || []).forEach(x => tags.push(`<span class="tag">${esc(x)}</span>`));
  if (d.temp != null) tags.push(`<span class="tag">🌡️ ${d.temp}°</span>`);
  if (d.intimacy) { const x = INTIMACY.find(i => i[0] === d.intimacy); tags.push(`<span class="tag">${x[2]} ${x[1]}</span>`); }
  (d.closeness || []).forEach(x => tags.push(`<span class="tag">${(CLOSENESS.find(c => c[0] === x) || [, '💗'])[1]} ${esc(x)}</span>`));
  if (d.medicine) tags.push(`<span class="tag">💊 ${esc(d.medicine)}</span>`);
  if (d.weight != null) tags.push(`<span class="tag">⚖️ ${d.weight} kg</span>`);
  if (d.notes) tags.push(`<span class="tag">📝 Note</span>`);
  return `
  <button class="card note-card" data-action="log-today" style="text-align:left;width:100%;font:inherit;color:inherit">
    <div class="ico">${tags.length ? '🌷' : '💭'}</div>
    <div style="flex:1;min-width:0"><b>${tags.length ? 'Today’s log' : 'Track your symptoms'}</b>
      ${tags.length ? `<div class="tags">${tags.join('')}</div>` : '<span>How are you feeling today?</span>'}</div>
    <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 5l7 7-7 7"/></svg>
  </button>`;
}

function timeline(M) {
  // 15 dots spanning the cycle: period, fertile window, ovulation, next period.
  const N = 15, total = M.cl, ovDay = diff(M.last.start, M.curOv) + 1;
  const dots = [];
  for (let i = 0; i < N; i++) {
    const day = 1 + Math.round(i * (total - 1) / (N - 1));
    let c = '';
    if (day <= M.pl || i === N - 1) c = 'p';
    else if (Math.abs(day - ovDay) <= 1) c = 'o';
    else if (day >= ovDay - 5 && day <= ovDay + 1) c = 'f';
    const nowIdx = Math.round((Math.min(M.cycleDay, total) - 1) / (total - 1) * (N - 1));
    if (i === nowIdx) c += ' now';
    dots.push(`<i class="dot ${c}"></i>`);
  }
  return `<div class="timeline"><div class="track">${dots.join('')}</div>
    <div class="labels"><span>Period</span><span>Fertile</span><span>Next period</span></div></div>`;
}

function renderHome(M) {
  const t = today(), tk = toKey(t);
  const hdr = msg => `<header class="page-head greet"><div style="flex:1"><h1>${greeting()}</h1><p>${msg}</p></div>
    <button class="icon-btn soft" data-action="tips" aria-label="Wellness tips">${ICON.heart}</button></header>`;

  if (M.pregnant) {
    const P = pregnancy();
    return `${hdr('Growing a little miracle 🤍')}
    <section class="card blush hero">
      ${BLOOM('hero-bloom')}
      <div class="hero-main">
        ${ring(P.pct, `<span class="drop">${ICON.baby.replace('<svg', '<svg fill="none" stroke="currentColor" stroke-width="1.8"')}</span><span class="lbl">Week</span><span class="num">${P.week}<small> +${P.day}d</small></span>`)}
        <div class="hero-meta"><b>Trimester ${P.trimester}</b><span>Due ${fmt(P.due, { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
        <button class="btn primary sm" data-action="pregnancy">My Journey <span class="arr">→</span></button>
      </div>
    </section>
    ${quickActions(M)}
    ${P.fruit ? `<section class="card note-card"><div class="ico" style="font-size:28px;background:var(--lav-soft)">${P.fruit[1]}</div><div><b>Baby’s development</b><span>Your baby is about the size of ${P.fruit[0]}.</span></div></section>` : ''}
    ${affirmation()}
    ${todayLog(tk)}`;
  }

  if (!M.last) {
    return `${hdr('Let’s begin your journey 🌸')}
    <section class="card blush hero">
      ${BLOOM('hero-bloom')}
      <div class="hero-main" style="justify-items:start;text-align:left;width:200px">
        <h2 class="serif" style="font-size:24px;font-weight:600;line-height:1.2">Log your last period</h2>
        <p class="muted small">ObaaSima will predict your next period and fertile window.</p>
        <button class="btn primary sm" data-action="log-period">My period started today</button>
        <button class="link" data-action="goto" data-tab="calendar">Log a past period →</button>
      </div>
    </section>
    ${quickActions(M)}
    ${affirmation()}
    ${todayLog(tk)}
    <p class="disclaimer">ObaaSima estimates cycles from your logs. It isn’t a medical device or contraception.</p>`;
  }

  let meta;
  if (M.ongoing) meta = `<b>Period · day ${M.cycleDay}</b><span>Next ~${fmtLong(M.nextPeriod)}</span>`;
  else if (M.late) meta = `<b>${plural(M.late, 'day')} late</b><span>Expected ${fmtLong(M.origNext)}</span>`;
  else {
    const n = diff(t, M.nextStart);
    meta = `<b>${phaseLabel(M)}</b><span>${n === 0 ? 'Period may start today' : `Period in ${plural(n, 'day')}`}</span>`;
  }

  return `${hdr(PHASE_MSG[M.phase])}
  <section class="card blush hero">
    ${BLOOM('hero-bloom')}
    <div class="hero-main">
      ${ring(Math.min(M.cycleDay, M.cl) / M.cl, `<span class="drop">${ICON.drop}</span><span class="lbl">Cycle Day</span><span class="num">${M.cycleDay}</span>`)}
      <div class="hero-meta">${meta}</div>
      <button class="btn primary sm" data-action="goto" data-tab="calendar">View Calendar <span class="arr">→</span></button>
    </div>
  </section>
  ${quickActions(M)}
  <div class="section-head"><h2>Your Cycle</h2><button class="link" data-action="goto" data-tab="insights">View details →</button></div>
  <section class="card">${timeline(M)}</section>
  ${affirmation()}
  ${todayLog(tk)}
  <p class="disclaimer">Predictions are estimates. ObaaSima isn’t a medical device or contraception.</p>`;
}

function renderCalendar(M) {
  const m = ui.month, y = m.getFullYear(), mo = m.getMonth();
  const daysIn = new Date(y, mo + 1, 0).getDate(), lead = (new Date(y, mo, 1).getDay() + 6) % 7;
  const t = today(), tk = toKey(t);
  const wd = [...Array(7)].map((_, i) => new Date(2023, 0, 2 + i).toLocaleDateString(undefined, { weekday: 'short' }));

  let cells = '';
  for (let i = 0; i < lead; i++) cells += '<div></div>';
  let loggedThisMonth = 0;
  const flowCount = {};
  for (let dn = 1; dn <= daysIn; dn++) {
    const date = new Date(y, mo, dn), k = toKey(date), day = state.days[k] || {}, cls = ['day'];
    const future = date > t;
    if (state.days[k]) loggedThisMonth++;
    if (PERIOD_FLOWS.has(day.flow)) { cls.push('period', 'f-' + day.flow); flowCount[day.flow] = (flowCount[day.flow] || 0) + 1; }
    else if (day.flow === 'spotting') cls.push('spot');
    else if (M.predSet.has(k) && date >= t) cls.push('pred');
    const ovu = M.ovuSet.has(k);
    if (ovu) cls.push('ovu'); else if (M.fertSet.has(k)) cls.push('fertile');
    if (k === tk) cls.push('today');
    if (future) cls.push('future');
    const hasLog = day.symptoms || day.moods || day.notes || day.feeling || day.temp != null ||
      day.intimacy || day.closeness || day.medicine || day.weight != null;
    const label = fmt(date, { weekday: 'long', day: 'numeric', month: 'long' });
    cells += `<button class="${cls.join(' ')}" data-action="day" data-date="${k}" ${ui.edit && future ? 'disabled' : ''} aria-label="${label}"><span>${dn}</span>${ovu ? '<b class="star">★</b>' : ''}${hasLog ? '<i class="dot"></i>' : ''}</button>`;
  }

  let expect = '';
  if (M.last && !M.pregnant) {
    let t1, v, d;
    if (M.ongoing) { t1 = 'You’re on your period'; v = `Day ${M.cycleDay}`; d = `Next expected ~${fmtLong(M.nextPeriod)}`; }
    else if (M.late) { t1 = 'Your period is late by'; v = plural(M.late, 'day'); d = `It was expected ${fmtLong(M.origNext)}`; }
    else {
      const n = diff(t, M.nextStart);
      t1 = 'Your period is expected in'; v = n === 0 ? 'Today' : plural(n, 'day');
      d = `${fmtLong(addDays(M.nextStart, -M.range))} – ${fmtLong(addDays(M.nextStart, M.range))}`;
    }
    expect = `<section class="card expect">
      <svg class="bigdrop" viewBox="0 0 24 30" aria-hidden="true"><defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7a3be"/><stop offset="1" stop-color="var(--rose)"/></linearGradient></defs><path d="M12 2S3 13 3 19.5a9 9 0 0 0 18 0C21 13 12 2 12 2z" fill="url(#dg)"/><ellipse cx="8.5" cy="19" rx="2" ry="3.2" fill="#fff" opacity=".45"/></svg>
      <div><div class="t">${t1}</div><div class="v">${v}</div><div class="d">${d}</div></div></section>`;
  }

  const topFlow = Object.entries(flowCount).sort((a, b) => b[1] - a[1])[0];
  const isThisMonth = y === t.getFullYear() && mo === t.getMonth();
  return `
  ${head('Calendar', { right: `<button class="icon-btn soft" data-action="this-month" aria-label="Go to today">${ICON.todayCal}</button>` })}
  <section class="card cal-card ${ui.edit ? 'editing' : ''}">
    <div class="cal-head">
      <h2>${m.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
      <button class="icon-btn" data-action="prev" aria-label="Previous month">${ICON.back}</button>
      <button class="icon-btn" data-action="next" aria-label="Next month">${ICON.next}</button>
    </div>
    ${ui.edit ? `<div class="edit-banner"><span>Tap days to mark or unmark your period.</span><button class="btn sm primary" data-action="edit">Done</button></div>` : ''}
    <div class="weekdays">${wd.map(w => `<div>${w}</div>`).join('')}</div>
    <div class="grid">${cells}</div>
    <div class="legend">
      <span><i class="lg-period"></i>Period</span>
      <span><i class="lg-pred"></i>Predicted</span>
      <span><i class="lg-fertile"></i>Fertile Window</span>
      <span><i class="lg-ovu">★</i>Ovulation</span>
    </div>
  </section>
  ${ui.edit ? '' : `<button class="btn block" data-action="edit">${ICON.dropLine.replace('<svg', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"')} Edit period days</button>`}
  ${isThisMonth ? expect : ''}
  <div class="section-head"><h2>${isThisMonth ? 'This Month' : m.toLocaleDateString(undefined, { month: 'long' })}</h2><button class="link" data-action="goto" data-tab="insights">View all →</button></div>
  <section class="card"><ul class="list">
    <li><span class="li-ico">🩸</span><div><b>Period length</b><span class="s">${plural(M.pl, 'day')} on average</span></div></li>
    <li><span class="li-ico">🌸</span><div><b>Cycle length</b><span class="s">${plural(M.cl, 'day')} on average</span></div></li>
    <li><span class="li-ico">⭐</span><div><b>Flow</b><span class="s">${topFlow ? `Mostly ${topFlow[0]}` : 'No flow logged'}</span></div></li>
    <li><span class="li-ico">📝</span><div><b>Days logged</b><span class="s">${plural(loggedThisMonth, 'day')}</span></div></li>
  </ul></section>`;
}

function patterns(M) {
  const map = {};
  for (const [k, d] of Object.entries(state.days)) {
    const items = [...(d.symptoms || []), ...(d.moods || [])];
    if (!items.length) continue;
    const date = fromKey(k);
    const p = [...M.ps].reverse().find(p => p.start <= date);
    const cd = p ? diff(p.start, date) + 1 : null;
    for (const it of items) {
      map[it] ||= { name: it, count: 0, days: [] };
      map[it].count++;
      if (cd && cd <= 60) map[it].days.push(cd);
    }
  }
  return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 8)
    .map(x => ({ ...x, med: x.days.length >= 2 ? median(x.days) : null }));
}
const EMOJI = Object.fromEntries([...SYMPTOMS, ...MORE_SYMPTOMS]);

function historyCard(M) {
  const hist = M.cycles.slice(-12);
  const current = M.last && !M.pregnant ? { start: M.last.start, length: M.cycleDay, periodLength: M.last.length, current: true } : null;
  const rows = [...hist, ...(current ? [current] : [])].reverse();
  if (!rows.length) return '<section class="card"><p class="muted small">No cycles logged yet.</p></section>';
  const maxLen = Math.max(M.cl, ...rows.map(r => r.length)) + 2;
  return `<section class="card"><div class="history">${rows.map(r => {
    const p = Math.min(r.periodLength, r.length);
    return `<div class="hrow"><div class="hlabel">${r.current ? 'Now' : fmt(r.start)}</div>
      <div class="hbar ${r.current ? 'current' : ''}"><span class="hp" style="width:${p / maxLen * 100}%"></span><span class="hr" style="width:${(r.length - p) / maxLen * 100}%"></span></div>
      <div class="hlen">${r.length}d</div></div>`;
  }).join('')}</div></section>`;
}

function patternsCard(M) {
  const pats = patterns(M);
  if (!pats.length) return '<section class="card"><p class="muted small">Log symptoms to discover when they tend to appear in your cycle.</p></section>';
  return `<section class="card"><ul class="list">${pats.map(p => `
    <li><span class="li-ico">${EMOJI[p.name] || '•'}</span><div><b>${esc(p.name)}</b><span class="s">${plural(p.count, 'time')}</span></div>
    <span class="end">${p.med ? `usually around<br>cycle day ${p.med}` : ''}</span></li>`).join('')}</ul></section>`;
}

function trendChart(M) {
  const vals = M.cycles.slice(-8).map(c => c.length);
  if (vals.length < 2) {
    return `<svg class="chart" viewBox="0 0 300 80" style="height:auto"><path d="M6 40 C 60 20, 100 60, 150 40 S 240 20, 294 40" stroke="rgba(255,255,255,.35)" stroke-width="2.5" fill="none" stroke-dasharray="4 6"/>
      <text x="150" y="74" fill="rgba(255,255,255,.7)" font-size="12" text-anchor="middle">Log 2+ cycles to see your trend</text></svg>`;
  }
  const lo = Math.min(...vals) - 2, hi = Math.max(...vals) + 2;
  const pts = vals.map((v, i) => [10 + i * (280 / (vals.length - 1)), 70 - (v - lo) / (hi - lo) * 60]);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], cx = (x0 + x1) / 2;
    d += ` C${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  return `<svg class="chart" viewBox="0 0 300 80" style="height:auto" role="img" aria-label="Cycle lengths: ${vals.join(', ')} days">
    <path d="${d}" stroke="#f3b6d0" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    ${pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="4.5" fill="#fff"/><text x="${x}" y="${y - 10}" fill="rgba(255,255,255,.75)" font-size="10" text-anchor="middle">${vals[i]}</text>`).join('')}
  </svg>`;
}

function renderInsights(M) {
  const t = today();
  let title, sub;
  if (M.pregnant) { title = 'Cycle tracking paused'; sub = 'Predictions are paused while you’re in pregnancy mode.'; }
  else if (M.regular === true) { title = 'Your cycle health is on track!'; sub = 'Your recent cycles are regular and healthy.'; }
  else if (M.regular === false) { title = 'Your cycle varies a little'; sub = 'Recent cycles differ by more than 7 days — common, but worth watching.'; }
  else { title = 'Getting to know you'; sub = `Log ${Math.max(1, 3 - M.cycles.length)} more cycle${3 - M.cycles.length === 1 ? '' : 's'} to see how regular you are.`; }

  const monthStart = startOfMonth(t);
  const symptomsThisMonth = Object.entries(state.days).filter(([k]) => fromKey(k) >= monthStart)
    .reduce((n, [, d]) => n + (d.symptoms || []).length + (d.moods || []).length, 0);

  const key = [];
  if (!M.pregnant && M.last) {
    const n = diff(t, M.nextPeriod);
    key.push(['🩸', 'Your next period', M.late ? `${plural(M.late, 'day')} late` : `in ${plural(Math.max(0, n), 'day')} (${fmtLong(M.nextPeriod)})`]);
    if (M.upOv) key.push(['🌿', 'Fertile window', `${fmt(addDays(M.upOv, -5))} – ${fmt(addDays(M.upOv, 1))} · ovulation ~${fmt(M.upOv)}`]);
  }
  key.push(['⭐', `You’ve logged ${plural(symptomsThisMonth, 'symptom')}`, 'this month']);
  if (M.sd != null) key.push(['📈', 'Cycle variation', `±${M.sd.toFixed(1)} days across recent cycles`]);

  return `
  ${head('Insights', { right: `<span class="icon-btn">${ICON.chart}</span>` })}
  <section class="card health">
    <div class="top"><span class="check">${ICON.check}</span><div><h2>${title}</h2><p>${sub}</p></div></div>
    ${trendChart(M)}
    <div class="nums"><div><b>${M.cl} days</b><span>Avg cycle length</span></div><div><b>${M.pl} days</b><span>Avg period</span></div></div>
  </section>
  <div class="section-head"><h2>Key Insights</h2></div>
  <section class="card"><ul class="list">${key.map(([i, b, s]) => `<li><span class="li-ico">${i}</span><div><b>${b}</b><span class="s">${s}</span></div></li>`).join('')}</ul></section>
  <div class="section-head"><h2>Cycle History</h2></div>
  ${historyCard(M)}
  <div class="section-head"><h2>Patterns</h2></div>
  ${patternsCard(M)}`;
}

/* ---------------- profile & sub-pages ---------------- */
function avatar(size) {
  const s = state.settings;
  const style = size ? `style="width:${size}px;height:${size}px"` : '';
  if (s.photo) return `<div class="avatar" ${style}><img src="${s.photo}" alt=""></div>`;
  const name = s.name.trim();
  return `<div class="avatar" ${style}>${name ? `<span class="initial">${esc(name[0].toUpperCase())}</span>` : LOTUS.replace('class="lotus"', 'style="width:56%"')}</div>`;
}

function renderProfile(M) {
  if (ui.sub) return SUB[ui.sub](M);
  const s = state.settings;
  const item = (sub, icon, label) => `<li><button data-action="sub" data-sub="${sub}">${icon}<span>${label}</span><svg class="chev" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></li>`;
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  return `
  ${head('Profile', { right: `<button class="icon-btn" data-action="sub" data-sub="cycle" aria-label="Cycle settings">${ICON.gear}</button>` })}
  <section class="profile-top">
    ${avatar()}
    <div><h2>${esc(s.name.trim() || 'Obaa sima')}</h2><p>🔒 Your data stays on this phone</p>
      <button class="btn primary sm" data-action="sub" data-sub="edit">Edit Profile <span class="arr">→</span></button></div>
  </section>
  <section class="card menu-card"><ul class="menu">
    ${item('history', ICON.history, 'My Cycle History')}
    ${item('pregnancy', ICON.baby, 'Pregnancy Journey')}
    ${item('reminders', ICON.bell, 'Reminders')}
    ${item('cycle', ICON.sliders, 'Cycle Settings')}
    ${item('data', ICON.shield, 'Privacy & Backup')}
    ${standalone ? '' : item('install', ICON.phone, 'Install on Your Phone')}
    ${item('about', ICON.info, 'About ObaaSima')}
  </ul></section>`;
}

const SUB = {
  edit() {
    const s = state.settings;
    return `${head('Edit Profile', { back: true, center: true })}
    <section class="card" style="display:grid;justify-items:center;gap:12px;text-align:center">
      ${avatar(110)}
      <div class="row" style="justify-content:center">
        <button class="btn sm" data-action="photo">${s.photo ? 'Change photo' : 'Add a photo'}</button>
        ${s.photo ? '<button class="btn sm ghost" data-action="remove-photo">Remove</button>' : ''}
      </div>
      <input type="file" id="photoFile" accept="image/*" hidden>
      <label class="field" style="width:100%;text-align:left"><span>Your name</span>
        <input type="text" data-setting="name" value="${esc(s.name)}" maxlength="30" placeholder="What should we call you?"></label>
      <p class="muted small">Your photo and name never leave this device.</p>
    </section>`;
  },
  history(M) {
    return `${head('My Cycle History', { back: true, center: true })}
    <div class="section-head"><h2>Cycles</h2></div>${historyCard(M)}
    <div class="section-head"><h2>Patterns</h2></div>${patternsCard(M)}`;
  },
  pregnancy(M) {
    const P = pregnancy();
    if (!P) {
      const dflt = M.last ? toKey(M.last.start) : '';
      return `${head('Pregnancy Journey', { back: true, center: true })}
      <section class="card blush" style="min-height:200px">
        ${BLOOM('corner')}
        <h2 style="font-size:26px">Expecting? 🤍</h2>
        <p class="muted" style="max-width:30ch">Switch to pregnancy mode to follow your baby’s growth week by week. Period predictions pause while it’s on.</p>
        <label class="field"><span>First day of your last period</span>
          <input type="date" id="lmp" value="${dflt}" max="${toKey(today())}">
          <small>We’ll use this to estimate your due date.</small></label>
        <button class="btn primary block" data-action="start-pregnancy">Start my pregnancy journey</button>
      </section>
      <p class="disclaimer">Not sure yet? A home test is most accurate from the first day of a missed period. Your midwife or doctor can confirm your due date by scan.</p>`;
    }
    const tip = TIPS.Pregnant;
    return `${head('Pregnancy Journey', { back: true, center: true })}
    <section class="card blush">
      ${BLOOM('corner')}
      <div class="preg-hero"><div><p class="muted small">You’re</p><h2>${P.week} weeks<br>+ ${plural(P.day, 'day')}</h2></div>
        ${P.fruit ? `<div class="fruit">${P.fruit[1]}</div>` : ''}</div>
      <div class="progress"><span style="width:${P.pct * 100}%"></span></div>
      <div class="tri"><span>1st</span><span>2nd</span><span>3rd trimester</span></div>
    </section>
    <section class="card"><ul class="list">
      <li><span class="li-ico">📅</span><div><b>Due date</b><span class="s">${fmt(P.due, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</span></div><span class="end">${P.daysLeft > 0 ? plural(P.daysLeft, 'day') + '<br>to go' : 'Any day now'}</span></li>
      <li><span class="li-ico">🌸</span><div><b>Trimester ${P.trimester}</b><span class="s">${['', 'Weeks 1–12', 'Weeks 13–26', 'Weeks 27–40'][P.trimester]}</span></div></li>
      ${P.fruit ? `<li><span class="li-ico">${P.fruit[1]}</span><div><b>Baby’s development</b><span class="s">About the size of ${P.fruit[0]}</span></div></li>` : ''}
    </ul></section>
    <div class="section-head"><h2>Caring for you</h2></div>
    <section class="card"><ul class="list">${tip.map(([i, x]) => `<li><span class="li-ico">${i}</span><span>${x}</span></li>`).join('')}</ul></section>
    <button class="btn danger block" data-action="end-pregnancy">End pregnancy mode</button>`;
  },
  reminders() {
    const s = state.settings;
    return `${head('Reminders', { back: true, center: true })}
    <section class="card">
      <label class="switch"><span>Remind me before my period</span><input type="checkbox" data-setting="reminders" ${s.reminders ? 'checked' : ''}></label>
      <p class="muted small" style="margin-top:10px">You’ll get a gentle heads-up 2 days before, when you open ObaaSima. Web apps can’t send background alerts without a server — and ObaaSima deliberately has none, so your data stays private.</p>
    </section>`;
  },
  cycle() {
    const s = state.settings;
    const num = (key, label, min, max, hint) => `
      <label class="field"><span>${label}</span>
        <input type="number" data-setting="${key}" value="${s[key]}" min="${min}" max="${max}" inputmode="numeric">
        ${hint ? `<small>${hint}</small>` : ''}</label>`;
    return `${head('Cycle Settings', { back: true, center: true })}
    <section class="card">
      <p class="muted small">Used until you’ve logged 3 cycles — after that, ObaaSima learns from your own history.</p>
      ${num('cycleLength', 'Typical cycle length (days)', 15, 60)}
      ${num('periodLength', 'Typical period length (days)', 1, 12)}
      ${num('lutealLength', 'Luteal phase (days)', 9, 18, 'Days from ovulation to your next period. 14 is typical.')}
    </section>`;
  },
  data() {
    return `${head('Privacy & Backup', { back: true, center: true })}
    <section class="card blush">
      <h2>Your body, your data 🔒</h2>
      <p class="small">Everything you log is stored only on this phone. ObaaSima has no account, no ads, no analytics and no cloud — nobody else can see it.</p>
    </section>
    <section class="card">
      <h2>Backup</h2>
      <p class="muted small">Save a backup file before changing phones or clearing your browser.</p>
      <div class="row" style="margin-top:12px">
        <button class="btn" data-action="export">Export backup</button>
        <button class="btn" data-action="import">Import backup</button>
      </div>
      <input type="file" id="importFile" accept="application/json,.json" hidden>
    </section>
    <button class="btn danger block" data-action="wipe">Delete all my data</button>`;
  },
  install() {
    return `${head('Install', { back: true, center: true })}
    <section class="card">
      <h2>Add ObaaSima to your home screen</h2>
      <p class="small"><b>iPhone:</b> open in Safari, tap <b>Share</b> → <b>Add to Home Screen</b>.</p>
      <p class="small"><b>Android:</b> open in Chrome, tap the <b>⋮</b> menu → <b>Install app</b>.</p>
      <p class="muted small">Once installed it opens like an app and works offline.</p>
      ${installPrompt ? '<button class="btn primary block" style="margin-top:14px" data-action="install">Install ObaaSima</button>' : ''}
    </section>`;
  },
  about() {
    return `${head('About', { back: true, center: true })}
    <section class="card blush" style="text-align:center;display:grid;justify-items:center;gap:10px;padding:28px 20px">
      <div style="width:64px;color:var(--plum-2)">${LOTUS}</div>
      <h2 style="font-size:28px;margin:0">ObaaSima</h2>
      <p class="muted"><i class="serif">Obaa sima</i> — in Asante Twi, a mature, graceful woman.</p>
      <p class="small" style="max-width:34ch">The lotus rises from the water to bloom fresh each day — a reminder that every cycle is a new beginning.</p>
    </section>
    <section class="card"><p class="muted small">Predictions are estimates based on your logs. ObaaSima is not a medical device and must not be used as contraception. If something feels wrong, please speak to a health professional.</p>
      <p class="muted small">Version 2.0</p></section>`;
  },
};

/* ---------------- sheets: log health & tips ---------------- */
function openLog(k) {
  ui.sheetDate = k;
  const dlg = $('#sheet');
  const date = fromKey(k), d = getDay(k), future = date > today(), dis = future ? 'disabled' : '';
  const tile = ([name, em], field = 'symptoms') => {
    const on = (d[field] || []).includes(name);
    return `<button class="tile ${on ? 'on' : ''}" data-action="toggle" data-field="${field}" data-v="${esc(name)}" aria-pressed="${on}" ${dis}><span class="em">${em}</span>${esc(name)}</button>`;
  };
  const extraOn = MORE_SYMPTOMS.some(([n]) => (d.symptoms || []).includes(n));
  const showMore = ui.more || extraOn;
  const isToday = k === toKey(today());
  dlg.innerHTML = `
  <div class="sheet-body">
    <div class="grabber"></div>
    <div class="page-head center" style="padding:0">
      <button class="icon-btn" data-action="close-sheet" aria-label="Close">${ICON.close}</button>
      <h1>Log Health</h1><span style="width:42px"></span>
    </div>
    <p class="muted small" style="text-align:center">${isToday ? 'Today, ' : ''}${fmt(date, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
    ${future ? '<p class="muted small" style="text-align:center;margin-top:8px">This day is in the future — add a note now and log the rest on the day.</p>' : ''}
    <p class="ask">How are you feeling${isToday ? ' today' : ''}?</p>
    <div class="feelings">${FEELINGS.map(([v, e, l]) => `<button data-action="feeling" data-v="${v}" class="${d.feeling === v ? 'on' : ''}" aria-pressed="${d.feeling === v}" ${dis}><span class="face">${e}</span>${l}</button>`).join('')}</div>
    <h3>Flow</h3>
    <div class="seg">${FLOWS.map(([v, l, drops]) => `<button data-action="flow" data-v="${v}" class="${(d.flow || 'none') === v ? 'on' : ''}" aria-pressed="${(d.flow || 'none') === v}" ${dis}><span class="drops">${drops}</span>${l}</button>`).join('')}</div>
    <h3>Select symptoms <small>(optional)</small></h3>
    <div class="tiles">${SYMPTOMS.map(s => tile(s)).join('')}${showMore ? MORE_SYMPTOMS.map(s => tile(s)).join('') : ''}</div>
    ${showMore ? '' : '<div class="more"><button class="btn sm" data-action="more">+ More</button></div>'}
    <h3>Intimacy <small>🔒 private to this phone</small></h3>
    <div class="seg three">${INTIMACY.map(([v, l, e]) => `<button data-action="intimacy" data-v="${v}" class="${(d.intimacy || 'none') === v ? 'on' : ''}" aria-pressed="${(d.intimacy || 'none') === v}" ${dis}><span class="drops">${e}</span>${l}</button>`).join('')}</div>
    <div class="tiles" style="margin-top:10px">${CLOSENESS.map(c => tile(c, 'closeness')).join('')}</div>
    <h3>Medicine &amp; supplements <small>(optional)</small></h3>
    <input type="text" data-field="medicine" value="${esc(d.medicine || '')}" placeholder="e.g. Folic acid, iron, paracetamol" maxlength="80" ${dis} aria-label="Medicine and supplements">
    <h3>Weight &amp; temperature <small>(optional)</small></h3>
    <div class="duo-in">
      <input type="number" step="0.1" inputmode="decimal" data-field="weight" value="${d.weight ?? ''}" placeholder="Weight (kg)" ${dis} aria-label="Weight in kilograms">
      <input type="number" step="0.01" inputmode="decimal" data-field="temp" value="${d.temp ?? ''}" placeholder="Basal temp (°C)" ${dis} aria-label="Basal body temperature">
    </div>
    <h3>Notes</h3>
    <textarea data-field="notes" rows="3" placeholder="Anything worth remembering…" aria-label="Notes">${esc(d.notes || '')}</textarea>
    <button class="btn primary block" style="margin-top:22px" data-action="save-entry">Save Entry</button>
  </div>`;
  if (!dlg.open) dlg.showModal();
}

function openTips() {
  const M = model();
  const phase = M.pregnant ? 'Pregnant' : (M.last ? M.phase : 'Follicular');
  const phaseKey = phase === 'Ovulation' ? 'Fertile' : phase;
  const label = { Menstrual: 'Your period', Follicular: 'Follicular phase', Fertile: 'Fertile window', Luteal: 'Luteal phase', Late: 'Late period', Pregnant: 'Pregnancy' }[phaseKey];
  ui.sheetDate = null;
  const dlg = $('#sheet');
  dlg.innerHTML = `
  <div class="sheet-body">
    <div class="grabber"></div>
    <div class="page-head center" style="padding:0">
      <button class="icon-btn" data-action="close-sheet" aria-label="Close">${ICON.close}</button>
      <h1>Wellness Tips</h1><span style="width:42px"></span>
    </div>
    <p class="muted small" style="text-align:center;margin-bottom:16px">For your ${label.toLowerCase()} 🌸</p>
    <section class="card blush"><ul class="list">${TIPS[phaseKey].map(([i, x]) => `<li><span class="li-ico">${i}</span><span>${x}</span></li>`).join('')}</ul></section>
    <button class="btn primary block" style="margin-top:20px" data-action="close-sheet">Thank you</button>
  </div>`;
  if (!dlg.open) dlg.showModal();
}

/* ---------------- actions ---------------- */
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2600);
}

function exportData() {
  const payload = { app: 'obaasima', version: 2, exported: new Date().toISOString(), settings: state.settings, days: state.days };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `obaasima-backup-${toKey(today())}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Backup saved 🌸');
}

async function importData(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!data || typeof data.days !== 'object') throw new Error('bad file');
    const days = {};
    for (const [k, v] of Object.entries(data.days)) if (/^\d{4}-\d{2}-\d{2}$/.test(k) && v && typeof v === 'object') days[k] = v;
    if (!confirm(`Replace your current data with this backup (${Object.keys(days).length} logged days)?`)) return;
    const settings = { ...DEFAULTS.settings, ...(data.settings || {}), onboarded: true };
    settings.pregnancy = { ...DEFAULTS.settings.pregnancy, ...(settings.pregnancy || {}) };
    state = { settings, days };
    ui.tab = 'home'; ui.sub = null;
    save(); render(); toast('Backup restored 🌸');
  } catch (e) { toast('That file isn’t an ObaaSima backup'); }
}

async function setPhoto(file) {
  if (!file) return;
  try {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();
    const s = Math.min(img.naturalWidth, img.naturalHeight);
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    c.getContext('2d').drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, 256, 256);
    URL.revokeObjectURL(url);
    state.settings.photo = c.toDataURL('image/jpeg', 0.85);
    save(); render(); toast('Looking lovely ✨');
  } catch (e) { toast('Couldn’t read that photo'); }
}

function maybeRemind() {
  const s = state.settings;
  if (!s.reminders || !s.onboarded) return;
  const M = model();
  if (M.pregnant || !M.last || M.ongoing || M.late) return;
  const n = diff(today(), M.nextStart), tk = toKey(today());
  if (n < 0 || n > 2 || s.lastNotified === tk) return;
  const msg = n === 0 ? 'Your period may start today 🌸' : `Your period may start in ${plural(n, 'day')} 🌸`;
  s.lastNotified = tk; save();
  toast(msg);
  if ('Notification' in window && Notification.permission === 'granted' && navigator.serviceWorker) {
    navigator.serviceWorker.ready.then(r => r.showNotification('ObaaSima', { body: msg, icon: 'icons/icon-192.png', tag: 'obaasima-reminder' })).catch(() => {});
  }
}

function goTab(tab) { ui.tab = tab; ui.sub = null; ui.edit = false; render(); scrollTo(0, 0); }

let installPrompt = null;

document.addEventListener('click', async e => {
  const tabBtn = e.target.closest('.tabbar [data-tab]');
  if (tabBtn) { goTab(tabBtn.dataset.tab); return; }

  const dlg = $('#sheet');
  if (e.target === dlg) { dlg.close(); return; } // tap on backdrop

  const el = e.target.closest('[data-action]');
  if (!el) return;
  const t = today(), tk = toKey(t);
  switch (el.dataset.action) {
    case 'welcome-next': ui.step = 1; render(); break;
    case 'welcome-back': ui.step = 0; render(); break;
    case 'goto': goTab(el.dataset.tab); break;
    case 'sub': ui.tab = 'profile'; ui.sub = el.dataset.sub; render(); scrollTo(0, 0); break;
    case 'back': ui.sub = null; render(); scrollTo(0, 0); break;
    case 'pregnancy': ui.tab = 'profile'; ui.sub = 'pregnancy'; render(); scrollTo(0, 0); break;
    case 'tips': openTips(); break;
    case 'log-today': ui.more = false; openLog(tk); break;
    case 'log-period': {
      const cur = getDay(tk).flow;
      setDay(tk, { flow: PERIOD_FLOWS.has(cur) ? cur : 'medium' });
      toast('Period logged — be gentle with yourself 🌸'); render(); break;
    }
    case 'day': {
      const k = el.dataset.date;
      if (ui.edit) { setDay(k, { flow: PERIOD_FLOWS.has(getDay(k).flow) ? 'none' : 'medium' }); render(); }
      else { ui.more = false; openLog(k); }
      break;
    }
    case 'prev': ui.month = new Date(ui.month.getFullYear(), ui.month.getMonth() - 1, 1); render(); break;
    case 'next': ui.month = new Date(ui.month.getFullYear(), ui.month.getMonth() + 1, 1); render(); break;
    case 'this-month': ui.month = startOfMonth(t); render(); break;
    case 'edit': ui.edit = !ui.edit; render(); break;
    case 'feeling': {
      const v = getDay(ui.sheetDate).feeling === el.dataset.v ? null : el.dataset.v;
      setDay(ui.sheetDate, { feeling: v });
      el.parentElement.querySelectorAll('button').forEach(b => { const on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      render(); break;
    }
    case 'flow': {
      setDay(ui.sheetDate, { flow: el.dataset.v });
      el.parentElement.querySelectorAll('button').forEach(b => { b.classList.toggle('on', b === el); b.setAttribute('aria-pressed', b === el); });
      render(); break;
    }
    case 'intimacy': {
      setDay(ui.sheetDate, { intimacy: el.dataset.v });
      el.parentElement.querySelectorAll('button').forEach(b => { b.classList.toggle('on', b === el); b.setAttribute('aria-pressed', b === el); });
      render(); break;
    }
    case 'toggle': {
      const f = el.dataset.field || 'symptoms', v = el.dataset.v, set = new Set(getDay(ui.sheetDate)[f] || []);
      set.has(v) ? set.delete(v) : set.add(v);
      setDay(ui.sheetDate, { [f]: [...set] });
      el.classList.toggle('on', set.has(v)); el.setAttribute('aria-pressed', set.has(v));
      render(); break;
    }
    case 'more': ui.more = true; { const y = dlg.scrollTop; openLog(ui.sheetDate); dlg.scrollTop = y; } break;
    case 'save-entry': dlg.close(); toast('Entry saved 🌸'); break;
    case 'close-sheet': dlg.close(); break;
    case 'start-pregnancy': {
      const v = $('#lmp').value;
      if (!v) { toast('Please choose a date'); break; }
      state.settings.pregnancy = { on: true, lmp: v };
      save(); render(); toast('Congratulations, mama 🤍'); break;
    }
    case 'end-pregnancy':
      if (confirm('End pregnancy mode? Period predictions will resume from your next logged period.')) {
        state.settings.pregnancy = { on: false, lmp: null }; save(); render();
      }
      break;
    case 'photo': $('#photoFile').click(); break;
    case 'remove-photo': state.settings.photo = null; save(); render(); break;
    case 'export': exportData(); break;
    case 'import': $('#importFile').click(); break;
    case 'wipe':
      if (confirm('Delete all your ObaaSima data from this device? This can’t be undone — export a backup first if you might want it.')) {
        try { localStorage.removeItem(KEY); localStorage.removeItem(LEGACY_KEY); } catch (err) { /* ignore */ }
        state = structuredClone(DEFAULTS); ui.tab = 'home'; ui.sub = null; ui.step = 0; render();
      }
      break;
    case 'install':
      if (installPrompt) { installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; render(); }
      break;
  }
});

document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.field && ui.sheetDate) {
    const numeric = el.dataset.field === 'temp' || el.dataset.field === 'weight';
    const v = numeric ? (el.value === '' ? null : parseFloat(el.value)) : el.value;
    setDay(ui.sheetDate, { [el.dataset.field]: v });
  }
});

document.addEventListener('change', async e => {
  const el = e.target;
  if (el.id === 'importFile') { importData(el.files[0]); el.value = ''; return; }
  if (el.id === 'photoFile') { setPhoto(el.files[0]); el.value = ''; return; }
  const key = el.dataset.setting;
  if (!key) return;
  if (el.type === 'checkbox') {
    state.settings[key] = el.checked;
    if (el.checked && 'Notification' in window && Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch (err) { /* ignore */ }
    }
  } else if (el.type === 'text') {
    state.settings[key] = el.value.trim().slice(0, 30);
  } else {
    let v = parseInt(el.value, 10);
    if (Number.isNaN(v)) v = DEFAULTS.settings[key];
    v = Math.min(+el.max, Math.max(+el.min, v));
    el.value = v;
    state.settings[key] = v;
  }
  save(); toast('Saved');
});

document.addEventListener('submit', e => {
  if (e.target.id !== 'onboardForm') return;
  e.preventDefault();
  const f = new FormData(e.target);
  const clamp = (v, lo, hi, dflt) => { const n = parseInt(v, 10); return Number.isNaN(n) ? dflt : Math.min(hi, Math.max(lo, n)); };
  const plen = clamp(f.get('plen'), 1, 12, 5), clen = clamp(f.get('clen'), 15, 60, 28);
  Object.assign(state.settings, { name: String(f.get('name') || '').trim().slice(0, 30), periodLength: plen, cycleLength: clen, onboarded: true });
  const start = f.get('start');
  if (start) {
    const s = fromKey(start), t = today();
    for (let i = 0; i < plen; i++) {
      const d = addDays(s, i);
      if (d > t) break;
      const k = toKey(d);
      if (!getDay(k).flow) state.days[k] = { ...getDay(k), flow: 'medium' };
    }
  }
  ui.tab = 'home';
  save(); render(); scrollTo(0, 0);
  toast(`Akwaaba${state.settings.name ? ', ' + state.settings.name : ''} 🌸`);
});

$('#sheet').addEventListener('close', () => { ui.sheetDate = null; render(); });

window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; if (ui.sub === 'install') render(); });

// Refresh when the app returns to the foreground on a new day.
let lastDay = toKey(today());
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && toKey(today()) !== lastDay) {
    lastDay = toKey(today()); ui.month = startOfMonth(today()); render(); maybeRemind();
  }
});

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

render();
maybeRemind();
