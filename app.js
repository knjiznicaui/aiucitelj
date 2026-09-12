// app.js — logika aplikacije "Razred"
(() => {
  "use strict";

  /* ---------------- pomožne DOM reference ---------------- */
  const $ = (id) => document.getElementById(id);
  const setupScreen = $("setup-screen");
  const classroom = $("classroom");

  const selStopnja = $("sel-stopnja");
  const rowSub1 = $("row-sub1"), lblSub1 = $("lbl-sub1"), selSub1 = $("sel-sub1");
  const rowSub2 = $("row-sub2"), lblSub2 = $("lbl-sub2"), selSub2 = $("sel-sub2");
  const lblPredmet = $("lbl-predmet"), selPredmet = $("sel-predmet");
  const selTezavnost = $("sel-tezavnost");
  const inpTema = $("inp-tema");
  const btnStart = $("btn-start");

  const sideSubject = $("side-subject");
  const sideMeta = $("side-meta");
  const meterFill = $("meter-fill");
  const meterLabel = $("meter-label");
  const modeList = $("mode-list");
  const chatScroll = $("chat-scroll");
  const composer = $("composer");
  const msgInput = $("msg-input");
  const btnChangeSubject = $("btn-change-subject");
  const btnResetTopic = $("btn-reset-topic");

  /* ---------------- stanje ---------------- */
  let state = null; // se napolni ob "Vstopi v razred"

  function storageKey(s) {
    return `razred:${s.stopnja}|${s.pot}|${s.predmet}|${s.tema || ""}`;
  }

  function loadProgress(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* no-op */ }
    return { difficulty: 3, history: [] };
  }

  function saveProgress() {
    if (!state) return;
    localStorage.setItem(state.key, JSON.stringify({
      difficulty: state.difficulty,
      history: state.history
    }));
  }

  /* ---------------- 1. koraka: sestavi izbirni panel ---------------- */
  function fillSelect(select, items) {
    select.innerHTML = "";
    items.forEach((label) => {
      const opt = document.createElement("option");
      opt.value = label;
      opt.textContent = label;
      select.appendChild(opt);
    });
  }

  function populateStopnja() {
    fillSelect(selStopnja, Object.keys(CURRICULUM));
    onStopnjaChange();
  }

  function onStopnjaChange() {
    const stopnjaKey = selStopnja.value;
    const stopnja = CURRICULUM[stopnjaKey];

    if (stopnja.kind === "grades") {
      rowSub1.hidden = false; rowSub2.hidden = true;
      lblSub1.textContent = "2. Razred";
      fillSelect(selSub1, Object.keys(stopnja.grades));
      onSub1Change();
    } else if (stopnja.kind === "programs") {
      rowSub1.hidden = false; rowSub2.hidden = false;
      lblSub1.textContent = "2. Izobraževalni program";
      fillSelect(selSub1, Object.keys(stopnja.programs));
      onSub1Change();
    } else if (stopnja.kind === "matura") {
      rowSub1.hidden = false; rowSub2.hidden = true;
      lblSub1.textContent = "2. Tip mature";
      fillSelect(selSub1, Object.keys(stopnja.tipi));
      onSub1Change();
    } else if (stopnja.kind === "academic") {
      rowSub1.hidden = false; rowSub2.hidden = true;
      lblSub1.textContent = "2. Področje študija";
      fillSelect(selSub1, Object.keys(stopnja.področja));
      onSub1Change();
    }
  }

  function onSub1Change() {
    const stopnjaKey = selStopnja.value;
    const stopnja = CURRICULUM[stopnjaKey];
    lblPredmet.textContent = "Predmet";

    if (stopnja.kind === "grades") {
      fillSelect(selPredmet, stopnja.grades[selSub1.value]);
    } else if (stopnja.kind === "programs") {
      lblSub2.textContent = "3. Letnik";
      fillSelect(selSub2, stopnja.programs[selSub1.value].letniki);
      fillSelect(selPredmet, stopnja.programs[selSub1.value].predmeti);
    } else if (stopnja.kind === "matura") {
      fillSelect(selPredmet, stopnja.tipi[selSub1.value]);
    } else if (stopnja.kind === "academic") {
      fillSelect(selPredmet, stopnja.področja[selSub1.value]);
    }
  }

  function populateTezavnost() {
    fillSelect(selTezavnost, TEZAVNOSTNE_STOPNJE);
    selTezavnost.selectedIndex = 1; // "Standardno" kot privzeto
  }

  function populateModes() {
    modeList.innerHTML = "";
    NACINI_DELA.forEach((m) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "mode-btn";
      b.dataset.mode = m.id;
      b.title = m.opis;
      b.textContent = m.naziv;
      b.addEventListener("click", () => setMode(m.id));
      modeList.appendChild(b);
    });
  }

  selStopnja.addEventListener("change", onStopnjaChange);
  selSub1.addEventListener("change", onSub1Change);

  /* ---------------- vstop v razred ---------------- */
  btnStart.addEventListener("click", () => {
    const stopnjaKey = selStopnja.value;
    const stopnja = CURRICULUM[stopnjaKey];
    const pot = stopnja.kind === "programs"
      ? `${selSub1.value} · ${selSub2.value}`
      : selSub1.value;

    const cfg = {
      stopnja: stopnjaKey,
      pot,
      predmet: selPredmet.value,
      tezavnost: selTezavnost.value,
      tema: inpTema.value.trim(),
      mode: "razlaga"
    };

    const key = storageKey(cfg);
    const saved = loadProgress(key);

    state = {
      ...cfg,
      key,
      difficulty: saved.difficulty,
      history: saved.history,
      busy: false
    };

    setupScreen.hidden = true;
    classroom.hidden = false;
    populateModes();
    setMode("razlaga", { silent: true });
    renderSidebar();
    renderHistory();

    if (state.history.length === 0) {
      sendToTutor({ kickoff: true });
    }
  });

  btnChangeSubject.addEventListener("click", () => {
    classroom.hidden = true;
    setupScreen.hidden = false;
  });

  btnResetTopic.addEventListener("click", () => {
    if (!state) return;
    if (!confirm("Počistim pogovor in začnem to temo znova?")) return;
    state.history = [];
    state.difficulty = 3;
    saveProgress();
    chatScroll.innerHTML = "";
    sendToTutor({ kickoff: true });
  });

  function setMode(modeId, opts = {}) {
    state.mode = modeId;
    [...modeList.children].forEach((b) => b.classList.toggle("active", b.dataset.mode === modeId));
    if (!opts.silent) {
      const naziv = NACINI_DELA.find((m) => m.id === modeId)?.naziv || modeId;
      addSystemNote(`— način: ${naziv} —`);
      sendToTutor({ modeSwitch: true });
    }
  }

  function renderSidebar() {
    sideSubject.textContent = state.predmet;
    sideMeta.textContent = `${state.stopnja} · ${state.pot}${state.tema ? " · " + state.tema : ""}`;
    updateMeter();
  }

  function updateMeter() {
    const pct = Math.max(0, Math.min(10, state.difficulty)) * 10;
    meterFill.style.width = pct + "%";
    meterLabel.textContent = `Stopnja ${state.difficulty} / 10`;
  }

  /* ---------------- sporočila ---------------- */
  function addSystemNote(text) {
    const div = document.createElement("div");
    div.className = "msg system-note";
    div.textContent = text;
    chatScroll.appendChild(div);
    chatScroll.scrollTop = chatScroll.scrollHeight;
  }

  function addMessage(role, text, { thinking = false } = {}) {
    const div = document.createElement("div");
    div.className = `msg ${role === "user" ? "user" : "ai"}${thinking ? " thinking" : ""}`;
    div.innerHTML = renderText(text);
    chatScroll.appendChild(div);
    chatScroll.scrollTop = chatScroll.scrollHeight;
    if (window.renderMathInElement) {
      renderMathInElement(div, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ]
      });
    }
    return div;
  }

  function renderText(text) {
    const esc = text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return esc
      .split(/\n{2,}/)
      .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  function renderHistory() {
    chatScroll.innerHTML = "";
    state.history.forEach((m) => {
      if (m.role === "user" || m.role === "assistant") {
        addMessage(m.role === "user" ? "user" : "ai", m.content);
      }
    });
  }

  /* ---------------- pošiljanje na strežnik ---------------- */
  composer.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = msgInput.value.trim();
    if (!text || !state || state.busy) return;
    msgInput.value = "";
    autoGrow();
    addMessage("user", text);
    state.history.push({ role: "user", content: text });
    saveProgress();
    sendToTutor({});
  });

  msgInput.addEventListener("input", autoGrow);
  function autoGrow() {
    msgInput.style.height = "auto";
    msgInput.style.height = Math.min(160, msgInput.scrollHeight) + "px";
  }

  async function sendToTutor({ kickoff = false, modeSwitch = false } = {}) {
    state.busy = true;
    $("btn-send").disabled = true;
    const thinkingEl = addMessage("ai", "Razmišlja …", { thinking: true });

    const payload = {
      subject: state.predmet,
      stopnja: state.stopnja,
      pot: state.pot,
      tema: state.tema,
      tezavnost: state.tezavnost,
      mode: state.mode,
      difficulty: state.difficulty,
      kickoff,
      modeSwitch,
      history: state.history.slice(-16) // omeji kontekst
    };

    try {
      const res = await fetch("https://aiucitelj.pages.dev/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Strežnik je vrnil napako: " + res.status);
      const data = await res.json();
      let reply = data.reply || "Oprosti, nekaj je šlo narobe. Poskusi znova.";

      const diffMatch = reply.match(/\[TEZAVNOST:(GOR|DOL|ENAKO)\]\s*$/i);
      if (diffMatch) {
        reply = reply.slice(0, diffMatch.index).trim();
        if (diffMatch[1].toUpperCase() === "GOR") state.difficulty = Math.min(10, state.difficulty + 1);
        if (diffMatch[1].toUpperCase() === "DOL") state.difficulty = Math.max(1, state.difficulty - 1);
        updateMeter();
      }

      thinkingEl.remove();
      addMessage("ai", reply);
      if (!kickoff || true) {
        state.history.push({ role: "assistant", content: reply });
      }
      saveProgress();
    } catch (err) {
      thinkingEl.remove();
      addMessage("ai", "Povezava s strežnikom ni uspela. Preveri internetno povezavo ali poskusi kasneje.\n\n(" + err.message + ")");
    } finally {
      state.busy = false;
      $("btn-send").disabled = false;
      msgInput.focus();
    }
  }

  /* ---------------- zagon ---------------- */
  populateStopnja();
  populateTezavnost();
})();
