# Offene Features

## Stand 2026-10-14: entschieden und gebaut

Am 13.10.2026 wurde entschieden, was davon gebaut wird. Gebaut ist es in `final-v4/`, der Fassung für die Präsentation:

| Punkt | Ergebnis |
|---|---|
| 1. Stecknadeln in Kategoriefarbe | **gebaut:** eine Nadel je gemerktem Ort in der Farbe seiner Kategorie, höchstens 6 je Quadrat, Legende „gemerkte Orte (Farbe = Thema des Ortes)“ |
| 2. Karte auf „Ort vorschlagen“ entfernen | **nein:** die OpenStreetMap-Karte bleibt (einziges `<iframe>` und Beispiel für den Inline-Stil) |
| 3. Auslastung je Quadrat | **nein:** keine verlässliche Datenquelle |
| 4. Gemerkte Orte per E-Mail | **nein**, stattdessen auf „Meine Orte“: „Als PDF speichern oder drucken“ und „Route zu allen Orten“ |
| neu: Orte suchen | **gebaut:** Seite „Orte finden“ (`suche.html`) mit Filtern Kategorie und „Nur jetzt geöffnet“ |
| neu: eigene Seite für gemerkte Orte | **gebaut:** „Meine Orte“ (`meine-orte.html`) mit Öffnungszeiten je Ort; `konto.html` nur noch für das Konto |
| neu: Gastkonto | **gebaut:** ohne Anmeldung merken, nur für den Tab; beim Anmelden kommen die Orte ins Konto |

Was `final-v4/` sonst noch enthält: `final-v4/LIESMICH.md`. Der Text darunter ist der ursprüngliche Stand vom 07.10.2026.

---

Stand: 2026-10-07 16:24. Ideen des Teams für die nächsten Schritte, noch nicht gebaut. Die Hinweise unter jedem Punkt sind eine erste Einschätzung (Claude Code) und noch nicht entschieden.

Gebaut wird wie bisher nur in `final/` (nie in `pivot/`), mit HTML, CSS und JavaScript, ohne Server: Die Seite muss weiter per Doppelklick auf `final/index.html` laufen.

## 1. Stecknadeln schöner und in der Farbe der Kategorie

**Idee:** Die Stecknadeln für gemerkte Orte sollen besser aussehen und die Farbe der Kategorie des gemerkten Ortes tragen (Essen, Trinken, Kultur, Shoppen).

**Hinweise:**
- Heute ist jede Stecknadel rot (`.map-pin` in `final/css/karte.css`, gesetzt mit `Karte.markieren()` in `final/js/karte.js`).
- Zu entscheiden: Was zeigt ein Quadrat, in dem Orte aus mehreren Kategorien gemerkt sind? Möglich wären eine Nadel je Kategorie, die Farbe der häufigsten Kategorie oder eine mehrfarbige Nadel.
- Dafür muss `Karte.markieren()` statt einer Liste von Codes auch die Kategorie bekommen, zum Beispiel `{ "G2": ["essen", "trinken"] }`. Die Farben gibt es schon als CSS-Variablen der Kategorien.
- Die Legende unter der Karte muss dazu passen.

## 2. OpenStreetMap-Karte auf „Ort vorschlagen“ entfernen

**Idee:** Auf `vorschlagen.html` soll nur noch das Formular stehen.

**Hinweise, bitte vorher klären:**
- **Pflicht-Element:** Team-Übung 2 (Vorlesung 3, Folie 4) verlangt: „versuchen Sie auf einer Unterseite mit `<iframe>` fremde Webseiten-Inhalte zu integrieren“. Die OpenStreetMap-Karte ist unser einziges `<iframe>`. Wird sie gelöscht, fehlt dieses Element, außer das `<iframe>` zieht auf eine andere Seite um (zum Beispiel „Über uns“) oder der Dozent verzichtet darauf.
- **Inline-Stil:** Der Datenschutz-Hinweis unter der Karte ist das einzige Beispiel für das Attribut `style`, das dieselbe Übung verlangt („Inlineverfahren style“). Es muss an eine andere Stelle umziehen.
- Danach anpassen: `datenschutz.html` (Abschnitt „OpenStreetMap-Karte“), `final/css/formular.css` (zweispaltiges Layout), `final/docs/erklaerungen/vorschlagen.md` und `impressum-datenschutz.md`.

## 3. Auslastung je Quadrat und Uhrzeit

**Idee:** Eine Anzeige, wie voll ein Quadrat zu einer Uhrzeit ist: wie viele Leute wann wo was besuchen, zum Beispiel eine Zahl pro Uhrzeit und Quadrat.

**Hinweise:**
- **Offen ist die Datenquelle.** Ohne echte Daten wäre jede Zahl erfunden. Zu prüfen sind zum Beispiel:
  - öffentliche Passantenzählungen in Einkaufsstraßen (etwa Zählstellen auf den Planken, falls es sie gibt),
  - Open Data der Stadt Mannheim,
  - Daten des Stadtmarketings.
  
  Nichts davon ist bisher geprüft.
- Google „Stoßzeiten“ hat keine offizielle Schnittstelle; Daten dort abzugreifen verstößt gegen die Nutzungsbedingungen. Davon raten wir ab.
- Notlösung ohne echte Daten: eine **Schätzung** aus der Zahl der gerade geöffneten Orte, deutlich als Schätzung beschriftet. Das kann die Karte heute schon fast (der Filter zählt die geöffneten Orte).
- Technisch passt es ins bestehende Muster: eine Datendatei `js/data/auslastung.js` mit einer Zahl je Quadrat und Stunde, angezeigt im Steckbrief oder als eigene Einfärbung der Karte.
- Die Quelle und ihre Lizenz müssen im Impressum stehen, wie bei OpenStreetMap.

## 4. Gemerkte Orte per E-Mail an den Nutzer

**Idee:** Der Nutzer bekommt die Infos zu seinen gemerkten Orten einfach zugeschickt (oder auf einem ähnlich einfachen Weg), damit er sie unterwegs griffbereit hat.

**Hinweise:**
- **Echtes Versenden geht nur mit einem Server** (zum Beispiel PHP mit einem Mailserver) oder einem fremden Versanddienst. Beides passt nicht zu „ohne Server, per Doppelklick“. Ein fremder Dienst würde außerdem Namen und E-Mail-Adressen an Dritte geben; das müsste in die Datenschutzerklärung.
- **Ohne Server möglich:**
  - Ein Knopf „Per E-Mail schicken“ auf `konto.html` öffnet mit einem `mailto:`-Link das E-Mail-Programm des Nutzers, mit fertigem Betreff und der Liste der Orte (Name, Adresse, Quadrat, Öffnungszeiten) im Text. Der Nutzer drückt selbst auf Senden. Sehr lange Listen können dabei abgeschnitten werden.
  - Weitere Wege: „Liste kopieren“ in die Zwischenablage oder eine druckbare Ansicht (auch als PDF speicherbar).
- Empfehlung für den Anfang: den `mailto:`-Knopf, weil er Kursstoff ist (Vorlesung 2) und keinen Server braucht.

## Reihenfolge (Vorschlag)

1. Punkt 2 klären (Pflicht-Element `<iframe>`, Inline-Stil), dann umsetzen.
2. Punkt 1 (Stecknadeln): klein und gut sichtbar in der Präsentation.
3. Punkt 4 mit `mailto:`.
4. Punkt 3 erst, wenn eine Datenquelle gefunden ist.
