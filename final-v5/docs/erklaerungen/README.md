# Erklärungen für die Präsentation

Stand der Zeilennummern und Zahlen: 2026-10-07 14:25 (automatisch aus den Dateien erzeugt).

Laut Vorlesung 1 (Folie 4) präsentiert das Team die Website, und jede und jeder sucht sich eine Unterseite aus und sollte „anhand des Quellcodes gewisse Begriffe erklären“ können. Dafür gibt es hier je Seite ein Dokument mit:

1. **Was die Seite zeigt und warum** (und wie man sie vorführt),
2. **Aufbau des Quelltexts**: welche Dateien beteiligt sind und was in welcher Reihenfolge passiert,
3. **Begriffe aus dem Quelltext**: HTML, CSS und JavaScript mit Datei und Zeile (zum Beispiel `js/app.js:126`) und einer Erklärung in einem Satz,
4. **Fünf Fragen, die der Dozent stellen könnte**, mit kurzen Antworten.

## Die Dokumente

| Dokument | Seite(n) | Schwerpunkt | Umfang |
|---|---|---|---|
| [index.md](index.md) | Karte (`index.html`) | Filter, Ereignisse, DOM, Adresse `#G1`, Steckbrief, Flexbox und Grid | groß |
| [karte-css3d.md](karte-css3d.md) | Die 3D-Karte | `perspective`, `transform`, `transition`, CSS-Variablen, Tageszeit-Stimmungen mit Sonne, Mond und Licht je Wand | mittel |
| [quadrate.md](quadrate.md) | Orte (`quadrate.html`) | Ortssuche mit Merkmalen und Nachbar-Quadraten, Anker zu „Ort vorschlagen“ (Tabelle seit 14.10.2026 entfernt) | mittel |
| [vorschlagen.md](vorschlagen.md) | Ort vorschlagen (Abschnitt auf `quadrate.html`, bis 14.10. eigene Seite) | Formular, iframe, Inline-Stil, Prüfung in Browser und JavaScript, Speichern im localStorage | groß |
| [ueber-uns.md](ueber-uns.md) | Über uns (`ueber-uns.html`) | Logo, Video, Listen, Grid, CSS-Zähler | klein |
| [impressum-datenschutz.md](impressum-datenschutz.md) | Impressum, Datenschutz | Pflichtangaben, DSGVO, localStorage statt Cookies, `<address>`, Ankerlinks | klein |
| [konto.md](konto.md) | Konto (`konto.html`): Anmelden, Registrieren, Mein Konto, Merken auf der Karte | localStorage, `JSON.stringify` und `JSON.parse`, `try`/`catch`, `createElement`, Vergleich mit der archivierten PHP-Fassung | mittel |
| [merkliste.md](merkliste.md) | Merkliste (`merkliste.html`), neu am 13.10.2026 | Merken ohne Konto im sessionStorage, Übernahme ins Konto, PDF über den Druckdialog (`@media print`), Route zu allen Orten | mittel |
| [gerade-offen.md](gerade-offen.md) | Gerade offen (unter der Karte auf `index.html`), neu am 13.10.2026, seit 14.10. unter der Karte | Listen aus den Öffnungszeiten nach dem Filter der Karte aus den Öffnungszeiten, `setInterval`, Objekt als Zähler, ehrlich ohne Besucherzahlen | mittel |
| [events.md](events.md) | Events (`events.html`), neu am 13.10.2026 | Beispiel-Events als Daten, Termine aus Tag / Zeitraum / Wochentagen, über Mitternacht, bezahlte Einträge als „Anzeige“ | mittel |
| [daten.md](daten.md) | alle Seiten mit Daten | OpenStreetMap, ODbL, Datenformate, wie die Werkzeuge die Daten erzeugen | mittel |

Diese Dokumente beschreiben die Endversion, Version 5 (`final-v5/`, Kopie von `final-v3/`, aufbauend auf `final-v2/`): die CSS-3D-Karte (Entscheidung D-021) mit Tageszeit-Stimmungen und den Apple-inspirierten Seitenstil (D-034, D-035). Alle Fundstellen beziehen sich auf `final-v5/`. Konto, gemerkte Orte und Vorschläge speichert die Endversion im Browser (localStorage, D-042), deshalb läuft sie per Doppelklick auf `final-v5/index.html` ohne Server. Die frühere Fassung mit PHP ist im Git-Tag `final-php-2026-10-07` archiviert; die Erklärungen in `pivot/docs/` beschreiben den Pivot, ebenfalls mit PHP.

## Vorschlag: wer präsentiert was

Das Team hat fünf Mitglieder; Namen und Rollen stehen auch auf den Teamkarten auf „Über uns“. Jede Person stellt eine eigene Unterseite vor, passend zu ihrer Rolle, und zusammen sind die Kursinhalte HTML, CSS und JavaScript abgedeckt. PHP steckt nur noch in der archivierten Fassung (siehe oben). Die Karte ist die CSS-3D-Variante (Entscheidung D-021), deshalb steht unten `karte-css3d.md`.

| Person (Rolle) | Unterseiten | Dokumente | Typische Begriffe |
|---|---|---|---|
| Matti Katila (Inhalte und Anforderungen) | Quadrate, Impressum, Datenschutz, dazu woher Orte und Texte kommen | [quadrate.md](quadrate.md), [daten.md](daten.md), [impressum-datenschutz.md](impressum-datenschutz.md) | Tabelle, Anker, Sprungliste, OpenStreetMap, ODbL, JSON, `<address>`, `mailto:`, DSGVO, Cookies |
| Nikita Ermotschenko (Design und Kreativität) | Über uns, dazu das gemeinsame Design | [ueber-uns.md](ueber-uns.md), der CSS-Teil von [index.md](index.md) (`css/style.css`) | Selektoren, Pseudoklassen, Box-Modell, Flexbox, Grid, CSS-Variablen, Systemschrift, Logo, Video |
| Niko Eibach (Programmierung) | Karte | der JavaScript-Teil von [index.md](index.md), [karte-css3d.md](karte-css3d.md) | DOM, Ereignisse, Funktionen, Arrays und Objekte, `location.hash`, `perspective`, `transform`, `transition` |
| Anes Sahbegovic (Programmierung) | Konto: Anmelden, Registrieren, Mein Konto, Merken auf der Karte | [konto.md](konto.md) | localStorage, JSON, `try`/`catch`, Formular-Ereignisse, DOM-Aufbau, Vergleich mit PHP |
| Lukas Niedling (Tests und Präsentation) | Ort vorschlagen, dazu der Ablauf der Vorführung | [vorschlagen.md](vorschlagen.md), der Ablauf unten | Formular, `required`, `pattern`, Fehlermeldungen mit JavaScript, iframe, Inline-Stil |

Niko und Anes können Karte und Konto tauschen. Lukas führt durch die Vorführung (Einstieg, Übergaben, Abschluss) und spielt sie vorher einmal ganz auf dem Laptop für die Präsentation durch.

## Vorschlag für den Ablauf (wie eine Diashow)

1. **Einstieg**: die Idee in einem Satz, den Ablauf ansagen (Lukas Niedling).
2. **Über uns**: Idee, Team, Logo, kurz das Video; dazu Farben, Schriften und Bausteine aus `css/style.css` (Nikita Ermotschenko).
3. **Karte**: Tag, Uhrzeit und Kategorie ändern, ein Quadrat anklicken, Steckbrief; einmal mit der Tastatur. Danach ein Blick in die Technik: JavaScript und die 3D-Karte mit CSS (Niko Eibach).
4. **Quadrate und Daten**: Tabelle, Sprung zu einer Reihe, Sortieren, Link zurück zur Karte; woher die Orte kommen und warum die Lizenz einen Hinweis in jeder Fußzeile verlangt (Matti Katila).
5. **Ort vorschlagen**: Formular mit Fehlern absenden, Meldungen zeigen, dann richtig ausfüllen und speichern (Lukas Niedling).
6. **Konto**: registrieren, einen Ort merken, Stecknadel auf der Karte, Mein Konto, Abmelden; in den Entwicklertools zeigen, wie die Daten im localStorage liegen (Anes Sahbegovic).
7. **Impressum und Datenschutz**: Pflichtangaben, § 5 DDG statt Telemediengesetz, keine Cookies, was im Browser gespeichert wird (Matti Katila).
8. **Abschluss und Fragen** (Lukas Niedling).

Vorher prüfen: `final-v5/index.html` per Doppelklick im Browser der Präsentation öffnen und alle Seiten einmal durchklicken. Für einen sauberen Start in den Entwicklertools die Websitedaten (Local Storage) löschen, dann gibt es noch kein Konto.

## Zwischenversionen V1 und V2

Die Dokumente beschreiben die Endversion. Die Zwischenversionen liegen im Gruppen-Repository unter `versionen/` mit eigenem `LIESMICH.md`:

- **V1** (`versionen/v1-html-css`): nur HTML und CSS auf Folienstand, mit klickbarem 2D-Lageplan; ihre Begriffe stehen in ihrem `LIESMICH.md`.
- **V2** (`versionen/v2-javascript`): der Pivot ohne PHP und ohne Konto; dafür gelten die Erklärungen in `pivot/docs/` außer `konto.md`.

## Spalte „Kurs“ in den Begriffstabellen

- **VL2 S.3** = Vorlesung 2, Folie 3 (die Folien liegen beim Dozenten).
- **VL5\*** = im Inhaltsverzeichnis von Vorlesung 4 (Folie 2–3) für die nächste CSS-Vorlesung angekündigt: Pseudoelemente, Hintergründe, Innenabstände, Rahmen, Außenabstände.
- **JS** = Thema der JavaScript-Vorlesung (VL6).
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
