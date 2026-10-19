# Orte: Ortssuche und „Ort vorschlagen“ (`quadrate.html`)

Erklärung für die Präsentation der Endversion, Version 5 (`final-v5/`). Alle Fundstellen beziehen sich auf `final-v5/`, geprüft am 14.10.2026.

**Vorschlag für die Präsentation:** Matti Katila (Inhalte und Anforderungen), zusammen mit [daten.md](daten.md) (woher Orte und Texte kommen). Das Formular erklärt [vorschlagen.md](vorschlagen.md).

## Was die Seite zeigt und warum

Die Seite heißt im Menü **„Orte“**. Datei und Adresse bleiben `quadrate.html`, damit alle Links weiter funktionieren.

1. **Oben** steht ein mintgrünes Band mit Überschrift, Einleitung und dem Knopf **„Ort vorschlagen“**. Der Knopf springt nach unten zum Formular.
2. **Orte suchen:** Suche nach Name, Art, Adresse, Quadrat oder Merkmal („Döner“, „Kino“, „vegan“). Dazu kommen Kategorie, Quadrat (auf Wunsch mit den umliegenden Quadraten), „nur jetzt geöffnet“ und „In meiner Nähe“. Jeder Treffer zeigt Öffnungszeiten, Merkmale, einen Streifen in der Kategorie-Farbe, „Merken“, „Route“ und den Link zum Quadrat auf der Karte.
3. **Ein Ort fehlt? Schlag ihn vor:** Hier stehen das Formular und die OpenStreetMap-Karte, die vorher auf der eigenen Seite `vorschlagen.html` lagen. So geht das Vorschlagen nicht mehr in der Fußzeile unter.

**Was weggefallen ist (14.10.2026):** Die Tabelle „Alle Quadrate in Zahlen“ mit allen 146 Quadraten, dazu ihre Sprungliste, das Sortieren und `js/verzeichnis.js`. Die Seite war damit sehr lang, und Besucher suchen Orte, nicht Zahlen.
- Die Tabelle galt als Pflicht-Element der Team-Übung 2.
- Eine Tabelle hat die Website weiterhin: den **Monatskalender auf „Events“** (`<table>` mit `<caption>` und `<th scope="col">`, siehe [events.md](events.md)). Ob das für die Pflicht reicht, schätzt das Team selbst ein.
- In `final-v3/` und `final-v4/` steht die alte Tabelle noch.

## So führst du die Seite vor

1. Menü **Orte**, ins Suchfeld **döner** tippen. Dann Quadrat **O7** wählen (2 Treffer) und „auch umliegende Quadrate“ ankreuzen: Die Statuszeile nennt die Nachbarn N6, N7, O6, P6, P7.
2. Das Suchfeld leeren, **vegan** tippen und **In meiner Nähe** drücken: Die nächsten veganen Orte stehen oben, mit Entfernung.
3. Bei einem Treffer **Merken** drücken: Die Zahl am Reiter „Merkliste“ steigt.
4. Oben auf **Ort vorschlagen** klicken: Die Seite springt zum Formular. Weiter in [vorschlagen.md](vorschlagen.md).

## Aufbau des Quelltexts

| Datei | Aufgabe |
|---|---|
| `quadrate.html` | Gerüst: Band oben, Ortssuche, Abschnitt „Ein Ort fehlt?“ mit Formular und Karte |
| `js/ortssuche.js` | die Ortssuche (V2) |
| `js/formular.js` | Prüfen und Speichern des Formulars (V2), siehe [vorschlagen.md](vorschlagen.md) |
| `css/verzeichnis.css` | Ortssuche und der Abschnitt „Ein Ort fehlt?“ |
| `css/formular.css` | das Formular selbst |
| `js/data/orte.js`, `js/data/merkmale.js`, `js/data/karte-daten.js` | die Orte, ihre Merkmale und Lage, die Rechtecke der Quadrate (für die Nachbarn) |

### `quadrate.html` von oben nach unten

1. Kopfkommentar `quadrate.html:3`: Die Seite wurde früher von `tools/export_verzeichnis.py` erzeugt. Seit dem 14.10.2026 ist sie von Hand gemacht und darf nicht wieder erzeugt werden.
2. `<head>` mit drei Stylesheets `quadrate.html:29`. Navigation mit `aria-current="page"` bei „Orte“ `quadrate.html:48`.
3. Band mit `<h1>` `quadrate.html:64` und dem Sprung-Link `href="#vorschlagen"` `quadrate.html:66`. Das ist ein Anker auf dieselbe Seite (Vorlesung 3).
4. Die Ortssuche `quadrate.html:69`: Suchfeld `quadrate.html:76`, zwei Auswahllisten `quadrate.html:80`, `quadrate.html:91`, zwei Häkchen `quadrate.html:98`, `quadrate.html:101`, der Knopf „In meiner Nähe“ `quadrate.html:106`, die Statuszeile `quadrate.html:110` und die leere Trefferliste. Ohne JavaScript bleibt der Bereich versteckt (`hidden`).
5. Der Abschnitt „Ein Ort fehlt?“ `quadrate.html:116` mit Formular, `<iframe>` und Inline-Stil, siehe [vorschlagen.md](vorschlagen.md).
6. Fußzeile und Skripte, die Ortssuche `quadrate.html:401`.

### „Orte suchen“ mit `js/ortssuche.js`

1. Beim Laden baut `init()` `js/ortssuche.js:347` für jeden Ort **einmal** einen Suchtext `js/ortssuche.js:369`. Er besteht aus Name, deutscher Art, Adresse, Quadrat und den Merkmalen `js/ortssuche.js:371`. Die deutsche Art („cinema“ → „Kino“) kommt aus `Steckbrief.typeName()` `js/steckbrief.js:333`.
2. `simplify()` `js/ortssuche.js:122` macht alles klein und entfernt Akzente. So findet „cafe“ auch „Café“.
3. `fillBlockSelect()` `js/ortssuche.js:336` füllt die Liste „Quadrat“ mit `createElement("option")` `js/ortssuche.js:339`, damit nicht 146 Zeilen von Hand im HTML stehen.
4. Bei jedem Tastendruck (Ereignis `input` `js/ortssuche.js:386`) oder einer Änderung an Liste oder Häkchen (`change`) läuft `search()` `js/ortssuche.js:206`. Sie geht alle Orte in einer Schleife durch `js/ortssuche.js:232` und lässt die weg, die nicht passen:
   - Kategorie,
   - Quadrat `js/ortssuche.js:237`,
   - Suchwort, geprüft mit `indexOf()` `js/ortssuche.js:240`,
   - „nur jetzt geöffnet“.
5. Danach wird sortiert: Mit „In meiner Nähe“ nach Entfernung `js/ortssuche.js:250`. Sonst stehen erst die Orte im gewählten Quadrat, dann die der Nachbarn `js/ortssuche.js:265`, jeweils nach Namen (`localeCompare` `js/ortssuche.js:271`). Gezeigt werden höchstens 50 Treffer `js/ortssuche.js:275`.
6. `hitMarkup()` `js/ortssuche.js:142` baut jeden Treffer: Merkmale `js/ortssuche.js:155`, Entfernung `js/ortssuche.js:166`, Streifen in der Kategorie-Farbe (Klasse `place--cat`), „Merken“ `js/ortssuche.js:183`. Auf die ganze Liste hört nur **ein** Zuhörer `js/ortssuche.js:359` (Ereignis-Delegation), weil die Liste bei jedem Buchstaben neu gezeichnet wird.
7. „In meiner Nähe“: `onNearClick()` `js/ortssuche.js:310` holt den Standort und merkt ihn sich nur in einer Variablen. Wie Merkmale und Lage entstehen, steht in [index.md](index.md).

**Die umliegenden Quadrate:** In `js/data/karte-daten.js` hat jedes Quadrat ein Rechteck auf der Karte.
- `rectOf()` `js/ortssuche.js:64` fasst die Teile eines Quadrats zu einem Rechteck zusammen.
- `gapBetween()` `js/ortssuche.js:88` misst den Abstand zweier Rechtecke, links/rechts `js/ortssuche.js:89` und oben/unten `js/ortssuche.js:90`. Der größere Wert zählt.
- `neighborsOf()` `js/ortssuche.js:95` nimmt alle Quadrate, die höchstens `NEIGHBOR_GAP = 50` Pixel entfernt sind `js/ortssuche.js:36` (etwa 54 m).
- Ohne gewähltes Quadrat ist das Häkchen ausgegraut: `disabled` `js/ortssuche.js:214`, im CSS mit `:has()` `css/verzeichnis.css:116`.

## Begriffe aus dem Quelltext

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Anker auf derselben Seite | `quadrate.html:66` | `href="#vorschlagen"` springt zum Element mit `id="vorschlagen"`. | VL3 S.2 |
| `scroll-margin-top` | `css/verzeichnis.css:191` | Der Sprung hält unter der festen Kopfzeile an, statt dahinter. | – |
| `<input type="search">` | `quadrate.html:76` | Suchfeld; der Browser zeigt oft ein „×“ zum Leeren. | VL3 S.2 |
| `<select>` und `<option>` | `quadrate.html:80`, `quadrate.html:91` | Auswahllisten für Kategorie und Quadrat. | VL3 S.2 |
| `<input type="checkbox">`, `disabled` | `quadrate.html:98`, `quadrate.html:101` | Häkchen „auch umliegende Quadrate“ (erst ausgegraut) und „nur jetzt geöffnet“. | – |
| `role="status"` | `quadrate.html:110` | Screenreader lesen die Zahl der Treffer vor, wenn sie sich ändert. | – |
| Ereignis `input` und `change` | `js/ortssuche.js:386` | `input` bei jedem Buchstaben, `change` bei Listen und Häkchen. | JS |
| Schleife `for` | `js/ortssuche.js:232` | Geht alle 995 Orte der Reihe nach durch. | JS |
| Schleife `for … in` | `js/ortssuche.js:97` | Geht alle Schlüssel (Quadrat-Codes) eines Objekts durch. | JS |
| `Math.max()`, `Math.min()` | `js/ortssuche.js:89` | Größter und kleinster Wert, hier für den Abstand zweier Rechtecke. | JS |
| `indexOf()` | `js/ortssuche.js:240` | Sucht ein Wort in einem Text; `-1` heißt „nicht gefunden“. | JS |
| `sort()` mit `localeCompare()` | `js/ortssuche.js:271` | Sortiert nach deutschem Alphabet (Ä bei A). | JS |
| `document.createElement()` | `js/ortssuche.js:339` | Baut ein neues HTML-Element (hier `<option>`). | JS |
| `normalize()` und `\p{Diacritic}` | `js/ortssuche.js:123` | Trennt Buchstabe und Akzent und löscht dann den Akzent. | – |
| Flexbox mit `flex-wrap` | `css/verzeichnis.css:75` | Felder nebeneinander, auf dem Handy untereinander. | – |
| Pseudoklasse `:has()` | `css/verzeichnis.css:116` | Wählt das Label, dessen Häkchen `disabled` ist, und färbt es grau. | – |
| Pseudoklasse `:empty` | `css/verzeichnis.css:168` | Leere Liste ohne Linie oben. | – |
| `.place__tag` | `css/style.css:2015` | Kleine graue „Pillen“ für die Merkmale. | – |

## Fragen, die der Dozent stellen könnte

1. **Wo ist die Tabelle der Quadrate geblieben?** Wir haben sie am 14.10.2026 entfernt, weil die Seite zu lang war. Eine Tabelle zeigt jetzt der Monatskalender auf „Events“ (`<table>`, `<caption>`, `<th scope="col">`). In älteren Fassungen (`final-v3/`, `final-v4/`) steht die Quadrate-Tabelle noch.
2. **Wie funktioniert der Knopf „Ort vorschlagen“ oben?** Das ist ein Anker-Link `#vorschlagen` auf dieselbe Seite. Der Abschnitt hat `id="vorschlagen"`. `scroll-margin-top` sorgt dafür, dass die feste Kopfzeile die Überschrift nicht verdeckt.
3. **Warum sucht ihr in einer Datendatei und nicht in der Seite?** Die 995 Orte stehen in `js/data/orte.js`. Die Suche baut daraus beim Start einmal einen Suchtext je Ort und vergleicht dann nur noch Texte. Das ist schnell genug für jeden Tastendruck.
4. **Wie findet ihr die umliegenden Quadrate?** Aus den Rechtecken der Karte: Liegen zwei Rechtecke höchstens 50 Pixel auseinander, also etwa eine Straßenbreite, sind es Nachbarn.
