/*
 * events.js - events in the Quadrate (window.EVENTS) and facts about the list (window.EVENTS_META).  [V2]
 * Added 2026-10-13. Read by js/events.js (window.Events), which works out the dates.
 *
 * IMPORTANT: all entries are made-up EXAMPLES for the presentation, not real dates. There is no public
 * event feed of the city that we may use (no server, no open data with a licence), so the idea is that
 * the team enters events by hand, and organisers can pay to be shown as a highlighted "Anzeige".
 * The pages say clearly that these are examples. Replace them with real, checked entries before the
 * site is ever used for real, and never copy description texts from other websites (copyright):
 * write a short text of your own and link the original page in "link".
 *
 * The values are JSON (keys in quotes, as JavaScript also allows). Fields:
 *   id        unique text
 *   titel     title shown on the page
 *   art       musik | kultur | markt | party | familie | essen | shoppen  (German names in js/events.js)
 *   quadrat   block code where it takes place, e.g. "G1"
 *   ort       name of the place inside the Quadrat
 *   text      one or two sentences of our own
 *   when, one of three forms:
 *     "datum": "2026-10-24"                       one day
 *     "von": "2026-11-23", "bis": "2026-12-23"    every day in this range (both days included)
 *     "wochentage": [3]                           every week on these days, 0 = Monday ... 6 = Sunday
 *   beginn, ende  "HH:MM"; an end like "01:00" that is earlier than the start means after midnight
 *   anzeige   true = paid highlighted entry: always labelled "Anzeige" (German law requires ads to be marked)
 *   anbieter  who placed the ad (only with anzeige)
 *   link      address of the organiser's page, or null
 */
window.EVENTS_META = {
    "stand": "2026-10-13",
    "beispiele": true,
    "hinweis": "Alle Einträge sind erfundene Beispiele für die Vorführung, keine echten Termine."
};

window.EVENTS = [
    { "id": "e01", "titel": "Feierabend-Jazz (Beispiel)", "art": "musik", "quadrat": "O1", "ort": "Paradeplatz",
      "text": "Kleine Jazz-Besetzung zum Feierabend, Eintritt frei.",
      "wochentage": [3], "beginn": "18:30", "ende": "21:00", "anzeige": false, "link": null },

    { "id": "e02", "titel": "Samstagsmarkt mit Frühstück (Beispiel)", "art": "markt", "quadrat": "G1", "ort": "Marktplatz",
      "text": "Obst, Gemüse und Blumen aus der Region, dazu Kaffee und Brezeln an langen Tischen.",
      "wochentage": [5], "beginn": "08:00", "ende": "13:00", "anzeige": false, "link": null },

    { "id": "e03", "titel": "Vorlesestunde für Kinder (Beispiel)", "art": "familie", "quadrat": "N2", "ort": "Dalbergplatz",
      "text": "Bilderbücher zum Zuhören für Kinder von 4 bis 8 Jahren.",
      "wochentage": [2], "beginn": "15:00", "ende": "16:00", "anzeige": false, "link": null },

    { "id": "e04", "titel": "Kneipenquiz (Beispiel)", "art": "party", "quadrat": "T4", "ort": "Quartiersplatz",
      "text": "Sechs Runden Allgemeinwissen, Teams bis vier Personen.",
      "wochentage": [1], "beginn": "20:00", "ende": "22:30", "anzeige": false, "link": null },

    { "id": "e05", "titel": "Weinprobe am Freitag (Beispiel)", "art": "essen", "quadrat": "Q2", "ort": "Weinhandlung Muster",
      "text": "Fünf Weine aus der Pfalz mit kleinen Häppchen, Anmeldung vor Ort.",
      "wochentage": [4], "beginn": "18:00", "ende": "21:00", "anzeige": true, "anbieter": "Weinhandlung Muster (Beispiel)", "link": null },

    { "id": "e06", "titel": "Sonntagsbrunch (Beispiel)", "art": "essen", "quadrat": "N3", "ort": "Café Muster",
      "text": "Brunch-Buffet mit Kaffee satt.",
      "wochentage": [6], "beginn": "10:00", "ende": "14:00", "anzeige": true, "anbieter": "Café Muster (Beispiel)", "link": null },

    { "id": "e07", "titel": "Kurzfilmnacht (Beispiel)", "art": "kultur", "quadrat": "K1", "ort": "Saal im Quadrat K1",
      "text": "Zehn Kurzfilme aus der Region, danach Gespräch mit den Filmemacherinnen.",
      "datum": "2026-10-24", "beginn": "20:00", "ende": "23:30", "anzeige": false, "link": null },

    { "id": "e08", "titel": "Lange Einkaufsnacht auf den Planken (Beispiel)", "art": "shoppen", "quadrat": "P7", "ort": "Planken",
      "text": "Viele Geschäfte haben bis 23 Uhr offen, mit Musik auf der Straße.",
      "datum": "2026-10-30", "beginn": "18:00", "ende": "23:00", "anzeige": true, "anbieter": "Werbegemeinschaft Muster (Beispiel)", "link": null },

    { "id": "e09", "titel": "Herbstflohmarkt (Beispiel)", "art": "markt", "quadrat": "U2", "ort": "Herschelplatz",
      "text": "Trödel, Bücher und Kinderkleidung von privat.",
      "datum": "2026-11-07", "beginn": "10:00", "ende": "16:00", "anzeige": false, "link": null },

    { "id": "e10", "titel": "Laternenlauf (Beispiel)", "art": "familie", "quadrat": "G1", "ort": "Marktplatz",
      "text": "Gemeinsamer Laternenlauf durch die Quadrate, Treffpunkt am Brunnen.",
      "datum": "2026-11-11", "beginn": "17:30", "ende": "18:30", "anzeige": false, "link": null },

    { "id": "e11", "titel": "Poetry Slam (Beispiel)", "art": "kultur", "quadrat": "N7", "ort": "Bühne im Quadrat N7",
      "text": "Acht Slammerinnen und Slammer, das Publikum entscheidet.",
      "datum": "2026-11-12", "beginn": "20:00", "ende": "22:30", "anzeige": false, "link": null },

    { "id": "e12", "titel": "Clubnacht (Beispiel)", "art": "party", "quadrat": "H6", "ort": "Swanseaplatz",
      "text": "House und Disco bis in den Morgen.",
      "datum": "2026-11-21", "beginn": "23:00", "ende": "04:00", "anzeige": false, "link": null },

    { "id": "e13", "titel": "Wintermarkt (Beispiel)", "art": "markt", "quadrat": "O1", "ort": "Paradeplatz",
      "text": "Buden mit Kunsthandwerk, Glühwein und Waffeln.",
      "von": "2026-11-23", "bis": "2026-12-23", "beginn": "11:00", "ende": "21:00", "anzeige": false, "link": null }
];
