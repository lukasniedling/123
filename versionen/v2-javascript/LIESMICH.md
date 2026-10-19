# Zwischenversion V2: HTML, CSS und JavaScript

Stand: 2026-10-07. Gilt für diesen Ordner `versionen/v2-javascript/`.

Diese Version zeigen wir nach **Vorlesung 6 (JavaScript)**. Sie sieht aus wie die fertige Website (`pivot/`): 3D-Karte, Filter, Steckbrief, Suchen und Sortieren, Formularprüfung. Es fehlt nur, was **PHP** braucht (Vorlesung 7).

## Öffnen

`index.html` doppelklicken. Kein Server nötig. Nur die OpenStreetMap-Karte auf „Ort vorschlagen“ lädt aus dem Internet.

## Wie die Version entstanden ist

Kopie von `pivot/` (Tag `pivot-2026-09-29`), daraus entfernt, was im Code als `[V3]` (PHP) markiert ist:

- Dateien: `login.php`, `registrieren.php`, `logout.php`, `meine-orte.php`, `php/`, `daten/`, `js/merkliste.js`, `css/konto.css`, außerdem `docs/` (die Erklärungen zitieren Zeilen des Pivots, siehe unten).
- In den Seiten: Menüpunkt „Anmelden“, Legende „gemerkte Orte“, Schritt „Orte merken“ in „Über uns“, Fangfeld und Einwilligung im Formular, die PHP-Abschnitte im Datenschutz.
- Danach von Hand angepasst:
  - `js/steckbrief.js`: Merken-Knöpfe und Anmelde-Hinweis entfernt (sonst toter Code).
  - `js/formular.js`: Ist alles richtig ausgefüllt, erscheint „Alles richtig ausgefüllt … Den Versand bauen wir mit PHP (Vorlesung 7)“. Der Hinweis auf XAMPP fällt weg.
  - `ueber-uns.html` (Technik-Tabelle), `datenschutz.html` (kein Webserver), Fußzeile „Zwischenversion V2“ auf allen Seiten, `.version-tag` von `css/info.css` nach `css/style.css` verschoben.
- Bewusst stehen gelassen: `Karte.markieren()` in `js/karte.js` (Stecknadeln für gemerkte Orte) und einige CSS-Regeln mit `[V3]` im Kommentar. Sie gehören zur gemeinsamen Schnittstelle der Karte, werden in V2 aber nicht aufgerufen.

## Was die Version kann

| Seite | Inhalt |
|---|---|
| `index.html` | 3D-Karte aus der Vogelperspektive (CSS 3D). Filter: Wochentag, Uhrzeit (Schieberegler, Knopf „Jetzt“), Kategorie. Die Quadrate färben sich nach der Zahl der geöffneten Orte, Legende darunter. Klick auf ein Quadrat: Das Gebäude wächst, darunter erscheint der Steckbrief mit Text, Foto und den Orten mit Öffnungszeiten. `index.html#G1` öffnet direkt G1. Auswahl auch über die Liste „Quadrat wählen“ und mit der Tastatur. |
| `quadrate.html` | Tabelle aller 146 Quadrate, sortierbar per Klick auf die Spaltenüberschrift, Suchfeld. |
| `vorschlagen.html` | Formular mit Meldungen unter den Feldern, Fehlerliste, Zeichenzähler, Rückfrage vor „Eingaben löschen“ (`confirm`). Gesendet wird nichts. |
| `ueber-uns.html` | Idee, Team, Logo, **eigenes Video** (mp4), Technik je Vorlesung. |
| `impressum.html`, `datenschutz.html` | Pflichtseiten. |

## Erklärungen für die Präsentation

Die ausführlichen Erklärungen liegen in **`pivot/docs/erklaerungen/`** (eine Datei je Seite: `index.md`, `karte-css3d.md`, `quadrate.md`, `vorschlagen.md`, `ueber-uns.md`, `impressum-datenschutz.md`, `daten.md`; Einstieg `README.md`). Sie beschreiben den Pivot. Für V2 gilt:

- Alles zu Karte, Filter, Steckbrief, Verzeichnis und Formularprüfung passt.
- Die Zeilennummern passen nicht immer, besonders in `js/steckbrief.js` und `js/formular.js`: nach dem zitierten Code suchen statt nach der Zeile.
- `konto.md` (PHP) gilt erst für V3.

## JavaScript aus Vorlesung 6 im Code

Folien: „VL6 S.13“ = Vorlesung 6, Folie 13. Zeilen: Stand 2026-10-07.

| Begriff (Folie) | Beispiel |
|---|---|
| Externe Skriptdatei `<script src="…">` (VL6 S.6) | `index.html:186` und folgende |
| Variable mit `var` und Wertzuweisung (VL6 S.8–S.10) | `js/filter.js:32` |
| Vergleichs- und logische Operatoren `===`, `&&` (VL6 S.12) | `js/filter.js:74` |
| Verzweigung `if … else` (VL6 S.13) | `js/filter.js:83` bis `95` (`levelOf()`: 1 Ort, 2–3, 4–6, 7+) |
| Zählschleife `for` (VL6 S.15) | `js/filter.js:72` (alle Orte durchgehen und zählen) |
| `while`-Schleife (VL6 S.16) | `js/verzeichnis.js:124` |
| Funktion mit Parametern und `return` (VL6 S.17) | `js/filter.js:83`, `js/oeffnungszeiten.js:81` |
| Array (VL6 S.17) | `js/verzeichnis.js:220` (`push`) |
| Modales Fenster `window.confirm` (VL6 S.18) | `js/formular.js`, Funktion `handleReset` |
| Formularprüfung mit JavaScript (VL6 S.20) | `js/formular.js`, Funktion `checkField` |
| Kommentare und sprechende Namen (VL6 S.2) | jede Datei beginnt mit einem Kopfkommentar |

Dazu CSS aus Vorlesung 5 (Transformationen), das V1 bewusst weggelassen hat: `perspective`, `transform: rotateX(…)`, `transition` in `css/karte.css` (ab Zeile 70).

## Nicht auf den Folien (im Code oft, kurz erklärbar)

| Technik | Wofür | Beispiel |
|---|---|---|
| `document.getElementById(…)` | ein Element der Seite holen | `js/app.js:30` |
| `addEventListener("change", …)` | auf Klick, Eingabe oder Änderung reagieren (wie `onclick` auf den Folien, nur im Skript statt im HTML) | `js/app.js:214` |
| `document.createElement(…)` | neue Elemente bauen (die 146 Gebäude der Karte) | `js/karte.js:51` |
| `classList.add(…)` | eine CSS-Klasse setzen, das Aussehen macht dann das CSS | `js/karte.js:176` |
| `innerHTML`, `textContent` | Inhalt eines Elements schreiben (Steckbrief) | `js/steckbrief.js` |
| `location.hash` | der Teil der Adresse nach `#` (`index.html#G1`) | `js/app.js` |
| `(function () { "use strict"; … })();` | jede Datei in eine Funktion packen, damit ihre Variablen nicht mit anderen Dateien kollidieren | `js/filter.js:29` |
| CSS-Variablen `var(--…)`, Grid | gemeinsames Design (aus dem Pivot übernommen) | `css/style.css` |

## Geprüft am 2026-10-07

Automatischer Ende-zu-Ende-Test in Chrome, ohne Server (`tools/tests/e2e.mjs v2` im Entwicklungsordner von Anes): alle Seiten laden ohne Fehler, Karte mit 146 Quadraten, Filter (Tag, Uhrzeit, Kategorie) färbt die Karte passend zu den Daten, Steckbrief per Klick, Tastatur, Liste und `#G1`, keine Merken-Knöpfe und keine Links auf `.php`, Verzeichnis sortiert und springt zurück zur Karte, Formular blockiert falsche Eingaben und zeigt „Alles richtig ausgefüllt“. Ergebnis: 0 Fehler.

Nicht geprüft: Safari und Firefox. Die 3D-Karte wurde vor allem in Chrome getestet; bitte vor der Vorführung im Browser der Präsentation öffnen.
