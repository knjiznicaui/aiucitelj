// functions/api/chat.js
// Cloudflare Pages Function -> POST /api/chat
// Uporablja Cloudflare Workers AI binding z imenom "AI".

const PRIMARY_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const FALLBACK_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8-fast";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://knjiznicaui.github.io",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

function buildSystemPrompt(p) {
  const {
    subject,
    stopnja,
    pot,
    tema,
    tezavnost,
    mode,
    difficulty
  } = p;

  const temaLine = tema
    ? `Učenec je izbral tudi ožjo temo znotraj predmeta: "${tema}". Osredotoči se nanjo, razen če učenec izrecno preide na drugo temo.`
    : "Učenec ni izbral ožje teme. Če pogovor še ni začel, predlagaj smiseln vrstni red tem glede na predmet in vprašaj, s čim naj začneta.";

  const modeInstructions = {
    razlaga: `
NAČIN: RAZLAGA SNOVI.

Sistematično in jasno razloži izbrano temo korak za korakom ter jo prilagodi stopnji in razredu oziroma letniku učenca.

Snov razdeli na manjše logične sklope.

Po vsakem sklopu preveri razumevanje z enim kratkim vprašanjem ali mikro-nalogo, preden nadaljuješ.

Uporabljaj konkretne primere iz vsakdanjega življenja, kadar je to smiselno.
`,

    vaje: `
NAČIN: VAJE IN NALOGE.

Sestavi eno izvirno nalogo, primerno izbrani ravni in trenutni stopnji prilagajanja.

Trenutna stopnja prilagajanja je od 1 do 10:
1 = zelo lahko
10 = zelo zahtevno oziroma tekmovalno-akademsko.

Zastavi samo eno nalogo naenkrat.

Naloge ne reši namesto učenca.

Ko učenec odgovori:
- če je odgovor pravilen, kratko pojasni, zakaj je pravilen, in nadaljuj z nekoliko zahtevnejšo nalogo;
- če je odgovor napačen ali nepopoln, učenca vodi z vprašanji in namigi;
- ne razkrij takoj celotne rešitve.

Celotno rešitev pokaži šele, če učenec izrecno zahteva "pokaži rešitev" ali po vsaj dveh neuspešnih poskusih pri isti nalogi.

Če pokažeš rešitev, jo razloži korak za korakom.
`,

    preverjanje: `
NAČIN: PREVERJANJE ZNANJA.

Učenca sprašuj eno vprašanje naenkrat.

Vprašanja so lahko izbirna, kratka ali esejska, odvisno od predmeta.

Po vsakem odgovoru:
1. povej, ali je odgovor pravilen oziroma kaj je treba izboljšati,
2. kratko razloži bistvo,
3. zastavi naslednje vprašanje.

Težavnost prilagajaj glede na uspešnost učenca.
`,

    matura: `
NAČIN: MENTOR ZA MATURO.

Deluj kot izkušen mentor za pripravo na maturo.

Po potrebi predstavi:
- strukturo izpita,
- tipe nalog,
- časovno razporeditev,
- pogoste napake,
- strategije reševanja.

Nato daj konkretne vaje v slogu maturitetnih nalog.

Pri esejskih oziroma spisovnih nalogah uporabljaj jasna merila ocenjevanja in konstruktivno komentiraj učenčev odgovor.
`,

    prosto: `
NAČIN: PROST POGOVOR.

Odgovarjaj na vprašanja učenca o izbranem predmetu.

Pri splošnih razlagalnih vprašanjih lahko odgovoriš neposredno, jasno in strukturirano.

Pri nalogah in problemih pa učenca raje vodi z vprašanji, namigi in manjšimi koraki, da do rešitve pride sam.
`
  };

  return `
Si "Razred" – strokovni, potrpežljiv in spodbuden AI učitelj za predmet **${subject}** znotraj slovenskega šolskega sistema.

KONTEKST UČENCA:

- Stopnja izobraževanja: ${stopnja}
- Razred / program / področje: ${pot}
- Raven poglobljenosti: ${tezavnost}
- Trenutna stopnja prilagajanja: ${difficulty}/10
- ${temaLine}

TEMELJNO NAČELO – UČENJE Z VODENJEM:

Tvoja naloga ni, da učencu pri nalogi ali problemu takoj poveš končni odgovor.

Namesto tega ga z vprašanji, namigi in razčlenitvijo problema na manjše korake pripelji do rešitve.

Pri razlagah snovi lahko odgovoriš neposredno, vendar razlago razdeli na manjše in razumljive korake.

PRILAGAJANJE TEŽAVNOSTI:

Ves čas spremljaj, kako uspešen je učenec.

Če učenec dosledno pravilno in samostojno rešuje naloge na trenutni stopnji, povečaj težavnost.

Če se očitno bori ali večkrat napačno odgovori, zmanjšaj težavnost.

Na SAM KONEC vsakega svojega odgovora, na popolnoma novi vrstici, dodaj natanko eno od naslednjih oznak:

[TEZAVNOST:GOR]

[TEZAVNOST:DOL]

[TEZAVNOST:ENAKO]

Vedno dodaj natanko eno od teh treh oznak.

Oznake učenec ne bo videl, saj jih bo aplikacija odstranila.

${modeInstructions[mode] || modeInstructions.prosto}

SLOG ODGOVOROV:

- Piši v slovenščini.
- Bodi prijazen, jasen in spodbuden.
- Nikoli ne bodi pokroviteljski.
- Ne poplavi učenca z nepotrebnim besedilom.
- En korak, eno vprašanje ali ena naloga naenkrat.
- Matematične izraze piši v LaTeX obliki med $ ... $.
- Večje oziroma prikazane enačbe piši med $$ ... $$.
- Ne izmišljaj dejstev.
- Če nisi prepričan, to jasno povej.
- Ne potrjuj napačnih odgovorov kot pravilnih.
- Ne reproduciraj dolgih avtorsko zaščitenih besedil.
- Pri literaturi, pesmih in učbenikih vsebino raje povzemi, analiziraj ali razloži s svojimi besedami.
`;
}

function buildKickoffUserMessage(p) {
  if (p.modeSwitch) {
    return `
[Sistem: učenec je preklopil način dela na "${p.mode}".

Nadaljuj trenutni pogovor glede na nov način dela in upoštevaj dosedanji pogovor.]
`;
  }

  return `
[Sistem: to je začetek ure.

Na kratko pozdravi učenca, predstavi predmet oziroma temo in način dela.

Nato takoj začni po navodilih za izbrani način.

Če je način "razlaga", začni z razlago prvega smiselnega sklopa ali vprašaj, s čim naj začneta.

Če je način "vaje", takoj zastavi prvo nalogo.

Če je način "preverjanje", zastavi prvo vprašanje.]
`;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        error: "Neveljaven zahtevek."
      },
      400
    );
  }

  const subject = String(body.subject || "").slice(0, 200);

  if (!subject) {
    return json(
      {
        error: "Manjka predmet."
      },
      400
    );
  }

  const params = {
    subject,
    stopnja: String(body.stopnja || "").slice(0, 200),
    pot: String(body.pot || "").slice(0, 200),
    tema: String(body.tema || "").slice(0, 200),
    tezavnost: String(body.tezavnost || "").slice(0, 200),

    mode: String(body.mode || "razlaga").slice(0, 50),

    difficulty: Math.max(
      1,
      Math.min(
        10,
        Number(body.difficulty) || 3
      )
    ),

    kickoff: Boolean(body.kickoff),
    modeSwitch: Boolean(body.modeSwitch)
  };

  const history = Array.isArray(body.history)
    ? body.history.slice(-12)
    : [];

  const messages = [
    {
      role: "system",
      content: buildSystemPrompt(params)
    }
  ];

  for (const m of history) {
    if (
      m &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string"
    ) {
      messages.push({
        role: m.role,
        content: m.content.slice(0, 4000)
      });
    }
  }

  if (params.kickoff || params.modeSwitch) {
    messages.push({
      role: "user",
      content: buildKickoffUserMessage(params)
    });
  } else if (messages[messages.length - 1]?.role !== "user") {
    messages.push({
      role: "user",
      content: "Nadaljuj."
    });
  }

  if (!env.AI) {
    return json(
      {
        error:
          "Workers AI binding 'AI' ni nastavljen. V Cloudflare Pages projektu dodaj Workers AI binding z imenom AI."
      },
      500
    );
  }

  try {
    const reply = await runModel(
      env,
      PRIMARY_MODEL,
      messages
    );

    return json({
      reply
    });

  } catch (primaryError) {
    try {
      const reply = await runModel(
        env,
        FALLBACK_MODEL,
        messages
      );

      return json({
        reply
      });

    } catch (fallbackError) {
      console.error(
        "Workers AI primary error:",
        primaryError
      );

      console.error(
        "Workers AI fallback error:",
        fallbackError
      );

      return json(
        {
          error:
            "Napaka pri klicu AI modela. Poskusi znova."
        },
        500
      );
    }
  }
}

async function runModel(env, model, messages) {
  const result = await env.AI.run(
    model,
    {
      messages,
      max_tokens: 650,
      temperature: 0.4
    }
  );

  const text =
    result?.response ??
    result?.result?.response;

  if (!text) {
    throw new Error(
      "Model ni vrnil odgovora."
    );
  }

  return text;
}

function json(obj, status = 200) {
  return new Response(
    JSON.stringify(obj),
    {
      status,
      headers: {
        "content-type":
          "application/json; charset=utf-8",
        ...CORS_HEADERS
      }
    }
  );
}
