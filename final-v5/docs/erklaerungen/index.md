# Karte: die Startseite `index.html`

Erklärung für die Präsentation der Endversion, Version 5 (`final-v5/`, Kopie von `final-v3/`, aufbauend auf `final-v2/`). Zeilennummern erzeugt am 2026-10-07 14:25, geprüft und korrigiert am 2026-10-13 aus den aktuellen Dateien in `final-v3/`. Neu gegenüber dem Pivot: Tageszeit-Stimmungen der Karte (Sonnenaufgang, Tag, Sonnenuntergang, Nacht) und ein Apple-inspirierter Seitenstil mit Systemschrift. Die Kartendateien (`js/karte.js`, `css/karte.css`, `js/data/karte-daten.js`) stehen in [karte-css3d.md](karte-css3d.md).

**Vorschlag für die Präsentation:** Niko Eibach (Programmierung) führt die Karte vor und erklärt den JavaScript-Teil; den CSS-Teil mit `css/style.css` erklärt Nikita Ermotschenko (Design und Kreativität). Die ganze Aufteilung für alle fünf steht in [README.md](README.md) unter „Vorschlag: wer präsentiert was“.

## Was die Seite zeigt und warum

Die Startseite beantwortet eine Frage: **Was hat in welchem Quadrat zu einer bestimmten Zeit geöffnet?**

- Oben steht die **Filterleiste**: Wochentag, Uhrzeit (Schieberegler), Kategorie (Essen, Trinken, Kultur, Shoppen) und die Liste „Quadrat wählen“.
- Darunter die **3D-Karte** der 146 Quadrate. Jedes Quadrat ist so kräftig gefärbt, wie viele passende Orte zur gewählten Zeit geöffnet haben. Die **Legende** nennt die Stufen (1, 2–3, 4–6, 7+), ein Satz darunter fasst das Ergebnis zusammen.
- Ein Klick auf ein Quadrat lässt das Gebäude wachsen und leuchten. Darunter erscheint der **Steckbrief**: Text, Foto, Zahl der Orte und alle Orte mit ihren Öffnungszeiten.

Warum so: Die Karte ist die Hauptattraktion der Website und zeigt, was JavaScript kann (Version V2). Ohne JavaScript (Version V1) zeigt dieselbe Seite ein festes Bild der Karte und einen Link zur Seite Orte. Mit einem Konto kommen der Knopf „Merken“ und Stecknadeln auf der Karte dazu; gespeichert wird im Browser (siehe [konto.md](konto.md)).

## So führst du die Seite vor

1. Seite öffnen. Der Filter steht auf „jetzt“, die Karte zeigt die Stimmung der echten Uhrzeit. Haben gerade kaum Restaurants offen, aber mehr Bars (nachts), startet die Karte mit Trinken und sagt das unter der Legende `js/filter.js:426`.
2. Kategorie „Trinken“, Samstag, Regler auf 22:00: Farben, Legende und Zusammenfassung ändern sich sofort.
3. Ein Quadrat anklicken, zum Beispiel O3: Das Gebäude wächst, der Steckbrief erscheint unten, in der Adresszeile steht `index.html#O3`. Die Zurück-Taste des Browsers hebt die Wahl wieder auf.
4. Mit der Tastatur: Tab bis zur Karte, Eingabetaste wählt ein Quadrat, der Fokus springt in den Steckbrief; Escape schließt ihn.
5. Optional: JavaScript im Browser ausschalten und neu laden. Jetzt sieht man das Standbild und den Hinweis aus `<noscript>` (Version V1).

## Aufbau des Quelltexts

### Beteiligte Dateien

| Datei | Aufgabe | Version |
|---|---|---|
| `index.html` | Gerüst der Seite: Kopf, Filter, Kartenrahmen, Steckbrief, Fußzeile, Skripte | V1, V2 |
| `css/style.css` | gemeinsames Design aller Seiten: Farben, Schriften, Rahmen, Knöpfe, Chips, Regler, Steckbrief, Legende | V1 |
| `css/index.css` | nur für diese Seite: Knopf „Jetzt“, Liste „Quadrat wählen“, Sprunglink, Zusammenfassung, Teile des Steckbriefs | V1, V2 |
| `css/karte.css` | Stile der Karte, in jeder Variante anders | V2 |
| `js/data/orte.js`, `js/data/quadrate.js`, `js/data/fotos.js` | Daten: Orte mit Öffnungszeiten, Texte zu den Quadraten, Fotos (siehe [daten.md](daten.md)) | V2 |
| `js/data/karte-daten.js`, `js/karte.js` | Geometrie und Programm der Karte, stellt `window.Karte` bereit | V2 |
| `js/oeffnungszeiten.js` | rechnet aus, ob ein Ort zu einer Zeit geöffnet hat | V2 |
| `js/filter.js` | Zustand des Filters, Zählen der geöffneten Orte, Farben, Legende, Zusammenfassung | V2 |
| `js/konto.js` | Konto und gemerkte Orte im localStorage, stellt `window.Konto` bereit | V2 |
| `js/steckbrief.js` | baut den Steckbrief eines Quadrats, mit „Merken“ für Angemeldete | V2 |
| `js/app.js` | verbindet alle Teile und liest die Adresse (`index.html#G1`) | V2 |

### `index.html` von oben nach unten

1. Kopfkommentar `index.html:3`: wozu die Datei da ist und was zu V1 und V2 gehört.
2. `<head>` `index.html:23`: Zeichenkodierung, Viewport, Titel, Beschreibung, Favicon und drei Stylesheets in fester Reihenfolge: erst `style.css`, dann `karte.css`, dann `index.css` `index.html:32`. Bei gleich starken Regeln gewinnt die spätere.
3. Sprunglink „Zum Inhalt springen“ `index.html:32`, dann Kopfbereich mit Logo und Navigation `index.html:36`. Dieser Rahmen ist auf allen Seiten gleich.
4. Hauptbereich `<main id="inhalt">` `index.html:64` mit Überschrift und Einleitung.
5. Filterleiste `index.html:70`: Wochentage als sieben Optionsfelder `index.html:75`, Uhrzeit als Schieberegler `index.html:102` mit Anzeige und Knopf „Jetzt“, Kategorien als Optionsfelder, die wie Chips aussehen `index.html:116`, und die Liste „Quadrat wählen“ `index.html:126`. Die Leiste trägt `hidden`, denn ohne JavaScript nützt sie nichts.
6. Kartenrahmen `index.html:154`: Im `<div id="karte">` `index.html:166` steht zuerst das Standbild `index.html:167`; JavaScript ersetzt es durch die Karte. Darunter Legende `index.html:177`, Zusammenfassung `index.html:190` und Datenquelle `index.html:195`.
7. `<noscript>` `index.html:248`: Hinweis, der nur ohne JavaScript erscheint.
8. Steckbrief `index.html:187`: ein leerer Bereich, den `js/steckbrief.js` füllt.
9. Unsichtbarer Ansagebereich für Screenreader `index.html:190`.
10. Fußzeile mit dem Hinweis auf OpenStreetMap `index.html:193`.
11. Skripte am Ende von `<body>` `index.html:36` bis `index.html:268`: zuerst die Daten, dann die Karte, dann Öffnungszeiten, Filter und Steckbrief, zuletzt `app.js`, das alles verbindet. Die Reihenfolge ist wichtig, weil jedes Skript die vorher geladenen benutzt.

### Was beim Laden passiert

`js/app.js` läuft als letztes Skript und ruft `init()` auf `js/app.js:234`:

1. Die Klasse `map-fallback` wird entfernt und `Karte.init()` baut die Karte in `#karte` `js/app.js:234`.
2. `Steckbrief.init()` `js/app.js:241` zeigt den leeren Steckbrief, `Filter.init()` `js/app.js:242` stellt heute und jetzt ein und färbt die Karte zum ersten Mal `js/filter.js:431`.
3. `fillSelect()` `js/app.js:219` füllt die Liste mit allen 146 Quadraten.
4. Alle Teile mit `hidden`, die JavaScript brauchen, werden sichtbar `js/app.js:267`.
5. Die Ereignisse werden angemeldet: Auswahl in der Liste `js/app.js:267`, Änderung der Adresse `js/app.js:274`, Escape-Taste `js/app.js:282`.
6. Steht schon ein Quadrat in der Adresse (`index.html#G1`), wird es sofort geöffnet `js/app.js:294`.

### Was bei einem Klick auf ein Quadrat passiert

1. Die Karte meldet den Code an `app.js` (Rückruffunktion `onSelect`) `js/app.js:239`.
2. `chooseBlock()` schreibt den Code in die Adresse: `window.location.hash = code` `js/app.js:174`.
3. Der Browser löst das Ereignis `hashchange` aus; `onHashChange()` `js/app.js:179` liest den Code `js/app.js:66`.
4. `openBlock()` `js/app.js:126` lässt das Gebäude wachsen (`Karte.waehlen`), füllt den Steckbrief (`Steckbrief.show`), stellt die Liste um und sagt Screenreadern „Quadrat O3 gewählt“.

Warum der Umweg über die Adresse: So funktionieren Links wie `index.html#G1` aus dem Verzeichnis und von „Meine Orte“, und die Zurück-Taste führt zum vorigen Quadrat.

### Was bei einer Änderung am Filter passiert

1. `bindEvents()` `js/filter.js:334` hört auf `change` bei den Optionsfeldern und auf `input` beim Schieberegler (schon während er sich bewegt) `js/filter.js:342`.
2. Der neue Wert kommt in das Objekt `state` `js/filter.js:56`, dann rechnet `apply()` alles neu `js/filter.js:226`.
3. `countOpen()` `js/filter.js:81` geht in einer Schleife durch alle 995 Orte in `window.ORTE` und zählt je Quadrat die Orte der Kategorie, die gerade geöffnet haben (`Oeffnungszeiten.isOpen`).
4. `levelOf()` `js/filter.js:95` macht aus der Zahl eine Stufe (1 → Stufe 0, 2–3 → 1, 4–6 → 2, 7+ → 3), `colourOf()` `js/filter.js:112` holt die Farbe aus `window.KATEGORIEN` `js/filter.js:27`.
5. `Karte.faerben(colours, texts)` `js/filter.js:235` färbt die Gebäude; die Texte („9 geöffnet“) kommen in den Namen, den Screenreader vorlesen.
6. Zeitanzeige, Legende und Zusammenfassung werden neu geschrieben, dann ruft `onChange` den Steckbrief auf `js/app.js:262`, damit auch seine Öffnungszeiten zum Filter passen.

### Die Tageszeit der Karte

Die Karte zeigt nicht nur, was geöffnet hat, sondern auch, wie die Stadt zur gewählten Uhrzeit aussieht. Seit dem 14.10.2026 (final-v5) gibt es dabei **keine Stufen** mehr: Die Stadt wird Minute für Minute heller oder dunkler.

1. Bei jeder Änderung am Filter ruft `apply()` `Karte.tageszeit(minuten)` auf `js/filter.js:239`.
2. Was dort passiert, steht in [karte-css3d.md](karte-css3d.md) unter „Tageszeit-Stimmungen“.

### Der Steckbrief

`render()` `js/steckbrief.js:495` setzt den Steckbrief als HTML-Text zusammen und schreibt ihn mit `innerHTML` in die Seite `js/steckbrief.js:504`:

- `headMarkup()` `js/steckbrief.js:182`: Kachel mit dem Code, Titel, Kurzbeschreibung, Knopf „Auswahl aufheben“.
- `aboutMarkup()` `js/steckbrief.js:288`: Text, Quelle, Foto mit Bildnachweis `js/steckbrief.js:209` und die Zahl der Orte je Kategorie.
- `placesMarkup()` `js/steckbrief.js:416`: Die gewählte Kategorie ist offen, die anderen sind in `<details>` eingeklappt `js/steckbrief.js:448`. Jeder Ort bekommt ein Schild „geöffnet“, „geschlossen“ oder „unbekannt“ `js/steckbrief.js:129`.
- Die Namen der Orte kommen aus OpenStreetMap. Deshalb laufen sie vorher durch `escapeHtml()` `js/steckbrief.js:93`, damit kein fremdes HTML in die Seite gelangt.

### Die Öffnungszeiten

Jeder Ort hat im Feld `zeiten` sieben Listen (Montag bis Sonntag) mit Zeitspannen in Minuten seit Mitternacht: `[660, 1140]` heißt 11:00 bis 19:00. Ein Ende über 1440 geht über Mitternacht hinaus (`[1200, 1560]` = 20:00 bis 02:00). `isOpen()` `js/oeffnungszeiten.js:82` prüft die Spannen des Tages und die Spannen des Vortags, die nach Mitternacht weiterlaufen `js/oeffnungszeiten.js:66`. Ist `zeiten` gleich `null`, sind die Zeiten unbekannt, und der Ort zählt nicht mit.

### „Events hier“ im Steckbrief (neu am 13.10.2026)

**Events hier:** Finden in einem Quadrat in den nächsten 30 Tagen Events statt (`js/data/events.js`), stehen bis zu 3 davon im Steckbrief unter den Zahlen der Orte. `eventsMarkup()` `js/steckbrief.js:259` nimmt die Termine von `Events.between()`, lässt vergangene weg und zeigt jedes Event nur einmal `js/steckbrief.js:271`. Bezahlte Einträge tragen „Anzeige“. Mehr in [events.md](events.md).

### „Schließt bald“ und der Link „Route“ (neu am 13.10.2026)

**Was man sieht:** Hat ein Ort zur gewählten Zeit offen, schließt aber in höchstens einer Stunde, steht statt „geöffnet“ ein gelbes Schild „schließt bald“ und daneben zum Beispiel „schließt um 20:00 (in 30 Min.)“. Unter jedem Ort steht ein Link „Route“. Er öffnet Google Maps in einem neuen Tab, mit einer Fußweg-Route vom eigenen Standort zum Ort.

**Schließt bald:**
- `minutesUntilClose()` `js/oeffnungszeiten.js:116` rechnet aus, wie viele Minuten der Ort noch offen hat. Sie sucht die Zeitspanne, in der die gewählte Uhrzeit liegt, und rechnet „Ende minus jetzt“. Ist der Ort zu oder sind die Zeiten unbekannt, gibt sie `null` zurück.
- Sonderfall Mitternacht: Endet eine Spanne um 24:00 und geht am nächsten Tag um 00:00 weiter (zum Beispiel ein Ort, der rund um die Uhr offen ist), zählt sie als eine Spanne. Sonst würde dort jeden Abend „schließt bald“ stehen.
- `badgeMarkup()` `js/steckbrief.js:352` vergleicht die Minuten mit der Grenze `CLOSING_SOON_MINUTES = 60` `js/steckbrief.js:75` und wählt das Schild.
- CSS: `.badge--soon` `css/index.css:344` nimmt die Warnfarben aus `style.css`. Der Punkt davor ist halb gefüllt `css/index.css:349` (voll = offen, halb = schließt bald, Ring = zu), damit man den Zustand auch ohne Farben erkennt.
- Wichtig: Gerechnet wird mit der Zeit **aus dem Filter**, nicht mit der echten Uhrzeit. Wer den Regler auf 19:30 stellt, sieht, was um 19:30 bald schließt.

**Route:**
- `routeMarkup()` `js/steckbrief.js:342` baut einen normalen Link `<a href>`. Die Adresse dafür baut `routeUrl()` `js/steckbrief.js:323` (die Ortssuche auf `quadrate.html` benutzt sie mit). Sie beginnt mit `ROUTE_URL` `js/steckbrief.js:79`, das ist die offizielle Link-Form von Google Maps (ohne Schlüssel, ohne Kosten). Der Start bleibt leer, dann nimmt Google Maps den eigenen Standort.
- Ziel ist „Name, Adresse (oder Quadrat), Mannheim“, weil die Daten keine Koordinaten haben. `encodeURIComponent()` `js/steckbrief.js:324` macht daraus eine gültige Adresse (Leerzeichen werden `%20`, Kommas `%2C`).
- `target="_blank"` öffnet einen neuen Tab, und `rel="noopener"` sorgt dafür, dass die neue Seite keinen Zugriff auf unsere Seite bekommt.
- Datenschutz: Weil es nur ein Link ist, bekommt Google erst beim Klick etwas mit. Das steht in `datenschutz.html:186`.

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Funktion mit Rückgabewert | `js/oeffnungszeiten.js:116` | `minutesUntilClose()` gibt eine Zahl oder `null` zurück. | JS |
| Vergleich `<=` | `js/steckbrief.js:355` | Prüft, ob höchstens 60 Minuten übrig sind. | JS |
| Restwert `%` | `js/steckbrief.js:356` | `% 1440` rechnet Uhrzeiten nach Mitternacht wieder in 00:00 bis 23:59 um. | JS |
| `encodeURIComponent()` | `js/steckbrief.js:324` | Macht Text sicher für eine Adresse im Link. | – |
| Link in neuem Tab: `target`, `rel` | `js/steckbrief.js:343` | Öffnet Google Maps in einem neuen Tab; `noopener` schützt unsere Seite. | – |
| Pseudoelement `::before` | `css/index.css:349` | Zeichnet den halb gefüllten Punkt vor dem Schild. | VL5\* |
| `linear-gradient` | `css/index.css:351` | Farbverlauf mit harter Kante bei 50 %: links Farbe, rechts durchsichtig. | – |

### CSS dieser Seite

- Seitenraster: `.map-layout` ist ein Grid mit einer Spalte `css/style.css:633`; Filterleiste, Karte und Steckbrief stehen untereinander.
- Filterleiste: `.filter-bar` ist eine Flexbox mit Umbruch `css/style.css:652`; auf schmalen Bildschirmen rutschen die Gruppen untereinander.
- Kartenrahmen: `#karte` hält mit `aspect-ratio: 3 / 2` das Seitenverhältnis der Karte `css/style.css:709`.
- Steckbrief: ab 56rem Breite zwei Spalten (Text links, Orte rechts) `css/style.css:1567`.
- Bausteine aus `style.css`: Chips `css/style.css:888`, Wochentage `css/style.css:1105`, Schieberegler `css/style.css:945`, Farbfelder der Legende `css/style.css:1785`, Status-Schilder `css/style.css:1695`.
- `css/index.css` ergänzt nur, was es auf dieser Seite zusätzlich gibt, etwa den Sprunglink `css/index.css:78` und die eingeklappten Kategorien `css/index.css:216`.

## Begriffe aus dem Quelltext

Spalte „Kurs“: **VL2 S.3** = Vorlesung 2, Folie 3. **VL5\*** = im Inhaltsverzeichnis von Vorlesung 4 (Folie 2–3) für die nächste CSS-Vorlesung angekündigt. **JS** = Thema der JavaScript-Vorlesung (VL6). **–** = nicht in den Folien.

### HTML

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `<!DOCTYPE html>` | `index.html:1` | Sagt dem Browser, dass die Datei ein HTML5-Dokument ist. | VL2 S.3 |
| HTML-Kommentar `<!-- -->` | `index.html:2` | Text für Menschen, den der Browser nicht anzeigt; bei uns stehen dort Zweck und Version der Datei. | VL2 S.5 |
| `<html lang="de">` | `index.html:22` | Wurzel-Element; `lang="de"` sagt, dass der Text Deutsch ist (wichtig für Vorlesefunktion und Silbentrennung). | – |
| `<head>` und `<body>` | `index.html:36`, `index.html:30` | Der Kopf enthält Angaben über die Seite (nicht sichtbar), der Körper alles Sichtbare. | VL2 S.2 |
| `<meta charset="utf-8">` | `index.html:24` | Legt die Zeichenkodierung fest, damit Umlaute wie „ä“ richtig erscheinen. | VL2 S.3 |
| `<meta name="viewport">` | `index.html:25` | Sagt Handys, dass die Seite so breit wie der Bildschirm ist, statt eine Desktop-Seite zu verkleinern. | – |
| `<title>` | `index.html:26` | Titel der Seite, erscheint im Browser-Tab und in Suchergebnissen. | VL2 S.3 |
| `<link rel="stylesheet">` | `index.html:29` | Bindet eine externe CSS-Datei ein; die Gestaltung steht also getrennt vom Inhalt. | VL4 S.11 |
| `<link rel="icon">` | `index.html:28` | Das kleine Bild im Browser-Tab (Favicon), hier eine SVG-Datei. | – |
| Sprunglink (Anker) `href="#inhalt"` | `index.html:38` | Ein Link auf das Element mit `id="inhalt"` `index.html:64`; Tastaturnutzer springen damit über die Navigation. | VL3 S.2 |
| `<header>`, `<nav>`, `<main>`, `<footer>` | `index.html:259`, `index.html:42`, `index.html:60`, `index.html:193` | Semantische Bereiche: Kopf, Navigation, Hauptinhalt, Fußzeile; sie sagen Browser und Screenreader, welcher Teil was ist. | VL2 S.8 |
| `<ul>` und `<li>` | `index.html:48` | Ungeordnete Liste mit Listenpunkten; das Menü ist eine Liste von Links. | VL2 S.6 |
| `<a href="quadrate.html">` | `index.html:51` | Link mit relativem Pfad auf eine andere Seite im selben Ordner. | VL2 S.6 |
| absoluter Link | `index.html:195` | Link mit vollständiger Adresse auf eine fremde Website. | VL2 S.6 |
| `aria-current="page"` | `index.html:48` | Markiert den Menüpunkt der aktuellen Seite; CSS hinterlegt ihn als hellgraue Pille, Screenreader sagen „aktuelle Seite“. | – |
| `<img>` mit `src`, `alt`, `width`, `height` | `index.html:43` | Bindet ein Bild ein; `alt` beschreibt es für Menschen, die es nicht sehen, `width` und `height` reservieren den Platz. | VL2 S.7 |
| `title` und `loading="lazy"` | `index.html:162` | `title` ist der Tooltip beim Darüberfahren; `loading="lazy"` lädt das Bild erst, wenn es gebraucht wird. | VL2 S.7 |
| `<h1>`, `<h2>`, `<p>` | `index.html:66`, `index.html:67` | Überschriften (h1 = wichtigste) und Absätze gliedern den Text. | VL2 S.3 |
| `<span>` | `index.html:69` | Neutrales Inline-Element, um ein Stück Text anzusprechen, ohne einen neuen Absatz zu beginnen. | – |
| `<div>` | `index.html:139` | Neutraler Block-Container, der Inhalte für CSS und JavaScript zusammenfasst. | VL3 S.3 |
| Attribut `id` | `index.html:141` | Eindeutiger Name eines Elements; JavaScript findet es damit (`getElementById`), CSS mit `#karte`. | VL3 S.3 |
| Attribut `class` | `index.html:67` | Name einer Gruppe von Elementen, die CSS gleich gestaltet; ein Element kann mehrere Klassen haben. | – |
| `<section>` mit `aria-labelledby` | `index.html:74` | Ein Abschnitt, dessen Name die Überschrift mit der genannten id ist. | – |
| Attribut `hidden` | `index.html:69` | Versteckt das Element; `app.js` entfernt es, sobald JavaScript läuft. | – |
| `<fieldset>` und `<legend>` | `index.html:77`, `index.html:73` | Fasst zusammengehörige Formularfelder zusammen; `<legend>` ist die Beschriftung der Gruppe. | VL3 S.2 |
| `<input type="radio">` | `index.html:79` | Optionsfeld; alle mit gleichem `name` bilden eine Gruppe, nur eines ist gewählt (`checked`). | VL3 S.2 |
| `<label for="...">` | `index.html:80` | Beschriftung eines Feldes; ein Klick darauf wählt das Feld mit dieser id. | VL3 S.2 |
| `aria-hidden="true"` | `index.html:80` | Versteckt ein Element nur vor Screenreadern; hier wird „Montag“ vorgelesen statt „Mo“. | – |
| `<input type="range">` | `index.html:119` | Schieberegler; `min`, `max`, `step` und `value` legen Bereich, Schrittweite und Startwert fest (Minuten 0 bis 1440, 30er-Schritte). | VL3 S.2 |
| `<output>` | `index.html:101` | Zeigt ein Ergebnis an, hier die gewählte Uhrzeit. | – |
| `<button type="button">` | `index.html:103` | Knopf, der kein Formular absendet, sondern nur ein Skript auslöst. | VL3 S.2 |
| `<select>` und `<option>` | `index.html:142` | Auswahlliste; die 146 Einträge fügt `app.js` ein. | VL3 S.2 |
| `aria-live="polite"` | `index.html:190` | Screenreader lesen Änderungen in diesem Bereich von selbst vor, sobald sie gerade nichts anderes sagen. | – |
| `<noscript>` | `index.html:248` | Inhalt, den der Browser nur zeigt, wenn JavaScript ausgeschaltet ist. | – |
| `tabindex="-1"` | `index.html:172` | Macht den Steckbrief per Skript fokussierbar, ohne ihn in die Tab-Reihenfolge aufzunehmen. | – |
| `<br>` | `index.html:195` | Zeilenumbruch innerhalb eines Absatzes; braucht kein End-Tag. | VL2 S.6 |
| `<script src="...">` | `index.html:274` | Lädt eine JavaScript-Datei; am Ende von `<body>`, damit alle Elemente schon da sind. | JS |

### CSS

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `@charset "utf-8";` | `css/index.css:1` | Erste Zeile jeder CSS-Datei: Sie ist in UTF-8 geschrieben. | VL4 S.11 |
| CSS-Kommentar `/* */` | `css/index.css:2` | Erklärung im CSS, die der Browser überspringt. | VL4 S.10 |
| Regel: Selektor `{ Eigenschaft: Wert; }` | `css/index.css:25` | Der Selektor wählt Elemente aus, die Eigenschaften in den geschweiften Klammern gestalten sie. | VL4 S.7 |
| Klassenselektor `.name` | `css/style.css:652` | Wählt alle Elemente mit dieser Klasse. | – |
| ID-Selektor `#name` | `css/index.css:171` | Wählt das eine Element mit dieser id. | VL3 S.3 |
| Elementselektor und Gruppe | `css/style.css:199` | `h1, h2, h3 { ... }` gibt mehreren Elementen dieselben Regeln. | VL4 S.20 |
| Nachfahren-Selektor (Leerzeichen) | `css/style.css:457` | Wählt alle `a` irgendwo innerhalb von `.site-nav` (Nachfahren). | VL4 S.15 (Begriffe) |
| Kind-Selektor `>` | `css/style.css:643` | Wählt nur die direkten Kinder eines Elements. | VL4 S.15 (Begriffe) |
| Nachbar-Selektor `+` | `css/style.css:919` | Wählt das Element direkt nach einem anderen: das Label nach dem gewählten Optionsfeld wird zum farbigen Chip. | – |
| Attributselektor `[...]` | `css/style.css:476` | Wählt Elemente nach einem Attribut und seinem Wert. | – |
| Pseudoklassen `:link` … `:active` | `css/style.css:276` bis `css/style.css:276` | Zustände eines Links in der Reihenfolge der Folie: unbesucht, besucht, fokussiert, Maus darüber, gedrückt. `:where()` gibt der Regel nur das Gewicht von `a`, damit Klassen wie `.button` ihre eigene Farbe behalten. | VL4 S.24 |
| `:hover` | `css/style.css:470` | Zustand „Maus über dem Element“. | VL4 S.24 |
| `:checked` | `css/style.css:1134` | Zustand „Optionsfeld ist gewählt“; der gewählte Wochentag wird dunkel. | – |
| `:focus-visible` | `css/style.css:330` | Fokus, der nur bei Tastaturbedienung einen sichtbaren Rahmen bekommt. | – |
| `:not()` | `css/index.css:104` | „alle außer“: Der Sprunglink ist versteckt, solange er keinen Fokus hat. | – |
| `:nth-child()` | `css/style.css:1023` | Wählt das n-te Kind; so sitzen die Stundenzahlen unter dem Regler. | – |
| Pseudoelement `::after` | `css/index.css:314` | Ein Element, das CSS selbst erzeugt; hier der kleine Pfeil einer eingeklappten Kategorie. | VL5\* |
| Custom Property (CSS-Variable) | `css/style.css:60`, `css/style.css:62` | Werte werden einmal unter `:root` festgelegt und mit `var(--name)` benutzt; eine Änderung wirkt auf der ganzen Seite. | – |
| Farben hex und `rgba()` | `css/style.css:82`, `css/style.css:82` | Hexwert `#rrggbb` oder Rot, Grün, Blau (0–255) plus Deckkraft (0 bis 1). Alle Kontraste sind im Kommentar daneben ausgerechnet (mindestens 4,5:1). | VL4 S.13–14 |
| Einheit `rem` | `css/style.css:114` | Vielfaches der Grundschrift des Browsers (meist 16 px); wächst mit, wenn jemand die Schrift vergrößert. | VL4 S.17–19 |
| `font-family` mit Systemschrift | `css/style.css:111` | Liste von Schriften: `-apple-system` und `system-ui` sind die Schrift des Geräts (San Francisco auf Apple-Geräten, Segoe UI unter Windows). Es wird keine Datei geladen, also auch keine Verbindung zu Google (Folie zu Webfonts). Apples Schriftdatei selbst darf man nicht in eine Website einbauen (Lizenz); den Namen der Systemschrift zu nennen ist erlaubt. | VL4 S.7, S.25 |
| Vererbung | `css/style.css:186` | Schrift und Farbe von `body` erben alle Elemente darin, deshalb stehen sie nur einmal da. | VL4 S.15 |
| Box-Modell, `box-sizing` | `css/style.css:177` | Jedes Element ist ein Kasten aus Inhalt, Innenabstand (`padding`), Rahmen (`border`) und Außenabstand (`margin`); mit `border-box` zählen Innenabstand und Rahmen zur Breite. | VL5\* |
| `padding`, `border-radius`, `box-shadow` | `css/style.css:660` | Innenabstand, runde Ecken und weicher Schatten: Die Filterleiste ist eine weiße „Karte“ auf grauem Grund wie auf Apples Websites. | VL5\* |
| `position: sticky` und `backdrop-filter` | `css/style.css:410` | Die Kopfzeile bleibt beim Scrollen oben stehen und lässt die Seite verschwommen durchscheinen („Glas“). Browser ohne `backdrop-filter` bekommen einen fast deckenden Hintergrund (`@supports not`). | – |
| Flexbox `display: flex` | `css/style.css:653` | Ordnet Kinder in einer Reihe an; `flex-wrap: wrap` lässt sie umbrechen, `gap` setzt den Abstand. | VL3 S.3 |
| `flex: 1 1 18rem` | `css/style.css:674` | Die Gruppe darf wachsen und schrumpfen und startet mit 18rem; so nimmt der Regler den Rest der Zeile. | – |
| Grid `display: grid` | `css/style.css:634` | Ordnet Kinder in einem Raster aus Zeilen und Spalten an. | – |
| `repeat(auto-fill, minmax())` | `css/index.css:243` | So viele Spalten von mindestens 10rem, wie hineinpassen. | – |
| Media Query `@media` | `css/index.css:96` | Regeln, die nur ab einer Bildschirmbreite gelten (Responsive Webdesign). | VL4 S.4 |
| `position` und `z-index` | `css/style.css:388` | `absolute` löst ein Element aus dem Fluss, `z-index` legt es über andere. | – |
| `transform` und `transition` | `css/style.css:781` | `transition` macht Änderungen weich; ein Knopf wird beim Drücken mit `transform: scale(0.97)` etwas kleiner, wie auf dem iPhone. | VL5 S.3 |
| `aspect-ratio` | `css/style.css:712` | Hält das Seitenverhältnis eines Kastens, egal wie breit er ist. | – |
| `[hidden]` mit `!important` | `css/style.css:350` | Sorgt dafür, dass `hidden` auch gegen `display: flex` gewinnt. | – |
| Herstellerpräfix | `css/style.css:182` | Laut Folie meist überflüssig; übrig ist nur, was Safari noch braucht, jeweils mit Kommentar. | VL4 S.10 |
| `@media (prefers-reduced-motion)` | `css/style.css:1930` | Wer im Betriebssystem „weniger Bewegung“ eingestellt hat, bekommt keine Animationen. | – |
| `@media print` | `css/index.css:584` | Regeln nur für den Ausdruck: Knöpfe verschwinden. | VL4 S.6 |

### JavaScript

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Funktion, die sich sofort aufruft | `js/app.js:24` | Das ganze Skript steckt in einer Funktion, damit seine Variablen keine anderen Skripte stören. | JS |
| `"use strict"` | `js/app.js:27` | Strenger Modus: Tippfehler bei Variablen werden zu Fehlermeldungen statt stiller Fehler. | JS |
| Variable `var` | `js/app.js:31` | Ein benannter Speicherplatz für einen Wert; Namen in Großbuchstaben sind feste Einstellungen. | JS |
| Array `[...]` | `js/app.js:41` | Liste von Werten mit Positionen ab 0. | JS |
| Objekt `{ key: value }` | `js/filter.js:56` | Sammlung von Werten unter Namen, hier Tag, Minuten und Kategorie. | JS |
| Verzweigung `if … else if … else` | `js/filter.js:95` | Wählt die Farbstufe aus der Zahl der offenen Orte (`levelOf()`): 1, 2–3, 4–6 oder 7 und mehr. Die erste Bedingung, die stimmt, gewinnt. | VL6 S.13 |
| Logisches Oder `\|\|` | `js/filter.js:178` | Eine Uhrzeit ist ungültig, wenn sie vor 0 Uhr **oder** nach 24 Uhr liegt. | VL6 S.12 |
| DOM und `document.getElementById` | `js/app.js:43` | Das DOM ist die Seite als Baum von Objekten; `getElementById` holt ein Element daraus über seine id. | JS |
| `querySelector` / `querySelectorAll` | `js/filter.js:335` | Findet Elemente mit einem CSS-Selektor: das erste bzw. alle. | JS |
| Funktion mit Parameter und `return` | `js/app.js:59` | Ein benannter Programmteil; bekommt Werte (Parameter) und gibt ein Ergebnis zurück. | JS |
| Doc-Kommentar `/** */` | `js/app.js:53` | Kurze Beschreibung über jeder Funktion. | JS |
| `for`-Schleife | `js/app.js:57` | Wiederholt einen Block für jeden Eintrag einer Liste. | JS |
| `if` / `else` | `js/app.js:138` | Führt Code nur aus, wenn eine Bedingung wahr ist. | JS |
| `===` | `js/app.js:58` | Vergleicht Wert und Typ; `"1" === 1` ist falsch. | JS |
| Methoden von Texten | `js/app.js:56` | `trim()` entfernt Leerzeichen am Rand, `toLowerCase()` macht Kleinbuchstaben. | JS |
| `try` / `catch` | `js/app.js:70` | Fängt einen Fehler ab, damit das Skript weiterläuft. | JS |
| `window.location.hash` | `js/app.js:67` | Der Teil der Adresse nach `#`; hier steht der Code des Quadrats. | JS |
| Ereignis `hashchange` | `js/app.js:274` | Meldet, dass sich der Teil nach `#` geändert hat (Klick, Link, Zurück-Taste). | JS |
| `addEventListener` | `js/app.js:267` | Meldet eine Funktion an, die bei einem Ereignis läuft (Klick, Änderung, Taste). | JS |
| Ereignis `input` | `js/filter.js:342` | Feuert bei jeder Bewegung des Reglers, nicht erst beim Loslassen. | JS |
| Ereignisobjekt, `event.key` | `js/app.js:283` | Das Ereignis bringt Angaben mit, zum Beispiel welche Taste gedrückt wurde. | JS |
| `event.preventDefault()` | `js/app.js:98` | Verhindert die normale Reaktion des Browsers, hier den Sprung des Links. | JS |
| Rückruffunktion (Callback) | `js/app.js:239` | Eine Funktion, die wir der Karte übergeben und die sie später aufruft. | JS |
| `document.createElement`, `appendChild` | `js/app.js:223`, `js/app.js:226` | Erzeugt ein neues Element und hängt es in die Seite ein. | JS |
| `textContent` | `js/app.js:88` | Setzt reinen Text in ein Element (ohne HTML). | JS |
| `innerHTML` | `js/steckbrief.js:510` | Ersetzt den Inhalt durch HTML-Text; fremde Texte müssen vorher maskiert werden. | JS |
| `classList` | `js/app.js:233` | Fügt Klassen hinzu oder entfernt sie; das Aussehen steht im CSS. | JS |
| `element.hidden` | `js/app.js:264` | Schaltet das HTML-Attribut `hidden` aus JavaScript. | JS |
| `focus()` | `js/app.js:100` | Setzt den Tastaturfokus auf ein Element. | JS |
| `window.matchMedia` | `js/app.js:78` | Prüft in JavaScript eine Media Query, zum Beispiel ob der Bildschirm schmal ist. | JS |
| `new Date()` | `js/filter.js:68` | Aktuelles Datum und Uhrzeit des Rechners. | JS |
| `Math.round`, `Math.floor`, `%` | `js/filter.js:72`, `js/oeffnungszeiten.js:44` | Runden und Rest der Division: 14:44 wird 14:30; der Tag vor Montag ist Sonntag. | JS |
| `for ... in` | `js/filter.js:230` | Läuft über alle Namen (Schlüssel) eines Objekts. | JS |
| `Object.keys(...).length` | `js/filter.js:201` | Zahl der Schlüssel eines Objekts, hier die Zahl gefärbter Quadrate. | JS |
| Bedingungsoperator `? :` | `js/filter.js:114` | Kurzform von if/else, die einen Wert liefert. | JS |
| `null` | `js/oeffnungszeiten.js:84` | „kein Wert“: Bei unbekannten Öffnungszeiten liefert `isOpen()` weder ja noch nein. | JS |
| `setAttribute` | `js/filter.js:166` | Setzt ein HTML-Attribut, hier den vorgelesenen Wert „14:30 Uhr“. | JS |
| `push` und `join` | `js/oeffnungszeiten.js:189`, `js/oeffnungszeiten.js:189` | Hängt einen Wert an ein Array an bzw. setzt ein Array zu einem Text zusammen. | JS |
| `sort` mit Vergleichsfunktion | `js/steckbrief.js:151` | Sortiert eine Kopie der Liste; die Funktion sagt, welcher von zwei Orten zuerst kommt. | JS |
| Maskieren mit `replace` und regulärem Ausdruck | `js/steckbrief.js:94` | Ersetzt `&`, `<`, `>` und Anführungszeichen durch Entitäten, damit Text nicht als HTML gilt. | JS |
| Ereignis-Delegation, `closest()` | `js/steckbrief.js:636` | Ein einziger Klick-Listener für den ganzen Steckbrief; `closest` findet den geklickten Knopf. | JS |
| Modul-Objekt `window.Filter` | `js/filter.js:436` | Nur diese Funktionen sind von außen sichtbar; die anderen bleiben im Skript. | JS |

## Fragen, die der Dozent stellen könnte

1. **Was passiert genau, wenn ich auf ein Quadrat klicke?**
   Die Karte meldet den Code an `app.js`. Dort wird er in die Adresse geschrieben (`#O3`). Das löst das Ereignis `hashchange` aus, und `openBlock()` lässt das Gebäude wachsen (`Karte.waehlen`) und füllt den Steckbrief (`Steckbrief.show`). Weil der Code in der Adresse steht, funktionieren Links wie `index.html#G1` und die Zurück-Taste.

2. **Wie kommt die Farbe eines Quadrats zustande?**
   `filter.js` zählt für die gewählte Kategorie, wie viele Orte des Quadrats zum gewählten Tag und zur Uhrzeit geöffnet haben. Aus der Zahl wird eine Stufe (1, 2–3, 4–6, 7+), aus der Stufe eine Farbe aus `window.KATEGORIEN`. `Karte.faerben()` bekommt ein Objekt wie `{ "G2": "#D23F27" }` und färbt die Gebäude.

3. **Was sieht jemand ohne JavaScript?**
   Alle Teile, die JavaScript brauchen, haben im HTML das Attribut `hidden`. In `#karte` steht ein Standbild der Karte, und `<noscript>` erklärt, dass Filter und Steckbrief JavaScript brauchen. Das ist unsere Version V1.

4. **Warum stehen die Skripte am Ende und nicht als Module, und warum lädt ihr die Daten nicht mit `fetch`?**
   Die Seite soll auch per Doppelklick (Adresse `file://`) laufen. Dort verbieten Browser `fetch` auf lokale Dateien und ES-Module. Deshalb sind die Daten JavaScript-Dateien, die globale Variablen wie `window.ORTE` setzen, und die Skripte werden in fester Reihenfolge am Ende von `<body>` geladen, wenn alle Elemente schon existieren.

5. **Warum `rem` und nicht `px`, und wie passt sich die Seite an das Handy an?**
   `rem` bezieht sich auf die Grundschrift des Browsers. Wer die Schrift vergrößert, bekommt die ganze Seite größer. Media Queries wie `@media (min-width: 48rem)` schalten ab einer Breite andere Regeln ein; die Filterleiste ist eine Flexbox mit Umbruch, auf dem Handy rutschen die Gruppen untereinander, und die Karte lässt sich zur Seite wischen.

### Stecknadeln in Kategorie-Farben (neu am 13.10.2026)

**Stecknadeln in Kategorie-Farben:** Eine Stecknadel steht auf jedem Quadrat mit gemerkten Orten. Sie hat jetzt die Farbe der Kategorie dieser Orte, bei mehreren Kategorien die der meisten.

- `showPins()` `js/steckbrief.js:564` zählt je Quadrat und Kategorie `js/steckbrief.js:571` und nimmt die größte Zahl `js/steckbrief.js:583`. Daraus wird ein Objekt wie `{ "O7": "trinken", "G2": "essen" }` für `Karte.markieren()`.
- Wie die Karte die Farbe setzt, steht in [karte-css3d.md](karte-css3d.md) unter „Stecknadeln in Kategorie-Farben“.

### Zeitraffer, „In meiner Nähe“ und Merkmale der Orte (neu am 13.10.2026)

**Was man sieht:**
- Neben „Jetzt“ steht der Knopf **Zeitraffer** `index.html:106`. Ein Klick lässt die Uhrzeit bis 24 Uhr weiterlaufen: seit dem 14.10.2026 alle 0,3 s um eine Viertelstunde (`PLAY_STEP` und `PLAY_DELAY` `js/filter.js:44`), gleichmäßig und ohne Pausen (siehe [karte-css3d.md](karte-css3d.md), Punkt 7 der Tageszeit-Stimmungen). Die Karte zeigt so in etwa 30 Sekunden, wie die Stadt sich über den Tag füllt und leert, samt Tageszeit-Stimmung. Ein zweiter Klick, der Regler, die Pfeile oder „Jetzt“ halten ihn an.
- Unter „Quadrat wählen“ steht **In meiner Nähe** `index.html:148`. Der Browser fragt nach dem Standort; danach öffnet sich der Steckbrief des Quadrats mit dem nächsten Ort, und darunter steht zum Beispiel „Am nächsten: O2 (etwa 50 m)“. Wer weiter als 1 km weg ist, liest „Du bist etwa 1,5 km von den Quadraten entfernt“.
- Im Steckbrief stehen unter den Orten kleine **Merkmale** aus OpenStreetMap, zum Beispiel „vegan“, „rollstuhlgerecht“, „draußen sitzen“, „WLAN“ oder die Küche („Pizza“, „türkisch“). Neben „Route“ steht ein Link **Webseite**, wenn OpenStreetMap eine kennt.

**So führst du es vor:** Den Regler auf 6 Uhr stellen und auf **Zeitraffer** drücken. Dann bei „Quadrat wählen“ auf **In meiner Nähe** drücken und den Standort erlauben.

**Woher die Merkmale und die Lage kommen:** `js/data/orte.js` wird von einem Werkzeug des Teams erzeugt und darf nicht von Hand geändert werden. Deshalb steht beides in einer eigenen Datei, `js/data/merkmale.js`. Das Skript `tools/merkmale-holen.ps1` holt dafür mit einer einzigen Anfrage an die Overpass-API von OpenStreetMap die Angaben zu allen 995 Orten `tools/merkmale-holen.ps1:33`. Es behält nur die Lage und wenige Merkmale. Die Website selbst fragt nie bei OpenStreetMap an, sie liest nur diese Datei. Es wird nur gezeigt, was in OpenStreetMap steht. Merkmale wie „Studentenrabatt“ gibt es dort nicht, also zeigen wir sie auch nicht.

1. **Zeitraffer:** `startPlay()` `js/filter.js:280` startet einen Takt mit `setInterval` `js/filter.js:289`. Jeder Takt setzt die Uhrzeit 15 Minuten weiter und ruft `apply()` auf, genau wie eine Bewegung des Reglers. Bei 24:00 hält `stopPlay()` `js/filter.js:263` den Takt mit `clearInterval` an. Während er läuft, ist die Zusammenfassung unter der Karte auf `aria-live="off"` gestellt `js/filter.js:287`, sonst würde ein Screenreader alle 0,4 Sekunden etwas vorlesen. Das Symbol im Knopf (Dreieck oder Quadrat) wählt CSS über `aria-pressed` `css/index.css:50`.
2. **In meiner Nähe:** `onNearClick()` `js/app.js:193` ruft `Standort.find()` auf. Das nutzt `navigator.geolocation.getCurrentPosition()` `js/standort.js:68`, also die Geolocation-API des Browsers. `Standort.nearest()` `js/standort.js:48` sucht den Ort mit der kleinsten Entfernung. Gerechnet wird mit der Haversine-Formel `js/standort.js:24`, das ist die Entfernung auf einer Kugel. Danach öffnet `chooseBlock()` sein Quadrat wie ein Klick auf die Karte. Der Knopf erscheint nur, wenn der Browser den Standort bestimmen kann `js/app.js:277`. Die Position wird nicht gespeichert und nirgends hingeschickt.
3. **Merkmale:** `Merkmale.tags()` `js/merkmale.js:77` übersetzt die OpenStreetMap-Angaben mit zwei Tabellen ins Deutsche, `TAGS` `js/merkmale.js:20` und `CUISINES` `js/merkmale.js:34`. Werte, die dort nicht stehen, und alle „no“ fallen weg. Der Steckbrief hängt sie mit `Merkmale.markup()` an jeden Ort an `js/steckbrief.js:380`.

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `setInterval()` / `clearInterval()` | `js/filter.js:289` | Ruft eine Funktion immer wieder auf, bis sie angehalten wird. | JS |
| `aria-pressed` | `index.html:106` | Sagt Screenreadern, ob ein Umschalt-Knopf gerade an ist. | – |
| `navigator.geolocation` | `js/standort.js:68` | Fragt den Standort ab. Der Browser fragt vorher selbst um Erlaubnis. | – |
| `Math.asin`, `Math.sin`, `Math.cos` | `js/standort.js:30` | Haversine-Formel: Entfernung zweier Punkte auf der Erdkugel. | JS |
| `split(";")` | `js/merkmale.js:66` | „pizza;italian“ wird zur Liste `["pizza", "italian"]`. | JS |

**Mögliche Fragen:**
- **Funktioniert der Standort auch per Doppelklick (file://)?** Ja. Seiten von der Festplatte gelten für die Geolocation als sicher, genau wie https-Seiten.
- **Ist das datenschutzrechtlich ein Problem?** Die Position bleibt in der Seite und wird weder gespeichert noch verschickt. Das steht auch in der Datenschutzerklärung.

### „Gerade offen“ unter der Karte, Farben und Bilder (neu am 14.10.2026)

**Gerade offen** steht jetzt unter der Karte `index.html:202` und richtet sich nach ihrem Filter. Erklärt in [gerade-offen.md](gerade-offen.md).

**Farben und Bilder:** Alle Bilder sind eigene Zeichnungen als SVG. Wir haben sie selbst gezeichnet, deshalb ist keine Lizenz nötig. Es sind nur Verzierungen: Sie hängen im CSS als Hintergrundbild oder stecken in einem `<span>` mit `aria-hidden="true"`, damit Screenreader sie überspringen.
- **Farbiges Band** oben auf jeder Seite (außer Karte, Impressum und Datenschutz): Die Klasse `page-intro--band` `css/style.css:2056` legt einen Farbverlauf mit `linear-gradient` und eine Zeichnung übereinander `css/style.css:2060`. Jede Seite hat eine eigene Klasse mit zwei Farben und ihrer Zeichnung, zum Beispiel `.band-events` `css/style.css:2082`. Auf dem Handy wird die Zeichnung kleiner und rutscht in die Ecke.
- **Kategorie-Icons** im Filter `index.html:131` und im Steckbrief `js/steckbrief.js:410`: `.cat-icon` `css/style.css:2091` mit einem Bild aus `img/icons/` (Besteck, Tasse, Museum, Tasche) in der Farbe der Kategorie.
- **Farbiger Streifen** links an jedem Ort in „Gerade offen“, in der Ortssuche und auf der Merkliste: `.place--cat` `css/style.css:2109` nimmt die Farbe `--cat-3`, die die Klasse `cat-essen` … setzt.

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| mehrere Hintergrundbilder | `css/style.css:2060` | `background-image: Bild, Verlauf;` – das erste liegt oben. | – |
| `linear-gradient()` | `css/style.css:2060` | Ein Farbverlauf, hier schräg (120 Grad) von einer Farbe zur anderen. | – |
| SVG | `img/icons/essen.svg` | Eine Grafik aus Formen (Linien, Kreise, Pfade) als Text. Sie bleibt in jeder Größe scharf. | – |
| `aria-hidden="true"` | `js/steckbrief.js:410` | Screenreader überspringen das Element, weil es nur Verzierung ist. | – |

### Eine Stecknadel je Ort und weichere Übergänge (neu am 14.10.2026, final-v5)

**Stecknadeln:** Sind in einem Quadrat zwei oder drei Orte gemerkt, stehen jetzt **zwei oder drei Nadeln nebeneinander**, jede in der Farbe ihrer Kategorie. Vorher gab es nur eine Nadel in der häufigsten Farbe. Mehr als drei Nadeln zeigt die Karte nicht (`MAX_PINS` `js/karte.js:30`).
- `showPins()` legt für jedes Quadrat eine Liste mit einer Kategorie je gemerktem Ort an, zum Beispiel `{ "O7": ["essen", "trinken"] }` `js/steckbrief.js:584`.
- `Karte.markieren()` `js/karte.js:533` setzt dann eine Nadel je Eintrag. Die Nadeln stehen `PIN_GAP` = 20 Pixel auseinander, um die Mitte des Quadrats verteilt `js/karte.js:565`: Bei zwei Nadeln ist die Verschiebung −10 und +10, bei drei −20, 0 und +20.

**Weichere Übergänge beim Zeitregler:**
1. Die Farben der Quadrate glitten zuerst in 0,6 statt 0,3 Sekunden in die neue Farbe. Seit der letzten Runde am 14.10.2026 gleiten sie gar nicht mehr, nur Himmel, Boden und Sonne blenden in 0,6 s über (`--map-colour-duration` `css/karte.css:44`); warum, steht in [karte-css3d.md](karte-css3d.md) unter „Flüssig wie ein Video“.
2. Beim Ziehen schickt der Browser oft mehrere `input`-Ereignisse pro Bild. `applySoon()` `js/filter.js:305` rechnet trotzdem nur einmal pro Bild neu, mit `requestAnimationFrame` `js/filter.js:312`. Das ist der Moment, kurz bevor der Bildschirm neu gezeichnet wird.
3. Steckbrief und „Gerade offen“ werden erst neu gezeichnet, wenn der Regler 150 ms still steht (`LIST_DELAY` `js/app.js:37`, `setTimeout` `js/app.js:251`). Beim Ziehen ändert sich also nur die Karte, und sie ruckelt nicht.

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `requestAnimationFrame()` | `js/filter.js:312` | Führt eine Funktion vor dem nächsten Bild des Bildschirms aus (etwa 60-mal pro Sekunde). | – |
| `setTimeout()` / `clearTimeout()` | `js/app.js:251` | Erst nach einer Pause ausführen; jede neue Änderung startet die Pause neu. | JS |
| `transition` mit Variable | `css/karte.css:44` | Die Dauer steht einmal als Variable und gilt für das Überblenden von Himmel, Boden und Sonne (seit 14.10.2026 gleiten die Farben der Häuser nicht mehr, siehe [karte-css3d.md](karte-css3d.md)). | – |

### Fließende Tageszeit, Sonne und „Über uns“ im Menü (neu am 14.10.2026, final-v5)

**Was man sieht:**
- Die Karte wird abends Minute für Minute dunkler, statt zu springen. Ab 17:30 Uhr färbt sich die Stadt warm, um 19:30 Uhr ist Sonnenuntergang, und bis 21:30 Uhr wird es Nacht, jeder Abschnitt gleich schnell. Die Fenster gehen dabei nach und nach an.
- Morgens geht es umgekehrt, von 4:30 bis 8:30 Uhr.
- Die **Sonne** wandert über den Tag von rechts (Osten) nach links (Westen). Mittags steht sie hoch oben.

Wie das gebaut ist, steht in [karte-css3d.md](karte-css3d.md) unter „Tageszeit-Stimmungen“.

**Menü:** „Über uns“ steht wieder im Menü, ganz rechts neben „Konto“ `index.html:58`. Das Menü hat 6 Reiter und passt auf dem Handy in zwei Zeilen.

**Feinerer Regler (14.10.2026):** Der Regler der Karte hat jetzt `step="15"` `index.html:119` statt 30. Beim Ziehen ändert sich die Uhrzeit in Viertelstunden, und Himmel und Boden blenden dazwischen über. Die Pfeil-Knöpfe springen weiter zur nächsten vollen oder halben Stunde `js/filter.js:177` (von 19:10 zurück auf 19:00, vor auf 19:30).
