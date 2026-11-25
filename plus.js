/* SHASHI plus.js — OpenAI, voci realistiche, Tutor AI, dialoghi, orari, appunti, mappe, Spotify, riposo, suoni.
   Caricato dopo app.js: condivide le variabili globali (S, CFG, panels, go, toast, ...). */
'use strict';

// ============ utilità ============
const fmtMsg = x => esc(x).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/^(Passo \d+[:.)]?)/gm, '<b>$1</b>').replace(/\n/g, '<br>');
const getOV = () => { try { return JSON.parse(localStorage.getItem('shashi_oralv') || '{}'); } catch { return {}; } };
const CVOICES = ['nova', 'onyx', 'shimmer', 'echo', 'fable', 'alloy'];
const CVLAB = { nova: 'Nova (donna, calda)', onyx: 'Onyx (uomo, profondo)', shimmer: 'Shimmer (donna, dolce)', echo: 'Echo (uomo, pacato)', fable: 'Fable (narratore)', alloy: 'Alloy (neutra)' };
const cvFor = who => { const o = getOV(); return o['cv' + who] || ({ A: 'onyx', B: 'nova', P: 'onyx' })[who] || 'nova'; };

// ============ voce realistica OpenAI (TTS) ============
const CL = { token: 0, el: null, cache: new Map(), fail: false };
const cloudOn = () => !!CFG.openaiKey && !CL.fail && getOV().engine !== 'device';
function cloudEl() { if (!CL.el) CL.el = new Audio(); return CL.el; }
// sblocca l'audio al primo tocco (Safari/iOS)
document.addEventListener('pointerdown', () => { try { const e = cloudEl(); if (!e.dataset.u) { e.dataset.u = 1; e.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='; e.play().catch(() => { }); } } catch { } }, { once: true, capture: true });
function cloudStop() { CL.token++; try { if (CL.el) CL.el.pause(); } catch { } if (!window.speechSynthesis || !speechSynthesis.speaking) document.body.classList.remove('speaking'); }
function cloudChunks(text) {
  const out = []; let cur = '';
  for (const c of ttsChunks(ttsClean(text))) { if ((cur + ' ' + c).length > 520 && cur) { out.push(cur); cur = c; } else cur = (cur + ' ' + c).trim(); }
  if (cur) out.push(cur); return out;
}
function ttsFetch(text, voice, speed) {
  const k = voice + '|' + speed + '|' + text; if (CL.cache.has(k)) return CL.cache.get(k);
  const p = fetch('https://api.openai.com/v1/audio/speech', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + CFG.openaiKey }, body: JSON.stringify({ model: 'tts-1', voice, input: text, speed, response_format: 'mp3' }) })
    .then(async r => { if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.error?.message || 'Errore voce OpenAI'); } return URL.createObjectURL(await r.blob()); });
  CL.cache.set(k, p); p.catch(() => CL.cache.delete(k)); if (CL.cache.size > 40) CL.cache.delete(CL.cache.keys().next().value); return p;
}
const playUrl = (url, token) => new Promise(res => { const e = cloudEl(); e.onended = e.onerror = () => res(); e.src = url; e.playbackRate = 1; e.play().catch(() => res()); });
async function cloudSpeak(text, done, who = 'P') {
  cloudStop(); const token = ++CL.token, voice = cvFor(who), speed = Math.min(4, Math.max(.5, getOV().rate || 1)), cs = cloudChunks(text);
  if (!cs.length) { done && done(); return; }
  document.body.classList.add('speaking');
  try {
    let nxt = ttsFetch(cs[0], voice, speed);
    for (let i = 0; i < cs.length; i++) {
      const url = await nxt; if (token !== CL.token) return;
      if (cs[i + 1]) nxt = ttsFetch(cs[i + 1], voice, speed);
      await playUrl(url, token); if (token !== CL.token) return;
    }
    document.body.classList.remove('speaking'); done && done();
  } catch (e) {
    if (token !== CL.token) return; document.body.classList.remove('speaking'); CL.fail = true;
    toast('Voce OpenAI non disponibile (' + e.message + '). Uso la voce del dispositivo.', 6000); speakNow(text, done);
  }
}
// una battuta (promessa) con la voce giusta: cloud o dispositivo
function speakLine(text, who) {
  return new Promise(res => {
    if (cloudOn()) return cloudSpeak(text, res, who);
    if (!('speechSynthesis' in window)) return res();
    const v = pickVoice(who === 'B' ? 'B' : 'A'), cs = ttsChunks(ttsClean(text)); if (!cs.length) return res();
    speechSynthesis.cancel(); speechSynthesis.resume();
    cs.forEach((tx, i) => { const u = new SpeechSynthesisUtterance(tx); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = CFG.lang; u.rate = getOV().rate || 1; u.pitch = who === 'B' ? 1.12 : .92; if (i === cs.length - 1) u.onend = u.onerror = () => res(); speechSynthesis.speak(u); });
  });
}

// ============ dialogo tra due persone ============
const DLG = { token: 0, script: [], names: { A: 'Prof. Rossi', B: 'Giulia' } };
async function playDialogue(from = 0) {
  const token = ++DLG.token; stopSpeak(); document.body.classList.add('speaking');
  for (let i = from; i < DLG.script.length; i++) {
    if (token !== DLG.token) return;
    const ln = DLG.script[i]; $$('#dlgLog .dl').forEach((e, k) => e.classList.toggle('now', k === i)); const el = $$('#dlgLog .dl')[i]; if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    if (cloudOn() && DLG.script[i + 1]) { const nx = DLG.script[i + 1]; cloudChunks(nx.text).slice(0, 1).forEach(c => ttsFetch(c, cvFor(nx.who), Math.min(4, Math.max(.5, getOV().rate || 1))).catch(() => { })); }
    await speakLine(ln.text, ln.who); if (token !== DLG.token) return;
    await new Promise(r => setTimeout(r, 280));
  }
  if (token === DLG.token) { $$('#dlgLog .dl').forEach(e => e.classList.remove('now')); document.body.classList.remove('speaking'); }
}
function stopDialogue() { DLG.token++; stopSpeak(); $$('#dlgLog .dl').forEach(e => e.classList.remove('now')); }

const oral0 = panels.oral;
panels.oral = () => {
  oral0();
  const ai = hasAI(), eng = cloudOn() ? '✨ Voce realistica OpenAI attiva' : (CFG.openaiKey ? 'Voce del dispositivo (OpenAI disattivata)' : 'Con la chiave OpenAI le voci diventano realistiche');
  $('#main').insertAdjacentHTML('beforeend', `<div class="card dlgCard"><h3>👥 Conversazione tra due persone</h3>
  <p class="muted">Ascolta due persone vere che parlano dell'argomento scelto sopra. ${eng}.</p>
  <div class="row"><label>Tipo<select id="dlgType"><option value="exam">Interrogazione (professore + studente, con errori corretti passo passo)</option><option value="study">Ripasso tra due compagni</option><option value="debate">Spiegazione con domande curiose</option></select></label>
  <button class="btn" id="dlgGo">▶ Crea e ascolta</button><button class="btn alt" id="dlgStop">⏹ Ferma</button></div><div id="dlgLog"></div></div>`);
  $('#dlgStop').onclick = stopDialogue;
  $('#dlgGo').onclick = async () => {
    const g = getSel(); if (!g) return; const type = $('#dlgType').value; busy($('#dlgLog'), 'Scrivo la conversazione…');
    DLG.names = type === 'exam' ? { A: 'Prof. Rossi', B: 'Giulia' } : { A: 'Marco', B: 'Sara' }; let sc = null;
    if (ai) {
      const how = { exam: 'Il professore (A) interroga la studentessa (B). B risponde in modo naturale e commette 1 o 2 errori realistici; A li nota, li spiega PASSO PER PASSO con calma e poi dà un voto. ', study: 'Due compagni di classe (A e B) ripassano insieme, si fanno domande a vicenda, si correggono con gentilezza e usano esempi. ', debate: 'A spiega e B fa domande curiose e intelligenti; A risponde con esempi chiari. ' }[type];
      try { const r = parseJSON(await aiText('Sei uno sceneggiatore di dialoghi scolastici realistici tra due persone vere. Rispondi SOLO con JSON valido.', `${styleNote(g)}\n${how}Scrivi da 16 a 22 battute brevi (1-3 frasi), con un parlato naturale (qualche "dunque", "ehm", "ah, giusto"), senza emoji né elenchi. Usa SOLO il materiale. Formato: {"script":[{"who":"A","text":"..."},{"who":"B","text":"..."}]}\n\nTESTO:\n${g.text.slice(0, 9000)}`, 3500)); sc = r && r.script; } catch (e) { toast('AI non disponibile: ' + e.message); }
    }
    DLG.script = (sc && sc.length ? sc : localPodcast(g)).filter(x => x && x.text).map(x => ({ who: x.who === 'B' ? 'B' : 'A', text: String(x.text) }));
    $('#dlgLog').innerHTML = DLG.script.map(l => `<div class="dl ${l.who}"><b>${esc(DLG.names[l.who])}</b><span>${esc(l.text)}</span></div>`).join('');
    $$('#dlgLog .dl').forEach((e, i) => { e.onclick = () => playDialogue(i); }); playDialogue(0);
  };
};

// ============ Tutor AI (domande, immagini, correzioni passo-passo) ============
Object.assign(I.it, { tutor: 'Tutor AI' }); Object.assign(I.en, { tutor: 'AI tutor' }); ICON.tutor = '🧑‍🏫';
NAV_R.splice(NAV_R.indexOf('oral') + 1, 0, 'tutor');
const TUT = { msgs: [], pics: [] };
function micInto(ta, btn, onDone) {
  const R = window.SpeechRecognition || window.webkitSpeechRecognition; if (!R) return toast('Riconoscimento vocale non supportato da questo browser.');
  if (btn._r) { try { btn._r.stop(); } catch { } return; }
  stopSpeak(); const r = new R(); btn._r = r; r.lang = CFG.lang; r.interimResults = true; const base = ta.value ? ta.value.trim() + ' ' : '';
  r.onresult = e => { let x = ''; for (const q of e.results) x += q[0].transcript; ta.value = base + x; };
  r.onend = () => { btn._r = null; btn.classList.remove('rec'); onDone && onDone(); }; r.onerror = () => { btn._r = null; btn.classList.remove('rec'); };
  try { r.start(); btn.classList.add('rec'); toast('🎤 Ti ascolto…'); } catch { }
}
panels.tutor = () => {
  const subs = ['Tutte le materie', 'Matematica', 'Fisica', 'Chimica', 'Biologia', 'Italiano', 'Storia', 'Geografia', 'Inglese', 'Latino', 'Filosofia', 'Informatica', 'Arte', 'Diritto/Economia'];
  main().innerHTML = `<h2>🧑‍🏫 ${t('tutor')}</h2>` + (hasAI() ? '' : `<div class="card">${empty('🔑', 'Serve la chiave OpenAI', 'Inserisci la tua chiave OpenAI nelle Impostazioni: il tutor risponde a domande su tutte le materie, legge le foto dei compiti e spiega ogni errore passo per passo.', '<button class="btn" onclick="go(\'settings\')">⚙️ Apri Impostazioni</button>')}</div>`) +
    `<div class="card"><div class="row"><label>Materia<select id="tSub">${subs.map(x => `<option>${x}</option>`).join('')}</select></label><label>Livello<select id="tLv">${['lv1', 'lv2', 'lv3', 'lv4'].map(k => `<option value="${k}" ${S.sel.level === k ? 'selected' : ''}>${t(k)}</option>`).join('')}</select></label>
    <label style="flex-direction:row;align-items:center"><input type="checkbox" id="tVoice" ${getOV().on !== false ? 'checked' : ''}>&nbsp;🔊 Leggi le risposte</label><button class="btn alt" id="tClr">🧹 Nuova chat</button></div></div>
    <div class="card"><div id="tLog" class="tlog">${TUT.msgs.length ? '' : '<p class="muted">Scrivi una domanda, incolla un esercizio o allega la foto del tuo compito: il tutor ti dice cosa è giusto, cosa è sbagliato e perché, passo per passo.</p>'}</div>
    <div class="row tin"><textarea id="tIn" style="min-height:70px" placeholder="Scrivi qui la domanda o la tua risposta…"></textarea><button class="btn" id="tSend">Invia</button><button class="btn alt" id="tMic">🎤</button><button class="btn alt" id="tPic">📷</button><input type="file" id="tPicIn" accept="image/*" multiple hidden></div><div id="tTh" class="thumbs"></div>
    <div class="chips">${['Spiegami passo passo', 'Correggi il mio esercizio', 'Fammi 3 domande', 'Fammi un esempio', 'Riassumi in 5 punti'].map(x => `<button class="chip" data-q="${x}">${x}</button>`).join('')}</div></div>`;
  const add = (c, x, im) => { $('#tLog').insertAdjacentHTML('beforeend', `<div class="msg ${c}">${fmtMsg(x)}${im ? `<div class="thumbs">${im.map(i => `<img src="${i}">`).join('')}</div>` : ''}</div>`); $('#tLog').lastChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
  TUT.msgs.forEach(m => { if (m.shown !== false) add(m.role === 'user' ? 'u' : 'a', m.content); });
  const send = async () => {
    const v = $('#tIn').value.trim(); if (!v && !TUT.pics.length) return; if (!hasAI()) return toast('Inserisci prima la chiave OpenAI nelle Impostazioni.');
    const im = TUT.pics.splice(0); $('#tTh').innerHTML = ''; $('#tIn').value = ''; add('u', v || '📷 Ecco la foto del mio compito.', im);
    TUT.msgs.forEach(m => delete m.images); TUT.msgs.push({ role: 'user', content: v || 'Ecco la foto del mio compito: correggilo.', images: im }); add('a', '…');
    const sys = `Materia: ${$('#tSub').value}. Lingua: ${LN[CFG.lang]}. Livello: ${LV[$('#tLv').value]}. Rispondi in modo chiaro. Se lo studente ti manda un esercizio o una risposta (anche in foto), 1) dì cosa è corretto, 2) elenca OGNI errore e spiega perché è sbagliato, 3) mostra la soluzione corretta PASSO PER PASSO (Passo 1, Passo 2…), 4) chiudi con un consiglio per non ripetere l'errore. Se è una domanda teorica spiega con parole semplici e un esempio. ${$('#tVoice').checked ? 'Scrivi in modo parlato, senza tabelle né emoji: il testo verrà letto ad alta voce.' : ''}`;
    try { const r = await aiChat(sys, TUT.msgs.slice(-12), 2500); $('#tLog').lastChild.remove(); TUT.msgs.push({ role: 'assistant', content: r }); add('a', r); S.cnt.tutor = (S.cnt.tutor || 0) + 1; addXp(3); if ($('#tVoice').checked) speakNow(r); }
    catch (e) { $('#tLog').lastChild.remove(); TUT.msgs.pop(); toast('Errore AI: ' + e.message, 6000); }
  };
  $('#tSend').onclick = send; $('#tIn').onkeydown = e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send(); };
  $('#tMic').onclick = () => micInto($('#tIn'), $('#tMic'));
  $('#tPic').onclick = () => $('#tPicIn').click();
  $('#tPicIn').onchange = async e => { for (const f of e.target.files) TUT.pics.push(await resizeImg(f)); $('#tTh').innerHTML = TUT.pics.map(i => `<img src="${i}">`).join(''); e.target.value = ''; };
  $('#tClr').onclick = () => { TUT.msgs = []; TUT.pics = []; stopSpeak(); panels.tutor(); };
  $$('[data-q]').forEach(b => b.onclick = () => { $('#tIn').value = ($('#tIn').value ? $('#tIn').value + '\n' : '') + b.dataset.q; $('#tIn').focus(); });
};

// ============ Impostazioni: OpenAI, suoni, schermo a riposo ============
const settings0 = panels.settings;
panels.settings = () => {
  settings0();
  const o = getOV(), sel = (id, arr, cur) => `<select id="${id}">${arr.map(v => `<option value="${v}" ${v === cur ? 'selected' : ''}>${CVLAB[v] || v}</option>`).join('')}</select>`;
  $('#main').insertAdjacentHTML('afterbegin', `<div class="card" id="oaiCard"><h3>🤖 OpenAI — AI e voci realistiche</h3>
  <p class="muted">Incolla qui la tua chiave OpenAI (inizia con <code>sk-</code>). Resta <b>solo in questo dispositivo</b>: non viene mai scritta nel codice del sito. Non condividerla con nessuno.</p>
  <label style="display:flex">Chiave OpenAI<input id="oak" type="password" autocomplete="off" placeholder="sk-…" value="${esc(CFG.openaiKey || '')}"></label>
  <div class="row"><label>Modello<select id="oam"><option value="gpt-4o" ${CFG.openaiModel !== 'gpt-4o-mini' ? 'selected' : ''}>gpt-4o (migliore, legge le foto)</option><option value="gpt-4o-mini" ${CFG.openaiModel === 'gpt-4o-mini' ? 'selected' : ''}>gpt-4o-mini (più economico)</option></select></label>
  <label>Motore voce<select id="oen"><option value="cloud" ${o.engine !== 'device' ? 'selected' : ''}>Voce realistica OpenAI</option><option value="device" ${o.engine === 'device' ? 'selected' : ''}>Voce del dispositivo (gratis)</option></select></label></div>
  <div class="row"><label>Voce 1 (professore)${sel('cvA', CVOICES, cvFor('A'))}</label><label>Voce 2 (studente)${sel('cvB', CVOICES, cvFor('B'))}</label><label>Voce del tutor${sel('cvP', CVOICES, cvFor('P'))}</label></div>
  <div class="row"><button class="btn" id="oSave">💾 Salva</button><button class="btn alt" id="oTest">✅ Prova la chiave</button><button class="btn alt" id="oVoice">🔊 Prova le voci</button><button class="btn del" id="oDel">Rimuovi chiave</button></div></div>`);
  const saveO = () => { CFG.openaiKey = $('#oak').value.trim(); CFG.openaiModel = $('#oam').value; saveCfg(); const x = getOV(); x.engine = $('#oen').value; x.cvA = $('#cvA').value; x.cvB = $('#cvB').value; x.cvP = $('#cvP').value; localStorage.setItem('shashi_oralv', JSON.stringify(x)); CL.fail = false; };
  $('#oSave').onclick = () => { saveO(); toast('Salvato ✔️'); }; $('#oDel').onclick = () => { CFG.openaiKey = ''; saveCfg(); panels.settings(); toast('Chiave rimossa.'); };
  $('#oTest').onclick = async () => { saveO(); if (!CFG.openaiKey) return toast('Inserisci la chiave.'); toast('Provo la chiave…'); try { const r = await aiText('Rispondi in una frase.', 'Dimmi "Ciao, funziono!"', 30); toast('✅ ' + (r || 'ok')); } catch (e) { toast('❌ ' + e.message, 7000); } };
  $('#oVoice').onclick = async () => { saveO(); if (!CFG.openaiKey) return toast('Inserisci la chiave.'); stopDialogue(); await speakLine('Buongiorno! Sono il professor Rossi. Oggi parliamo di storia: sei pronta?', 'A'); await speakLine('Buongiorno professore, sì, ho ripassato tutto ieri sera.', 'B'); };
  if (typeof settingsExtra === 'function') settingsExtra();
};


// ============ ORARI SCOLASTICI: interfaccia a colonne ============
const SUBC = s => { let h = 0; for (const c of s.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
const ttGet = d => (S.timetable[d] || '').split(',').map(x => x.trim()).filter(Boolean);
const ttSet = (d, a) => { S.timetable[d] = a.join(', '); save(); };
function ttHTML() {
  const order = [1, 2, 3, 4, 5, 6, 0], today = new Date().getDay(), tom = (today + 1) % 7, days = S.settings.ttSun ? order : order.slice(0, 6);
  const known = [...new Set([...Object.values(S.timetable).flatMap(x => String(x).split(',')), ...(Array.isArray(subjList()) ? subjList() : [])].map(x => String(x).trim()).filter(Boolean))];
  return `<h2>🗓️ Il mio orario</h2><p class="muted">Costruisci la settimana in 3 mosse: scrivi la materia, scegli i giorni in cui c'è, premi Aggiungi. SHASHI userà l'orario per creare il piano di studio.</p>
  <div class="ttSteps"><div><b>1</b>Materia</div><div><b>2</b>Giorni</div><div><b>3</b>Aggiungi</div></div>
  <div class="ttAdd"><input id="ttSub" list="ttList" placeholder="Es. Matematica" autocomplete="off"><datalist id="ttList">${known.map(x => `<option value="${esc(x)}">`).join('')}</datalist>
  <div class="dayPick">${days.map(d => `<label class="dp"><input type="checkbox" value="${d}" ${d === today ? '' : ''}><span>${esc(dayName(d).slice(0, 3))}</span></label>`).join('')}</div>
  <button class="btn" id="ttAdd">➕ Aggiungi</button></div>
  <div class="ttGrid">${days.map(d => `<div class="ttDay ${d === today ? 'today' : ''}"><h4>${esc(dayName(d))}${d === today ? '<small>Oggi</small>' : d === tom ? '<small>Domani</small>' : ''}</h4>
  <div class="ttChips">${ttGet(d).map((s, i) => `<span class="sc" style="--h:${SUBC(s)}">${esc(s)}<button data-d="${d}" data-i="${i}" aria-label="Rimuovi ${esc(s)}">×</button></span>`).join('') || '<em class="muted">Giorno libero</em>'}</div>
  <small class="muted">${ttGet(d).length} materie</small></div>`).join('')}</div>
  <div class="row" style="margin-top:12px"><label style="flex-direction:row;align-items:center"><input type="checkbox" id="ttSun" ${S.settings.ttSun ? 'checked' : ''}>&nbsp;Mostra la domenica</label><button class="btn alt" id="ttCopy">📋 Copia il lunedì su tutti i giorni</button><button class="btn del" id="ttClr">Svuota tutto</button></div>`;
}
function ttWire(card) {
  const draw = () => { card.innerHTML = ttHTML(); ttWire(card); };
  $('#ttAdd', card).onclick = () => {
    const sub = $('#ttSub', card).value.trim(), ds = $$('.dayPick input:checked', card).map(i => +i.value);
    if (!sub) return toast('Scrivi prima il nome della materia.'); if (!ds.length) return toast('Scegli almeno un giorno.');
    ds.forEach(d => { const a = ttGet(d); if (!a.some(x => x.toLowerCase() === sub.toLowerCase())) { a.push(sub); ttSet(d, a); } }); sfx('add'); draw(); toast(`✅ ${sub} aggiunta a ${ds.length} giorni`);
  };
  $('#ttSub', card).onkeydown = e => { if (e.key === 'Enter') $('#ttAdd', card).click(); };
  $$('.sc button', card).forEach(b => b.onclick = () => { const a = ttGet(+b.dataset.d); a.splice(+b.dataset.i, 1); ttSet(+b.dataset.d, a); sfx('del'); draw(); });
  $('#ttSun', card).onchange = e => { S.settings.ttSun = e.target.checked; save(); draw(); };
  $('#ttCopy', card).onclick = () => { const a = ttGet(1); [2, 3, 4, 5].forEach(d => ttSet(d, a)); draw(); toast('Lunedì copiato su Mar–Ven ✔️'); };
  $('#ttClr', card).onclick = () => { if (confirm('Svuotare tutto l\'orario?')) { S.timetable = {}; save(); draw(); } };
}
const planner_p = panels.planner;
panels.planner = () => { planner_p(); const b = $('#ttSave'); if (!b) return; const card = b.closest('.card'); card.classList.add('ttCard'); card.innerHTML = ttHTML(); ttWire(card); };

// ============ APPUNTI: colonne + sottocartelle ============
const fKids = pid => S.folders.filter(f => (f.parent || null) === pid);
const fDesc = id => { const o = [id]; fKids(id).forEach(k => o.push(...fDesc(k.id))); return o; };
const fPath = id => { const o = []; let f = S.folders.find(x => x.id === id), g = 0; while (f && g++ < 20) { o.unshift(f.name); f = S.folders.find(x => x.id === f.parent); } return o.join(' › '); };
const fFlat = (pid = null, d = 0) => fKids(pid).flatMap(f => [{ f, d }, ...fFlat(f.id, d + 1)]);
panels.notes = () => {
  const n = S.notes.find(x => x.id === curNote), inc = S.settings.subNotes !== false, ids = curFolder === 'all' ? null : (inc ? fDesc(curFolder) : [curFolder]);
  let list = S.notes.filter(x => (!ids || ids.includes(x.folder)) && (!nq || (x.title + ' ' + x.text + ' ' + (x.subject || '')).toLowerCase().includes(nq)));
  const srt = S.settings.nSort || 'recent'; list = list.slice().sort((a, b) => srt === 'az' ? a.title.localeCompare(b.title) : (b.ts || 0) - (a.ts || 0));
  const cnt = id => S.notes.filter(x => fDesc(id).includes(x.folder)).length;
  const tree = (pid, d) => fKids(pid).map(f => { const k = fKids(f.id).length, on = curFolder === f.id; return `<div class="fn ${on ? 'on' : ''}" style="--d:${d}"><button class="fx" data-t="${f.id}" aria-label="Apri/chiudi">${k ? (f.closed ? '▸' : '▾') : '•'}</button><a href="#" data-f="${f.id}">📁 ${esc(f.name)} <small>${cnt(f.id)}</small></a><span class="fa"><button data-sf="${f.id}" title="Nuova sottocartella">＋</button><button data-rf="${f.id}" title="Rinomina">✎</button><button data-df="${f.id}" title="Elimina">✕</button></span></div>${f.closed ? '' : tree(f.id, d + 1)}`; }).join('');
  const subs = curFolder === 'all' ? [] : fKids(curFolder);
  main().innerHTML = `<div class="notes3">
  <div class="card ncol"><h3>📁 Cartelle</h3><div class="ftree"><div class="fn ${curFolder === 'all' ? 'on' : ''}" style="--d:0"><span class="fx">🗂️</span><a href="#" data-f="all"><b>Tutti gli appunti</b> <small>${S.notes.length}</small></a></div>${tree(null, 0)}</div>
  <button class="btn" id="nf">+ ${t('newFolder')}</button></div>
  <div class="card ncol"><h3>📄 ${curFolder === 'all' ? 'Tutti gli appunti' : esc(fPath(curFolder))}</h3>
  ${subs.length ? `<div class="subf">${subs.map(f => `<button class="chip" data-f="${f.id}">📁 ${esc(f.name)}</button>`).join('')}</div>` : ''}
  <input id="nsearch" placeholder="🔍 Cerca negli appunti" value="${esc(nq)}" style="width:100%">
  <div class="row nopts"><label style="flex-direction:row;align-items:center"><input type="checkbox" id="nInc" ${inc ? 'checked' : ''}>&nbsp;con sottocartelle</label><select id="nSort"><option value="recent" ${srt === 'recent' ? 'selected' : ''}>Più recenti</option><option value="az" ${srt === 'az' ? 'selected' : ''}>A → Z</option></select></div>
  <div class="nlist">${list.map(x => `<a href="#" data-n="${x.id}" class="nn ${x.id === curNote ? 'on' : ''}"><b>${esc(x.title)}</b><small>${esc(fPath(x.folder))}${x.subject ? ' · ' + esc(x.subject) : ''}</small><span>${esc((x.text || '').replace(/\s+/g, ' ').slice(0, 70)) || 'Vuoto'}</span></a>`).join('') || '<p class="muted">Nessun appunto qui.</p>'}</div>
  <button class="btn" id="nn">+ Nuovo appunto</button></div>
  <div class="card ncol ned">${n ? `<h3>✍️ Modifica appunto</h3>
  <label style="display:flex">Titolo<input id="nt" value="${esc(n.title)}"></label>
  <div class="row"><label>Cartella<select id="nfo">${fFlat().map(({ f, d }) => `<option value="${f.id}" ${f.id === n.folder ? 'selected' : ''}>${'  '.repeat(d)}${esc(f.name)}</option>`).join('')}</select></label>
  <label>Materia<input id="nsu" value="${esc(n.subject || '')}"></label></div>
  <textarea id="ntx" style="min-height:240px" placeholder="Scrivi o incolla qui gli appunti… (per ‘pagine’ separate usa una riga vuota ogni tanto)">${esc(n.text)}</textarea>
  <details class="nadd"><summary>📎 Aggiungi file, foto o OCR</summary><div class="row"><label>Carica file (.txt .md .pdf)<input type="file" id="nfile" accept=".txt,.md,.pdf,text/plain,application/pdf"></label>
  <label>Aggiungi immagini<input type="file" id="nimg" accept="image/*" multiple></label><label>📷 Foto → testo (OCR)<input type="file" id="nocr" accept="image/*"></label></div></details>
  <div class="thumbs">${n.images.map((im, i) => `<span><img src="${im}"><button class="btn del" data-di="${i}">✕</button></span>`).join('')}</div>
  <p class="muted">${splitPages(n.text).length} pagine · ${n.text.length} caratteri</p>
  <div class="row"><button class="btn" id="ns">${t('save')}</button><button class="btn alt" onclick="go('map')">🕸️ Mappa</button><button class="btn alt" onclick="go('podcast')">🎙️ Podcast</button><button class="btn alt" onclick="go('exercises')">✏️ Esercizi</button><button class="btn alt" id="nsum">📝 Riassumi</button><button class="btn alt" id="npr">🖨️ PDF</button><button class="btn del" id="nd">${t('del')}</button></div><div id="nsumOut"></div>` : empty('📝', 'Nessun appunto aperto', 'Scegli un appunto dall\'elenco o creane uno nuovo: poi potrai trasformarlo in mappe, podcast ed esercizi.', '<button class="btn" id="nnEmpty">+ Nuovo appunto</button>')}</div></div>`;
  $$('[data-f]').forEach(a => a.onclick = e => { e.preventDefault(); curFolder = a.dataset.f; panels.notes(); });
  $$('[data-n]').forEach(a => a.onclick = e => { e.preventDefault(); curNote = a.dataset.n; S.sel.note = curNote; panels.notes(); });
  $$('[data-t]').forEach(b => b.onclick = () => { const f = S.folders.find(x => x.id === b.dataset.t); f.closed = !f.closed; save(); panels.notes(); });
  $('#nsearch').oninput = e => { nq = e.target.value.toLowerCase(); panels.notes(); const i = $('#nsearch'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); };
  $('#nInc').onchange = e => { S.settings.subNotes = e.target.checked; save(); panels.notes(); }; $('#nSort').onchange = e => { S.settings.nSort = e.target.value; save(); panels.notes(); };
  $('#nf').onclick = () => { const nm = prompt('Nome cartella?'); if (nm) { const f = { id: uid(), name: nm, parent: null }; S.folders.push(f); curFolder = f.id; save(); panels.notes(); } };
  $$('[data-sf]').forEach(b => b.onclick = () => { const nm = prompt('Nome della sottocartella?'); if (nm) { const f = { id: uid(), name: nm, parent: b.dataset.sf }; S.folders.push(f); const p = S.folders.find(x => x.id === b.dataset.sf); p.closed = false; curFolder = f.id; save(); panels.notes(); } });
  $$('[data-rf]').forEach(b => b.onclick = () => { const f = S.folders.find(x => x.id === b.dataset.rf), nm = prompt('Nuovo nome', f.name); if (nm) { f.name = nm; save(); panels.notes(); } });
  $$('[data-df]').forEach(b => b.onclick = () => {
    if (S.folders.length < 2) return toast('Serve almeno una cartella.'); const f = S.folders.find(x => x.id === b.dataset.df); if (!confirm('Eliminare «' + f.name + '»? Appunti e sottocartelle passano alla cartella superiore.')) return;
    const up = f.parent || (S.folders.find(x => x.id !== f.id && !x.parent) || {}).id || null; S.folders = S.folders.filter(x => x.id !== f.id); S.folders.forEach(x => { if (x.parent === f.id) x.parent = f.parent || null; });
    S.notes.forEach(x => { if (x.folder === f.id) x.folder = up || S.folders[0].id; }); curFolder = 'all'; save(); panels.notes();
  });
  $('#nn').onclick = () => { const x = { id: uid(), folder: curFolder === 'all' ? (S.folders[0] || {}).id : curFolder, title: 'Nuovo appunto', subject: '', text: '', images: [], ts: Date.now() }; S.notes.push(x); curNote = x.id; S.sel.note = x.id; save(); sfx('add'); panels.notes(); };
  if ($('#nnEmpty')) $('#nnEmpty').onclick = () => $('#nn').click();
  if (!n) return;
  const commit = () => { n.title = $('#nt').value || 'Senza titolo'; n.folder = $('#nfo').value; n.subject = $('#nsu').value; n.text = $('#ntx').value; n.ts = Date.now(); save(); };
  $('#ns').onclick = () => { commit(); toast('Salvato ✔️'); panels.notes(); };
  $('#nsum').onclick = async () => {
    commit(); const box = $('#nsumOut'); box.innerHTML = '<p>⏳ Preparo il riassunto…</p>'; let out = null;
    try { out = await aiText('Sei un tutor che riassume in modo semplice.', `Lingua: ${LN[CFG.lang]}. Fai un riassunto chiaro, con punti elenco dei concetti principali, adatto a uno studente.\n\n${n.text.slice(0, 14000)}`, 1500); } catch (e) { toast('AI non disponibile: ' + e.message); }
    if (!out) { const sn = sents(n.text), ks = kws(n.text, 10); out = sn.map((x, i) => ({ x, i, sc: ks.reduce((a, k) => a + (x.toLowerCase().includes(k) ? 1 : 0), 0) })).sort((a, b) => b.sc - a.sc).slice(0, Math.max(1, Math.min(6, Math.ceil(sn.length / 3)))).sort((a, b) => a.i - b.i).map(o => '• ' + o.x).join('\n') || 'Testo troppo breve per riassumere.'; }
    box.innerHTML = `<div class="card"><h3>Riassunto</h3><div class="msg a" style="margin:0">${fmtMsg(out)}</div><button class="btn alt" id="nsumAdd">➕ Aggiungi all'appunto</button></div>`;
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
    try { await loadScript('https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.0.5/tesseract.min.js'); const r = await Tesseract.recognize(f, 'ita+eng'), tx = r.data.text.trim(); if (!tx) return toast('Nessun testo riconosciuto: prova con una foto più nitida.'); n.text = n.text ? n.text + '\f' + tx : tx; save(); panels.notes(); toast('Testo aggiunto all\'appunto ✔️'); }
    catch (err) { toast('OCR non disponibile (serve internet).'); }
  };
  $('#nimg').onchange = async e => { commit(); for (const f of e.target.files) n.images.push(await resizeImg(f)); save(); panels.notes(); };
  $('#nfile').onchange = async e => {
    commit(); const f = e.target.files[0]; if (!f) return; toast('Lettura file…');
    try { let txt = /\.pdf$/i.test(f.name) ? await pdfText(f) : await f.text(); if (!txt.trim()) return toast('Nessun testo trovato (PDF scansionato?). Incolla il testo a mano.'); n.text = n.text ? n.text + (/\.pdf$/i.test(f.name) ? '\f' : '\n\n') + txt : txt; if (n.title === 'Nuovo appunto') n.title = f.name.replace(/\.\w+$/, ''); save(); panels.notes(); }
    catch (err) { toast('Impossibile leggere il file (per i PDF serve internet).'); }
  };
};

// ============ MAPPE CONCETTUALI: più modi di crearle + editor ============
const MP = { id: null, title: '', root: null, layout: 'radial', sel: null, hist: [], zoom: 1, drag: null };
const mkN = (t, c = []) => ({ id: uid(), t, c });
const mFind = (n, id, par = null) => { if (n.id === id) return { n, par }; for (const k of n.c) { const r = mFind(k, id, n); if (r) return r; } return null; };
const mVis = n => n.collapsed ? [] : n.c;
const mLeaves = n => { const k = mVis(n); return k.length ? k.reduce((a, x) => a + mLeaves(x), 0) : 1; };
const mCount = n => 1 + n.c.reduce((a, x) => a + mCount(x), 0);
const mSize = n => { const L = wrapTxt(n.t || ' ', n === MP.root ? 16 : 18); return { L, w: Math.max(54, Math.max(...L.map(l => l.length)) * (n === MP.root ? 8.4 : 7) + 22), h: L.length * 16 + 14 }; };
function mSave() { if (!MP.root) return; S.maps = S.maps || []; let m = S.maps.find(x => x.id === MP.id); if (!m) { m = { id: MP.id = uid() }; S.maps.push(m); } Object.assign(m, { title: MP.title, root: MP.root, layout: MP.layout, ts: Date.now() }); save(); }
function mPush() { MP.hist.push(JSON.stringify(MP.root)); if (MP.hist.length > 40) MP.hist.shift(); }
function mLayout() {
  const pos = new Map(), root = MP.root;
  const sz = new Map(); (function w(n) { sz.set(n.id, mSize(n)); mVis(n).forEach(w); })(root);
  if (MP.layout === 'radial') {
    const place = (n, a0, a1, d) => { const am = (a0 + a1) / 2, r = d * 200; pos.set(n.id, { x: Math.cos(am) * r, y: Math.sin(am) * r * .82, d }); let a = a0; const tot = mLeaves(n); mVis(n).forEach(k => { const span = (a1 - a0) * mLeaves(k) / (n === root ? tot : tot); place(k, a, a + span, d + 1); a += span; }); };
    pos.set(root.id, { x: 0, y: 0, d: 0 }); let a = -Math.PI / 2; const tot = mLeaves(root);
    mVis(root).forEach(k => { const span = 2 * Math.PI * mLeaves(k) / tot; place(k, a, a + span, 1); a += span; });
  } else {
    const H = MP.layout === 'tree', colW = []; (function w(n, d) { colW[d] = Math.max(colW[d] || 0, sz.get(n.id).w); mVis(n).forEach(k => w(k, d + 1)); })(root, 0);
    let leaf = 0; const slot = H ? 56 : 150;
    const place = (n, d) => { const k = mVis(n); let c; if (!k.length) c = leaf++ * slot; else { k.forEach(x => place(x, d + 1)); c = (pos.get(k[0].id).c + pos.get(k[k.length - 1].id).c) / 2; } const off = colW.slice(0, d).reduce((a, x) => a + x + (H ? 70 : 0), 0) + (H ? 0 : d * 0); pos.set(n.id, { c, d, off }); };
    place(root, 0);
    pos.forEach((p, id) => { if (H) { p.x = p.off + sz.get(id).w / 2; p.y = p.c; } else { p.x = p.c; p.y = p.d * 110; } });
  }
  MP.sz = sz; MP.pos = pos; return pos;
}
function mDraw() {
  const root = MP.root; if (!root) return; const pos = mLayout(); let lines = '', boxes = '', mnx = 1e9, mny = 1e9, mxx = -1e9, mxy = -1e9;
  const place = id => { const p = pos.get(id), n = MP.n[id]; return { x: p.x + (n.dx || 0), y: p.y + (n.dy || 0) }; };
  MP.n = {}; (function idx(n, b) { MP.n[n.id] = n; n._b = b; mVis(n).forEach((k, i) => idx(k, n === root ? i : b)); })(root, 0);
  const nb = Math.max(1, mVis(root).length);
  const walk = (n, par) => {
    const p = place(n.id), s = MP.sz.get(n.id), col = n === root ? 'var(--b,#ffb347)' : `hsl(${n._b * 360 / nb},85%,${86 - Math.min(2, pos.get(n.id).d - 1) * 6}%)`;
    mnx = Math.min(mnx, p.x - s.w / 2); mxx = Math.max(mxx, p.x + s.w / 2); mny = Math.min(mny, p.y - s.h / 2); mxy = Math.max(mxy, p.y + s.h / 2);
    if (par) { const q = place(par.id); lines += MP.layout === 'radial' ? `<line x1="${q.x}" y1="${q.y}" x2="${p.x}" y2="${p.y}" stroke="#777" stroke-width="${Math.max(1.2, 2.6 - pos.get(n.id).d * .5)}"/>` : MP.layout === 'tree' ? `<path d="M${q.x + MP.sz.get(par.id).w / 2} ${q.y} C ${q.x + MP.sz.get(par.id).w / 2 + 40} ${q.y}, ${p.x - s.w / 2 - 40} ${p.y}, ${p.x - s.w / 2} ${p.y}" fill="none" stroke="#777" stroke-width="1.6"/>` : `<path d="M${q.x} ${q.y + MP.sz.get(par.id).h / 2} C ${q.x} ${q.y + 60}, ${p.x} ${p.y - 60}, ${p.x} ${p.y - s.h / 2}" fill="none" stroke="#777" stroke-width="1.6"/>`; }
    const hid = n.collapsed && n.c.length ? `<g class="mbadge"><circle cx="${s.w / 2}" cy="${-s.h / 2}" r="11" fill="#222"/><text x="${s.w / 2}" y="${-s.h / 2 + 4}" text-anchor="middle" font-size="11" fill="#fff" font-family="system-ui">+${mCount(n) - 1}</text></g>` : '';
    boxes += `<g class="mn ${MP.sel === n.id ? 'sel' : ''}" data-id="${n.id}" transform="translate(${p.x} ${p.y})"><rect x="${-s.w / 2}" y="${-s.h / 2}" width="${s.w}" height="${s.h}" rx="${n === root ? 18 : 12}" fill="${col}" stroke="#222" stroke-width="1.2"/><text text-anchor="middle" font-size="${n === root ? 15 : 12}" font-weight="${n === root ? 800 : 600}" fill="#222" font-family="system-ui,sans-serif">${s.L.map((l, i) => `<tspan x="0" y="${-s.h / 2 + 19 + i * 16}">${esc(l)}</tspan>`).join('')}</text>${hid}</g>`;
    mVis(n).forEach(k => walk(k, n));
  };
  walk(root, null); const pad = 50, vx = mnx - pad, vy = mny - pad, vw = mxx - mnx + pad * 2, vh = mxy - mny + pad * 2;
  MP.vb = { vx, vy, vw, vh }; const svg = $('#mapSvg'); if (!svg) return;
  svg.setAttribute('viewBox', `${vx} ${vy} ${vw} ${vh}`); svg.style.width = Math.max(320, vw * MP.zoom * .9) + 'px'; svg.style.height = (vh * MP.zoom * .9) + 'px';
  svg.innerHTML = `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#fff"/>${lines}${boxes}`;
  $('#mInfo').textContent = `${mCount(root)} idee · selezionata: ${MP.sel && MP.n[MP.sel] ? '«' + short(MP.n[MP.sel].t, 28) + '»' : 'nessuna'}`;
}
function mLocalTree(g) { const d = localMap(g), r = mkN(d.center || g.note.title); d.branches.forEach(b => r.c.push(mkN(b.label, (b.items || []).map(i => mkN(i))))); return r; }
function mFromAI(o) { if (!o) return null; const conv = x => { if (typeof x === 'string') return mkN(x); const lab = x.label || x.t || x.center || '…', kids = x.children || x.items || x.branches || []; return mkN(String(lab), kids.map(conv)); }; return conv(o); }
function mOutline(txt, title) {
  const rows = txt.split('\n').filter(l => l.trim()).map(l => { const m = /^([\s\t]*)([-*•>\d.)]*\s*)(.*)$/.exec(l); return { d: Math.floor(m[1].replace(/\t/g, '  ').length / 2), t: m[3].trim() || l.trim() }; });
  if (!rows.length) return null; const top = rows.filter(r => r.d === rows[0].d).length, root = top === 1 ? mkN(rows[0].t) : mkN(title || 'Mappa'), st = [{ n: root, d: top === 1 ? rows[0].d : rows[0].d - 1 }];
  rows.slice(top === 1 ? 1 : 0).forEach(r => { const k = mkN(r.t); while (st.length > 1 && st[st.length - 1].d >= r.d) st.pop(); st[st.length - 1].n.c.push(k); st.push({ n: k, d: r.d }); }); return root;
}
function mList(txt) { const parts = txt.split(/\n|,|;/).map(x => x.trim()).filter(Boolean); if (!parts.length) return null; return mkN(parts[0], parts.slice(1).map(x => mkN(x))); }
function askText(title, hint, val, cb, multi = true) {
  const m = openModal(`<h2>${title}</h2><p class="muted">${hint}</p>${multi ? `<textarea id="atx" style="min-height:160px;width:100%">${esc(val)}</textarea>` : `<input id="atx" style="width:100%" value="${esc(val)}">`}<button class="btn" id="aok" style="width:100%;margin-top:10px">Conferma</button>`);
  const go2 = () => { const v = $('#atx', m).value; closeModal(); cb(v); }; $('#aok', m).onclick = go2; if (!multi) $('#atx', m).onkeydown = e => { if (e.key === 'Enter') go2(); }; setTimeout(() => $('#atx', m) && $('#atx', m).focus(), 80);
}
function mOpen(root, title, layout) { MP.root = root; MP.title = title; MP.layout = layout || MP.layout; MP.id = null; MP.sel = root.id; MP.hist = []; MP.zoom = 1; MP.ex = ''; mSave(); }
function mExport(png) {
  const svg = $('#mapSvg').cloneNode(true), b = MP.vb; svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); svg.setAttribute('width', b.vw * 2); svg.setAttribute('height', b.vh * 2); svg.removeAttribute('style'); svg.querySelectorAll('.sel rect').forEach(r => r.setAttribute('stroke-width', 1.2));
  const str = svg.outerHTML.replace(/var\(--b,#ffb347\)/g, '#ffb347');
  if (!png) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([str], { type: 'image/svg+xml' })); a.download = 'mappa-shashi.svg'; a.click(); return; }
  const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); c.width = b.vw * 2; c.height = b.vh * 2; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0); c.toBlob(bl => { const a = document.createElement('a'); a.href = URL.createObjectURL(bl); a.download = 'mappa-shashi.png'; a.click(); }); }; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str);
}
panels.map = () => {
  S.maps = S.maps || [];
  main().innerHTML = `<h2>🕸️ ${t('map')}</h2>` + ctl() + `<div class="card"><h3>✨ Crea una nuova mappa</h3><div class="mkRow">
  <button class="mk" id="mkAuto"><b>🤖 Automatica</b><small>${hasAI() ? 'L\'AI legge l\'appunto' : 'Dai concetti dell\'appunto'}</small></button>
  <button class="mk" id="mkOut"><b>📋 Da scaletta</b><small>Titoli e sottotitoli rientrati</small></button>
  <button class="mk" id="mkList"><b>🧩 Da elenco</b><small>Tema + parole separate da virgola</small></button>
  <button class="mk" id="mkBlank"><b>✍️ Vuota</b><small>Parti da zero e costruisci</small></button></div>
  ${S.maps.length ? `<div class="row" style="margin-top:10px"><label>Le mie mappe<select id="mSaved"><option value="">— apri una mappa salvata —</option>${S.maps.slice().sort((a, b) => b.ts - a.ts).map(m => `<option value="${m.id}" ${m.id === MP.id ? 'selected' : ''}>${esc(m.title)}</option>`).join('')}</select></label><button class="btn del" id="mDelMap">🗑 Elimina mappa</button></div>` : ''}</div>
  <div id="mEd"></div><div id="out"></div>`;
  wireCtl();
  const start = (root, title) => { mOpen(root, title); S.cnt.maps++; addXp(10); sfx('success'); edRender(); };
  $('#mkAuto').onclick = async () => {
    const g = getSel(); if (!g) return; busy($('#out'), 'Creo la mappa…'); let root = null, ex = '';
    try { const r = parseJSON(await aiText('Sei un tutor che crea mappe concettuali. Rispondi SOLO con JSON valido.', `${styleNote(g)}\nCrea una mappa concettuale del testo su 3 livelli. Formato: {"label":"tema","children":[{"label":"concetto breve","children":[{"label":"dettaglio/esempio breve","children":[]}]}],"explanation":"spiegazione semplificata di 6-10 frasi"}. Da 5 a 8 rami, massimo 4 figli per nodo, etichette brevi (max 60 caratteri).\n\nTESTO:\n${g.text.slice(0, 14000)}`)); if (r && (r.children || r.branches)) { root = mFromAI(r); ex = r.explanation || ''; } } catch (e) { toast('AI non disponibile: ' + e.message); }
    $('#out').innerHTML = ''; if (!root) root = mLocalTree(g); start(root, g.note.title); MP.ex = ex; edRender();
  };
  $('#mkOut').onclick = () => askText('📋 Da scaletta', 'Una voce per riga. Rientra con spazi o tab per creare i sotto-livelli.', 'Fotosintesi\n  Fase luminosa\n    Tilacoidi\n  Ciclo di Calvin\n    Stroma', v => { const r = mOutline(v, 'Mappa'); if (!r) return toast('Scrivi almeno una riga.'); start(r, r.t); });
  $('#mkList').onclick = () => askText('🧩 Da elenco', 'Prima riga = tema centrale. Poi i rami separati da virgola o a capo.', 'Seconda guerra mondiale, cause, fasi, protagonisti, conseguenze', v => { const r = mList(v); if (!r) return toast('Scrivi almeno il tema.'); start(r, r.t); });
  $('#mkBlank').onclick = () => askText('✍️ Mappa vuota', 'Come si chiama il tema centrale?', 'Nuovo tema', v => { const r = mkN(v.trim() || 'Nuovo tema', []); start(r, r.t); }, false);
  if ($('#mSaved')) { $('#mSaved').onchange = e => { const m = S.maps.find(x => x.id === e.target.value); if (!m) return; MP.root = JSON.parse(JSON.stringify(m.root)); MP.title = m.title; MP.layout = m.layout || 'radial'; MP.id = m.id; MP.sel = MP.root.id; MP.hist = []; MP.zoom = 1; MP.ex = ''; edRender(); }; $('#mDelMap').onclick = () => { const id = $('#mSaved').value || MP.id; if (!id || !confirm('Eliminare questa mappa?')) return; S.maps = S.maps.filter(x => x.id !== id); if (MP.id === id) { MP.root = null; MP.id = null; } save(); panels.map(); }; }
  function edRender() {
    if (!MP.root) { $('#mEd').innerHTML = ''; return; }
    $('#mEd').innerHTML = `<div class="card mEditor"><div class="row mtop"><label style="flex:1;min-width:150px">Titolo<input id="mTitle" value="${esc(MP.title)}"></label><label>Disposizione<select id="mLay"><option value="radial" ${MP.layout === 'radial' ? 'selected' : ''}>🌸 Radiale</option><option value="tree" ${MP.layout === 'tree' ? 'selected' : ''}>➡️ Albero orizzontale</option><option value="vtree" ${MP.layout === 'vtree' ? 'selected' : ''}>⬇️ Albero verticale</option></select></label></div>
    <div class="mtool"><button class="btn" id="mAddC">➕ Figlio</button><button class="btn alt" id="mAddS">↔️ Fratello</button><button class="btn alt" id="mRen">✎ Rinomina</button><button class="btn alt" id="mCol">▾ Comprimi</button><button class="btn del" id="mDel">🗑 Elimina</button><button class="btn alt" id="mUndo">↩️ Annulla</button><button class="btn alt" id="mReset">🧹 Riordina</button><button class="btn alt" id="mZm">🔍−</button><button class="btn alt" id="mZp">🔍+</button></div>
    <p class="muted" id="mInfo"></p><p class="muted">Tocca un riquadro per selezionarlo, trascinalo per spostarlo, doppio tocco per rinominarlo. Le modifiche si salvano da sole.</p>
    <div class="mwrap"><svg id="mapSvg" class="map" xmlns="http://www.w3.org/2000/svg"></svg></div>
    <div class="row"><button class="btn alt" id="mSvg">⬇️ SVG</button><button class="btn alt" id="mPng">🖼️ PNG</button></div></div>` + (MP.ex ? `<div class="card"><h3>Spiegazione semplificata</h3><p>${esc(MP.ex)}</p></div>` : '');
    mWire(); mDraw();
  }
  function mWire() {
    const sel = () => MP.n[MP.sel] ? mFind(MP.root, MP.sel) : null, commit = () => { mSave(); mDraw(); };
    const rename = id => { const r = mFind(MP.root, id); if (!r) return; askText('✎ Testo dell\'idea', 'Scrivi il nuovo testo.', r.n.t, v => { if (v.trim()) { mPush(); r.n.t = v.trim(); commit(); } }, false); };
    $('#mTitle').onchange = e => { MP.title = e.target.value || 'Mappa'; mSave(); }; $('#mLay').onchange = e => { MP.layout = e.target.value; (function z(n) { n.dx = n.dy = 0; n.c.forEach(z); })(MP.root); commit(); sfx('nav'); };
    $('#mAddC').onclick = () => { const r = sel(); if (!r) return toast('Seleziona prima un riquadro.'); mPush(); const k = mkN('Nuova idea'); r.n.collapsed = false; r.n.c.push(k); MP.sel = k.id; commit(); sfx('add'); rename(k.id); };
    $('#mAddS').onclick = () => { const r = sel(); if (!r) return toast('Seleziona prima un riquadro.'); if (!r.par) return toast('Il tema centrale non ha fratelli: usa ➕ Figlio.'); mPush(); const k = mkN('Nuova idea'); r.par.c.splice(r.par.c.indexOf(r.n) + 1, 0, k); MP.sel = k.id; commit(); sfx('add'); rename(k.id); };
    $('#mRen').onclick = () => { if (MP.sel) rename(MP.sel); else toast('Seleziona prima un riquadro.'); };
    $('#mCol').onclick = () => { const r = sel(); if (!r) return toast('Seleziona prima un riquadro.'); if (!r.n.c.length) return toast('Questo riquadro non ha figli.'); mPush(); r.n.collapsed = !r.n.collapsed; $('#mCol').textContent = r.n.collapsed ? '▸ Espandi' : '▾ Comprimi'; commit(); sfx('click'); };
    $('#mDel').onclick = () => { const r = sel(); if (!r) return toast('Seleziona prima un riquadro.'); if (!r.par) return toast('Il tema centrale non si può eliminare.'); if (r.n.c.length && !confirm('Eliminare anche le ' + (mCount(r.n) - 1) + ' idee collegate?')) return; mPush(); r.par.c.splice(r.par.c.indexOf(r.n), 1); MP.sel = r.par.id; commit(); sfx('del'); };
    $('#mUndo').onclick = () => { const h = MP.hist.pop(); if (!h) return toast('Niente da annullare.'); MP.root = JSON.parse(h); if (!MP.n || !mFind(MP.root, MP.sel)) MP.sel = MP.root.id; commit(); };
    $('#mReset').onclick = () => { mPush(); (function z(n) { n.dx = n.dy = 0; n.c.forEach(z); })(MP.root); commit(); };
    $('#mZp').onclick = () => { MP.zoom = Math.min(3, MP.zoom + .25); mDraw(); }; $('#mZm').onclick = () => { MP.zoom = Math.max(.4, MP.zoom - .25); mDraw(); };
    $('#mSvg').onclick = () => mExport(false); $('#mPng').onclick = () => mExport(true);
    const svg = $('#mapSvg'); let drag = null;
    const toSvg = e => { const r = svg.getBoundingClientRect(), v = MP.vb; return { x: v.vx + (e.clientX - r.left) / r.width * v.vw, y: v.vy + (e.clientY - r.top) / r.height * v.vh }; };
    svg.onpointerdown = e => { const g = e.target.closest('.mn'); if (!g) { MP.sel = null; mDraw(); return; } const n = MP.n[g.dataset.id]; MP.sel = n.id; const now = Date.now(); if (MP.lastTap && MP.lastTap.id === n.id && now - MP.lastTap.t < 380) { MP.lastTap = null; mDraw(); rename(n.id); return; } MP.lastTap = { id: n.id, t: now }; const p = toSvg(e); drag = { id: n.id, sx: p.x, sy: p.y, ox: n.dx || 0, oy: n.dy || 0, moved: false }; svg.setPointerCapture(e.pointerId); mDraw(); const r = sel(); $('#mCol').textContent = r && r.n.collapsed ? '▸ Espandi' : '▾ Comprimi'; sfx('tick'); };
    svg.onpointermove = e => { if (!drag) return; const p = toSvg(e), dx = p.x - drag.sx, dy = p.y - drag.sy; if (!drag.moved && Math.hypot(dx, dy) < 6) return; if (!drag.moved) { mPush(); drag.moved = true; } const n = MP.n[drag.id]; n.dx = drag.ox + dx; n.dy = drag.oy + dy; if (!drag.raf) drag.raf = requestAnimationFrame(() => { drag && (drag.raf = 0); mDraw(); }); };
    svg.onpointerup = svg.onpointercancel = () => { if (drag && drag.moved) mSave(); drag = null; };
  }
  if (MP.root) edRender();
};

// ============ SPOTIFY (player incorporato) ============
const SPOT = [['Deep Focus', 'playlist', '37i9dQZF1DWZeKCadgRdKQ'], ['Peaceful Piano', 'playlist', '37i9dQZF1DX4sWSpwq3LiO'], ['Lo-Fi Beats', 'playlist', '37i9dQZF1DWWQRwui0ExPn'], ['Brain Food', 'playlist', '37i9dQZF1DWXLeA8Omikj7'], ['Classical Essentials', 'playlist', '37i9dQZF1DWWEJlAGA9gs0']];
function spParse(x) { x = (x || '').trim(); let m = /open\.spotify\.com\/(?:intl-[a-z]+\/)?(playlist|album|track|artist|episode|show)\/([A-Za-z0-9]+)/.exec(x) || /spotify:(playlist|album|track|artist|episode|show):([A-Za-z0-9]+)/.exec(x); return m ? { type: m[1], id: m[2] } : null; }
function spFrame(o) { const h = ['track', 'episode'].includes(o.type) ? 152 : 380; return `<iframe title="Spotify" style="border-radius:14px;border:0;width:100%;height:${h}px" src="https://open.spotify.com/embed/${o.type}/${o.id}?utm_source=generator" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`; }
const music0 = panels.music;
panels.music = () => {
  music0(); const cur = CFG.spotify || { type: SPOT[0][1], id: SPOT[0][2] };
  $('#main').insertAdjacentHTML('afterbegin', `<div class="card spCard"><h3>🟢 Spotify</h3><p class="muted">Scegli una playlist per studiare, oppure incolla il link di una canzone, playlist o album. Accedi a Spotify nel player qui sotto per ascoltare i brani interi.</p>
  <div class="chips">${SPOT.map(([n, t, i]) => `<button class="chip ${cur.id === i ? 'on' : ''}" data-sp="${t}:${i}">${n}</button>`).join('')}</div>
  <div class="row"><input id="spIn" placeholder="Incolla un link open.spotify.com/…" style="flex:1;min-width:180px"><button class="btn" id="spGo">▶ Carica</button><a class="btn alt" id="spOpen" target="_blank" rel="noopener" href="https://open.spotify.com/${cur.type}/${cur.id}">Apri in Spotify ↗</a></div>
  <div id="spBox">${spFrame(cur)}</div></div>`);
  const load = o => { CFG.spotify = o; saveCfg(); $('#spBox').innerHTML = spFrame(o); $('#spOpen').href = `https://open.spotify.com/${o.type}/${o.id}`; $$('[data-sp]').forEach(b => b.classList.toggle('on', b.dataset.sp === o.type + ':' + o.id)); };
  $$('[data-sp]').forEach(b => b.onclick = () => { const [t, i] = b.dataset.sp.split(':'); load({ type: t, id: i }); });
  $('#spGo').onclick = () => { const o = spParse($('#spIn').value); if (!o) return toast('Link non riconosciuto: usa «Condividi → Copia link» in Spotify.'); load(o); };
  $('#spIn').onkeydown = e => { if (e.key === 'Enter') $('#spGo').click(); };
};

// ============ SCHERMO A RIPOSO (foto casuali dopo inattività) ============
const PHK = 'shashi_photos', getPh = () => { try { return JSON.parse(localStorage.getItem(PHK) || '[]'); } catch { return []; } };
const IDLE = { last: Date.now(), on: false, paused: null, timer: 0, idx: 0, layer: 0, shown: 0 };
const idleMs = () => (CFG.idleMin === undefined ? 5 : +CFG.idleMin) * 60000;
function photoList() { const mode = CFG.idlePhotos || 'both', own = getPh(), out = []; if (mode !== 'online') out.push(...own); if (mode !== 'own' || !own.length) for (let i = 0; i < 12; i++) out.push('https://picsum.photos/seed/shashi' + Math.floor(Math.random() * 9999) + '/1600/1000'); return out.sort(() => Math.random() - .5); }
const artBg = () => `linear-gradient(${Math.floor(Math.random() * 360)}deg,hsl(${Math.floor(Math.random() * 360)},70%,45%),hsl(${Math.floor(Math.random() * 360)},75%,25%))`;
function idleShow() {
  const ov = $('#idle'); if (!ov) return; const L = $$('.ilayer', ov), list = IDLE.list, src = list[IDLE.idx++ % list.length], next = L[IDLE.layer ^= 1], prev = L[IDLE.layer ^ 1];
  const apply = bg => { next.style.backgroundImage = bg; next.classList.remove('on'); void next.offsetWidth; next.classList.add('on'); prev.classList.remove('on'); };
  if (/^data:/.test(src) || /^https?:/.test(src)) { const im = new Image(); im.onload = () => apply(`url("${src}")`); im.onerror = () => apply(artBg()); im.src = src; } else apply(artBg());
  if (IDLE.idx % list.length === 0) IDLE.list = photoList();
}
const idleClock = () => { const c = $('#idle .iclock'); if (c) c.textContent = new Date().toLocaleTimeString(CFG.lang, { hour: '2-digit', minute: '2-digit' }); };
function idleStart(force) {
  if (IDLE.on) return; IDLE.on = true; IDLE.paused = { timer: TM.run, music: !player.paused, noise: noiseNodes.length > 0, pod: !!(typeof POD !== 'undefined' && POD.playing) };
  if (TM.run) toggleTimer(); try { player.pause(); } catch { } try { noise('off'); } catch { } if (IDLE.paused.pod && typeof podPause === 'function') podPause(); stopDialogue(); closeModal();
  const ov = document.createElement('div'); ov.id = 'idle'; ov.innerHTML = '<div class="ilayer"></div><div class="ilayer"></div><div class="ibox"><div class="iclock"></div><p>⏸ SHASHI è in pausa</p><small>Tocca lo schermo o premi un tasto per riprendere</small></div>'; document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add('on')); IDLE.list = photoList(); IDLE.idx = 0; idleShow(); idleClock(); IDLE.cyc = setInterval(() => { idleShow(); }, 8000); IDLE.clk = setInterval(idleClock, 15000); sfx('close');
}
function idleStop() {
  if (!IDLE.on) return; IDLE.on = false; clearInterval(IDLE.cyc); clearInterval(IDLE.clk); IDLE.last = Date.now(); const ov = $('#idle'); if (ov) { ov.classList.remove('on'); setTimeout(() => ov.remove(), 450); }
  const p = IDLE.paused || {}; IDLE.paused = null; if (p.timer && !TM.run) toggleTimer(); if (p.music) player.play().catch(() => { }); if (p.noise && S.settings.ambient && S.settings.ambient !== 'off') noise(S.settings.ambient); if (p.pod && typeof podResume === 'function') podResume(); toast('▶ Bentornato! Ho ripreso da dove eri rimasto.'); sfx('open');
}
let _mv = 0;
['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach(ev => document.addEventListener(ev, e => { if (IDLE.on) { e.preventDefault && e.cancelable && e.preventDefault(); e.stopPropagation(); idleStop(); } else IDLE.last = Date.now(); }, { capture: true, passive: false }));
document.addEventListener('click', e => { if (IDLE.on) { e.stopPropagation(); e.preventDefault(); } }, true);
document.addEventListener('pointermove', e => { if (IDLE.on) { _mv += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0); if (_mv > 160) { _mv = 0; idleStop(); } } else { IDLE.last = Date.now(); _mv = 0; } }, { passive: true });
setInterval(() => {
  const ms = idleMs(); if (!ms || IDLE.on) return; if (Date.now() - IDLE.last < ms) return;
  if (document.body.classList.contains('speaking') || (typeof POD !== 'undefined' && POD.playing)) { IDLE.last = Date.now() - ms + 30000; return; } // sta ascoltando: non è inattività
  idleStart();
}, 4000);
window.__idle = { start: idleStart, stop: idleStop, state: IDLE };

// ============ EFFETTI SONORI ============
const SF = { ctx: null, last: {} };
function sctx() { if (!SF.ctx) SF.ctx = new (window.AudioContext || window.webkitAudioContext)(); if (SF.ctx.state === 'suspended') SF.ctx.resume(); return SF.ctx; }
function tone(f, d, type = 'sine', vol = .2, when = 0, to) { const c = sctx(), t0 = c.currentTime + when, o = c.createOscillator(), g = c.createGain(), v = vol * (CFG.sfxVol === undefined ? .5 : CFG.sfxVol) * 2; o.type = type; o.frequency.setValueAtTime(f, t0); if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + d); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(.0002, v), t0 + .012); g.gain.exponentialRampToValueAtTime(.0001, t0 + d); o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + d + .03); }
function whoosh(d = .28, a = 400, b = 2600, vol = .22) { const c = sctx(), n = Math.floor(c.sampleRate * d), buf = c.createBuffer(1, n, c.sampleRate), ch = buf.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = c.createBufferSource(); s.buffer = buf; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(a, c.currentTime); f.frequency.exponentialRampToValueAtTime(b, c.currentTime + d); const g = c.createGain(), v = vol * (CFG.sfxVol === undefined ? .5 : CFG.sfxVol) * 2; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + d); s.connect(f); f.connect(g); g.connect(c.destination); s.start(); }
const SFXS = {
  click: () => tone(720, .05, 'triangle', .12), tick: () => tone(1000, .025, 'square', .05), nav: () => whoosh(.26, 500, 2800, .16),
  pop: () => { tone(520, .08, 'sine', .14); tone(780, .1, 'sine', .11, .05); }, add: () => { tone(523, .09, 'triangle', .16); tone(784, .13, 'triangle', .16, .07); },
  del: () => tone(360, .18, 'sawtooth', .08, 0, 140), open: () => { tone(440, .07, 'sine', .14); tone(660, .12, 'sine', .14, .06); }, close: () => { tone(660, .06, 'sine', .12); tone(440, .1, 'sine', .12, .05); },
  success: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .22, 'triangle', .16, i * .09)), xp: () => { tone(988, .07, 'square', .06); tone(1319, .16, 'square', .06, .07); }
};
function sfx(n) { if (CFG.sfx === false) return; const now = performance.now(); if (now - (SF.last[n] || 0) < 60) return; SF.last[n] = now; try { SFXS[n] && SFXS[n](); } catch { } }
document.addEventListener('click', e => {
  if (CFG.sfx === false || IDLE.on) return; const t = e.target.closest && e.target.closest('button,a.it,.nav,.pill,.chip,.tab,summary,.nn,.mk,[data-go]'); if (!t || t.id === 'sfxBtn') return;
  if (t.matches('.btn.del,[data-df],[data-di],#nd,.sc button')) sfx('del'); else if (t.matches('[data-go]')) { /* suono nel passaggio di sezione */ } else sfx('click');
}, true);
{ const g0 = go; go = function (k) { if (k !== cur) sfx('nav'); const r = g0(k); stagger(); return r; }; window.go = go; }
{ const t0 = toast; toast = function (m, ms) { sfx('pop'); return t0(m, ms); }; }
{ const c0 = confetti; confetti = function () { sfx('success'); return c0.apply(this, arguments); }; }
{ const a0 = addXp; addXp = function (n) { sfx('xp'); return a0(n); }; }
{ const o0 = openModal, c0 = closeModal; openModal = function (h) { sfx('open'); return o0(h); }; closeModal = function () { if ($('#modal')) sfx('close'); return c0(); }; }

// ============ ANIMAZIONI (sfalsate, ripple, accessibilità) ============
function stagger() { const m = $('#main'); if (!m) return; [...m.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 9))); $$('.list > div,.nlist > a,.ttDay,.fn,.mk,.chip,.dl', m).forEach((c, i) => c.style.setProperty('--i', Math.min(i % 12, 11))); }
document.addEventListener('pointerdown', e => {
  if (CFG.noAnim) return; const t = e.target.closest && e.target.closest('.btn,.nav,.tab,.pill,.it,.chip,.mk,#fab'); if (!t || t.id === 'menuBtn' && false) return;
  const r = t.getBoundingClientRect(), s = document.createElement('span'); s.className = 'rip'; const d = Math.max(r.width, r.height) * 1.6; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`; t.appendChild(s); setTimeout(() => s.remove(), 650);
}, true);
const applyAnim = () => document.body.classList.toggle('noanim', !!CFG.noAnim);

// ============ Impostazioni: suoni, animazioni, riposo ============
function settingsExtra() {
  const ph = getPh(); $('#oaiCard').insertAdjacentHTML('afterend', `<div class="card" id="uxCard"><h3>🔊 Suoni, animazioni e riposo</h3>
  <div class="row"><label style="flex-direction:row;align-items:center"><input type="checkbox" id="uxSfx" ${CFG.sfx !== false ? 'checked' : ''}>&nbsp;🔊 Effetti sonori</label><label>Volume<input type="range" id="uxVol" min="0" max="1" step=".05" value="${CFG.sfxVol === undefined ? .5 : CFG.sfxVol}"></label>
  <label style="flex-direction:row;align-items:center"><input type="checkbox" id="uxAnim" ${CFG.noAnim ? 'checked' : ''}>&nbsp;Riduci le animazioni</label></div>
  <h4>🌙 Schermo a riposo</h4><p class="muted">Se non tocchi l'app per un po', SHASHI va in pausa (timer, musica e suoni) e mostra foto a rotazione. Un tocco e riprende da dove eri.</p>
  <div class="row"><label>Dopo<select id="uxIdle">${[[0, 'Mai'], [1, '1 minuto'], [2, '2 minuti'], [5, '5 minuti'], [10, '10 minuti'], [15, '15 minuti']].map(([v, l]) => `<option value="${v}" ${(CFG.idleMin === undefined ? 5 : +CFG.idleMin) === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
  <label>Foto<select id="uxPh"><option value="both" ${(CFG.idlePhotos || 'both') === 'both' ? 'selected' : ''}>Casuali + le mie</option><option value="online" ${CFG.idlePhotos === 'online' ? 'selected' : ''}>Solo casuali (online)</option><option value="own" ${CFG.idlePhotos === 'own' ? 'selected' : ''}>Solo le mie</option></select></label>
  <label>Aggiungi le tue foto<input type="file" id="uxAdd" accept="image/*" multiple></label><button class="btn alt" id="uxPrev">👁 Anteprima</button></div>
  <div class="thumbs">${ph.map((p, i) => `<span><img src="${p}"><button class="btn del" data-ph="${i}">✕</button></span>`).join('')}</div></div>`);
  $('#uxSfx').onchange = e => { CFG.sfx = e.target.checked; saveCfg(); sfx('pop'); const b = $('#sfxBtn'); if (b) b.textContent = CFG.sfx === false ? '🔇' : '🔊'; };
  $('#uxVol').oninput = e => { CFG.sfxVol = +e.target.value; saveCfg(); sfx('add'); }; $('#uxAnim').onchange = e => { CFG.noAnim = e.target.checked; saveCfg(); applyAnim(); };
  $('#uxIdle').onchange = e => { CFG.idleMin = +e.target.value; saveCfg(); IDLE.last = Date.now(); toast(CFG.idleMin ? `Riposo dopo ${CFG.idleMin} min ✔️` : 'Riposo disattivato'); };
  $('#uxPh').onchange = e => { CFG.idlePhotos = e.target.value; saveCfg(); };
  $('#uxAdd').onchange = async e => { const arr = getPh(); for (const f of e.target.files) { if (arr.length >= 10) { toast('Massimo 10 foto.'); break; } arr.push(await resizeImg(f)); } try { localStorage.setItem(PHK, JSON.stringify(arr)); } catch { toast('Memoria piena: rimuovi qualche foto.'); } panels.settings(); };
  $$('[data-ph]').forEach(b => b.onclick = () => { const arr = getPh(); arr.splice(+b.dataset.ph, 1); localStorage.setItem(PHK, JSON.stringify(arr)); panels.settings(); });
  $('#uxPrev').onclick = () => { idleStart(); };
}

// ============ avvio ============
{ const hr = $('.hright'), d = $('#darkBtn'); if (hr && d && !$('#sfxBtn')) { const b = document.createElement('button'); b.id = 'sfxBtn'; b.className = 'pill'; b.title = 'Effetti sonori'; b.textContent = CFG.sfx === false ? '🔇' : '🔊'; b.onclick = () => { CFG.sfx = CFG.sfx === false; saveCfg(); b.textContent = CFG.sfx === false ? '🔇' : '🔊'; sfx('pop'); }; hr.insertBefore(b, d); } }
applyAnim(); buildNav(); go(cur);
