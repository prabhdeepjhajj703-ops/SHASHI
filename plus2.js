/* SHASHI plus2.js — salvataggio efficiente, Google Drive (cartella SHASHI), animazioni stile PowerPoint, avvio. */
'use strict';

// ============ SALVATAGGIO EFFICIENTE (raggruppa le scritture, salva anche alla chiusura) ============
const SV = { t: 0, key: '', snap: null };
function flushSave() {
  if (!SV.t) return; clearTimeout(SV.t); SV.t = 0;
  try { localStorage.setItem(SV.key, JSON.stringify(SV.snap)); }
  catch (e) { toast('Memoria piena: elimina immagini o appunti, oppure collega Google Drive.', 6000); }
}
save = function () { S._ts = Date.now(); SV.key = key(); SV.snap = S; if (!SV.t) SV.t = setTimeout(flushSave, 400); gdSchedule(); };
{ const l0 = load; load = function () { flushSave(); return l0.apply(this, arguments); }; }
window.addEventListener('pagehide', flushSave); window.addEventListener('beforeunload', flushSave);
document.addEventListener('visibilitychange', () => { if (document.hidden) flushSave(); });

// ============ GOOGLE DRIVE: cartella "SHASHI" con tutti i dati ============
const GD = { token: null, exp: 0, folder: null, files: {}, busy: false, timer: 0, hash: {}, status: '', err: '' };
const GD_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const GFILES = { appunti: 'appunti.json', mappe: 'mappe.json', calendario: 'calendario-orari.json', altro: 'studio-profilo.json' };
const GGROUPS = { appunti: ['folders', 'notes'], mappe: ['maps'], calendario: ['events', 'homework', 'timetable', 'todos'] };
const gdValid = () => !!GD.token && Date.now() < GD.exp;
const gdSay = (st, err = '') => { GD.status = st; GD.err = err; const b = $('#gdStatus'); if (b) gdPaint(); };

async function gdAuth(interactive) {
  if (gdValid()) return GD.token;
  if (!CFG.clientId) throw new Error('Manca il Client ID Google: inseriscilo qui sotto (guida passo passo).');
  await loadScript('https://accounts.google.com/gsi/client');
  if (!window.google || !google.accounts || !google.accounts.oauth2) throw new Error('Impossibile caricare Google (serve internet).');
  return new Promise((ok, ko) => {
    const c = google.accounts.oauth2.initTokenClient({
      client_id: CFG.clientId, scope: GD_SCOPE,
      callback: r => { if (r.error) return ko(new Error(r.error_description || r.error)); GD.token = r.access_token; GD.exp = Date.now() + ((r.expires_in || 3600) - 90) * 1000; CFG.driveOn = true; saveCfg(); ok(GD.token); },
      error_callback: e => ko(new Error(e && e.type === 'popup_closed' ? 'Hai chiuso la finestra di Google prima di consentire l\'accesso.' : e && e.type === 'popup_failed_to_open' ? 'Il browser ha bloccato la finestra di Google: consenti i popup e riprova.' : (e && (e.message || e.type)) || 'Accesso negato'))
    });
    c.requestAccessToken({ prompt: interactive && !CFG.driveOn ? 'consent' : '', hint: USER && USER.email ? USER.email : undefined });
  });
}
async function gd(path, opt = {}, upload) {
  const tk = await gdAuth(false);
  const r = await fetch((upload ? 'https://www.googleapis.com/upload/drive/v3/' : 'https://www.googleapis.com/drive/v3/') + path, { ...opt, headers: { authorization: 'Bearer ' + tk, ...(opt.headers || {}) } });
  if (r.status === 401) { GD.token = null; throw new Error('Sessione Google scaduta: premi «Sincronizza ora».'); }
  if (!r.ok) { const d = await r.json().catch(() => ({})); const m = d.error && d.error.message || ''; throw new Error(/has not been used|disabled|accessNotConfigured/i.test(m) ? 'Attiva «Google Drive API» nel tuo progetto Google Cloud (vedi guida).' : (m || 'Errore Drive ' + r.status)); }
  return r;
}
async function gdFolder() {
  if (GD.folder) return GD.folder;
  const q = encodeURIComponent("mimeType='application/vnd.google-apps.folder' and name='SHASHI' and trashed=false");
  let d = await (await gd(`files?q=${q}&fields=files(id,name)&spaces=drive`)).json();
  if (d.files && d.files[0]) return GD.folder = d.files[0].id;
  d = await (await gd('files?fields=id', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'SHASHI', mimeType: 'application/vnd.google-apps.folder' }) })).json();
  return GD.folder = d.id;
}
async function gdList() {
  const f = await gdFolder(), q = encodeURIComponent(`'${f}' in parents and trashed=false`);
  const d = await (await gd(`files?q=${q}&fields=files(id,name,modifiedTime)&pageSize=50`)).json(); GD.files = {}; (d.files || []).forEach(x => GD.files[x.name] = x); return GD.files;
}
async function gdPut(name, obj) {
  const f = await gdFolder(), ex = GD.files[name], b = 'shashi' + Math.random().toString(36).slice(2), meta = ex ? { name } : { name, parents: [f] };
  const body = `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(obj)}\r\n--${b}--`;
  const r = await gd(ex ? `files/${ex.id}?uploadType=multipart&fields=id,name` : 'files?uploadType=multipart&fields=id,name', { method: ex ? 'PATCH' : 'POST', headers: { 'content-type': 'multipart/related; boundary=' + b }, body }, true);
  return GD.files[name] = await r.json();
}
async function gdGet(name) { const ex = GD.files[name]; if (!ex) return null; return (await gd(`files/${ex.id}?alt=media`)).json(); }
function gdSplit() {
  const all = JSON.parse(JSON.stringify(S)), out = {}, used = new Set();
  for (const [g, keys] of Object.entries(GGROUPS)) { out[g] = {}; keys.forEach(k => { if (k in all) { out[g][k] = all[k]; used.add(k); } }); }
  out.altro = {}; Object.keys(all).forEach(k => { if (!used.has(k)) out.altro[k] = all[k]; }); return out;
}
async function gdPush() {
  await gdList(); const parts = gdSplit(); let n = 0;
  for (const g of Object.keys(GFILES)) { const j = JSON.stringify(parts[g]); if (GD.hash[g] === j.length + ':' + hash32(j) && GD.files[GFILES[g]]) continue; await gdPut(GFILES[g], parts[g]); GD.hash[g] = j.length + ':' + hash32(j); n++; }
  await gdPut('info.json', { app: 'SHASHI', ts: S._ts || Date.now(), user: USER ? USER.email : 'ospite', saved: new Date().toISOString() });
  CFG.driveLast = Date.now(); saveCfg(); return n;
}
function hash32(s) { let h = 5381; for (let i = 0; i < s.length; i += 7) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h; }
async function gdPull() {
  await gdList(); const merged = {};
  for (const g of Object.keys(GFILES)) { const part = await gdGet(GFILES[g]); if (part) Object.assign(merged, part); GD.hash[g] = part ? JSON.stringify(part).length + ':' + hash32(JSON.stringify(part)) : ''; }
  if (!Object.keys(merged).length) throw new Error('Nella cartella SHASHI non ci sono ancora dati.');
  flushSave(); localStorage.setItem(key(), JSON.stringify(merged)); load(); resetTimer(); buildNav(); go(cur); return merged;
}
async function gdSync(interactive = true) {
  if (GD.busy) return; GD.busy = true; gdSay('busy');
  try {
    await gdAuth(interactive); await gdList(); const info = GD.files['info.json'] ? await gdGet('info.json') : null;
    if (info && info.ts > (S._ts || 0) + 5000 && Object.keys(GD.files).length > 1) {
      const when = new Date(info.ts).toLocaleString(CFG.lang);
      if (confirm(`Sul tuo Google Drive ci sono dati più recenti (${when}).\n\nOK = scarica quelli di Drive su questo dispositivo\nAnnulla = sostituisci Drive con i dati di questo dispositivo`)) { await gdPull(); toast('☁️ Dati ripristinati da Google Drive ✔️'); CFG.driveLast = Date.now(); saveCfg(); gdSay('ok'); return; }
    }
    flushSave(); const n = await gdPush(); gdSay('ok'); toast(n ? '☁️ Dati salvati nella cartella SHASHI su Drive ✔️' : '☁️ Drive è già aggiornato ✔️');
  } catch (e) { gdSay('err', e.message); toast('☁️ ' + e.message, 7000); }
  finally { GD.busy = false; if (GD.status === 'busy') gdSay('ok'); }
}
function gdSchedule() {
  if (!CFG.driveOn || CFG.driveAuto === false) return; clearTimeout(GD.timer);
  if (!gdValid()) { if (GD.status !== 'stale') gdSay('stale'); return; }
  GD.timer = setTimeout(async () => { if (GD.busy || !gdValid()) return; GD.busy = true; gdSay('busy'); try { flushSave(); await gdPush(); gdSay('ok'); } catch (e) { gdSay('err', e.message); } finally { GD.busy = false; } }, 6000);
}
// al primo tocco, se Drive era collegato, ripristina il collegamento (il browser consente il popup solo con un gesto)
document.addEventListener('pointerdown', () => { if (CFG.driveOn && CFG.driveAuto !== false && !gdValid() && !GD.busy && !(window.__idle && __idle.state.on)) gdSync(false).catch(() => { }); }, { once: true });
const gdAgo = () => { if (!CFG.driveLast) return 'mai'; const m = Math.round((Date.now() - CFG.driveLast) / 60000); return m < 1 ? 'adesso' : m < 60 ? m + ' min fa' : new Date(CFG.driveLast).toLocaleString(CFG.lang); };
function gdPaint() {
  const b = $('#gdStatus'); if (!b) return; const st = GD.status || (CFG.driveOn ? (gdValid() ? 'ok' : 'stale') : 'off');
  const m = { off: ['⚪', 'Non collegato'], busy: ['🔄', 'Sincronizzazione in corso…'], ok: ['🟢', 'Collegato · ultimo salvataggio: ' + gdAgo()], stale: ['🟡', 'Da ricollegare (sessione scaduta): premi «Sincronizza ora»'], err: ['🔴', 'Errore: ' + GD.err] }[st];
  b.innerHTML = `<span class="gdDot">${m[0]}</span><span>${esc(m[1])}</span>`; const u = $('#gdOpen'); if (u) { u.hidden = !GD.folder; if (GD.folder) u.href = 'https://drive.google.com/drive/folders/' + GD.folder; }
}
function driveCard() {
  const orig = location.origin;
  $('#oaiCard').insertAdjacentHTML('beforebegin', `<div class="card" id="gdCard"><h3>☁️ Dati su Google Drive</h3>
  <p class="muted">Collega Google e SHASHI crea nel tuo Drive una cartella chiamata <b>SHASHI</b> dove salva appunti, mappe, calendario, orari e progressi. Così non perdi nulla e li ritrovi su ogni dispositivo. SHASHI vede <b>solo i file che crea lui</b>, non il resto del tuo Drive.</p>
  <div class="gdBar" id="gdStatus"></div>
  <div class="row"><button class="btn" id="gdConn">🔗 ${CFG.driveOn ? 'Sincronizza ora' : 'Collega Google Drive'}</button><button class="btn alt" id="gdRestore">⬇️ Ripristina da Drive</button><a class="btn alt" id="gdOpen" target="_blank" rel="noopener" hidden>📂 Apri la cartella</a><button class="btn del" id="gdOff" ${CFG.driveOn ? '' : 'hidden'}>🔌 Scollega</button></div>
  <label style="flex-direction:row;align-items:center"><input type="checkbox" id="gdAuto" ${CFG.driveAuto !== false ? 'checked' : ''}>&nbsp;Salva automaticamente ad ogni modifica</label>
  <details class="gdHelp" ${CFG.clientId ? '' : 'open'}><summary>🔑 Client ID Google (serve solo la prima volta)</summary>
  <label style="display:flex">Client ID<input id="gcid" placeholder="123456-abc.apps.googleusercontent.com" value="${esc(CFG.clientId || '')}"></label><button class="btn alt" id="gcidSave">💾 Salva Client ID</button>
  <ol class="gdSteps"><li>Apri <a href="https://console.cloud.google.com/projectcreate" target="_blank" rel="noopener">console.cloud.google.com</a> con il tuo account Google e crea un <b>progetto</b> (nome: SHASHI).</li>
  <li>Menu <b>API e servizi → Libreria</b>: cerca <b>Google Drive API</b> e premi <b>Abilita</b>.</li>
  <li><b>API e servizi → Schermata consenso OAuth</b>: tipo <b>Esterno</b>, inserisci nome app e la tua email, poi in <b>Utenti di prova</b> aggiungi la tua email (e quelle di chi userà l'app). Tra gli ambiti aggiungi <code>.../auth/drive.file</code>.</li>
  <li><b>Credenziali → Crea credenziali → ID client OAuth</b>, tipo <b>Applicazione web</b>. In <b>Origini JavaScript autorizzate</b> scrivi: <code>${esc(orig)}</code> (senza / finale né nome cartella).</li>
  <li>Copia il <b>Client ID</b> (finisce con <code>.apps.googleusercontent.com</code>), incollalo qui sopra, salva e premi <b>Collega Google Drive</b>.</li></ol></details></div>`);
  gdPaint();
  $('#gdConn').onclick = async () => { if (GD.busy) return; await gdSync(true); panels.settings(); };
  $('#gdRestore').onclick = async () => { if (GD.busy) return; if (!confirm('Scaricare i dati dalla cartella SHASHI e sostituire quelli di questo dispositivo?')) return; GD.busy = true; gdSay('busy'); try { await gdAuth(true); await gdPull(); CFG.driveLast = Date.now(); saveCfg(); gdSay('ok'); toast('☁️ Dati ripristinati ✔️'); } catch (e) { gdSay('err', e.message); toast('☁️ ' + e.message, 7000); } finally { GD.busy = false; } };
  $('#gdOff').onclick = () => { if (!confirm('Scollegare Google Drive? I file nella cartella SHASHI restano nel tuo Drive.')) return; try { if (GD.token && window.google) google.accounts.oauth2.revoke(GD.token, () => { }); } catch { } GD.token = null; GD.folder = null; GD.files = {}; GD.hash = {}; CFG.driveOn = false; saveCfg(); gdSay('off'); buildNav(); panels.settings(); };
  $('#gdAuto').onchange = e => { CFG.driveAuto = e.target.checked; saveCfg(); };
  $('#gcidSave').onclick = () => { CFG.clientId = $('#gcid').value.trim(); saveCfg(); toast(CFG.clientId ? 'Client ID salvato ✔️' : 'Client ID rimosso'); if ($('#cid')) $('#cid').value = CFG.clientId; };
}
{ const b0 = buildNav; buildNav = function () { b0(); if (CFG.driveOn) { const u = $('#userBtn'); if (u && !u.querySelector('.cloud')) u.insertAdjacentHTML('beforeend', '<span class="cloud" title="Dati salvati su Google Drive"> ☁️</span>'); } }; }

// ============ ANIMAZIONI STILE POWERPOINT ============
const TRS = { fade: 'Dissolvenza', push: 'Spinta', wipe: 'Cancellazione', zoom: 'Zoom', split: 'Divisione', reveal: 'Rivelazione', flip: 'Ribalta', morph: 'Trasformazione' };
const ENTS = { appear: 'Appari', fade: 'Dissolvi', fly: 'Entra da sinistra', float: 'Galleggia', zoom: 'Zoom', bounce: 'Rimbalzo', grow: 'Cresci e ruota', swivel: 'Swivel', spin: 'Spirale' };
const pick = o => { const k = Object.keys(o); return k[Math.floor(Math.random() * k.length)]; };
{ const g1 = go; go = function (k) {
  const m = $('#main'); if (m) { let tr = CFG.tr || 'random', en = CFG.ent || 'float'; if (tr === 'random') tr = pick(TRS); if (en === 'random') en = pick(ENTS); m.dataset.tr = tr; m.dataset.ent = en; document.documentElement.style.setProperty('--spd', CFG.spd || 1); }
  return g1(k); }; window.go = go; }
function animCard() {
  const opt = (o, cur, extra) => `${extra.map(([v, l]) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${l}</option>`).join('')}${Object.entries(o).map(([v, l]) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${l}</option>`).join('')}`;
  $('#uxCard').insertAdjacentHTML('afterend', `<div class="card" id="pptCard"><h3>🎞️ Animazioni stile PowerPoint</h3><p class="muted">Ogni volta che cambi sezione la pagina entra con una <b>transizione</b> e i suoi riquadri compaiono uno dopo l'altro con un <b>effetto d'entrata</b>, come in una presentazione.</p>
  <div class="row"><label>Transizione<select id="pTr">${opt(TRS, CFG.tr || 'random', [['random', '🎲 Casuale'], ['none', 'Nessuna']])}</select></label><label>Effetto d'entrata<select id="pEn">${opt(ENTS, CFG.ent || 'float', [['random', '🎲 Casuale'], ['none', 'Nessuno']])}</select></label>
  <label>Velocità<select id="pSp">${[[.6, 'Veloce'], [1, 'Normale'], [1.6, 'Lenta'], [2.2, 'Molto lenta']].map(([v, l]) => `<option value="${v}" ${(CFG.spd || 1) === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label><button class="btn" id="pPrev">▶ Anteprima</button></div></div>`);
  const upd = () => { CFG.tr = $('#pTr').value; CFG.ent = $('#pEn').value; CFG.spd = +$('#pSp').value; saveCfg(); }, play = () => { upd(); const m = $('#main'); m.dataset.tr = CFG.tr === 'random' ? pick(TRS) : CFG.tr; m.dataset.ent = CFG.ent === 'random' ? pick(ENTS) : CFG.ent; document.documentElement.style.setProperty('--spd', CFG.spd || 1); m.classList.remove('enter'); void m.offsetWidth; m.classList.add('enter'); clearTimeout(go.t); go.t = setTimeout(() => m.classList.remove('enter'), 2600); sfx('nav'); };
  ['#pTr', '#pEn', '#pSp'].forEach(i => $(i).onchange = play); $('#pPrev').onclick = play;
}
{ const sx0 = settingsExtra; settingsExtra = function () { sx0(); driveCard(); animCard(); }; }

// ============ avvio ============
{ const hr = $('.hright'), d = $('#darkBtn'); if (hr && d && !$('#sfxBtn')) { const b = document.createElement('button'); b.id = 'sfxBtn'; b.className = 'pill'; b.title = 'Effetti sonori'; b.textContent = CFG.sfx === false ? '🔇' : '🔊'; b.onclick = () => { CFG.sfx = CFG.sfx === false; saveCfg(); b.textContent = CFG.sfx === false ? '🔇' : '🔊'; sfx('pop'); }; hr.insertBefore(b, d); } }
applyAnim(); buildNav(); go(cur);
