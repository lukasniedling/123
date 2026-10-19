# Karte: die Startseite `index.html`

Erklärung für die Präsentation. Zeilennummern erzeugt am 2026-09-29 11:54 aus den aktuellen Dateien. Sie gelten in beiden Varianten (`web/variante-svg` und `web/variante-css3d`), denn alle hier genannten Dateien sind dort gleich. Die Kartendateien selbst (`js/karte.js`, `css/karte.css`, `js/data/karte-daten.js`) unterscheiden sich; sie stehen in [karte-svg.md](karte-svg.md) und [karte-css3d.md](karte-css3d.md).

**Vorschlag für die Präsentation:** Niko Eibach (Programmierung) führt die Karte vor und erklärt den JavaScript-Teil; den CSS-Teil mit `css/style.css` und dem Styleguide `docs/styleguide.html` erklärt Nikita Ermotschenko (Design und Kreativität). Die ganze Aufteilung für alle fünf steht in [README.md](README.md) unter „Vorschlag: wer präsentiert was“.

## Was die Seite zeigt und warum

Die Startseite beantwortet eine Frage: **Was hat in welchem Quadrat zu einer bestimmten Zeit geöffnet?**

- Oben steht die **Filterleiste**: Wochentag, Uhrzeit (Schieberegler), Kategorie (Essen, Trinken, Kultur, Shoppen) und die Liste „Quadrat wählen“.
- Darunter die **3D-Karte** der 146 Quadrate. Jedes Quadrat ist so kräftig gefärbt, wie viele passende Orte zur gewählten Zeit geöffnet haben. Die **Legende** nennt die Stufen (1, 2–3, 4–6, 7+), ein Satz darunter fasst das Ergebnis zusammen.
- Ein Klick auf ein Quadrat lässt das Gebäude wachsen und leuchten. Darunter erscheint der **Steckbrief**: Text, Foto, Zahl der Orte und alle Orte mit ihren Öffnungszeiten.

Warum so: Die Karte ist die Hauptattraktion der Website und zeigt, was JavaScript kann (Version V2). Ohne JavaScript (Version V1) zeigt dieselbe Seite ein festes Bild der Karte und einen Link zum Verzeichnis. Mit PHP (Version V3) kommen der Knopf „Merken“ und Stecknadeln auf der Karte dazu (siehe [konto.md](konto.md)).

## So führst du die Seite vor

1. Seite öffnen. Der Filter steht auf „jetzt“. Hat gerade kaum etwas geöffnet (nachts), springt er auf 12:00 Uhr und sagt das unter der Legende.
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
| `js/steckbrief.js` | baut den Steckbrief eines Quadrats | V2 (Merken: V3) |
| `js/merkliste.js` | spricht mit `php/merken.php` über gemerkte Orte | V3 |
| `js/app.js` | verbindet alle Teile und liest die Adresse (`index.html#G1`) | V2 |

### `index.html` von oben nach unten

1. Kopfkommentar `index.html:3`: wozu die Datei da ist und was zu V1, V2 und V3 gehört.
2. `<head>` `index.html:20`: Zeichenkodierung, Viewport, Titel, Beschreibung, Favicon und drei Stylesheets in fester Reihenfolge: erst `style.css`, dann `karte.css`, dann `index.css` `index.html:29`. Bei gleich starken Regeln gewinnt die spätere.
3. Sprunglink „Zum Inhalt springen“ `index.html:33`, dann Kopfbereich mit Logo und Navigation `index.html:35`. Dieser Rahmen ist auf allen Seiten gleich (Vorlage: `docs/_vorlage.html`).
4. Hauptbereich `<main id="inhalt">` `index.html:55` mit Überschrift und Einleitung.
5. Filterleiste `index.html:65`: Wochentage als sieben Optionsfelder `index.html:70`, Uhrzeit als Schieberegler `index.html:97` mit Anzeige und Knopf „Jetzt“, Kategorien als Optionsfelder, die wie Chips aussehen `index.html:104`, und die Liste „Quadrat wählen“ `index.html:114`. Die Leiste trägt `hidden`, denn ohne JavaScript nützt sie nichts.
6. Kartenrahmen `index.html:123`: Im `<div id="karte">` `index.html:132` steht zuerst das Standbild `index.html:133`; JavaScript ersetzt es durch die Karte. Darunter Legende `index.html:139`, Zusammenfassung `index.html:151` und Datenquelle `index.html:158`.
7. `<noscript>` `index.html:163`: Hinweis, der nur ohne JavaScript erscheint.
8. Steckbrief `index.html:171`: ein leerer Bereich, den `js/steckbrief.js` füllt.
9. Unsichtbarer Ansagebereich für Screenreader `index.html:174`.
10. Fußzeile mit dem Hinweis auf OpenStreetMap `index.html:177`.
11. Skripte am Ende von `<body>` `index.html:191` bis `index.html:204`: zuerst die Daten, dann die Karte, dann Öffnungszeiten, Filter und Steckbrief, zuletzt `app.js`, das alles verbindet. Die Reihenfolge ist wichtig, weil jedes Skript die vorher geladenen benutzt.

### Was beim Laden passiert

`js/app.js` läuft als letztes Skript und ruft `init()` auf `js/app.js:193`:

1. Die Klasse `map-fallback` wird entfernt und `Karte.init()` baut die Karte in `#karte` `js/app.js:196`.
2. `Steckbrief.init()` `js/app.js:203` zeigt den leeren Steckbrief, `Filter.init()` `js/app.js:204` stellt heute und jetzt ein und färbt die Karte zum ersten Mal `js/filter.js:268`.
3. `fillSelect()` `js/app.js:181` füllt die Liste mit allen 146 Quadraten.
4. Alle Teile mit `hidden`, die JavaScript brauchen, werden sichtbar `js/app.js:211`.
5. Die Ereignisse werden angemeldet: Auswahl in der Liste `js/app.js:214`, Änderung der Adresse `js/app.js:221`, Escape-Taste `js/app.js:225`.
6. Steht schon ein Quadrat in der Adresse (`index.html#G1`), wird es sofort geöffnet `js/app.js:232`.

### Was bei einem Klick auf ein Quadrat passiert

1. Die Karte meldet den Code an `app.js` (Rückruffunktion `onSelect`) `js/app.js:198`.
2. `chooseBlock()` schreibt den Code in die Adresse: `window.location.hash = code` `js/app.js:163`.
3. Der Browser löst das Ereignis `hashchange` aus; `onHashChange()` `js/app.js:168` liest den Code `js/app.js:55`.
4. `openBlock()` `js/app.js:115` lässt das Gebäude wachsen (`Karte.waehlen`), füllt den Steckbrief (`Steckbrief.show`), stellt die Liste um und sagt Screenreadern „Quadrat O3 gewählt“.

Warum der Umweg über die Adresse: So funktionieren Links wie `index.html#G1` aus dem Verzeichnis und von „Meine Orte“, und die Zurück-Taste führt zum vorigen Quadrat.

### Was bei einer Änderung am Filter passiert

1. `bindEvents()` `js/filter.js:234` hört auf `change` bei den Optionsfeldern und auf `input` beim Schieberegler (schon während er sich bewegt) `js/filter.js:242`.
2. Der neue Wert kommt in das Objekt `state` `js/filter.js:46`, dann rechnet `apply()` alles neu `js/filter.js:197`.
3. `countOpen()` `js/filter.js:69` geht in einer Schleife durch alle 995 Orte in `window.ORTE` und zählt je Quadrat die Orte der Kategorie, die gerade geöffnet haben (`Oeffnungszeiten.isOpen`).
4. `levelOf()` `js/filter.js:83` macht aus der Zahl eine Stufe (1 → Stufe 0, 2–3 → 1, 4–6 → 2, 7+ → 3), `colourOf()` `js/filter.js:100` holt die Farbe aus `window.KATEGORIEN` `js/filter.js:22`.
5. `Karte.faerben(colours, texts)` `js/filter.js:206` färbt die Gebäude; die Texte („9 geöffnet“) kommen in den Namen, den Screenreader vorlesen.
6. Zeitanzeige, Legende und Zusammenfassung werden neu geschrieben, dann ruft `onChange` den Steckbrief auf `js/app.js:206`, damit auch seine Öffnungszeiten zum Filter passen.

### Der Steckbrief

`render()` `js/steckbrief.js:381` setzt den Steckbrief als HTML-Text zusammen und schreibt ihn mit `innerHTML` in die Seite `js/steckbrief.js:396`:

- `headMarkup()` `js/steckbrief.js:158`: Kachel mit dem Code, Titel, Kurzbeschreibung, Knopf „Auswahl aufheben“.
- `aboutMarkup()` `js/steckbrief.js:230`: Text, Quelle, Foto mit Bildnachweis `js/steckbrief.js:184` und die Zahl der Orte je Kategorie.
- `placesMarkup()` `js/steckbrief.js:306`: Die gewählte Kategorie ist offen, die anderen sind in `<details>` eingeklappt `js/steckbrief.js:344`. Jeder Ort bekommt ein Schild „geöffnet“, „geschlossen“ oder „unbekannt“ `js/steckbrief.js:118`.
- Die Namen der Orte kommen aus OpenStreetMap. Deshalb laufen sie vorher durch `escapeHtml()` `js/steckbrief.js:81`, damit kein fremdes HTML in die Seite gelangt.

### Die Öffnungszeiten

Jeder Ort hat im Feld `zeiten` sieben Listen (Montag bis Sonntag) mit Zeitspannen in Minuten seit Mitternacht: `[660, 1140]` heißt 11:00 bis 19:00. Ein Ende über 1440 geht über Mitternacht hinaus (`[1200, 1560]` = 20:00 bis 02:00). `isOpen()` `js/oeffnungszeiten.js:81` prüft die Spannen des Tages und die Spannen des Vortags, die nach Mitternacht weiterlaufen `js/oeffnungszeiten.js:65`. Ist `zeiten` gleich `null`, sind die Zeiten unbekannt, und der Ort zählt nicht mit.

### CSS dieser Seite

- Seitenraster: `.map-layout` ist ein Grid mit einer Spalte `css/style.css:705`; Filterleiste, Karte und Steckbrief stehen untereinander.
- Filterleiste: `.filter-bar` ist eine Flexbox mit Umbruch `css/style.css:724`; auf schmalen Bildschirmen rutschen die Gruppen untereinander.
- Kartenrahmen: `#karte` hält mit `aspect-ratio: 3 / 2` das Seitenverhältnis der Karte `css/style.css:781`.
- Steckbrief: ab 56rem Breite zwei Spalten (Text links, Orte rechts) `css/style.css:1652`.
- Bausteine aus `style.css`: Chips `css/style.css:959`, Wochentage `css/style.css:1174`, Schieberegler `css/style.css:1016`, Farbfelder der Legende `css/style.css:1869`, Status-Schilder `css/style.css:1779`.
- `css/index.css` ergänzt nur, was es auf dieser Seite zusätzlich gibt, etwa den Sprunglink `css/index.css:50` und die eingeklappten Kategorien `css/index.css:188`.

## Begriffe aus dem Quelltext

Spalte „Kurs“: **VL2 S.3** = Vorlesung 2, Folie 3. **VL5\*** = im Inhaltsverzeichnis von Vorlesung 4 (Folie 2–3) für die nächste CSS-Vorlesung angekündigt. **JS** = Thema der JavaScript-Vorlesung (VL6), **PHP** = Thema der PHP-Vorlesung (VL7). **–** = nicht in den Folien.

### HTML

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `<!DOCTYPE html>` | `index.html:1` | Sagt dem Browser, dass die Datei ein HTML5-Dokument ist. | VL2 S.3 |
| HTML-Kommentar `<!-- -->` | `index.html:2` | Text für Menschen, den der Browser nicht anzeigt; bei uns stehen dort Zweck und Version der Datei. | VL2 S.5 |
| `<html lang="de">` | `index.html:19` | Wurzel-Element; `lang="de"` sagt, dass der Text Deutsch ist (wichtig für Vorlesefunktion und Silbentrennung). | – |
| `<head>` und `<body>` | `index.html:20`, `index.html:31` | Der Kopf enthält Angaben über die Seite (nicht sichtbar), der Körper alles Sichtbare. | VL2 S.2 |
| `<meta charset="utf-8">` | `index.html:21` | Legt die Zeichenkodierung fest, damit Umlaute wie „ä“ richtig erscheinen. | VL2 S.3 |
| `<meta name="viewport">` | `index.html:22` | Sagt Handys, dass die Seite so breit wie der Bildschirm ist, statt eine Desktop-Seite zu verkleinern. | – |
| `<title>` | `index.html:23` | Titel der Seite, erscheint im Browser-Tab und in Suchergebnissen. | VL2 S.3 |
| `<link rel="stylesheet">` | `index.html:26` | Bindet eine externe CSS-Datei ein; die Gestaltung steht also getrennt vom Inhalt. | VL4 S.11 |
| `<link rel="icon">` | `index.html:25` | Das kleine Bild im Browser-Tab (Favicon), hier eine SVG-Datei. | – |
| Sprunglink (Anker) `href="#inhalt"` | `index.html:33` | Ein Link auf das Element mit `id="inhalt"` `index.html:55`; Tastaturnutzer springen damit über die Navigation. | VL3 S.2 |
| `<header>`, `<nav>`, `<main>`, `<footer>` | `index.html:35`, `index.html:41`, `index.html:55`, `index.html:177` | Semantische Bereiche: Kopf, Navigation, Hauptinhalt, Fußzeile; sie sagen Browser und Screenreader, welcher Teil was ist. | VL2 S.8 |
| `<ul>` und `<li>` | `index.html:42` | Ungeordnete Liste mit Listenpunkten; das Menü ist eine Liste von Links. | VL2 S.6 |
| `<a href="quadrate.html">` | `index.html:44` | Link mit relativem Pfad auf eine andere Seite im selben Ordner. | VL2 S.6 |
| absoluter Link | `index.html:179` | Link mit vollständiger Adresse auf eine fremde Website. | VL2 S.6 |
| `aria-current="page"` | `index.html:43` | Markiert den Menüpunkt der aktuellen Seite; CSS zeichnet darunter einen Sandstreifen, Screenreader sagen „aktuelle Seite“. | – |
| `<img>` mit `src`, `alt`, `width`, `height` | `index.html:38` | Bindet ein Bild ein; `alt` beschreibt es für Menschen, die es nicht sehen, `width` und `height` reservieren den Platz. | VL2 S.7 |
| `title` und `loading="lazy"` | `index.html:133` | `title` ist der Tooltip beim Darüberfahren; `loading="lazy"` lädt das Bild erst, wenn es gebraucht wird. | VL2 S.7 |
| `<h1>`, `<h2>`, `<p>` | `index.html:57`, `index.html:58` | Überschriften (h1 = wichtigste) und Absätze gliedern den Text. | VL2 S.3 |
| `<span>` | `index.html:60` | Neutrales Inline-Element, um ein Stück Text anzusprechen, ohne einen neuen Absatz zu beginnen. | – |
| `<div>` | `index.html:123` | Neutraler Block-Container, der Inhalte für CSS und JavaScript zusammenfasst. | VL3 S.3 |
| Attribut `id` | `index.html:132` | Eindeutiger Name eines Elements; JavaScript findet es damit (`getElementById`), CSS mit `#karte`. | VL3 S.3 |
| Attribut `class` | `index.html:65` | Name einer Gruppe von Elementen, die CSS gleich gestaltet; ein Element kann mehrere Klassen haben. | – |
| `<section>` mit `aria-labelledby` | `index.html:65` | Ein Abschnitt, dessen Name die Überschrift mit der genannten id ist. | – |
| Attribut `hidden` | `index.html:65` | Versteckt das Element; `app.js` entfernt es, sobald JavaScript läuft. | – |
| `<fieldset>` und `<legend>` | `index.html:67`, `index.html:68` | Fasst zusammengehörige Formularfelder zusammen; `<legend>` ist die Beschriftung der Gruppe. | VL3 S.2 |
| `<input type="radio">` | `index.html:70` | Optionsfeld; alle mit gleichem `name` bilden eine Gruppe, nur eines ist gewählt (`checked`). | VL3 S.2 |
| `<label for="...">` | `index.html:71` | Beschriftung eines Feldes; ein Klick darauf wählt das Feld mit dieser id. | VL3 S.2 |
| `aria-hidden="true"` | `index.html:71` | Versteckt ein Element nur vor Screenreadern; hier wird „Montag“ vorgelesen statt „Mo“. | – |
| `<input type="range">` | `index.html:97` | Schieberegler; `min`, `max`, `step` und `value` legen Bereich, Schrittweite und Startwert fest (Minuten 0 bis 1440, 30er-Schritte). | VL3 S.2 |
| `<output>` | `index.html:92` | Zeigt ein Ergebnis an, hier die gewählte Uhrzeit. | – |
| `<button type="button">` | `index.html:94` | Knopf, der kein Formular absendet, sondern nur ein Skript auslöst. | VL3 S.2 |
| `<select>` und `<option>` | `index.html:114` | Auswahlliste; die 146 Einträge fügt `app.js` ein. | VL3 S.2 |
| `aria-live="polite"` | `index.html:151` | Screenreader lesen Änderungen in diesem Bereich von selbst vor, sobald sie gerade nichts anderes sagen. | – |
| `<noscript>` | `index.html:163` | Inhalt, den der Browser nur zeigt, wenn JavaScript ausgeschaltet ist. | – |
| `tabindex="-1"` | `index.html:171` | Macht den Steckbrief per Skript fokussierbar, ohne ihn in die Tab-Reihenfolge aufzunehmen. | – |
| `<br>` | `index.html:158` | Zeilenumbruch innerhalb eines Absatzes; braucht kein End-Tag. | VL2 S.6 |
| `<script src="...">` | `index.html:191` | Lädt eine JavaScript-Datei; am Ende von `<body>`, damit alle Elemente schon da sind. | JS |

### CSS

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `@charset "utf-8";` | `css/index.css:1` | Erste Zeile jeder CSS-Datei: Sie ist in UTF-8 geschrieben. | VL4 S.11 |
| CSS-Kommentar `/* */` | `css/index.css:2` | Erklärung im CSS, die der Browser überspringt. | VL4 S.10 |
| Regel: Selektor `{ Eigenschaft: Wert; }` | `css/index.css:25` | Der Selektor wählt Elemente aus, die Eigenschaften in den geschweiften Klammern gestalten sie. | VL4 S.7 |
| Klassenselektor `.name` | `css/style.css:724` | Wählt alle Elemente mit dieser Klasse. | – |
| ID-Selektor `#name` | `css/index.css:124` | Wählt das eine Element mit dieser id. | VL3 S.3 |
| Elementselektor und Gruppe | `css/style.css:284` | `h1, h2, h3 { ... }` gibt mehreren Elementen dieselben Regeln. | VL4 S.20 |
| Nachfahren-Selektor (Leerzeichen) | `css/style.css:534` | Wählt alle `a` irgendwo innerhalb von `.site-nav` (Nachfahren). | VL4 S.15 (Begriffe) |
| Kind-Selektor `>` | `css/style.css:715` | Wählt nur die direkten Kinder eines Elements. | VL4 S.15 (Begriffe) |
| Nachbar-Selektor `+` | `css/style.css:990` | Wählt das Element direkt nach einem anderen: das Label nach dem gewählten Optionsfeld wird zum farbigen Chip. | – |
| Attributselektor `[...]` | `css/style.css:551` | Wählt Elemente nach einem Attribut und seinem Wert. | – |
| Pseudoklassen `:link` … `:active` | `css/style.css:346` bis `css/style.css:362` | Zustände eines Links in der Reihenfolge der Folie: unbesucht, besucht, fokussiert, Maus darüber, gedrückt. | VL4 S.24 |
| `:hover` | `css/style.css:545` | Zustand „Maus über dem Element“. | VL4 S.24 |
| `:checked` | `css/style.css:1215` | Zustand „Optionsfeld ist gewählt“; der gewählte Wochentag wird dunkel. | – |
| `:focus-visible` | `css/style.css:416` | Fokus, der nur bei Tastaturbedienung einen sichtbaren Rahmen bekommt. | – |
| `:not()` | `css/index.css:50` | „alle außer“: Der Sprunglink ist versteckt, solange er keinen Fokus hat. | – |
| `:nth-child()` | `css/style.css:1096` | Wählt das n-te Kind; so sitzen die Stundenzahlen unter dem Regler. | – |
| Pseudoelement `::after` | `css/index.css:209` | Ein Element, das CSS selbst erzeugt; hier der kleine Pfeil einer eingeklappten Kategorie. | VL5\* |
| Custom Property (CSS-Variable) | `css/style.css:141`, `css/style.css:143` | Werte werden einmal unter `:root` festgelegt und mit `var(--name)` benutzt; eine Änderung wirkt auf der ganzen Seite. | – |
| Farben hex und `rgba()` | `css/style.css:145`, `css/style.css:1575` | Hexwert `#rrggbb` oder Rot, Grün, Blau (0–255) plus Deckkraft (0 bis 1). | VL4 S.13–14 |
| Einheit `rem` | `css/style.css:203` | Vielfaches der Grundschrift des Browsers (meist 16 px); wächst mit, wenn jemand die Schrift vergrößert. | VL4 S.17–19 |
| `@font-face` | `css/style.css:52` | Lädt eine Schrift aus unserem Ordner `fonts/` statt von Google (Datenschutz). | VL4 S.25 |
| `font-family` mit Ersatzschriften | `css/style.css:198` | Liste von Schriften; fehlt die erste, nimmt der Browser die nächste, zuletzt `sans-serif`. | VL4 S.7 |
| Vererbung | `css/style.css:272` | Schrift und Farbe von `body` erben alle Elemente darin, deshalb stehen sie nur einmal da. | VL4 S.15 |
| Box-Modell, `box-sizing` | `css/style.css:263` | Jedes Element ist ein Kasten aus Inhalt, Innenabstand (`padding`), Rahmen (`border`) und Außenabstand (`margin`); mit `border-box` zählen Innenabstand und Rahmen zur Breite. | VL5\* |
| `padding`, `border`, `margin` | `css/style.css:729` | Innenabstand, Rahmen und Außenabstand eines Kastens, hier bei der Filterleiste. | VL5\* |
| Flexbox `display: flex` | `css/style.css:724` | Ordnet Kinder in einer Reihe an; `flex-wrap: wrap` lässt sie umbrechen, `gap` setzt den Abstand. | VL3 S.3 |
| `flex: 1 1 18rem` | `css/style.css:746` | Die Gruppe darf wachsen und schrumpfen und startet mit 18rem; so nimmt der Regler den Rest der Zeile. | – |
| Grid `display: grid` | `css/style.css:705` | Ordnet Kinder in einem Raster aus Zeilen und Spalten an. | – |
| `repeat(auto-fill, minmax())` | `css/index.css:138` | So viele Spalten von mindestens 10rem, wie hineinpassen. | – |
| Media Query `@media` | `css/index.css:42` | Regeln, die nur ab einer Bildschirmbreite gelten (Responsive Webdesign). | VL4 S.4 |
| `position` und `z-index` | `css/style.css:476` | `absolute` löst ein Element aus dem Fluss, `z-index` legt es über andere. | – |
| `transform` und `transition` | `css/style.css:854` | `transform` verschiebt oder dreht ein Element, `transition` macht die Änderung weich; ein Knopf sinkt beim Drücken ein. | – |
| `aspect-ratio` | `css/style.css:784` | Hält das Seitenverhältnis eines Kastens, egal wie breit er ist. | – |
| `[hidden]` mit `!important` | `css/style.css:435` | Sorgt dafür, dass `hidden` auch gegen `display: flex` gewinnt. | – |
| Herstellerpräfix | `css/style.css:268` | Laut Folie meist überflüssig; übrig ist nur, was Safari noch braucht, jeweils mit Kommentar. | VL4 S.10 |
| `@media (prefers-reduced-motion)` | `css/style.css:2015` | Wer im Betriebssystem „weniger Bewegung“ eingestellt hat, bekommt keine Animationen. | – |
| `@media print` | `css/index.css:294` | Regeln nur für den Ausdruck: Knöpfe verschwinden. | VL4 S.6 |

### JavaScript

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Funktion, die sich sofort aufruft | `js/app.js:20` | Das ganze Skript steckt in einer Funktion, damit seine Variablen keine anderen Skripte stören. | JS |
| `"use strict"` | `js/app.js:21` | Strenger Modus: Tippfehler bei Variablen werden zu Fehlermeldungen statt stiller Fehler. | JS |
| Variable `var` | `js/app.js:25` | Ein benannter Speicherplatz für einen Wert; Namen in Großbuchstaben sind feste Einstellungen. | JS |
| Array `[...]` | `js/app.js:28` | Liste von Werten mit Positionen ab 0. | JS |
| Objekt `{ key: value }` | `js/filter.js:46` | Sammlung von Werten unter Namen, hier Tag, Minuten und Kategorie. | JS |
| DOM und `document.getElementById` | `js/app.js:30` | Das DOM ist die Seite als Baum von Objekten; `getElementById` holt ein Element daraus über seine id. | JS |
| `querySelector` / `querySelectorAll` | `js/filter.js:235` | Findet Elemente mit einem CSS-Selektor: das erste bzw. alle. | JS |
| Funktion mit Parameter und `return` | `js/app.js:43` | Ein benannter Programmteil; bekommt Werte (Parameter) und gibt ein Ergebnis zurück. | JS |
| Doc-Kommentar `/** */` | `js/app.js:42` | Kurze Beschreibung über jeder Funktion. | JS |
| `for`-Schleife | `js/app.js:46` | Wiederholt einen Block für jeden Eintrag einer Liste. | JS |
| `if` / `else` | `js/app.js:126` | Führt Code nur aus, wenn eine Bedingung wahr ist. | JS |
| `===` | `js/app.js:47` | Vergleicht Wert und Typ; `"1" === 1` ist falsch. | JS |
| Methoden von Texten | `js/app.js:45` | `trim()` entfernt Leerzeichen am Rand, `toLowerCase()` macht Kleinbuchstaben. | JS |
| `try` / `catch` | `js/app.js:59` | Fängt einen Fehler ab, damit das Skript weiterläuft. | JS |
| `window.location.hash` | `js/app.js:56` | Der Teil der Adresse nach `#`; hier steht der Code des Quadrats. | JS |
| Ereignis `hashchange` | `js/app.js:221` | Meldet, dass sich der Teil nach `#` geändert hat (Klick, Link, Zurück-Taste). | JS |
| `addEventListener` | `js/app.js:214` | Meldet eine Funktion an, die bei einem Ereignis läuft (Klick, Änderung, Taste). | JS |
| Ereignis `input` | `js/filter.js:242` | Feuert bei jeder Bewegung des Reglers, nicht erst beim Loslassen. | JS |
| Ereignisobjekt, `event.key` | `js/app.js:225` | Das Ereignis bringt Angaben mit, zum Beispiel welche Taste gedrückt wurde. | JS |
| `event.preventDefault()` | `js/app.js:87` | Verhindert die normale Reaktion des Browsers, hier den Sprung des Links. | JS |
| Rückruffunktion (Callback) | `js/app.js:198` | Eine Funktion, die wir der Karte übergeben und die sie später aufruft. | JS |
| `document.createElement`, `appendChild` | `js/app.js:185`, `js/app.js:188` | Erzeugt ein neues Element und hängt es in die Seite ein. | JS |
| `textContent` | `js/app.js:77` | Setzt reinen Text in ein Element (ohne HTML). | JS |
| `innerHTML` | `js/steckbrief.js:396` | Ersetzt den Inhalt durch HTML-Text; fremde Texte müssen vorher maskiert werden. | JS |
| `classList` | `js/app.js:195` | Fügt Klassen hinzu oder entfernt sie; das Aussehen steht im CSS. | JS |
| `element.hidden` | `js/app.js:120` | Schaltet das HTML-Attribut `hidden` aus JavaScript. | JS |
| `focus()` | `js/app.js:89` | Setzt den Tastaturfokus auf ein Element. | JS |
| `window.matchMedia` | `js/app.js:67` | Prüft in JavaScript eine Media Query, zum Beispiel ob der Bildschirm schmal ist. | JS |
| `new Date()` | `js/filter.js:56` | Aktuelles Datum und Uhrzeit des Rechners. | JS |
| `Math.round`, `Math.floor`, `%` | `js/filter.js:60`, `js/oeffnungszeiten.js:43` | Runden und Rest der Division: 14:44 wird 14:30; der Tag vor Montag ist Sonntag. | JS |
| `for ... in` | `js/filter.js:201` | Läuft über alle Namen (Schlüssel) eines Objekts. | JS |
| `Object.keys(...).length` | `js/filter.js:172` | Zahl der Schlüssel eines Objekts, hier die Zahl gefärbter Quadrate. | JS |
| Bedingungsoperator `? :` | `js/filter.js:102` | Kurzform von if/else, die einen Wert liefert. | JS |
| `null` | `js/oeffnungszeiten.js:83` | „kein Wert“: Bei unbekannten Öffnungszeiten liefert `isOpen()` weder ja noch nein. | JS |
| `setAttribute` | `js/filter.js:154` | Setzt ein HTML-Attribut, hier den vorgelesenen Wert „14:30 Uhr“. | JS |
| `push` und `join` | `js/oeffnungszeiten.js:123`, `js/oeffnungszeiten.js:125` | Hängt einen Wert an ein Array an bzw. setzt ein Array zu einem Text zusammen. | JS |
| `sort` mit Vergleichsfunktion | `js/steckbrief.js:140` | Sortiert eine Kopie der Liste; die Funktion sagt, welcher von zwei Orten zuerst kommt. | JS |
| Maskieren mit `replace` und regulärem Ausdruck | `js/steckbrief.js:83` | Ersetzt `&`, `<`, `>` und Anführungszeichen durch Entitäten, damit Text nicht als HTML gilt. | JS |
| Ereignis-Delegation, `closest()` | `js/steckbrief.js:537` | Ein einziger Klick-Listener für den ganzen Steckbrief; `closest` findet den geklickten Knopf. | JS |
| Modul-Objekt `window.Filter` | `js/filter.js:295` | Nur diese Funktionen sind von außen sichtbar; die anderen bleiben im Skript. | JS |

## Fragen, die der Dozent stellen könnte

1. **Was passiert genau, wenn ich auf ein Quadrat klicke?**
   Die Karte meldet den Code an `app.js`. Dort wird er in die Adresse geschrieben (`#O3`). Das löst das Ereignis `hashchange` aus, und `openBlock()` lässt das Gebäude wachsen (`Karte.waehlen`) und füllt den Steckbrief (`Steckbrief.show`). Weil der Code in der Adresse steht, funktionieren Links wie `index.html#G1` und die Zurück-Taste.

2. **Wie kommt die Farbe eines Quadrats zustande?**
   `filter.js` zählt für die gewählte Kategorie, wie viele Orte des Quadrats zum gewählten Tag und zur Uhrzeit geöffnet haben. Aus der Zahl wird eine Stufe (1, 2–3, 4–6, 7+), aus der Stufe eine Farbe aus `window.KATEGORIEN`. `Karte.faerben()` bekommt ein Objekt wie `{ "G2": "#D23F27" }` und färbt die Gebäude.

3. **Was sieht jemand ohne JavaScript?**
   Alle Teile, die JavaScript brauchen, haben im HTML das Attribut `hidden`. In `#karte` steht ein Standbild der Karte, und `<noscript>` erklärt, dass Filter und Steckbrief JavaScript brauchen; das Verzeichnis der Quadrate funktioniert ganz ohne. Das ist unsere Version V1.

4. **Warum stehen die Skripte am Ende und nicht als Module, und warum lädt ihr die Daten nicht mit `fetch`?**
   Die Seite soll auch per Doppelklick (Adresse `file://`) laufen. Dort verbieten Browser `fetch` auf lokale Dateien und ES-Module. Deshalb sind die Daten JavaScript-Dateien, die globale Variablen wie `window.ORTE` setzen, und die Skripte werden in fester Reihenfolge am Ende von `<body>` geladen, wenn alle Elemente schon existieren.

5. **Warum `rem` und nicht `px`, und wie passt sich die Seite an das Handy an?**
   `rem` bezieht sich auf die Grundschrift des Browsers. Wer die Schrift vergrößert, bekommt die ganze Seite größer. Media Queries wie `@media (min-width: 48rem)` schalten ab einer Breite andere Regeln ein; die Filterleiste ist eine Flexbox mit Umbruch, auf dem Handy rutschen die Gruppen untereinander, und die Karte lässt sich zur Seite wischen.
