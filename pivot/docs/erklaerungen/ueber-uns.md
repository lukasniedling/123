# Über uns: die Seite `ueber-uns.html`

Erklärung für die Präsentation. Zeilennummern erzeugt am 2026-09-29 11:54 aus den aktuellen Dateien; sie gelten in beiden Varianten (`web/variante-svg` und `web/variante-css3d`), denn diese Seite ist dort gleich.

**Vorschlag für die Präsentation:** Nikita Ermotschenko (Design und Kreativität), dazu das gemeinsame Design aus `css/style.css` mit dem Styleguide `docs/styleguide.html`. Die ganze Aufteilung für alle fünf steht in [README.md](README.md) unter „Vorschlag: wer präsentiert was“.

## Was die Seite zeigt und warum

„Über uns“ erklärt in sechs Abschnitten, was Quadrate ist und wer es gebaut hat:

1. **Die Idee**: Die Mannheimer Innenstadt ist ein Raster aus Quadraten; wir zeigen es als 3D-Karte und färben die Blöcke nach geöffneten Orten. Dazu das Standbild der Karte und drei Fotos (Schloss, Planken, Wasserturm) mit Bildnachweis.
2. **So funktioniert es**: fünf nummerierte Schritte zur Bedienung der Karte.
3. **Das Team**: eine Karte je Mitglied mit Initialen, Name und Rolle (fünf Mitglieder).
4. **Das Logo**: das Logo groß, das Favicon in echter Größe und eine Erklärung seiner Teile.
5. **Video**: eine eigene Bildschirmaufnahme der Karte als MP4-Datei.
6. **Womit wir bauen**: eine Tabelle, welche Technik aus welcher Vorlesung wo steckt.

Warum so: Die Seite enthält zwei Pflicht-Elemente der Team-Übung 2 (Vorlesung 3), das **Team-Logo** und ein **Video**. Sie braucht kein JavaScript und ist in allen Versionen gleich; nur der Schritt „Orte merken“ gehört zu V3, und die Schritte zu Filter und Steckbrief werden in V1 durch einen Satz ersetzt (steht im Kommentar).

## So führst du die Seite vor

1. Oben in der Leiste „Auf dieser Seite“ auf **Das Logo** klicken: Die Seite springt zum Abschnitt (Anker).
2. Das Logo zeigen und erklären: vier Blöcke, sandfarbenes Kreuz aus Kurpfalzstraße und Planken, Schrift Archivo Bold.
3. Beim **Video** auf Abspielen drücken: Es liegt als Datei auf unserem Server, es gibt keine Verbindung zu YouTube.
4. Die Tabelle **Technik je Vorlesung** als Überleitung zu den anderen Seiten nutzen.

## Aufbau des Quelltexts

### Beteiligte Dateien

| Datei | Aufgabe | Version |
|---|---|---|
| `ueber-uns.html` | Text, Bilder, Team, Logo, Video, Technik-Tabelle | V1 |
| `css/style.css` | gemeinsames Design: Textspalte `.prose`, Fotos, Rahmen für Video, Tabellen, Kacheln | V1 |
| `css/info.css` | nur für Über uns, Impressum und Datenschutz: Abschnitte, Inhaltsleiste, Schritte, Teamkarten, Logo, Platzhalter | V1 |
| `img/logo.svg`, `img/favicon.svg` | Logo und Browser-Symbol als SVG-Grafik | V1 |
| `img/fotos/*.jpg` | Fotos von Wikimedia Commons, auf 1200 px verkleinert | V1 |
| `video/quadrate.mp4` | Bildschirmaufnahme der Karte, H.264, 1280 × 720, 32 Sekunden, ohne Ton | V1 |

### `ueber-uns.html` von oben nach unten

1. Kopfkommentar `ueber-uns.html:3`, dann Kopf mit `style.css` und `info.css` `ueber-uns.html:27` und die Navigation mit `aria-current` bei „Über uns“ `ueber-uns.html:44`.
2. Einleitung `ueber-uns.html:55` und Leiste mit Ankerlinks zu den Abschnitten `ueber-uns.html:61`.
3. Abschnitt „Die Idee“ `ueber-uns.html:73`: Text links, Standbild der Karte rechts `ueber-uns.html:83`, darunter die Fotoreihe `ueber-uns.html:97`.
4. Abschnitt „So funktioniert es“ `ueber-uns.html:129` mit nummerierter Liste `<ol class="steps">` `ueber-uns.html:136`.
5. Abschnitt „Das Team“ `ueber-uns.html:179`: je Mitglied ein `<article>` `ueber-uns.html:185`.
6. Abschnitt „Das Logo“ `ueber-uns.html:223`: Bild des Logos `ueber-uns.html:228` und Beschreibungsliste `<dl>` `ueber-uns.html:235`.
7. Abschnitt „Video“ `ueber-uns.html:259`: `<video>` `ueber-uns.html:264` und darunter ein Text, was im Video zu sehen ist `ueber-uns.html:269`. Im Kommentar darunter steht, wie man stattdessen auf YouTube verlinkt `ueber-uns.html:272`.
8. Abschnitt „Womit wir bauen“ `ueber-uns.html:281` mit der Tabelle `ueber-uns.html:287`.
9. Fußzeile wie auf allen Seiten `ueber-uns.html:350`. Kein `<script>`: Die Seite braucht kein JavaScript.

### Das Logo `img/logo.svg`

Das Logo ist eine SVG-Datei, also eine Zeichnung aus Formen statt aus Pixeln. Es bleibt in jeder Größe scharf.

- `viewBox="0 0 200 33"` `img/logo.svg:1` legt das Koordinatensystem fest; `role="img"` und `<title>` `img/logo.svg:3` geben ihm einen Namen.
- Das Zeichen besteht aus Rechtecken `<rect>`: zwei sandfarbene Streifen für Kurpfalzstraße und Planken `img/logo.svg:5` und vier Blöcke mit dunklem Dach über hellerer Wand `img/logo.svg:7`, dieselben Farben wie auf der Karte und in `css/style.css`.
- Der Schriftzug „Quadrate“ ist die Schrift Archivo Bold, in Linien (`<path>`) umgewandelt, damit das Logo ohne Schriftdatei überall gleich aussieht.

## Begriffe aus dem Quelltext

Spalte „Kurs“: **VL2 S.6** = Vorlesung 2, Folie 6. **VL5\*** = im Inhaltsverzeichnis von Vorlesung 4 (Folie 2–3) angekündigt. **–** = nicht in den Folien.

### HTML

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Grundgerüst | `ueber-uns.html:1`, `ueber-uns.html:19`, `ueber-uns.html:21` | HTML5-Dokument, Sprache Deutsch, Zeichenkodierung UTF-8. | VL2 S.3 |
| `<nav>` mit `aria-label` | `ueber-uns.html:61` | Zweite Navigation nur für diese Seite; `aria-label` unterscheidet sie für Screenreader von der Hauptnavigation. | VL2 S.8 |
| Anker auf derselben Seite | `ueber-uns.html:66` | `href="#logo"` springt zu dem Element mit `id="logo"` `ueber-uns.html:223`. | VL3 S.2 |
| Anker auf einer anderen Seite | `ueber-uns.html:163` | Springt im Verzeichnis direkt zur Zeile G1 (dort `id="q-G1"`). | VL3 S.2 |
| `<section>` mit `aria-labelledby` | `ueber-uns.html:73` | Ein Abschnitt, dessen Name die Überschrift mit dieser id ist. | – |
| `<h2>`, `<h3>` | `ueber-uns.html:74`, `ueber-uns.html:96` | Überschriften zweiter und dritter Ordnung gliedern die Seite unter der einen `<h1>`. | VL2 S.3 |
| `<em>` | `ueber-uns.html:77` | Betont ein Wort (kursiv); für Screenreader eine Betonung, nicht nur Schmuck. | VL2 S.6 |
| Link mit Klasse `block-code` | `ueber-uns.html:77` | Ein Link, der wie ein Block der Karte aussieht und die Karte mit diesem Quadrat öffnet. | VL2 S.6 |
| absoluter Link | `ueber-uns.html:80` | Link mit vollständiger Adresse auf eine fremde Seite (Quelle zum Raster). | VL2 S.6 |
| `<figure>` und `<figcaption>` | `ueber-uns.html:83`, `ueber-uns.html:87` | Ein Bild mit seiner Bildunterschrift als zusammengehörige Einheit. | – |
| `<img>` mit `alt`, `title`, `width`, `height` | `ueber-uns.html:86` | `alt` beschreibt das Bild, `title` ist der Tooltip, `width` und `height` reservieren den Platz vor dem Laden. | VL2 S.7 |
| `loading="lazy"` | `ueber-uns.html:100` | Die Fotos laden erst, wenn man zu ihnen scrollt. | – |
| Bildnachweis | `ueber-uns.html:103` | Urheber, Lizenz und Quelle stehen direkt am Foto, wie es die freien Lizenzen verlangen. | VL1 S.14 |
| `<ol>` (nummerierte Liste) | `ueber-uns.html:136` | Liste mit Reihenfolge; die Nummern zeichnet hier CSS als kleine Blöcke. | VL2 S.6 |
| `<ul>` (Aufzählung) | `ueber-uns.html:183` | Liste ohne Reihenfolge, hier die Teamkarten. | VL2 S.6 |
| `<article>` | `ueber-uns.html:185` | Ein in sich geschlossener Inhalt, hier die Karte eines Teammitglieds. | – |
| Kachel mit Initialen `<span class="block-tile">` | `ueber-uns.html:186` | Dieselbe Kachel wie das Kürzel eines Quadrats im Steckbrief (css/style.css); `aria-hidden="true"`, weil der Name gleich daneben steht. | – |
| `<dl>`, `<dt>`, `<dd>` | `ueber-uns.html:235`, `ueber-uns.html:237` | Beschreibungsliste: Begriff (`dt`) und seine Erklärung (`dd`), hier die Teile des Logos. | VL2 S.6 |
| leeres `alt=""` | `ueber-uns.html:230` | Das Favicon ist nur Schmuck neben einem Text, der es schon erklärt; Screenreader überspringen es. | VL2 S.7 |
| `<code>` | `ueber-uns.html:231` | Kennzeichnet einen Dateinamen oder Code im Text; wird in der Code-Schrift gezeigt. | – |
| `<video>` mit `controls`, `preload`, `poster` | `ueber-uns.html:264` | Eigener Videospieler: `controls` zeigt die Knöpfe, `preload="none"` lädt nichts vor dem Abspielen, `poster` ist das Vorschaubild. | VL3 S.2 |
| `<source>` mit `type` | `ueber-uns.html:265` | Nennt die Videodatei und ihr Format; der Browser nimmt die erste Quelle, die er abspielen kann. | VL3 S.2 |
| Ersatzinhalt im Video | `ueber-uns.html:266` | Erscheint nur in Browsern ohne Video-Unterstützung und bietet einen Download-Link. | – |
| `aria-describedby` am Video | `ueber-uns.html:264` | Verknüpft das Video mit dem Text, der beschreibt, was es zeigt (das Video hat keinen Ton). | – |
| Tabelle mit `<caption>`, `<th scope>` | `ueber-uns.html:287`, `ueber-uns.html:296` | Tabelle mit Überschrift; die erste Zelle jeder Zeile (`scope="row"`) benennt die Technik. | VL3 S.2 |
| HTML-Kommentar mit Versionsmarke | `ueber-uns.html:153` | Markiert Teile, die erst in einer späteren Version dazukommen, hier der Schritt „Orte merken“ (V3). | VL2 S.5 |

### CSS (`css/info.css` und `css/style.css`)

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `@charset` und Inhaltsverzeichnis im Kommentar | `css/info.css:1` | Jede CSS-Datei beginnt so; der Kommentar listet die Abschnitte der Datei. | VL4 S.10–11 |
| Rahmenlinie `border-top` | `css/info.css:30` | Jeder große Abschnitt bekommt oben eine dünne Linie und Abstand (`margin-top`, `padding-top`). | VL5\* |
| Flexbox für die Ankerleiste | `css/info.css:96` | Die Links stehen nebeneinander und brechen um, wenn der Platz nicht reicht. | VL3 S.3 |
| Grid mit Media Query | `css/info.css:139`, `css/info.css:146` | Text und Kartenbild stehen untereinander, ab 56rem nebeneinander in zwei gleich breiten Spalten. | VL4 S.4 |
| `repeat(3, minmax(0, 1fr))` | `css/info.css:197` | Drei gleich breite Spalten für die Fotos, ab 40rem Breite. | – |
| `repeat(auto-fill, minmax(13rem, 1fr))` | `css/info.css:266` | So viele Teamkarten nebeneinander, wie mit mindestens 13rem hineinpassen; auf großen Bildschirmen stehen alle fünf in einer Reihe. | – |
| CSS-Zähler | `css/info.css:220`, `css/info.css:228` | CSS zählt die Listenpunkte selbst mit; `counter(step)` gibt die Zahl aus. | – |
| `::before` mit `content: counter()` | `css/info.css:231` | Erzeugt vor jedem Schritt einen kleinen dunklen Block mit der Nummer. | VL5\* |
| `position: relative` / `absolute` | `css/info.css:223` | Der Listenpunkt ist der Bezugspunkt; der Nummernblock wird darin mit `top` und `left` genau platziert. | – |
| `list-style: none` | `css/info.css:219` | Entfernt die Punkte bzw. Nummern des Browsers, weil wir eigene zeichnen. | – |
| `object-fit: cover` und `aspect-ratio` | `css/style.css:1914` | Jedes Foto erscheint im Seitenverhältnis 3 : 2; was übersteht, wird abgeschnitten statt verzerrt. | – |
| Rahmen für das Video | `css/style.css:673` | Kasten im Seitenverhältnis 16 : 9, in dem das Video die ganze Fläche füllt. | – |
| Custom Property je Farbfeld | `css/info.css:368` | Die Klasse setzt nur die Variable `--swatch`; das Farbfeld aus `style.css` liest sie. | – |
| `outline` gestrichelt | `css/info.css:126` | Gestrichelte Kante um Platzhalter, damit sie beim Korrekturlesen auffallen. Seit dem 29.09.2026 sind alle Angaben ausgefüllt; die Regel bleibt für spätere Änderungen. | VL5\* |
| Herstellerpräfix mit Grund | `css/info.css:129` | Safari braucht für diese Eigenschaft noch die Vorsilbe `-webkit-`; der Kommentar sagt das. | VL4 S.10 |
| Einheit `ch` in `--measure` | `css/style.css:212` | `ch` ist die Breite der Ziffer 0; 68ch begrenzt Textzeilen auf eine gut lesbare Länge. | – |
| `@media print` | `css/info.css:473` | Beim Drucken verschwinden Ankerleiste und Videoplayer. | VL4 S.6 |

## Fragen, die der Dozent stellen könnte

1. **Wie ist das Video eingebunden, und warum nicht von YouTube?**
   Mit dem Element `<video>` und einer `<source>` auf unsere MP4-Datei. `controls` zeigt die Bedienknöpfe, `preload="none"` lädt nichts, bevor jemand auf Abspielen drückt, `poster` zeigt vorher das Standbild der Karte. Ein YouTube-iframe würde schon beim Laden der Seite eine Verbindung zu Google aufbauen und bräuchte vorher eine Einwilligung; deshalb liegt das Video auf unserem Server.

2. **Wie ist das Logo gebaut?**
   Als SVG-Datei: Rechtecke für vier Blöcke und das sandfarbene Kreuz (Kurpfalzstraße und Planken) und der Schriftzug Archivo Bold, in Linien umgewandelt. Die Farben sind dieselben wie auf der Karte. SVG bleibt in jeder Größe scharf; das kleine Zeichen allein ist das Favicon im Browser-Tab.

3. **Wie funktionieren die Links oben auf der Seite?**
   Es sind Anker: `href="#logo"` springt zu dem Element mit `id="logo"` auf derselben Seite. `quadrate.html#q-G1` springt auf einer anderen Seite zu einer Stelle. `index.html#G1` sieht gleich aus, dort liest aber JavaScript den Teil nach `#` und öffnet das Quadrat.

4. **Dürft ihr die Fotos einfach verwenden?**
   Ja, weil sie unter freien Lizenzen stehen (CC BY, CC BY-SA, CC0) und wir die Bedingungen erfüllen: Urheber, Lizenz mit Link und Quelle stehen direkt am Foto und noch einmal im Impressum. Wo wir ein Foto auf 3 : 2 zuschneiden, steht „Ausschnitt“ dabei, weil die Lizenzen verlangen, Änderungen zu kennzeichnen.

5. **Wie entstehen die Nummern vor den Schritten?**
   Die Liste ist ein `<ol>`, aber die Nummern des Browsers sind mit `list-style: none` abgeschaltet. CSS zählt selbst: `counter-reset` startet den Zähler an der Liste, `counter-increment` erhöht ihn bei jedem Punkt, und `::before` mit `content: counter(step)` zeichnet die Zahl in einen kleinen dunklen Block, der wie ein Quadrat der Karte aussieht.
