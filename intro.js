/* ==========================================================================
   intro.js: the name intro that plays when someone first opens the site.
   "Zidan" and "Zuberi" get typed fast with typos (a red X each time), each
   correct name gets a green light, then five mini items pop out around it
   and the intro fades away to show the page.

   - Plays once per visit (per browser tab session). Add ?intro to the
     address to play it again.
   - Skip button and the Esc key end it straight away.
   - It opens on a pulsing dot with "Click to enter". That click starts the
     intro with sound (browsers only allow sound after a click). The Sound
     button turns it off.
   - With "reduce motion" turned on, it plays a calmer version: no zoom,
     no shake, and the items fade in where they sit.
   ========================================================================== */
(() => {
  const forced = /[?&]intro\b/.test(location.search);
  let seen = false;
  try { seen = sessionStorage.getItem('zz-intro-seen') === '1'; } catch (e) {}
  if (seen && !forced) return;
  try { sessionStorage.setItem('zz-intro-seen', '1'); } catch (e) {}

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const LINES = [
    { tries: ['ZI EDA', 'ZIDAY', 'ZAIDAN', ['ZAIDANÉ', 'ZIDANÉ']], answer: 'ZIDAN' },
    { tries: ['ZUBEERR', 'ZUBERYY', 'ZUBEYR', 'ZUBERY'], answer: 'ZUBERI' },
  ];
  const T = { type: 62, del: 34, xHold: 340, afterOk: 220, glow: 750, cut: 1000, startPause: 350, linger: 1300, fade: 550 };   // slowed 2026-11-23 (slice kept at 1 s)

  /* ---------- styles (all prefixed zi- so nothing clashes with the page) ---------- */
  const css = `
.zi { position: fixed; inset: 0; z-index: 9999; display: grid; place-items: center; overflow: hidden;
  background: var(--bg); color: var(--ink); font-family: var(--font-display); transition: opacity ${T.fade}ms ease; }
.zi.zi-out { opacity: 0; pointer-events: none; }
.zi-cam { transform: none; }   /* no camera zoom (Zidan, 2026-11-23) */
.zi-punch.zi-go { animation: zi-punch .32s ease-out; }
@keyframes zi-punch { 40% { transform: scale(1.045); } }
.zi-stage { position: relative; display: grid; gap: .1em; justify-items: center;   /* every line stays centred, even mid-typo */ font-size: clamp(32px, 11vw, 104px); font-weight: 800;
  letter-spacing: -.02em; line-height: 1.05; padding: 0 16px; }
.zi-line { position: relative; display: flex; align-items: center; height: 1.15em; z-index: 1; }
.zi-word { position: relative; white-space: pre; z-index: 1; }
.zi-final .zi-word { transition: color .35s ease, text-shadow .35s ease; }
.zi-word.zi-wrong { color: #e8364a; }
.zi-caret { position: absolute; left: 100%; top: .165em; width: .06em; height: .82em; background: var(--ink); margin-left: .04em; opacity: 0; }
.zi-caret.zi-typing { opacity: 1; }
.zi-x { position: absolute; left: 100%; top: 50%; margin-top: -.625em; font-size: .32em; width: 1.25em; height: 1.25em; margin-left: .55em; border-radius: 50%; display: grid; place-items: center;
  background: #e8364a; color: #fff; font-family: var(--font-mono); font-weight: 500; opacity: 0; transform: scale(.3); }
.zi-x.zi-show { opacity: 1; transform: none; animation: zi-xpop .22s cubic-bezier(.3,1.55,.5,1); }
@keyframes zi-xpop { 0% { transform: scale(.3) rotate(-30deg); } 100% { transform: scale(1) rotate(0); } }
.zi-cut { position: relative; display: inline-block; transform-origin: 30% 100%; }
.zi-half { display: inline-block; }
.zi-a { clip-path: polygon(-20% -20%, 120% -20%, 120% 22%, -20% 74%); }
.zi-b { position: absolute; left: 0; top: 0; clip-path: polygon(-20% 74%, 120% 22%, 120% 120%, -20% 120%); }
.zi-blade { position: absolute; left: -.3em; right: -.3em; top: 49%; height: .045em; border-radius: 1em; opacity: 0;
  background: linear-gradient(90deg, rgba(255,255,255,0), #fff 35%, #fff 70%, rgba(255,255,255,0));
  box-shadow: 0 0 .18em rgba(255,255,255,.9), 0 0 .5em rgba(140,200,255,.6); transform: rotate(-21deg) scaleX(0); transform-origin: left center; }
.zi-cut.zi-go { animation: zi-scared 1s linear forwards; }
@keyframes zi-scared {
  0% { transform: none; }
  12% { transform: translateY(-.06em) rotate(9deg) skewX(-8deg) scale(.9, 1.06); }
  20%, 28%, 36%, 44%, 52%, 60% { transform: translate(.025em, -.06em) rotate(10deg) skewX(-8deg) scale(.9, 1.06); }
  24%, 32%, 40%, 48%, 56% { transform: translate(-.025em, -.05em) rotate(7deg) skewX(-8deg) scale(.9, 1.06); }
  64%, 100% { transform: translateY(-.06em) rotate(9deg) skewX(-8deg) scale(.9, 1.06); } }
.zi-go .zi-blade { animation: zi-blade .22s .6s ease-out forwards; }
@keyframes zi-blade { 0% { opacity: 1; transform: rotate(-21deg) scaleX(0); } 45% { opacity: 1; transform: rotate(-21deg) scaleX(1); }
  100% { opacity: 0; transform: rotate(-21deg) scaleX(1); } }
.zi-go .zi-a { animation: zi-fa .34s .66s cubic-bezier(.3,0,.8,.6) forwards; }
.zi-go .zi-b { animation: zi-fb .34s .66s cubic-bezier(.3,0,.8,.6) forwards; }
@keyframes zi-fa { to { transform: translate(.22em, -.2em) rotate(18deg); opacity: 0; } }
@keyframes zi-fb { to { transform: translate(-.08em, .4em) rotate(-14deg); opacity: 0; } }
.zi-line.zi-shake .zi-word { animation: zi-shake .18s linear; }
@keyframes zi-shake { 25% { transform: translateX(-.03em); } 75% { transform: translateX(.03em); } }
.zi-glow { position: absolute; left: -.12em; top: .06em; height: 1.02em; border-radius: .14em;
  background: linear-gradient(90deg, rgba(61,220,132,0), rgba(61,220,132,.9) 30%, rgba(61,220,132,.9) 70%, rgba(61,220,132,0));
  box-shadow: 0 0 .5em rgba(61,220,132,.55); transform-origin: left center; transform: scaleX(0); opacity: 0; z-index: 0; }
.zi-glow.zi-go { animation: zi-glow .75s ease-out forwards; }
@keyframes zi-glow { 0% { transform: scaleX(0); opacity: 1; } 35% { transform: scaleX(1); opacity: 1; } 100% { transform: scaleX(1); opacity: 0; } }
.zi-word.zi-ok { color: transparent; background: linear-gradient(90deg, #04140a 0 50%, var(--ink) 50% 100%); background-size: 200% 100%;
  -webkit-background-clip: text; background-clip: text; animation: zi-oktext .3s ease-out forwards; }
@keyframes zi-oktext { from { background-position: 100% 0; } to { background-position: 0 0; } }
.zi-final .zi-l1 .zi-word { text-shadow: .045em .045em 0 var(--accent); }
.zi-final .zi-l2 .zi-word { color: var(--ink); -webkit-text-stroke: .03em var(--ink); }
.zi-final .zi-l2 .zi-word::after { content: attr(data-text); position: absolute; left: 0; top: 0; color: var(--bg); -webkit-text-stroke: 0; }
.zi-burst { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.zi-burst i { --s: .44em; position: absolute; left: var(--sx); top: var(--sy); width: var(--s); height: var(--s); margin: calc(var(--s) / -2) 0 0 calc(var(--s) / -2);
  opacity: 0; transform: translate(0, 0) scale(.2) rotate(0deg);
  transition: transform .6s cubic-bezier(.3,1.55,.5,1), opacity .25s ease; transition-delay: calc(var(--n) * 70ms); }
.zi-burst i svg { width: 100%; height: 100%; display: block; overflow: visible; filter: drop-shadow(0 0 .12em var(--c)); }
.zi-pop .zi-burst i { opacity: 1; transform: translate(var(--x), var(--y)) scale(1) rotate(var(--r)); }
.zi-pop .zi-burst i svg { animation: zi-bob 2.6s ease-in-out infinite; animation-delay: calc(.7s + var(--n) * .3s); }
@keyframes zi-bob { 50% { transform: translateY(-.06em) rotate(5deg); } }
.zi-waiting .zi-snd { display: none; }
.zi-ui { position: fixed; right: 16px; bottom: 16px; z-index: 4; display: flex; gap: 8px; font: 500 13px var(--font-mono); }
.zi-ui button { font: inherit; color: var(--ink); background: var(--surface); border: 1px solid var(--line); border-radius: 999px;
  padding: 8px 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.zi-ui button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.zi-ui svg { width: 15px; height: 15px; }
/* tap to enter: a glowing dot pulsing, with "Click to enter" under it. The click also unlocks sound */
.zi-gate { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 22px; z-index: 3;
  background: var(--bg); border: 0; color: var(--muted); cursor: pointer; font: 500 13px var(--font-mono); letter-spacing: .14em; text-transform: uppercase;
  transition: opacity .35s ease; }
.zi-gate:focus-visible { outline: none; }
.zi-gate:focus-visible .zi-dot { outline: 2px solid var(--accent); outline-offset: 10px; }
.zi-gate.zi-gone { opacity: 0; pointer-events: none; }
.zi-dot { width: 18px; height: 18px; border-radius: 50%; background: var(--accent);
  box-shadow: 0 0 18px 4px color-mix(in srgb, var(--accent) 60%, transparent); animation: zi-pulse 1.6s ease-in-out infinite; }
@keyframes zi-pulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 14px 2px color-mix(in srgb, var(--accent) 45%, transparent); }
  50% { transform: scale(1.35); box-shadow: 0 0 34px 10px color-mix(in srgb, var(--accent) 65%, transparent); } }
.zi-calm .zi-dot { animation: none; }
/* calmer version for reduce motion: no zoom, no shake, items fade in where they sit */
.zi-calm .zi-cut.zi-go, .zi-calm .zi-punch.zi-go, .zi-calm .zi-line.zi-shake .zi-word, .zi-calm .zi-x.zi-show, .zi-calm.zi-pop .zi-burst i svg { animation: none; }
.zi-calm .zi-burst i { transform: translate(var(--x), var(--y)) rotate(var(--r)); transition: opacity .4s ease; }
`;

  /* ---------- the five mini items (24 x 24 grid) ---------- */
  const spark = (() => {
    const L = [9.5, 7, 9, 6.5, 9.8, 7.4, 8.8, 6.8, 9.6, 7.2, 9.2, 6.6]; let d = '';
    L.forEach((len, i) => { const a = i / L.length * Math.PI * 2 - Math.PI / 2;
      d += `M${(12 + 2 * Math.cos(a)).toFixed(2)} ${(12 + 2 * Math.sin(a)).toFixed(2)}L${(12 + len * Math.cos(a)).toFixed(2)} ${(12 + len * Math.sin(a)).toFixed(2)}`; });
    return `<path d="${d}" stroke="#d97757" stroke-width="2.6" stroke-linecap="round"/>`;
  })();
  const ICONS = [
    { name: 'Pakistan flag', c: '#2fae5f', svg: `
      <path d="M2.5 3.5V22" stroke="#9aa6a9" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M3 5c4-1.2 7 1.2 10 0s5.5-1 8 0v12c-2.5-1-5-1.2-8 0s-6-1.2-10 0z" fill="#0f7a3d"/>
      <path d="M3 5c1.6-.5 3-.6 4.2-.4v12.3c-1.2-.2-2.6-.1-4.2.4z" fill="#f4f6f5"/>
      <circle cx="14" cy="11.2" r="3.6" fill="#f4f6f5"/><circle cx="15.1" cy="10.5" r="3.1" fill="#0f7a3d"/>
      <path d="M16.9 8.3l.45 1 1.1.1-.85.7.27 1.07-.97-.58-.95.6.25-1.08-.84-.72 1.1-.08z" fill="#f4f6f5"/>` },
    { name: 'Claude', c: '#d97757', svg: spark },
    { name: 'Dell XPS laptop', c: '#9fb4ff', svg: `
      <rect x="4" y="4.5" width="16" height="11" rx="1.2" fill="#1b2230" stroke="#aab0b8" stroke-width="1.1"/>
      <rect x="5.2" y="5.7" width="13.6" height="8.6" rx=".4" fill="url(#ziXps)"/>
      <path d="M1.8 17.2h20.4l-1.3 2H3.1z" fill="#aab0b8"/><path d="M10 17.2h4l-.4.7h-3.2z" fill="#7a8089"/>
      <defs><linearGradient id="ziXps" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a7bff"/><stop offset=".6" stop-color="#7a4dff"/><stop offset="1" stop-color="#ff6ad5"/></linearGradient></defs>` },
    { name: 'Wispr Flow', c: '#c9c2b4', svg: `
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="#f2efe8" stroke="#c9c2b4" stroke-width=".6"/>
      <path d="M6.5 12c1.2-3 2.4-3 3.6 0s2.4 3 3.6 0 2.4-3 3.6 0" stroke="#111" stroke-width="2" stroke-linecap="round" fill="none"/>` },
    { name: 'Brut cologne', c: '#3fbf6e', svg: `
      <rect x="9.6" y="1.8" width="4.8" height="3.4" rx=".6" fill="#c4c9ce"/><rect x="9.1" y="4.9" width="5.8" height="1.2" rx=".4" fill="#99a0a7"/>
      <path d="M10.3 6.1h3.4v1.6c3 .8 4.8 2.9 4.8 6.2v5.4c0 1.6-1.2 2.8-2.8 2.8H8.3c-1.6 0-2.8-1.2-2.8-2.8v-5.4c0-3.3 1.8-5.4 4.8-6.2z" fill="#1f8a4a" fill-opacity=".9" stroke="#5fcf8a" stroke-width=".6"/>
      <path d="M7.6 11.5c.3-1.4 1-2.3 2-2.9v10.8H7.8c-.2 0-.2-.1-.2-.3z" fill="#fff" fill-opacity=".28"/>
      <circle cx="12.6" cy="15.2" r="2.6" fill="#d4d8dd"/><circle cx="12.6" cy="15.2" r="1.7" fill="none" stroke="#7d848c" stroke-width=".5"/>` },
  ];
  // even directions around the name, one per item (0 = right, -90 = up), and the same clear gap to the letters
  const ANGLES = [-162, -90, -18, 126, 54], TILTS = [-14, 10, 16, -10, 12], GAP = .3;

  /* ---------- sound: made in the browser, starts off until the visitor turns it on ---------- */
  let ac = null, bus = null, soundOn = true;
  const startAudio = () => {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
      bus = ac.createGain(); bus.gain.value = .55;
      const c = ac.createDynamicsCompressor(); c.threshold.value = -18; c.ratio.value = 6; c.attack.value = .002; c.release.value = .12;
      bus.connect(c).connect(ac.destination); }
    if (ac.state === 'suspended') ac.resume();
  };
  const env = (g, t, peak, a, d) => { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); };
  let nb = null;
  const noise = () => { if (nb) return nb; nb = ac.createBuffer(1, ac.sampleRate * .06, ac.sampleRate);
    const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return nb; };
  // only play while the browser actually lets sound run, so blocked sounds never pile up and burst out later
  const on = () => soundOn && ac && ac.state === 'running';
  const SFX = {
    key(back) {   // clean mechanical key: tiny click on a short rounded thock
      if (!on()) return; const t = ac.currentTime, v = .85 + Math.random() * .3;
      const s1 = ac.createBufferSource(); s1.buffer = noise(); const bp = ac.createBiquadFilter(); bp.type = 'bandpass';
      bp.frequency.value = 3800 + Math.random() * 600; bp.Q.value = 2.2; const g1 = ac.createGain(); env(g1, t, .12 * v, .001, .012);
      s1.connect(bp).connect(g1).connect(bus); s1.start(t); s1.stop(t + .03);
      const o = ac.createOscillator(), f0 = (back ? 260 : 330) * (.95 + Math.random() * .1);
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * .55, t + .03);
      const g2 = ac.createGain(); env(g2, t, .32 * v, .002, .035); o.connect(g2).connect(bus); o.start(t); o.stop(t + .05);
      const s2 = ac.createBufferSource(); s2.buffer = noise(); const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100;
      const g3 = ac.createGain(); env(g3, t, .12 * v, .001, .025); s2.connect(lp).connect(g3).connect(bus); s2.start(t); s2.stop(t + .04);
    },
    wrong() {     // low two-note "da-da"
      if (!on()) return; const t = ac.currentTime;
      [[311, 0], [233, .085]].forEach(([fq, dt]) => {
        const o = ac.createOscillator(), o2 = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain(), g2 = ac.createGain();
        o.type = 'triangle'; o.frequency.value = fq; o2.type = 'square'; o2.frequency.value = fq; g2.gain.value = .18;
        lp.type = 'lowpass'; lp.frequency.value = 1400; env(g, t + dt, .2, .006, .11);
        o.connect(g); o2.connect(g2).connect(g); g.connect(lp).connect(bus);
        o.start(t + dt); o2.start(t + dt); o.stop(t + dt + .14); o2.stop(t + dt + .14);
      });
    },
    right() {     // warm lower two-note chime
      if (!on()) return; const t = ac.currentTime;
      [[523, 0], [784, .08]].forEach(([fq, dt]) => {
        const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), g2 = ac.createGain();
        o.frequency.value = fq; o2.type = 'triangle'; o2.frequency.value = fq * 2; g2.gain.value = .12; env(g, t + dt, .22, .008, .5);
        o.connect(g); o2.connect(g2).connect(g); g.connect(bus); o.start(t + dt); o2.start(t + dt); o.stop(t + dt + .55); o2.stop(t + dt + .55);
      });
    },
    gulp() {      // small nervous wobble as the E notices the blade
      if (!on()) return; const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(), lf = ac.createOscillator(), lg = ac.createGain();
      o.type = 'triangle'; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(380, t + .45);
      lf.frequency.value = 18; lg.gain.value = 22; lf.connect(lg).connect(o.frequency);
      env(g, t, .05, .03, .45); o.connect(g).connect(bus); o.start(t); lf.start(t); o.stop(t + .5); lf.stop(t + .5);
    },
    shwing() {    // samurai blade: fast rising swish, then a bright metal ring
      if (!on()) return; const t = ac.currentTime;
      const s = ac.createBufferSource(); s.buffer = noise(); s.loop = true; const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.4;
      bp.frequency.setValueAtTime(900, t); bp.frequency.exponentialRampToValueAtTime(7000, t + .16);
      const g = ac.createGain(); env(g, t, .42, .07, .14); s.connect(bp).connect(g).connect(bus); s.start(t); s.stop(t + .25);
      [[2870, .07], [4130, .05], [5990, .035], [8420, .02]].forEach(([fq, pk]) => {
        const o = ac.createOscillator(), og = ac.createGain(), at = t + .07;
        o.frequency.setValueAtTime(fq * .97, at); o.frequency.exponentialRampToValueAtTime(fq, at + .05);
        env(og, at, pk, .004, .7); o.connect(og).connect(bus); o.start(at); o.stop(at + .8);
      });
    },
    pop(n) {
      if (!on()) return; const t = ac.currentTime + n * .07, o = ac.createOscillator(), g = ac.createGain();
      o.frequency.setValueAtTime(260 + n * 40, t); o.frequency.exponentialRampToValueAtTime(620 + n * 70, t + .07);
      env(g, t, .1, .004, .09); o.connect(g).connect(bus); o.start(t); o.stop(t + .12);
    },
  };

  /* ---------- build it ---------- */
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
  const root = document.createElement('div');
  root.className = 'zi zi-waiting' + (reduce ? ' zi-calm' : '');
  root.setAttribute('role', 'presentation');
  const lineHTML = n => `<div class="zi-line zi-l${n}"><span class="zi-glow"></span><span class="zi-word"></span><span class="zi-caret"></span><span class="zi-x">✕</span></div>`;
  const speaker = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  root.innerHTML = `<button type="button" class="zi-gate" aria-label="Click to enter the site"><span class="zi-dot"></span><span>Click to enter</span></button>
    <div class="zi-cam" aria-hidden="true"><div class="zi-punch"><div class="zi-stage"><span class="zi-burst"></span>${lineHTML(1)}${lineHTML(2)}</div></div></div>
    <div class="zi-ui"><button type="button" class="zi-snd" aria-pressed="true">${speaker}<span>Sound on</span></button><button type="button" class="zi-skip">Skip</button></div>`;
  const $ = s => root.querySelector(s);
  const stage = $('.zi-stage'), cam = $('.zi-cam'), punch = $('.zi-punch'), burst = $('.zi-burst');
  ICONS.forEach((ic, n) => { const i = document.createElement('i'); i.style.setProperty('--n', n); i.style.setProperty('--c', ic.c);
    i.innerHTML = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${ic.svg}</svg>`; burst.appendChild(i); });

  const prevOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = 'hidden';
  document.body.appendChild(root);

  let done = false;
  function finish() {
    if (done) return; done = true;
    document.removeEventListener('keydown', onKey);
    root.classList.add('zi-out');
    document.documentElement.style.overflow = prevOverflow;
    setTimeout(() => { root.remove(); style.remove(); }, T.fade + 50);
  }
  const onKey = e => { if (e.key === 'Escape') finish(); };
  document.addEventListener('keydown', onKey);
  $('.zi-skip').addEventListener('click', finish);
  const sndBtn = $('.zi-snd');
  const label = () => {   // honest label: says "Tap for sound" while the browser is still holding sound back
    const running = ac && ac.state === 'running';
    sndBtn.setAttribute('aria-pressed', String(soundOn && running));
    sndBtn.querySelector('span').textContent = !soundOn ? 'Sound off' : running ? 'Sound on' : 'Tap for sound';
  };
  let blockedAtPress = true;
  sndBtn.addEventListener('pointerdown', () => { blockedAtPress = !(ac && ac.state === 'running'); }, { capture: true });
  sndBtn.addEventListener('click', () => {
    if (blockedAtPress && soundOn) startAudio();   // first press while blocked just starts the sound
    else { soundOn = !soundOn; if (soundOn) startAudio(); }
    blockedAtPress = false; label();
  });
  label();
  const unlock = () => { if (soundOn) startAudio(); };
  ['pointerdown', 'touchstart', 'keydown'].forEach(t => root.addEventListener(t, unlock, { capture: true, passive: true }));
  document.addEventListener('keydown', unlock, { capture: true });
  setTimeout(() => { if (!done) $('.zi-gate').focus({ preventScroll: true }); }, 50);

  function placeBurst() {
    const em = parseFloat(getComputedStyle(stage).fontSize);
    const rects = [...stage.querySelectorAll('.zi-line')].map(line => {
      const w = line.querySelector('.zi-word'), l = line.offsetLeft + w.offsetLeft, t = line.offsetTop + w.offsetTop;
      return { l, t, r: l + w.offsetWidth + .05 * em, b: t + w.offsetHeight + .05 * em };
    });
    const cx = (Math.min(...rects.map(r => r.l)) + Math.max(...rects.map(r => r.r))) / 2;
    const cy = (Math.min(...rects.map(r => r.t)) + Math.max(...rects.map(r => r.b))) / 2;
    const dist = (x, y) => Math.min(...rects.map(r => Math.hypot(Math.max(r.l - x, 0, x - r.r), Math.max(r.t - y, 0, y - r.b))));
    const need = .44 * em * .6 + GAP * em;
    const reach = deg => { const a = deg * Math.PI / 180; let d = 0;
      while (dist(cx + d * Math.cos(a), cy + d * Math.sin(a)) < need && d < 4000) d += 1; return d; };
    // mirror pairs (left/right of centre) use the same distance so the layout is symmetrical
    const mirror = deg => ((180 - deg + 540) % 360) - 180;
    burst.querySelectorAll('i').forEach((ic, k) => {
      const deg = ANGLES[k], a = deg * Math.PI / 180, d = Math.max(reach(deg), reach(mirror(deg)));
      const x = cx + d * Math.cos(a), y = cy + d * Math.sin(a);
      ic.style.setProperty('--sx', cx + 'px'); ic.style.setProperty('--sy', cy + 'px');
      ic.style.setProperty('--x', (x - cx).toFixed(1) + 'px'); ic.style.setProperty('--y', (y - cy).toFixed(1) + 'px');
      ic.style.setProperty('--r', TILTS[k] + 'deg');
    });
  }

  /* ---------- the sequence ---------- */
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function typeTo(word, from, to) {
    let i = 0; while (i < from.length && i < to.length && from[i] === to[i]) i++;
    let s = from;
    while (s.length > i) { if (done) return; s = s.slice(0, -1); word.textContent = s; SFX.key(true); await sleep(T.del); }
    while (s.length < to.length) { if (done) return; s = to.slice(0, s.length + 1); word.textContent = s; SFX.key(false); await sleep(T.type); }
  }
  function lockWidth() { stage.style.width = ''; }   // lines are centred, so no fixed width is needed
  async function play() {
    // lock the block to the final width so the name doesn't slide sideways while typing
    lockWidth(); if (document.fonts) document.fonts.ready.then(lockWidth);   // re-measure if the font arrives late
    cam.classList.add('zi-roll');
    await sleep(T.startPause);
    const lines = [...stage.querySelectorAll('.zi-line')];
    for (const n of [1, 0]) {   // Zuberi first, then Zidan (Zidan asked for this order)
      const line = lines[n], word = line.querySelector('.zi-word'), caret = line.querySelector('.zi-caret'),
            x = line.querySelector('.zi-x'), glow = line.querySelector('.zi-glow');
      caret.classList.add('zi-typing');
      let cur = '';
      for (let guess of LINES[n].tries) {
        if (Array.isArray(guess)) {   // fix it like a person would: add the E, then go back and drop the A
          for (const step of guess.slice(0, -1)) { await sleep(T.type); if (done) return; word.textContent = step; SFX.key(step.length < cur.length); cur = step; }
          await sleep(T.type * 2); if (done) return; guess = guess[guess.length - 1]; word.textContent = guess; cur = guess; SFX.key(true); await sleep(T.del);
        }
        await typeTo(word, cur, guess); cur = guess; if (done) return;
        word.classList.add('zi-wrong'); x.className = 'zi-x'; void x.offsetWidth; x.className = 'zi-x zi-show'; SFX.wrong();
        line.classList.remove('zi-shake'); void line.offsetWidth; line.classList.add('zi-shake');
        await sleep(T.xHold); if (done) return;
        word.classList.remove('zi-wrong'); x.className = 'zi-x';
      }
      const ans = LINES[n].answer;
      if (cur.length > ans.length && cur.startsWith(ans)) {
        // the last try only has extra letters: slash them out before deleting (ZIDANE -> ZIDAN)
        // the extra letter gets scared, trembles, then a blade slices it in two
        const extra = cur.slice(ans.length); word.textContent = ans;
        const cut = document.createElement('span'); cut.className = 'zi-cut';
        cut.innerHTML = `<span class="zi-half zi-a">${extra}</span><span class="zi-half zi-b">${extra}</span><span class="zi-blade"></span>`;
        word.appendChild(cut); caret.classList.remove('zi-typing'); void cut.offsetWidth; cut.classList.add('zi-go'); SFX.gulp();
        await sleep(T.cut * .62); if (done) return; SFX.shwing();
        await sleep(T.cut * .38); if (done) return;
        word.textContent = ans; cur = ans; caret.classList.add('zi-typing'); await sleep(T.afterOk);
      }
      await typeTo(word, cur, LINES[n].answer); if (done) return;
      caret.classList.remove('zi-typing'); line.classList.remove('zi-shake');
      glow.style.width = `calc(${word.offsetWidth}px + .24em)`;
      glow.classList.add('zi-go'); word.classList.add('zi-ok'); SFX.right();
      punch.classList.remove('zi-go'); void punch.offsetWidth; punch.classList.add('zi-go');
      await sleep(T.glow * .55); word.classList.remove('zi-ok');
      await sleep(T.afterOk);
    }
    await sleep(T.glow * .45); if (done) return;
    lines.forEach(l => { const w = l.querySelector('.zi-word'); w.dataset.text = w.textContent; });
    lockWidth(); stage.classList.add('zi-final');
    placeBurst(); root.classList.add('zi-pop'); ICONS.forEach((_, n) => SFX.pop(n));
    await sleep(T.linger);
    finish();
  }

  const fontReady = document.fonts && document.fonts.load ? document.fonts.load('800 1em Unbounded').catch(() => {}) : Promise.resolve();
  // wait for "Click to enter": that click starts the sound and the intro together
  const gate = $('.zi-gate');
  gate.addEventListener('click', () => {
    soundOn = true; startAudio();
    if (ac && !ac._ziLabel) { ac._ziLabel = true; ac.addEventListener('statechange', label); }
    label();
    root.classList.remove('zi-waiting');
    gate.classList.add('zi-gone'); setTimeout(() => gate.remove(), 400);
    $('.zi-skip').focus({ preventScroll: true });
    Promise.race([fontReady, sleep(1500)]).then(() => { if (!done) play(); });
  }, { once: true });
})();
