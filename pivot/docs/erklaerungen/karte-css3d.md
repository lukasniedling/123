# Die Karte der CSS-3D-Variante

Erklärung für die Präsentation. Zeilennummern erzeugt am 2026-09-29 11:54. **Alle Fundstellen in diesem Dokument beziehen sich auf den Ordner `web/variante-css3d/`**, denn `js/karte.js`, `css/karte.css` und `js/data/karte-daten.js` sind in der SVG-Variante andere Dateien (siehe [karte-svg.md](karte-svg.md)). Wie die Karte auf der Startseite eingebunden ist, steht in [index.md](index.md).

**Vorschlag für die Präsentation:** Niko Eibach (Programmierung), direkt nach dem JavaScript-Teil der Karte aus [index.md](index.md). Die ganze Aufteilung für alle fünf steht in [README.md](README.md) unter „Vorschlag: wer präsentiert was“.

## Was die Karte zeigt und warum

Die Karte zeigt alle 146 Quadrate aus der Vogelperspektive wie auf dem freigegebenen Referenzbild: dunkelgraue Gebäude mit weißen Kürzeln, die sandfarbenen Achsen Kurpfalzstraße und Planken, Parks, das Schloss unten und der Wasserturm rechts. Die Filter färben ganze Gebäude ein; ein gewähltes Gebäude wird etwa 2,4-mal so hoch, etwas breiter, bekommt gelbe Kanten und leuchtet von unten.

Warum CSS 3D: Diese Variante baut die Karte aus ganz normalen HTML-Elementen (`<div>`), die CSS im Raum dreht und verschiebt. Das ist genau der Kursstoff zu CSS: `perspective`, `transform`, `transition`. **Der Browser rechnet das 3D selbst**: Er kippt eine Bodenplatte, stellt Wände auf, hebt Dächer an und entscheidet, was vorne liegt. JavaScript erzeugt nur die Elemente und schreibt Zahlen in CSS-Variablen; die Animation beim Wachsen macht allein CSS mit `transition`.

## So führst du die Karte vor

1. Ein Gebäude anklicken: Es wächst weich in die Höhe (450 ms), das vorher gewählte sinkt gleichzeitig zurück.
2. Die Kategorie wechseln: Die Farben der Gebäude gehen in 300 ms weich über (`transition` auf der Farbe).
3. Mit der Tab-Taste durch die Karte gehen: Das Kürzel des fokussierten Quadrats bekommt einen weißen Rahmen, die Dachkante wird weiß; Eingabetaste wählt.
4. Im Browser mit den Entwicklerwerkzeugen (Web Inspector, Vorlesung 4) ein `div.map-wall` auswählen und bei `transform` die Werte ändern: Man sieht direkt, wie die Wand gedreht ist.

## Aufbau des Quelltexts

### Beteiligte Dateien

| Datei | Aufgabe |
|---|---|
| `js/data/karte-daten.js` | Zahlen der Karte (`window.KARTE_DATEN`): Bühne, Kamera, Bodenplatte, je Quadrat Dach, Wände, Kürzel und Wachstum; erzeugt von `tools/export_karte_css3d.py` |
| `js/karte.js` | erzeugt die HTML-Elemente, schreibt die Zahlen in CSS-Variablen, reagiert auf Maus und Tastatur; stellt `window.Karte` bereit |
| `css/karte.css` | macht aus den Elementen das 3D-Bild: Perspektive, Kippung, Wände, Dächer, Farben, Auswahl, Animation |
| `img/boden.svg` | der Boden von oben: Straßen, Achsen, Parks, Wasser, gemalte Bäume und Straßennamen |
| `img/wasserturm.svg`, `img/karte/baum.svg`, `img/karte/schloss-dach.svg` | Bilder für Wasserturm, Bäume und das Schlossdach |
| `karte-test.html` | Testseite für Entwickler; nicht Teil der Website |
| `tools/export_karte_css3d.py` (Projektordner) | rechnet Kippwinkel, Perspektive und alle Formen so aus, dass der Browser genau das Referenzbild erzeugt |

### Der Aufbau der Elemente

```
div#karte.map-root
  div.map-scroll          Rahmen, scrollt auf schmalen Bildschirmen zur Seite
    div.map-sizer         hat die Größe der verkleinerten Bühne
      div.map-stage       die Bühne, 1600 × 1066 px, mit perspective
        div.map-plane     die Bodenplatte, mit rotateX gekippt
          div.map-palace  das Schloss
          div.map-block   ein Quadrat (146-mal), fokussierbar
            div.map-pool  Lichtfleck am Boden
            div.map-part  ein Gebäudeteil
              div.map-wall   (je sichtbarer Wand)
              div.map-roof   Dach, angehoben
                div.map-roof-edge, div.map-roof-surface, span.map-code
          div.map-tree, img.map-landmark
```

`init()` `js/karte.js:319` baut diesen Baum mit `createChild()` `js/karte.js:50`: erst Rahmen, Bühne und Platte `js/karte.js:336`, dann das Schloss, dann in einer Schleife alle Quadrate in der Reihenfolge A1 … U6 `js/karte.js:342`, zuletzt Bäume und Wasserturm.

### Wie das 3D entsteht

1. **Die Bühne** `.map-stage` `css/karte.css:61` hat eine `perspective` `css/karte.css:70`: So weit ist das Auge von der Bühne entfernt. Alles, was in der Tiefe liegt, wird dadurch kleiner. `perspective-origin` `css/karte.css:71` legt fest, wohin das Auge schaut.
2. **Die Bodenplatte** `.map-plane` `css/karte.css:78` wird mit `rotateX()` nach hinten gekippt `css/karte.css:87` (etwa 46 Grad): Unten liegt das Schloss, hinten der Norden der Stadt. `transform-style: preserve-3d` `css/karte.css:89` sorgt dafür, dass alles auf der Platte seine eigene Lage im Raum behält und nicht flach auf die Platte gedrückt wird.
3. **Wände** `.map-wall` `css/karte.css:133`: Jede Wand ist ein `div` auf dem Boden, so lang wie eine Kante des Grundrisses. `rotateZ` dreht es entlang der Kante, `rotateX(-90deg)` stellt es senkrecht auf, `scaleY` macht es beim Wachsen höher `css/karte.css:137`. Weil `transform-origin` die untere linke Ecke ist `css/karte.css:136`, bleibt die Unterkante auf dem Boden. JavaScript setzt Lage, Länge, Winkel und Schatten jeder Wand `js/karte.js:104`.
4. **Dächer** `.map-roof` `css/karte.css:162` werden mit `translateZ()` auf Wandhöhe angehoben `css/karte.css:164`. Die Form des Grundrisses kommt aus `clip-path: polygon(...)` `css/karte.css:177`: Das Rechteck wird auf den Umriss des Blocks zugeschnitten. Eine etwas kleinere Form für die Dachfläche lässt eine helle Kante stehen `css/karte.css:188`.
5. **Schatten**: Wände, die nach Norden oder Osten zeigen, sind dunkler. Das macht ein halbdurchsichtiges Schwarz über der Wandfarbe `css/karte.css:142`; die Stärke `--shade` kommt aus den Daten. So funktioniert es mit jeder Kategoriefarbe.
6. **Kürzel** `.map-code` `css/karte.css:200`: Eine Matrix aus den Daten hebt Kippung und Perspektive an dieser Stelle wieder auf `css/karte.css:203`, damit die Schrift aufrecht und unverzerrt aussieht.
7. **Offene Plätze** (G1, O1, B3, H6, M4a) sind flach; ihr Name steht auf einem Schild, das wie eine Wand senkrecht steht `css/karte.css:230`, damit das Gebäude dahinter es nicht verdeckt.
8. **Wände, die vom Betrachter weg zeigen**, gibt es gar nicht: Das Werkzeug exportiert nur sichtbare Wände `tools/export_karte_css3d.py:284`.

Die Zahlen für Kippung und Perspektive berechnet `tools/export_karte_css3d.py` `tools/export_karte_css3d.py:111` so, dass der Browser jeden Punkt genau dorthin rechnet, wo er im Referenzbild liegt; `check_projection()` `tools/export_karte_css3d.py:180` bricht ab, wenn das nicht auf 0,05 Pixel stimmt. `setDimensions()` `js/karte.js:244` schreibt diese Zahlen als CSS-Variablen an die Bühne (`--tilt`, `--perspective` …).

### Färben, Wählen, Hover, Fokus

- **Färben**: `Karte.faerben()` `js/karte.js:368` setzt je Quadrat die Variable `--tint` und die Klasse `is-tinted` `js/karte.js:375`. In CSS übernehmen Dach und Wände diese Farbe über ihre Variablen `css/karte.css:280`. Auf hellen Farben wird das Kürzel dunkel (Klasse `is-tinted-light`) `js/karte.js:309`.
- **Wählen**: `Karte.waehlen()` `js/karte.js:390` setzt nur die Klasse `is-selected` und `aria-current`. Den Rest macht CSS: Die Klasse ändert `--height-factor` auf `--grow-factor` (2,4) `css/karte.css:312`, dadurch ändern sich `scaleY` der Wände und `translateZ` des Dachs, und `transition` `css/karte.css:127` macht daraus eine weiche Bewegung von 450 ms. Das Gebäude wird außerdem etwas breiter `css/karte.css:317`, die Wände bekommen gelbe Kanten `css/karte.css:328`, Licht an der Wand und Lichtfleck am Boden werden sichtbar `css/karte.css:331`.
- **Hover**: `:hover` hellt die Dachfläche auf `css/karte.css:301`.
- **Fokus**: Jedes Quadrat ist ein `div` mit `tabindex="0"` und `role="button"` `js/karte.js:169`; `:focus-visible` rahmt das Kürzel ein `css/karte.css:342`. Beim Fokus scrollt das Skript das Dach in den sichtbaren Bereich `js/karte.js:198`.

### An die Breite anpassen

Die Bühne ist immer 1600 px breit und wird als Ganzes verkleinert: `fitToFrame()` `js/karte.js:274` rechnet den Maßstab aus der Breite des Rahmens (mindestens 0,5) und setzt `--scale`; CSS verkleinert mit `transform: scale(var(--scale, 1))` `css/karte.css:73`. Weil ein `transform` den Platz im Layout nicht ändert, bekommt `div.map-sizer` die verkleinerte Größe. Ein `ResizeObserver` `js/karte.js:353` ruft `fitToFrame()` auf, sobald sich die Breite ändert. Deshalb rechnet diese Datei absichtlich in `px` `css/karte.css:20`: Alle Maße müssen genau zur Geometrie passen.

## Begriffe aus dem Quelltext

Spalte „Kurs“: **VL4 S.9** = Vorlesung 4, Folie 9. **VL5\*** = im Inhaltsverzeichnis von Vorlesung 4 (Folie 2–3) angekündigt. **JS** = Thema der JavaScript-Vorlesung (VL6). **–** = nicht in den Folien.

### CSS

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Custom Properties der Karte | `css/karte.css:25` | Alle Farben und Zeiten der Karte stehen einmal oben als Variablen, zum Beispiel `--map-roof`. | – |
| `var(--x, Ersatz)` | `css/karte.css:37` | Nimmt die Dauer aus `style.css`, oder 450 ms, falls es die Variable nicht gibt (Testseite). | – |
| `cubic-bezier()` | `css/karte.css:38` | Eine Kurve für den Verlauf einer Animation: schnell los, weich ankommen. | – |
| `perspective` | `css/karte.css:70` | Abstand des Auges von der Bühne; macht Entferntes kleiner und erzeugt so Tiefe. | – |
| `perspective-origin` | `css/karte.css:71` | Der Punkt, auf den das Auge schaut. | – |
| `transform: scale()` | `css/karte.css:73` | Vergrößert oder verkleinert ein Element; hier die ganze Karte auf die Breite der Seite. | – |
| `transform-origin` | `css/karte.css:74` | Der Punkt, um den gedreht oder skaliert wird; hier die linke obere Ecke. | – |
| `rotateX()` | `css/karte.css:87` | Dreht um die waagrechte Achse: Die Bodenplatte kippt nach hinten. | VL4 S.9 (deg) |
| `transform-style: preserve-3d` | `css/karte.css:89` | Die Kinder behalten ihre eigene Lage im Raum, statt flach auf das Elternelement gedrückt zu werden. | – |
| mehrere Transformationen | `css/karte.css:137` | Werden von rechts nach links auf das Element angewendet: wachsen, aufstellen, entlang der Kante drehen. | – |
| `backface-visibility: hidden` | `css/karte.css:138` | Die Rückseite einer Wand wird nicht gezeichnet. | – |
| `translateZ()` mit `calc()` | `css/karte.css:164` | Hebt das Dach auf Wandhöhe mal Wachstumsfaktor. | – |
| `transition` | `css/karte.css:127` | Ändert sich `transform`, zeigt der Browser den Übergang als Bewegung statt als Sprung. | – |
| `clip-path: polygon()` | `css/karte.css:177` | Schneidet ein Element auf eine Vieleck-Form zu; so bekommt das Dach den Umriss des Blocks. | – |
| `linear-gradient` mit `rgba` | `css/karte.css:142` | Ein halbdurchsichtiges Schwarz über der Wandfarbe dunkelt die Wand ab. | VL4 S.14, VL5\* |
| `radial-gradient` | `css/karte.css:273` | Kreisförmiger Verlauf für den gelben Lichtfleck unter dem gewählten Gebäude. | VL5\* |
| Pseudoelement `::after` | `css/karte.css:150` | Eine zusätzliche Fläche auf jeder Wand für das warme Licht von unten, zuerst unsichtbar (`opacity: 0`). | VL5\* |
| `inset: 0` | `css/karte.css:153` | Kurz für `top`, `right`, `bottom`, `left` gleich 0: füllt das Elternelement ganz aus. | – |
| `position: absolute` | `css/karte.css:97` | Jedes Teil wird mit `left` und `top` genau auf der Platte platziert. | – |
| `pointer-events` | `css/karte.css:91` | Boden, Bäume und Wasserturm lassen Klicks durch; nur die Quadrate reagieren. | – |
| Variablen überschreiben | `css/karte.css:281` | Die Klasse `is-tinted` setzt nur die Variablen neu; alle Regeln, die sie benutzen, bekommen die Kategoriefarbe. | – |
| zwei Klassen zugleich | `css/karte.css:311` | `.a.b` gilt nur für Elemente mit beiden Klassen. | – |
| `:hover` | `css/karte.css:301` | Maus über dem Quadrat: Die Dachfläche wird heller. | VL4 S.24 |
| `:focus-visible` und `outline` | `css/karte.css:342` | Bei Tastaturbedienung bekommt das Kürzel einen weißen Rahmen. | – |
| `:not()` | `css/karte.css:355` | Die weiße Dachkante gibt es nur, wenn das Quadrat nicht schon gewählt (gelb) ist. | – |
| `box-shadow: inset` | `css/karte.css:328` | Innenschatten als gelber Rahmen auf den Wänden des gewählten Gebäudes. | VL5\* |
| `text-shadow` | `css/karte.css:251` | Ein weicher Rand um die Schrift, damit Namen auf Pflaster und Rasen lesbar bleiben. | – |
| `border-radius` und `rotate` | `css/karte.css:384` | Drei runde Ecken und eine spitze, um 45 Grad gedreht: der Kopf der Stecknadel. | VL5\* |
| Hintergrundbild | `css/karte.css:84` | Die Bodenplatte zeigt das Bild `boden.svg`, auf die Größe der Platte gestreckt. | VL5\* |
| Einheit `px` mit Absicht | `css/karte.css:20` | Die Karte ist eine feste Zeichnung, die als Ganzes skaliert wird; der Rest der Website nutzt `rem`. | VL4 S.9 |
| `@media (prefers-reduced-motion)` | `css/karte.css:445` | Bei „weniger Bewegung“ springen die Zustände sofort um. | – |

### JavaScript

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Funktion, die sich sofort aufruft | `js/karte.js:20` | Alle Variablen bleiben im Modul; nur `window.Karte` ist von außen sichtbar. | JS |
| `document.createElement`, `className`, `appendChild` | `js/karte.js:51`, `js/karte.js:52`, `js/karte.js:53` | Erzeugt ein neues Element, gibt ihm eine CSS-Klasse und hängt es in die Seite. | JS |
| `element.style.left` | `js/karte.js:59` | Setzt eine CSS-Eigenschaft direkt am Element, hier die Lage auf der Platte. | JS |
| `style.setProperty("--name")` | `js/karte.js:109` | Setzt eine CSS-Variable am Element; `css/karte.css` benutzt sie im `transform`. | JS |
| `clip-path` aus JavaScript | `js/karte.js:71` | Schreibt die Umrissform als `polygon(...)` in eine Variable. | JS |
| `style.transformOrigin` | `js/karte.js:117` | Der Mittelpunkt, um den ein Gebäudeteil beim Wählen breiter wird. | JS |
| `setAttribute` | `js/karte.js:168` | Setzt HTML-Attribute: `data-code`, `tabindex`, `role`, `aria-label`. | JS |
| `textContent` | `js/karte.js:134` | Schreibt das Kürzel als reinen Text in das Element. | JS |
| Array `join` | `js/karte.js:138` | Setzt die vier Zahlen der Matrix zu einem Text zusammen. | JS |
| Ereignisse je Element | `js/karte.js:184` | Jedes Quadrat hat eigene Listener für Klick, Tasten, Fokus und Maus; die Funktion merkt sich ihr `block` (Closure). | JS |
| `keydown`, `event.key` | `js/karte.js:188` | Eingabe- oder Leertaste wählt das Quadrat. | JS |
| `event.preventDefault()` | `js/karte.js:189` | Verhindert, dass die Leertaste die Seite scrollt. | JS |
| `focus`, `scrollIntoView` | `js/karte.js:198` | Holt das Dach des fokussierten Quadrats in den sichtbaren Bereich. | JS |
| `mouseenter`, `mouseleave` | `js/karte.js:201` | Maus kommt über das Quadrat bzw. verlässt es; die Seite kann darauf reagieren (`onHover`). | JS |
| `for ... in` über ein Objekt | `js/karte.js:268` | Schreibt alle Einträge des Objekts `values` als CSS-Variablen an die Bühne. | JS |
| `clientWidth`, `Math.max` | `js/karte.js:279` | Breite des Rahmens geteilt durch 1600, aber nie kleiner als 0,5. | JS |
| `ResizeObserver` | `js/karte.js:353` | Meldet, wenn ein Element seine Größe ändert; dann wird die Karte neu skaliert. | JS |
| `classList.add` / `remove` / `toggle` | `js/karte.js:376` | Schaltet Klassen; das Aussehen dazu steht in `css/karte.css`. | JS |
| `removeProperty` | `js/karte.js:378` | Entfernt eine CSS-Variable wieder; das Quadrat bekommt seine Grundfarbe zurück. | JS |
| `parseInt(..., 16)` | `js/karte.js:299` | Liest zwei Hex-Ziffern einer Farbe als Zahl von 0 bis 255. | VL4 S.13 |
| `aria-current` | `js/karte.js:404` | Markiert das gewählte Quadrat für Screenreader als „aktuell“. | – |
| `remove()` | `js/karte.js:424` | Entfernt ein Element aus der Seite, hier alte Stecknadeln. | JS |
| Modul-Objekt | `js/karte.js:453` | Dieselben fünf Funktionen wie in der SVG-Variante: `init`, `faerben`, `waehlen`, `markieren`, `codes`. | JS |

### Daten

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `window.KARTE_DATEN` | `js/data/karte-daten.js:9` | Eine globale Variable mit allen Zahlen; die erste Zeile enthält Bühne, Kamera und Platte. | JS |
| ein Quadrat | `js/data/karte-daten.js:10` | Je Quadrat eine Zeile: Teile mit `box` (Lage), `aussen`/`innen` (Umriss), `waende`, `skala` (Wachstum), `schrift`, `matrix`. | JS |
| ein offener Platz | `js/data/karte-daten.js:16` | Plätze haben statt Gebäudeteilen einen Rand, ein Schild und eine Farbe für den Schein um die Schrift. | JS |
| Lizenz im Kopfkommentar | `js/data/karte-daten.js:5` | Die Datei ist aus OpenStreetMap abgeleitet und steht deshalb unter der ODbL. | – |

## Fragen, die der Dozent stellen könnte

1. **Wie entsteht mit CSS ein 3D-Bild?**
   Die Bühne bekommt eine `perspective`, also einen Abstand zum Auge. Darin wird die Bodenplatte mit `rotateX()` nach hinten gekippt. Mit `transform-style: preserve-3d` behalten alle Kinder ihre Lage im Raum: Wände sind `div`s, die mit `rotateX(-90deg)` senkrecht aufgestellt werden, Dächer werden mit `translateZ()` angehoben. Der Browser rechnet daraus die Perspektive und entscheidet selbst, was vorne liegt.

2. **Wie wächst ein gewähltes Gebäude, gibt es dafür eine JavaScript-Animation?**
   Nein. JavaScript setzt nur die Klasse `is-selected`. In CSS ändert diese Klasse die Variable `--height-factor` von 1 auf 2,4. Dadurch ändern sich `scaleY` der Wände und `translateZ` des Dachs, und weil `transition: transform 450ms` gesetzt ist, zeigt der Browser das als weiche Bewegung. Entfernt man die Klasse, läuft dieselbe Bewegung rückwärts.

3. **Warum ist die Schrift auf den Dächern nicht verzerrt, obwohl die Platte gekippt ist?**
   Das Werkzeug hat für jedes Dach eine kleine Matrix berechnet, die Kippung und Perspektive an dieser Stelle genau aufhebt. Sie steht in `--label-matrix` und wird zuerst im `transform` des Kürzels angewendet. Namen offener Plätze stehen auf Schildern, die mit `rotateX(-90deg)` senkrecht stehen.

4. **Warum rechnet diese Datei in `px`, wenn ihr sonst `rem` benutzt?**
   Die Karte ist eine feste Zeichnung von 1600 × 1066 Pixeln, deren Maße genau zur Geometrie aus den Daten passen müssen. Sie wird als Ganzes mit `transform: scale()` auf die Breite der Seite gebracht; ein `ResizeObserver` passt den Maßstab an, wenn sich die Breite ändert. Schrift in `rem` würde nicht mehr auf die Dächer passen, wenn jemand die Grundschrift vergrößert.

5. **Wie färbt ihr ein Gebäude in der Kategoriefarbe?**
   `Karte.faerben()` schreibt die Farbe als CSS-Variable `--tint` an das Quadrat und setzt die Klasse `is-tinted`. Diese Klasse setzt `--block-roof` und `--block-wall` auf `var(--tint)`, und weil Dach und Wände ihre Farbe aus diesen Variablen holen, werden alle Teile auf einmal umgefärbt. Die Abdunklung der Wände ist ein halbdurchsichtiges Schwarz darüber, deshalb passt sie zu jeder Farbe. Bei hellen Farben wird das Kürzel dunkel (`is-tinted-light`).
