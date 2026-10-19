# Erklärungen für die Präsentation

Stand der Zeilennummern und Zahlen: 2026-09-29 11:54 (automatisch aus den Dateien erzeugt).

Laut Vorlesung 1 (Folie 4) präsentiert das Team die Website, und jede und jeder sucht sich eine Unterseite aus und sollte „anhand des Quellcodes gewisse Begriffe erklären“ können. Dafür gibt es hier je Seite ein Dokument mit:

1. **Was die Seite zeigt und warum** (und wie man sie vorführt),
2. **Aufbau des Quelltexts**: welche Dateien beteiligt sind und was in welcher Reihenfolge passiert,
3. **Begriffe aus dem Quelltext**: HTML, CSS, JavaScript und PHP mit Datei und Zeile (zum Beispiel `js/app.js:115`) und einer Erklärung in einem Satz,
4. **Fünf Fragen, die der Dozent stellen könnte**, mit kurzen Antworten.

Die Seiten im Ordner `docs/` darüber (`docs/index.html`, `docs/startseite.html` …) sind die kurze Fassung als Webseite; diese Markdown-Dateien sind die ausführliche Fassung zum Lernen.

## Die Dokumente

| Dokument | Seite(n) | Schwerpunkt | Umfang |
|---|---|---|---|
| [index.md](index.md) | Karte (`index.html`) | Filter, Ereignisse, DOM, Adresse `#G1`, Steckbrief, Flexbox und Grid | groß |
| [karte-svg.md](karte-svg.md) | Karte der SVG-Variante | SVG, Animation mit `requestAnimationFrame`, Tastaturbedienung | mittel |
| [karte-css3d.md](karte-css3d.md) | Karte der CSS-3D-Variante | `perspective`, `transform`, `transition`, CSS-Variablen | mittel |
| [quadrate.md](quadrate.md) | Verzeichnis (`quadrate.html`) | Tabelle, Anker, Sortieren und Suchen | mittel |
| [vorschlagen.md](vorschlagen.md) | Ort vorschlagen (`vorschlagen.html`) | Formular, iframe, Inline-Stil, Prüfung in Browser, JavaScript und PHP | groß |
| [ueber-uns.md](ueber-uns.md) | Über uns (`ueber-uns.html`) | Logo, Video, Listen, Grid, CSS-Zähler | klein |
| [impressum-datenschutz.md](impressum-datenschutz.md) | Impressum, Datenschutz | Pflichtangaben, DSGVO, Cookies, `<address>`, Ankerlinks | klein |
| [konto.md](konto.md) | Anmelden, Registrieren, Meine Orte, Abmelden | PHP: Sessions, `password_hash`, CSRF-Schutz, JSON-Speicher, `fetch` | groß |
| [daten.md](daten.md) | alle Seiten mit Daten | OpenStreetMap, ODbL, Datenformate, wie die Werkzeuge die Daten erzeugen | mittel |

Zur Karte: Die Gruppe hat die CSS-3D-Variante gewählt (Entscheidung D-021). Im Gruppen-Repository reicht dann `karte-css3d.md`; `karte-svg.md` kann bleiben, wenn ihr den Vergleich der beiden Wege zeigen wollt. Die Fundstellen in `karte-svg.md` beziehen sich auf `web/variante-svg/`, die in `karte-css3d.md` auf `web/variante-css3d/`; alle anderen Dokumente gelten in beiden Varianten.

## Vorschlag: wer präsentiert was

Das Team hat fünf Mitglieder; Namen und Rollen stehen auch auf den Teamkarten auf „Über uns“. Jede Person stellt eine eigene Unterseite vor, passend zu ihrer Rolle, und zusammen sind alle Kursinhalte (HTML, CSS, JavaScript, PHP) abgedeckt. Die Karte ist die CSS-3D-Variante (Entscheidung D-021), deshalb steht unten `karte-css3d.md`.

| Person (Rolle) | Unterseiten | Dokumente | Typische Begriffe |
|---|---|---|---|
| Matti Katila (Inhalte und Anforderungen) | Quadrate, Impressum, Datenschutz, dazu woher Orte und Texte kommen | [quadrate.md](quadrate.md), [daten.md](daten.md), [impressum-datenschutz.md](impressum-datenschutz.md) | Tabelle, Anker, Sprungliste, OpenStreetMap, ODbL, JSON, `<address>`, `mailto:`, DSGVO, Cookies |
| Nikita Ermotschenko (Design und Kreativität) | Über uns, dazu das gemeinsame Design | [ueber-uns.md](ueber-uns.md), der CSS-Teil von [index.md](index.md) (`css/style.css`, `docs/styleguide.html`) | Selektoren, Pseudoklassen, Box-Modell, Flexbox, Grid, CSS-Variablen, `@font-face`, Logo, Video |
| Niko Eibach (Programmierung) | Karte | der JavaScript-Teil von [index.md](index.md), [karte-css3d.md](karte-css3d.md) | DOM, Ereignisse, Funktionen, Arrays und Objekte, `location.hash`, `perspective`, `transform`, `transition` |
| Anes Sahbegovic (Programmierung) | Anmelden, Registrieren, Meine Orte, dazu der Versand des Formulars | [konto.md](konto.md), der PHP-Teil von [vorschlagen.md](vorschlagen.md) | GET und POST, Session, `password_hash`, CSRF, JSON-Speicher, `fetch` |
| Lukas Niedling (Tests und Präsentation) | Ort vorschlagen, dazu der Ablauf der Vorführung | [vorschlagen.md](vorschlagen.md) ohne den PHP-Teil, der Ablauf unten | Formular, `required`, `pattern`, Fehlermeldungen mit JavaScript, iframe, Inline-Stil |

Niko und Anes können Karte und PHP-Teil tauschen. Lukas führt durch die Vorführung (Einstieg, Übergaben, Abschluss) und spielt sie vorher einmal ganz auf dem Laptop für die Präsentation durch.

## Vorschlag für den Ablauf (wie eine Diashow)

1. **Einstieg**: die Idee in einem Satz, den Ablauf ansagen (Lukas Niedling).
2. **Über uns**: Idee, Team, Logo, kurz das Video; dazu Farben, Schriften und Bausteine aus `css/style.css` (Nikita Ermotschenko).
3. **Karte**: Tag, Uhrzeit und Kategorie ändern, ein Quadrat anklicken, Steckbrief; einmal mit der Tastatur. Danach ein Blick in die Technik: JavaScript und die 3D-Karte mit CSS (Niko Eibach).
4. **Quadrate und Daten**: Tabelle, Sprung zu einer Reihe, Sortieren, Link zurück zur Karte; woher die Orte kommen und warum die Lizenz einen Hinweis in jeder Fußzeile verlangt (Matti Katila).
5. **Ort vorschlagen**: Formular mit Fehlern absenden, Meldungen zeigen, dann über XAMPP richtig senden (Lukas Niedling).
6. **Konto**: über XAMPP registrieren, einen Ort merken, Stecknadel auf der Karte, Meine Orte, Abmelden; dazu, was `php/vorschlag.php` mit dem gesendeten Formular macht (Anes Sahbegovic).
7. **Impressum und Datenschutz**: Pflichtangaben, § 5 DDG statt Telemediengesetz, nur ein Cookie (Matti Katila).
8. **Abschluss und Fragen** (Lukas Niedling).

Vorher prüfen: XAMPP läuft, der Ordner liegt in `htdocs`, unter macOS ist `daten/` beschreibbar (siehe `daten/LIESMICH.txt` und `web/VERSIONEN.md`); die Seiten ohne PHP funktionieren auch per Doppelklick.

## Zwischenversionen V1 und V2

Die Dokumente beschreiben die fertige Website (V3). Für die Abgaben der Zwischenversionen (siehe `web/VERSIONEN.md`):

- **V1** (HTML und CSS): aus `index.md` gelten die Abschnitte zu `index.html` und zum CSS und die HTML- und CSS-Begriffe; die Karte ist in V1 ein Standbild, die Abschnitte zu JavaScript entfallen. `karte-svg.md`, `karte-css3d.md` und `konto.md` entfallen; in `vorschlagen.md` gelten nur die Browser-Prüfung und die HTML- und CSS-Begriffe.
- **V2** (dazu JavaScript): alles außer `konto.md` und den Abschnitten und Begriffen zu PHP in `vorschlagen.md`.

## Spalte „Kurs“ in den Begriffstabellen

- **VL2 S.3** = Vorlesung 2, Folie 3 (die Folien liegen beim Dozenten).
- **VL5\*** = im Inhaltsverzeichnis von Vorlesung 4 (Folie 2–3) für die nächste CSS-Vorlesung angekündigt: Pseudoelemente, Hintergründe, Innenabstände, Rahmen, Außenabstände.
- **JS** = Thema der JavaScript-Vorlesung (VL6), **PHP** = Thema der PHP-Vorlesung (VL7).
- **–** = kommt in den Folien nicht vor (zum Beispiel ARIA-Attribute für Screenreader, Grid, Python-Werkzeuge). Solche Begriffe trotzdem erklären können: Sie stehen im Code.

## Stolperfallen in den Folien

Einige Codebeispiele der Folien enthalten kleine Fehler. Bei Fragen die richtige Form nennen:

- `<titel>` heißt richtig `<title>`.
- Die Datenzelle einer Tabelle ist `<td>`, nicht ein zweites `<th>`.
- In `<a href="#wichtig>` fehlt das schließende Anführungszeichen.
- `alt` gibt es bei Bildern, nicht bei Links.
- Im Code immer gerade Anführungszeichen `"`, keine typografischen „ “.
- `@charset "utf-8";` genau so, mit geraden Anführungszeichen.
- Das Impressum stützt sich heute auf § 5 DDG; das Telemediengesetz gilt seit dem 14.05.2024 nicht mehr.

## Wenn sich der Code ändert

Die Zeilennummern zeigen auf die Zeile, in der der Begriff im Code steht. Ändert jemand eine Datei, verschieben sich die Nummern darunter. Vor der Präsentation die Fundstellen der eigenen Seite kurz prüfen; in VS Code springt Strg+G (macOS: Ctrl+G) zu einer Zeilennummer.
