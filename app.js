'use strict';
/* SHASHI – app di studio gratuita, senza pubblicità. Tutto gira nel browser. */

// ---------- utilità ----------
const empty = (ico, title, text, btn = '') => `<div class="empty"><div class="eico">${ico}</div><b>${title}</b><p class="muted">${text}</p>${btn}</div>`;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const iso = d => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const pad = n => String(n).padStart(2, '0');
function toast(m, ms = 3200) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), ms); }

// ---------- traduzioni (le etichette mancanti ricadono su inglese/italiano) ----------
const I = {
  it: { shanti: 'Spazio Shanti', todo: 'Da fare', planner: 'Pianificatore', timer: 'Timer', music: 'Musica', calendar: 'Calendario', notes: 'Appunti e cartelle', cards: 'Flashcard', games: 'Giochi', map: 'Mappa concettuale', podcast: 'Podcast', exercises: 'Esercizi', oral: 'Interrogazione AI', methods: 'Metodi di studio', grades: 'Voti', stats: 'Statistiche', settings: 'Profilo e impostazioni', left: 'Organizza', right: 'Studia', save: 'Salva', generate: 'Genera', start: 'Avvia', pause: 'Pausa', reset: 'Reset', add: 'Aggiungi', del: 'Elimina', newFolder: 'Nuova cartella', note: 'Appunto', signin: 'Accedi con Google', signout: 'Esci', school: 'Scuola', city: 'Città', country: 'Paese', name: 'Nome', lang: 'Lingua', hwTomorrow: 'Compiti per domani', lv1: 'Elementari', lv2: 'Medie', lv3: 'Superiori', lv4: 'Università', ex0: 'Nessun esempio', exFew: 'Pochi esempi', exMany: 'Tanti esempi', pages: 'Pagine', from: 'da', to: 'a', level: 'Livello', examples: 'Esempi', images: 'Immagini', noNotes: 'Crea prima un appunto nella sezione "Appunti e cartelle".' },
  en: { shanti: 'Shanti space', todo: 'To-do', planner: 'Planner', timer: 'Timer', music: 'Music', calendar: 'Calendar', notes: 'Notes & folders', cards: 'Flashcards', games: 'Games', map: 'Concept map', podcast: 'Podcast', exercises: 'Exercises', oral: 'AI oral exam', methods: 'Study methods', grades: 'Grades', stats: 'Stats', settings: 'Profile & settings', left: 'Organize', right: 'Study', save: 'Save', generate: 'Generate', start: 'Start', pause: 'Pause', reset: 'Reset', add: 'Add', del: 'Delete', newFolder: 'New folder', note: 'Note', signin: 'Sign in with Google', signout: 'Sign out', school: 'School', city: 'City', country: 'Country', name: 'Name', lang: 'Language', hwTomorrow: 'Homework for tomorrow', lv1: 'Elementary', lv2: 'Middle school', lv3: 'High school', lv4: 'University', ex0: 'No examples', exFew: 'Few examples', exMany: 'Many examples', pages: 'Pages', from: 'from', to: 'to', level: 'Level', examples: 'Examples', images: 'Images', noNotes: 'Create a note first in "Notes & folders".' },
  es: { planner: 'Planificador', timer: 'Temporizador', music: 'Música', calendar: 'Calendario', notes: 'Apuntes y carpetas', cards: 'Tarjetas', games: 'Juegos', map: 'Mapa conceptual', podcast: 'Podcast', exercises: 'Ejercicios', oral: 'Examen oral IA', methods: 'Métodos de estudio', grades: 'Notas', stats: 'Estadísticas', settings: 'Perfil y ajustes', left: 'Organiza', right: 'Estudia', save: 'Guardar', generate: 'Generar', signin: 'Entrar con Google', signout: 'Salir' },
  fr: { planner: 'Planificateur', timer: 'Minuteur', music: 'Musique', calendar: 'Calendrier', notes: 'Notes et dossiers', cards: 'Cartes', games: 'Jeux', map: 'Carte conceptuelle', podcast: 'Podcast', exercises: 'Exercices', oral: 'Oral IA', methods: "Méthodes d'étude", grades: 'Notes', stats: 'Statistiques', settings: 'Profil et réglages', left: 'Organiser', right: 'Étudier', save: 'Enregistrer', generate: 'Générer', signin: 'Connexion Google', signout: 'Déconnexion' },
  de: { planner: 'Planer', timer: 'Timer', music: 'Musik', calendar: 'Kalender', notes: 'Notizen & Ordner', cards: 'Karteikarten', games: 'Spiele', map: 'Mindmap', podcast: 'Podcast', exercises: 'Übungen', oral: 'KI-Prüfung', methods: 'Lernmethoden', grades: 'Noten', stats: 'Statistik', settings: 'Profil & Einstellungen', left: 'Organisieren', right: 'Lernen', save: 'Speichern', generate: 'Erzeugen', signin: 'Mit Google anmelden', signout: 'Abmelden' }
};
const LN = { it: 'italiano', en: 'English', es: 'español', fr: 'français', de: 'Deutsch' };
const t = k => (I[CFG.lang] && I[CFG.lang][k]) || I.en[k] || I.it[k] || k;

// ---------- stato ----------
let CFG = { lang: 'it', clientId: '', apiKey: '', argoUrl: 'https://www.portaleargo.it/auth/sso/login/?login_challenge=630ec46e5216442cbdcbbb884197da26' };
if (!I[CFG.lang]) CFG.lang = 'it';
try { Object.assign(CFG, JSON.parse(localStorage.getItem('shashi_cfg') || '{}')); } catch { }
let USER = null; try { USER = JSON.parse(localStorage.getItem('shashi_user') || 'null'); } catch { }
let S;
const defaults = () => ({
  profile: { name: '', school: '', city: '', country: '' },
  todos: [], goal: 120, xp: 0, cnt: { sessions: 0, deep: 0, tasks: 0, perfect: 0, maps: 0, pods: 0, rituals: 0, breath: 0 }, badges: [], focusTask: '', shanti: null, subjStats: {}, lastSubject: '', timetable: {}, folders: [{ id: 'f0', name: 'Generale' }], notes: [], events: [], homework: [], cards: [], grades: [], stats: {},
  settings: { work: 25, brk: 5, long: 15, cycles: 4 }, method: '',
  sel: { note: '', from: 1, to: 999, level: 'lv3', ex: 'exFew', img: true }
});
const key = () => 'shashi_v1_' + (USER ? USER.email : 'guest');
function load() {
  const d = defaults(); let o = {};
  try { o = JSON.parse(localStorage.getItem(key()) || '{}'); } catch { }
  S = Object.assign(d, o);
  S.settings = Object.assign(defaults().settings, S.settings); S.cnt = Object.assign(defaults().cnt, S.cnt || {}); S.sel = Object.assign(defaults().sel, S.sel); S.profile = Object.assign(defaults().profile, S.profile);
}
function save() { try { localStorage.setItem(key(), JSON.stringify(S)); } catch (e) { toast('Memoria piena: elimina qualche immagine o esporta un backup.'); } }
function saveCfg() { localStorage.setItem('shashi_cfg', JSON.stringify(CFG)); }

// ---------- tema che cambia ogni giorno ----------
const THEMES = [
  ['#ff5e8a', '#ffb347', '#fff0f5', '#fff4e0'], ['#7c4dff', '#00c2ff', '#f1ecff', '#e4f7ff'], ['#00b894', '#fdcb6e', '#e6fff7', '#fff8e1'],
  ['#ff7043', '#ec407a', '#fff0ea', '#ffe8f1'], ['#2979ff', '#00e5a8', '#e8f1ff', '#e3fff6'], ['#e91e63', '#7e57c2', '#ffeaf3', '#f0e9ff'],
  ['#f9a825', '#43a047', '#fffbe6', '#eaffea'], ['#00acc1', '#ff6f91', '#e2fbff', '#fff0f4']
];
function applyTheme() {
  const day = Math.floor(new Date().setHours(0, 0, 0, 0) / 864e5);
  const th = THEMES[day % THEMES.length], r = document.documentElement.style;
  r.setProperty('--a', th[0]); r.setProperty('--b', th[1]); r.setProperty('--bg1', CFG.dark ? '#14141f' : th[2]); r.setProperty('--bg2', CFG.dark ? '#1d1d2e' : th[3]);
  document.documentElement.dataset.theme = CFG.dark ? 'dark' : 'light'; document.documentElement.style.fontSize = (CFG.fs || 100) + '%'; document.body.classList.toggle('dys', !!CFG.dys); const db = $('#darkBtn'); if (db) db.textContent = CFG.dark ? '☀️' : '🌙';
  const m = $('meta[name=theme-color]'); if (m) m.content = th[0];
}

// ---------- testo: pagine, parole chiave, frasi ----------
const STOP = new Set('che non per una con del della dei delle gli nel nella sono come anche questo questa più loro essere stato quando dove perché cosa tutti tutto quindi quella quello ogni sulla degli alla dalla mentre the and that with this from have they their which there were been into than then also each such these those about because while where'.split(' '));
const sents = x => x.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 25);
function kws(x, n = 8) { const f = {}; (x.toLowerCase().match(/\p{L}{5,}/gu) || []).forEach(w => { if (!STOP.has(w)) f[w] = (f[w] || 0) + 1; }); return Object.entries(f).sort((a, b) => b[1] - a[1]).slice(0, n).map(e => e[0]); }
const short = (s, n = 70) => s.length > n ? s.slice(0, n - 1).trim() + '…' : s;
function splitPages(text) {
  text = text || ''; if (text.includes('\f')) return text.split('\f').map(s => s.trim()).filter(Boolean);
  const pages = []; let cur = '';
  for (const p of text.split(/\n{2,}/)) { if ((cur + p).length > 1800 && cur) { pages.push(cur.trim()); cur = ''; } cur += p + '\n\n'; }
  if (cur.trim()) pages.push(cur.trim()); return pages;
}
function parseJSON(s) { if (!s) return null; const m = s.match(/[\[{][\s\S]*[\]}]/); if (!m) return null; try { return JSON.parse(m[0]); } catch { return null; } }
const LV = { lv1: 'scuola elementare (bambino di 6-10 anni)', lv2: 'scuola media (11-13 anni)', lv3: 'scuola superiore (14-19 anni)', lv4: 'università / adulto' };

// ---------- intelligenza artificiale (chiave personale, opzionale) ----------
const hasAI = () => !!(CFG.openaiKey || CFG.apiKey);
const TUTOR = 'Sei un tutor esperto in TUTTE le materie scolastiche e universitarie (matematica, fisica, chimica, biologia, scienze, italiano, letteratura, storia, geografia, filosofia, inglese e altre lingue, latino, greco, informatica, arte, musica, diritto, economia, educazione civica). Rispondi con precisione. Quando correggi: indica OGNI errore commesso, spiega perché è sbagliato e mostra la correzione PASSO PER PASSO (Passo 1, Passo 2…), con calcoli e ragionamenti completi. Se c\'è una foto, leggila con attenzione.';
async function aiChat(system, messages, max = 4000) {
  if (CFG.openaiKey) {
    const msgs = [{ role: 'system', content: TUTOR + '\n' + system }, ...messages.map(m => m.images && m.images.length ? { role: m.role, content: [{ type: 'text', text: m.content }, ...m.images.map(u => ({ type: 'image_url', image_url: { url: u } }))] } : { role: m.role, content: m.content })];
    const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + CFG.openaiKey }, body: JSON.stringify({ model: CFG.openaiModel || 'gpt-4o', messages: msgs, max_tokens: max }) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error?.message || 'Errore OpenAI');
    return d.choices[0].message.content || '';
  }
  if (!CFG.apiKey) return null;
  const am = messages.map(m => { const im = (m.images || []).map(u => /^data:([^;]+);base64,(.+)$/.exec(u)).filter(Boolean).map(x => ({ type: 'image', source: { type: 'base64', media_type: x[1], data: x[2] } })); return { role: m.role, content: im.length ? [...im, { type: 'text', text: m.content }] : m.content }; });
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': CFG.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model: 'claude-sonnet-5-5', max_tokens: max, system: TUTOR + '\n' + system, messages: am })
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error?.message || 'Errore AI');
  return d.content.map(c => c.text || '').join('');
}
const aiText = (system, user, max) => aiChat(system, [{ role: 'user', content: user }], max);
function styleNote(g) {
  return `Lingua della risposta: ${LN[CFG.lang]}. Livello dello studente: ${LV[g.level]}. Spiega in modo semplice e chiaro, con parole adatte al livello. ` +
    (g.ex === 'ex0' ? 'Non inserire esempi.' : g.ex === 'exFew' ? 'Inserisci pochi esempi (uno per i concetti principali).' : 'Inserisci tanti esempi concreti (almeno tre per concetto).');
}

// ---------- selezione appunto/pagine/opzioni (comune a mappa, podcast, esercizi, interrogazione) ----------
function ctl() {
  const s = S.sel;
  if (!S.notes.length) return `<div class="card">${t('noNotes')} <button class="btn" onclick="go('notes')">${t('notes')}</button></div>`;
  const lv = ['lv1', 'lv2', 'lv3', 'lv4'], ex = ['ex0', 'exFew', 'exMany'];
  return `<div class="card"><div class="row">
  <label>${t('note')}<select id="c-note">${S.notes.map(n => `<option value="${n.id}" ${n.id === s.note ? 'selected' : ''}>${esc(n.title)}</option>`).join('')}</select></label>
  <label>${t('pages')} ${t('from')}<input id="c-from" type="number" min="1" value="${s.from}" style="width:80px"></label>
  <label>${t('to')}<input id="c-to" type="number" min="1" value="${s.to}" style="width:80px"></label>
  <label>${t('level')}<select id="c-level">${lv.map(k => `<option value="${k}" ${s.level === k ? 'selected' : ''}>${t(k)}</option>`).join('')}</select></label>
  <label>${t('examples')}<select id="c-ex">${ex.map(k => `<option value="${k}" ${s.ex === k ? 'selected' : ''}>${t(k)}</option>`).join('')}</select></label>
  <label style="flex-direction:row;align-items:center"><input id="c-img" type="checkbox" ${s.img ? 'checked' : ''}>&nbsp;${t('images')}</label>
  </div><div id="c-pg" class="muted"></div></div>`;
}
function wireCtl() {
  const upd = () => {
    const n = S.notes.find(x => x.id === $('#c-note')?.value); if (!n) return;
    S.sel.note = n.id; S.sel.from = +$('#c-from').value || 1; S.sel.to = +$('#c-to').value || 999;
    S.sel.level = $('#c-level').value; S.sel.ex = $('#c-ex').value; S.sel.img = $('#c-img').checked; save();
    $('#c-pg').textContent = `${t('pages')}: ${splitPages(n.text).length} · ${n.images.length} ${t('images').toLowerCase()}`;
  };
  $$('#c-note,#c-from,#c-to,#c-level,#c-ex,#c-img').forEach(e => e.onchange = upd); if ($('#c-note')) upd();
}
function getSel() {
  const n = S.notes.find(x => x.id === S.sel.note) || S.notes[0];
  if (!n) { toast(t('noNotes')); return null; }
  const pages = splitPages(n.text); if (!pages.length) { toast('L\'appunto è vuoto.'); return null; }
  const from = Math.max(1, S.sel.from), to = Math.min(pages.length, Math.max(from, S.sel.to));
  return { note: n, pages: pages.slice(from - 1, to), text: pages.slice(from - 1, to).join('\n\n'), level: S.sel.level, ex: S.sel.ex, img: S.sel.img, from, to };
}
const busy = (el, m) => { el.innerHTML = `<div class="card"><span class="spin"></span> ${esc(m)}</div>`; };
const needNote = () => S.notes.length ? '' : '';

// ---------- timer ----------
const TM = { mode: 'work', left: 1500, end: 0, run: false, cycle: 1, iv: null };
const dur = m => (m === 'work' ? S.settings.work : m === 'brk' ? S.settings.brk : S.settings.long) * 60;
function resetTimer() { clearInterval(TM.iv); TM.run = false; TM.mode = 'work'; TM.cycle = 1; TM.left = dur('work'); updTimer(); }
let ringRaf = 0;
function setRing(frac) { const r = $('#tmRing'); if (!r) return; r.style.strokeDashoffset = 339.3 * (1 - Math.max(0, Math.min(1, frac))); r.style.stroke = TM.mode === 'work' ? 'var(--a)' : '#2a9d4a'; }
function ringUpd() {
  const w = $('.ringwrap'); if (!w) return; w.classList.toggle('run', TM.run);
  if (TM.run) {
    if (!ringRaf) { const loop = () => { if (!TM.run || !$('#tmRing')) { ringRaf = 0; return; } setRing((TM.end - Date.now()) / 1000 / (dur(TM.mode) || 1)); ringRaf = requestAnimationFrame(loop); }; ringRaf = requestAnimationFrame(loop); }
  } else setRing(TM.left / (dur(TM.mode) || 1));
}
let WL = null;
async function keepAwake(on) { try { if (on && 'wakeLock' in navigator && !WL) { WL = await navigator.wakeLock.request('screen'); WL.addEventListener('release', () => WL = null); } else if (!on && WL) { await WL.release(); WL = null; } } catch { } }
function toggleTimer() {
  if (TM.run) { clearInterval(TM.iv); TM.run = false; if (S.settings.follow) noise('off'); }
  else { TM.run = true; if (S.settings.follow && S.settings.ambient && S.settings.ambient !== 'off') noise(S.settings.ambient); TM.end = Date.now() + TM.left * 1000; TM.iv = setInterval(tick, 500); if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); }
  updTimer();
}
function tick() {
  TM.left = Math.max(0, Math.round((TM.end - Date.now()) / 1000));
  if (TM.left <= 0) {
    beep();
    if (TM.mode === 'work') { S.cnt.sessions++; if (S.settings.work >= 50) S.cnt.deep++; addMin(S.settings.work); addSubj(S.settings.work); if (TM.cycle >= S.settings.cycles) { TM.mode = 'long'; TM.cycle = 1; } else { TM.mode = 'brk'; TM.cycle++; } }
    else TM.mode = 'work';
    TM.left = dur(TM.mode); TM.end = Date.now() + TM.left * 1000;
    const msg = TM.mode === 'work' ? '📚 Si torna a studiare!' : '☕ Pausa! ' + TIPS[Math.floor(Math.random() * TIPS.length)];
    toast(msg); notify('SHASHI', msg); vibrate(); flashTitle(msg);
  }
  updTimer();
}
const fmt = s => pad(Math.floor(s / 60)) + ':' + pad(s % 60);
const MODE = { work: '📚 Studio', brk: '☕ Pausa breve', long: '🌴 Pausa lunga' };
function updTimer() {
  $('#hdrTimer').textContent = (TM.run ? '▶ ' : '⏱️ ') + fmt(TM.left); if (!FLASH) document.title = (TM.run && S.settings.tabt !== false) ? fmt(TM.left) + ' · SHASHI' : 'SHASHI'; keepAwake(TM.run); ringUpd();
  if ($('#tmDisp')) { $('#tmDisp').textContent = fmt(TM.left); $('#tmMode').textContent = MODE[TM.mode] + ` · ${TM.cycle}/${S.settings.cycles}`; $('#tmBtn').textContent = TM.run ? '⏸ ' + t('pause') : '▶ ' + t('start'); }
}
function beep() {
  if (S.settings.sound === false) return;
  try {
    const c = noiseCtx || (noiseCtx = new (window.AudioContext || window.webkitAudioContext)()); if (c.state === 'suspended') c.resume();
    const now = c.currentTime, g = c.createGain(); g.gain.setValueAtTime(.3, now); g.gain.exponentialRampToValueAtTime(.0001, now + 2.4); g.connect(c.destination);
    [[528, 264], [1056, 528]].forEach(([f0, f1]) => { const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f0, now); o.frequency.exponentialRampToValueAtTime(f1, now + 2.2); o.connect(g); o.start(now); o.stop(now + 2.5); });
  } catch { }
}
function notify(a, b) { try { if (S.settings.nat !== false && 'Notification' in window && Notification.permission === 'granted') new Notification(a, { body: b, icon: 'icon-192.png', badge: 'icon-192.png', vibrate: [200, 100, 200] }); } catch { } }
function vibrate(p) { try { if (S.settings.vib !== false && 'vibrate' in navigator) navigator.vibrate(p || [300, 150, 300, 150, 500]); } catch { } }
let FLASH = null;
function flashTitle(msg) {
  if (S.settings.tabt === false || !document.hidden) return; clearInterval(FLASH); let n = 0;
  FLASH = setInterval(() => { document.title = n++ % 2 ? 'SHASHI' : '🔔 ' + msg; if (!document.hidden || n > 30) { clearInterval(FLASH); FLASH = null; updTimer(); } }, 900);
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && FLASH) { clearInterval(FLASH); FLASH = null; updTimer(); } });
function animMap() {
  $$('#mapSvg line').forEach((l, i) => l.style.animationDelay = (.15 + i * .035) + 's');
  const gs = $$('#mapSvg g'); gs.forEach((g, i) => g.style.animationDelay = (i === gs.length - 1 ? 0 : .25 + i * .05) + 's');
}
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas'); c.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:200'; c.width = innerWidth; c.height = innerHeight; document.body.appendChild(c);
  const x = c.getContext('2d'), cols = ['#ff5e8a', '#ffb347', '#00c2ff', '#7c4dff', '#00b894', '#fdcb6e'];
  const P = Array.from({ length: 150 }, () => ({ x: c.width / 2 + (Math.random() - .5) * 220, y: c.height * .35, vx: (Math.random() - .5) * 15, vy: -Math.random() * 15 - 4, s: 6 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - .5) * .4, col: cols[Math.floor(Math.random() * cols.length)] }));
  let f = 0; (function step() { x.clearRect(0, 0, c.width, c.height); P.forEach(q => { q.vy += .35; q.x += q.vx; q.y += q.vy; q.r += q.vr; x.save(); x.translate(q.x, q.y); x.rotate(q.r); x.fillStyle = q.col; x.fillRect(-q.s / 2, -q.s / 3, q.s, q.s * .6); x.restore(); }); if (++f < 150) requestAnimationFrame(step); else c.remove(); })();
}
const lvl = () => Math.floor(Math.sqrt((S.xp || 0) / 40)) + 1;
function showXp() { const el = $('#xpPill'); if (!el) return; const L = lvl(), lo = 40 * (L - 1) ** 2, hi = 40 * L ** 2, pc = Math.max(0, Math.min(100, ((S.xp || 0) - lo) / (hi - lo) * 100)); el.innerHTML = '⭐ Lv ' + L + '<span class="lbl"> · ' + (S.xp || 0) + ' XP</span><i class="xpbar"><b style="width:' + pc.toFixed(0) + '%"></b></i>'; el.title = (hi - (S.xp || 0)) + ' XP al livello ' + (L + 1); }
function addXp(n) { const b = lvl(); S.xp = (S.xp || 0) + n; save(); showXp(); if (lvl() > b) confetti(); if (lvl() > b) toast('🎉 Livello ' + lvl() + ' raggiunto! Continua così!', 6000); checkBadges(); }
const TIPS = ["Bevi un bicchiere d'acqua 💧", 'Alzati e fai stretching 🤸', 'Guarda lontano fuori dalla finestra 👀', 'Fai 5 respiri profondi 🌬️', 'Lascia il telefono: riposa gli occhi 😌'];
function subjList() {
  const set = new Set(); Object.values(S.timetable).forEach(v => String(v || '').split(',').forEach(x => x.trim() && set.add(x.trim())));
  S.notes.forEach(n => n.subject && set.add(n.subject)); S.events.forEach(e => e.subject && set.add(e.subject)); return [...set];
}
function addSubj(m) { const k = S.lastSubject || 'Generale'; S.subjStats[k] = (S.subjStats[k] || 0) + m; save(); }
function addMin(m) { if (m > 0) addXp(m); const d = iso(new Date()), before = S.stats[d] || 0; S.stats[d] = before + m; save(); const g = S.goal || 120; if (m > 0 && before < g && S.stats[d] >= g) { confetti(); toast('🎯 Obiettivo di oggi raggiunto! Bravo/a!', 6000); notify('SHASHI', '🎯 Obiettivo raggiunto!'); } }

// ---------- musica ----------
const STATIONS = [
  ['🌿 Groove Salad (ambient/downtempo)', 'https://ice1.somafm.com/groovesalad-128-mp3'],
  ['🌌 Deep Space One (ambient profondo)', 'https://ice1.somafm.com/deepspaceone-128-mp3'],
  ['🧘 Drone Zone (concentrazione totale)', 'https://ice1.somafm.com/dronezone-128-mp3'],
  ['🚀 Space Station Soma (elettronica soft)', 'https://ice1.somafm.com/spacestation-128-mp3'],
  ['🌸 Lush (voci morbide)', 'https://ice1.somafm.com/lush-128-mp3'],
  ['💧 Fluid (strumentale hip-hop / lo-fi)', 'https://ice1.somafm.com/fluid-128-mp3']
];
const player = new Audio(); player.preload = 'none'; player.crossOrigin = 'anonymous';
let noiseCtx = null, noiseNodes = [], noiseGain = null, noiseTimer = null;
function noiseStop() { clearInterval(noiseTimer); noiseTimer = null; noiseNodes.forEach(n => { try { n.stop(); } catch { } try { n.disconnect(); } catch { } }); noiseNodes = []; }
function noise(type) {
  noiseStop(); if (type === 'off') return;
  noiseCtx = noiseCtx || new (window.AudioContext || window.webkitAudioContext)(); if (noiseCtx.state === 'suspended') noiseCtx.resume();
  const c = noiseCtx; noiseGain = c.createGain(); noiseGain.gain.value = player.volume * .3; noiseGain.connect(c.destination); noiseNodes.push(noiseGain);
  const mk = kind => { const len = c.sampleRate * 3, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0); let last = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; d[i] = kind === 'brown' ? (last = (last + .02 * w) / 1.02) * 3.5 : w; } const sr = c.createBufferSource(); sr.buffer = buf; sr.loop = true; noiseNodes.push(sr); return sr; };
  const filt = (src, hz) => { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = hz; src.connect(f); f.connect(noiseGain); src.start(); };
  if (type === 'white') filt(mk('white'), 8000);
  else if (type === 'rain') filt(mk('white'), 1800);
  else if (type === 'brown') filt(mk('brown'), 8000);
  else if (type === 'night') { filt(mk('brown'), 350); const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = 110; g.gain.value = .25; o.connect(g); g.connect(noiseGain); o.start(); noiseNodes.push(o); }
  else if (type === 'zen') {
    const g = c.createGain(); g.gain.value = .001; g.connect(noiseGain);
    [55, 110].forEach(f => { const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.connect(g); o.start(); noiseNodes.push(o); });
    const pulse = () => { const t = c.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(.001, t); g.gain.linearRampToValueAtTime(1.2, t + .15); g.gain.exponentialRampToValueAtTime(.001, t + 1.4); }; pulse(); noiseTimer = setInterval(pulse, 2200);
  }
}

// ---------- pannelli ----------
const panels = {};
let cur = 'planner';
const NAV_L = ['planner', 'timer', 'music', 'calendar', 'todo', 'notes', 'cards'];
const NAV_R = ['map', 'podcast', 'exercises', 'oral', 'methods', 'shanti', 'grades', 'stats', 'settings'];
const ICON = { planner: '🗓️', shanti: '🌌', todo: '✅', timer: '⏱️', music: '🎧', calendar: '📅', notes: '📁', cards: '🃏', games: '🎮', map: '🕸️', podcast: '🎙️', exercises: '✏️', oral: '🗣️', methods: '🧠', grades: '📊', stats: '🔥', settings: '⚙️' };
function buildNav() {
  const mk = k => `<button class="nav ${cur === k ? 'on' : ''}" data-go="${k}">${ICON[k]} ${t(k)}</button>`;
  $('#left').innerHTML = `<h4>${t('left')}</h4>` + NAV_L.map(mk).join('') + `<button class="nav games ${cur === 'games' ? 'on' : ''}" data-go="games">${ICON.games} ${t('games')}</button>`;
  $('#right').innerHTML = `<h4>${t('right')}</h4>` + NAV_R.map(mk).join('');
  const SHORT = { planner: 'Piano', timer: 'Timer', notes: 'Appunti', exercises: 'Esercizi' };
  $('#tabbar').innerHTML = ['planner', 'timer', 'notes', 'exercises'].map(k => `<button class="tab ${cur === k ? 'on' : ''}" data-go="${k}"><span>${ICON[k]}</span><small>${SHORT[k]}</small></button>`).join('') + `<button class="tab ${['planner', 'timer', 'notes', 'exercises'].includes(cur) ? '' : 'on'}" id="menuBtn"><span>☰</span><small>Menu</small></button>`;
  const shBtn = k => `<button class="it ${cur === k ? 'on' : ''}" data-go="${k}"><span>${ICON[k]}</span>${esc(t(k))}</button>`;
  $('#sheet').innerHTML = `<div class="grab"></div><h4>${t('left')}</h4><div class="grid">${NAV_L.map(shBtn).join('')}</div><h4>${t('right')}</h4><div class="grid">${NAV_R.map(shBtn).join('')}</div><h4>Altro</h4><div class="grid"><button class="it ${cur === 'games' ? 'on' : ''}" data-go="games"><span>🎮</span>${t('games')}</button><a class="it" href="${esc(CFG.argoUrl)}" target="_blank" rel="noopener"><span>📚</span>Portale Argo</a><button class="it" id="shSearch"><span>🔍</span>Cerca</button></div>`;
  $$('[data-go]').forEach(b => b.onclick = () => go(b.dataset.go));
  $('#menuBtn').onclick = openSheet; $('#shSearch').onclick = () => { closeSheet(); openPalette(); };
  const av = S.profile.avatar || '👤'; $('#userBtn').innerHTML = av + '<span class="lbl"> ' + esc(USER ? (USER.name || '').split(' ')[0] : t('signin').split(' ')[0]) + '</span>';
  $('#argoBtn').href = CFG.argoUrl; $('#userBtn').onclick = () => go('settings');
  document.documentElement.lang = CFG.lang; showXp();
}
function openSheet() { $('#sheetBg').classList.add('on'); $('#sheet').classList.add('on'); }
function closeSheet() { const a = $('#sheetBg'), b = $('#sheet'); if (a) a.classList.remove('on'); if (b) b.classList.remove('on'); }
function go(k) { closeSheet(); if (document.body.classList.contains('speaking')) stopSpeak(); cur = k; buildNav(); panels[k](); { const m = $('#main'); m.classList.remove('enter'); void m.offsetWidth; m.classList.add('enter'); clearTimeout(go.t); go.t = setTimeout(() => m.classList.remove('enter'), 2200); } window.scrollTo({ top: 0, behavior: 'smooth' }); }
window.go = go;
const main = () => $('#main');

// ---- Pianificatore ----
const dayName = d => new Date(2024, 0, 1 + ((d + 6) % 7)).toLocaleDateString(CFG.lang, { weekday: 'long' });
panels.planner0 = () => {
  const order = [1, 2, 3, 4, 5, 6, 0], tom = iso(addDays(new Date(), 1));
  main().innerHTML = `<div class="card"><h2>🗓️ ${t('planner')}</h2><p class="muted">Inserisci le materie di ogni giorno separate da virgola (es. Matematica, Storia). SHASHI crea il piano di studio per il giorno scelto, dando più spazio alle materie con verifiche o interrogazioni vicine.</p>
  <div class="grid2">${order.map(d => `<label>${dayName(d)}<input class="tt" data-d="${d}" value="${esc(S.timetable[d] || '')}" placeholder="Matematica, Inglese…"></label>`).join('')}</div>
  <button class="btn" id="ttSave">${t('save')} orario</button></div>
  <div class="card"><h3>Genera piano di studio</h3><div class="row">
  <label>Per il giorno<input type="date" id="pDate" value="${tom}"></label>
  <label>Ore di studio<input type="number" id="pHours" value="2" min=".5" step=".5" style="width:90px"></label>
  <label>Inizio<input type="time" id="pStart" value="15:00"></label>
  <button class="btn" id="pGo">${t('generate')}</button></div><div id="pOut"></div></div>`;
  $('#ttSave').onclick = () => { $$('.tt').forEach(i => S.timetable[i.dataset.d] = i.value); save(); toast('Orario salvato ✔️'); };
  $('#pGo').onclick = () => {
    $$('.tt').forEach(i => S.timetable[i.dataset.d] = i.value); save();
    const date = $('#pDate').value, dow = new Date(date + 'T12:00').getDay(), subs = {};
    (S.timetable[dow] || '').split(',').map(s => s.trim()).filter(Boolean).forEach(s => subs[s] = 1);
    S.events.filter(e => /verifica|interrogazione/.test(e.type) && e.date >= date && e.subject).forEach(e => {
      const dd = (new Date(e.date) - new Date(date)) / 864e5; subs[e.subject] = (subs[e.subject] || 0) + (dd <= 3 ? 3 : dd <= 7 ? 2 : 1);
    });
    S.homework.filter(h => h.date === date).forEach(h => { Object.keys(subs).forEach(s => { if (h.text.toLowerCase().includes(s.toLowerCase())) subs[s] += 1; }); });
    const names = Object.keys(subs); if (!names.length) { $('#pOut').innerHTML = '<p>Nessuna materia per quel giorno: compila l\'orario.</p>'; return; }
    const total = +$('#pHours').value * 60, wsum = names.reduce((a, s) => a + subs[s], 0), W = S.settings.work, sessions = [];
    names.forEach(s => { const m = total * subs[s] / wsum, n = Math.max(1, Math.round(m / W)), l = Math.max(10, Math.round(m / n / 5) * 5); for (let i = 0; i < n; i++) sessions.push([s, l]); });
    let [h, m] = $('#pStart').value.split(':').map(Number), tt = h * 60 + m; const at = x => pad(Math.floor(x / 60) % 24) + ':' + pad(x % 60); let out = '';
    sessions.forEach(([s, l], i) => {
      out += `<div><span><b>${at(tt)}–${at(tt + l)}</b> 📚 ${esc(s)}</span><span class="badge">${l} min</span></div>`; tt += l;
      if (i < sessions.length - 1) { const p = (i + 1) % S.settings.cycles === 0 ? S.settings.long : S.settings.brk; out += `<div class="muted"><span>${at(tt)}–${at(tt + p)} ☕ pausa</span></div>`; tt += p; }
    });
    $('#pOut').innerHTML = `<div class="list">${out}</div><button class="btn" onclick="go('timer')">⏱️ ${t('start')} timer</button>`;
  };
};

// ---- Timer ----
panels.timer0 = () => {
  const s = S.settings;
  main().innerHTML = `<div class="card"><h2>⏱️ ${t('timer')}</h2><div id="tmMode" class="muted" style="text-align:center"></div><div class="ringwrap"><svg viewBox="0 0 120 120" class="ring"><circle cx="60" cy="60" r="54" class="rbg"/><circle id="tmRing" cx="60" cy="60" r="54" class="rfg"/></svg><div class="big" id="tmDisp"></div></div>
  <div style="text-align:center"><label>📖 Materia che stai studiando<input id="tmSubj" list="subjList" value="${esc(S.lastSubject || '')}" placeholder="Es. Matematica"><datalist id="subjList">${subjList().map(x => `<option value="${esc(x)}">`).join('')}</datalist></label> <label>🎯 Su cosa ti concentri adesso?<input id="tmTask" value="${esc(S.focusTask || '')}" placeholder="Es. esercizi pag. 120" style="min-width:230px"></label></div>
  <div class="row" style="justify-content:center"><button class="btn" id="tmBtn"></button><button class="btn alt" id="tmReset">${t('reset')}</button><button class="btn alt" id="tmSkip">⏭ Salta</button></div></div>
  <div class="card"><h3>Durate (minuti)</h3><div class="row">
  <label>Studio<input type="number" id="s-w" value="${s.work}" min="1" style="width:80px"></label>
  <label>Pausa breve<input type="number" id="s-b" value="${s.brk}" min="1" style="width:80px"></label>
  <label>Pausa lunga<input type="number" id="s-l" value="${s.long}" min="1" style="width:80px"></label>
  <label>Cicli prima della pausa lunga<input type="number" id="s-c" value="${s.cycles}" min="1" style="width:80px"></label>
  <button class="btn" id="s-save">${t('save')}</button></div>
  <div class="row"><button class="btn alt" data-p="25,5,15,4">Pomodoro 25/5</button><button class="btn alt" data-p="50,10,20,3">50/10</button><button class="btn alt" data-p="90,20,30,2">Deep work 90/20</button><button class="btn alt" data-p="15,3,10,4">Veloce 15/3</button></div>
  <p class="muted">Quando un periodo finisce suona un avviso e parte automaticamente la pausa (o lo studio).</p>
  <label style="flex-direction:row;align-items:center"><input type="checkbox" id="s-snd" ${s.sound !== false ? 'checked' : ''}>&nbsp;Suono a fine periodo</label> <button class="btn alt" id="s-fs">⛶ Schermo intero</button> <button class="btn alt" id="s-al">🔔 Avvisi e vibrazione</button></div>`;
  $('#tmBtn').onclick = toggleTimer; $('#tmReset').onclick = resetTimer;
  $('#tmTask').oninput = e => { S.focusTask = e.target.value; save(); };
  $('#tmSubj').oninput = e => { S.lastSubject = e.target.value.trim(); save(); };
  $('#s-snd').onchange = e => { S.settings.sound = e.target.checked; save(); }; $('#s-al').onclick = openAlerts;
  $('#s-fs').onclick = () => { const el = document.documentElement; (document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen && el.requestFullscreen()); };
  $('#tmSkip').onclick = () => { TM.left = 0; TM.end = Date.now(); if (!TM.run) { TM.run = true; TM.iv = setInterval(tick, 500); } tick(); };
  $('#s-save').onclick = () => { Object.assign(S.settings, { work: +$('#s-w').value || 25, brk: +$('#s-b').value || 5, long: +$('#s-l').value || 15, cycles: +$('#s-c').value || 4 }); save(); resetTimer(); toast('Timer aggiornato ✔️'); };
  $$('[data-p]').forEach(b => b.onclick = () => { const [w, br, l, c] = b.dataset.p.split(',').map(Number); Object.assign(S.settings, { work: w, brk: br, long: l, cycles: c }); save(); resetTimer(); panels.timer(); });
  updTimer();
};

// ---- Musica ----
panels.music = () => {
  main().innerHTML = `<div class="card"><h2>🎧 ${t('music')} per concentrarsi <span class="eq ${player.paused ? '' : 'on'}" id="eq"><i></i><i></i><i></i><i></i></span></h2><p class="muted">Radio online gratuite e senza pubblicità (SomaFM, ascolto libero), più suoni generati dall'app. Serve la connessione per le radio.</p>
  <div class="list">${STATIONS.map((s, i) => `<div><span>${s[0]}</span><button class="btn" data-st="${i}">▶</button></div>`).join('')}</div>
  <div class="row"><button class="btn alt" id="mStop">⏹ Stop radio</button><label>Volume<input type="range" id="mVol" min="0" max="1" step=".05" value="${player.volume}"></label></div>
  <label style="display:flex">Tuo link audio (mp3/stream)<input id="mUrl" placeholder="https://…" style="width:100%"></label><button class="btn" id="mPlay">▶ Riproduci link</button></div>
  <div class="card"><h3>Suoni di sottofondo (funzionano anche offline)</h3>
  <button class="btn alt" data-n="white">Rumore bianco</button><button class="btn alt" data-n="rain">🌧️ Pioggia</button><button class="btn alt" data-n="brown">Rumore marrone</button><button class="btn alt" data-n="night">🌌 Notte stellata</button><button class="btn alt" data-n="zen">🧘 Battito zen</button><button class="btn alt" data-n="off">Spegni</button>
  <label style="flex-direction:row;align-items:center;margin-top:10px"><input type="checkbox" id="mFollow" ${S.settings.follow ? 'checked' : ''}>&nbsp;🎧 Il suono parte e si ferma insieme al timer</label>
  <h3 style="margin-top:12px">⏲️ Spegni la musica dopo</h3><button class="btn alt" data-sl="15">15 min</button><button class="btn alt" data-sl="30">30 min</button><button class="btn alt" data-sl="60">60 min</button></div></div>`;
  $$('[data-st]').forEach(b => b.onclick = () => { player.src = STATIONS[b.dataset.st][1]; player.play().catch(() => toast('Impossibile avviare la radio: controlla la connessione.')); toast('🎶 ' + STATIONS[b.dataset.st][0]); });
  player.onplay = () => $('#eq') && $('#eq').classList.add('on'); player.onpause = () => $('#eq') && $('#eq').classList.remove('on');
  $('#mStop').onclick = () => player.pause(); $('#mVol').oninput = e => { player.volume = +e.target.value; if (noiseGain) noiseGain.gain.value = +e.target.value * .3; };
  $('#mPlay').onclick = () => { const u = $('#mUrl').value.trim(); if (u) { player.src = u; player.play().catch(() => toast('Link non riproducibile.')); } };
  $$('[data-n]').forEach(b => b.onclick = () => { S.settings.ambient = b.dataset.n; save(); noise(b.dataset.n); });
  $('#mFollow').onchange = e => { S.settings.follow = e.target.checked; save(); };
  $$('[data-sl]').forEach(b => b.onclick = () => { clearTimeout(window._sl); window._sl = setTimeout(() => { player.pause(); noise('off'); toast('😴 Musica spenta'); }, +b.dataset.sl * 60000); toast('La musica si spegne tra ' + b.dataset.sl + ' minuti'); });
};

// ---- Calendario ----
let cal = { y: new Date().getFullYear(), m: new Date().getMonth(), sel: iso(new Date()) };
const EV = { verifica: ['Verifica', '#e5484d'], interrogazione: ['Interrogazione', '#f59f00'], speciale: ['Giorno speciale', '#9c36b5'], altro: ['Altro', '#1c7ed6'] };
panels.calendar = () => {
  const first = new Date(cal.y, cal.m, 1), start = (first.getDay() + 6) % 7, days = new Date(cal.y, cal.m + 1, 0).getDate(), today = iso(new Date());
  let cells = ['L', 'M', 'M', 'G', 'V', 'S', 'D'].map(x => `<div class="h">${x}</div>`).join('') + '<div></div>'.repeat(start);
  for (let d = 1; d <= days; d++) {
    const ds = `${cal.y}-${pad(cal.m + 1)}-${pad(d)}`, ev = S.events.filter(e => e.date === ds), hw = S.homework.some(h => h.date === ds);
    cells += `<div class="d ${ds === today ? 'today' : ''} ${ds === cal.sel ? 'sel' : ''}" data-d="${ds}">${d}<br>${ev.map(e => `<span class="dot" style="background:${EV[e.type][1]}"></span>`).join('')}${hw ? '📝' : ''}</div>`;
  }
  const evs = S.events.filter(e => e.date === cal.sel), tomorrow = iso(addDays(new Date(), 1)), hwT = S.homework.filter(h => h.date === tomorrow), hwSel = S.homework.filter(h => h.date === cal.sel && cal.sel !== tomorrow);
  main().innerHTML = `<div class="card"><div class="row" style="justify-content:space-between"><h2>📅 ${new Date(cal.y, cal.m).toLocaleDateString(CFG.lang, { month: 'long', year: 'numeric' })}</h2><span><button class="btn alt" id="pm">◀</button><button class="btn alt" id="nm">▶</button></span></div><div class="cal">${cells}</div></div>
  <div class="card"><h3 style="text-transform:capitalize">${new Date(cal.sel + 'T12:00').toLocaleDateString(CFG.lang, { weekday: 'long', day: 'numeric', month: 'long' })}</h3>${evs.map(e => `<div class="row"><span class="badge" style="background:${EV[e.type][1]}">${EV[e.type][0]}</span> ${esc(e.title)} ${e.subject ? '(' + esc(e.subject) + ')' : ''} <button class="btn del" data-de="${e.id}">✕</button></div>`).join('') || '<p class="muted">Nessun evento.</p>'}
  ${hwSel.map(h => `<div class="row">📝 ${esc(h.text)} <button class="btn del" data-dh="${h.id}">✕</button></div>`).join('')}
  <div class="row"><label>Tipo<select id="eT">${Object.entries(EV).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('')}</select></label>
  <label>Materia<input id="eS" placeholder="Matematica"></label><label>Titolo<input id="eTi" placeholder="Capitolo 5"></label><button class="btn" id="eAdd">${t('add')}</button></div><button class="btn alt" id="ics">📲 Esporta nel calendario del telefono (.ics)</button></div>
  <div class="card hw"><h3>📝 ${t('hwTomorrow')} (${tomorrow})</h3>${hwT.map(h => `<div class="row">${esc(h.text)} <button class="btn del" data-dh="${h.id}">✕</button></div>`).join('') || '<p class="muted">Ancora nessun compito.</p>'}
  <p class="muted">Argo non offre un collegamento automatico a terze parti: apri Argo, copia i compiti e incollali qui (una riga per compito).</p>
  <textarea id="hwText" placeholder="Matematica: es. 5-8 pag. 120&#10;Inglese: unit 4 vocabulary"></textarea>
  <label>Per il giorno<input type="date" id="hwDate" value="${tomorrow}"></label>
  <button class="btn" id="hwAdd">Importa compiti</button> <a class="btn alt" style="text-decoration:none;display:inline-block" target="_blank" rel="noopener" href="${esc(CFG.argoUrl)}">🔗 Apri Argo</a></div>`;
  $('#pm').onclick = () => { if (--cal.m < 0) { cal.m = 11; cal.y--; } panels.calendar(); };
  $('#nm').onclick = () => { if (++cal.m > 11) { cal.m = 0; cal.y++; } panels.calendar(); };
  $$('.cal .d').forEach(d => d.onclick = () => { cal.sel = d.dataset.d; panels.calendar(); });
  $('#ics').onclick = () => {
    const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SHASHI//IT', 'CALSCALE:GREGORIAN'], stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
    const ev = (id, date, title) => { const d = date.replace(/-/g, ''), n = iso(addDays(new Date(date + 'T12:00'), 1)).replace(/-/g, ''); L.push('BEGIN:VEVENT', 'UID:' + id + '@shashi', 'DTSTAMP:' + stamp, 'DTSTART;VALUE=DATE:' + d, 'DTEND;VALUE=DATE:' + n, 'SUMMARY:' + title.replace(/[,;\n]/g, ' '), 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:SHASHI', 'TRIGGER:-PT15H', 'END:VALARM', 'END:VEVENT'); };
    S.events.forEach(e => ev(e.id, e.date, '📚 ' + EV[e.type][0] + ': ' + (e.subject ? e.subject + ' - ' : '') + e.title)); S.homework.forEach(h => ev(h.id, h.date, '📝 ' + h.text)); L.push('END:VCALENDAR');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([L.join('\r\n')], { type: 'text/calendar' })); a.download = 'shashi.ics'; a.click(); toast('Apri il file .ics per aggiungere tutto al calendario del telefono ✔️', 6000);
  };
  $('#eAdd').onclick = () => { S.events.push({ id: uid(), date: cal.sel, type: $('#eT').value, subject: $('#eS').value.trim(), title: $('#eTi').value.trim() || EV[$('#eT').value][0] }); save(); panels.calendar(); };
  $$('[data-de]').forEach(b => b.onclick = () => { S.events = S.events.filter(e => e.id !== b.dataset.de); save(); panels.calendar(); });
  $$('[data-dh]').forEach(b => b.onclick = () => { S.homework = S.homework.filter(e => e.id !== b.dataset.dh); save(); panels.calendar(); });
  $('#hwAdd').onclick = () => { const d = $('#hwDate').value; $('#hwText').value.split('\n').map(x => x.trim()).filter(Boolean).forEach(x => S.homework.push({ id: uid(), date: d, text: x })); save(); panels.calendar(); toast('Compiti importati ✔️'); };
};
function reminders() {
  const today = iso(new Date()), lim = iso(addDays(new Date(), 2));
  const up = S.events.filter(e => e.date >= today && e.date <= lim && ['verifica', 'interrogazione', 'speciale'].includes(e.type));
  if (up.length) { const m = '🔔 ' + up.map(e => `${EV[e.type][0]} ${e.subject || e.title} (${e.date})`).join(' · '); setTimeout(() => toast(m, 7000), 1200); notify('SHASHI – promemoria', m); }
}

// ---- Appunti e cartelle ----
let curFolder = 'all', curNote = null, nq = '';
function resizeImg(file) {
  return new Promise(res => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 900 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .7)); }; im.src = r.result; }; r.readAsDataURL(file); });
}
function loadScript(src) { return new Promise((ok, ko) => { if ($(`script[src="${src}"]`)) return ok(); const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }
async function pdfText(file) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const doc = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise, out = [];
  for (let i = 1; i <= doc.numPages; i++) { const p = await doc.getPage(i), c = await p.getTextContent(); out.push(c.items.map(x => x.str).join(' ')); }
  return out.join('\f');
}
panels.notes = () => {
  const n = S.notes.find(x => x.id === curNote);
  const list = S.notes.filter(x => (curFolder === 'all' || x.folder === curFolder) && (!nq || (x.title + ' ' + x.text).toLowerCase().includes(nq)));
  main().innerHTML = `<div class="notesGrid">
  <div class="card"><h3>📁 Cartelle</h3><div class="list">
  <div><a href="#" data-f="all"><b>${curFolder === 'all' ? '▶ ' : ''}Tutti</b></a></div>
  ${S.folders.map(f => `<div><a href="#" data-f="${f.id}">${curFolder === f.id ? '▶ ' : ''}${esc(f.name)}</a><span><button class="btn alt" data-rf="${f.id}">✎</button><button class="btn del" data-df="${f.id}">✕</button></span></div>`).join('')}</div>
  <button class="btn" id="nf">+ ${t('newFolder')}</button>
  <input id="nsearch" placeholder="🔍 Cerca negli appunti" value="${esc(nq)}" style="width:100%;margin-top:10px"><h3 style="margin-top:14px">📄 Appunti</h3><div class="list">${list.map(x => `<div><a href="#" data-n="${x.id}">${x.id === curNote ? '▶ ' : ''}${esc(x.title)}</a></div>`).join('') || '<p class="muted">Vuoto</p>'}</div>
  <button class="btn" id="nn">+ Nuovo appunto</button></div>
  <div class="card">${n ? `<h3>Modifica appunto</h3>
  <label style="display:flex">Titolo<input id="nt" value="${esc(n.title)}"></label>
  <div class="row"><label>Cartella<select id="nfo">${S.folders.map(f => `<option value="${f.id}" ${f.id === n.folder ? 'selected' : ''}>${esc(f.name)}</option>`).join('')}</select></label>
  <label>Materia<input id="nsu" value="${esc(n.subject || '')}"></label></div>
  <textarea id="ntx" style="min-height:260px" placeholder="Scrivi o incolla qui gli appunti… (per ‘pagine’ separate usa una riga vuota ogni tanto)">${esc(n.text)}</textarea>
  <div class="row"><label>Carica file (.txt .md .pdf)<input type="file" id="nfile" accept=".txt,.md,.pdf,text/plain,application/pdf"></label>
  <label>Aggiungi immagini<input type="file" id="nimg" accept="image/*" multiple></label><label>📷 Foto → testo (OCR)<input type="file" id="nocr" accept="image/*"></label></div>
  <div class="thumbs">${n.images.map((im, i) => `<span><img src="${im}"><button class="btn del" data-di="${i}">✕</button></span>`).join('')}</div>
  <p class="muted">${splitPages(n.text).length} pagine · ${n.text.length} caratteri</p>
  <button class="btn" id="ns">${t('save')}</button>
  <button class="btn alt" onclick="go('map')">🕸️</button><button class="btn alt" onclick="go('podcast')">🎙️</button><button class="btn alt" onclick="go('exercises')">✏️</button><button class="btn alt" id="nsum">📝 Riassumi</button><button class="btn alt" id="npr">🖨️ PDF/Stampa</button><div id="nsumOut"></div>
  <button class="btn del" id="nd">${t('del')}</button>` : empty('📝', 'Nessun appunto aperto', 'Crea un appunto, incolla il testo o carica un PDF: poi potrai trasformarlo in mappe, podcast ed esercizi.', '<button class="btn" id="nnEmpty">+ Nuovo appunto</button>')}</div></div>`;
  $$('[data-f]').forEach(a => a.onclick = e => { e.preventDefault(); curFolder = a.dataset.f; panels.notes(); });
  $$('[data-n]').forEach(a => a.onclick = e => { e.preventDefault(); curNote = a.dataset.n; S.sel.note = curNote; panels.notes(); });
  $('#nsearch').oninput = e => { nq = e.target.value.toLowerCase(); panels.notes(); const i = $('#nsearch'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); };
  $('#nf').onclick = () => { const nm = prompt('Nome cartella?'); if (nm) { const f = { id: uid(), name: nm }; S.folders.push(f); curFolder = f.id; save(); panels.notes(); } };
  $$('[data-rf]').forEach(b => b.onclick = () => { const f = S.folders.find(x => x.id === b.dataset.rf), nm = prompt('Nuovo nome', f.name); if (nm) { f.name = nm; save(); panels.notes(); } });
  $$('[data-df]').forEach(b => b.onclick = () => { if (S.folders.length < 2) return toast('Serve almeno una cartella.'); if (!confirm('Eliminare la cartella? Gli appunti passano alla prima cartella.')) return; const id = b.dataset.df; S.folders = S.folders.filter(f => f.id !== id); S.notes.forEach(x => { if (x.folder === id) x.folder = S.folders[0].id; }); curFolder = 'all'; save(); panels.notes(); });
  $('#nn').onclick = () => { const x = { id: uid(), folder: curFolder === 'all' ? S.folders[0].id : curFolder, title: 'Nuovo appunto', subject: '', text: '', images: [] }; S.notes.push(x); curNote = x.id; S.sel.note = x.id; save(); panels.notes(); };
  if ($('#nnEmpty')) $('#nnEmpty').onclick = () => $('#nn').click();
  if (!n) return;
  const commit = () => { n.title = $('#nt').value || 'Senza titolo'; n.folder = $('#nfo').value; n.subject = $('#nsu').value; n.text = $('#ntx').value; save(); };
  $('#ns').onclick = () => { commit(); toast('Salvato ✔️'); panels.notes(); };
  $('#nsum').onclick = async () => {
    commit(); const box = $('#nsumOut'); box.innerHTML = '<p>⏳ Preparo il riassunto…</p>'; let out = null;
    try { out = await aiText('Sei un tutor che riassume in modo semplice.', `Lingua: ${LN[CFG.lang]}. Fai un riassunto chiaro, con punti elenco dei concetti principali, adatto a uno studente.\n\n${n.text.slice(0, 14000)}`, 1500); } catch (e) { toast('AI non disponibile: ' + e.message); }
    if (!out) {
      const sn = sents(n.text), ks = kws(n.text, 10);
      out = sn.map((x, i) => ({ x, i, sc: ks.reduce((a, k) => a + (x.toLowerCase().includes(k) ? 1 : 0), 0) })).sort((a, b) => b.sc - a.sc).slice(0, Math.max(1, Math.min(6, Math.ceil(sn.length / 3)))).sort((a, b) => a.i - b.i).map(o => '• ' + o.x).join('\n') || 'Testo troppo breve per riassumere.';
    }
    box.innerHTML = `<div class="card"><h3>Riassunto</h3><div class="msg a" style="margin:0">${esc(out)}</div><button class="btn alt" id="nsumAdd">➕ Aggiungi all'appunto</button></div>`;
    $('#nsumAdd').onclick = () => { n.text += '\n\n--- Riassunto ---\n' + out; save(); panels.notes(); toast('Riassunto aggiunto ✔️'); };
  };
  $('#npr').onclick = () => {
    commit(); const w = window.open('', '_blank'); if (!w) return toast('Consenti i popup per stampare o salvare in PDF.');
    w.document.write(`<html><head><title>${esc(n.title)}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:20px auto;line-height:1.55;padding:0 12px}img{max-width:100%;margin:10px 0}</style></head><body><h1>${esc(n.title)}</h1>${esc(n.text).replace(/\f/g, '<hr>').replace(/\n/g, '<br>')}${n.images.map(i => `<img src="${i}">`).join('')}</body></html>`);
    w.document.close(); setTimeout(() => w.print(), 400);
  };
  $('#nd').onclick = () => { if (confirm('Eliminare questo appunto?')) { S.notes = S.notes.filter(x => x.id !== n.id); curNote = null; save(); panels.notes(); } };
  $$('[data-di]').forEach(b => b.onclick = () => { commit(); n.images.splice(+b.dataset.di, 1); save(); panels.notes(); });
  $('#nocr').onchange = async e => {
    commit(); const f = e.target.files[0]; if (!f) return; toast('Leggo il testo dalla foto… (può richiedere un minuto)', 9000);
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.0.5/tesseract.min.js');
      const r = await Tesseract.recognize(f, 'ita+eng'), tx = r.data.text.trim();
      if (!tx) return toast('Nessun testo riconosciuto: prova con una foto più nitida.');
      n.text = n.text ? n.text + '\f' + tx : tx; save(); panels.notes(); toast('Testo aggiunto all\'appunto ✔️');
    } catch (err) { toast('OCR non disponibile (serve internet).'); }
  };
  $('#nimg').onchange = async e => { commit(); for (const f of e.target.files) n.images.push(await resizeImg(f)); save(); panels.notes(); };
  $('#nfile').onchange = async e => {
    commit(); const f = e.target.files[0]; if (!f) return; toast('Lettura file…');
    try {
      let txt = /\.pdf$/i.test(f.name) ? await pdfText(f) : await f.text();
      if (!txt.trim()) return toast('Nessun testo trovato (PDF scansionato?). Incolla il testo a mano.');
      n.text = n.text ? n.text + (/\.pdf$/i.test(f.name) ? '\f' : '\n\n') + txt : txt; if (n.title === 'Nuovo appunto') n.title = f.name.replace(/\.\w+$/, ''); save(); panels.notes();
    } catch (err) { toast('Impossibile leggere il file (per i PDF serve internet).'); }
  };
};

// ---- Generatori locali (senza AI) ----
function localMap(g) {
  const sn = sents(g.text), ks = kws(g.text, 6), per = g.ex === 'ex0' ? 1 : g.ex === 'exFew' ? 2 : 4;
  const used = new Set(); const branches = ks.map(k => ({ label: k, items: sn.filter(s => s.toLowerCase().includes(k) && !used.has(s)).slice(0, per).map(s => { used.add(s); return short(s, 70); }) }));
  return { center: g.note.title, branches, explanation: sn.slice(0, 5).join(' ') };
}
function wrapTxt(s, n = 18) { const w = s.split(' '), L = []; let c = ''; w.forEach(x => { if ((c + ' ' + x).trim().length > n && c) { L.push(c); c = x; } else c = (c + ' ' + x).trim(); }); if (c) L.push(c); return L.slice(0, 4); }
function boxSVG(x, y, text, fill, bold) {
  const L = wrapTxt(text), w = Math.max(...L.map(l => l.length)) * 7 + 18, h = L.length * 16 + 12;
  return `<g><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="#222" stroke-width="1.2"/><text text-anchor="middle" font-size="${bold ? 15 : 12}" font-weight="${bold ? 800 : 500}" fill="#222" font-family="system-ui,sans-serif">${L.map((l, i) => `<tspan x="${x}" y="${y - h / 2 + 18 + i * 16}">${esc(l)}</tspan>`).join('')}</text></g>`;
}
function drawMap(d) {
  const cx = 550, cy = 370, br = d.branches.slice(0, 8), n = br.length || 1; let lines = '', boxes = '';
  br.forEach((b, i) => {
    const th = 2 * Math.PI * i / n - Math.PI / 2, x1 = cx + Math.cos(th) * 190, y1 = cy + Math.sin(th) * 160, col = `hsl(${i * 360 / n},85%,82%)`;
    lines += `<line x1="${cx}" y1="${cy}" x2="${x1}" y2="${y1}" stroke="#555" stroke-width="2"/>`; boxes += boxSVG(x1, y1, b.label, col, true);
    const it = (b.items || []).slice(0, 5);
    it.forEach((c, k) => { const a = th + (k - (it.length - 1) / 2) * .3, x2 = cx + Math.cos(a) * 390, y2 = cy + Math.sin(a) * 320; lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#999" stroke-width="1.3"/>`; boxes += boxSVG(x2, y2, c, '#fff', false); });
  });
  return `<svg class="map" id="mapSvg" viewBox="0 0 1100 740" xmlns="http://www.w3.org/2000/svg"><rect width="1100" height="740" fill="#fff"/>${lines}${boxes}${boxSVG(cx, cy, d.center || '', 'var(--b,#ffb347)', true)}</svg>`;
}
panels.map = () => {
  main().innerHTML = `<h2>🕸️ ${t('map')}</h2>` + ctl() + `<div class="card"><button class="btn" id="go">${t('generate')}</button> <span class="muted">${hasAI() ? 'AI attiva' : 'Modalità offline semplice (per risultati migliori aggiungi la chiave AI in Impostazioni)'}</span></div><div id="out"></div>`;
  wireCtl(); $('#go').onclick = async () => {
    const g = getSel(); if (!g) return; busy($('#out'), 'Creo la mappa…'); let d = null;
    try { d = parseJSON(await aiText('Sei un tutor che crea mappe concettuali. Rispondi SOLO con JSON valido.', `${styleNote(g)}\nCrea una mappa concettuale del testo. Formato: {"center":"tema","branches":[{"label":"concetto breve","items":["dettaglio/esempio breve"]}],"explanation":"spiegazione semplificata di 6-10 frasi"}. Da 5 a 8 rami, massimo 4-5 elementi per ramo (testi brevi, max 60 caratteri).\n\nTESTO:\n${g.text.slice(0, 14000)}`)); } catch (e) { toast('AI non disponibile: ' + e.message); }
    d = d && d.branches ? d : localMap(g);
    $('#out').innerHTML = `<div class="card">${drawMap(d)}<button class="btn alt" id="dl">⬇️ Scarica SVG</button><button class="btn alt" id="dlp">🖼️ Scarica PNG</button></div>` + (d.explanation ? `<div class="card"><h3>Spiegazione semplificata</h3><p>${esc(d.explanation)}</p></div>` : '') + (g.img && g.note.images.length ? `<div class="card"><h3>Immagini dell'appunto</h3><div class="thumbs">${g.note.images.map(i => `<img src="${i}">`).join('')}</div></div>` : '');
    S.cnt.maps++; addXp(10); animMap();
    $('#dlp').onclick = () => {
      const svg = $('#mapSvg').outerHTML.replace(/var\(--b,#ffb347\)/g, '#ffb347'), img = new Image();
      img.onload = () => { const c = document.createElement('canvas'); c.width = 2200; c.height = 1480; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height); c.toBlob(bl => { const a = document.createElement('a'); a.href = URL.createObjectURL(bl); a.download = 'mappa-shashi.png'; a.click(); }); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    };
    $('#dl').onclick = () => { const b = new Blob([$('#mapSvg').outerHTML], { type: 'image/svg+xml' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'mappa-shashi.svg'; a.click(); };
  };
};

// ---- Podcast ----
function localPodcast(g) {
  const it = CFG.lang === 'it', sn = sents(g.text), ks = kws(g.text, 4), s = [];
  s.push({ who: 'A', text: it ? `Ciao a tutti! Oggi parliamo di ${g.note.title}.` : `Hi everyone! Today we talk about ${g.note.title}.` });
  s.push({ who: 'B', text: it ? `Ottimo! I concetti chiave sono ${ks.join(', ')}. Partiamo.` : `Great! The key ideas are ${ks.join(', ')}. Let's start.` });
  sn.forEach((x, i) => { s.push({ who: i % 2 ? 'B' : 'A', text: x }); if (g.ex !== 'ex0' && i % (g.ex === 'exMany' ? 1 : 3) === 2) s.push({ who: i % 2 ? 'A' : 'B', text: it ? 'Riassumendo: ricorda bene questo punto.' : 'To sum up: remember this point.' }); });
  s.push({ who: 'A', text: it ? 'Ed è tutto per oggi. Ripassa e buono studio!' : "That's all for today. Review it and good luck!" }); return s;
}
async function genPodcast(g, len, prog) {
  if (!hasAI()) return localPodcast(g);
  const per = len === 'short' ? g.pages.length : len === 'medium' ? 4 : 2, words = len === 'short' ? 500 : len === 'medium' ? 650 : 800, chunks = [];
  for (let i = 0; i < g.pages.length; i += per) chunks.push(g.pages.slice(i, i + per).join('\n\n'));
  const parts = chunks.slice(0, 20), out = [];
  for (let i = 0; i < parts.length; i++) {
    prog(`Scrivo il podcast: parte ${i + 1}/${parts.length}…`);
    const r = parseJSON(await aiText('Sei autore di podcast didattici con due conduttori, A e B, che dialogano in modo vivace. Rispondi SOLO con JSON valido.',
      `${styleNote(g)}\nScrivi la parte ${i + 1} di ${parts.length} di un podcast, circa ${words} parole, battute brevi (1-3 frasi). ${i === 0 ? 'Apri con un saluto e presenta l\'argomento. ' : 'Continua senza ripartire con un saluto. '}${i === parts.length - 1 ? 'Concludi con un riassunto e un saluto.' : ''}\nFormato: {"script":[{"who":"A","text":"..."},{"who":"B","text":"..."}]}\n\nTESTO:\n${parts[i].slice(0, 9000)}`, 4000));
    if (r && r.script) out.push(...r.script);
  }
  return out.length ? out : localPodcast(g);
}
/* ===== Motore vocale: coda anticipata, voci migliori, pausa e salto ===== */
const VKEY = 'shashi_voices';
let podWL = null;
async function podAwake(on) { try { if (on && 'wakeLock' in navigator && !podWL) { podWL = await navigator.wakeLock.request('screen'); podWL.addEventListener('release', () => podWL = null); } else if (!on && podWL) { await podWL.release(); podWL = null; } } catch { } }
function voiceScore(v) {
  const lang = (v.lang || '').toLowerCase().replace('_', '-'); if (!lang.startsWith(CFG.lang)) return -1;
  const n = (v.name + ' ' + (v.voiceURI || '')).toLowerCase(); let sc = 0;
  if (/natural|neural|online|premium|enhanced|wavenet|studio|siri/.test(n)) sc += 50;
  if (/google|microsoft|apple/.test(n)) sc += 15;
  if (!v.localService) sc += 10;
  if (lang === CFG.lang + '-' + CFG.lang) sc += 5;
  if (/elsa|isabella|diego|alice|federica|luca|paola|emma|jorge|monica|paulina|denise|henri|katja|conrad|amala|samantha|google/.test(n)) sc += 8;
  if (/compact|espeak|festival|robot/.test(n)) sc -= 40;
  return sc;
}
function podVoices() { if (!('speechSynthesis' in window)) return []; return speechSynthesis.getVoices().map(v => ({ v, sc: voiceScore(v) })).filter(x => x.sc >= 0).sort((a, b) => b.sc - a.sc).map(x => x.v); }
function pickVoice(who) {
  const vs = podVoices(); if (!vs.length) return null; let saved = {}; try { saved = JSON.parse(localStorage.getItem(VKEY) || '{}'); } catch { }
  const mine = vs.find(v => v.name === saved[who]); if (mine) return mine;
  if (who === 'P') { let o = {}; try { o = JSON.parse(localStorage.getItem('shashi_oralv') || '{}'); } catch { } const m = vs.find(v => v.name === o.v); return m || vs[0]; }
  return who === 'B' ? (vs[1] || vs[0]) : vs[0];
}
function ttsClean(t) {
  const SU = { it: 'su', en: 'out of', es: 'sobre', fr: 'sur', de: 'von' }[CFG.lang] || '/';
  t = String(t).replace(/(\d+(?:[.,]\d+)?)\s*\/\s*(\d+)/g, '$1 ' + SU + ' $2').replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, ' ').replace(/->|→|=>/g, ', ').replace(/[•*_#`~]/g, ' ').replace(/\s*[—–]\s*/g, ', ').replace(/\(([^)]*)\)/g, ', $1, ');
  if (CFG.lang === 'it') t = t.replace(/\bes\.\s/gi, 'ad esempio ').replace(/\becc\./gi, 'eccetera').replace(/\bpag\.\s?/gi, 'pagina ').replace(/\bcap\.\s?/gi, 'capitolo ').replace(/\bn\.\s?(\d)/gi, 'numero $1');
  return t.replace(/\s+/g, ' ').replace(/,\s*,/g, ',').replace(/\s+([,.;:!?])/g, '$1').trim();
}
function ttsChunks(t, max = 170) {
  const parts = t.match(/[^.!?;:]+[.!?;:]*\s*/g) || [t], out = []; let cur = '';
  const push = () => { if (cur.trim()) out.push(cur.trim()); cur = ''; };
  for (const p of parts) {
    if (p.length > max) { push(); p.split(/(?<=,)\s+/).forEach(x => { if ((cur + x).length > max) push(); cur += x + ' '; }); push(); }
    else { if ((cur + p).length > max) push(); cur += p; }
  }
  push(); return out.length ? out : [t];
}
let POD = { script: [], i: 0, chunk: 0, chunks: [], lineStart: [], playing: false, paused: false, rate: 1, cancelMode: /Android/i.test(navigator.userAgent) };
const PQ = { token: 0, queued: 0 };
function buildChunks() {
  POD.chunks = []; POD.lineStart = [];
  POD.script.forEach((l, i) => { POD.lineStart[i] = POD.chunks.length; ttsChunks(ttsClean(l.text)).forEach(tx => POD.chunks.push({ line: i, who: l.who === 'B' ? 'B' : 'A', text: tx, n: POD.chunks.length })); });
}
function setPlayBtn() { const b = $('#pp'); if (b) b.textContent = POD.playing ? '⏸ Pausa' : (POD.paused ? '▶ Riprendi' : '▶ Ascolta'); }
function markPod() {
  $$('.pl').forEach(e => e.classList.toggle('cur', +e.dataset.i === POD.i));
  const c = $(`.pl[data-i="${POD.i}"]`); if (c && POD.playing) c.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  const sk = $('#podSeek'); if (sk) sk.value = POD.i; const tm = $('#podTime'); if (tm) tm.textContent = `Battuta ${Math.min(POD.i + 1, POD.script.length)} di ${POD.script.length}`;
}
function podUtter(c, token) {
  const u = new SpeechSynthesisUtterance(c.text), v = pickVoice(c.who), a = pickVoice('A'), b = pickVoice('B');
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = CFG.lang;
  u.rate = Math.max(.5, Math.min(2, POD.rate)); u.pitch = (a && b && a === b) ? (c.who === 'A' ? .9 : 1.15) : 1;
  u.onstart = () => { if (token !== PQ.token) return; POD.chunk = c.n; POD.i = c.line; markPod(); podRefill(token); };
  u.onend = () => { if (token !== PQ.token) return; if (c.n >= POD.chunks.length - 1) { POD.playing = false; POD.paused = false; POD.chunk = 0; POD.i = 0; podAwake(false); setPlayBtn(); markPod(); } };
  u.onerror = e => { if (token !== PQ.token || e.error === 'interrupted' || e.error === 'canceled') return; POD.playing = false; setPlayBtn(); toast('La voce si è fermata: tocca ▶ per riprendere.'); };
  speechSynthesis.speak(u);
}
function podRefill(token) { while (PQ.queued < POD.chunks.length && PQ.queued <= POD.chunk + 3) podUtter(POD.chunks[PQ.queued++], token); }
function podPlayFrom(n) {
  if (!POD.chunks || !POD.chunks.length) return; n = Math.max(0, Math.min(POD.chunks.length - 1, n));
  speechSynthesis.cancel(); speechSynthesis.resume(); const token = ++PQ.token;
  PQ.queued = n; POD.chunk = n; POD.i = POD.chunks[n].line; POD.playing = true; POD.paused = false; podAwake(true); setPlayBtn(); markPod();
  setTimeout(() => { if (token === PQ.token) podRefill(token); }, 80);
}
function podPause() { if (!POD.playing) return; POD.playing = false; POD.paused = true; podAwake(false); if (POD.cancelMode) { PQ.token++; speechSynthesis.cancel(); } else speechSynthesis.pause(); setPlayBtn(); }
function podResume() { POD.paused = false; if (POD.cancelMode || !speechSynthesis.paused) podPlayFrom(POD.chunk); else { POD.playing = true; speechSynthesis.resume(); podAwake(true); setPlayBtn(); } }
function podToggle() { if (POD.playing) podPause(); else if (POD.paused) podResume(); else podPlayFrom(POD.chunk || 0); }
function podStop() { PQ.token++; if ('speechSynthesis' in window) { speechSynthesis.cancel(); speechSynthesis.resume(); } POD.playing = false; POD.paused = false; POD.chunk = 0; POD.i = 0; podAwake(false); setPlayBtn(); markPod(); }
function podSkip(d) { if (!POD.script.length) return; const i = Math.max(0, Math.min(POD.script.length - 1, POD.i + d)); podPlayFrom(POD.lineStart[i]); }
const OV = () => { let o = {}; try { o = JSON.parse(localStorage.getItem('shashi_oralv') || '{}'); } catch { } return { rate: o.rate || 1, v: o.v || '', on: o.on !== false, free: !!o.free }; };
const OVset = (k, x) => { const o = OV(); o[k] = x; try { localStorage.setItem('shashi_oralv', JSON.stringify(o)); } catch { } };
let SPK = { token: 0 };
function stopSpeak() { if (typeof cloudStop === 'function') cloudStop(); SPK.token++; if ('speechSynthesis' in window) { speechSynthesis.cancel(); speechSynthesis.resume(); } document.body.classList.remove('speaking'); }
function speakNow(text, done) {
  if (typeof cloudOn === 'function' && cloudOn()) { PQ.token++; POD.playing = false; setPlayBtn(); if ('speechSynthesis' in window) speechSynthesis.cancel(); return cloudSpeak(text, done, 'P'); }
  if (!('speechSynthesis' in window)) { done && done(); return; } PQ.token++; POD.playing = false; setPlayBtn(); speechSynthesis.cancel(); speechSynthesis.resume();
  const token = ++SPK.token, v = pickVoice('P'), cs = ttsChunks(ttsClean(text)), rate = OV().rate;
  if (!cs.length) { done && done(); return; } document.body.classList.add('speaking');
  cs.forEach((tx, i) => { const u = new SpeechSynthesisUtterance(tx); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = CFG.lang; u.rate = rate * (1 + (Math.random() - .5) * .06); u.pitch = 1 + (Math.random() - .5) * .08;
    if (i === cs.length - 1) { u.onend = () => { if (token !== SPK.token) return; document.body.classList.remove('speaking'); done && done(); }; u.onerror = u.onend; }
    speechSynthesis.speak(u); });
}
function fillVoices() {
  const a = $('#vA'), b = $('#vB'); if (!a || !b) return; const vs = podVoices(), ca = pickVoice('A'), cb = pickVoice('B');
  const opts = sel => vs.map(v => `<option value="${esc(v.name)}" ${sel && sel.name === v.name ? 'selected' : ''}>${esc(v.name)}${/natural|neural|online|premium|enhanced/i.test(v.name) ? ' ★' : ''}</option>`).join('') || '<option>(voce predefinita)</option>';
  a.innerHTML = opts(ca); b.innerHTML = opts(cb);
}
function podHTML() {
  if (!POD.script.length) return '';
  const words = POD.script.reduce((n, l) => n + l.text.split(/\s+/).length, 0);
  return `<div class="card"><div class="row"><button class="btn alt" id="pPrev">⏮</button><button class="btn" id="pp">▶ Ascolta</button><button class="btn alt" id="pNext">⏭</button><button class="btn alt" id="ps">⏹</button>
  <label>Velocità<select id="pr">${[.85, .95, 1, 1.1, 1.25, 1.5].map(r => `<option value="${r}" ${POD.rate === r ? 'selected' : ''}>${r}x</option>`).join('')}</select></label></div>
  <input type="range" id="podSeek" min="0" max="${POD.script.length - 1}" value="${POD.i}" style="width:100%"><div class="muted" id="podTime"></div>
  <div style="max-height:360px;overflow:auto">${POD.script.map((l, i) => `<p class="pl" data-i="${i}"><b>${l.who === 'A' ? '🎙️ A' : '🎧 B'}:</b> ${esc(l.text)}</p>`).join('')}</div>
  <p class="muted">${POD.script.length} battute · ~${Math.max(1, Math.round(words / 150 / POD.rate))} min</p></div>`;
}
function wirePod() {
  if (!$('#pp')) return;
  $('#pp').onclick = podToggle; $('#ps').onclick = podStop; $('#pPrev').onclick = () => podSkip(-1); $('#pNext').onclick = () => podSkip(1);
  $('#pr').onchange = e => { POD.rate = +e.target.value; if (POD.playing) podPlayFrom(POD.chunk); };
  $('#podSeek').onchange = e => podPlayFrom(POD.lineStart[+e.target.value]);
  $$('.pl').forEach(el => el.onclick = () => podPlayFrom(POD.lineStart[+el.dataset.i]));
  setPlayBtn(); markPod();
}
panels.podcast = () => {
  const it = CFG.lang === 'it';
  main().innerHTML = `<h2>🎙️ ${t('podcast')}</h2>` + ctl() + `<div class="card"><div class="row"><label>Durata<select id="plen"><option value="short">Breve (~3 min)</option><option value="medium">Media (~10 min)</option><option value="long">Lunga (30+ min, per più pagine)</option></select></label><button class="btn" id="go">${t('generate')}</button></div>
  <p class="muted">Seleziona sopra le pagine da trasformare in podcast.${hasAI() ? '' : ' Senza chiave AI il podcast legge una versione semplificata del testo.'}</p></div>
  <div class="card"><h3>🔊 Voci del podcast</h3><div class="row"><label>Voce A 🎙️<select id="vA"></select></label><label>Voce B 🎧<select id="vB"></select></label><button class="btn alt" id="vTest">▶ Prova le voci</button></div>
  <p class="muted">Le voci con ★ sono le più naturali. Per voci migliori: <b>PC</b> → usa Edge (voci "Natural"); <b>Android</b> → Impostazioni › Sintesi vocale › Google; <b>iPhone</b> → Impostazioni › Accessibilità › Contenuto letto › Voci › "Migliorata/Premium". Lo schermo resta acceso durante l'ascolto.</p></div><div id="out">${podHTML()}</div>`;
  wireCtl(); fillVoices(); wirePod();
  const saveV = () => { const o = {}; if ($('#vA').value) o.A = $('#vA').value; if ($('#vB').value) o.B = $('#vB').value; try { localStorage.setItem(VKEY, JSON.stringify(o)); } catch { } };
  $('#vA').onchange = saveV; $('#vB').onchange = saveV;
  $('#vTest').onclick = () => {
    if (!('speechSynthesis' in window)) return toast('Questo browser non ha le voci.'); saveV(); PQ.token++; speechSynthesis.cancel(); speechSynthesis.resume();
    [['A', it ? 'Ciao! Io sono la prima voce del tuo podcast.' : 'Hi! I am the first voice of your podcast.'], ['B', it ? 'E io sono la seconda. Studiare insieme sarà più facile!' : 'And I am the second. Studying together will be easier!']].forEach(([w, tx]) => { const u = new SpeechSynthesisUtterance(tx), v = pickVoice(w); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = CFG.lang; u.rate = POD.rate; speechSynthesis.speak(u); });
  };
  $('#go').onclick = async () => {
    const g = getSel(); if (!g) return; podStop(); busy($('#out'), 'Preparo il podcast…');
    try { POD.script = await genPodcast(g, $('#plen').value, m => busy($('#out'), m)); } catch (e) { toast('AI non disponibile: ' + e.message); POD.script = localPodcast(g); }
    POD.i = 0; POD.chunk = 0; buildChunks(); S.cnt.pods++; addXp(10);
    $('#out').innerHTML = podHTML(); wirePod();
  };
};
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => { if ($('#vA')) fillVoices(); };

// ---- Esercizi ----
function localQuiz(g, n) {
  const sn = sents(g.text), ks = kws(g.text, 30), q = [];
  for (const s of sn) {
    if (q.length >= n) break; const k = ks.find(k => s.toLowerCase().includes(k)); if (!k) continue;
    const opts = [k, ...ks.filter(x => x !== k).sort(() => Math.random() - .5).slice(0, 3)].sort(() => Math.random() - .5);
    q.push({ q: s.replace(new RegExp(k, 'i'), '_____'), options: opts, answer: opts.indexOf(k), explain: s });
  } return q;
}
panels.exercises = () => {
  main().innerHTML = `<h2>✏️ ${t('exercises')}</h2>` + ctl() + `<div class="card"><label>Numero domande<select id="qn"><option>5</option><option selected>10</option><option>15</option></select></label><button class="btn" id="go">${t('generate')}</button></div><div id="out"></div>`;
  wireCtl(); $('#go').onclick = async () => {
    const g = getSel(); if (!g) return; const n = +$('#qn').value; busy($('#out'), 'Creo le domande…'); let q = null;
    try { q = parseJSON(await aiText('Sei un professore che prepara verifiche. Rispondi SOLO con un array JSON valido.', `${styleNote(g)}\nCrea ${n} domande a risposta multipla per prepararsi a una verifica/interrogazione sul testo. Formato: [{"q":"domanda","options":["A","B","C","D"],"answer":0,"explain":"spiegazione semplice della risposta corretta"}] (answer = indice 0-3).\n\nTESTO:\n${g.text.slice(0, 14000)}`)); } catch (e) { toast('AI non disponibile: ' + e.message); }
    if (!Array.isArray(q) || !q.length) q = localQuiz(g, n); if (!q.length) return $('#out').innerHTML = '<div class="card">Testo troppo breve per creare domande.</div>';
    let score = 0, done = 0;
    $('#out').innerHTML = q.map((x, i) => `<div class="q"><b>${i + 1}. ${esc(x.q)}</b>${x.options.map((o, k) => `<span class="opt" data-q="${i}" data-k="${k}">${esc(o)}</span>`).join('')}<div class="muted" id="ex${i}"></div></div>`).join('') + `<div class="card" id="sc"></div>`;
    $$('.opt').forEach(o => o.onclick = () => {
      const i = +o.dataset.q, k = +o.dataset.k, qq = q[i]; if (o.parentNode.dataset.done) return; o.parentNode.dataset.done = 1;
      $$(`.opt[data-q="${i}"]`).forEach(e => { if (+e.dataset.k === qq.answer) e.classList.add('ok'); }); if (k !== qq.answer) { o.classList.add('ko'); S.cards.push({ id: uid(), front: qq.q, back: qq.options[qq.answer] + (qq.explain ? ' — ' + qq.explain : ''), box: 0, due: iso(new Date()) }); save(); } else { score++; addXp(5); }
      $('#ex' + i).textContent = (k === qq.answer ? '✅ ' : '❌ ') + (qq.explain || ''); done++;
      if (done === q.length) { if (score === q.length) { confetti(); S.cnt.perfect++; addXp(10); } $('#sc').innerHTML = `<h3>Punteggio: ${score}/${q.length} (${Math.round(score / q.length * 100)}%)</h3><p class="muted">Le risposte sbagliate sono state aggiunte alle Flashcard per ripassarle. 🃏</p>`; addMin(0); }
    });
  };
};

// ---- Interrogazione AI ----
let ORAL = { msgs: [], q: [], i: 0, g: null };
function localQuestion() { const g = ORAL.g, k = ORAL.q[ORAL.i % ORAL.q.length]; return k ? `Domanda ${ORAL.i + 1}: cosa sai dirmi su «${k}»?` : 'Riassumi l\'argomento.'; }
function localCorrect(ans) {
  const g = ORAL.g, k = ORAL.q[ORAL.i % ORAL.q.length], ref = sents(g.text).filter(s => s.toLowerCase().includes(k)).slice(0, 2), refKw = kws(ref.join(' '), 8), a = ans.toLowerCase();
  const miss = refKw.filter(w => !a.includes(w)), hit = refKw.length - miss.length;
  return `${hit >= refKw.length * .6 ? '✅ Bene!' : '⚠️ Risposta incompleta.'} Concetti citati: ${hit}/${refKw.length}.${miss.length ? '\nTi manca: ' + miss.join(', ') + '.' : ''}\n\n📖 Spiegazione corretta dagli appunti:\n${ref.join(' ') || '—'}`;
}
panels.oral = () => {
  main().innerHTML = `<h2>🗣️ ${t('oral')}</h2>` + ctl() + `<div class="card"><button class="btn" id="go">${t('start')} interrogazione</button> <span class="muted">${hasAI() ? 'Il professore AI ti fa domande, corregge e spiega gli errori.' : 'Modalità offline semplice: confronto la tua risposta con gli appunti. Con la chiave AI l\'interrogazione è molto più realistica.'}</span></div><div class="card"><h3>🔊 Voce del professore</h3><div class="row"><label style="flex-direction:row;align-items:center"><input type="checkbox" id="oralTts" ${OV().on ? 'checked' : ''}>&nbsp;Leggi ad alta voce</label><label style="flex-direction:row;align-items:center"><input type="checkbox" id="oralFree" ${OV().free ? 'checked' : ''}>&nbsp;🎧 Mani libere (rispondi a voce)</label></div><div class="row"><label>Voce<select id="vP"></select></label><label>Velocità<select id="rP">${[.85, .95, 1, 1.1, 1.25].map(r => `<option value="${r}" ${OV().rate === r ? 'selected' : ''}>${r}x</option>`).join('')}</select></label><button class="btn alt" id="tP">▶ Prova voce</button><button class="btn alt" id="xP">⏹ Ferma</button></div></div><div id="chat"></div>`;
  { const vp = $('#vP'), vs = podVoices(), cur = pickVoice('P'); vp.innerHTML = vs.map(v => `<option value="${esc(v.name)}" ${cur && cur.name === v.name ? 'selected' : ''}>${esc(v.name)}${/natural|neural|online|premium|enhanced/i.test(v.name) ? ' ★' : ''}</option>`).join('') || '<option>(voce predefinita)</option>';
    vp.onchange = () => OVset('v', vp.value); $('#rP').onchange = e => OVset('rate', +e.target.value); $('#oralTts').onchange = e => OVset('on', e.target.checked); $('#oralFree').onchange = e => { OVset('free', e.target.checked); if (e.target.checked) { OVset('on', true); $('#oralTts').checked = true; } };
    $('#tP').onclick = () => speakNow('Ciao! Sono il tuo professore. Rispondi con calma: ti ascolto e ti spiego ogni errore. Hai ottenuto sette su dieci.'); $('#xP').onclick = stopSpeak; }
  wireCtl(); $('#go').onclick = async () => {
    const g = getSel(); if (!g) return; ORAL = { msgs: [], q: kws(g.text, 12), i: 0, g, ai: !!hasAI() }; $('#chat').innerHTML = '<div class="card" id="log"></div><div class="card row"><textarea id="ans" style="min-height:70px" placeholder="Rispondi qui…"></textarea><button class="btn" id="send">Invia</button><button class="btn alt" id="mic">🎤</button><button class="btn alt" id="pic" title="Allega una foto">📷</button><input type="file" id="picIn" accept="image/*" multiple hidden><div id="picTh" class="thumbs"></div></div>';
    let PIC = [];
    const log = (c, x) => { const tt = $('#oralTts'); if (c === 'a' && x !== '…' && tt && tt.checked && (cloudOn() || 'speechSynthesis' in window)) { speakNow(x, () => { if (OV().free && $('#mic')) listen(true); }); } $('#log').insertAdjacentHTML('beforeend', `<div class="msg ${c}">${esc(x)}</div>`); $('#log').lastChild.scrollIntoView({ block: 'nearest' }); };
    const sys = `Sei un professore di ${g.note.subject || g.note.title} che interroga uno studente. Livello: ${LV[g.level]}. Lingua: ${LN[CFG.lang]}. Usa SOLO questo materiale:\n${g.text.slice(0, 10000)}\n\nRegole: fai UNA domanda alla volta. Quando lo studente risponde: 1) dì cosa è corretto, 2) segnala OGNI errore commesso e spiegalo PASSO PER PASSO (Passo 1, Passo 2…) mostrando la correzione completa; se lo studente allega una foto, leggila e correggila, 3) dai un voto da 1 a 10, 4) fai la domanda successiva. Dopo 8 domande fai un riepilogo finale con voto complessivo e consigli. Scrivi in modo naturale e parlato, con frasi brevi, senza tabelle, elenchi puntati, markdown o emoji: il testo verrà letto ad alta voce.`;
    const ask = async (text, imgs = []) => {
      if (!ORAL.ai) { if (imgs.length && !text) { toast('Per leggere le foto serve la chiave AI nelle Impostazioni.'); return; } if (text) { log('a', localCorrect(text)); ORAL.i++; } log('a', localQuestion()); return; }
      ORAL.msgs.forEach(m => delete m.images); ORAL.msgs.push({ role: 'user', content: text || (imgs.length ? 'Ecco la mia risposta nella foto allegata.' : 'Inizia l\'interrogazione con la prima domanda.'), images: imgs }); log('a', '…');
      try { const r = await aiChat(sys, ORAL.msgs, 1500); $('#log').lastChild.remove(); ORAL.msgs.push({ role: 'assistant', content: r }); log('a', r); }
      catch (e) { $('#log').lastChild.remove(); toast('AI non disponibile: ' + e.message); ORAL.ai = false; ORAL.msgs.pop(); if (text) log('a', localCorrect(text)); log('a', localQuestion()); }
    };
    $('#send').onclick = () => { const v = $('#ans').value.trim(); if (!v && !PIC.length) return; $('#ans').value = ''; const im = PIC.splice(0); $('#picTh').innerHTML = ''; log('u', (v || '📷 Foto allegata') + (im.length ? ' [📷 ×' + im.length + ']' : '')); ask(v, im); };
    $('#pic').onclick = () => $('#picIn').click(); $('#picIn').onchange = async e => { for (const f of e.target.files) PIC.push(await resizeImg(f)); $('#picTh').innerHTML = PIC.map(i => `<img src="${i}">`).join(''); e.target.value = ''; };
    let REC = null;
    const listen = auto => {
      const R = window.SpeechRecognition || window.webkitSpeechRecognition; if (!R) { if (!auto) toast('Riconoscimento vocale non supportato da questo browser.'); return; }
      if (REC) { try { REC.stop(); } catch { } REC = null; $('#mic').classList.remove('rec'); return; }
      stopSpeak(); const r = new R(); REC = r; r.lang = CFG.lang; r.interimResults = true; r.continuous = false; let fin = '';
      const base = $('#ans').value ? $('#ans').value.trim() + ' ' : '';
      r.onresult = e => { let it = ''; fin = ''; for (const x of e.results) { if (x.isFinal) fin += x[0].transcript; else it += x[0].transcript; } $('#ans').value = base + fin + it; };
      r.onend = () => { REC = null; const m = $('#mic'); if (m) m.classList.remove('rec'); const v = $('#ans') && $('#ans').value.trim(); if (auto && v && OV().free) $('#send').click(); };
      r.onerror = () => { REC = null; const m = $('#mic'); if (m) m.classList.remove('rec'); };
      try { r.start(); $('#mic').classList.add('rec'); toast('🎤 Ti ascolto…'); } catch { }
    };
    window.listen = listen;
    $('#mic').onclick = () => listen(false);
    ask('');
  };
};

// ---- Flashcard (ripetizione spaziata) ----
const BOX = [0, 1, 3, 7, 14, 30];
panels.cards = () => {
  const now = iso(new Date()), due = S.cards.filter(c => c.due <= now);
  main().innerHTML = `<div class="card"><h2>🃏 ${t('cards')}</h2><p class="muted">Ripetizione spaziata: le carte che sai tornano a intervalli sempre più lunghi. Da ripassare oggi: <b>${due.length}</b> / ${S.cards.length}</p>
  <div id="study">${due.length ? `<div class="fc" id="fc">${esc(due[0].front)}</div><div class="row" style="justify-content:center" id="fb"><button class="btn alt" id="rev">Mostra risposta</button></div>` : empty('🎉', 'Niente da ripassare oggi', 'Aggiungi nuove carte o genera le flashcard da un appunto.')}</div></div>
  <div class="card"><h3>Nuova carta</h3><div class="row"><label>Fronte<input id="cf"></label><label>Retro<input id="cb"></label><button class="btn" id="ca">${t('add')}</button></div>
  ${S.notes.length ? `<button class="btn alt" id="cg">✨ Genera dall'appunto selezionato</button>` : ''}</div>`;
  $('#ca').onclick = () => { const f = $('#cf').value.trim(), b = $('#cb').value.trim(); if (f && b) { S.cards.push({ id: uid(), front: f, back: b, box: 0, due: now }); save(); panels.cards(); } };
  if ($('#cg')) $('#cg').onclick = () => { const n = S.notes.find(x => x.id === S.sel.note) || S.notes[0], sn = sents(n.text), ks = kws(n.text, 30); let c = 0; sn.forEach(s => { const k = ks.find(k => s.toLowerCase().includes(k)); if (k && c < 15) { S.cards.push({ id: uid(), front: s.replace(new RegExp(k, 'i'), '_____'), back: k, box: 0, due: now }); c++; } }); save(); toast(c + ' carte create'); panels.cards(); };
  if (due.length) {
    const c = due[0];
    $('#rev').onclick = () => { $('#fc').textContent = c.back; $('#fc').classList.remove('flip'); void $('#fc').offsetWidth; $('#fc').classList.add('flip'); $('#fb').innerHTML = '<button class="btn del" id="no">Non lo sapevo</button><button class="btn" id="si">Lo sapevo</button>'; $('#no').onclick = () => { c.box = 0; c.due = iso(addDays(new Date(), 1)); save(); panels.cards(); }; $('#si').onclick = () => { c.box = Math.min(5, c.box + 1); addXp(2); c.due = iso(addDays(new Date(), BOX[c.box])); save(); panels.cards(); }; };
  }
};

// ---- Metodi di studio ----
const METHODS = {
  'Matematica / Fisica': [
    { id: 'm1', n: 'Pomodoro + esercizi a raffica', d: 'Blocchi da 25 minuti di soli esercizi, pause da 5. L\'app apre gli esercizi con tanti esempi.', cfg: { work: 25, brk: 5, long: 15, cycles: 4, ex: 'exMany' }, go: 'exercises' },
    { id: 'm2', n: 'Tecnica Feynman', d: 'Spiega la regola a voce con parole semplici: l\'interrogazione AI ti aiuta a trovare i buchi.', cfg: { work: 30, brk: 5, long: 15, cycles: 3, ex: 'exFew' }, go: 'oral' },
    { id: 'm3', n: 'Quaderno degli errori', d: 'Raccogli gli errori in flashcard e ripassali con ripetizione spaziata.', cfg: { work: 25, brk: 5, long: 15, cycles: 4, ex: 'exFew' }, go: 'cards' }],
  'Italiano / Letteratura': [
    { id: 'i1', n: 'Mappe concettuali di autori e opere', d: 'Una mappa per autore/corrente, con pochi esempi chiave.', cfg: { work: 40, brk: 10, long: 20, cycles: 3, ex: 'exFew' }, go: 'map' },
    { id: 'i2', n: 'Ascolto con podcast', d: 'Trasforma le pagine in podcast e ascoltale a pezzi.', cfg: { work: 30, brk: 5, long: 15, cycles: 4, ex: 'exMany' }, go: 'podcast' },
    { id: 'i3', n: 'Metodo SQ3R', d: 'Survey, Question, Read, Recite, Review: leggi con domande e ripeti a voce.', cfg: { work: 45, brk: 10, long: 20, cycles: 3, ex: 'exFew' }, go: 'oral' }],
  'Lingue straniere': [
    { id: 'l1', n: 'Flashcard spaziate', d: 'Vocaboli ogni giorno, pochi minuti ma costanti.', cfg: { work: 15, brk: 3, long: 10, cycles: 4, ex: 'exMany' }, go: 'cards' },
    { id: 'l2', n: 'Shadowing con podcast', d: 'Ascolta e ripeti ad alta voce subito dopo.', cfg: { work: 25, brk: 5, long: 15, cycles: 4, ex: 'exMany' }, go: 'podcast' },
    { id: 'l3', n: 'Conversazione con l\'AI', d: 'Simula l\'interrogazione e rispondi a voce.', cfg: { work: 25, brk: 5, long: 15, cycles: 4, ex: 'exFew' }, go: 'oral' }],
  'Storia / Geografia / Filosofia': [
    { id: 's1', n: 'Mappa + linea del tempo', d: 'Una mappa per periodo, collega cause e conseguenze.', cfg: { work: 45, brk: 10, long: 20, cycles: 3, ex: 'exFew' }, go: 'map' },
    { id: 's2', n: 'Interrogazione simulata', d: 'Ripeti ad alta voce come se fossi alla cattedra.', cfg: { work: 30, brk: 5, long: 15, cycles: 4, ex: 'exFew' }, go: 'oral' },
    { id: 's3', n: 'Quiz a risposta multipla', d: 'Richiamo attivo con domande generate.', cfg: { work: 25, brk: 5, long: 15, cycles: 4, ex: 'ex0' }, go: 'exercises' }],
  'Scienze / Biologia / Chimica': [
    { id: 'c1', n: 'Mappa dei processi', d: 'Schematizza cicli e processi con esempi concreti.', cfg: { work: 40, brk: 10, long: 20, cycles: 3, ex: 'exMany' }, go: 'map' },
    { id: 'c2', n: 'Flashcard di termini', d: 'Definizioni e formule con ripetizione spaziata.', cfg: { work: 20, brk: 5, long: 15, cycles: 4, ex: 'exFew' }, go: 'cards' },
    { id: 'c3', n: 'Pomodoro + quiz', d: 'Studio 25 minuti, poi quiz per verificare.', cfg: { work: 25, brk: 5, long: 15, cycles: 4, ex: 'exMany' }, go: 'exercises' }],
  'Informatica / Tecnologia': [
    { id: 't1', n: 'Deep work 90/20', d: 'Lunghi blocchi di concentrazione per programmare.', cfg: { work: 90, brk: 20, long: 30, cycles: 2, ex: 'exMany' }, go: 'timer' },
    { id: 't2', n: 'Spiega il codice a voce', d: 'Tecnica del paperella di gomma con l\'interrogazione AI.', cfg: { work: 30, brk: 5, long: 15, cycles: 4, ex: 'exFew' }, go: 'oral' },
    { id: 't3', n: 'Quiz di concetti', d: 'Verifica la teoria con domande generate.', cfg: { work: 25, brk: 5, long: 15, cycles: 4, ex: 'exFew' }, go: 'exercises' }],
  'Arte / Musica': [
    { id: 'a1', n: 'Mappa visiva con immagini', d: 'Collega opere, autori e periodi usando le immagini caricate.', cfg: { work: 30, brk: 10, long: 20, cycles: 3, ex: 'exMany' }, go: 'map' },
    { id: 'a2', n: 'Ascolto/podcast', d: 'Ascolta le spiegazioni mentre guardi le immagini.', cfg: { work: 25, brk: 5, long: 15, cycles: 4, ex: 'exMany' }, go: 'podcast' },
    { id: 'a3', n: 'Flashcard di opere', d: 'Opera → autore, data, stile.', cfg: { work: 20, brk: 5, long: 15, cycles: 4, ex: 'exFew' }, go: 'cards' }]
};
panels.methods = () => {
  main().innerHTML = `<h2>🧠 ${t('methods')}</h2><p class="muted">Scegli un metodo: SHASHI imposta da solo timer, livello di esempi e apre lo strumento giusto. ${S.method ? 'Metodo attivo: <b>' + esc(S.method) + '</b>' : ''}</p>` +
    Object.entries(METHODS).map(([sub, ms]) => `<div class="card"><h3>${sub}</h3>${ms.map(m => `<div class="row" style="justify-content:space-between;border-bottom:1px solid #0001;padding:6px 0"><div style="flex:1;min-width:200px"><b>${m.n}</b><br><span class="muted">${m.d} (${m.cfg.work}/${m.cfg.brk} min)</span></div><button class="btn" data-m="${m.id}">Usa</button></div>`).join('')}</div>`).join('');
  $$('[data-m]').forEach(b => b.onclick = () => {
    const m = Object.values(METHODS).flat().find(x => x.id === b.dataset.m); const { work, brk, long, cycles, ex } = m.cfg;
    Object.assign(S.settings, { work, brk, long, cycles }); S.sel.ex = ex; S.method = m.n; save(); resetTimer(); toast(`Metodo "${m.n}" attivato: impostazioni aggiornate ✔️`); go(m.go);
  });
};

// ---- Voti ----
panels.grades = () => {
  const by = {}; S.grades.forEach(g => (by[g.subject] = by[g.subject] || []).push(g));
  const avg = a => a.reduce((s, g) => s + g.v * g.w, 0) / a.reduce((s, g) => s + g.w, 0) || 0, all = avg(S.grades);
  main().innerHTML = `<div class="card"><h2>📊 ${t('grades')}</h2><div class="row"><label>Materia<input id="gs"></label><label>Voto<input id="gv" type="number" step=".25" min="0" max="10" style="width:90px"></label><label>Peso (%)<input id="gw" type="number" value="100" style="width:90px"></label><button class="btn" id="ga">${t('add')}</button></div></div>
  <div class="card">${Object.entries(by).map(([s, a]) => `<div class="row" style="justify-content:space-between"><b>${esc(s)}</b><span>${a.map(g => `<span class="badge" style="background:${g.v >= 6 ? '#2a9d4a' : '#e5484d'}">${g.v}</span> <a href="#" data-dg="${g.id}">✕</a> `).join('')} → media <b>${avg(a).toFixed(2)}</b></span></div>`).join('') || '<p class="muted">Nessun voto.</p>'}<h3>Media generale: ${S.grades.length ? all.toFixed(2) : '–'}</h3></div>`;
  $('#ga').onclick = () => { const s = $('#gs').value.trim(), v = parseFloat($('#gv').value); if (s && !isNaN(v)) { S.grades.push({ id: uid(), subject: s, v, w: (+$('#gw').value || 100) / 100 }); save(); panels.grades(); } };
  $$('[data-dg]').forEach(a => a.onclick = e => { e.preventDefault(); S.grades = S.grades.filter(g => g.id !== a.dataset.dg); save(); panels.grades(); });
};

// ---- Statistiche ----
panels.stats0 = () => {
  const days = [...Array(7)].map((_, i) => iso(addDays(new Date(), i - 6))), vals = days.map(d => S.stats[d] || 0), mx = Math.max(30, ...vals);
  let streak = 0; for (let i = 0; i < 365; i++) { const d = iso(addDays(new Date(), -i)); if (S.stats[d] > 0) streak++; else if (i > 0) break; }
  const tot = Object.values(S.stats).reduce((a, b) => a + b, 0);
  main().innerHTML = `<div class="card"><h2>🔥 ${t('stats')}</h2><div class="grid2"><div><div class="big">${streak}</div><div style="text-align:center">giorni di fila</div></div><div><div class="big">${S.stats[iso(new Date())] || 0}</div><div style="text-align:center">minuti oggi</div></div><div><div class="big">${Math.round(tot / 60)}</div><div style="text-align:center">ore totali</div></div></div></div>
  <div class="card"><h3>Ultimi 7 giorni (minuti)</h3><div class="bars">${vals.map((v, i) => `<div style="height:${v / mx * 100}%"><span>${v}</span></div>`).join('')}</div><div class="row" style="justify-content:space-between" ><span class="muted">${days.map(d => d.slice(8)).join('  ·  ')}</span></div></div>`;
};

// ---- Giochi ----
panels.games = () => {
  main().innerHTML = `<div class="card"><h2>🎮 ${t('games')}</h2><p>Una pausa meritata! CrazyGames si apre in una nuova scheda (il sito non permette di essere incorporato dentro altre app).</p>
  <a class="btn" style="text-decoration:none;display:inline-block;padding:12px 20px" href="https://www.crazygames.com/" target="_blank" rel="noopener">🎮 Apri CrazyGames</a>
  <p class="muted">Consiglio: gioca durante le pause del timer, non durante lo studio. Nota: il sito esterno può mostrare le sue pubblicità, SHASHI no.</p></div>`;
};

// ---- Profilo e impostazioni ----
let deferredInstall = null;
panels.settings = () => {
  const p = S.profile;
  main().innerHTML = `<div class="card"><h2>👤 Account</h2>${USER ? `<div class="row"><b>${esc(USER.name)}</b> <span class="muted">${esc(USER.email)}</span><button class="btn alt" id="so">${t('signout')}</button></div>` : `<div id="gbtn"></div><p class="muted">${CFG.clientId ? '' : 'Per attivare "Accedi con Google" inserisci sotto il tuo Google Client ID (gratuito, vedi README).'}</p>`}
  <p class="muted">I dati sono salvati su questo dispositivo, separati per account. Per spostarli su un altro dispositivo usa Esporta/Importa backup.</p></div>
  <div class="card"><h3>Profilo</h3><div class="row"><label>${t('name')}<input id="pn" value="${esc(p.name)}"></label><label>${t('school')}<input id="ps" value="${esc(p.school)}"></label><label>${t('city')}<input id="pc" value="${esc(p.city)}"></label><label>${t('country')}<input id="pco" value="${esc(p.country)}"></label>
  <label>${t('lang')}<select id="pl">${Object.entries(LN).map(([k, v]) => `<option value="${k}" ${CFG.lang === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label><button class="btn" id="psv">${t('save')}</button></div></div>
  <div class="card"><h3>Avatar</h3><div class="row">${['🧘', '⚡', '🌙', '🌱', '🔥', '🦊', '🐼', '🚀', '👤'].map(a => `<button class="btn alt" data-av="${a}" style="font-size:1.4rem">${a}</button>`).join('')}</div></div>
  <div class="card"><h3>Connessioni (facoltative)</h3>
  <label style="display:flex">Google Client ID<input id="cid" value="${esc(CFG.clientId)}" placeholder="xxxx.apps.googleusercontent.com"></label>
  <label style="display:flex">Chiave API Anthropic (per AI: mappe, podcast, esercizi, interrogazione)<input id="ak" type="password" value="${esc(CFG.apiKey)}" placeholder="sk-ant-…"></label>
  <label style="display:flex">Link Argo<input id="ar" value="${esc(CFG.argoUrl)}"></label>
  <p class="muted">La chiave resta solo nel tuo browser. Senza chiave l'app funziona comunque con generatori semplici offline.</p><button class="btn" id="csv">${t('save')}</button></div>
  <div class="card"><h3>♿ Lettura facile</h3><div class="row"><button class="btn alt" id="fsm">A−</button><button class="btn alt" id="fsp">A+</button><label style="flex-direction:row;align-items:center"><input type="checkbox" id="dys" ${CFG.dys ? 'checked' : ''}>&nbsp;Carattere facilitato (dislessia)</label></div></div>
  <div class="card"><h3>Strumenti</h3><button class="btn alt" id="ins">⬇️ Installa l'app</button><button class="btn alt" id="nt">🔔 Attiva notifiche</button><button class="btn alt" id="ex">Esporta backup</button><label>Importa backup<input type="file" id="im" accept=".json"></label></div>`;
  if (USER) $('#so').onclick = () => { USER = null; localStorage.removeItem('shashi_user'); load(); resetTimer(); buildNav(); panels.settings(); };
  else initGoogle($('#gbtn'));
  $('#psv').onclick = () => { Object.assign(S.profile, { name: $('#pn').value, school: $('#ps').value, city: $('#pc').value, country: $('#pco').value }); CFG.lang = $('#pl').value; saveCfg(); save(); buildNav(); panels.settings(); toast('Salvato ✔️'); };
  $$('[data-av]').forEach(b => b.onclick = () => { S.profile.avatar = b.dataset.av; save(); buildNav(); toast('Avatar aggiornato ' + b.dataset.av); });
  $('#csv').onclick = () => { CFG.clientId = $('#cid').value.trim(); CFG.apiKey = $('#ak').value.trim(); CFG.argoUrl = $('#ar').value.trim() || CFG.argoUrl; saveCfg(); buildNav(); panels.settings(); toast('Salvato ✔️'); };
  $('#fsm').onclick = () => { CFG.fs = Math.max(80, (CFG.fs || 100) - 10); saveCfg(); applyTheme(); }; $('#fsp').onclick = () => { CFG.fs = Math.min(150, (CFG.fs || 100) + 10); saveCfg(); applyTheme(); }; $('#dys').onchange = e => { CFG.dys = e.target.checked; saveCfg(); applyTheme(); };
  $('#ins').onclick = installApp; $('#nt').onclick = openAlerts;
  $('#ex').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' })); a.download = 'shashi-backup.json'; a.click(); };
  $('#im').onchange = async e => { try { S = Object.assign(defaults(), JSON.parse(await e.target.files[0].text())); save(); toast('Backup importato ✔️'); go('settings'); } catch { toast('File non valido.'); } };
};
function initGoogle(box) {
  if (!CFG.clientId || !box) return;
  loadScript('https://accounts.google.com/gsi/client').then(() => {
    google.accounts.id.initialize({ client_id: CFG.clientId, callback: r => {
      const p = JSON.parse(decodeURIComponent(escape(atob(r.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))));
      const guest = JSON.parse(localStorage.getItem('shashi_v1_guest') || 'null');
      USER = { email: p.email, name: p.name, picture: p.picture }; localStorage.setItem('shashi_user', JSON.stringify(USER));
      if (!localStorage.getItem(key()) && guest) localStorage.setItem(key(), JSON.stringify(guest));
      load(); resetTimer(); buildNav(); go('settings'); toast('Benvenuto ' + p.name + '!');
    } });
    google.accounts.id.renderButton(box, { theme: 'filled_blue', size: 'large', text: 'signin_with', locale: CFG.lang });
  }).catch(() => box.innerHTML = '<p class="muted">Impossibile caricare Google (serve internet).</p>');
}
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; const d = $('#directInst'); if (d) d.hidden = false; });
window.addEventListener('appinstalled', () => { deferredInstall = null; $('#installBtn').hidden = true; closeModal(); toast('🎉 SHASHI installata!'); });
function openModal(html) {
  closeModal(); const m = document.createElement('div'); m.id = 'modal'; m.innerHTML = `<div class="mbox" role="dialog" aria-modal="true"><button class="mx" aria-label="Chiudi">✕</button>${html}</div>`;
  m.onclick = e => { if (e.target === m) closeModal(); }; m.querySelector('.mx').onclick = closeModal; document.body.appendChild(m); requestAnimationFrame(() => m.classList.add('on')); return m;
}
function closeModal() { const m = $('#modal'); if (m) m.remove(); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
function installApp() {
  const ua = navigator.userAgent || '', ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1), and = /Android/.test(ua), def = ios ? 'ios' : and ? 'and' : 'desk', sa = isStandalone();
  const step = (n, t, d) => `<div class="istep"><b>${n}</b><div><strong>${t}</strong><p class="muted">${d}</p></div></div>`;
  const tabs = {
    and: step(1, 'Apri il menu del browser', 'Tocca i tre puntini ⋮ in alto a destra (Chrome o Samsung Internet).') + step(2, '“Installa app” o “Aggiungi a schermata Home”', 'Scegli una delle due voci nel menu.') + step(3, 'Conferma', 'SHASHI compare nella schermata Home e si apre a schermo intero.'),
    ios: step(1, 'Usa Safari', 'Su iPhone e iPad l\'installazione funziona solo da Safari, non da Chrome.') + step(2, 'Tocca Condividi', 'È il quadrato con la freccia verso l\'alto, in basso al centro.') + step(3, '“Aggiungi alla schermata Home”', 'Scorri l\'elenco e tocca la voce con il ➕.') + step(4, 'Tocca “Aggiungi”', 'In alto a destra: l\'icona di SHASHI appare nella Home.'),
    desk: step(1, 'Chrome o Edge', 'Nella barra dell\'indirizzo, a destra, clicca l\'icona <b>Installa</b> (monitor con ⊕).') + step(2, 'Safari su Mac', 'Menu <b>File → Aggiungi al Dock…</b>')
  };
  const m = openModal(`<h2>📲 Installa SHASHI</h2><div class="envbox"><span>🔍 ${ios ? 'iPhone / iPad' : and ? 'Android' : 'Computer'}</span><span class="badge">${sa ? '✅ App installata' : '🌐 Nel browser'}</span></div>
  ${sa ? '<p>Stai già usando SHASHI come app installata. 🎉</p>' : ''}
  <button class="btn" id="directInst" ${deferredInstall ? '' : 'hidden'} style="width:100%">⚡ Installa ora con 1 tocco</button>
  <div class="tabs2"><button data-t="and">🤖 Android</button><button data-t="ios">📱 iPhone</button><button data-t="desk">💻 Computer</button></div><div id="itab"></div>
  <p class="muted">Dopo l'installazione funziona anche senza internet.</p>`);
  const show = k => { $('#itab').innerHTML = tabs[k]; $$('.tabs2 button', m).forEach(b => b.classList.toggle('on', b.dataset.t === k)); };
  $$('.tabs2 button', m).forEach(b => b.onclick = () => show(b.dataset.t)); show(def);
  $('#directInst').onclick = () => { if (!deferredInstall) return; deferredInstall.prompt(); deferredInstall.userChoice.then(r => { if (r.outcome === 'accepted') toast('Installazione in corso…'); deferredInstall = null; $('#directInst').hidden = true; }); };
}
function openAlerts() {
  const sup = 'Notification' in window, perm = sup ? Notification.permission : 'unsupported';
  const tg = (id, k, ti, d) => `<label class="tgl"><div><strong>${ti}</strong><p class="muted">${d}</p></div><input type="checkbox" id="${id}" ${S.settings[k] !== false ? 'checked' : ''}></label>`;
  const lab = { granted: '✅ Attive', denied: '🚫 Bloccate dal browser', default: '⏳ Da autorizzare', unsupported: 'Non supportate' }[perm];
  const m = openModal(`<h2>🔔 Avvisi del timer</h2><div class="envbox"><span>Notifiche di sistema</span><span class="badge ${perm === 'granted' ? 'ok' : perm === 'denied' ? 'no' : ''}">${lab}</span></div>
  ${perm === 'default' ? '<button class="btn" id="aReq" style="width:100%">Abilita le notifiche</button>' : ''}
  ${perm === 'denied' ? '<p class="muted">Per sbloccarle: tocca il lucchetto 🔒 accanto all\'indirizzo → Notifiche → Consenti, poi ricarica la pagina.</p>' : ''}
  ${tg('aNat', 'nat', 'Notifica a fine periodo', 'Avviso del sistema anche con l\'app in background')}
  ${tg('aVib', 'vib', 'Vibrazione', 'Vibra alla fine del periodo (telefoni compatibili)')}
  ${tg('aTit', 'tabt', 'Conto alla rovescia nel titolo', 'Mostra il tempo nella scheda e la fa lampeggiare a fine periodo')}
  <button class="btn alt" id="aTest" style="width:100%">⚡ Invia un avviso di prova</button>`);
  const bind = (id, k) => $(id, m).onchange = e => { S.settings[k] = e.target.checked; save(); updTimer(); };
  bind('#aNat', 'nat'); bind('#aVib', 'vib'); bind('#aTit', 'tabt');
  if ($('#aReq', m)) $('#aReq', m).onclick = () => Notification.requestPermission().then(() => openAlerts());
  $('#aTest', m).onclick = () => { beep(); vibrate([150, 100, 150]); notify('⚡ Prova SHASHI', 'Se leggi questo, gli avvisi funzionano!'); toast('🔔 Avviso di prova inviato'); };
}
$('#installBtn').onclick = installApp; $('#installBtn').hidden = isStandalone();

// ---- Pianificatore con banner prossima verifica ----
panels.planner1 = () => {
  panels.planner0();
  const today = iso(new Date()), nx = S.events.filter(e => ['verifica', 'interrogazione'].includes(e.type) && e.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
  const hw = S.homework.filter(h => h.date === iso(addDays(new Date(), 1))).length;
  let msg = '🌤️ Nessuna verifica in programma: ottimo momento per ripassare!';
  if (nx) { const d = Math.round((new Date(nx.date + 'T12:00') - new Date(today + 'T12:00')) / 864e5); msg = `⏳ ${EV[nx.type][0]}${nx.subject ? ' di ' + nx.subject : ''}: ${d === 0 ? '<b>OGGI</b>' : d === 1 ? '<b>domani</b>' : 'tra <b>' + d + ' giorni</b>'}`; }
  { const QUOTES = ['Un passo alla volta: il progresso conta più della perfezione.', 'Studiare 20 minuti ogni giorno vale più di 5 ore la sera prima.', 'Sbagliare è il modo in cui il cervello impara.', 'Oggi sei più preparato/a di ieri.', 'Le pause fanno parte dello studio.', 'Spiega a voce alta quello che hai imparato: lo ricorderai meglio.', 'Inizia: la parte più difficile è cominciare.'];
    const wk = []; for (let i = 0; i < 7; i++) {
      const dt = addDays(new Date(), i), ds = iso(dt), subs = {};
      (S.timetable[dt.getDay()] || '').split(',').map(x => x.trim()).filter(Boolean).forEach(x => subs[x] = 1);
      S.events.filter(e => /verifica|interrogazione/.test(e.type) && e.date >= ds && e.subject).forEach(e => { const dd = (new Date(e.date + 'T12:00') - new Date(ds + 'T12:00')) / 864e5; subs[e.subject] = (subs[e.subject] || 0) + (dd <= 3 ? 3 : dd <= 7 ? 2 : 1); });
      const names = Object.keys(subs), ws = names.reduce((a, k) => a + subs[k], 0) || 1, tot = S.goal || 120;
      wk.push(`<div><span><b>${dt.toLocaleDateString(CFG.lang, { weekday: 'short', day: 'numeric' })}</b> ${names.length ? names.map(k => esc(k) + ' <span class="badge">' + (Math.max(5, Math.round(tot * subs[k] / ws / 5) * 5)) + ' min</span>').join(' ') : '<span class="muted">riposo 😌</span>'}</span></div>`);
    }
    main().insertAdjacentHTML('beforeend', `<div class="card"><h3>📆 Piano della settimana</h3><p class="muted">Minuti consigliati per materia (in base all'obiettivo giornaliero e alle verifiche vicine).</p><div class="list">${wk.join('')}</div><p class="muted">💬 ${QUOTES[Math.floor(Date.now() / 864e5) % QUOTES.length]}</p></div>`); }
  main().insertAdjacentHTML('afterbegin', `<div class="card" style="background:linear-gradient(90deg,var(--a),var(--b));color:#fff"><h3 style="margin:0">${S.profile.name ? 'Ciao ' + esc(S.profile.name) + '! ' : ''}${msg}</h3>${hw ? `<p style="margin:6px 0 0">📝 Compiti per domani: ${hw}</p>` : ''}</div>`);
};

// ---- Statistiche con obiettivo ----
panels.stats = () => {
  panels.stats0();
  const done = S.stats[iso(new Date())] || 0, g = S.goal || 120, pc = Math.min(100, Math.round(done / g * 100));
  main().insertAdjacentHTML('afterbegin', `<div class="card"><h3>🎯 Obiettivo di oggi</h3><div style="background:#0002;border-radius:999px;overflow:hidden;height:22px"><div style="width:${pc}%;height:100%;background:linear-gradient(90deg,var(--a),var(--b))"></div></div>
  <p>${done} / ${g} minuti (${pc}%)</p><label>Obiettivo (minuti al giorno)<input type="number" id="goalIn" value="${g}" min="10" step="10" style="width:100px"></label><button class="btn" id="goalSv">${t('save')}</button></div>`);
  { const st = addDays(new Date(), -83), off = (st.getDay() + 6) % 7; let hm = '<div></div>'.repeat(off);
    for (let i = 0; i < 84; i++) { const d = iso(addDays(st, i)), v = S.stats[d] || 0, a = v === 0 ? .1 : Math.min(1, .3 + v / 120 * .7); hm += `<div title="${d}: ${v} min" style="border-radius:4px;background:var(--a);opacity:${a}"></div>`; }
    main().insertAdjacentHTML('beforeend', `<div class="card"><h3>🗓️ Ultimi 3 mesi</h3><div style="display:grid;grid-template-rows:repeat(7,16px);grid-auto-flow:column;grid-auto-columns:16px;gap:3px">${hm}</div><p class="muted">Più il colore è scuro, più hai studiato quel giorno.</p></div>`); }
  main().insertAdjacentHTML('beforeend', badgesCard());
  const ss = Object.entries(S.subjStats || {}).sort((a, b) => b[1] - a[1]), mx = Math.max(1, ...ss.map(x => x[1]));
  main().insertAdjacentHTML('beforeend', `<div class="card"><h3>📚 Tempo per materia</h3>${ss.map(([k, v]) => `<div style="margin:6px 0"><div class="row" style="justify-content:space-between"><b>${esc(k)}</b><span>${v} min</span></div><div style="background:#0002;border-radius:99px;height:12px;overflow:hidden"><div style="width:${v / mx * 100}%;height:100%;background:linear-gradient(90deg,var(--a),var(--b))"></div></div></div>`).join('') || '<p class="muted">Scegli una materia nel Timer: qui vedrai quanto studi ogni materia.</p>'}</div>`);
  $$('#main .big').forEach(el => { const to = +el.textContent; if (!to) return; let n = 0; const st = Math.max(1, Math.ceil(to / 30)), iv = setInterval(() => { n = Math.min(to, n + st); el.textContent = n; if (n >= to) clearInterval(iv); }, 25); });
  $('#goalSv').onclick = () => { S.goal = +$('#goalIn').value || 120; save(); panels.stats(); toast('Obiettivo salvato ✔️'); };
};

// ---- Lista da fare ----
panels.todo = () => {
  const PR = { alta: ['🔴', 0], media: ['🟡', 1], bassa: ['🟢', 2] }, pr = x => PR[x.pr || 'media'];
  const sorted = [...S.todos].sort((a, b) => (a.done - b.done) || (pr(a)[1] - pr(b)[1]));
  const open = sorted.filter(x => !x.done), dn = sorted.filter(x => x.done);
  const item = x => `<div><span style="${x.done ? 'text-decoration:line-through;opacity:.55' : ''}"><input type="checkbox" data-tk="${x.id}" ${x.done ? 'checked' : ''}> ${pr(x)[0]} ${esc(x.text)} ${x.due ? '<span class="badge">' + esc(x.due) + '</span>' : ''}</span><span>${x.done ? '' : `<button class="btn alt" data-tf="${x.id}">🎯 Focus</button>`}<button class="btn del" data-td="${x.id}">✕</button></span></div>`;
  main().innerHTML = `<div class="card"><h2>✅ ${t('todo')}</h2><p class="muted">Ogni cosa completata dà +5 XP. Con 🎯 Focus la imposti come obiettivo del timer.</p><div class="row"><input id="tdText" placeholder="Es. Ripassare Storia cap. 3" style="flex:1;min-width:200px"><label>Priorità<select id="tdPr"><option value="alta">🔴 Alta</option><option value="media" selected>🟡 Media</option><option value="bassa">🟢 Bassa</option></select></label><label>Scadenza<input type="date" id="tdDue"></label><button class="btn" id="tdAdd">${t('add')}</button></div></div>
  <div class="card"><div class="list">${open.map(item).join('') || empty('🎉', 'Tutto fatto!', 'Nessuna cosa da fare: aggiungine una qui sopra.')}</div></div>
  ${dn.length ? `<div class="card"><h3>Completate (${dn.length})</h3><div class="list">${dn.map(item).join('')}</div><button class="btn alt" id="tdClear">Svuota completate</button></div>` : ''}`;
  const add = () => { const v = $('#tdText').value.trim(); if (!v) return; S.todos.push({ id: uid(), text: v, due: $('#tdDue').value, pr: $('#tdPr').value, done: false }); save(); panels.todo(); };
  $('#tdAdd').onclick = add; $('#tdText').onkeydown = e => { if (e.key === 'Enter') add(); };
  $$('[data-tk]').forEach(c => c.onchange = () => { const x = S.todos.find(y => y.id === c.dataset.tk); x.done = c.checked; if (c.checked) { S.cnt.tasks++; addXp(5); } save(); panels.todo(); });
  $$('[data-tf]').forEach(b => b.onclick = () => { const x = S.todos.find(y => y.id === b.dataset.tf); S.focusTask = x.text; save(); go('timer'); toast('🎯 Obiettivo impostato: ' + x.text); });
  $$('[data-td]').forEach(b => b.onclick = () => { S.todos = S.todos.filter(y => y.id !== b.dataset.td); save(); panels.todo(); });
  if ($('#tdClear')) $('#tdClear').onclick = () => { S.todos = S.todos.filter(y => !y.done); save(); panels.todo(); };
};
$('#darkBtn').onclick = () => {
  CFG.dark = !CFG.dark; document.body.classList.add('theme-anim'); setTimeout(() => document.body.classList.remove('theme-anim'), 700);
  saveCfg(); applyTheme(); try { $('#darkBtn').animate([{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(360deg) scale(1.3)' }, { transform: 'rotate(360deg) scale(1)' }], { duration: 550, easing: 'ease-out' }); } catch { }
};
// effetto onda sui pulsanti
document.addEventListener('click', e => {
  const el = e.target.closest && e.target.closest('.btn,.nav,.pill'); if (!el) return;
  const r = el.getBoundingClientRect(), z = Math.max(r.width, r.height), sp = document.createElement('span'); sp.className = 'ripple';
  sp.style.cssText = `width:${z}px;height:${z}px;left:${e.clientX - r.left - z / 2}px;top:${e.clientY - r.top - z / 2}px`; el.appendChild(sp); setTimeout(() => sp.remove(), 650);
});
$('#xpPill').onclick = showLevelModal; $('#xpPill').style.cursor = 'pointer';
// il cuore e' cliccabile
$('.heart').onclick = () => {
  for (let i = 0; i < 16; i++) {
    const h = document.createElement('span'); h.textContent = ['❤️', '💖', '💗', '✨'][i % 4];
    h.style.cssText = `position:fixed;left:${innerWidth / 2 + (Math.random() - .5) * 120}px;top:90px;font-size:${16 + Math.random() * 20}px;pointer-events:none;z-index:150;animation:heartFall ${1.5 + Math.random()}s ease-out forwards;--dx:${(Math.random() - .5) * 260}px`;
    document.body.appendChild(h); setTimeout(() => h.remove(), 2700);
  }
};
// intestazione compatta quando scorri
addEventListener('scroll', () => $('#top').classList.toggle('small', scrollY > 40), { passive: true });
// schermata iniziale
setTimeout(() => { const sp = $('#splash'); if (sp) sp.classList.add('out'); }, 900); setTimeout(() => { const sp = $('#splash'); if (sp) sp.remove(); }, 1500);

// ---- Argo, assistente focus ----
const ARGO_TIPS = ['Pronto per la tua sessione? Scegli un obiettivo chiaro, avvia il timer e disattiva le notifiche!', 'Ricorda di mantenere una postura rilassata e fai 3 respiri profondi prima di premere Start.', "La costanza batte sempre l'intensità: 25 minuti di presenza valgono più di ore distratte.", 'Hai un compito impegnativo? Spezzettalo in piccole cose da fare!', 'Quando scade il timer, stacca gli occhi dallo schermo e guarda lontano per rigenerarti.', "Un sorso d'acqua fresca fa miracoli per la chiarezza mentale!", 'Spiega ad alta voce quello che hai studiato: se riesci a dirlo semplice, lo hai capito.', 'Ripassa il giorno dopo: la ripetizione spaziata è la tecnica più efficace che esista.'];
function argoPick() {
  const T = [...ARGO_TIPS], today = iso(new Date()), nx = S.events.filter(e => ['verifica', 'interrogazione'].includes(e.type) && e.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
  if (nx) { const d = Math.round((new Date(nx.date + 'T12:00') - new Date(today + 'T12:00')) / 864e5); if (d <= 7) { const m = `Hai ${EV[nx.type][0].toLowerCase()}${nx.subject ? ' di ' + nx.subject : ''} ${d === 0 ? 'oggi' : d === 1 ? 'domani' : 'tra ' + d + ' giorni'}: fai un quiz o una interrogazione AI!`; T.push(m, m, m); } }
  if (TM.run) T.push('Stai studiando: resta concentrato fino al suono della campanella! 🔔', 'Ottimo lavoro, continua così: ogni minuto conta.');
  const left = S.todos.filter(x => !x.done).length; if (left) T.push(`Hai ${left} cose da fare: scegline una e premi 🎯 Focus.`);
  return T[Math.floor(Math.random() * T.length)];
}
function addArgo() {
  main().insertAdjacentHTML('afterbegin', `<div class="card" style="display:flex;gap:12px;align-items:center;border-left:5px solid var(--a)"><div class="argoIco">🐾</div><div style="flex:1;min-width:0"><div class="row" style="justify-content:space-between;align-items:center"><b style="color:var(--a);text-transform:uppercase;font-size:.75rem;letter-spacing:.08em">Argo · assistente focus</b><button class="btn alt" id="argoMore">🔄 Altro consiglio</button></div><p id="argoTxt" style="margin:4px 0 0;font-style:italic">“${esc(argoPick())}”</p></div></div>`);
  $('#argoMore').onclick = () => { const x = $('#argoTxt'); x.style.opacity = 0; setTimeout(() => { x.textContent = '“' + argoPick() + '”'; x.style.opacity = 1; }, 200); };
}
panels.planner = () => { panels.planner1(); addArgo(); };
panels.timer = () => { panels.timer0(); addArgo(); };

// ---- Badge e livelli ----
const streakDays = () => { let n = 0; for (let i = 0; i < 365; i++) { const d = iso(addDays(new Date(), -i)); if ((S.stats[d] || 0) > 0) n++; else if (i > 0) break; } return n; };
const totalMin = () => Object.values(S.stats).reduce((a, b) => a + b, 0);
const BADGES = [
  { id: 'primo', t: '🐣 Primo Passo', d: 'Completa la tua prima sessione col timer', ok: () => S.cnt.sessions >= 1 },
  { id: 'costanza', t: '🔥 Fiamma Viva', d: 'Studia 3 giorni di fila', ok: () => streakDays() >= 3 },
  { id: 'deep', t: '🧠 Deep Worker', d: 'Completa una sessione da 50 minuti o più', ok: () => S.cnt.deep >= 1 },
  { id: 'tasker', t: '🎯 Super Tasker', d: 'Completa 5 cose da fare', ok: () => S.cnt.tasks >= 5 },
  { id: 'cento', t: '⏱️ Cento Minuti', d: 'Accumula 100 minuti di studio', ok: () => totalMin() >= 100 },
  { id: 'perfetto', t: '💯 Quiz Perfetto', d: 'Rispondi bene a tutte le domande di un quiz', ok: () => S.cnt.perfect >= 1 },
  { id: 'mappa', t: '🕸️ Cartografo', d: 'Crea la tua prima mappa concettuale', ok: () => S.cnt.maps >= 1 },
  { id: 'podcaster', t: '🎙️ Podcaster', d: 'Crea il tuo primo podcast', ok: () => S.cnt.pods >= 1 },
  { id: 'respiro', t: '🌬️ Respiro Calmo', d: 'Completa una respirazione guidata', ok: () => S.cnt.breath >= 1 },
  { id: 'zen', t: '🧘 Maestro Shanti', d: 'Completa tutti i micro-rituali in un giorno', ok: () => S.cnt.rituals >= 1 },
  { id: 'leggenda', t: '👑 Leggenda SHASHI', d: 'Raggiungi il livello 5', ok: () => lvl() >= 5 }
];
function checkBadges() { S.badges = S.badges || []; BADGES.forEach(b => { if (!S.badges.includes(b.id) && b.ok()) { S.badges.push(b.id); save(); confetti(); toast('🏅 Nuovo badge: ' + b.t, 6000); } }); }
function badgesCard() {
  const got = new Set(S.badges || []);
  return `<div class="card"><h3>🏅 Badge (${got.size}/${BADGES.length})</h3><div class="grid2">${BADGES.map(b => `<div class="q" style="${got.has(b.id) ? '' : 'opacity:.45;filter:grayscale(1)'}"><b>${b.t}</b><br><span class="muted">${got.has(b.id) ? '🔓 Sbloccato' : '🔒 ' + b.d}</span></div>`).join('')}</div></div>`;
}
function showLevelModal() {
  const L = lvl(), lo = 40 * (L - 1) ** 2, hi = 40 * L ** 2, xp = S.xp || 0, pc = Math.round((xp - lo) / (hi - lo) * 100), TITLES = ['Neofita Focus', 'Apprendista', 'Deep Worker', 'Esploratore', 'Maestro Shanti', 'Leggenda SHASHI'];
  const locked = BADGES.filter(b => !(S.badges || []).includes(b.id)).slice(0, 3), o = document.createElement('div'); o.className = 'ovl';
  o.innerHTML = `<div class="card" style="text-align:center"><div style="font-size:3rem">⭐</div><h2>Livello ${L} · ${TITLES[Math.min(L - 1, 5)]}</h2><p class="muted">${xp} XP · ne servono ${hi - xp} per il livello ${L + 1}</p>
  <div style="background:#0002;border-radius:99px;height:14px;overflow:hidden"><div style="width:${pc}%;height:100%;background:linear-gradient(90deg,var(--a),var(--b))"></div></div>
  <h4 style="text-align:left">Prossimi traguardi</h4><div style="text-align:left">${locked.map(b => `<p>${b.t}<br><span class="muted">${b.d}</span></p>`).join('') || '<p>Hai sbloccato tutti i badge! 🎉</p>'}</div>
  <p class="muted" style="text-align:left">Come ottieni XP: timer (1 XP al minuto), quiz (+5 a risposta giusta, +10 se perfetto), flashcard (+2), cose da fare (+5), mappe e podcast (+10), respirazione (+5), rituali (+10).</p><button class="btn" id="lvClose">Capito!</button></div>`;
  document.body.appendChild(o); const c = () => o.remove(); $('#lvClose').onclick = c; o.onclick = e => { if (e.target === o) c(); };
}

// ---- Spazio Shanti ----
let brTimers = [];
panels.shanti = () => {
  const today = iso(new Date()); S.shanti = S.shanti || { date: today, intention: '', rituals: {}, notes: [] };
  if (S.shanti.date !== today) { S.shanti.date = today; S.shanti.intention = ''; S.shanti.rituals = {}; S.shanti.rewarded = false; save(); }
  const sh = S.shanti, R = [['water', "💧 Bevi un bicchiere d'acqua prima di studiare"], ['breathe', '🌬️ 3 respiri profondi prima di avviare il timer'], ['stretch', '🤸 Stretching leggero durante la pausa']];
  main().innerHTML = `<div class="card"><h2>🌌 ${t('shanti')}</h2><p class="muted">Un angolo di calma: intenzione, respiro, gratitudine e piccoli rituali per studiare meglio.</p></div>
  <div class="card"><h3>✨ Intenzione della giornata</h3><textarea id="shInt" style="min-height:80px" placeholder="Es: rimanere calmo nelle difficoltà e dedicare 1 ora di focus ininterrotto…">${esc(sh.intention)}</textarea></div>
  <div class="card"><h3>🌬️ Respirazione guidata</h3><div class="brc" id="brCircle">Pronto</div><div class="row" style="justify-content:center"><button class="btn" id="brGo">Inizia (5 respiri)</button></div><p class="muted" style="text-align:center">Inspira 4 s · trattieni 2 s · espira 6 s</p></div>
  <div class="card"><h3>🌿 Micro-rituali di equilibrio</h3>${R.map(([k, l]) => `<label style="flex-direction:row;align-items:center;gap:8px;display:flex;margin:8px 0"><input type="checkbox" data-rt="${k}" ${sh.rituals[k] ? 'checked' : ''}> ${l}</label>`).join('')}<p class="muted">Completali tutti nello stesso giorno: +10 XP e un badge.</p></div>
  <div class="card"><h3>🌸 Note di gratitudine e pensieri</h3><div class="row"><input id="shNote" placeholder="Scrivi una nota di gratitudine…" style="flex:1;min-width:200px"><button class="btn" id="shAdd">+ Aggiungi</button></div>
  <div class="grid2" style="margin-top:10px">${sh.notes.map(n => `<div class="q"><i>“${esc(n.text)}”</i><div class="row" style="justify-content:space-between;align-items:center"><span class="muted">📅 ${esc(n.date)}</span><button class="btn del" data-dn="${n.id}">✕</button></div></div>`).join('') || '<p class="muted">Nessuna nota: aggiungi il tuo primo pensiero positivo!</p>'}</div></div>`;
  $('#shInt').oninput = e => { sh.intention = e.target.value; save(); };
  const addN = () => { const v = $('#shNote').value.trim(); if (!v) return; sh.notes.unshift({ id: uid(), text: v, date: new Date().toLocaleDateString(CFG.lang, { day: 'numeric', month: 'short' }) }); save(); panels.shanti(); toast('Nota aggiunta 🌸'); };
  $('#shAdd').onclick = addN; $('#shNote').onkeydown = e => { if (e.key === 'Enter') addN(); };
  $$('[data-dn]').forEach(b => b.onclick = () => { sh.notes = sh.notes.filter(n => n.id !== b.dataset.dn); save(); panels.shanti(); });
  $$('[data-rt]').forEach(c => c.onchange = () => { sh.rituals[c.dataset.rt] = c.checked; save(); if (R.every(([k]) => sh.rituals[k]) && !sh.rewarded) { sh.rewarded = true; S.cnt.rituals++; addXp(10); confetti(); toast('🌿 Tutti i rituali completati! +10 XP'); } });
  const stopBr = () => { brTimers.forEach(clearTimeout); brTimers = []; };
  $('#brGo').onclick = () => {
    const c = $('#brCircle'), b = $('#brGo'); if (brTimers.length) { stopBr(); c.style.transform = ''; c.textContent = 'Pronto'; b.textContent = 'Inizia (5 respiri)'; return; }
    b.textContent = 'Ferma'; let n = 0; const at = (ms, fn) => brTimers.push(setTimeout(() => { if ($('#brCircle')) fn(); else stopBr(); }, ms));
    const cycle = () => {
      if (n >= 5) { stopBr(); c.style.transform = ''; c.textContent = 'Bravo! 🌿'; b.textContent = 'Inizia (5 respiri)'; S.cnt.breath++; addXp(5); return; }
      n++; c.style.setProperty('--dur', '4s'); c.textContent = 'Inspira…'; c.style.transform = 'scale(1.4)';
      at(4000, () => { c.textContent = 'Trattieni…'; });
      at(6000, () => { c.style.setProperty('--dur', '6s'); c.textContent = 'Espira…'; c.style.transform = 'scale(.8)'; });
      at(12000, cycle);
    }; cycle();
  };
};

// ---- Ricerca rapida ----
function openPalette() {
  if ($('#pal')) return;
  const items = [...NAV_L, ...NAV_R, 'games'].map(k => ({ k, label: ICON[k] + ' ' + t(k) })); items.push({ k: '_dark', label: '🌙 Cambia tema chiaro/scuro' }, { k: '_argo', label: '📚 Apri Portale Argo' });
  const o = document.createElement('div'); o.className = 'ovl'; o.id = 'pal'; o.style.alignItems = 'flex-start';
  o.innerHTML = `<div class="card" style="margin-top:10vh"><input id="palIn" placeholder="Dove vuoi andare? (es. timer, podcast…)" style="width:100%"><div class="list" id="palList" style="max-height:50vh;overflow:auto"></div><p class="muted" style="margin:8px 0 0">↑↓ per scegliere · Invio per aprire · Esc per chiudere</p></div>`;
  document.body.appendChild(o); let sel = 0, shown = items;
  const close = () => o.remove(), run = x => { if (!x) return; close(); if (x.k === '_dark') $('#darkBtn').click(); else if (x.k === '_argo') window.open(CFG.argoUrl, '_blank', 'noopener'); else go(x.k); };
  const draw = () => { $('#palList').innerHTML = shown.map((x, i) => `<div data-i="${i}" style="cursor:pointer;border-radius:8px;${i === sel ? 'background:color-mix(in srgb,var(--a) 22%,transparent)' : ''}"><span>${esc(x.label)}</span></div>`).join('') || '<p class="muted">Nessun risultato</p>'; $$('#palList [data-i]').forEach(e => e.onclick = () => run(shown[+e.dataset.i])); };
  $('#palIn').oninput = e => { const q = e.target.value.toLowerCase(); shown = items.filter(x => x.label.toLowerCase().includes(q)); sel = 0; draw(); };
  $('#palIn').onkeydown = e => { if (e.key === 'ArrowDown') { sel = Math.min(shown.length - 1, sel + 1); draw(); e.preventDefault(); } else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); draw(); e.preventDefault(); } else if (e.key === 'Enter') run(shown[sel]); else if (e.key === 'Escape') close(); };
  o.onclick = e => { if (e.target === o) close(); }; draw(); $('#palIn').focus();
}
addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); } });
$('#searchBtn').onclick = openPalette; $('#sheetBg').onclick = closeSheet;

// ---- Benvenuto ----
function onboard() {
  if (S.profile.name || localStorage.getItem('shashi_onb')) return;
  const o = document.createElement('div'); o.className = 'ovl';
  o.innerHTML = `<div class="card"><h2>📖 Benvenuto/a in SHASHI!</h2><p class="muted">Dimmi qualcosa di te per personalizzare l'app (puoi cambiarlo quando vuoi).</p><div class="row">
  <label>Nome<input id="ob-n"></label><label>Scuola<input id="ob-s"></label><label>Città<input id="ob-c"></label><label>Paese<input id="ob-p"></label>
  <label>Lingua<select id="ob-l">${Object.entries(LN).map(([k, v]) => `<option value="${k}" ${CFG.lang === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
  <label>Livello<select id="ob-v">${['lv1', 'lv2', 'lv3', 'lv4'].map(k => `<option value="${k}" ${k === 'lv3' ? 'selected' : ''}>${t(k)}</option>`).join('')}</select></label></div>
  <button class="btn" id="ob-go">Iniziamo 🚀</button> <button class="btn alt" id="ob-sk">Salta</button></div>`;
  document.body.appendChild(o);
  const close = () => { try { localStorage.setItem('shashi_onb', '1'); } catch { } o.remove(); };
  $('#ob-sk').onclick = close;
  $('#ob-go').onclick = () => {
    Object.assign(S.profile, { name: $('#ob-n').value.trim(), school: $('#ob-s').value.trim(), city: $('#ob-c').value.trim(), country: $('#ob-p').value.trim() });
    CFG.lang = $('#ob-l').value; S.sel.level = $('#ob-v').value; saveCfg(); save(); close(); buildNav(); go('planner'); toast('Ciao ' + (S.profile.name || '') + '! 👋');
  };
}

// ---------- avvio ----------
document.body.classList.add('boot'); setTimeout(() => document.body.classList.remove('boot'), 2200); $('#main').classList.add('enter'); setTimeout(() => $('#main').classList.remove('enter'), 1000);
applyTheme(); load(); resetTimer(); buildNav(); panels.planner(); reminders(); onboard();
if (location.hash && panels[location.hash.slice(1)]) go(location.hash.slice(1));
setInterval(applyTheme, 60000);
if ('speechSynthesis' in window) speechSynthesis.getVoices();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
