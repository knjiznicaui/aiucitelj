# Razred — AI učitelj za vsak predmet

Spletna aplikacija, ki deluje kot osebni AI učitelj za **kateri koli predmet slovenskega šolskega
sistema** — od 1. razreda osnovne šole, prek srednje šole in mature, do visokošolske/akademske ravni.

AI učenca **ne** takoj podá z odgovorom, ampak ga s sokratsko metodo (vprašanja, namigi, razčlenitev
problema) vodi do tega, da odgovor najde sam. Zna tudi: razlagati snov korak za korakom, generirati
naloge in jih preverjati, prilagajati težavnost glede na uspešnost, in delovati kot poln mentor za
pripravo na maturo.

Aplikacija je zgrajena tako, da jo lahko **v celoti brezplačno** gostiš na Cloudflare Pages, z AI
odzivi iz **Cloudflare Workers AI** (vgrajen brezplačni dnevni kvota, brez lastnega API ključa).

---

## 1. Arhitektura (na kratko)

```
index.html          – ogrodje strani (izbirni zaslon + "učilnica"/chat)
style.css            – celotna vizualna podoba (tabla + zvezek)
app.js               – logika: izbira predmeta, chat, prilagajanje težavnosti
data/curriculum.js   – seznam vseh stopenj/razredov/programov/predmetov
functions/api/chat.js – Cloudflare Pages Function: sestavi "sistemski prompt"
                         za učitelja in pokliče Workers AI (env.AI.run)
wrangler.toml        – konfiguracija za lokalni razvoj / wrangler deploy
```

Ni baze podatkov in ni beleženja pogovorov na strežniku — zgodovina posamezne teme se shrani
samo lokalno v brskalniku učenca (`localStorage`), da se ob vrnitvi nadaljuje tam, kjer je ostal.

---

## 2. Postavitev na GitHub

```bash
cd razred-ai-ucitelj
git init
git add .
git commit -m "Prva različica: Razred – AI učitelj"
git branch -M main
git remote add origin https://github.com/<tvoje-uporabnisko-ime>/<ime-repozitorija>.git
git push -u origin main
```

---

## 3. Brezplačna postavitev na Cloudflare Pages

1. Pojdi na [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create
   application** → zavihek **Pages** → **Connect to Git**.
2. Izberi svoj GitHub repozitorij.
3. Nastavitve gradnje (build):
   - **Framework preset:** None
   - **Build command:** (pusti prazno)
   - **Build output directory:** `/` (koren repozitorija)
4. Klikni **Save and Deploy**. Po nekaj sekundah bo aplikacija dostopna na naslovu
   `https://<ime-projekta>.pages.dev`.

### Dodaj Workers AI binding (obvezno, sicer AI učitelj ne bo odgovarjal)

Cloudflare iz varnostnih razlogov zahteva, da Workers AI binding za Pages Functions dodaš ročno
prek nadzorne plošče:

1. V projektu na Cloudflare Pages pojdi na **Settings → Functions**.
2. Poišči razdelek **AI bindings** (Workers AI bindings) in klikni **Add binding**.
3. Kot **ime bindinga (Variable name)** vpiši natanko: `AI`
4. Shrani in ponovno objavi (**Retry deployment** / naslednji push bo samodejno uporabil binding).

Od tega trenutka aplikacija deluje v celoti brezplačno v okviru dnevne brezplačne kvote Workers AI
(trenutno okvirno 10.000 "nevronov" na dan na račun — za osebno/šolsko rabo praviloma dovolj).

---

## 4. Lokalno testiranje pred objavo (neobvezno)

```bash
npm install -g wrangler   # če wrangler še nimaš
npm run dev
```

To zažene stran na `http://localhost:8788` z delujočim `/api/chat` preko lokalnega Workers AI
bindinga (potrebna je prijava: `wrangler login`).

---

## 5. Razširitev nabora predmetov / stopenj

Vsi predmeti, razredi, programi in področja študija so zbrani v enem samem datoteka:
`data/curriculum.js`. Struktura je namenoma preprosta (navadni JS objekti/seznami), da lahko
dodajaš:

- nove razrede/predmete v `CURRICULUM["Osnovna šola"].grades`
- nove srednješolske programe v `CURRICULUM["Srednja šola"].programs`
- nova področja visokošolskega/akademskega študija v
  `CURRICULUM["Višja in visokošolska raven"].področja`

Ni potrebno spreminjati ničesar drugega — izbirni meniji in AI učitelj samodejno upoštevajo nov
seznam (ime predmeta/stopnje se preprosto vstavi v navodilo za AI model).

---

## 6. Kako deluje "prilagajanje težavnosti"

Vsak odgovor AI učitelja na koncu (neviden uporabniku) vsebuje oznako
`[TEZAVNOST:GOR]`, `[TEZAVNOST:DOL]` ali `[TEZAVNOST:ENAKO]`, ki jo `app.js` prebere, odstrani iz
prikaza in s tem posodobi interno "stopnjo" (1–10) za to temo. Ta stopnja se pošlje nazaj modelu ob
naslednjem sporočilu, tako da AI ves čas ve, na kateri ravni zahtevnosti naj ostane.

---

## 7. Omejitve, ki jih je vredno poznati

- Cloudflare Workers AI uporablja odprte modele (Llama 3.x) – ti niso tako zmogljivi kot najbolj
  napredni komercialni modeli, a so za razlago šolske snovi in vodeno reševanje nalog povsem
  primerni in **brezplačni**.
- Model občasno lahko naredi napako pri zahtevnejših računskih ali specializiranih vprašanjih —
  aplikacija ne nadomešča učitelja/profesorja, ampak je pripomoček za vajo in razlago.
- Če želiš kakovostnejše odgovore in imaš na voljo proračun, lahko `functions/api/chat.js` z malo
  prilagoditve preklopiš na Anthropic API (Claude) namesto Workers AI — takrat pa aplikacija ni več
  v celoti brezplačna, saj Anthropic API zaračunava po porabi.

---

## 8. Licenca

Uporabi in prilagodi po želji za lastne, šolske ali nekomercialne namene.
