# Die Karte der CSS-3D-Variante

Erklärung für die Präsentation der Endversion, Version 5 (`final-v5/`, Kopie von `final-v3/`, aufbauend auf `final-v2/`). Zeilennummern erzeugt am 2026-10-07 14:25, geprüft und korrigiert am 2026-10-13 aus den Dateien in `final-v3/`. Wie die Karte auf der Startseite eingebunden ist, steht in [index.md](index.md).

**Vorschlag für die Präsentation:** Niko Eibach (Programmierung), direkt nach dem JavaScript-Teil der Karte aus [index.md](index.md). Die ganze Aufteilung für alle fünf steht in [README.md](README.md) unter „Vorschlag: wer präsentiert was“.

## Was die Karte zeigt und warum

Die Karte zeigt alle 146 Quadrate aus der Vogelperspektive: am Tag weiße Gebäude mit dunklen Kürzeln, die Achsen Kurpfalzstraße und Planken, Parks, das Schloss unten und der Wasserturm rechts (Osten). Je nach gewählter Uhrzeit ändert sich die Stimmung: Sonnenaufgang, Tag, Sonnenuntergang, Nacht. Die Filter färben ganze Gebäude ein; ein gewähltes Gebäude wird etwa 2,4-mal so hoch, etwas breiter, bekommt gelbe Kanten und leuchtet von unten.

Warum CSS 3D: Diese Variante baut die Karte aus ganz normalen HTML-Elementen (`<div>`), die CSS im Raum dreht und verschiebt. Das ist genau der Kursstoff zu CSS: `perspective`, `transform`, `transition`. **Der Browser rechnet das 3D selbst**: Er kippt eine Bodenplatte, stellt Wände auf, hebt Dächer an und entscheidet, was vorne liegt. JavaScript erzeugt nur die Elemente und schreibt Zahlen in CSS-Variablen; die Animation beim Wachsen macht allein CSS mit `transition`.

## So führst du die Karte vor

0. Den Schieberegler langsam von 12 Uhr bis 23 Uhr ziehen: Um 19 Uhr geht links (Westen) die Sonne unter, um 21 Uhr wird es Nacht mit Mond, Fenstern und Laternen. Jeder Wechsel gleitet in knapp einer Sekunde weich über. Danach auf 7 Uhr: Rechts (Osten) geht die Sonne auf.

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
| `img/boden.svg` | der Boden von oben: Straßen, Achsen, Parks, Wasser, gemalte Bäume und Straßennamen (Vorlage) |
| `img/boden-tag.svg`, `boden-aufgang.svg`, `boden-untergang.svg`, `boden-nacht.svg` | derselbe Boden in den Farben der vier Stimmungen; nachts mit Straßenlaternen auf Ring, Planken und Kurpfalzstraße; erzeugt von `tools/stimmungen.py` |
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

`init()` `js/karte.js:414` baut diesen Baum mit `createChild()` `js/karte.js:95`: erst Rahmen, Bühne und Platte `js/karte.js:408`, dann das Schloss, dann in einer Schleife alle Quadrate in der Reihenfolge A1 … U6 `js/karte.js:414`, zuletzt Bäume und Wasserturm.

### Wie das 3D entsteht

1. **Die Bühne** `.map-stage` `css/karte.css:71` hat eine `perspective` `css/karte.css:80`: So weit ist das Auge von der Bühne entfernt. Alles, was in der Tiefe liegt, wird dadurch kleiner. `perspective-origin` `css/karte.css:81` legt fest, wohin das Auge schaut.
2. **Die Bodenplatte** `.map-plane` `css/karte.css:88` wird mit `rotateX()` nach hinten gekippt `css/karte.css:93` (etwa 46 Grad): Unten liegt das Schloss, hinten der Norden der Stadt. `transform-style: preserve-3d` `css/karte.css:99` sorgt dafür, dass alles auf der Platte seine eigene Lage im Raum behält und nicht flach auf die Platte gedrückt wird.
3. **Wände** `.map-wall` `css/karte.css:143`: Jede Wand ist ein `div` auf dem Boden, so lang wie eine Kante des Grundrisses. `rotateZ` dreht es entlang der Kante, `rotateX(-90deg)` stellt es senkrecht auf, `scaleY` macht es beim Wachsen höher `css/karte.css:143`. Weil `transform-origin` die untere linke Ecke ist `css/karte.css:142`, bleibt die Unterkante auf dem Boden. JavaScript setzt Lage, Länge, Winkel und Schatten jeder Wand `js/karte.js:148`.
4. **Dächer** `.map-roof` `css/karte.css:190` werden mit `translateZ()` auf Wandhöhe angehoben `css/karte.css:171`. Die Form des Grundrisses kommt aus `clip-path: polygon(...)` `css/karte.css:205`: Das Rechteck wird auf den Umriss des Blocks zugeschnitten. Eine etwas kleinere Form für die Dachfläche lässt eine helle Kante stehen `css/karte.css:195`.
5. **Licht und Schatten**: Wände, die von der Sonne (oder nachts vom Mond) weg zeigen, sind dunkler. Das macht ein halbdurchsichtiges Schwarz über der Wandfarbe `css/karte.css:157`; Wände, die zur Sonne zeigen, bekommen zusätzlich etwas Sonnenfarbe `css/karte.css:158`. Beides sind Schatten nach innen (`box-shadow: inset`), die die ganze Wand füllen. Die Werte `--shade` und `--sun` rechnet `Karte.stimmung()` für jede Wand aus (siehe „Tageszeit-Stimmungen“). So funktioniert es mit jeder Kategoriefarbe.
6. **Kürzel** `.map-code` `css/karte.css:225`: Eine Matrix aus den Daten hebt Kippung und Perspektive an dieser Stelle wieder auf `css/karte.css:209`, damit die Schrift aufrecht und unverzerrt aussieht.
7. **Offene Plätze** (G1, O1, B3, H6, M4a) sind flach; ihr Name steht auf einem Schild, das wie eine Wand senkrecht steht `css/karte.css:234`, damit das Gebäude dahinter es nicht verdeckt.
8. **Wände, die vom Betrachter weg zeigen**, gibt es gar nicht: Das Werkzeug exportiert nur sichtbare Wände `tools/export_karte_css3d.py:284`.

Die Zahlen für Kippung und Perspektive berechnet `tools/export_karte_css3d.py` `tools/export_karte_css3d.py:111` so, dass der Browser jeden Punkt genau dorthin rechnet, wo er im Referenzbild liegt; `check_projection()` `tools/export_karte_css3d.py:180` bricht ab, wenn das nicht auf 0,05 Pixel stimmt. `setDimensions()` `js/karte.js:339` schreibt diese Zahlen als CSS-Variablen an die Bühne (`--tilt`, `--perspective` …).

### Färben, Wählen, Hover, Fokus

- **Färben**: `Karte.faerben()` `js/karte.js:484` setzt je Quadrat die Variable `--tint` und die Klasse `is-tinted` `js/karte.js:491`. In CSS übernehmen Dach und Wände diese Farbe über ihre Variablen `css/karte.css:314`. Auf hellen Farben wird das Kürzel dunkel (Klasse `is-tinted-light`) `js/karte.js:379`.
- **Wählen**: `Karte.waehlen()` `js/karte.js:506` setzt nur die Klasse `is-selected` und `aria-current`. Den Rest macht CSS: Die Klasse ändert `--height-factor` auf `--grow-factor` (2,4) `css/karte.css:321`, dadurch ändern sich `scaleY` der Wände und `translateZ` des Dachs, und `transition` `css/karte.css:137` macht daraus eine weiche Bewegung von 450 ms. Das Gebäude wird außerdem etwas breiter `css/karte.css:326`, die Wände bekommen gelbe Kanten `css/karte.css:337`, Licht an der Wand und Lichtfleck am Boden werden sichtbar `css/karte.css:340`.
- **Hover**: `:hover` hellt die Dachfläche auf `css/karte.css:310`.
- **Fokus**: Jedes Quadrat ist ein `div` mit `tabindex="0"` und `role="button"` `js/karte.js:234`; `:focus-visible` rahmt das Kürzel ein `css/karte.css:351`. Beim Fokus scrollt das Skript das Dach in den sichtbaren Bereich `js/karte.js:245`.

### Tageszeit-Stimmungen

`js/filter.js` ruft bei jeder Änderung der Uhrzeit `Karte.tageszeit(minuten)` auf `js/karte.js:734` (siehe [index.md](index.md)). Bis zum 13.10.2026 gab es vier feste Stimmungen, und die Karte schaltete zwischen ihnen um. Seit dem 14.10.2026 (final-v5) **mischt** sie die vier Stimmungen Minute für Minute. So wird die Stadt abends stetig dunkler, statt plötzlich von Weiß auf Schwarz zu springen.

1. **Schlüsselbilder:** `KEYFRAMES` `js/karte.js:82` legt fest, wann eine Stimmung ganz da ist:
   - 4:30 Nacht,
   - 6:30 Sonnenaufgang,
   - 8:30 Tag,
   - 17:30 noch Tag,
   - 19:30 Sonnenuntergang,
   - 21:30 Nacht.

   Jeder Wechsel dauert 2 Stunden, morgens wie abends, damit die Stadt immer gleich schnell heller oder dunkler wird.

   `weightsAt()` `js/karte.js:675` sucht die zwei Schlüsselbilder um die Uhrzeit herum und mischt sie. Um 20:30 zum Beispiel ist es halb Sonnenuntergang, halb Nacht. Gemischt wird gleichmäßig (linear) `js/karte.js:682`: Jede Viertelstunde verändert das Bild um gleich viel. Eine Kurve, die weich anfängt und weich endet, hatten wir zuerst. Bei ihr sah die Mitte jedes Wechsels aber wie ein Sprung aus.
2. **Farben mischen:** Die Farben der vier Stimmungen stehen in `PALETTES` `js/karte.js:72`. `mixColour()` `js/karte.js:697` rechnet Rot, Grün und Blau mit den Anteilen zusammen. `tageszeit()` schreibt das Ergebnis als CSS-Variablen an die Karte (`--map-roof`, `--map-wall`, `--map-ground` …) `js/karte.js:775`, und alle Regeln in `css/karte.css` benutzen diese Variablen.

   Die Schrift auf den Dächern wird nicht gemischt, denn Grau auf Grau wäre unlesbar. Sie ist dunkel auf hellen Dächern und hell auf dunklen `js/karte.js:780`.
3. **Himmel und Boden:** Ein Farbverlauf kann nicht in einen anderen gleiten. Deshalb hat jede Stimmung eine eigene Ebene:
   - für den Himmel `.mood-layer`, angelegt von `createMoodLayers()` `js/karte.js:108`,
   - seit dem 14.10.2026 auch für den Boden `.map-ground-layer` `js/karte.js:439`.

   Jede Ebene kommt beim Anlegen in die Liste `layers` (mit dem Namen ihrer Stimmung) `js/karte.js:110`. `tageszeit()` gibt jeder Ebene ihre Deckkraft direkt: so viel, wie ihre Stimmung gerade stark ist (`setOpacity()` `js/karte.js:712`, Aufruf `js/karte.js:758`).

   **Überblenden ohne Rand (zweite Runde am 14.10.2026):** Himmel- und Bodenbilder sind undurchsichtig und liegen übereinander. Bekommt jede Ebene einfach ihren Anteil, stimmt die Mischung nicht: Um 20:30 (halb Sonnenuntergang, halb Nacht) lag die Nacht mit 0,5 über dem Sonnenuntergang mit 0,5, und darunter schimmerte die Farbe der Platte durch. Die Platte sah dann etwas anders aus als der Boden um sie herum, und ihr Umriss war als Rechteck zu sehen. Jetzt bekommt eine Ebene ihren Anteil geteilt durch die Summe der Anteile von sich und den Ebenen darunter `js/karte.js:750`: der Sonnenuntergang 0,5 / 0,5 = 1, die Nacht darüber 0,5 / 1 = 0,5. Zusammen ist das genau halb und halb. Welche Ebenen so zusammengehören, steht beim Anlegen im Feld `group` (`"sky"`, `"ground"`) `js/karte.js:108`. Mit `transition: opacity` blendet jede Ebene weich über `css/karte.css:552`. Vor dem ersten Aufruf ist nur der Tag sichtbar `css/karte.css:545`, `css/karte.css:567`.
4. **Sonne, Mond, Sterne:** Auf der Karte ist **rechts Osten und links Westen**.
   - Die Sonne wandert von 6 Uhr rechts bis 21:30 Uhr links. Mittags steht sie am höchsten, denn ihre Höhe folgt einem Sinusbogen `js/karte.js:764`. Bewegt wird sie mit `transform: translate(...)` `js/karte.js:765`, nicht mit `left` und `top`: Eine Verschiebung mit `transform` kann die Grafikkarte allein machen.
   - Es gibt drei Sonnen am selben Ort: gelbweiß für den Tag `css/karte.css:599`, orange für den Morgen und rot für den Abend `css/karte.css:604`. Jede ist so sichtbar wie ihre Stimmung, deshalb wechselt die Farbe der Sonne weich.
   - Mond und Sterne kommen mit dem Anteil der Nacht; sie stehen mit der Stimmung „nacht“ in der Liste `layers` `js/karte.js:322`, `js/karte.js:332`. Der Mond ist ein Kreis aus drei radialen Verläufen `css/karte.css:609`. Die Sterne sind viele kleine Schatten eines 2-Pixel-Punkts `css/karte.css:623`.
5. **Licht je Wand:** Für jede Stimmung steht in `LIGHT` die Richtung zur Sonne oder zum Mond `js/karte.js:62`.
   - Seit dem 14.10.2026 werden auch die Lichtrichtungen gemischt: `tageszeit()` addiert die Richtungen der Stimmungen mit ihren Anteilen `js/karte.js:804` und gibt das Ergebnis an `shadeWalls()` `js/karte.js:624`. So wandert das Licht von einer Seite zur anderen, statt umzuspringen. Das geschieht nur, wenn sich der auf eine Stelle gerundete Wert geändert hat `js/karte.js:809`: Die 368 Wände sind der teuerste Teil der Karte.
   - `stimmung()` setzt nur noch die Klasse der stärksten Stimmung `js/karte.js:797`. Ein paar Regeln brauchen sie noch, zum Beispiel für die Namen der Plätze.
   - Die Außenseite einer Wand zeigt in Richtung (−sin Winkel, cos Winkel). Das Skalarprodukt mit der Lichtrichtung ist 1, wenn die Wand genau zur Sonne zeigt, und 0 oder weniger, wenn sie abgewandt ist. Daraus werden `--sun` und `--shade`.
   - Jede Wand hat zwei durchsichtige Schatten-Schichten nach innen (`box-shadow: inset`): Schwarz für den Schatten, Sonnenfarbe für das Licht `css/karte.css:157`.
   - Bei einem Aufruf von `stimmung()` von außen und bei einem großen Sprung der Uhrzeit (mehr als 2 Stunden, zum Beispiel von Mittag auf Nacht `js/karte.js:739`) setzt `glideOnce()` kurz die Klasse `map-root--wechsel` `js/karte.js:582`. Dann gleiten alle Teile einmal 1,4 s lang `css/karte.css:736`.
6. **Nacht und Dämmerung:**
   - Die Fenster sind das kleine Bild `img/fenster.svg`, wiederholt über jede Wand (`::before`) `css/karte.css:167`. Jede Wand beginnt ihre Fenster an einer anderen Stelle (`--win-x`) `js/karte.js:173`.
   - Die Deckkraft der Fenster ist `--w-lights` `css/karte.css:691`, gesetzt in `js/karte.js:788`. Schon in der Abenddämmerung geht ein Teil der Lichter an, nachts alle.
   - Einen zusätzlichen dunkelblauen Schleier über der Karte (`.map-dusk` mit `mix-blend-mode`) gab es kurz. Er ist wieder entfernt: Die Farben werden ohnehin selbst dunkler, und der Browser zeigte manchmal die Kanten der Fläche als Viereck.
   - **Das Rechteck bei Nacht:** Die Lichtebene `.map-light` (nachts ein dunkler Rand um die Stadt) lag in der 3D-Bühne. Der Browser hat sie mit der gekippten Bodenplatte in der Tiefe sortiert, und wo die Platte näher kam, hörte der dunkle Rand mit einer harten Kante auf. Seit dem 14.10.2026 liegt die Ebene im flachen Kasten um die Bühne (`map-sizer`) `js/karte.js:333`. Der ist genauso groß, wird aber nicht gekippt. In der zweiten Runde ist der Himmelsstreifen `.map-sky` aus demselben Grund dorthin umgezogen `js/karte.js:319`. Damit die Sonne ihren Platz in Bühnen-Pixeln behält, ist er so groß wie die unverkleinerte Bühne und wird wie sie mit `scale(var(--scale))` verkleinert `css/karte.css:517`. Dafür setzt `js/karte.js` die Maße jetzt am `map-sizer`, die Bühne erbt sie `js/karte.js:364`.
   - Der warme Schein am Fuß der Fassaden, die Bäume und der Schein am Wasserturm richten sich nach `--w-nacht` `css/karte.css:696`, gesetzt in `js/karte.js:787`.
7. **Flüssig wie ein Video (überarbeitet am 14.10.2026):**
   - **Gemessen:** Ändert sich eine CSS-Variable an der Karte, muss der Browser alle rund 1500 Teile neu berechnen, weil alle die Variablen erben. Das dauerte bei uns etwa 0,1 s. Bis zum 14.10.2026 glitten außerdem die Farben jedes Teils (`transition: background-color`), und während des Gleitens musste der Browser diese Arbeit in **jedem** Bild wiederholen. Deshalb ruckelte die Karte.
   - **Zwei Arten von Änderung:** Seitdem blenden nur noch wenige große Ebenen über: Himmel, Licht, Boden, die drei Sonnen, Mond und Sterne (Punkt 3 und 4). Für sie ändern sich nur `opacity` und `transform`. Diese zwei Eigenschaften kann die Grafikkarte allein überblenden, ohne die Stadt neu zu berechnen; `will-change` legt jede Ebene dafür auf eine eigene Bildschicht `css/karte.css:555`. Die Häuser selbst bekommen ihre gemischten Farben in kleinen Schritten, ohne zu gleiten `css/karte.css:159`. Nur die Wände des gewählten Quadrats gleiten noch, wegen des gelben Rahmens `css/karte.css:373`.
   - **Tempo:** Der Zeitraffer läuft in Viertelstunden alle 0,3 s. Solange er läuft, setzt `js/filter.js` die Klasse `map-root--play` `js/filter.js:286`. Mit ihr dauert jedes Überblenden genau 0,3 s und läuft gleichmäßig (`linear`) `css/karte.css:747`. Ein Überblenden endet also genau dann, wenn das nächste beginnt. Ohne Zeitraffer dauert es 0,6 s (`--map-colour-duration` `css/karte.css:44`).
   - **Wenig Arbeit pro Schritt:** `tageszeit()` schreibt eine Variable nur, wenn sich ihr (gerundeter) Wert geändert hat (`setVariable()` `js/karte.js:662`). Tagsüber und nachts ändert sich stundenlang nichts. Steckbrief und „Gerade offen“ zeichnet `js/app.js` erst nach dem Zeitraffer neu (`Filter.isPlaying()` `js/app.js:248`).
   - **Warum kein fertiges Video?** Die Idee war: ein vorher gerendertes Video des ganzen Tages, von dem nur das Bild der gewählten Uhrzeit gezeigt wird. Das geht nicht gut, weil die Häuser keine Bilder sind, sondern echte Elemente: Man kann sie anklicken, sie wachsen, wenn man sie wählt, sie bekommen die Farbe der Kategorie und eine Stecknadel. In einem Video wäre das alles festgebrannt, und es müsste genau zur gekippten 3D-Karte passen, bei jeder Breite. Die Lösung oben nimmt die gute Seite der Idee: Die großen Bilder (Himmel und Boden) liegen fertig vor (`img/boden-*.svg`) und werden nur überblendet, wie Einzelbilder eines Videos.
   - **Warum nicht mit `@property`?** Damit könnte man die CSS-Variablen selbst gleiten lassen. Wir hatten es ausprobiert: Auch dann muss der Browser in jedem Bild alle Teile neu berechnen, und es ruckelte.

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Schlüsselbilder (`KEYFRAMES`) | `js/karte.js:82` | Liste von [Minute, Stimmung]. Dazwischen wird gemischt, wie bei einer Animation. | JS |
| Lineare Mischung | `js/karte.js:697` | Farbe = Anteil A × Farbe A + Anteil B × Farbe B, für Rot, Grün und Blau einzeln. | JS |
| `Math.sin()` für den Sonnenbogen | `js/karte.js:764` | Der Sinus geht von 0 über 1 (Mittag) wieder auf 0: Die Sonne steigt und sinkt. | JS |
| `var(--w-nacht, 0)` | `css/karte.css:696` | Eine Variable mit Ersatzwert: Ohne JavaScript gilt 0 (unsichtbar). | – |
| `element.style.opacity` | `js/karte.js:715` | JavaScript setzt die Deckkraft einer Ebene direkt; `transition: opacity` blendet weich über. | JS |
| `will-change` | `css/karte.css:555` | Sagt dem Browser vorher, was sich ändern wird: Er legt die Ebene auf eine eigene Bildschicht der Grafikkarte. | – |

### An die Breite anpassen

Die Bühne ist immer 1600 px breit und wird als Ganzes verkleinert: `fitToFrame()` `js/karte.js:369` rechnet den Maßstab aus der Breite des Rahmens (mindestens 0,5) und setzt `--scale`; CSS verkleinert mit `transform: scale(var(--scale, 1))` `css/karte.css:83`. Weil ein `transform` den Platz im Layout nicht ändert, bekommt `div.map-sizer` die verkleinerte Größe. Ein `ResizeObserver` `js/karte.js:468` ruft `fitToFrame()` auf, sobald sich die Breite ändert. Deshalb rechnet diese Datei absichtlich in `px` `css/karte.css:20`: Alle Maße müssen genau zur Geometrie passen.

## Begriffe aus dem Quelltext

Spalte „Kurs“: **VL4 S.9** = Vorlesung 4, Folie 9. **VL5\*** = im Inhaltsverzeichnis von Vorlesung 4 (Folie 2–3) angekündigt. **JS** = Thema der JavaScript-Vorlesung (VL6). **–** = nicht in den Folien.

### CSS

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Custom Properties der Karte | `css/karte.css:27` | Alle Farben und Zeiten der Karte stehen einmal oben als Variablen, zum Beispiel `--map-roof`. | – |
| `var(--x, Ersatz)` | `css/karte.css:42` | Nimmt die Dauer aus `style.css`, oder 450 ms, falls es die Variable nicht gibt (Testseite). | – |
| `cubic-bezier()` | `css/karte.css:43` | Eine Kurve für den Verlauf einer Animation: schnell los, weich ankommen. | – |
| `perspective` | `css/karte.css:80` | Abstand des Auges von der Bühne; macht Entferntes kleiner und erzeugt so Tiefe. | – |
| `perspective-origin` | `css/karte.css:81` | Der Punkt, auf den das Auge schaut. | – |
| `transform: scale()` | `css/karte.css:83` | Vergrößert oder verkleinert ein Element; hier die ganze Karte auf die Breite der Seite. | – |
| `transform-origin` | `css/karte.css:84` | Der Punkt, um den gedreht oder skaliert wird; hier die linke obere Ecke. | – |
| `rotateX()` | `css/karte.css:97` | Dreht um die waagrechte Achse: Die Bodenplatte kippt nach hinten. | VL4 S.9 (deg) |
| `transform-style: preserve-3d` | `css/karte.css:99` | Die Kinder behalten ihre eigene Lage im Raum, statt flach auf das Elternelement gedrückt zu werden. | – |
| mehrere Transformationen | `css/karte.css:143` | Werden von rechts nach links auf das Element angewendet: wachsen, aufstellen, entlang der Kante drehen. | – |
| `backface-visibility: hidden` | `css/karte.css:148` | Die Rückseite einer Wand wird nicht gezeichnet. | – |
| `translateZ()` mit `calc()` | `css/karte.css:192` | Hebt das Dach auf Wandhöhe mal Wachstumsfaktor. | – |
| `transition` | `css/karte.css:137` | Ändert sich `transform`, zeigt der Browser den Übergang als Bewegung statt als Sprung. | – |
| `clip-path: polygon()` | `css/karte.css:205` | Schneidet ein Element auf eine Vieleck-Form zu; so bekommt das Dach den Umriss des Blocks. | – |
| `rgba` | `css/karte.css:157` | Ein halbdurchsichtiges Schwarz über der Wandfarbe dunkelt die Wand ab. | VL4 S.14 |
| wiederholtes Hintergrundbild | `css/karte.css:167` | Nachts: das kleine Bild `img/fenster.svg` mit einer Reihe Fenster, über die ganze Wand wiederholt (`background-size`, `background-position`). | VL5\* |
| `box-shadow: inset` als Farbschicht | `css/karte.css:157` | Ein Schatten nach innen mit 2000 px Ausdehnung füllt die ganze Wand: Schatten und Sonnenlicht. Anders als ein Farbverlauf kann ein Schatten weich in eine neue Farbe gleiten. | – |
| `transition-property: all` für den Wechsel | `css/karte.css:739` | Solange die Klasse `map-root--wechsel` da ist, gleiten alle Eigenschaften aller Teile der Karte in 1,4 s. | – |
| `setTimeout`, `clearTimeout` | `js/karte.js:585` | Entfernt die Klasse nach 1,5 s; kommt vorher ein neuer Wechsel, beginnt die Zeit von vorn. | JS |
| Klassen, die nur Variablen ändern | `css/karte.css:644` | Jede Stimmung ist eine Klasse, die nur CSS-Variablen neu setzt (Farben, Bodenbild, Sonnenlicht); alle anderen Regeln benutzen diese Variablen. | VL5 S.4 |
| `mask-image` | `css/karte.css:526` | Der Himmelsstreifen läuft nach unten weich in die Stadt aus. | – |
| `radial-gradient` | `css/karte.css:307` | Kreisförmiger Verlauf für den gelben Lichtfleck unter dem gewählten Gebäude. | VL5\* |
| Pseudoelement `::after` | `css/karte.css:178` | Eine zusätzliche Fläche auf jeder Wand für das warme Licht von unten, zuerst unsichtbar (`opacity: 0`). | VL5\* |
| `inset: 0` | `css/karte.css:170` | Kurz für `top`, `right`, `bottom`, `left` gleich 0: füllt das Elternelement ganz aus. | – |
| `position: absolute` | `css/karte.css:108` | Jedes Teil wird mit `left` und `top` genau auf der Platte platziert. | – |
| `pointer-events` | `css/karte.css:101` | Boden, Bäume und Wasserturm lassen Klicks durch; nur die Quadrate reagieren. | – |
| Variablen überschreiben | `css/karte.css:315` | Die Klasse `is-tinted` setzt nur die Variablen neu; alle Regeln, die sie benutzen, bekommen die Kategoriefarbe. | – |
| zwei Klassen zugleich | `css/karte.css:314` | `.a.b` gilt nur für Elemente mit beiden Klassen. | – |
| `:hover` | `css/karte.css:340` | Maus über dem Quadrat: Die Dachfläche wird heller. | VL4 S.24 |
| `:focus-visible` und `outline` | `css/karte.css:389` | Bei Tastaturbedienung bekommt das Kürzel einen weißen Rahmen. | – |
| `:not()` | `css/karte.css:400` | Die weiße Dachkante gibt es nur, wenn das Quadrat nicht schon gewählt (gelb) ist. | – |
| `box-shadow: inset` | `css/karte.css:367` | Innenschatten als gelber Rahmen auf den Wänden des gewählten Gebäudes. | VL5\* |
| `text-shadow` | `css/karte.css:276` | Ein weicher Rand um die Schrift, damit Namen auf Pflaster und Rasen lesbar bleiben. | – |
| `border-radius` und `rotate` | `css/karte.css:432` | Drei runde Ecken und eine spitze, um 45 Grad gedreht: der Kopf der Stecknadel. | VL5\* |
| Hintergrundbild auf die Größe gestreckt | `css/karte.css:562` | Jede Boden-Ebene zeigt das Bild ihrer Stimmung, mit `100% 100%` auf die Größe der Platte gestreckt. | VL5\* |
| Einheit `px` mit Absicht | `css/karte.css:20` | Die Karte ist eine feste Zeichnung, die als Ganzes skaliert wird; der Rest der Website nutzt `rem`. | VL4 S.9 |
| `@media (prefers-reduced-motion)` | `css/karte.css:760` | Bei „weniger Bewegung“ springen die Zustände sofort um, auch die Stimmungen. | – |

### JavaScript

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Funktion, die sich sofort aufruft | `js/karte.js:22` | Alle Variablen bleiben im Modul; nur `window.Karte` ist von außen sichtbar. | JS |
| `document.createElement`, `className`, `appendChild` | `js/karte.js:98`, `js/karte.js:90`, `js/karte.js:91` | Erzeugt ein neues Element, gibt ihm eine CSS-Klasse und hängt es in die Seite. | JS |
| `element.style.left` | `js/karte.js:120` | Setzt eine CSS-Eigenschaft direkt am Element, hier die Lage auf der Platte. | JS |
| Schleife `for` über alle Wände | `js/karte.js:561` | `Karte.stimmung()` rechnet für jede der rund 1.000 Wände Licht und Schatten neu. | VL6 S.15 |
| `Math.sin`, `Math.cos`, `Math.PI` | `js/karte.js:629` | Aus dem Winkel der Wand wird ihre Blickrichtung; das Skalarprodukt mit der Lichtrichtung sagt, wie sehr die Wand zur Sonne zeigt (1 = genau, 0 = gar nicht). | VL6 S.12 |
| `style.setProperty("--name")` | `js/karte.js:170` | Setzt eine CSS-Variable am Element; `css/karte.css` benutzt sie im `transform`. | JS |
| `clip-path` aus JavaScript | `js/karte.js:131` | Schreibt die Umrissform als `polygon(...)` in eine Variable. | JS |
| `style.transformOrigin` | `js/karte.js:181` | Der Mittelpunkt, um den ein Gebäudeteil beim Wählen breiter wird. | JS |
| `setAttribute` | `js/karte.js:232` | Setzt HTML-Attribute: `data-code`, `tabindex`, `role`, `aria-label`. | JS |
| `textContent` | `js/karte.js:198` | Schreibt das Kürzel als reinen Text in das Element. | JS |
| Array `join` | `js/karte.js:202` | Setzt die vier Zahlen der Matrix zu einem Text zusammen. | JS |
| Ereignisse je Element | `js/karte.js:231` | Jedes Quadrat hat eigene Listener für Klick, Tasten, Fokus und Maus; die Funktion merkt sich ihr `block` (Closure). | JS |
| `keydown`, `event.key` | `js/karte.js:255` | Eingabe- oder Leertaste wählt das Quadrat. | JS |
| `event.preventDefault()` | `js/karte.js:256` | Verhindert, dass die Leertaste die Seite scrollt. | JS |
| `focus`, `scrollIntoView` | `js/karte.js:265` | Holt das Dach des fokussierten Quadrats in den sichtbaren Bereich. | JS |
| `mouseenter`, `mouseleave` | `js/karte.js:273` | Maus kommt über das Quadrat bzw. verlässt es; die Seite kann darauf reagieren (`onHover`). | JS |
| `for ... in` über ein Objekt | `js/karte.js:338` | Schreibt alle Einträge des Objekts `values` als CSS-Variablen an die Bühne. | JS |
| `clientWidth`, `Math.max` | `js/karte.js:374` | Breite des Rahmens geteilt durch 1600, aber nie kleiner als 0,5. | JS |
| `ResizeObserver` | `js/karte.js:468` | Meldet, wenn ein Element seine Größe ändert; dann wird die Karte neu skaliert. | JS |
| `classList.add` / `remove` / `toggle` | `js/karte.js:492` | Schaltet Klassen; das Aussehen dazu steht in `css/karte.css`. | JS |
| `removeProperty` | `js/karte.js:494` | Entfernt eine CSS-Variable wieder; das Quadrat bekommt seine Grundfarbe zurück. | JS |
| `parseInt(..., 16)` | `js/karte.js:394` | Liest zwei Hex-Ziffern einer Farbe als Zahl von 0 bis 255. | VL4 S.13 |
| `aria-current` | `js/karte.js:504` | Markiert das gewählte Quadrat für Screenreader als „aktuell“. | – |
| `remove()` | `js/karte.js:514` | Entfernt ein Element aus der Seite, hier alte Stecknadeln. | JS |
| Modul-Objekt | `js/karte.js:607` | Dieselben fünf Funktionen wie in der SVG-Variante: `init`, `faerben`, `waehlen`, `markieren`, `codes`. | JS |

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
6. **Warum habt ihr für den Tagesverlauf kein fertiges Video genommen?** (neu am 14.10.2026)
   Ein Video wäre ein festes Bild: Die Häuser könnte man dann nicht mehr anklicken, sie könnten nicht wachsen und keine Kategoriefarbe oder Stecknadel bekommen. Wir haben aber das Gute der Idee übernommen: Himmel und Boden sind fertige Bilder je Stimmung, und beim Wechsel der Uhrzeit wird nur ihre Deckkraft (`opacity`) und die Lage der Sonne (`transform`) geändert. Das kann die Grafikkarte allein, so flüssig wie ein Video. Die Häuser ändern ihre Farbe in kleinen Schritten, ohne zu gleiten, weil ein Gleiten von 1500 Teilen den Browser in jedem Bild 0,1 s Arbeit kostet (gemessen).

## Stecknadeln in Kategorie-Farben (neu am 13.10.2026)

Bisher waren alle Stecknadeln rot. Jetzt hat jede Nadel die Farbe der Kategorie der gemerkten Orte in ihrem Quadrat.

- `markieren()` `js/karte.js:533` nimmt weiter eine Liste (`["G2", "O7"]`, rote Nadeln), aber auch ein Objekt (`{ "O7": "trinken" }`). `Array.isArray()` `js/karte.js:535` unterscheidet die beiden Fälle.
- Die Kategorie je Quadrat merkt sich `pinCategory` `js/karte.js:549`. Die Nadel bekommt dann zusätzlich die Klasse `cat-trinken` `js/karte.js:561`.
- In CSS setzen die Klassen `cat-essen` … aus `css/style.css` die Variable `--cat-3`; der Kopf der Nadel nimmt sie als Hintergrund `css/karte.css:438`. Die vier Klassen stehen einzeln da, weil die Karte selbst eine `cat-`-Klasse des Filters tragen kann, die sonst jede Nadel färben würde.
