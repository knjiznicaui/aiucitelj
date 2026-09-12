// curriculum.js
// Hierarhija: STOPNJA -> RAZRED/LETNIK/PROGRAM -> PREDMETI
// To je osnovni nabor, ki ga lahko poljubno širiš (glej README -> "Razširitev predmetov").

const CURRICULUM = {
  "Osnovna šola": {
    kind: "grades",
    grades: {
      "1. razred": ["Slovenščina", "Matematika", "Spoznavanje okolja", "Likovna umetnost", "Glasbena umetnost", "Šport"],
      "2. razred": ["Slovenščina", "Matematika", "Spoznavanje okolja", "Likovna umetnost", "Glasbena umetnost", "Šport"],
      "3. razred": ["Slovenščina", "Matematika", "Spoznavanje okolja", "Angleščina", "Likovna umetnost", "Glasbena umetnost", "Šport"],
      "4. razred": ["Slovenščina", "Matematika", "Naravoslovje in tehnika", "Družba", "Angleščina", "Likovna umetnost", "Glasbena umetnost", "Šport"],
      "5. razred": ["Slovenščina", "Matematika", "Naravoslovje in tehnika", "Družba", "Angleščina", "Gospodinjstvo", "Likovna umetnost", "Glasbena umetnost", "Šport"],
      "6. razred": ["Slovenščina", "Matematika", "Naravoslovje", "Geografija", "Zgodovina", "Angleščina", "Gospodinjstvo", "Likovna umetnost", "Glasbena umetnost", "Šport", "Tehnika in tehnologija"],
      "7. razred": ["Slovenščina", "Matematika", "Biologija", "Kemija", "Fizika", "Geografija", "Zgodovina", "Angleščina", "Domovinska in državljanska kultura ter etika", "Likovna umetnost", "Glasbena umetnost", "Šport", "Tehnika in tehnologija"],
      "8. razred": ["Slovenščina", "Matematika", "Biologija", "Kemija", "Fizika", "Geografija", "Zgodovina", "Angleščina", "Domovinska in državljanska kultura ter etika", "Likovna umetnost", "Glasbena umetnost", "Šport", "Tehnika in tehnologija"],
      "9. razred": ["Slovenščina", "Matematika", "Biologija", "Kemija", "Fizika", "Geografija", "Zgodovina", "Angleščina", "Likovna umetnost", "Glasbena umetnost", "Šport"]
    }
  },

  "Srednja šola": {
    kind: "programs",
    programs: {
      "Gimnazija (splošna, strokovna, klasična)": {
        letniki: ["1. letnik", "2. letnik", "3. letnik", "4. letnik"],
        predmeti: ["Slovenščina", "Matematika", "Angleščina", "Nemščina", "Francoščina", "Zgodovina", "Geografija", "Biologija", "Kemija", "Fizika", "Psihologija", "Sociologija", "Filozofija", "Informatika", "Likovna umetnost", "Glasbena umetnost", "Šport", "Latinščina"]
      },
      "Strojništvo (SSI/PTI)": {
        letniki: ["1. letnik", "2. letnik", "3. letnik", "4. letnik"],
        predmeti: ["Slovenščina", "Matematika", "Angleščina", "Tehnično risanje", "Tehnologija materialov", "Mehanika", "Osnove strojništva", "Konstruiranje", "CNC tehnologije", "Elektrotehnika", "Šport"]
      },
      "Elektrotehnika (SSI/PTI)": {
        letniki: ["1. letnik", "2. letnik", "3. letnik", "4. letnik"],
        predmeti: ["Slovenščina", "Matematika", "Angleščina", "Osnove elektrotehnike", "Elektronika", "Avtomatizacija", "Digitalna tehnika", "Računalništvo", "Šport"]
      },
      "Ekonomska šola": {
        letniki: ["1. letnik", "2. letnik", "3. letnik", "4. letnik"],
        predmeti: ["Slovenščina", "Matematika", "Angleščina", "Nemščina", "Ekonomija", "Poslovna informatika", "Računovodstvo", "Podjetništvo", "Pravo", "Šport"]
      },
      "Zdravstvena šola": {
        letniki: ["1. letnik", "2. letnik", "3. letnik", "4. letnik"],
        predmeti: ["Slovenščina", "Matematika", "Angleščina", "Biologija", "Kemija", "Anatomija in fiziologija", "Zdravstvena nega", "Mikrobiologija", "Šport"]
      },
      "Gradbena šola": {
        letniki: ["1. letnik", "2. letnik", "3. letnik", "4. letnik"],
        predmeti: ["Slovenščina", "Matematika", "Angleščina", "Gradbena fizika", "Statika", "Tehnično risanje", "Materiali v gradbeništvu", "Šport"]
      },
      "Informacijske tehnologije (SSI)": {
        letniki: ["1. letnik", "2. letnik", "3. letnik", "4. letnik"],
        predmeti: ["Slovenščina", "Matematika", "Angleščina", "Programiranje", "Podatkovne baze", "Računalniška omrežja", "Spletne tehnologije", "Šport"]
      },
      "Poklicna šola (splošno - 2/3 letna)": {
        letniki: ["1. letnik", "2. letnik", "3. letnik"],
        predmeti: ["Slovenščina", "Matematika", "Angleščina", "Naravoslovje", "Družboslovje", "Šport"]
      }
    }
  },

  "Matura": {
    kind: "matura",
    tipi: {
      "Splošna matura": ["Slovenščina", "Matematika", "Angleščina", "Nemščina", "Francoščina", "Španščina", "Zgodovina", "Geografija", "Biologija", "Kemija", "Fizika", "Psihologija", "Sociologija", "Filozofija", "Informatika", "Likovna teorija", "Glasba"],
      "Poklicna matura": ["Slovenščina", "Matematika ali tuji jezik", "Strokovni predmet po programu (npr. Strojništvo, Ekonomija, Elektrotehnika, Zdravstvena nega)", "Izdelek oz. storitev z zagovorom"]
    }
  },

  "Višja in visokošolska raven": {
    kind: "academic",
    področja: {
      "Matematika in naravoslovje": ["Matematika (analiza, algebra, verjetnost)", "Fizika", "Kemija", "Biologija", "Biokemija", "Astronomija", "Geologija"],
      "Tehnika, strojništvo in elektro": ["Strojništvo", "Elektrotehnika", "Mehatronika", "Računalništvo in informatika", "Gradbeništvo", "Arhitektura", "Kemijska tehnologija", "Prometna tehnika"],
      "Medicina in zdravstvo": ["Medicina (predklinika in klinika)", "Zobozdravstvo", "Farmacija", "Zdravstvena nega", "Fizioterapija", "Veterina"],
      "Družboslovje, pravo in ekonomija": ["Ekonomija", "Pravo", "Politologija", "Sociologija", "Psihologija", "Novinarstvo in komunikologija", "Mednarodni odnosi"],
      "Humanistika in jeziki": ["Slovenistika", "Anglistika", "Germanistika", "Romanistika", "Zgodovina", "Filozofija", "Umetnostna zgodovina", "Arheologija"],
      "Kmetijstvo, gozdarstvo in okolje": ["Agronomija", "Gozdarstvo", "Živilstvo in prehrana", "Okoljske vede"]
    }
  }
};

// Nivoji poglobljenosti znotraj vsakega predmeta - AI učitelj jih uporabi kot izhodišče,
// nato pa se prilagaja glede na učenčeve odgovore.
const TEZAVNOSTNE_STOPNJE = [
  "Temelji (uvod v snov)",
  "Standardno (raven razreda/letnika)",
  "Napredno (razširjeno znanje, tekmovalna raven)",
  "Vrhunsko/akademsko (poglobljena, univerzitetna raven)"
];

const NACINI_DELA = [
  { id: "razlaga", naziv: "Razlagaj snov", opis: "AI sistematično razloži temo korak za korakom." },
  { id: "vaje", naziv: "Daj mi nalogo", opis: "AI ustvari nalogo primerne težavnosti in te vodi do rešitve." },
  { id: "preverjanje", naziv: "Preveri moje znanje", opis: "AI te sprašuje in sproti ocenjuje odgovore." },
  { id: "matura", naziv: "Priprava na maturo", opis: "Popoln mentor za maturo: struktura izpita, vaje, strategije, vzorčne rešitve." },
  { id: "prosto", naziv: "Prosti pogovor", opis: "Vprašaj karkoli o predmetu, brez vnaprej določenega poteka." }
];
