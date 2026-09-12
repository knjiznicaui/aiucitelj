// functions/api/chat.js
// Cloudflare Pages Function -> POST /api/chat
// Uporablja Workers AI binding (env.AI), ki ga dodaš v nadzorni plošči
// (Workers & Pages -> tvoj projekt -> Settings -> Functions -> AI bindings -> Add binding "AI").
// Ni potreben noben API ključ – brezplačna dnevna kvota (Workers AI free tier).

const PRIMARY_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const FALLBACK_MODEL = "@cf/meta/llama-3.1-8b-instruct";

function buildSystemPrompt(p) {
  const {
    subject, stopnja, pot, tema, tezavnost, mode, difficulty
  } = p;

  const temaLine = tema ? `Učenec je izbral tudi ožjo temo znotraj predmeta: "${tema}". Osredotoči se nanjo, razen če učenec eksplicitno preide na kaj drugega.` :
    "Učenec ni izbral ožje teme – predlagaj smiseln vrstni red tem znotraj predmeta glede na kurikulum in vprašaj, s čim naj začneta, razen če že poteka pogovor.";

  const modeInstructions = {
    razlaga: `NAČIN: RAZLAGA SNOVI.
Sistematično in jasno razloži izbrano temo, korak za korakom, prilagojeno stopnji in razredu/letniku učenca. Snov razdeli na manjše logične sklope. Po vsakem sklopu preveri razumevanje z eno samo kratko vprašanjem ali mikro-nalogo, preden nadaljuješ na naslednji sklop. Uporabljaj konkretne primere iz vsakdanjega življenja, kjer je to smiselno.`,
    vaje: `NAČIN: VAJE IN NALOGE.
Sestavi eno izvirno nalogo, primerno izbrani stopnji poglobljenosti in trenutni "stopnji prilagajanja" (1=zelo lahko, 10=zelo zahtevno/tekmovalno-akademsko). Nalogo zastavi jasno in samo eno naenkrat. NE reši je namesto učenca. Ko učenec poskusi odgovoriti, preveri odgovor: če je pravilen, na kratko čestitaj in pojasni zakaj je pravilen ter ponudi težjo nalogo; če je napačen ali nepopoln, ne izdaj takoj pravilne rešitve – z vprašanji in namigi vodi učenca do tega, da napako najde sam. Celotno rešitev pokaži šele, če učenec izrecno reče "pokaži rešitev" ali po vsaj dveh neuspešnih poskusih pri isti nalogi – in takrat rešitev razloži korak za korakom.`,
    preverjanje: `NAČIN: PREVERJANJE ZNANJA.
Učenca sprašuj eno vprašanje naenkrat (izbirna, kratka ali esejska, glede na predmet), da preveriš razumevanje predelane snovi. Po vsakem odgovoru podaj konstruktivno povratno informacijo in kratko razlago, nato zastavi naslednje, po potrebi težje ali lažje vprašanje glede na uspešnost.`,
    matura: `NAČIN: MENTOR ZA MATURO.
Deluj kot izkušen mentor za pripravo na maturo pri tem predmetu. Po potrebi na kratko predstavi strukturo izpita (npr. pisni/ustni del, obvezne in izbirne teme, tipi nalog, časovna razporeditev), nato daj konkretne vaje v slogu maturitetnih nalog s to snovjo. Uči tudi izpitne strategije (razporejanje časa, tipične pasti, kako se vrednoti odgovor). Pri esejskih/spisovnih nalogah daj jasna merila ocenjevanja in konstruktivno oceni osnutke, ki jih učenec napiše.`,
    prosto: `NAČIN: PROST POGOVOR.
Odgovarjaj na vprašanja učenca o predmetu sproti, še vedno v duhu vodenega učenja: ne podajaj kar naprej golih dokončnih odgovorov na naloge/probleme, ampak najprej preveri, kaj učenec že razume, in ga usmerjaj z vprašanji ter namigi, dokler ne pride do rešitve sam. Za splošna razlagalna vprašanja (ne-naloge) lahko razložiš neposredno, a jedrnato in strukturirano.`
  };

  return `Si "Razred" – strokovni, potrpežljiv in spodbuden AI učitelj za predmet **${subject}** znotraj slovenskega šolskega sistema.

KONTEKST UČENCA:
- Stopnja izobraževanja: ${stopnja}
- Razred / program / področje: ${pot}
- Raven poglobljenosti, ki jo je izbral učenec: ${tezavnost}
- Trenutna interna "stopnja prilagajanja" (1-10, ti jo upravljaš): ${difficulty}
- ${temaLine}

TEMELJNO NAČELO – UČENJE Z VODENJEM (sokratska metoda):
Tvoja naloga NI, da učencu takoj poveš končni odgovor na nalogo ali problem. Namesto tega ga z vprašanji, namigi in razčlenitvijo problema na manjše korake pripelješ do tega, da odgovor najde sam. Razlage snovi (ne-problemskih vsebin) lahko podaš neposredno in jasno, a strukturirano in v manjših, prebavljivih korakih – po vsakem preveri razumevanje.

PRILAGAJANJE TEŽAVNOSTI:
Ves čas presojaj, kako učencu gre. Če dosledno pravilno in samostojno rešuje naloge na trenutni stopnji, poviaj težavnost. Če se očitno bori, poenostavi in razčleni snov bolj drobno. Na SAM KONEC vsakega svojega odgovora, na svoji lastni vrstici, dodaj natanko eno od naslednjih oznak (učenec je ne bo videl, sistem jo prebere in odstrani):
[TEZAVNOST:GOR] – če je čas za višjo težavnost
[TEZAVNOST:DOL] – če je treba znižati težavnost
[TEZAVNOST:ENAKO] – če trenutna težavnost še ustreza
Vedno dodaj natanko eno od teh treh oznak, tudi če gre za splošno razlago ali pogovor.

${modeInstructions[mode] || modeInstructions.prosto}

SLOG ODGOVOROV:
- Piši v slovenščini, prijazno, jasno, brez pokroviteljstva.
- En korak / eno vprašanje / eno nalogo naenkrat – ne poplavi učenca z besedilom.
- Matematične izraze piši v LaTeX zapisu med $ ... $ (npr. $x^2+2x-3=0$), za prikazane enačbe uporabi $$ ... $$.
- Nikoli ne izmišljuj dejstev; če česa nisi prepričan, to jasno povej.
- Ne reproduciraj dobesedno avtorsko zaščitenih besedil (npr. celih pesmi, odlomkov iz učbenikov ali leposlovja) – vsebino lahko povzemaš, analiziraš in razlagaš s svojimi besedami, dobesedni navedki naj bodo kratki (do 15 besed) in redki.
- Bodi spodbuden ob napakah, a pošten – ne potrjuj napačnih odgovorov kot pravilnih.`;
}

function buildKickoffUserMessage(p) {
  if (p.modeSwitch) {
    return `[Sistem: učenec je preklopil način dela na "${p.mode}". Nadaljuj pogovor o temi glede na ta način, upoštevajoč dosedanji pogovor.]`;
  }
  return `[Sistem: to je začetek ure. Na kratko (2-4 povedi) pozdravi učenca, predstavi predmet/temo in način dela, nato takoj začni po navodilih za izbrani način (npr. če je način "razlaga", začni z razlago prvega logičnega sklopa ali vprašaj, s čim naj začneta; če je način "vaje", takoj zastavi prvo nalogo).]`;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Neveljaven zahtevek." }, 400);
  }

  const subject = String(body.subject || "").slice(0, 200);
  if (!subject) return json({ error: "Manjka predmet." }, 400);

  const params = {
    subject,
    stopnja: String(body.stopnja || "").slice(0, 200),
    pot: String(body.pot || "").slice(0, 200),
    tema: String(body.tema || "").slice(0, 200),
    tezavnost: String(body.tezavnost || "").slice(0, 200),
    mode: String(body.mode || "razlaga").slice(0, 50),
    difficulty: Math.max(1, Math.min(10, Number(body.difficulty) || 3)),
    kickoff: !!body.kickoff,
    modeSwitch: !!body.modeSwitch
  };

  const history = Array.isArray(body.history) ? body.history.slice(-16) : [];

  const messages = [{ role: "system", content: buildSystemPrompt(params) }];

  for (const m of history) {
    if (m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string") {
      messages.push({ role: m.role, content: m.content.slice(0, 4000) });
    }
  }

  if (params.kickoff || params.modeSwitch) {
    messages.push({ role: "user", content: buildKickoffUserMessage(params) });
  } else if (messages[messages.length - 1]?.role !== "user") {
    // varovalka: model potrebuje zadnje sporočilo od uporabnika
    messages.push({ role: "user", content: "Nadaljuj." });
  }

  if (!env.AI) {
    return json({
      error: "Workers AI binding 'AI' ni nastavljen. V nadzorni plošči Cloudflare Pages projekta pojdi na Settings -> Functions -> AI bindings in dodaj binding z imenom AI."
    }, 500);
  }

  try {
    const reply = await runModel(env, PRIMARY_MODEL, messages);
    return json({ reply });
  } catch (err1) {
    try {
      const reply = await runModel(env, FALLBACK_MODEL, messages);
      return json({ reply });
    } catch (err2) {
      return json({ error: "Napaka pri klicu AI modela: " + err2.message }, 500);
    }
  }
}

async function runModel(env, model, messages) {
  const result = await env.AI.run(model, {
    messages,
    max_tokens: 900,
    temperature: 0.5
  });
  const text = result?.response ?? result?.result?.response;
  if (!text) throw new Error("Model ni vrnil odgovora.");
  return text;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
