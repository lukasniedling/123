# Quadrate

Gruppenprojekt im Modul Webprogrammierung, DHBW Mannheim, 2026.

**Quadrate** zeigt die Mannheimer Innenstadt als 3D-Karte mit allen 146 Quadraten. Du wählst Tag, Uhrzeit und Kategorie (Essen, Trinken, Kultur, Shoppen), und die Karte färbt jedes Quadrat danach, wie viele passende Orte gerade offen haben. Ein Klick auf ein Quadrat öffnet seinen Steckbrief. Orte kannst du suchen und merken, als Gast oder mit einem Konto.

Gebaut mit HTML, CSS und JavaScript, ohne Frameworks und ohne Server.

## Website öffnen

**`final-v4/index.html` doppelklicken.** Das ist die Fassung für die Präsentation. Kein Server, kein XAMPP, keine Installation. Die anderen Versionen öffnest du genauso: `final/index.html` (Endabgabe), `final-v2/index.html` (Version 2), `final-v3/index.html` (Version 3).

Konto, gemerkte Orte und Vorschläge aus dem Formular speichert die Seite in deinem Browser (localStorage, als Gast sessionStorage). Sie gelten deshalb nur in diesem Browser auf diesem Rechner. Bitte kein echtes Passwort benutzen, es wird unverschlüsselt gespeichert.

## Was liegt wo?

| Ordner | Inhalt |
|---|---|
| `final/` | **Die Endabgabe.** Erklärungen für die Präsentation: `final/docs/erklaerungen/README.md` |
| `final-v2/` | **Endversion, Version 2** (Stand 12.10.2026): Kopie von `final/` mit Konto per E-Mail und Bestätigungscode, weichen Übergängen der Tageszeiten, Pfeil-Knöpfen am Zeitregler und dem Steckbrief als Fenster über der Karte. Was neu ist: `final-v2/LIESMICH.md`. `final/` bleibt unverändert. |
| `final-v3/` | **Endversion, Version 3** (Stand 13.10.2026, Niko Eibach): Kopie von `final-v2/` mit neuen Seiten „Gerade offen“, „Events“ (mit „Event melden“) und „Merkliste“ (auch ohne Konto, PDF, „Treffen planen“ mit Einladung per E-Mail), Ortssuche auf „Orte“ (vorher „Quadrate“), „schließt bald“, Route und „Events hier“ im Steckbrief und einem Menü mit 6 Reitern. Öffnen mit `final-v3/index.html`. Was gemacht wurde und warum: `final-v3/LIESMICH.md`. `final/` und `final-v2/` bleiben unverändert. |
| `final-v4/` | **Endversion, Version 4: die Fassung für die Präsentation** (Stand 14.10.2026). Grundlage `final-v2/`, dazu die Seiten „Orte finden“ (Suche mit Filtern) und „Meine Orte“ (Öffnungszeiten, PDF, Route zu allen Orten), Merken als Gast, Stecknadeln in Kategoriefarben, eine überarbeitete Startseite und aus `final-v3/` „schließt bald“ und die Route-Links. In Chrome und Safari bei 320 bis 1920 px getestet. Was neu ist: `final-v4/LIESMICH.md`, Erklärungen: `final-v4/docs/erklaerungen/README.md`. |
| `final-v5/` | **Endversion, Version 5** (Stand 14.10.2026, Niko Eibach): Kopie des letzten Stands von `final-v3/`. Karte mit „Gerade offen“ darunter, Zeitraffer, „In meiner Nähe“ und Merkmalen der Orte (vegan, draußen sitzen …); Seiten Events (mit Monatsansicht und „Event melden“), Orte (Suche) und Merkliste (mit „Tag planen“ und „Treffen planen“); farbige Seitenbänder und eigene Zeichnungen. Erklärung: `final-v5/LIESMICH.md` |
| `versionen/v1-html-css/` | Zwischenstand V1: nur HTML und CSS |
| `versionen/v2-javascript/` | Zwischenstand V2: dazu JavaScript |
| `pivot/` | Der gemeinsame Stand vom 29.09.2026 (Tag `pivot-2026-09-29`), noch mit PHP. **Nur lesen, nie ändern.** |

Die erste Endfassung mit PHP (Anmelden über Sessions, Server nötig) ist archiviert: Git-Tag `final-php-2026-10-07`. Ansehen mit `git checkout final-php-2026-10-07`, zurück mit `git checkout main`.

## Offene Features

Welche Ideen gebaut wurden (in `final-v4/`) und welche nicht: [OFFENE-FEATURES.md](OFFENE-FEATURES.md).

## Das Projekt von Claude Code erklären lassen

Claude Code liest die Datei `CLAUDE.md` in diesem Repo und kennt dadurch Aufbau, Erklärungen und Regeln des Projekts.

**Du brauchst:** Zugriff auf dieses private Repo und ein Claude-Konto mit Claude Code (Pro, Max, Team oder Enterprise; laut https://code.claude.com/docs/en/setup, abgerufen am 29.09.2026).

1. Claude Code installieren (einmalig):
   - macOS und Linux, im Terminal: `curl -fsSL https://claude.ai/install.sh | bash`
   - Windows, in PowerShell: `irm https://claude.ai/install.ps1 | iex`
2. Repo holen und in den Ordner wechseln:
   ```
   git clone https://github.com/Matti29/mannheim-quadrate.git
   cd mannheim-quadrate
   ```
   (Oder mit GitHub Desktop: „Clone a repository“.)
3. `claude` eingeben. Beim ersten Start meldest du dich im Browser an.
4. Auf Deutsch fragen, zum Beispiel:
   - „Erklär mir die Startseite Schritt für Schritt.“
   - „Wie funktioniert die 3D-Karte mit CSS?“
   - „Wie funktioniert das Konto mit localStorage?“
   - „Ich stelle ‚Ort vorschlagen‘ vor. Was muss ich erklären können, und was fragt der Dozent?“
5. Beenden mit `/exit`.

Claude antwortet mit Fundstellen wie `final-v4/js/app.js:56`. Zum Erklären muss es nichts ändern: Fragt es, ob es eine Datei ändern darf, im Zweifel „Nein“ wählen.

## Wer präsentiert was (Vorschlag)

| Person | Rolle | Teil |
|---|---|---|
| Matti Katila | Inhalte und Anforderungen | Quadrate, Daten und Lizenzen, Impressum und Datenschutz |
| Nikita Ermotschenko | Design und Kreativität | Über uns, das gemeinsame Design |
| Niko Eibach | Programmierung | Karte: Filter, Steckbrief, 3D-Karte |
| Anes Sahbegovic | Programmierung | Konto, Meine Orte, Merken als Gast |
| Lukas Niedling | Tests und Präsentation | Ort vorschlagen, Ablauf der Vorführung |

Neu in `final-v4/` ist die Seite „Orte finden“; wer sie vorstellt, ist noch offen. Ablauf und Details: `final-v4/docs/erklaerungen/README.md`.

## Git kurz

`git pull` vor dem Arbeiten, nur in `final/`, `final-v2/`, `final-v3/`, `final-v4/`, `final-v5/` oder `versionen/` ändern, vor dem Commit `git status` prüfen, nie `git push --force`.

## Lizenzen

Orte und Kartenumrisse: © OpenStreetMap-Mitwirkende, ODbL 1.0 (Hinweis in jeder Fußzeile, muss bleiben). Fotos: Wikimedia Commons, Urheber und Lizenz neben jedem Foto und im Impressum. Logo-Schrift Archivo: SIL Open Font License 1.1.

E-Mail und Telefon im Impressum (info@quadrate.com, +49 178 67123467) sind erfundene Platzhalter. Bitte nie dorthin schreiben oder anrufen.
