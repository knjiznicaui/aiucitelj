// app.js — logika aplikacije "Razred"
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const setupScreen = $("setup-screen");
  const classroom = $("classroom");

  const selStopnja = $("sel-stopnja");
  const rowSub1 = $("row-sub1");
  const lblSub1 = $("lbl-sub1");
  const selSub1 = $("sel-sub1");

  const rowSub2 = $("row-sub2");
  const lblSub2 = $("lbl-sub2");
  const selSub2 = $("sel-sub2");

  const lblPredmet = $("lbl-predmet");
  const selPredmet = $("sel-predmet");

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
  const btnSend = $("btn-send");

  const btnChangeSubject = $("btn-change-subject");
  const btnResetTopic = $("btn-reset-topic");

  let state = null;

  /*
   * ---------------------------------------------------------
   * LOCAL STORAGE
   * ---------------------------------------------------------
   */

  function storageKey(config) {
    return [
      "razred",
      config.stopnja,
      config.pot,
      config.predmet,
      config.tema || ""
    ].join(":");
  }

  function loadProgress(key) {
    try {
      const raw = localStorage.getItem(key);

      if (raw) {
        const parsed = JSON.parse(raw);

        return {
          difficulty: Number(parsed.difficulty) || 3,
          history: Array.isArray(parsed.history)
            ? parsed.history
            : []
        };
      }
    } catch (error) {
      console.warn(
        "Local storage ni mogoče prebrati:",
        error
      );
    }

    return {
      difficulty: 3,
      history: []
    };
  }

  function saveProgress() {
    if (!state) return;

    try {
      localStorage.setItem(
        state.key,
        JSON.stringify({
          difficulty: state.difficulty,
          history: state.history
        })
      );
    } catch (error) {
      console.warn(
        "Napredek ni mogoče shraniti:",
        error
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * SELECTI
   * ---------------------------------------------------------
   */

  function fillSelect(select, items) {
    select.innerHTML = "";

    items.forEach((label) => {
      const option = document.createElement("option");

      option.value = label;
      option.textContent = label;

      select.appendChild(option);
    });
  }

  function populateStopnja() {
    fillSelect(
      selStopnja,
      Object.keys(CURRICULUM)
    );

    onStopnjaChange();
  }

  function onStopnjaChange() {
    const stopnjaKey = selStopnja.value;
    const stopnja = CURRICULUM[stopnjaKey];

    if (!stopnja) return;

    if (stopnja.kind === "grades") {
      rowSub1.hidden = false;
      rowSub2.hidden = true;

      lblSub1.textContent = "2. Razred";

      fillSelect(
        selSub1,
        Object.keys(stopnja.grades)
      );

      onSub1Change();

    } else if (stopnja.kind === "programs") {
      rowSub1.hidden = false;
      rowSub2.hidden = false;

      lblSub1.textContent =
        "2. Izobraževalni program";

      lblSub2.textContent = "3. Letnik";

      fillSelect(
        selSub1,
        Object.keys(stopnja.programs)
      );

      onSub1Change();

    } else if (stopnja.kind === "matura") {
      rowSub1.hidden = false;
      rowSub2.hidden = true;

      lblSub1.textContent = "2. Tip mature";

      fillSelect(
        selSub1,
        Object.keys(stopnja.tipi)
      );

      onSub1Change();

    } else if (stopnja.kind === "academic") {
      rowSub1.hidden = false;
      rowSub2.hidden = true;

      lblSub1.textContent =
        "2. Področje študija";

      fillSelect(
        selSub1,
        Object.keys(stopnja.področja)
      );

      onSub1Change();
    }
  }

  function onSub1Change() {
    const stopnjaKey = selStopnja.value;
    const stopnja = CURRICULUM[stopnjaKey];

    if (!stopnja) return;

    lblPredmet.textContent = "Predmet";

    if (stopnja.kind === "grades") {
      fillSelect(
        selPredmet,
        stopnja.grades[selSub1.value] || []
      );

    } else if (stopnja.kind === "programs") {
      const program =
        stopnja.programs[selSub1.value];

      if (!program) return;

      fillSelect(
        selSub2,
        program.letniki || []
      );

      fillSelect(
        selPredmet,
        program.predmeti || []
      );

    } else if (stopnja.kind === "matura") {
      fillSelect(
        selPredmet,
        stopnja.tipi[selSub1.value] || []
      );

    } else if (stopnja.kind === "academic") {
      fillSelect(
        selPredmet,
        stopnja.področja[selSub1.value] || []
      );
    }
  }

  function populateTezavnost() {
    fillSelect(
      selTezavnost,
      TEZAVNOSTNE_STOPNJE
    );

    /*
     * Privzeto izberemo standardno raven.
     */
    selTezavnost.selectedIndex = 1;
  }

  /*
   * ---------------------------------------------------------
   * NAČINI DELA
   * ---------------------------------------------------------
   */

  function populateModes() {
    modeList.innerHTML = "";

    NACINI_DELA.forEach((mode) => {
      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "mode-btn";

      button.dataset.mode = mode.id;
      button.title = mode.opis;

      button.textContent = mode.naziv;

      button.addEventListener(
        "click",
        () => setMode(mode.id)
      );

      modeList.appendChild(button);
    });
  }

  function setMode(modeId, options = {}) {
    if (!state) return;

    state.mode = modeId;

    [...modeList.children].forEach(
      (button) => {
        button.classList.toggle(
          "active",
          button.dataset.mode === modeId
        );
      }
    );

    if (!options.silent) {
      const mode =
        NACINI_DELA.find(
          (item) => item.id === modeId
        );

      const naziv =
        mode?.naziv || modeId;

      addSystemNote(
        `— način: ${naziv} —`
      );

      sendToTutor({
        modeSwitch: true
      });
    }
  }

  /*
   * ---------------------------------------------------------
   * START URE
   * ---------------------------------------------------------
   */

  btnStart.addEventListener(
    "click",
    () => {
      const stopnjaKey =
        selStopnja.value;

      const stopnja =
        CURRICULUM[stopnjaKey];

      if (!stopnja) return;

      const pot =
        stopnja.kind === "programs"
          ? `${selSub1.value} · ${selSub2.value}`
          : selSub1.value;

      const config = {
        stopnja: stopnjaKey,
        pot,
        predmet: selPredmet.value,
        tezavnost: selTezavnost.value,
        tema: inpTema.value.trim(),
        mode: "razlaga"
      };

      const key =
        storageKey(config);

      const saved =
        loadProgress(key);

      state = {
        ...config,

        key,

        difficulty:
          Math.max(
            1,
            Math.min(
              10,
              Number(saved.difficulty) || 3
            )
          ),

        history: Array.isArray(saved.history)
          ? saved.history
          : [],

        busy: false
      };

      setupScreen.hidden = true;
      classroom.hidden = false;

      populateModes();

      setMode(
        "razlaga",
        {
          silent: true
        }
      );

      renderSidebar();
      renderHistory();

      /*
       * Če še ni zgodovine, začnemo novo uro.
       */
      if (state.history.length === 0) {
        sendToTutor({
          kickoff: true
        });
      }
    }
  );

  /*
   * ---------------------------------------------------------
   * ZAMENJAVA PREDMETA
   * ---------------------------------------------------------
   */

  btnChangeSubject.addEventListener(
    "click",
    () => {
      classroom.hidden = true;
      setupScreen.hidden = false;
    }
  );

  /*
   * ---------------------------------------------------------
   * RESET TEME
   * ---------------------------------------------------------
   */

  btnResetTopic.addEventListener(
    "click",
    () => {
      if (!state) return;

      const confirmed =
        confirm(
          "Počistim pogovor in začnem to temo znova?"
        );

      if (!confirmed) return;

      state.history = [];
      state.difficulty = 3;

      saveProgress();

      chatScroll.innerHTML = "";

      updateMeter();

      sendToTutor({
        kickoff: true
      });
    }
  );

  /*
   * ---------------------------------------------------------
   * SIDEBAR
   * ---------------------------------------------------------
   */

  function renderSidebar() {
    if (!state) return;

    sideSubject.textContent =
      state.predmet;

    sideMeta.textContent =
      `${state.stopnja} · ${state.pot}` +
      (
        state.tema
          ? ` · ${state.tema}`
          : ""
      );

    updateMeter();
  }

  function updateMeter() {
    if (!state) return;

    const difficulty =
      Math.max(
        1,
        Math.min(
          10,
          Number(state.difficulty) || 3
        )
      );

    const percentage =
      difficulty * 10;

    meterFill.style.width =
      `${percentage}%`;

    meterLabel.textContent =
      `Stopnja ${difficulty} / 10`;
  }

  /*
   * ---------------------------------------------------------
   * SPOROČILA
   * ---------------------------------------------------------
   */

  function addSystemNote(text) {
    const div =
      document.createElement("div");

    div.className =
      "msg system-note";

    div.textContent = text;

    chatScroll.appendChild(div);

    scrollChatToBottom();
  }

  function addMessage(
    role,
    text,
    options = {}
  ) {
    const div =
      document.createElement("div");

    div.className =
      `msg ${
        role === "user"
          ? "user"
          : "ai"
      }${
        options.thinking
          ? " thinking"
          : ""
      }`;

    div.innerHTML =
      renderText(text);

    chatScroll.appendChild(div);

    scrollChatToBottom();

    /*
     * KaTeX matematične izraze
     * obdelamo šele, ko je element v DOM.
     */
    if (
      window.renderMathInElement
    ) {
      try {
        renderMathInElement(
          div,
          {
            delimiters: [
              {
                left: "$$",
                right: "$$",
                display: true
              },
              {
                left: "$",
                right: "$",
                display: false
              },
              {
                left: "\\(",
                right: "\\)",
                display: false
              },
              {
                left: "\\[",
                right: "\\]",
                display: true
              }
            ]
          }
        );
      } catch (error) {
        console.warn(
          "KaTeX napaka:",
          error
        );
      }
    }

    return div;
  }

  function scrollChatToBottom() {
    chatScroll.scrollTop =
      chatScroll.scrollHeight;
  }

  /*
   * AI odgovor najprej HTML-escapeamo,
   * da model ne more neposredno vstavljati HTML-ja.
   */
  function renderText(text) {
    const safeText =
      String(text ?? "")
        .replace(
          /&/g,
          "&amp;"
        )
        .replace(
          /</g,
          "&lt;"
        )
        .replace(
          />/g,
          "&gt;"
        );

    return safeText
      .split(/\n{2,}/)
      .map(
        (paragraph) =>
          `<p>${paragraph.replace(
            /\n/g,
            "<br>"
          )}</p>`
      )
      .join("");
  }

  /*
   * ---------------------------------------------------------
   * ZGODOVINA
   * ---------------------------------------------------------
   */

  function renderHistory() {
    chatScroll.innerHTML = "";

    if (!state) return;

    state.history.forEach(
      (message) => {
        if (
          message.role === "user"
        ) {
          addMessage(
            "user",
            message.content
          );
        }

        if (
          message.role === "assistant"
        ) {
          addMessage(
            "ai",
            message.content
          );
        }
      }
    );
  }

  /*
   * ---------------------------------------------------------
   * POŠILJANJE SPOROČILA
   * ---------------------------------------------------------
   */

  composer.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const text =
        msgInput.value.trim();

      if (
        !text ||
        !state ||
        state.busy
      ) {
        return;
      }

      msgInput.value = "";

      autoGrow();

      addMessage(
        "user",
        text
      );

      state.history.push({
        role: "user",
        content: text
      });

      saveProgress();

      await sendToTutor({});
    }
  );

  /*
   * ---------------------------------------------------------
   * TEXTAREA
   * ---------------------------------------------------------
   */

  msgInput.addEventListener(
    "input",
    autoGrow
  );

  function autoGrow() {
    msgInput.style.height =
      "auto";

    msgInput.style.height =
      Math.min(
        160,
        msgInput.scrollHeight
      ) + "px";
  }

  /*
   * ---------------------------------------------------------
   * KLIC /api/chat
   * ---------------------------------------------------------
   */

  async function sendToTutor({
    kickoff = false,
    modeSwitch = false
  } = {}) {
    if (!state || state.busy) {
      return;
    }

    state.busy = true;

    btnSend.disabled = true;

    const thinkingEl =
      addMessage(
        "ai",
        "Razmišlja …",
        {
          thinking: true
        }
      );

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

      /*
       * Backend ima svojo omejitev,
       * vendar zgodovino omejimo že tukaj.
       */
      history:
        state.history.slice(-12)
    };

    try {
      const response =
        await fetch(
          "/api/chat",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(payload)
          }
        );

      let data = null;

      /*
       * Poskusimo prebrati JSON tudi
       * v primeru strežniške napake.
       */
      try {
        data =
          await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
          `Strežnik je vrnil napako: ${response.status}`
        );
      }

      const rawReply =
        data?.reply;

      if (
        typeof rawReply !== "string" ||
        !rawReply.trim()
      ) {
        throw new Error(
          "AI ni vrnil veljavnega odgovora."
        );
      }

      let reply =
        rawReply.trim();

      /*
       * -----------------------------------------------------
       * ADAPTIVNA TEŽAVNOST
       * -----------------------------------------------------
       *
       * Backend AI na konec odgovora doda:
       *
       * [TEZAVNOST:GOR]
       * [TEZAVNOST:DOL]
       * [TEZAVNOST:ENAKO]
       *
       * Učenec tega ne vidi.
       */

      const difficultyMatch =
        reply.match(
          /\[TEZAVNOST:(GOR|DOL|ENAKO)\]\s*$/i
        );

      if (difficultyMatch) {
        const direction =
          difficultyMatch[1]
            .toUpperCase();

        /*
         * Odstranimo interno oznako
         * iz prikazanega odgovora.
         */
        reply =
          reply
            .slice(
              0,
              difficultyMatch.index
            )
            .trim();

        if (
          direction === "GOR"
        ) {
          state.difficulty =
            Math.min(
              10,
              state.difficulty + 1
            );
        }

        if (
          direction === "DOL"
        ) {
          state.difficulty =
            Math.max(
              1,
              state.difficulty - 1
            );
        }

        updateMeter();
      }

      /*
       * Odstranimo "Razmišlja …".
       */
      thinkingEl.remove();

      /*
       * Prikažemo pravi odgovor.
       */
      addMessage(
        "ai",
        reply
      );

      /*
       * Shranimo AI odgovor v zgodovino.
       */
      state.history.push({
        role: "assistant",
        content: reply
      });

      /*
       * Shranimo napredek.
       */
      saveProgress();

    } catch (error) {
      /*
       * Odstranimo indikator razmišljanja.
       */
      thinkingEl.remove();

      console.error(
        "Napaka pri /api/chat:",
        error
      );

      addMessage(
        "ai",
        "Povezava s strežnikom ni uspela.\n\n" +
        "Preveri internetno povezavo oziroma Cloudflare AI nastavitev in poskusi znova."
      );

    } finally {
      state.busy = false;

      btnSend.disabled = false;

      msgInput.focus();
    }
  }

  /*
   * ---------------------------------------------------------
   * ZAČETNA INICIALIZACIJA
   * ---------------------------------------------------------
   */

  populateStopnja();

  populateTezavnost();
})();
