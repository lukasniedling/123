# Events (`events.html`)

Erklärung für die Präsentation. Neu am 13.10.2026. Alle Fundstellen beziehen sich auf `final-v5/`.

## Was die Seite zeigt und warum

- **Alle Termine** der nächsten Tage, nach Tag geordnet („heute“, „morgen“, „Do, 15.10.“): Uhrzeit, Titel, Art, Ort mit Link zum Quadrat auf der Karte, Route, ein kurzer Text. Läuft ein Event gerade, steht dort „läuft gerade“.
- **Hervorgehoben:** bezahlte Einträge erscheinen zusätzlich oben als Karten, immer mit dem Wort **Anzeige** und „Anzeige von …“.
- Filter **Zeitraum** (heute, 7 Tage, 30 Tage) und **Art** (Musik, Kultur, Markt, …).
- Ein Kasten **Für Veranstalter** erklärt das Modell: Eintrag kostenlos, Hervorhebung gegen Bezahlung.
- Auf **Gerade offen** zeigt der Bereich „Events heute“ die Events, die heute noch laufen oder beginnen.

**Woher kommen die Events?** Es gibt keine offene Schnittstelle der Stadt, die wir nutzen dürften, und ohne Server könnte die Seite ohnehin nichts live von einer fremden Website laden. Deshalb ist die Idee: Das Team trägt Events von Hand in eine Datendatei ein (`js/data/events.js`), wie bei den Orten.

**Alle Einträge sind erfundene Beispiele.** Das steht oben auf der Seite in einem gelben Hinweis `events.html:64` und am Anfang der Datendatei. Vor einem echten Einsatz müssten sie durch geprüfte Termine ersetzt werden. Beschreibungen anderer Websites dürfen nicht abgeschrieben werden (Urheberrecht): eigener kurzer Text und Link zur Originalseite.

**Warum „Anzeige“?** Bezahlte Werbung muss in Deutschland als solche erkennbar sein. Deshalb steht bei jedem bezahlten Eintrag das Wort „Anzeige“ als Text, nicht nur eine Farbe.

## So führst du es vor

1. Menü **Events**: gelber Hinweis „Beispiel-Einträge“, oben zwei hervorgehobene Anzeigen, darunter die Tage.
2. **Zeitraum** auf „Nächste 30 Tage“, **Art** auf „Markt“: Der Samstagsmarkt erscheint jeden Samstag, dazu der Flohmarkt am 07.11.
3. Bei einem Event auf „Quadrat …“: Die Karte öffnet den Steckbrief des Quadrats.
4. Menü **Gerade offen**: der Bereich „Events heute“.

## Aufbau des Quelltexts

| Datei | Aufgabe |
|---|---|
| `js/data/events.js` | die Events als Daten (`window.EVENTS`), mit Erklärung aller Felder im Kopf |
| `js/events.js` | rechnet die Termine aus: an welchen Tagen, läuft es gerade, Texte für Tag und Uhrzeit (`window.Events`) |
| `events.html` | Gerüst: Hinweis, Filter, „Hervorgehoben“, Liste, Kasten für Veranstalter |
| `js/events-seite.js` | füllt `events.html` |
| `css/events.css` | Aussehen: Karten der Anzeigen, Tage, das Wort „Anzeige“ |
| `js/gerade-offen.js` | `fillEvents()` für „Events heute“ unter der Karte auf `index.html` |

### Die Daten (`js/data/events.js`)

Jedes Event hat **eine** von drei Arten von Datum: einen Tag (`"datum": "2026-10-24"`), einen Zeitraum (`"von"`, `"bis"`, z. B. der Wintermarkt) oder Wochentage (`"wochentage": [3]` = jeden Donnerstag, 0 = Montag). Beginn und Ende stehen als `"HH:MM"`. Bezahlte Einträge haben `"anzeige": true` und einen `"anbieter"` `js/data/events.js:53`.

### `js/events.js`: wann findet ein Event statt?

1. `takesPlaceOn()` `js/events.js:58` prüft für einen Tag die drei Arten von Datum. Beim Zeitraum reicht ein Textvergleich `js/events.js:64`: Daten in der Form „2026-11-23“ sortieren als Text genauso wie als Datum.
2. `between()` `js/events.js:125` geht Tag für Tag durch den Zeitraum. `new Date(Jahr, Monat, Tag + d)` `js/events.js:130` rechnet auch über das Monatsende richtig. Für jeden passenden Tag entsteht ein „Termin“ mit Beginn und Ende in Minuten. Endet ein Event früher als es beginnt (23:00 bis 04:00), geht es über Mitternacht: Das Ende bekommt 1440 Minuten dazu `js/events.js:137`.
3. `isRunning()` `js/events.js:156` prüft, ob ein Termin gerade läuft, auch ein Event von gestern Abend, das nach Mitternacht noch läuft `js/events.js:164`. `isOver()` `js/events.js:170` sagt, ob er vorbei ist.
4. `dayText()` `js/events.js:180` macht „heute“, „morgen“ oder „Do, 15.10.“, `repeatText()` `js/events.js:204` „jeden Donnerstag“ oder „täglich 23.11.–23.12.“.

### `js/events-seite.js`: die Seite

1. `draw()` `js/events-seite.js:425` ruft in der Listenansicht `drawList()` `js/events-seite.js:310` auf. Die holt die Termine ab gestern `js/events-seite.js:313` (wegen Events, die noch von letzter Nacht laufen) und lässt vorbei-gegangene, andere Arten und nicht gesuchte weg `js/events-seite.js:317`.
2. `fillHighlights()` `js/events-seite.js:224` zeigt jede Anzeige nur einmal, mit ihrem nächsten Termin `js/events-seite.js:231`.
3. `fillDays()` `js/events-seite.js:244` beginnt bei jedem neuen Tag einen neuen Kasten mit Überschrift `js/events-seite.js:254`.
4. `eventItem()` `js/events-seite.js:75` baut ein Event mit `createElement` und `textContent`. Bei Anzeigen kommt das Wort „Anzeige“ dazu `js/events-seite.js:176`.
5. Die Route nutzt `Steckbrief.routeUrl()` mit dem Ort und dem Quadrat des Events `js/events-seite.js:66`.
6. `setInterval` `js/events-seite.js:476` zeichnet jede Minute neu, damit „läuft gerade“ stimmt.

## Begriffe aus dem Quelltext

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Array von Objekten (Daten) | `js/data/events.js:34` | Jedes Event ist ein Objekt mit festen Schlüsseln. | JS |
| `new Date(Jahr, Monat, Tag)` | `js/events.js:130` | Baut ein Datum; Monate zählen ab 0 (Januar = 0). | JS |
| Textvergleich `<=` | `js/events.js:64` | „2026-11-23“ ≤ „2026-12-01“ stimmt auch als Text. | JS |
| `indexOf()` | `js/events-seite.js:231` | Wurde diese Anzeige schon gezeigt? `-1` heißt nein. | JS |
| `setInterval()` | `js/events-seite.js:476` | Ruft `draw()` jede Minute wieder auf. | JS |
| Grid mit `auto-fill` | `css/events.css:62` | So viele Karten nebeneinander, wie hineinpassen, jede mindestens 18rem breit. | – |
| `<aside>` | `events.html:150` | Nebeninhalt: der Kasten für Veranstalter. | – |

## Fragen, die der Dozent stellen könnte

1. **Woher kommen die Events, sind die echt?** Nein, es sind erfundene Beispiele, und die Seite sagt das. Im echten Betrieb würde das Team sie eintragen.
2. **Warum holt ihr die Events nicht automatisch von einer anderen Seite?** Ohne Server und ohne offene, lizenzierte Schnittstelle geht das nicht. Fremde Seiten erlauben solche Abrufe meist nicht, und ihre Texte sind urheberrechtlich geschützt.
3. **Ist das Geschäftsmodell erlaubt?** Bezahlte Hervorhebung ist üblich, muss aber als Werbung erkennbar sein. Deshalb das Wort „Anzeige“ und „Anzeige von …“.
4. **Wie geht ein Event über Mitternacht?** Endet es vor seinem Beginn, zählt das Ende als nächster Tag (+1440 Minuten). Um 3 Uhr nachts prüft die Seite auch die Events von gestern.
5. **Wie merkt man sich nur einen Termin einer Reihe?** (neu am 14.10.2026) Die Merkliste speichert nur Texte (Kennungen). Für einen einzelnen Termin hängen wir das Datum an die Kennung des Events: `e05@2026-10-16`. `split("@")` trennt das beim Lesen wieder in Event und Datum. Die Kennung ohne Datum (`e05`) bedeutet die ganze Reihe. So musste `js/konto.js` nicht geändert werden.

## „Event melden“ (neu am 13.10.2026)

**Was man sieht:** Im Kasten „Für Veranstalter“ auf `events.html` gibt es den Knopf **Event melden**. Er führt zu `event-melden.html`: ein Formular mit Titel, Art, Beschreibung, Datum, Beginn, Ende, Quadrat, Ort, Veranstalter, E-Mail, Webseite, „Als Anzeige hervorheben“ und der Einwilligung. Nach dem Absenden steht das Event auf der Seite Events mit dem Hinweis **„Deine Meldung – noch nicht geprüft“** und einem Knopf „Meldung löschen“.

**Warum so:** Das passt zum Geschäftsmodell. Veranstalter melden ihre Events, das Team prüft sie. Gemeldete Events werden nie automatisch zur „Anzeige“: „Hervorhebung gewünscht“ wird nur notiert (`anzeigeGewuenscht`) `js/event-melden.js:69`, nicht als `anzeige` gespeichert.

1. **Prüfen macht der Browser:** `required`, `minlength` `event-melden.html:93`, `type="email"` mit `pattern`, `type="url"`, und beim Datum `min` = heute `js/event-melden.js:130`. Das Ereignis `submit` kommt nur, wenn alles stimmt. Die Fehlermeldungen unter den Feldern zeigt `style.css` mit `:user-invalid`, wie auf „Ort vorschlagen“.
2. `fillBlocks()` `js/event-melden.js:29` füllt die Liste „Quadrat“ aus `window.QUADRATE`, mit dem Namen bei Plätzen („O1 (Paradeplatz)“).
3. `onSubmit()` `js/event-melden.js:55` verhindert das Neuladen `js/event-melden.js:56`, baut ein Objekt im Format der Datendatei und speichert es mit `Events.report()` `js/event-melden.js:91`.
4. `report()` `js/events.js:88` hängt es an die Liste im localStorage (`quadrate-events-gemeldet` `js/events.js:26`). `allEvents()` `js/events.js:116` nimmt Beispiele und Meldungen zusammen, deshalb erscheinen Meldungen überall, wo Events gezeigt werden (Events, Gerade offen, Steckbrief).
5. Auf `events.html` bekommt eine Meldung das Schild `js/events-seite.js:180`, „Meldung löschen“ ruft `Events.removeReport()` `js/events-seite.js:215`.

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `<form>` mit Prüfung im Browser | `event-melden.html:65` | Ohne eigenes JavaScript für die Prüfung: Die Attribute reichen. | VL3 S.2 |
| `<input type="date">` mit `min` | `event-melden.html:101` | Datumsauswahl; `min` sperrt Tage vor heute. | – |
| Pflicht-Häkchen `required` | `event-melden.html:212` | Ohne Einwilligung lässt sich das Formular nicht absenden. | – |
| `event.preventDefault()` | `js/event-melden.js:56` | Kein Neuladen der Seite beim Absenden. | JS |
| localStorage als Liste | `js/events.js:88` | `JSON.parse`, `push`, `JSON.stringify` und wieder speichern. | – |

## Kalenderblatt, Farben je Art und Events merken (neu am 13.10.2026)

**Was man sieht:** Jeder Tag beginnt mit einem kleinen **Kalenderblatt** (Monat, Tag, Wochentag), daneben „heute“ / „morgen“ oder der Wochentag und das Datum. Jedes Event hat die **Farbe seiner Art**: als Streifen links, als farbiges Etikett („Musik“, „Markt“ …) und beim Kalenderblatt der hervorgehobenen Karten. Jedes Event hat einen Knopf **„Merken“**; gemerkte Events stehen auf der Merkliste.

- `calendarSheet()` `js/events-seite.js:92` baut das Kalenderblatt. Es ist nur Schmuck (`aria-hidden`); das Datum steht für Screenreader als Text daneben, bei den Karten als versteckter Text.
- Die Klasse `event--art-musik` … `js/events-seite.js:78` wählt die Farbe. In `css/events.css` setzt sie zwei Variablen: `--art` (dunkel, für Streifen, Band und Schrift) und `--art-bg` (hell, für das Etikett) `css/events.css:69`. Essen, Kultur und Shoppen nehmen die Kategorie-Farben der Karte.
- Kalenderblatt: `.cal` `css/events.css:134`, das farbige Band oben `css/events.css:148`; das Etikett der Art `css/events.css:278`.
- `saveButton()` `js/events-seite.js:121` speichert eine Kennung mit `Merkliste.toggle()`, in derselben Liste wie die Orte. Steht ein Event mehrmals auf der Seite (oben, in der Liste, an mehreren Tagen), werden alle Knöpfe neu gezeigt (`showSaved()` `js/events-seite.js:142`).
- **Nur einen Termin oder die ganze Reihe merken (neu am 14.10.2026):** Ein Event mit mehreren Terminen (jeden Donnerstag, täglich vom … bis …) hat zwei Knöpfe `js/events-seite.js:110`:
  - „Termin merken“ speichert nur diesen Tag. Die Kennung ist dann Event und Datum mit `@` dazwischen, zum Beispiel `e05@2026-10-16` (`Events.occurrenceId()` `js/events.js:225`).
  - „Reihe merken“ speichert die Kennung des Events (`e05`), also alle Termine. Einzelne Termine derselben Reihe braucht es dann nicht mehr, sie werden entfernt `js/events-seite.js:133`.
  - Ist die ganze Reihe gemerkt, ist „Termin merken“ gedrückt und gesperrt (`disabled`) `js/events-seite.js:158`.
  - Ein Event mit nur einem Termin behält den einen Knopf „Merken“.
  - Die anderen Seiten lesen beide Arten über `Events.savedEntries()` `js/events.js:254` und `Events.isSavedOccurrence()` `js/events.js:230`: die Merkliste mit ihrem Kalender, „Tag planen“, „Treffen planen“ und der Verlauf im Konto.
- **Event melden:** Beginn und Ende werden jetzt mit demselben Zeitregler wie auf der Karte gewählt `js/event-melden.js:116` und als „19:30“ gespeichert `js/event-melden.js:66`.

## Suche, Monatsansicht und wöchentliche Termine (neu am 13.10.2026)

**Was man sieht:**
- Ein Feld **Suchen** `events.html:90` filtert nach Titel, Text, Ort, Quadrat, Art und Veranstalter („Jazz“, „Markt“, „G1“).
- Der Umschalter **Ansicht: Liste | Monat** `events.html:84`. Die Monatsansicht ist ein **Kalender**: ein Feld pro Tag mit einem farbigen Punkt pro Event (Farbe der Art), heute mit dunklem Rahmen, Tage ohne Events grau. Ein Klick auf einen Tag zeigt seine Events darunter. Mit den Pfeilen blättert man zum vorigen oder nächsten Monat. Suche und Art gelten auch hier; „Hervorgehoben“ gibt es nur in der Listenansicht, damit der Kalender oben steht.
- **Event melden** hat jetzt **Wiederholung: nur an diesem Tag / jede Woche am selben Wochentag** `event-melden.html:112` und, nur bei „jede Woche“, das Feld **Letzter Termin**. Auf der Seite Events steht dann zum Beispiel „jeden Donnerstag ab 15.10. bis 26.11.“.

**So führst du es vor:** Auf **Monat** umschalten, auf einen Tag mit zwei Punkten klicken, einmal weiterblättern. Dann „Markt“ ins Suchfeld tippen: Im Kalender bleiben nur die Samstage übrig.

1. `fits()` `js/events-seite.js:287` prüft für ein Event Art und Suchtext. Der Suchtext ist wie in der Ortssuche „vereinfacht“ (`simplify()`, kleine Buchstaben, ohne Akzente).
2. `drawMonth()` `js/events-seite.js:368` holt alle Termine des Monats und sortiert sie nach Tag in ein Objekt `{ "2026-10-16": [...] }`. Die Zahl der Tage liefert `new Date(Jahr, Monat + 1, 0)` `js/events-seite.js:371`, das ist der „nullte“ Tag des nächsten Monats, also der letzte dieses Monats. Wie viele leere Felder vor dem 1. stehen, ergibt `getDay()` `js/events-seite.js:394` (umgerechnet, damit die Woche am Montag beginnt).
3. `dayButton()` `js/events-seite.js:339` baut einen Tag als `<button>` mit Punkten. Die Punkte sind für Screenreader versteckt; dafür bekommt der Knopf einen Namen wie „Freitag, 16. Oktober: 2 Events“ `js/events-seite.js:358`.
4. Ein Klick auf einen Tag wird mit **einem** Zuhörer auf der ganzen Tabelle erkannt `js/events-seite.js:468` (Ereignis-Delegation), weil die Tabelle oft neu gezeichnet wird.
5. **Wöchentlich:** `js/event-melden.js:77` speichert statt `datum` den Wochentag als `wochentage`, dazu `ab` (das Datum) und, wenn angegeben, `bis`. `takesPlaceOn()` beachtet diese Grenzen `js/events.js:68`.

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `<table>` mit `<caption>` und `<th scope="col">` | `events.html:142` | Der Kalender ist eine echte Tabelle: Spalten = Wochentage. `abbr` gibt Screenreadern den vollen Namen. | – |
| `table-layout: fixed` | `css/events.css:352` | Alle sieben Spalten sind gleich breit, egal was in den Feldern steht. | – |
| `disabled` | `css/events.css:393` | Tage ohne Events lassen sich nicht anklicken und sind grau. | – |
| `type="radio"` als Umschalter | `events.html:84` | „Liste“ und „Monat“ sind zwei Radiobuttons mit demselben `name`, so ist immer genau einer gewählt. | – |
| `delete` | `js/event-melden.js:83` | Entfernt ein Feld aus einem Objekt (hier `datum` bei wöchentlichen Events). | JS |
