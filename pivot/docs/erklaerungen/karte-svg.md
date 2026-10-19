# Die Karte der SVG-Variante

Erklärung für die Präsentation. Zeilennummern erzeugt am 2026-09-29 11:54. **Alle Fundstellen in diesem Dokument beziehen sich auf den Ordner `web/variante-svg/`**, denn `js/karte.js`, `css/karte.css` und `js/data/karte-daten.js` sind in der CSS-3D-Variante andere Dateien (siehe [karte-css3d.md](karte-css3d.md)). Wie die Karte auf der Startseite eingebunden ist, steht in [index.md](index.md).

**Vorschlag für die Präsentation:** Die Gruppe zeigt die CSS-3D-Variante ([karte-css3d.md](karte-css3d.md)). Dieses Dokument braucht nur, wer den Vergleich der beiden Wege zeigen will; dann erklärt ihn Niko Eibach (Programmierung). Die ganze Aufteilung für alle fünf steht in [README.md](README.md) unter „Vorschlag: wer präsentiert was“.

## Was die Karte zeigt und warum

Die Karte zeigt alle 146 Quadrate aus der Vogelperspektive, so wie auf dem freigegebenen Referenzbild: dunkelgraue Gebäude mit weißen Kürzeln, sandfarbene Achsen (Kurpfalzstraße und Planken), grüne Parks, das Schloss unten und der Wasserturm rechts. Die Filter färben ganze Gebäude ein; ein gewähltes Gebäude wächst in 450 ms auf etwa die doppelte Höhe, bekommt gelbe Kanten und leuchtet von unten.

Warum SVG: SVG (Scalable Vector Graphics) ist eine Grafik aus Formen (Polygone, Text), die der Browser wie HTML-Elemente behandelt. Jede Form lässt sich mit JavaScript umfärben, anklicken und verändern, und die Karte bleibt auf jedem Bildschirm scharf. Diese Variante sieht dem Referenzbild am ähnlichsten, weil sie dieselben Formen benutzt, aus denen das Bild entstanden ist.

Der Trick: **Der Browser rechnet kein 3D.** Das Werkzeug `tools/export_karte_svg.py` (Projektordner) hat die Kamera und die Perspektive schon vorher berechnet. Es schreibt jede Wand und jedes Dach als fertiges Polygon in Bildschirm-Koordinaten eines 1600 × 1066 Pixel großen Bildes, in der Reihenfolge von hinten nach vorn (was weiter vorn liegt, wird später gemalt und verdeckt das Hintere). Für jedes Gebäude gibt es zwei fertige Formen: „normal“ und „gross“ (gewählt). JavaScript mischt beim Wachsen nur zwischen diesen beiden.

## So führst du die Karte vor

1. Mit der Maus über ein Gebäude fahren: Es wird heller und bekommt einen weißen Rand.
2. Ein Gebäude anklicken: Es wächst weich (450 ms), das vorher gewählte schrumpft gleichzeitig zurück. Straßennamen unter dem großen Gebäude blenden sich aus.
3. Mit der Tab-Taste durch die Karte gehen: Der gestrichelte Fokusrahmen springt in der Reihenfolge A1, A2, … U6, egal wie die Gebäude gemalt sind; Eingabetaste wählt.
4. Auf dem Handy: Die Karte bleibt lesbar breit und lässt sich zur Seite wischen.

## Aufbau des Quelltexts

### Beteiligte Dateien

| Datei | Aufgabe |
|---|---|
| `js/data/karte-daten.js` | alle Formen der Karte als Daten (`window.KARTE_DATEN`), erzeugt von `tools/export_karte_svg.py` |
| `js/karte.js` | baut aus den Daten ein SVG, färbt, animiert, reagiert auf Maus und Tastatur; stellt `window.Karte` bereit |
| `css/karte.css` | Zustände: Hover, Fokus, Auswahl (gelb, Leuchten), Stecknadeln; Scrollen auf dem Handy |
| `karte-test.html` | Testseite für Entwickler mit einem Knopf je Funktion von `window.Karte`; nicht Teil der Website |
| `tools/export_karte_svg.py` (Projektordner) | rechnet die Formen aus OpenStreetMap-Daten mit der Kamera des Referenzbildes (`tools/make_v3.py`) |

### Die Daten `window.KARTE_DATEN`

- Kopfkommentar `js/data/karte-daten.js:3` mit Lizenz: Die Datei ist aus OpenStreetMap abgeleitet und steht unter der ODbL `js/data/karte-daten.js:7`.
- `breite` und `hoehe` `js/data/karte-daten.js:15`: Größe des Bildes, wird zur `viewBox` des SVG.
- `codes` `js/data/karte-daten.js:18`: alle 146 Codes in der Reihenfolge A1 … U6.
- `basis` `js/data/karte-daten.js:19`: fertiger SVG-Text für Boden, Straßen, Achsen, Wasser und Parks.
- `flaechen` `js/data/karte-daten.js:20`: die fünf offenen Quadrate (G1, O1, B3, H6, M4a) mit Umriss und Namen.
- `szene` `js/data/karte-daten.js:27`: von hinten nach vorn alle Gebäudeteile. Jeder Teil hat `normal` und `gross`, jeweils mit `waende` (Liste von Punkten je Wand), `dach` und `text` (Position und Größe des Kürzels), dazu `schatten` (Helligkeit je Wand) und `verdeckt` (welche Beschriftungen er im gewachsenen Zustand verdeckt).
- `oben` und `beschriftung` `js/data/karte-daten.js:228`: Schlossdach und Wasserturm, zuletzt die Straßennamen.

### Wie `js/karte.js` die Karte baut

1. `init()` `js/karte.js:548` holt die Daten und schreibt das ganze SVG auf einmal mit `innerHTML` in den Kasten `#karte` `js/karte.js:557`.
2. `mapMarkup()` `js/karte.js:219` setzt den SVG-Text in Mal-Reihenfolge zusammen: `<svg>` mit `viewBox` `js/karte.js:222`, gemeinsame Definitionen (Verläufe, Leuchtfilter) `js/karte.js:38`, Boden, offene Plätze, Lichtflecken, die Gebäude `js/karte.js:247`, Schlossdach und Wasserturm, Beschriftungen und ganz oben die Fokus-Ebene `js/karte.js:261`.
3. `partMarkup()` `js/karte.js:171` macht aus einem Gebäudeteil eine Gruppe `<g>` mit einem `<polygon>` je Wand, einem für das Dach und einem `<text>` für das Kürzel.
4. `collectElements()` `js/karte.js:267` sucht die fertigen Elemente wieder heraus und legt sie mit ihren Daten im Objekt `byCode` ab, damit später jedes Quadrat schnell gefunden wird.
5. `paint()` `js/karte.js:379` färbt jedes Quadrat, `updateLabel()` `js/karte.js:414` schreibt seinen Namen für Screenreader („Quadrat G2, 9 geöffnet“), `bindEvents()` meldet Maus und Tastatur an.

### Färben

`Karte.faerben()` `js/karte.js:580` merkt sich die Farben und ruft für jedes Quadrat `paint()` auf. Wände werden je nach Himmelsrichtung dunkler gemischt `js/karte.js:394`, damit das Gebäude plastisch bleibt. Das Kürzel wird weiß oder dunkel, je nachdem, was auf der Dachfarbe besser lesbar ist `js/karte.js:117`; dafür rechnet `luminance()` `js/karte.js:106` die Helligkeit nach der Formel der Barrierefreiheits-Richtlinien (WCAG).

### Wachsen (Animation)

1. `Karte.waehlen(code)` `js/karte.js:600` schaltet das alte Quadrat aus und das neue an (`showSelected()` `js/karte.js:419`: Klasse `is-selected`, `aria-current="true"`).
2. `moveTo()` `js/karte.js:446` merkt sich Start und Ziel und bittet den Browser um den nächsten Bildaufbau: `requestAnimationFrame(step)` `js/karte.js:455`.
3. `step()` `js/karte.js:460` läuft bei jedem Bild (etwa 60-mal pro Sekunde): Es rechnet aus, wie viel der 450 ms vergangen ist (`t` von 0 bis 1), macht daraus eine weiche Bewegung (schnell los, sanft ankommen) `js/karte.js:468` und ruft `setGrowth()` auf.
4. `setGrowth()` `js/karte.js:335` mischt jeden Punkt zwischen „normal“ und „gross“ `js/karte.js:139` und schreibt die neuen Punkte in die Polygone `js/karte.js:341`. Licht an der Wand und Lichtfleck am Boden werden dabei eingeblendet.
5. Wer im Betriebssystem „weniger Bewegung“ eingestellt hat, bekommt den Endzustand sofort `js/karte.js:441`.

### Maus, Tastatur, Handy

- Ein einziger Listener auf dem SVG bedient alle Quadrate (Ereignis-Delegation) `js/karte.js:519`; `codeOf()` `js/karte.js:486` findet mit `closest("[data-code]")` das Quadrat zum angeklickten Element.
- Tastatur: Über allen Gebäuden liegt eine unsichtbare Fokus-Ebene `js/karte.js:208` mit einer Gruppe je Quadrat in der Reihenfolge A1 … U6, jede mit `tabindex="0"` und `role="button"` `js/karte.js:212`. Eingabe- und Leertaste wählen `js/karte.js:526`. Mausklicks gehen durch diese Ebene hindurch zu den Gebäuden (`pointer-events: none` am Ring).
- Handy: Unter 48rem bleibt das SVG 48rem breit `css/karte.css:28`, der Rahmen scrollt zur Seite `css/karte.css:11`, und die Karte startet in der Mitte `js/karte.js:573`.

### Die Schnittstelle `window.Karte`

`js/karte.js:645`: `init`, `faerben`, `waehlen`, `markieren` (Stecknadeln, V3) und `codes`. Die CSS-3D-Variante hat genau dieselben Funktionen mit denselben Namen; deshalb funktionieren `app.js`, `filter.js` und `steckbrief.js` mit beiden Karten, ohne dass man dort etwas ändert.

## Begriffe aus dem Quelltext

Spalte „Kurs“: **VL4 S.24** = Vorlesung 4, Folie 24. **JS** = Thema der JavaScript-Vorlesung (VL6). **–** = nicht in den Folien.

### SVG und HTML

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `<svg>` mit `viewBox` | `js/karte.js:222` | Die Zeichenfläche; `viewBox="0 0 1600 1066"` legt ihr Koordinatensystem fest, die Größe auf dem Bildschirm macht CSS. | – |
| `xmlns` | `js/karte.js:222` | Sagt, dass die Elemente zur Sprache SVG gehören. | – |
| `<g>` (Gruppe) | `js/karte.js:172` | Fasst Wände, Dach und Kürzel eines Gebäudes zusammen, damit man sie gemeinsam ansprechen kann. | – |
| `<polygon points>` | `js/karte.js:176` | Vieleck aus einer Liste von Punkten „x,y x,y …“; jede Wand und jedes Dach ist eines. | – |
| `<text>` mit `text-anchor` | `js/karte.js:182` | Text in der Grafik, waagrecht und senkrecht um seinen Punkt zentriert. | – |
| `<defs>` | `js/karte.js:38` | Definitionen, die nicht selbst gemalt werden, sondern von anderen Formen benutzt. | – |
| `<radialGradient>`, `<stop>` | `js/karte.js:39` | Kreisförmiger Farbverlauf für den Lichtfleck; `<stop>` legt Farbe und Deckkraft an einer Stelle fest. | – |
| `<filter>` mit `feGaussianBlur` | `js/karte.js:46` | Filter für das Leuchten: Umriss verbreitern, weichzeichnen, gelb färben, unter das Gebäude legen. | – |
| `<path d>` und `<circle>` | `js/karte.js:34` | Die Stecknadel: ein Pfad aus Kurven (`C`) und Bogen (`A`), dazu ein Kreis. | – |
| `transform="translate()"` | `js/karte.js:199` | Verschiebt eine Gruppe, hier die Stecknadel an ihre Stelle. | – |
| `data-code` | `js/karte.js:172` | Eigenes Attribut, in dem der Code des Quadrats steht; daran erkennt das Skript, was angeklickt wurde. | – |
| `aria-hidden="true"` | `js/karte.js:173` | Die gemalten Gebäude sind für Screenreader unsichtbar; sie hören die Fokus-Ebene. | – |
| `tabindex="0"`, `role="button"` | `js/karte.js:212` | Macht jedes Quadrat mit der Tab-Taste erreichbar und sagt, dass es sich wie ein Knopf bedienen lässt. | – |
| `aria-label` | `js/karte.js:415` | Name für Screenreader, zum Beispiel „Quadrat G1, Marktplatz, 3 geöffnet“. | – |
| `aria-current="true"` | `js/karte.js:432` | Markiert das gewählte Quadrat; Screenreader sagen „aktuell“. | – |

### JavaScript

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Funktion, die sich sofort aufruft | `js/karte.js:19` | Alle Variablen bleiben im Modul; nur `window.Karte` ist von außen sichtbar. | JS |
| Konstanten | `js/karte.js:24` | Feste Einstellungen in Großbuchstaben, zum Beispiel die Dauer der Animation. | JS |
| Objekt als Nachschlagetabelle | `js/karte.js:58` | Zu jedem Code ein Objekt mit allen Teilen des Quadrats; `byCode["G1"]` findet es sofort. | JS |
| Text zusammensetzen | `js/karte.js:224`, `js/karte.js:263` | Teile werden in einem Array gesammelt und am Ende zu einem Text verbunden. | JS |
| `innerHTML` | `js/karte.js:557` | Setzt den ganzen SVG-Text auf einmal in die Seite; sicher, weil er nur aus unserer Datendatei stammt. | JS |
| `querySelectorAll` | `js/karte.js:285` | Holt alle Elemente, die zu einem CSS-Selektor passen. | JS |
| `typeof` | `js/karte.js:244` | Unterscheidet in der Szene fertigen SVG-Text (Bäume) von Gebäudeteilen (Objekte). | JS |
| `parseInt(..., 16)` und `toString(16)` | `js/karte.js:76`, `js/karte.js:83` | Rechnet Hexwerte in Zahlen um und zurück: „d8“ ist 216. | VL4 S.13 |
| `Math.min`, `Math.max`, `Math.pow` | `js/karte.js:111` | Rechenfunktionen, hier für die Helligkeit einer Farbe. | JS |
| `toFixed(1)` | `js/karte.js:141` | Rundet auf eine Nachkommastelle und macht Text daraus. | JS |
| Mischen zweier Werte | `js/karte.js:139` | Bei t = 0 kommt a heraus, bei t = 1 b, dazwischen ein Punkt auf der Strecke (lineare Interpolation). | – |
| `setAttribute` | `js/karte.js:398` | Setzt ein Attribut, hier die Füllfarbe des Dachs. | JS |
| `style.opacity` | `js/karte.js:359` | Setzt die Deckkraft direkt am Element (0 unsichtbar, 1 voll). | JS |
| `style.setProperty("--ring")` | `js/karte.js:410` | Setzt eine CSS-Variable an einem Element; `css/karte.css` färbt damit den Fokusrahmen. | JS |
| `classList.toggle(name, bedingung)` | `js/karte.js:401` | Setzt die Klasse, wenn die Bedingung wahr ist, sonst entfernt es sie. | JS |
| `requestAnimationFrame` | `js/karte.js:455` | Bittet den Browser, `step` vor dem nächsten Bildaufbau aufzurufen: flüssige Animation im Takt des Bildschirms. | JS |
| `performance.now()` | `js/karte.js:452` | Genaue Zeit in Millisekunden; daraus folgt, wie weit die Animation ist. | JS |
| Easing | `js/karte.js:468` | Macht aus gleichmäßiger Zeit eine Bewegung, die schnell beginnt und sanft endet. | – |
| `matchMedia` | `js/karte.js:442` | Fragt ab, ob jemand im System „weniger Bewegung“ eingestellt hat. | JS |
| Ereignis-Delegation, `closest` | `js/karte.js:487` | Ein Listener für alle Quadrate; `closest` findet vom angeklickten Polygon aus die Gruppe mit `data-code`. | JS |
| Ereignisse `click`, `keydown` | `js/karte.js:519`, `js/karte.js:525` | Klick mit der Maus bzw. Taste gedrückt. | JS |
| `pointerover`, `pointerleave`, `pointerType` | `js/karte.js:535` | Zeiger kommt über ein Element bzw. verlässt die Karte; bei Fingern (`touch`) gibt es kein Hover. | JS |
| `event.preventDefault()` | `js/karte.js:531` | Verhindert, dass die Leertaste die Seite scrollt. | JS |
| Rückruffunktion `onSelect` | `js/karte.js:495` | Die Karte meldet der Seite (`app.js`), welches Quadrat gewählt wurde und ob per Tastatur. | JS |
| `for ... in` | `js/karte.js:564` | Läuft über alle Codes im Objekt `byCode`. | JS |
| `scrollLeft` | `js/karte.js:573` | Scrollt den Rahmen so, dass auf dem Handy die Mitte der Stadt zu sehen ist. | JS |

### CSS (`css/karte.css`)

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `overflow-x: auto` | `css/karte.css:12` | Ist die Karte breiter als der Bildschirm, scrollt ihr Rahmen zur Seite. | – |
| `max-width: none` | `css/karte.css:21` | Hebt die Regel aus `style.css` auf, dass Grafiken nie breiter als ihr Kasten sind. | – |
| `user-select: none` mit Präfix | `css/karte.css:23`, `css/karte.css:24` | Ein Doppelklick markiert die Kürzel nicht als Text; Safari braucht noch die Vorsilbe. | VL4 S.10 |
| Media Query | `css/karte.css:28` | Unter 48rem bleibt die Karte 48rem breit, damit die Kürzel lesbar bleiben. | VL4 S.4 |
| `pointer-events` | `css/karte.css:37`, `css/karte.css:94` | Deko (Boden, Bäume, Schrift) lässt Klicks durch; offene Plätze fangen Klicks, auch wenn sie durchsichtig sind. | – |
| `fill: url(#...)` | `css/karte.css:62` | Füllt eine Form mit dem Verlauf aus den `<defs>` des SVG. | – |
| `fill-opacity` | `css/karte.css:92` | Die Kategoriefarbe liegt halbdurchsichtig über einem offenen Platz. | – |
| `transition` mit Ersatzwert | `css/karte.css:77` | Blendet den Lichtfleck weich ein; `var(--x, 450ms)` nimmt 450 ms, wenn die Variable fehlt. | – |
| Klasse als Zustand | `css/karte.css:111` | Zwei Klassen ohne Leerzeichen: gilt nur für Elemente, die beide haben. | – |
| `filter: url(#map-glow)` | `css/karte.css:112` | Wendet den SVG-Leuchtfilter auf das gewählte Gebäude an. | – |
| `stroke`, `stroke-width` | `css/karte.css:116` | Farbe und Stärke der Kanten: gelb beim gewählten Gebäude; CSS schlägt die SVG-Attribute. | – |
| `:focus-visible` | `css/karte.css:147` | Den Fokusrahmen gibt es nur bei Tastaturbedienung. | – |
| `stroke-dasharray` | `css/karte.css:150` | Macht die Linie gestrichelt: 6 Einheiten Strich, 3 Lücke. | – |
| `outline: none` mit Ersatz | `css/karte.css:135` | Der Standardrahmen des Browsers wird ersetzt durch den gestrichelten Ring. | – |
| `display: none` / `inline` | `css/karte.css:160` | Stecknadeln sind versteckt, bis `Karte.markieren()` die Klasse `is-shown` setzt. | – |
| `@media (prefers-reduced-motion)` | `css/karte.css:84` | Bei „weniger Bewegung“ keine Überblendung. | – |

## Fragen, die der Dozent stellen könnte

1. **Wo kommt das 3D her? Rechnet der Browser das?**
   Nein. Das Python-Werkzeug `tools/export_karte_svg.py` hat die Kamera schon vorher angewendet und jede sichtbare Wand und jedes Dach als flaches Polygon in Bildschirm-Koordinaten gespeichert, sortiert von hinten nach vorn. Der Browser malt nur diese Polygone in dieser Reihenfolge, das vordere verdeckt das hintere. Die dunkleren Wände (`schatten`) lassen es plastisch wirken.

2. **Wie wächst ein Gebäude beim Anklicken?**
   Für jedes Gebäude gibt es zwei fertige Formen mit gleich vielen Punkten: „normal“ und „gross“. `requestAnimationFrame` ruft 450 ms lang bei jedem Bildaufbau `step()` auf; daraus ergibt sich ein Wert t zwischen 0 und 1, der mit einer Easing-Formel weicher gemacht wird. `setGrowth()` rechnet jeden Punkt als Mischung beider Formen aus und setzt ihn mit `setAttribute("points", ...)`.

3. **Wie färbt ihr die Quadrate, und wie bleibt das Kürzel lesbar?**
   `Karte.faerben({ "G2": "#D23F27" })` setzt die Farbe als `fill` der Wände und des Dachs; jede Wand wird dabei nach ihrer Richtung etwas dunkler gemischt. Für das Kürzel rechnet das Skript die Helligkeit der Dachfarbe nach der WCAG-Formel aus und nimmt Weiß oder Dunkelgrau, je nachdem, was mehr Kontrast hat.

4. **Wie bedient man die Karte ohne Maus?**
   Über allen Gebäuden liegt eine unsichtbare Ebene mit einer Gruppe je Quadrat in der Reihenfolge A1 bis U6, jede mit `tabindex="0"`, `role="button"` und einem Namen (`aria-label`). Die Tab-Taste geht so in einer sinnvollen Reihenfolge durch die Karte, auch wenn die Gebäude von hinten nach vorn gemalt sind. Eingabe- oder Leertaste wählt, der gestrichelte Rahmen zeigt den Fokus.

5. **Ist `innerHTML` hier nicht gefährlich?**
   Gefährlich ist `innerHTML` mit Text, den jemand von außen eingeben kann, weil darin HTML oder Skripte stecken könnten. Der SVG-Text kommt aber nur aus unserer eigenen Datendatei `karte-daten.js`, nie von Besuchern. Im Steckbrief, wo Namen aus OpenStreetMap vorkommen, maskieren wir sie vorher mit `escapeHtml()`.
