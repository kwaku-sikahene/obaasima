'use strict';

/* =========================================================
   ObaaSima app lock — passcode + Face ID / Touch ID.
   Loaded after app.js (shares its globals: state, ui, save,
   render, toast, esc, NATIVE, SUB, ICON, head, LOTUS …).

   • The welcome screen shows on every launch, and again after
     the app has been away for more than a minute.
   • Passcode: 4 digits, stored only as a salted, stretched
     SHA-256 hash. 5 wrong tries → growing pause (30 s … 15 min).
   • Biometrics: native Face ID / Touch ID inside the iPhone and
     Mac apps; a device passkey (WebAuthn, user verification
     required) in the browser / home-screen web app.
   This gates access to the app on this device. It does not
   encrypt the data stored on the device.
   ========================================================= */

const RELOCK_AFTER_MS = 60 * 1000;
const PIN_LENGTH = 4;

ICON.lock = '<svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2"/></svg>';
const FACE_ICON = '<svg class="bio-ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V6.5A2.5 2.5 0 0 1 6.5 4H8M16 4h1.5A2.5 2.5 0 0 1 20 6.5V8M20 16v1.5a2.5 2.5 0 0 1-2.5 2.5H16M8 20H6.5A2.5 2.5 0 0 1 4 17.5V16M9 9.5v1.5M15 9.5v1.5M12.5 9.5v3.5h-1M9.5 16c1.6 1.1 3.4 1.1 5 0"/></svg>';
const TOUCH_ICON = '<svg class="bio-ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M7.5 18.5c1-1.8 1.5-3.8 1.5-6.5a3 3 0 0 1 6 0c0 1 0 2-.2 3M12 12c0 3.5-.8 6.3-2.5 8.5M16.2 17.8c.3-.9.5-1.9.6-3M5 15.5c.4-1.2.5-2.3.5-3.5a6.5 6.5 0 0 1 11-4.7M18.4 9.5c.4.8.6 1.6.6 2.5v1"/></svg>';

/* ---------------- hashing (works without crypto.subtle, which the in-app pages don't get) ---------------- */
function sha256(ascii) {
  const rotr = (v, a) => (v >>> a) | (v << (32 - a));
  const maxWord = 2 ** 32;
  const words = [], bitLength = ascii.length * 8;
  let hash = [], k = [], primeCounter = 0;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (candidate ** 0.5 * maxWord) | 0;
      k[primeCounter++] = (candidate ** (1 / 3) * maxWord) | 0;
    }
  }
  ascii += '\x80';
  while (ascii.length % 64 - 56) ascii += '\x00';
  for (let i = 0; i < ascii.length; i++) {
    const c = ascii.charCodeAt(i);
    if (c >> 8) throw new Error('sha256: ASCII only');
    words[i >> 2] |= c << ((3 - i) % 4) * 8;
  }
  words[words.length] = (bitLength / maxWord) | 0;
  words[words.length] = bitLength;
  for (let j = 0; j < words.length;) {
    const w = words.slice(j, j += 16);
    const oldHash = hash;
    hash = hash.slice(0, 8);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
      const temp1 = hash[7] + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & hash[5]) ^ (~e & hash[6])) + k[i]
        + (w[i] = i < 16 ? w[i] : (w[i - 16] + (rotr(w15, 7) ^ rotr(w15, 18) ^ (w15 >>> 3)) + w[i - 7]
          + (rotr(w2, 17) ^ rotr(w2, 19) ^ (w2 >>> 10))) | 0);
      const temp2 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  let out = '';
  for (let i = 0; i < 8; i++) for (let j = 3; j + 1; j--) { const b = (hash[i] >> (j * 8)) & 255; out += (b < 16 ? '0' : '') + b.toString(16); }
  return out;
}
function randHex(n) { return [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2, '0')).join(''); }
function hashPin(pin, salt) { let h = `${salt}:${pin}`; for (let i = 0; i < 1500; i++) h = sha256(salt + h); return h; }

/* ---------------- state ---------------- */
// Always the same object (mutated in place), so every caller sees the latest counts.
function lockCfg() {
  const cur = state.settings.lock;
  if (!cur || typeof cur.on !== 'boolean') state.settings.lock = { ...DEFAULTS.settings.lock, ...(cur || {}) };
  return state.settings.lock;
}
function lockoutLeft() { return Math.max(0, Math.ceil((lockCfg().until - Date.now()) / 1000)); }
function registerFail() {
  const L = lockCfg();
  L.fails = (L.fails || 0) + 1;
  if (L.fails >= 5) L.until = Date.now() + Math.min(15 * 60, 30 * 2 ** (L.fails - 5)) * 1000;
  save();
}

/* ---------------- biometrics ---------------- */
const BIO_KIND = NATIVE ? (window.OBAASIMA_BIOMETRY || 'none') : 'webauthn';
const BIO_LABEL = BIO_KIND === 'faceID' ? 'Face ID' : BIO_KIND === 'touchID' ? 'Touch ID' : BIO_KIND === 'opticID' ? 'Optic ID'
  : /iPhone|iPod/.test(navigator.userAgent) ? 'Face ID'
  : /Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1 ? 'Face ID'   // iPad
  : /Macintosh/.test(navigator.userAgent) ? 'Touch ID' : 'fingerprint or face';
const bioIcon = () => (BIO_LABEL === 'Touch ID' || BIO_LABEL.startsWith('finger') ? TOUCH_ICON : FACE_ICON);

ui.bioAvail = false;
(async () => {
  if (NATIVE) ui.bioAvail = BIO_KIND !== 'none';
  else {
    try { ui.bioAvail = !!(window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()); }
    catch (e) { ui.bioAvail = false; }
  }
  if (!ui.unlocked || ui.sub === 'lock' || ui.setup === 'security') render();
})();

function bioEnabled() {
  const L = lockCfg();
  return !!(L.on && L.bio && ui.bioAvail && (L.bio.type === 'native') === NATIVE);
}

function nativeBio(reason) {
  return new Promise(resolve => {
    window.__obaasimaBio = (ok, tag) => resolve({ ok: !!ok, tag });
    window.webkit.messageHandlers.obaasima.postMessage({ type: 'biometric', reason });
  });
}
const toB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

async function bioEnroll() {
  if (NATIVE) {
    const r = await nativeBio(`Turn on ${BIO_LABEL} for ObaaSima`);
    return r.ok ? { type: 'native' } : null;
  }
  try {
    const cred = await navigator.credentials.create({ publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: 'ObaaSima' },
      user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'ObaaSima lock', displayName: state.settings.name.trim() || 'ObaaSima' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' },
      timeout: 60000,
    } });
    return cred ? { type: 'webauthn', id: toB64(cred.rawId) } : null;
  } catch (e) { return null; }
}

async function bioVerify() {
  const L = lockCfg();
  if (!bioEnabled()) return { ok: false, tag: 'unavailable' };
  if (L.bio.type === 'native') return nativeBio('Unlock ObaaSima');
  try {
    const a = await navigator.credentials.get({ publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: [{ type: 'public-key', id: fromB64(L.bio.id) }],
      userVerification: 'required', timeout: 60000,
    } });
    const flags = new Uint8Array(a.response.authenticatorData)[32];
    return { ok: !!(flags & 0x04) };   // UV bit: the device really checked her face/finger
  } catch (e) { return { ok: false, tag: e && e.name === 'NotAllowedError' ? 'cancel' : 'failed' }; }
}

/* ---------------- flows ---------------- */
function unlock() {
  const L = lockCfg(); L.fails = 0; L.until = 0; save();
  Object.assign(ui, { unlocked: true, lockMode: null, pin: '', lockMsg: '', flow: null });
  render(); maybeRemind();
}

function finishFlow() {
  const backToSettings = ui.flow && ui.flow !== 'setup';
  Object.assign(ui, { flow: null, unlocked: true, lockMode: null, pin: '', pinTemp: null, lockMsg: '' });
  if (backToSettings) { ui.tab = 'profile'; ui.sub = 'lock'; }
  render(); scrollTo(0, 0);
}

function startFlow(flow, mode) {
  const d = document.getElementById('sheet'); if (d.open) d.close();
  Object.assign(ui, { flow, lockMode: mode, unlocked: false, pin: '', pinTemp: null, lockMsg: '' });
  render();
}

function onPinComplete(pin) {
  const L = lockCfg();
  ui.pin = '';
  if (ui.lockMode === 'pin') {
    if (lockoutLeft()) return render();
    if (L.hash && hashPin(pin, L.salt) === L.hash) {
      L.fails = 0; L.until = 0; save();
      if (ui.flow === 'change') { ui.lockMode = 'create'; ui.lockMsg = ''; return render(); }
      if (ui.flow === 'disable') { state.settings.lock = { ...DEFAULTS.settings.lock, asked: true }; save(); toast('App lock turned off'); return finishFlow(); }
      return unlock();
    }
    registerFail();
    const left = 5 - L.fails;
    ui.lockMsg = lockoutLeft() ? '' : `Wrong passcode. ${left} ${left === 1 ? 'try' : 'tries'} left before a short pause.`;
    ui.shake = true;
    return render();
  }
  if (ui.lockMode === 'create') {
    if (/^(\d)\1+$/.test(pin) || '0123456789'.includes(pin) || '9876543210'.includes(pin)) {
      ui.lockMsg = 'That one’s easy to guess — try a different code.'; ui.shake = true; return render();
    }
    ui.pinTemp = pin; ui.lockMode = 'confirm'; ui.lockMsg = ''; return render();
  }
  if (ui.lockMode === 'confirm') {
    if (pin !== ui.pinTemp) {
      Object.assign(ui, { pinTemp: null, lockMode: 'create', lockMsg: 'Those didn’t match — let’s try again.', shake: true });
      return render();
    }
    const salt = randHex(16);
    Object.assign(L, { on: true, salt, hash: hashPin(pin, salt), fails: 0, until: 0 });
    save(); ui.pinTemp = null;
    if (ui.flow === 'signup') return finishSecuritySetup();
    if (ui.bioAvail && !bioEnabled()) { ui.lockMode = 'bio-offer'; return render(); }
    toast(ui.flow === 'change' ? 'Passcode changed' : 'ObaaSima is now protected 🔒');
    return finishFlow();
  }
}

/* ---------------- welcome / lock screen ---------------- */
function renderLock() {
  const L = lockCfg(), name = state.settings.name.trim();
  const hello = `<p class="welcome-back">Akwaaba${name ? ', ' + esc(name) : ''} 🌸</p>`;
  let panel;
  if (['pin', 'create', 'confirm'].includes(ui.lockMode)) panel = pinPad();
  else if (ui.lockMode === 'bio-offer') {
    panel = `<div class="bio-offer">
      <div class="bio-big">${bioIcon()}</div>
      <p class="pin-title">Unlock with ${BIO_LABEL}?</p>
      <p class="pin-sub">Open ObaaSima with a glance${BIO_LABEL === 'Touch ID' ? ' or a touch' : ''}. Your passcode still works as a backup.</p>
      <button class="btn light block" data-action="lock-bio-yes">${bioIcon()} Turn on ${BIO_LABEL}</button>
      <button class="btn clear block" data-action="lock-bio-no">Not now</button></div>`;
  } else if (L.on) {
    panel = `${hello}${bioEnabled()
      ? `<button class="btn light block" data-action="lock-bio">${bioIcon()} Unlock with ${BIO_LABEL}</button>
         <button class="btn clear block" data-action="lock-pin">Use passcode</button>`
      : `<button class="btn light block" data-action="lock-pin">${ICON.lock.replace('<svg', '<svg class="bio-ic" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"')} Unlock with passcode</button>`}`;
  } else {
    panel = `${hello}
      <p class="pin-sub">Keep your journal private with a passcode${ui.bioAvail ? ' or ' + BIO_LABEL : ''}.</p>
      <button class="btn light block" data-action="lock-setup">${ICON.lock.replace('<svg', '<svg class="bio-ic" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"')} Protect ObaaSima</button>
      <button class="btn clear block" data-action="lock-continue">Continue without a lock</button>`;
  }
  return `
  <section class="splash ${ui.lockMode ? 'keypad-open' : ''}">
    <div class="splash-photo" role="img" aria-label="A smiling woman in a patterned head wrap, eyes closed, face lifted to the sky"></div>
    ${LOTUS}
    <h1>ObaaSima</h1>
    <p class="tagline">Know your body.<br>Embrace your journey.</p>
    <div class="cta">${panel}</div>
  </section>`;
}

function pinPad() {
  const verifying = ui.flow === 'change' || ui.flow === 'disable';
  const titles = {
    pin: verifying ? 'Enter your current passcode' : 'Enter your passcode',
    create: ui.flow === 'change' ? 'Choose a new passcode' : `Create a ${PIN_LENGTH}-digit passcode`,
    confirm: 'Enter it once more',
  };
  const wait = ui.lockMode === 'pin' ? lockoutLeft() : 0;
  const hint = ui.lockMode === 'create' && !ui.lockMsg ? 'You’ll use it to open ObaaSima.' : '';
  const msg = wait ? `Too many tries. Try again in ${wait >= 60 ? Math.ceil(wait / 60) + ' min' : wait + 's'}.` : (ui.lockMsg || hint);
  const dots = Array.from({ length: PIN_LENGTH }, (_, i) => `<i class="${i < ui.pin.length ? 'on' : ''}"></i>`).join('');
  const key = d => `<button class="key" data-action="lock-key" data-k="${d}" ${wait ? 'disabled' : ''}>${d}</button>`;
  const bioKey = ui.lockMode === 'pin' && !ui.flow && bioEnabled()
    ? `<button class="key fn" data-action="lock-bio" aria-label="Unlock with ${BIO_LABEL}">${bioIcon()}</button>` : '<span></span>';
  const cancelLabel = ui.flow === 'signup' ? 'Back' : ui.flow === 'setup' && ui.lockMode === 'create' ? 'Skip for now' : 'Cancel';
  return `
  <div class="pin ${ui.shake ? 'shake' : ''}" role="group" aria-label="${titles[ui.lockMode]}">
    <p class="pin-title">${titles[ui.lockMode]}</p>
    <div class="dots" aria-label="${ui.pin.length} of ${PIN_LENGTH} digits entered">${dots}</div>
    <p class="pin-msg ${ui.lockMsg || wait ? 'err' : ''}" role="status">${msg}</p>
    <div class="keys">
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(key).join('')}
      ${bioKey}${key(0)}
      <button class="key fn" data-action="lock-del" aria-label="Delete">⌫</button>
    </div>
    <div class="pin-links">
      <button class="link-light" data-action="lock-cancel">${cancelLabel}</button>
      ${ui.lockMode === 'pin' && !ui.flow ? '<button class="link-light" data-action="lock-forgot">Forgot passcode?</button>' : ''}
    </div>
  </div>`;
}

/* ---------------- settings page: Profile → App Lock ---------------- */
SUB.lock = () => {
  const L = lockCfg();
  const on = L.on;
  return `${head('App Lock', { back: true, center: true })}
  <section class="card blush">
    <h2>${on ? 'ObaaSima is protected 🔒' : 'App lock is off'}</h2>
    <p class="small">${on
      ? `ObaaSima always opens on the welcome screen and asks for your passcode${bioEnabled() ? ' or ' + BIO_LABEL : ''}. It locks again after a minute away.`
      : `Turn it on so ObaaSima asks for a passcode${ui.bioAvail ? ' or ' + BIO_LABEL : ''} every time it opens.`}</p>
  </section>
  ${on ? `
  <section class="card">
    ${ui.bioAvail
      ? `<label class="switch"><span>${bioIcon()} Unlock with ${BIO_LABEL}</span><input type="checkbox" data-action="lock-bio-toggle" ${bioEnabled() ? 'checked' : ''}></label>`
      : `<p class="muted small">${BIO_LABEL} isn’t set up on this device, so ObaaSima uses your passcode.</p>`}
  </section>
  <div class="row">
    <button class="btn" data-action="lock-change">Change passcode</button>
    <button class="btn" data-action="lock-now">Lock now</button>
  </div>
  <button class="btn danger block" data-action="lock-disable">Turn off app lock</button>`
  : `<button class="btn primary block" data-action="lock-turn-on">Turn on app lock</button>`}
  <p class="disclaimer">The lock stops anyone else opening ObaaSima on this device. Your passcode itself is never stored — only a scrambled fingerprint of it.</p>`;
};

/* ---------------- events ---------------- */
document.addEventListener('click', async e => {
  const el = e.target.closest('[data-action^="lock-"]');
  if (!el) return;
  const L = lockCfg();
  switch (el.dataset.action) {
    case 'lock-key':
      if (ui.pin.length >= PIN_LENGTH || (ui.lockMode === 'pin' && lockoutLeft())) return;
      ui.pin += el.dataset.k; ui.lockMsg = ''; ui.shake = false; render();
      if (ui.pin.length === PIN_LENGTH) { const p = ui.pin; setTimeout(() => onPinComplete(p), 140); }
      break;
    case 'lock-del': ui.pin = ui.pin.slice(0, -1); render(); break;
    case 'lock-pin': ui.lockMode = 'pin'; ui.pin = ''; ui.lockMsg = ''; render(); break;
    case 'lock-bio': {
      const r = await bioVerify();
      if (r.ok) return unlock();
      if (r.tag !== 'cancel') toast(`${BIO_LABEL} didn’t work — use your passcode`);
      ui.lockMode = 'pin'; render();
      break;
    }
    case 'lock-cancel':
      if (ui.flow === 'signup') { Object.assign(ui, { flow: null, lockMode: null, pin: '', pinTemp: null, lockMsg: '' }); render(); }
      else if (ui.flow === 'setup') { ui.flow = null; ui.lockMode = null; ui.unlocked = true; render(); }
      else if (ui.flow) finishFlow();
      else { ui.lockMode = null; ui.pin = ''; ui.lockMsg = ''; render(); }
      break;
    case 'lock-forgot':
      if (confirm('Without your passcode, the only way back in is to erase ObaaSima on this device and then restore a backup. Erase everything now?')) {
        try { localStorage.removeItem(KEY); localStorage.removeItem(LEGACY_KEY); } catch (err) { /* ignore */ }
        state = structuredClone(DEFAULTS);
        Object.assign(ui, { unlocked: false, lockMode: null, flow: null, pin: '', tab: 'home', sub: null, step: 0 });
        render(); toast('ObaaSima was reset on this device');
      }
      break;
    case 'lock-setup': startFlow('setup', 'create'); break;
    case 'lock-turn-on': startFlow('turn-on', 'create'); break;
    case 'lock-change': startFlow('change', 'pin'); break;
    case 'lock-disable': startFlow('disable', 'pin'); break;
    case 'lock-now': startFlow(null, null); break;
    case 'lock-continue': ui.unlocked = true; render(); maybeRemind(); break;
    case 'lock-bio-yes': {
      const b = await bioEnroll();
      if (b) { L.bio = b; save(); toast(`${BIO_LABEL} is on 🔒`); }
      else toast(`${BIO_LABEL} wasn’t turned on — you can try again in Profile → App Lock`);
      finishFlow();
      break;
    }
    case 'lock-bio-no': toast('ObaaSima is now protected 🔒'); finishFlow(); break;
    case 'lock-bio-toggle': {
      e.preventDefault();
      if (bioEnabled()) { L.bio = null; save(); toast(`${BIO_LABEL} turned off`); }
      else { const b = await bioEnroll(); if (b) { L.bio = b; save(); toast(`${BIO_LABEL} is on`); } }
      render();
      break;
    }
  }
});

// Physical keyboard on the passcode pad (Mac, iPad with keyboard).
document.addEventListener('keydown', e => {
  if (!document.querySelector('.pin')) return;
  if (/^\d$/.test(e.key)) { document.querySelector(`.key[data-k="${e.key}"]`)?.click(); e.preventDefault(); }
  else if (e.key === 'Backspace') { document.querySelector('[data-action="lock-del"]')?.click(); e.preventDefault(); }
  else if (e.key === 'Escape') { document.querySelector('[data-action="lock-cancel"]')?.click(); }
});

// Lock again after a minute in the background.
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { hiddenAt = Date.now(); return; }
  if (lockCfg().on && ui.unlocked && hiddenAt && Date.now() - hiddenAt > RELOCK_AFTER_MS) {
    const d = document.getElementById('sheet'); if (d.open) d.close();
    Object.assign(ui, { unlocked: false, lockMode: null, pin: '', lockMsg: '', flow: null });
    render();
  }
});

// Count down the pause after too many wrong passcodes.
setInterval(() => {
  if (!ui.unlocked && ui.lockMode === 'pin' && lockCfg().until > Date.now() - 1500) render();
}, 1000);

/* ---------------- Signup step 2: "Keep it private" ----------------
   Shown once: right after signup, or on the first open for someone who
   already has data but never chose a lock. She sets a backup passcode and
   (optionally) Face ID / Touch ID, then goes straight in — the welcome-screen
   lock starts from the NEXT time she opens ObaaSima. */
function needsSecuritySetup() {
  if (ui.setup === 'security') return true;
  const L = lockCfg();
  if (!L.on && !L.asked) { ui.setup = 'security'; ui.unlocked = true; return true; }
  return false;
}

const LOCK_IC = () => ICON.lock.replace('<svg', '<svg class="bio-ic" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"');

function renderSecurity() {
  const padOpen = ui.flow === 'signup' && ['create', 'confirm'].includes(ui.lockMode);
  const bioOn = ui.bioAvail && ui.secBio;
  return `
  <section class="onboard security">
    ${ui.fromSignup ? '<p class="sec-step">Step 2 of 2</p>' : ''}
    <div class="sec-badge">${LOCK_IC()}</div>
    <h1>Keep it private</h1>
    <p>${padOpen
      ? (bioOn ? `First, a backup passcode for when ${BIO_LABEL} can’t see you.` : 'Choose a passcode only you know.')
      : 'Your journal holds personal things. Choose how you’ll open ObaaSima — it will start asking from the next time you open the app.'}</p>
    ${padOpen ? `<div class="card sec-pad">${pinPad()}</div>` : `
    <section class="card sec-card">
      ${ui.bioAvail
        ? `<label class="switch"><span>${bioIcon()} Unlock with ${BIO_LABEL}</span><input type="checkbox" data-action="sec-bio" ${bioOn ? 'checked' : ''}></label>
           <p class="muted small">Quick and private — ${BIO_LABEL} is checked by your device. ObaaSima never sees your face or fingerprint.</p>`
        : `<p class="small">${BIO_LABEL} isn’t set up on this device, so you’ll use a passcode. You can add it later in Profile → App Lock.</p>`}
      <div class="sec-row">${LOCK_IC()}<div><b>Backup passcode</b><span class="muted small">4 digits${ui.bioAvail ? ` — for when ${BIO_LABEL} can’t see you` : ''}</span></div></div>
    </section>
    <button class="btn primary block" data-action="sec-start">${bioOn ? `Set up passcode & ${BIO_LABEL.startsWith('finger') ? 'biometrics' : BIO_LABEL}` : 'Set a passcode'} <span class="arr">→</span></button>
    <button class="link sec-skip" data-action="sec-skip">Skip for now</button>`}
  </section>`;
}

async function finishSecuritySetup() {
  const L = lockCfg();
  const wantBio = ui.bioAvail && ui.secBio;
  let bioOk = false;
  if (wantBio) { const b = await bioEnroll(); if (b) { L.bio = b; bioOk = true; } }
  L.asked = true; save();
  Object.assign(ui, { setup: null, fromSignup: false, flow: null, lockMode: null, pin: '', pinTemp: null, lockMsg: '', unlocked: true });
  render(); scrollTo(0, 0);
  toast(bioOk ? `All set 🔒 Next time, open ObaaSima with ${BIO_LABEL}`
    : wantBio ? `${BIO_LABEL} wasn’t turned on — try again in Profile → App Lock`
    : 'All set 🔒 Next time, ObaaSima will ask for your passcode');
  maybeRemind();
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action^="sec-"]');
  if (!el) return;
  switch (el.dataset.action) {
    case 'sec-bio': ui.secBio = el.checked; render(); break;
    case 'sec-start':
      Object.assign(ui, { flow: 'signup', lockMode: 'create', pin: '', pinTemp: null, lockMsg: '' });
      render(); scrollTo(0, 0); break;
    case 'sec-skip':
      lockCfg().asked = true; save();
      Object.assign(ui, { setup: null, fromSignup: false, unlocked: true });
      render(); scrollTo(0, 0);
      toast('You can turn on App Lock anytime in Profile');
      maybeRemind();
      break;
  }
});
