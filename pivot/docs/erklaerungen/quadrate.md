# Quadrate: das Verzeichnis `quadrate.html`

Erklärung für die Präsentation. Zeilennummern erzeugt am 2026-09-29 11:54 aus den aktuellen Dateien; sie gelten in beiden Varianten (`web/variante-svg` und `web/variante-css3d`), denn diese Seite ist dort gleich.

**Vorschlag für die Präsentation:** Matti Katila (Inhalte und Anforderungen), zusammen mit [daten.md](daten.md) (woher Orte und Texte kommen). Die ganze Aufteilung für alle fünf steht in [README.md](README.md) unter „Vorschlag: wer präsentiert was“.

## Was die Seite zeigt und warum

Das Verzeichnis listet **alle 146 Quadrate in einer Tabelle**: 144 Quadrate von A1 bis U6 und die beiden Teilblöcke M3a und M4a. Je Zeile stehen die Lage (links oder rechts der Kurpfalzstraße), die Art (Gebäude, Platz, Park …) und wie viele Orte es zum Essen, Trinken, für Kultur und zum Shoppen gibt. Jede Zeile hat einen Link „Auf der Karte“, der die Startseite mit diesem Quadrat öffnet.

Warum so:

- Die Tabelle ist ein Pflicht-Element aus der Team-Übung 2 (Vorlesung 3) und zugleich die Alternative zur Karte: Sie funktioniert ohne JavaScript, auf jedem Handy und mit Screenreadern.
- Die Seite zeigt zwei Arten von Ankern (Vorlesung 3): Sprünge innerhalb der Seite (`#q-G1`) und Links auf eine Stelle einer anderen Seite (`index.html#G1`).
- Mit JavaScript (V2) kommen Sortieren per Klick auf eine Spaltenüberschrift und ein Suchfeld dazu.

## So führst du die Seite vor

1. In der Sprungliste „Zu einer Reihe springen“ auf **O** klicken: Die Seite springt zur Zeile O1, die Zeile ist hellgelb markiert (`:target`).
2. Die Spaltenüberschrift **Essen** anklicken: Die Tabelle sortiert nach den meisten Restaurants; noch ein Klick kehrt die Reihenfolge um. Die Statuszeile sagt, wonach sortiert ist.
3. Ins Suchfeld **markt** tippen: nur noch G1 (Marktplatz) bleibt stehen.
4. In einer Zeile auf **Auf der Karte** klicken: Die Startseite öffnet dieses Quadrat (`index.html#G1`).
5. Beim Scrollen durch die Tabelle bleibt die Kopfzeile oben stehen, auf dem Handy auch die erste Spalte links.

## Aufbau des Quelltexts

### Beteiligte Dateien

| Datei | Aufgabe | Version |
|---|---|---|
| `quadrate.html` | die fertige Tabelle als reines HTML, erzeugt von `tools/export_verzeichnis.py` | V1 |
| `css/style.css`, Abschnitt 13 | Aussehen aller Tabellen der Website: Rahmen, feste Kopfzeile, Zahlen, markierte Zeile, Sortierknöpfe | V1, V2 |
| `css/verzeichnis.css` | nur diese Seite: Sprungliste, Suchzeile, feste erste Spalte | V1, V2 |
| `js/verzeichnis.js` | Sortieren und Suchen in den Zeilen, die schon in der Seite stehen | V2 |
| `tools/export_verzeichnis.py` (Projektordner, nicht Teil der Website) | liest `js/data/quadrate.js` und `js/data/orte.js`, zählt die Orte und schreibt `quadrate.html` | Werkzeug |

### `quadrate.html` von oben nach unten

1. Kopfkommentar `quadrate.html:5`: Die Datei wird erzeugt und nicht von Hand bearbeitet. Nach einer Datenänderung läuft `python3 tools/export_verzeichnis.py`.
2. `<head>` mit `style.css` und `verzeichnis.css` `quadrate.html:26`; Kopfbereich und Navigation wie auf allen Seiten, hier mit `aria-current="page"` bei „Quadrate“ `quadrate.html:41`.
3. Einleitung `quadrate.html:54` und ein Absatz, wie die Buchstaben und Zahlen verteilt sind `quadrate.html:59`.
4. Sprungliste `quadrate.html:63`: 20 Links, einer je Reihe, zum Beispiel `href="#q-G1"` `quadrate.html:75`.
5. Suchfeld und Statuszeile `quadrate.html:101`, mit `hidden` versteckt, weil sie nur mit JavaScript funktionieren.
6. Quellenhinweis zu OpenStreetMap `quadrate.html:110`.
7. Der scrollbare Kasten um die Tabelle `quadrate.html:112` und die Tabelle selbst `quadrate.html:113`: Beschriftung `<caption>`, Kopfzeile `<thead>` `quadrate.html:116`, Tabellenkörper `<tbody>` `quadrate.html:129` mit 146 Zeilen.
8. Eine Zeile, am Beispiel G1: `<tr id="q-G1">` `quadrate.html:581` ist das Sprungziel; die erste Zelle ist eine Zeilenüberschrift `<th scope="row">`, dann folgen Datenzellen `<td>` und der Link auf die Karte `quadrate.html:590`.
9. Fußzeile und das Skript `js/verzeichnis.js` `quadrate.html:1755`.

### Wie die Tabelle entsteht

Das Werkzeug `tools/export_verzeichnis.py` läuft auf dem Rechner eines Entwicklers, nicht im Browser:

- Es liest die beiden Datendateien `tools/export_verzeichnis.py:193`, zählt die Orte je Quadrat und Kategorie `tools/export_verzeichnis.py:212` und schreibt je Quadrat eine Zeile `tools/export_verzeichnis.py:274` mit dem Anker `id="q-..."` `tools/export_verzeichnis.py:279`.
- Kopf, Navigation und Fußzeile kopiert es aus `docs/_vorlage.html` `tools/export_verzeichnis.py:341`, damit alle Seiten denselben Rahmen haben.

Warum nicht mit JavaScript aus den Daten bauen: Dann wäre die Tabelle ohne JavaScript leer. So steht sie fertig im HTML (Version V1), und die Daten existieren nur einmal.

### Was `js/verzeichnis.js` tut

1. `init()` `js/verzeichnis.js:214` sammelt alle Zeilen mit ihrer ursprünglichen Position `js/verzeichnis.js:220` und die Spaltenüberschriften `js/verzeichnis.js:222`.
2. `createSortButtons()` `js/verzeichnis.js:115` setzt den Text jeder sortierbaren Überschrift (Attribut `data-sort-type`) in einen `<button>`, damit man ihn auch mit der Tastatur bedienen kann.
3. Klick auf einen Knopf: `onSortButton()` `js/verzeichnis.js:97` wählt Spalte und Richtung, `sortRows()` `js/verzeichnis.js:68` sortiert eine Kopie der Liste mit der Vergleichsfunktion `compareItems()` `js/verzeichnis.js:49` und hängt die Zeilen in neuer Reihenfolge wieder an `js/verzeichnis.js:73`.
4. `updateHeadings()` `js/verzeichnis.js:83` setzt `aria-sort` an der sortierten Spalte; daran erkennen Screenreader die Sortierung, und das CSS zeichnet daraus den Pfeil.
5. Suche: Bei jeder Eingabe `js/verzeichnis.js:227` prüft `rowMatches()` `js/verzeichnis.js:147` jede Zeile. Passt sie nicht, bekommt sie `hidden` `js/verzeichnis.js:166`.
6. `updateStatus()` `js/verzeichnis.js:191` schreibt „146 von 146 Quadraten, sortiert nach …“ in die Statuszeile.

Das Skript lädt keine Daten: Es arbeitet nur mit den Zeilen, die schon in der Seite stehen.

## Begriffe aus dem Quelltext

Spalte „Kurs“: **VL3 S.2** = Vorlesung 3, Folie 2. **VL5\*** = im Inhaltsverzeichnis von Vorlesung 4 (Folie 2–3) angekündigt. **JS** = Thema der JavaScript-Vorlesung (VL6). **–** = nicht in den Folien.

### HTML

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `<!DOCTYPE html>`, `<html lang="de">`, `<meta charset>` | `quadrate.html:1`, `quadrate.html:18`, `quadrate.html:20` | Grundgerüst: HTML5-Dokument, Sprache Deutsch, Zeichenkodierung UTF-8 für Umlaute. | VL2 S.3 |
| HTML-Kommentar | `quadrate.html:2` | Hinweis für Entwickler, der im Browser nicht erscheint: Diese Datei wird erzeugt. | VL2 S.5 |
| `<link rel="stylesheet">` | `quadrate.html:25` | Bindet die gemeinsame und die seiteneigene CSS-Datei ein. | VL4 S.11 |
| `<nav>` mit `aria-labelledby` | `quadrate.html:63` | Ein Navigationsbereich, dessen Name die Überschrift „Zu einer Reihe springen“ ist. | VL2 S.8 |
| Anker auf derselben Seite | `quadrate.html:69` | `href="#q-A1"` springt zu dem Element mit `id="q-A1"` `quadrate.html:130`. | VL3 S.2 |
| Anker auf einer anderen Seite | `quadrate.html:139` | `index.html#A1` öffnet die Startseite, dort liest `js/app.js` den Teil nach `#` und öffnet das Quadrat. | VL3 S.2 |
| `<span class="visually-hidden">` | `quadrate.html:69` | Text nur für Screenreader: Sie hören „Reihe A“, sehen muss man nur „A“. | – |
| Attribut `hidden` | `quadrate.html:101` | Versteckt Suchfeld und Statuszeile, bis `verzeichnis.js` sie einblendet. | – |
| `<label>`, `<input type="search">` | `quadrate.html:103`, `quadrate.html:105` | Suchfeld mit Beschriftung; `type="search"` zeigt auf manchen Geräten ein Löschkreuz. | VL3 S.2 |
| `aria-describedby` | `quadrate.html:105` | Verknüpft das Feld mit dem Hinweistext darüber, damit Screenreader ihn mit vorlesen. | – |
| `role="status"` | `quadrate.html:107` | Screenreader lesen jede Änderung der Statuszeile vor. | – |
| `<table>` | `quadrate.html:113` | Die Tabelle selbst. | VL3 S.2 |
| `<caption>` | `quadrate.html:114` | Überschrift der Tabelle, gehört fest zu ihr. | – |
| `<thead>` und `<tbody>` | `quadrate.html:116`, `quadrate.html:129` | Kopfteil und Datenteil der Tabelle; so kann CSS die Kopfzeile oben festhalten. | – |
| `<tr>` | `quadrate.html:130` | Eine Tabellenzeile (table row). | VL3 S.2 |
| `<th scope="col">` | `quadrate.html:118` | Überschriftzelle einer Spalte; `scope="col"` sagt, für welche Zellen sie gilt. | VL3 S.2 |
| `<th scope="row">` | `quadrate.html:131` | Überschriftzelle einer Zeile: Der Code benennt die ganze Zeile. | VL3 S.2 |
| `<td>` | `quadrate.html:132` | Datenzelle (table data). Auf der Folie steht dafür versehentlich `<th>`. | VL3 S.2 |
| Datenattribut `data-sort-type` | `quadrate.html:121` | Eigenes Attribut mit `data-`: sagt dem Skript, ob eine Spalte nach Zahl oder Text sortiert wird. | – |
| `role="region"` und `tabindex="0"` | `quadrate.html:112` | Der scrollbare Kasten wird ein benannter Bereich und mit der Tab-Taste erreichbar, damit man ihn mit den Pfeiltasten scrollen kann. | – |
| `<script src>` | `quadrate.html:1755` | Lädt das Skript für Sortieren und Suchen am Ende der Seite. | JS |

### CSS

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `@charset` und Kopfkommentar | `css/verzeichnis.css:1` | Erste Zeile jeder CSS-Datei, danach ein Kommentar mit Zweck und Inhaltsverzeichnis. | VL4 S.10–11 |
| Flexbox mit Umbruch | `css/verzeichnis.css:47` | Die zwei Gruppen der Sprungliste stehen nebeneinander, wenn Platz ist, sonst untereinander (`flex-wrap: wrap`). | VL3 S.3 |
| `.block-code` als Kachel | `css/verzeichnis.css:76` | Jeder Buchstabe ist ein kleiner dunkler Block wie auf der Karte, mindestens 44 px groß zum Tippen. | – |
| `overflow-x: auto` | `css/style.css:1387` | Ist die Tabelle breiter als der Bildschirm, scrollt nur ihr Kasten zur Seite. | – |
| Einheit `vh` | `css/style.css:1394` | Prozent der Fensterhöhe: Der Kasten wird höchstens drei Viertel so hoch wie das Fenster. | VL4 S.9 |
| `border-collapse: collapse` | `css/style.css:1405` | Nachbarzellen teilen sich eine Linie statt zwei. | – |
| `position: sticky` (Kopfzeile) | `css/style.css:1431` | Die Kopfzeile scrollt mit, bis sie oben anstößt, und bleibt dann stehen. | – |
| `position: sticky` (erste Spalte) | `css/verzeichnis.css:181` | Beim seitlichen Scrollen bleibt die Spalte mit dem Code links stehen. | – |
| `z-index` | `css/verzeichnis.css:199` | Legt die Eckzelle über Kopfzeile und erste Spalte, die ebenfalls festkleben. | – |
| `:hover` auf Zeilen, `rgba()` | `css/style.css:1444` | Die Zeile unter der Maus wird halbdurchsichtig sandfarben (Deckkraft 0.45). | VL4 S.14, S.24 |
| `:last-child` | `css/style.css:1448` | Die Zellen der letzten Zeile brauchen keine Linie darunter. | – |
| `:target` | `css/style.css:1464` | Die Zeile, zu der ein Anker gesprungen ist, wird hellgelb. | – |
| `scroll-margin-top` | `css/style.css:1412` | Die angesprungene Zeile hält Abstand nach oben und verschwindet nicht unter der festen Kopfzeile. | – |
| `text-align: right` für Zahlen | `css/style.css:1453` | Zahlen stehen rechtsbündig in der Code-Schrift, damit die Ziffern untereinander stehen. | VL4 S.22 |
| `font-variant-numeric: tabular-nums` | `css/style.css:1407` | Alle Ziffern sind gleich breit. | – |
| Pseudoelement `::after` mit Bild | `css/style.css:1498` | Erzeugt den kleinen Sortierpfeil; das Bild ist eine SVG-Grafik direkt im CSS (data-URL). | VL5\* |
| Attributselektor `[aria-sort="ascending"]` | `css/style.css:1506` | Der Pfeil hängt vom Attribut ab, das das Skript setzt: oben dunkel = aufsteigend. | – |
| `linear-gradient` über Hintergrund | `css/verzeichnis.css:206` | Legt die halbdurchsichtige Hover-Farbe über das Papierweiß der festen Spalte. | VL5\* |
| `white-space: nowrap` | `css/verzeichnis.css:174` | „Lage“ und „Auf der Karte“ brechen nicht um. | – |
| `@media print` | `css/verzeichnis.css:221` | Beim Drucken verschwinden Sprungliste und Suche. | VL4 S.6 |

### JavaScript

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Funktion, die sich sofort aufruft, `"use strict"` | `js/verzeichnis.js:15` | Alle Variablen bleiben in diesem Skript; der strenge Modus meldet Tippfehler. | JS |
| `getElementById`, `querySelector` | `js/verzeichnis.js:22`, `js/verzeichnis.js:26` | Holt Elemente aus dem DOM (der Seite als Baum von Objekten) über id bzw. CSS-Selektor. | JS |
| Array von Objekten | `js/verzeichnis.js:220` | Je Zeile ein Objekt mit der Zeile und ihrer ursprünglichen Position, gesammelt in einem Array. | JS |
| `tBodies`, `rows`, `cells` | `js/verzeichnis.js:218`, `js/verzeichnis.js:37` | Tabellen haben im DOM fertige Listen ihrer Teile: Körper, Zeilen, Zellen. | JS |
| `getAttribute` | `js/verzeichnis.js:38` | Liest den Wert eines HTML-Attributs. | JS |
| `Number()` | `js/verzeichnis.js:39` | Macht aus dem Text „12“ die Zahl 12, damit 12 nach 9 kommt und nicht davor. | JS |
| `typeof` | `js/verzeichnis.js:53` | Fragt den Typ eines Werts ab: Zahl oder Text. | JS |
| `localeCompare` mit `numeric` | `js/verzeichnis.js:56` | Vergleicht Texte nach deutscher Ordnung und liest Zahlen im Text als Zahlen: L2 vor L10. | JS |
| `sort()` mit Vergleichsfunktion | `js/verzeichnis.js:70` | Sortiert die Liste; `compareItems` sagt für zwei Zeilen, welche zuerst kommt (negativ, 0, positiv). | JS |
| `slice()` | `js/verzeichnis.js:69` | Macht eine Kopie des Arrays, damit die ursprüngliche Reihenfolge erhalten bleibt. | JS |
| `appendChild` verschiebt | `js/verzeichnis.js:73` | Hängt eine schon vorhandene Zeile ans Ende; so entsteht die neue Reihenfolge ohne neue Elemente. | JS |
| `setAttribute` / `removeAttribute` | `js/verzeichnis.js:86` | Setzt bzw. entfernt ein Attribut, hier `aria-sort`. | JS |
| `createElement`, `className` | `js/verzeichnis.js:121` | Erzeugt einen neuen Knopf und gibt ihm eine CSS-Klasse. | JS |
| `while`-Schleife | `js/verzeichnis.js:124` | Wiederholt, solange die Bedingung gilt: verschiebt alles aus der Überschrift in den Knopf. | JS |
| `addEventListener("click")` und `bind` | `js/verzeichnis.js:130` | Meldet die Funktion für Klicks an; `bind` merkt sich die Spaltennummer für genau diesen Knopf. | JS |
| Ereignis `input` | `js/verzeichnis.js:227` | Feuert bei jedem Tastendruck im Suchfeld. | JS |
| regulärer Ausdruck | `js/verzeichnis.js:138` | `/\s+/g` findet alle Leerzeichen; so wird aus „G 1“ „g1“. | JS |
| `indexOf` | `js/verzeichnis.js:152` | Position eines Textes in einem anderen; 0 heißt „fängt damit an“, -1 heißt „kommt nicht vor“. | JS |
| `element.hidden` | `js/verzeichnis.js:166` | Versteckt Zeilen, die nicht zur Suche passen; `!` kehrt wahr und falsch um. | JS |
| `closest()` | `js/verzeichnis.js:179` | Sucht vom geklickten Element aus nach oben das nächste `a`. | JS |
| `textContent` | `js/verzeichnis.js:207` | Schreibt reinen Text in die Statuszeile. | JS |
| `scrollTop` | `js/verzeichnis.js:79` | Scrollt den Tabellenkasten nach einer Sortierung wieder ganz nach oben. | JS |

## Fragen, die der Dozent stellen könnte

1. **Was ist der Unterschied zwischen `<th>` und `<td>`, und wozu `scope`?**
   `<th>` ist eine Überschriftzelle, `<td>` eine Datenzelle. `scope="col"` sagt, dass die Überschrift für die Spalte darunter gilt, `scope="row"` bei der ersten Zelle jeder Zeile, dass der Code die ganze Zeile benennt. Screenreader lesen dann zu jeder Zahl Spalte und Quadrat vor.

2. **Wie funktioniert der Sprung zu einer Reihe, und wie der Link auf die Karte?**
   Jede Zeile hat eine id wie `q-G1`. Ein Link mit `href="#q-G1"` springt dorthin, und CSS färbt die angesprungene Zeile über `:target`. Der Link `index.html#G1` führt auf eine andere Seite; dort gibt es kein Element mit `id="G1"`, sondern `js/app.js` liest den Teil nach `#` und öffnet das Quadrat.

3. **Wie sortiert ihr die Tabelle?**
   Das Skript sammelt beim Start alle `<tr>` in einem Array. Beim Klick sortiert es eine Kopie mit `sort()` und einer Vergleichsfunktion (Zahlen als Zahlen, Texte mit `localeCompare`), dann hängt es die Zeilen mit `appendChild` in der neuen Reihenfolge wieder in den Tabellenkörper. `aria-sort` an der Überschrift zeigt die Richtung.

4. **Warum wird die Tabelle mit einem Python-Werkzeug erzeugt und nicht von Hand oder mit JavaScript?**
   146 Zeilen von Hand abzuschreiben wäre fehleranfällig, und die Zahlen ändern sich mit jedem neuen Datenstand. Mit JavaScript gebaut wäre die Tabelle ohne JavaScript leer. Das Werkzeug schreibt einmal fertiges HTML, das auch in Version V1 funktioniert.

5. **Wie bleibt die Kopfzeile beim Scrollen sichtbar?**
   Der Kasten um die Tabelle hat eine Höhe von höchstens 75 % des Fensters (`75vh`) und scrollt selbst. Die Kopfzellen haben `position: sticky; top: 0`: Sie bewegen sich mit, bis sie oben anstoßen, und bleiben dann stehen. Auf dem Handy klebt genauso die erste Spalte links.
