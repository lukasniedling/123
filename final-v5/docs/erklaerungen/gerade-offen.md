# Gerade offen (unter der Karte auf `index.html`)

Erklärung für die Präsentation. Alle Fundstellen beziehen sich auf `final-v5/`. Am 13.10.2026 war „Gerade offen“ eine eigene Seite (`jetzt.html`). Seit dem 14.10.2026 steht es mit etwas Abstand **unter der Karte**. So ist alles auf einer Seite und übersichtlicher, und der Menüpunkt fällt weg.

## Was man sieht und warum

Der Teil hat ein orangefarbenes Band mit einem „Offen“-Schild. Darunter:

| Teil | Was er zeigt |
|---|---|
| **Statuszeile** | „Essen: 16 von 150 Orten mit bekannten Öffnungszeiten haben gerade geöffnet.“ |
| **Überrasch mich** | Ein zufälliger Ort, der zur gewählten Zeit offen hat, mit Route und „Merken“. „Noch ein Vorschlag“ zeigt einen anderen. |
| **Events heute** | Events des Tages, die noch laufen oder beginnen. |
| **Schließt bald** | Offene Orte, die in der nächsten Stunde schließen. |
| **Öffnet gleich** | Orte, die in der nächsten Stunde öffnen. |
| **Lange offen** | Offene Orte, die bis 23 Uhr oder länger offen bleiben. |

**Keine eigenen Knöpfe:** Tag, Uhrzeit und Kategorie kommen vom **Filter der Karte** oben. Stellt man dort „Freitag, 22:00, Trinken“ ein, zeigen auch die Listen Bars am Freitag um 22 Uhr. Die Überschrift heißt dann „Offen am Freitag um 22:00 Uhr“. Sogar beim Zeitraffer laufen die Listen mit.

**Ehrlich:** Berechnet wird nur aus Öffnungszeiten, nicht aus Besucherzahlen. Das steht unter der Überschrift.

**Was weggefallen ist:** Die Liste „Die 10 Quadrate mit den meisten offenen Orten“. Genau das zeigt die Karte schon mit ihren Farben.

## So führst du es vor

1. Startseite öffnen und unter die Karte scrollen.
2. Auf **Überrasch mich** drücken, dann **Noch ein Vorschlag**.
3. Oben die Kategorie auf **Trinken** stellen und den Regler auf 23 Uhr: Die Listen zeigen jetzt Bars, „Lange offen“ wird länger.
4. **Zeitraffer** starten und nach unten scrollen: Die Listen ändern sich mit.

## Aufbau des Quelltexts

| Datei | Aufgabe |
|---|---|
| `index.html` | das Gerüst unter der Karte `index.html:202`, leere Listen in Panels `index.html:219` |
| `js/gerade-offen.js` | rechnet und füllt die Listen (`window.GeradeOffen`) |
| `js/app.js` | startet den Teil `js/app.js:259` und zeichnet ihn nach jeder Filter-Änderung neu `js/app.js:244` |
| `css/gerade-offen.css` | Abstand zur Karte `css/gerade-offen.css:12`, zwei Spalten ab 64rem `css/gerade-offen.css:58`, die Karte von „Überrasch mich“ |

1. `moment()` `js/gerade-offen.js:54` fragt den Filter der Karte. Steht er auf „Jetzt“ (`Filter.isNow()` `js/gerade-offen.js:56`), nimmt es die echte Minute; der Regler kennt nur halbe Stunden. Sonst nimmt es Tag und Uhrzeit des Filters. Für die Events braucht es ein echtes Datum: den nächsten passenden Wochentag ab heute, `(Tag − heute + 7) % 7` `js/gerade-offen.js:63` Tage später.
2. `collect()` `js/gerade-offen.js:90` geht **einmal** durch alle Orte mit bekannten Zeiten der Kategorie des Filters. Für jeden fragt es `minutesUntilClose()`:
   - Kommt eine Zahl, ist der Ort offen. Er kommt zu „Überrasch mich“, bei höchstens 60 Minuten zu „Schließt bald“, und wenn er bis 23 Uhr offen ist, zu „Lange offen“.
   - Kommt `null`, ist er zu. Dann fragt es `minutesUntilOpen()`; bei höchstens 60 Minuten kommt er zu „Öffnet gleich“.
3. `sortByMinutes()` `js/gerade-offen.js:118` sortiert: bald zuerst, bei „Lange offen“ spät zuerst.
4. **Nicht überladen:** Jede Liste zeigt erst 3 Einträge `js/gerade-offen.js:27`. `moreButton()` `js/gerade-offen.js:141` baut darunter „Alle 12 anzeigen“ mit `aria-expanded`.
5. Jeder Ort hat links einen **Streifen in seiner Kategorie-Farbe** (`place--cat`, `placeItem()` `js/gerade-offen.js:164`). Der Link „Quadrat G1“ ist `#G1` und öffnet den Steckbrief oben auf derselben Seite.
6. Die Uhrzeit „schließt um …“ ist „gewählte Zeit + Minuten“; `% 1440` `js/gerade-offen.js:71` fängt nach Mitternacht wieder bei 00:00 an.
7. `surprise()` `js/gerade-offen.js:285` nimmt die offenen Orte, die `collect()` gesammelt hat, und lässt den letzten Vorschlag weg. Mit `Math.random()` und `Math.floor()` `js/gerade-offen.js:299` wählt es eine zufällige Stelle in der Liste. Hat nichts offen, zeigt es eine kleine Mond-Zeichnung (`.empty-moon` `css/gerade-offen.css:244`).
8. `setInterval(draw, 60 * 1000)` `js/gerade-offen.js:358` zeichnet jede Minute neu, damit „Jetzt“ der Uhr folgt.

## Begriffe aus dem Quelltext

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `setInterval()` | `js/gerade-offen.js:358` | Ruft eine Funktion immer wieder auf, hier jede Minute. | JS |
| `sort()` mit Vergleichsfunktion | `js/gerade-offen.js:119` | Negativ: a zuerst, positiv: b zuerst. | JS |
| Restwert `%` | `js/gerade-offen.js:71` | Nach 23:59 wieder bei 00:00. | JS |
| `Math.random()`, `Math.floor()` | `js/gerade-offen.js:299` | Zufallszahl und Abrunden: eine zufällige Stelle in der Liste. | JS |
| `role="status"` | `index.html:205` | Screenreader lesen die Statuszeile vor, wenn sie sich ändert. | – |
| Grid mit `repeat(2, …)` | `css/gerade-offen.css:58` | Zwei gleich breite Spalten ab 64rem. | – |
| `@keyframes` und `animation` | `css/gerade-offen.css:187` | Eine kleine Bewegung, wenn ein Vorschlag erscheint. | – |
| `@media (prefers-reduced-motion: reduce)` | `css/gerade-offen.css:198` | Keine Bewegung für Menschen, die das im System abgeschaltet haben. | – |

## Fragen, die der Dozent stellen könnte

1. **Woher wisst ihr, wo viel los ist?** Gar nicht. Wir zählen nur, was laut Öffnungszeiten offen hat, und schreiben das auch so hin.
2. **Warum keine eigene Seite mehr?** Karte und Listen beantworten dieselbe Frage. Unter der Karte nutzen sie denselben Filter, und man muss nichts doppelt einstellen.
3. **Wie kommen Karte und Listen zusammen?** `js/app.js` gibt dem Filter eine Funktion `onChange` mit. Sie ruft nach jeder Änderung `GeradeOffen.refresh()` auf `js/app.js:244`.
