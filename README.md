# 📖 SHASHI – la tua app di studio gratuita

SHASHI organizza lo studio: pianificatore in base all'orario scolastico, timer con pause, musica per concentrarsi, appunti in cartelle, mappe concettuali, podcast, esercizi, interrogazione con AI, flashcard, calendario con compiti, metodi di studio, voti e statistiche.
Gratis, **senza pubblicità**, funziona anche **offline** e si installa su telefono, tablet e computer.

---

## PARTE 1 – Mettere l'app online con GitHub (gratis)

1. **Crea un account** su <https://github.com> (Sign up) e conferma l'email.
2. In alto a destra clicca **+ → New repository**.
3. Nome: `shashi`. Scegli **Public**. Clicca **Create repository**.
4. Clicca **uploading an existing file**.
5. Trascina dentro **tutti i file della cartella SHASHI**: `index.html`, `style.css`, `app.js`, `manifest.json`, `sw.js`, `icon.svg`, `icon-192.png`, `icon-512.png`, `icon-180.png`, `README.md`.
6. In basso clicca **Commit changes**.
7. Vai in **Settings → Pages**.
8. Sotto *Build and deployment* → *Source* scegli **Deploy from a branch**; *Branch*: **main**, cartella **/ (root)** → **Save**.
9. Aspetta 1-2 minuti e ricarica: in alto compare il tuo indirizzo, tipo
   `https://TUONOME.github.io/shashi/`
   **Questo è il link della tua app**: funziona ovunque e sempre, da qualsiasi dispositivo.

## PARTE 2 – Trasformarla in app (installazione)

Apri il link della tua app e:

| Dispositivo | Cosa fare |
|---|---|
| **Android (Chrome)** | Menu ⋮ → **Installa app** (oppure il pulsante **⬇️ Installa** dentro SHASHI) |
| **iPhone/iPad (Safari)** | Pulsante Condividi → **Aggiungi alla schermata Home** |
| **Windows / Mac / Linux (Chrome o Edge)** | Icona di installazione nella barra degli indirizzi → **Installa** |

Dopo l'installazione l'icona 📖 SHASHI appare come una vera app, si apre a schermo intero e funziona offline.

### Se l'app non si installa
1. **Apri il link `https://…github.io/shashi/`**, non il file `index.html` dal telefono o dal computer: l'installazione funziona solo da un indirizzo `https://`.
2. **Aspetta che la pagina sia completamente caricata** e naviga un po' nell'app (30 secondi): il browser abilita l'installazione solo dopo.
3. **Controlla di aver caricato TUTTI i file**, comprese le tre icone `icon-192.png`, `icon-512.png`, `icon-180.png`, `manifest.json` e `sw.js`.
4. **Android:** usa Chrome (non il browser interno di WhatsApp/Instagram). Menu ⋮ → **Installa app** oppure **Aggiungi a schermata Home**.
5. **iPhone/iPad:** usa **Safari** (non Chrome). Condividi (quadrato con freccia) → **Aggiungi alla schermata Home**. Su iPhone non esiste il pulsante "Installa".
6. **Computer:** Chrome o Edge, icona di installazione a destra nella barra degli indirizzi. Firefox non installa le app.
7. **Dopo aver aggiornato i file:** ricarica con Ctrl+F5 (o chiudi e riapri il browser) per scaricare la versione nuova.

## PARTE 3 – Attivare "Accedi con Google" (gratis)

Serve per avere un profilo per ogni account Google.

1. Vai su <https://console.cloud.google.com> e crea un **nuovo progetto**.
2. **API e servizi → Schermata consenso OAuth** → tipo *Esterno* → compila nome app (SHASHI) ed email → Salva.
3. **API e servizi → Credenziali → Crea credenziali → ID client OAuth**.
4. Tipo: **Applicazione web**.
5. In *Origini JavaScript autorizzate* scrivi: `https://TUONOME.github.io` (senza `/shashi`).
6. Crea e copia il **Client ID** (finisce con `.apps.googleusercontent.com`).
7. In SHASHI vai su **Profilo e impostazioni → Google Client ID**, incollalo, **Salva**: comparirà il pulsante "Accedi con Google".

> I dati sono salvati **sul dispositivo**, separati per ogni account. Per portarli su un altro dispositivo usa **Esporta backup / Importa backup**.

## PARTE 4 – Attivare l'intelligenza artificiale (facoltativo)

Senza chiave l'app funziona con generatori semplici offline. Per mappe, podcast, esercizi e interrogazioni davvero intelligenti:

1. Crea una chiave API su <https://console.anthropic.com> (l'uso dell'AI è a pagamento a consumo, lo decide Anthropic, non l'app).
2. In SHASHI: **Profilo e impostazioni → Chiave API** → incolla → Salva.
3. La chiave resta **solo nel tuo browser**.

## Note importanti

- **Argo**: Argo non permette a un'app esterna di leggere i compiti. Il pulsante **Argo** apre il portale; poi copia i compiti e incollali in **Calendario → Compiti per domani**, e restano in una sezione riservata.
- **CrazyGames**: il sito non può essere incorporato nell'app, quindi si apre in una nuova scheda (pulsante in basso a sinistra). Quel sito ha le sue pubblicità; SHASHI no.
- **Musica**: radio gratuite SomaFM (senza pubblicità) + rumore bianco/pioggia generati dall'app.
- **Tema**: i colori cambiano automaticamente ogni giorno.
- **Aggiornare l'app**: su GitHub apri il file, clicca ✏️, modifica e *Commit*: dopo un minuto è online.

Fatto con ❤️ DEEPxSHANTI

---

## Novità dell'ultima versione
- 🌙/☀️ Tema scuro (pulsante in alto a destra) e cuore che pulsa
- ✅ Lista "Da fare" con scadenze
- 🎯 Obiettivo giornaliero di studio (in Statistiche) con avviso quando lo raggiungi
- 📷 Foto → testo (OCR): fotografa una pagina e diventa un appunto (serve internet)
- ⏲️ Musica con spegnimento automatico dopo 15/30/60 minuti
- 🔔 Timer: puoi disattivare il suono e metterlo a schermo intero
- 🕸️ Mappa concettuale offline senza frasi ripetute

**Per aggiornare l'app su GitHub:** carica di nuovo TUTTI i file del nuovo zip (sovrascrivi i vecchi), aspetta 2 minuti e ricarica con Ctrl+F5.

## Novità (terzo aggiornamento)
- 👋 Schermata di benvenuto: nome, scuola, città, paese, lingua e livello
- ⏳ Banner nel Pianificatore con la prossima verifica/interrogazione e i compiti di domani
- 📖 Timer con scelta della materia e statistiche del tempo studiato per materia
- 📝 Riassunto automatico di un appunto (con AI è migliore; offline estrae le frasi chiave)
- 🖨️ Pulsante PDF/Stampa per ogni appunto
- 🔍 Ricerca negli appunti

Per aggiornare: ricarica su GitHub tutti i file del nuovo zip, aspetta 2 minuti e ricarica con Ctrl+F5.

## Novità (quarto aggiornamento)
- ⭐ Livelli e XP: guadagni punti studiando col timer, facendo quiz, ripassando flashcard e completando le cose da fare
- 🃏 Le risposte sbagliate dei quiz diventano flashcard automaticamente
- 📲 Esporta verifiche, interrogazioni e compiti nel calendario del telefono (file .ics)
- ♿ Lettura facile: testo più grande/piccolo e carattere facilitato per la dislessia (Profilo e impostazioni)
- ⏱️ Il tempo del timer appare nel titolo della scheda e lo schermo resta acceso mentre studi
- ☕ Un consiglio diverso a ogni pausa

Per aggiornare: ricarica su GitHub tutti i file del nuovo zip, aspetta 2 minuti e ricarica con Ctrl+F5.

## Novità (quinto aggiornamento)
- 📆 Piano della settimana nel Pianificatore, con i minuti consigliati per materia e una frase motivazionale al giorno
- 🗓️ Mappa di calore degli ultimi 3 mesi in Statistiche
- 🖼️ Mappa concettuale scaricabile anche come immagine PNG
- 🔊 Interrogazione AI: puoi farti leggere ad alta voce domande e correzioni
- ⚡ Scorciatoie dall'icona dell'app (tieni premuto su Android): Timer, Calendario, Appunti, Interrogazione

Per aggiornare: ricarica su GitHub tutti i file del nuovo zip, aspetta 2 minuti e ricarica con Ctrl+F5.

## Novità (sesto aggiornamento: animazioni)
- ✨ Le sezioni entrano con una dolce animazione e i menu laterali scivolano dentro all'avvio
- 🌈 Intestazione con sfumatura che si muove lentamente; il libro "fluttua" e si inclina al passaggio del mouse
- ⏱️ Anello animato intorno al timer che si svuota mentre studi
- 🎉 Coriandoli quando sali di livello, raggiungi l'obiettivo o fai un quiz perfetto
- 📊 Barre che crescono, contatori che salgono, carte e pulsanti che reagiscono al tocco
- 🃏 Le flashcard si girano, le risposte giuste "saltellano" e quelle sbagliate tremano
- 🎧 Equalizzatore animato mentre suona la musica e rotellina di caricamento per le funzioni AI
- ♿ Se sul tuo dispositivo hai attivato "Riduci animazioni", l'app le disattiva da sola

Per aggiornare: ricarica su GitHub tutti i file del nuovo zip, aspetta 2 minuti e ricarica con Ctrl+F5.

## Novità (settimo aggiornamento: animazioni ovunque)
- 🎬 Schermata iniziale con il libro che si apre e le lettere SHASHI che appaiono
- 🕸️ La mappa concettuale si "disegna" da sola: linee che si tracciano e riquadri che spuntano
- 💧 Effetto onda su pulsanti, menu e pulsanti in alto quando li tocchi
- ❤️ Tocca il cuore DEEPxSHANTI: una pioggia di cuoricini!
- 🌗 Cambio tema chiaro/scuro con icona che ruota e colori che sfumano
- 📜 Liste, domande dei quiz e giorni del calendario entrano uno dopo l'altro
- 📌 L'intestazione si fa compatta quando scorri la pagina; oggi nel calendario pulsa
- 🪟 Finestra di benvenuto con entrata morbida, striscioni con sfumatura animata
- ♿ Con "Riduci animazioni" attivo sul dispositivo, tutto resta visibile ma fermo

Per aggiornare: ricarica su GitHub tutti i file del nuovo zip, aspetta 2 minuti e ricarica con Ctrl+F5.

## Novità (ottavo aggiornamento: animazioni più morbide)
- 🌊 Curve di movimento più dolci e tempi più brevi: le sezioni entrano senza "scatti"
- ⏱️ L'anello del timer ora scorre in modo continuo (prima avanzava a scatti)
- 🎨 Intestazione più leggera: la sfumatura cambia con una dissolvenza invece di ridisegnare continuamente
- 📱 Meno carico su telefoni e tablet; sui touch screen niente effetti "appiccicosi" dopo il tocco
- 🚀 Schermata iniziale più rapida

Per aggiornare: ricarica su GitHub tutti i file del nuovo zip, aspetta 2 minuti e ricarica con Ctrl+F5.

## Novità (nono aggiornamento: voce fluida + idee dal file allegato)
**Podcast con voce più fluida**
- 🔊 Scelta automatica delle voci più naturali del dispositivo (★) e menu per scegliere Voce A e Voce B, con pulsante "Prova le voci"
- 🌊 La voce legge a blocchi in coda anticipata: niente pause innaturali tra una frase e l'altra
- 🧹 Il testo viene "ripulito" prima di essere letto (es. → ad esempio, pag. → pagina, trattini e simboli tolti)
- ⏯️ Pausa/riprendi, battuta precedente/successiva, barra di avanzamento, tocca una riga per ripartire da lì
- 📖 Il podcast continua mentre cambi sezione e lo schermo resta acceso durante l'ascolto
- 🗣️ Anche l'interrogazione AI usa la stessa voce migliorata

**Dal file SHASHI allegato**
- 🐾 **Argo**, assistente focus con consigli che cambiano (anche in base a verifiche vicine e timer acceso)
- 🌌 **Spazio Shanti**: intenzione del giorno, respirazione guidata animata, micro-rituali giornalieri, note di gratitudine
- 🏅 **Badge** sbloccabili e **livelli** con titoli; tocca "⭐ Lv" in alto per vedere i prossimi traguardi
- 🔔 Campanella armoniosa a 528 Hz a fine timer
- 🌌🧘 Nuovi suoni ambientali: Notte stellata e Battito zen; il suono può partire e fermarsi col timer
- 🎯 "Su cosa ti concentri adesso?" nel timer e pulsante **Focus** sulle cose da fare (con priorità)
- 🦊 Scelta dell'avatar nel profilo
- Il pulsante in alto ora si chiama **Portale Argo** (il registro scolastico) per distinguerlo da Argo l'assistente

Per aggiornare: ricarica su GitHub tutti i file del nuovo zip, aspetta 2 minuti e ricarica con Ctrl+F5.

## Novità (decimo aggiornamento: interfaccia)
- **Telefono**: barra in basso (Piano, Timer, Appunti, Esercizi, Menu) e Menu a griglia con tutte le funzioni.
- **Intestazione compatta** su una sola riga, con cuore DEEPxSHANTI al centro.
- **🎮 Giochi**: pulsante flottante in basso a sinistra.
- **Ricerca rapida** (Ctrl/Cmd+K o 🔍) per saltare a qualsiasi sezione.
- Cartelle e appunti più chiari, schermate vuote illustrate, data del calendario leggibile.
- Pulsanti più grandi, margini di sicurezza per i telefoni con notch, nessuno scorrimento orizzontale (anche a 360 px).

Per aggiornare: ricarica tutti i file su GitHub, attendi circa 2 minuti, poi Ctrl+F5. Se l'app è installata, aprila una volta con internet.

## Novità (undicesimo aggiornamento: voce AI)
- **Voce del professore** scelta e regolabile (voce, velocità) con pulsante "Prova voce" e "Ferma"; la scelta resta salvata.
- Preferisce da sola le voci più naturali del dispositivo (★).
- La voce non legge più emoji e simboli; "7/10" diventa "7 su 10".
- Il professore AI parla in modo più discorsivo, senza elenchi.
- **Mani libere**: dopo la domanda ti ascolta e invia la risposta da solo quando smetti di parlare.
- Microfono con testo in tempo reale e indicatore rosso mentre ascolta.
