# Die Daten: woher sie kommen und wie sie entstehen

Erklärung für die Präsentation. Zeilennummern und Zahlen erzeugt am 2026-09-29 11:54 aus den aktuellen Dateien. Pfade wie `js/data/orte.js` gelten in beiden Varianten; Pfade, die mit `tools/` oder `data/` beginnen, liegen im Projektordner und sind **nicht** Teil der Website.

**Vorschlag für die Präsentation:** Matti Katila (Inhalte und Anforderungen), zusammen mit [quadrate.md](quadrate.md). Die ganze Aufteilung für alle fünf steht in [README.md](README.md) unter „Vorschlag: wer präsentiert was“.

## Worum es geht und warum so

Die Website braucht drei Arten von Daten: **Orte** mit Kategorie und Öffnungszeiten, **Texte und Fotos** zu den Quadraten und die **Formen der Karte**.

- **Orte und Kartenformen kommen aus OpenStreetMap (OSM)**, einer freien Weltkarte, an der Freiwillige mitarbeiten. OSM kennt alle Quadrate als Umrisse (`place=city_block`) und die Geschäfte, Lokale und Kulturorte darin, oft mit Öffnungszeiten. Google Maps oder Yelp kamen nicht in Frage: Deren Bedingungen verbieten es, Daten auszulesen (Entscheidung D-006).
- **Die Daten wurden einmal abgerufen (Stand 28.09.2026) und als Dateien gespeichert**, nicht bei jedem Seitenaufruf live geladen. So läuft die Website auch ohne Internet und per Doppelklick, der Browser verbindet sich mit keinem fremden Dienst (Datenschutz), und alle sehen dieselben Daten.
- **Lizenz ODbL**: OSM-Daten stehen unter der Open Database License 1.0. Sie erlaubt die Nutzung, verlangt aber (1) den Hinweis „© OpenStreetMap-Mitwirkende“ mit Link und (2) dass abgeleitete Datenbanken wieder unter der ODbL stehen. Deshalb steht der Hinweis in der Fußzeile jeder Seite, und unsere Dateien `js/data/orte.js` und `js/data/karte-daten.js` nennen die ODbL im Kopfkommentar.
- **Texte zu den Quadraten** sind von Hand geschrieben und belegt (Wikipedia, Stadt Mannheim, MARCHIVUM, OSM); die Quellen je Quadrat stehen in `web/quadrate_sources.md` im Projektordner. **Fotos** kommen von Wikimedia Commons mit freien Lizenzen.

## Der Weg der Daten

```
OpenStreetMap
  │  einmaliger Abruf über die Overpass API (28.09.2026)
  ▼
data/osm/*.json                       Rohdaten im Projektordner (nicht im Git, nicht auf der Website)
  │
  ├─ tools/export_orte.py        ──▶  js/data/orte.js          Orte, Kategorien, Öffnungszeiten
  ├─ tools/make_v3.py (Geometrie)
  │    ├─ tools/export_karte_svg.py    ──▶  variante-svg/js/data/karte-daten.js
  │    └─ tools/export_karte_css3d.py  ──▶  variante-css3d/js/data/karte-daten.js (+ img/boden.svg …)
  └─ tools/export_verzeichnis.py ──▶  quadrate.html            Tabelle aus orte.js und quadrate.js

von Hand (mit Quellen):              js/data/quadrate.js, js/data/fotos.js
```

Die Overpass API ist eine Abfrage-Schnittstelle für OSM-Daten. Jede Rohdatei trägt den Zeitstempel ihres Datenstands `data/osm/pois.json:5`. Ein Skript für den Abruf liegt nicht im Ordner `tools/`; die Werkzeuge dort arbeiten nur mit den gespeicherten Rohdaten.

## Die Datendateien der Website

| Datei | Globale Variable | Inhalt | entsteht durch | benutzt von |
|---|---|---|---|---|
| `js/data/orte.js` | `window.ORTE`, `window.ORTE_META` | 995 Orte mit Kategorie, Quadrat, Adresse und Öffnungszeiten; Quelle, Datum und Lizenz | `tools/export_orte.py` | `js/filter.js`, `js/steckbrief.js`, `php/lib.php`, `tools/export_verzeichnis.py` |
| `js/data/quadrate.js` | `window.QUADRATE` | alle 146 Quadrate mit Reihe, Seite, Art, Name, Text, Quelle, Foto | von Hand, belegt | `js/steckbrief.js`, `js/app.js`, `php/lib.php`, `tools/export_verzeichnis.py` |
| `js/data/fotos.js` | `window.FOTOS` | Fotos mit Alternativtext, Urheber, Lizenz und Quelle | von Hand (Wikimedia Commons) | `js/steckbrief.js` |
| `js/data/karte-daten.js` | `window.KARTE_DATEN` | Formen der Karte, je Variante verschieden | `tools/export_karte_svg.py` bzw. `tools/export_karte_css3d.py` | `js/karte.js` |

Die 995 Orte verteilen sich auf 224 Essen, 154 Trinken, 54 Kultur und 563 Shoppen. Bei 425 Orten sind die Öffnungszeiten unbekannt (`zeiten: null`), weil sie in OSM fehlen oder nicht eindeutig lesbar sind; diese Orte zählen auf der Karte nicht als geöffnet.

### Warum JavaScript-Dateien und keine JSON-Dateien?

Eine JSON-Datei müsste die Seite mit `fetch()` laden. Das verbieten Browser, wenn die Seite per Doppelklick (`file://`) geöffnet ist. Eine JavaScript-Datei, die mit `<script src>` geladen wird, funktioniert immer: Sie legt die Daten in eine globale Variable, zum Beispiel `window.ORTE = [ ... ]` `js/data/orte.js:20`. Die Werte sind trotzdem gültiges JSON (Schlüssel in Anführungszeichen), damit auch PHP sie lesen kann `php/lib.php:562`.

### Ein Ort in `orte.js`

`js/data/orte.js:21`:

```js
{ "id": "n1209279102", "osm": "node/1209279102", "name": "Café Sammo Zén", "kat": "trinken", "typ": "cafe",
  "quadrat": "A3", "adresse": null, "oh": "Mo-Fr 07:00-20:00; Sa 09:00-19:00; Su 10:00-19:00",
  "zeiten": [[[420,1200]],[[420,1200]],[[420,1200]],[[420,1200]],[[420,1200]],[[540,1140]],[[600,1140]]] }
```

- `id` und `osm`: die Kennung des Objekts in OSM (`n` = node, ein Punkt; `w` = way, meist ein Umriss wie der eines Gebäudes).
- `kat`: unsere Kategorie; `typ`: der OSM-Wert (`cafe`), den der Steckbrief ins Deutsche übersetzt.
- `quadrat`: das Quadrat, in dessen Umriss der Ort liegt (per Geometrie bestimmt, schon in den Rohdaten).
- `oh`: die Öffnungszeiten, wie sie in OSM stehen (`opening_hours`).
- `zeiten`: dieselben Zeiten übersetzt in sieben Listen, Montag bis Sonntag, mit Spannen in Minuten seit Mitternacht. `[420, 1200]` heißt 07:00 bis 20:00. `null` heißt unbekannt.

## Wie `tools/export_orte.py` die Orte erzeugt

Das Werkzeug ist ein Python-Programm, das einmal auf dem Rechner eines Entwicklers läuft (`python3 tools/export_orte.py`):

1. Es liest die benannten Orte aus den Rohdaten `tools/export_orte.py:61` und wirft Orte ohne Namen oder außerhalb der Quadrate hinaus `tools/export_orte.py:601`.
2. **Kategorie** `tools/export_orte.py:465`: Restaurants und Imbisse zu Essen, Cafés, Bars und Kneipen zu Trinken, Museen, Theater, Kinos, Bibliotheken und Kirchen zu Kultur, Geschäfte zu Shoppen. Dienstleister wie Friseure, Reisebüros oder Wettbüros verkaufen keine Waren und fallen aus Shoppen heraus `tools/export_orte.py:408`.
3. **Adresse** `tools/export_orte.py:515` in der Mannheimer Schreibweise „M 2, 11“.
4. **Öffnungszeiten** `tools/export_orte.py:351`: Ein kleiner Übersetzer zerlegt den OSM-Text wie „Mo-Fr 11:00-19:00; Sa 11:00-18:00“ zuerst in Bausteine (Wochentage, Uhrzeiten, Zeichen) mit einem regulären Ausdruck `tools/export_orte.py:104` und baut daraus die sieben Minutenlisten. Was er nicht sicher versteht (Monate, Feiertagsregeln, Kommentare, mehrdeutige Angaben), wird „unbekannt“ statt geraten `tools/export_orte.py:115`.
5. **Doppelte** Einträge desselben Ortes (gleicher Name, gleiches Quadrat, höchstens 10 m auseinander) werden zusammengefasst `tools/export_orte.py:579`.
6. **Datum** aus dem Zeitstempel der Rohdaten, in deutscher Zeit `tools/export_orte.py:552`.
7. **Schreiben** der Datei mit Kopfkommentar und Lizenzhinweis `tools/export_orte.py:664`.
8. **Tests**: Vor dem Schreiben prüft das Werkzeug seinen Übersetzer an festen Beispielen `tools/export_orte.py:716`; schlägt ein Test fehl, wird `orte.js` nicht geschrieben `tools/export_orte.py:969`.

## Texte und Fotos

- `js/data/quadrate.js`: Der Kopfkommentar beschreibt jedes Feld `js/data/quadrate.js:12`. Beispiel Marktplatz `js/data/quadrate.js:159`: `art: "platz"`, `name: "Marktplatz"`, ein kurzer Text, die Quelle und der Schlüssel des Fotos.
- `js/data/fotos.js`: je Foto Datei, Alternativtext, Urheber, Lizenz mit Link und Quelle `js/data/fotos.js:33`. Erlaubt waren nur freie Lizenzen (CC0, gemeinfrei, CC BY, CC BY-SA) `js/data/fotos.js:14`; die Fotos wurden nur auf 1200 Pixel Breite verkleinert.

## Wo die Website die Daten benutzt und nennt

- `js/filter.js` zählt in einer Schleife über `window.ORTE` die geöffneten Orte je Quadrat `js/filter.js:72`.
- `js/steckbrief.js` sammelt die Orte eines Quadrats `js/steckbrief.js:106` und schreibt unter die Liste Quelle, Lizenz und Datenstand `js/steckbrief.js:352`.
- Jede Seite nennt OSM in der Fußzeile `index.html:179`; unter der Karte steht der Datenstand `index.html:158`; das Impressum erklärt die Lizenz der abgeleiteten Dateien `impressum.html:115`.
- `php/lib.php` liest `orte.js` und `quadrate.js` auf dem Server, um gesendete Quadrate und gemerkte Orte zu prüfen `php/lib.php:599`.

## Daten aktualisieren

1. Neue Rohdaten nach `data/osm/` legen (neuer Abruf über die Overpass API).
2. `python3 tools/export_orte.py` schreibt `js/data/orte.js` neu.
3. `python3 tools/export_verzeichnis.py` baut `quadrate.html` neu, weil sich die Zahlen je Quadrat ändern.
4. Für neue Kartenformen: `python3 tools/export_karte_svg.py` und `python3 tools/export_karte_css3d.py`.
5. `zsh tools/sync_varianten.sh` kopiert die gemeinsamen Dateien in die CSS-3D-Variante.
6. Das Datum „Stand 28.09.2026“ unter der Karte (`index.html`) und auf „Ort vorschlagen“ von Hand anpassen; `quadrate.html` und der Steckbrief nehmen es aus den Daten.

## Begriffe

Spalte „Kurs“: **JS** = Thema der JavaScript-Vorlesung (VL6), **PHP** = Thema der PHP-Vorlesung (VL7). **–** = nicht in den Folien (Python ist kein Kursstoff, es läuft nur auf dem Rechner der Entwickler).

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| globale Variable `window.ORTE` | `js/data/orte.js:20` | Eine Variable am Fensterobjekt, die jedes später geladene Skript lesen kann. | JS |
| Array `[ ... ]` | `js/data/orte.js:20` | Liste der Orte, jeder Ort ein Eintrag mit Position 0, 1, 2 … | JS |
| Objekt `{ "schlüssel": wert }` | `js/data/orte.js:19` | Werte unter Namen: Quelle, Datum, Lizenz. | JS |
| Objekt als Nachschlagetabelle | `js/data/quadrate.js:35` | Unter jedem Code („G1“) steht ein Objekt; `window.QUADRATE["G1"]` findet es direkt. | JS |
| JSON | `js/data/orte.js:6` | Textformat für Daten aus Objekten und Arrays; Schlüssel stehen in Anführungszeichen. | JS |
| `null` | `js/data/orte.js:23` | „kein Wert“: Die Öffnungszeiten dieses Ortes sind unbekannt. | JS |
| verschachtelte Arrays | `js/data/orte.js:21` | Sieben Tage, je Tag eine Liste von Spannen, jede Spanne `[Beginn, Ende]` in Minuten. | JS |
| Kopfkommentar mit Lizenz | `js/data/orte.js:16` | Nennt Quelle und Lizenz der abgeleiteten Datenbank, wie die ODbL es verlangt. | – |
| Laden per `<script src>` | `index.html:191` | Die Datendatei wird vor den Skripten geladen, die sie benutzen. | JS |
| Schleife über die Orte | `js/filter.js:72` | `length` ist die Zahl der Einträge; die Schleife geht jeden Ort einmal durch. | JS |
| Zugriff über den Schlüssel | `js/steckbrief.js:382` | Holt den Eintrag eines Quadrats mit seinem Code. | JS |
| `json_decode` in PHP | `php/lib.php:587` | PHP schneidet den Wert aus der JavaScript-Datei und macht daraus ein PHP-Array. | PHP |
| Overpass-Zeitstempel | `data/osm/pois.json:5` | Zeitpunkt des OSM-Datenstands, aus dem das Werkzeug „Stand 28.09.2026“ macht. | – |
| Python-Funktion `def` | `tools/export_orte.py:351` | So beginnt in Python eine Funktion (in JavaScript `function`). | – |
| regulärer Ausdruck | `tools/export_orte.py:104` | Ein Suchmuster, das Uhrzeiten wie „11:00“, Wochentage wie „Mo“ und Zeichen wie „-“ erkennt. | – |
| Ausnahme (`Exception`) | `tools/export_orte.py:115` | Ein Fehler, den der Übersetzer auslöst, wenn er Öffnungszeiten nicht sicher versteht; der Ort bekommt dann `null`. | – |
| `json.dumps` | `tools/export_orte.py:660` | Schreibt einen Python-Wert als JSON-Text in die Datei. | – |
| Unit-Test | `tools/export_orte.py:818` | Prüft den Übersetzer an Beispielen mit bekanntem Ergebnis, bevor Daten geschrieben werden. | – |

## Fragen, die der Dozent stellen könnte

1. **Woher kommen die Orte, und dürft ihr sie verwenden?**
   Aus OpenStreetMap, einer freien Karte. Die Lizenz ODbL erlaubt die Nutzung, wenn wir OSM nennen („© OpenStreetMap-Mitwirkende“ mit Link, auf jeder Seite in der Fußzeile) und unsere abgeleiteten Daten wieder unter die ODbL stellen; das steht in den Datendateien und im Impressum. Daten von Google Maps oder Yelp auszulesen, verbieten deren Bedingungen.

2. **Warum holt die Seite die Daten nicht live aus dem Internet?**
   Die Seite soll auch per Doppelklick und ohne Internet laufen, und der Browser soll sich mit keinem fremden Dienst verbinden (Datenschutz). Deshalb wurden die Daten einmal abgerufen (Stand 28.09.2026) und liegen als Dateien bei der Website. Der Nachteil: Neue Geschäfte oder geänderte Zeiten erscheinen erst nach einem neuen Abruf; deshalb nennt die Seite den Datenstand und „ohne Gewähr“.

3. **Wie wird aus „Mo-Fr 11:00-19:00“ etwas, womit JavaScript rechnen kann?**
   Das Python-Werkzeug `tools/export_orte.py` übersetzt den Text vorher in sieben Listen, Montag bis Sonntag, mit Spannen in Minuten seit Mitternacht: `[[660, 1140]]` an jedem Werktag. Im Browser prüft `Oeffnungszeiten.isOpen()` dann nur noch, ob die gewählte Minute in einer Spanne liegt. Spannen über Mitternacht haben ein Ende über 1440.

4. **Warum steht bei vielen Orten „unbekannt“?**
   Weil in OpenStreetMap für diese Orte keine Öffnungszeiten eingetragen sind oder sie so geschrieben sind, dass unser Übersetzer sie nicht sicher versteht (zum Beispiel mit Monaten oder Feiertagsregeln). Dann raten wir nicht, sondern speichern `null`. Diese Orte zählen auf der Karte nicht als geöffnet; die Zusammenfassung unter der Karte sagt, wie viele es in der Kategorie sind.

5. **Warum sind die Daten JavaScript-Dateien und keine JSON-Dateien?**
   Eine JSON-Datei müsste mit `fetch()` geladen werden, und das ist bei `file://` gesperrt. Eine JavaScript-Datei mit `window.ORTE = [...]` lädt ein normales `<script src>`. Die Werte darin sind trotzdem gültiges JSON, damit PHP sie mit `json_decode()` lesen kann.
