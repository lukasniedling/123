# Merkliste: gemerkte Orte mit und ohne Konto (`merkliste.html`)

Erklärung für die Präsentation. Neu am 13.10.2026. Alle Fundstellen beziehen sich auf `final-v5/`. Wie das Konto selbst funktioniert, steht in [konto.md](konto.md).

## Was die Seite zeigt und warum

| Wo | Was passiert |
|---|---|
| Karte (`index.html`) | Im Steckbrief steht bei jedem Ort **Merken**, jetzt auch **ohne Anmeldung**. Darunter ein Hinweis mit Link zur Merkliste. |
| `merkliste.html` (Menüpunkt **Merkliste**) | Alle gemerkten Orte, nach Quadrat geordnet: heutige Öffnungszeit, „geöffnet / geschlossen“, die Zeiten der ganzen Woche zum Aufklappen, Links „Auf der Karte“ und „Route“, Knopf **Entfernen**. |
| oben auf `merkliste.html` | Ein Hinweis, wo die Liste liegt: im Konto (dauerhaft) oder nur in diesem Tab. Knopf **Als PDF speichern oder drucken** und Link **Route zu allen Orten**. |
| beim Anmelden | Orte, die man vorher ohne Konto gemerkt hat, kommen automatisch ins Konto. |

**Warum ohne Konto?** Wer nur schnell ein paar Orte für heute Abend sammeln will, soll sich nicht erst registrieren müssen.

**Warum nur bis zum Schließen des Tabs?** Dafür gibt es im Browser den **sessionStorage**: Er funktioniert wie localStorage, aber der Browser löscht ihn, wenn der Tab zugeht. Das passt zu „für diese Sitzung“. Wer die Liste behalten will, meldet sich an.

**Warum PDF über den Druckdialog?** Eine „echte“ PDF-Datei bräuchte einen Server oder eine fremde Bibliothek. Beides ist hier ausgeschlossen (kein Server, keine Bibliotheken). Jeder Browser kann aber eine Seite drucken und dabei „Als PDF speichern“ wählen. Ein eigenes Druck-Stylesheet sorgt dafür, dass im PDF nur die Liste steht.

## So führst du es vor

1. `final-v5/index.html` öffnen, **nicht** angemeldet. Quadrat O7 wählen, bei zwei Orten **Merken**: Häkchen am Knopf, Stecknadel auf O7, in der Legende „gemerkte Orte“.
2. Oben auf **Merkliste**: gelber Hinweis „Du bist nicht angemeldet …“, darunter O7 mit den zwei Orten. Bei einem Ort „Öffnungszeiten der Woche“ aufklappen: Der heutige Tag ist fett.
3. **Route zu allen Orten**: Google Maps öffnet eine Fußweg-Route vom eigenen Standort über beide Orte.
4. **Als PDF speichern oder drucken** → im Druckdialog „Als PDF speichern“. In der Vorschau fehlen Menü, Knöpfe und Links, dafür steht oben „Stand: Datum, Uhrzeit“, und alle Wochenzeiten sind aufgeklappt.
5. Entwicklertools → Application → **Session Storage**: Schlüssel `quadrate-merkliste` mit den Kennungen als JSON.
6. **Konto** → anmelden. Zurück auf **Merkliste**: blauer Hinweis „Angemeldet als …“, die Orte sind jetzt im Konto (`quadrate-konten` im Local Storage), der Session Storage ist leer.

## Aufbau des Quelltexts

### Beteiligte Dateien

| Datei | Aufgabe |
|---|---|
| `js/merkliste.js` | entscheidet, **wo** gemerkt wird: im Konto (`Konto`) oder im sessionStorage; bietet `window.Merkliste` |
| `merkliste.html` | die Seite: Kopf, Hinweis ohne JavaScript, ein leerer Bereich für den Inhalt, Quellenzeile |
| `js/merkliste-seite.js` | füllt `merkliste.html`: Hinweis, Knöpfe, Gruppen je Quadrat, Entfernen, Druck |
| `css/merkliste.css` | Anordnung der Seite und die Druck-Ansicht (`@media print`) |
| `js/steckbrief.js` | Knopf „Merken“ und Stecknadeln, jetzt über `Merkliste` statt direkt über `Konto` |
| `js/konto-seite.js` | ruft beim Anzeigen `Merkliste.mergeSession()` auf, damit die Orte beim Anmelden ins Konto kommen |
| `js/konto.js` | **unverändert**: Konten und gemerkte Orte im localStorage |

### `js/merkliste.js`: wo wird gemerkt?

1. Der Schlüssel im sessionStorage steht als Konstante oben `js/merkliste.js:30`.
2. `loadSession()` `js/merkliste.js:44` liest die Liste mit `JSON.parse` `js/merkliste.js:46`, `saveSession()` `js/merkliste.js:53` schreibt sie mit `JSON.stringify` zurück. Beides in `try`/`catch`, weil manche private Fenster das Speichern verbieten.
3. `toggle()` `js/merkliste.js:96`: Ist jemand angemeldet, ruft es einfach `Konto.toggle()` auf. Sonst sucht es den Ort in der Liste und entfernt ihn mit `splice` `js/merkliste.js:104` oder hängt ihn an. Danach aktualisiert es die Zahl im Menü (`updateCounter()`).
4. `ids()` `js/merkliste.js:84` gibt die Liste aus dem Konto oder aus dem Tab zurück.
5. `mergeSession()` `js/merkliste.js:69`: Ist jemand angemeldet und stehen noch Orte im Tab, kommen sie mit `Konto.toggle()` ins Konto `js/merkliste.js:76` (nur die, die dort noch fehlen), danach wird die Tab-Liste geleert `js/merkliste.js:80`.

### `merkliste.html` und `js/merkliste-seite.js`

1. Die Seite hat nur einen leeren Bereich `merkliste.html:72`. `draw()` `js/merkliste-seite.js:512` baut alles darin mit `createElement` und `textContent` `js/merkliste-seite.js:39`, wie `konto-seite.js`. Namen aus OpenStreetMap werden so nie zu HTML.
2. `savedPlaces()` `js/merkliste-seite.js:77` holt die Orte zu den Kennungen und sortiert sie nach Quadrat, so dass L9 vor L10 steht (`numeric: true` `js/merkliste-seite.js:86`).
3. `modeNotice()` `js/merkliste-seite.js:116` zeigt den blauen oder gelben Hinweis, je nachdem ob jemand angemeldet ist.
4. `toolbar()` `js/merkliste-seite.js:149` baut die Zusammenfassung, den Druckknopf mit `window.print()` `js/merkliste-seite.js:168` und den Link „Route zu allen Orten“.
5. `routeAllUrl()` `js/merkliste-seite.js:99`: Der letzte Ort ist das Ziel, die anderen sind Zwischenstopps, mit `|` getrennt `js/merkliste-seite.js:108`. Google Maps nimmt höchstens 10 Orte pro Link `js/merkliste-seite.js:27`; bei mehr steht das als Hinweis da.
6. `placeItem()` `js/merkliste-seite.js:234` baut einen Ort; `weekHours()` `js/merkliste-seite.js:198` die Woche als `<details>` mit einer Liste `<dl>` (Tag → Zeiten).
7. **Entfernen** ruft `Merkliste.toggle()` und zeichnet alles neu. Weil der Knopf danach weg ist, springt der Tastatur-Fokus auf die Zusammenfassung `js/merkliste-seite.js:278`.
8. **Drucken / PDF:** Vor dem Drucken meldet der Browser das Ereignis `beforeprint` `js/merkliste-seite.js:585`. Dann klappt `openAllWeeks()` `js/merkliste-seite.js:573` alle Wochenzeiten auf. `css/merkliste.css` blendet in `@media print` `css/merkliste.css:342` Hinweis, Knöpfe und Links aus und zeigt die Zeile „Stand: …“ `merkliste.html:61`, die sonst versteckt ist `css/merkliste.css:338`. `break-inside: avoid` `css/merkliste.css:391` verhindert, dass ein Ort auf zwei Seiten zerrissen wird.

## Begriffe aus dem Quelltext

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `sessionStorage` | `js/merkliste.js:46` | Speicher im Browser wie localStorage, aber nur bis der Tab geschlossen wird. | – |
| `JSON.parse` / `JSON.stringify` | `js/merkliste.js:46` | Text ↔ Liste; der Speicher kann nur Text. | – |
| `try` / `catch` | `js/merkliste.js:44` | Fängt den Fehler ab, wenn der Browser das Speichern verbietet. | – |
| `splice()` | `js/merkliste.js:104` | Entfernt einen Eintrag an einer Stelle eines Arrays. | JS |
| `document.createElement()`, `textContent` | `js/merkliste-seite.js:39` | Baut Elemente; `textContent` setzt reinen Text, kein HTML. | JS |
| `localeCompare(…, { numeric: true })` | `js/merkliste-seite.js:86` | Sortiert Zahlen im Text richtig: L9 vor L10. | JS |
| `window.print()` | `js/merkliste-seite.js:168` | Öffnet den Druckdialog des Browsers; dort geht auch „Als PDF speichern“. | – |
| Ereignis `beforeprint` | `js/merkliste-seite.js:585` | Kommt direkt vor dem Drucken; hier zum Aufklappen. | JS |
| `<details>` / `<summary>` | `js/merkliste-seite.js:198` | Aufklappbarer Bereich ohne JavaScript. | – |
| `<dl>`, `<dt>`, `<dd>` | `js/merkliste-seite.js:198` | Beschreibungsliste: Begriff (Tag) und Beschreibung (Zeiten). | – |
| `@media print` | `css/merkliste.css:342` | CSS, das nur beim Drucken gilt. | – |
| `break-inside: avoid` | `css/merkliste.css:391` | Kein Seitenumbruch mitten in einem Ort. | – |
| Grid mit `max-content` | `css/merkliste.css:149` | Zwei Spalten, so breit wie der längste Tag bzw. die längste Zeit. | – |

## Fragen, die der Dozent stellen könnte

1. **Was ist der Unterschied zwischen localStorage und sessionStorage?**
   Beide speichern Text im Browser, nur auf diesem Gerät. localStorage bleibt, bis man ihn löscht. sessionStorage gilt nur für diesen Tab und ist weg, wenn der Tab zugeht.
2. **Warum erzeugt ihr das PDF nicht selbst?**
   Ohne Server und ohne Bibliothek müssten wir das PDF-Format von Hand schreiben. Der Druckdialog des Browsers kann das schon, wir sorgen mit `@media print` nur dafür, dass es gut aussieht.
3. **Was passiert mit den Orten ohne Konto, wenn ich mich anmelde?**
   `mergeSession()` schreibt sie ins Konto, doppelte werden ausgelassen, und die Tab-Liste wird geleert.
4. **Warum habt ihr `konto.js` nicht geändert?**
   Damit der Teil von Anes so bleibt, wie er ihn erklärt. `merkliste.js` liegt davor und reicht angemeldet alles an `Konto` weiter (eine Art Vermittler).
5. **Warum nur 10 Orte in der Route?**
   Google Maps nimmt in einem Link höchstens 9 Zwischenstopps plus Ziel (auf manchen Handys weniger). Die Seite sagt das, statt eine kaputte Route zu bauen.

## „Treffen planen“ (neu am 13.10.2026)

**Was man sieht:** Unter der Merkliste steht der Kasten „Treffen planen“ `merkliste.html:142`: Tag, Uhrzeit, Treffpunkt (einer der gemerkten Orte oder ein eigener Text), optional E-Mail-Adressen und eine Nachricht. Darunter steht sofort die fertige Einladung als Vorschau `merkliste.html:196`. Sie nennt nur den **Treffpunkt**: seine Öffnungszeiten an diesem Tag und ob er **zu dieser Uhrzeit** geöffnet hat, zum Beispiel „Öffnungszeiten am Freitag: 10:00–02:00 (um 19:30 geöffnet)“, dazu eine Route mit Google Maps. Das kann nur unsere Seite, weil sie die Öffnungszeiten kennt. (Zuerst stand die ganze Merkliste in der Einladung; das war zu lang.)

**Vorführen:** Zwei, drei Orte merken, auf der Merkliste einen Freitag und 21:00 wählen, einen Treffpunkt aussuchen. Die Vorschau zeigt, ob der Treffpunkt dann offen hat. „Einladung per E-Mail“ öffnet das eigene Mailprogramm mit Betreff und Text.

1. `chosenMoment()` `js/treffen.js:106` liest das Datum aus dem Feld und die Uhrzeit vom Regler (derselbe wie auf der Karte, `js/zeitregler.js`) und macht daraus Wochentag und Minuten, wie sie `js/oeffnungszeiten.js` braucht.
2. `stateText()` `js/treffen.js:122` fragt `Oeffnungszeiten.isOpen()` `js/treffen.js:123`: „um 21:00 geöffnet“, „geschlossen“ oder „Öffnungszeiten unbekannt“.
3. `invitation()` `js/treffen.js:141` baut Betreff und Text Zeile für Zeile: Wann, Wo, Öffnungszeiten des Treffpunkts und ein Route-Link.
4. `mailtoUrl()` `js/treffen.js:187` baut den Link `mailto:Adressen?subject=…&body=…`. `encodeURIComponent` `js/treffen.js:189` verwandelt Leerzeichen, Umlaute und Zeilenumbrüche in eine gültige Adresse. Ab etwa 1800 Zeichen `js/treffen.js:26` warnt die Seite, weil manche Mailprogramme lange Links kürzen.
5. `onSubmit()` `js/treffen.js:205` öffnet den Link mit `window.location.href` `js/treffen.js:207`. **Die Website schickt nichts selbst**, das Mailprogramm öffnet sich, und man drückt selbst auf Senden.
6. „Text kopieren“: `navigator.clipboard.writeText()` `js/treffen.js:214` legt den Text in die Zwischenablage, etwa für einen Chat. Erlaubt der Browser das nicht, erklärt die Seite, wie man von Hand kopiert.
7. `refresh()` `js/treffen.js:228` füllt die Liste „Treffpunkt“ mit den gemerkten Orten. `js/merkliste-seite.js` ruft sie bei jedem Neuzeichnen auf `js/merkliste-seite.js:515`, also auch nach „Entfernen“.
8. Seit dem 14.10.2026 kommt „Treffen planen“ nicht mehr ins PDF der Merkliste `css/merkliste.css:350`: Die Einladung verschickt man per E-Mail oder kopiert sie.

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `mailto:`-Link mit `subject` und `body` | `js/treffen.js:189` | Öffnet das E-Mail-Programm mit Empfänger, Betreff und Text. | VL2 S.6 |
| `encodeURIComponent()` | `js/treffen.js:189` | Macht Text sicher für einen Link (Leerzeichen → `%20`, Zeilenumbruch → `%0D%0A`). | – |
| `<input type="email" multiple>` | `merkliste.html:189` | Mehrere Adressen, mit Komma getrennt; der Browser prüft jede. | – |
| `<pre>` mit `white-space: pre-wrap` | `css/merkliste.css:220` | Zeigt den Text mit seinen Zeilenumbrüchen, lange Zeilen brechen trotzdem um. | – |
| `navigator.clipboard.writeText()` | `js/treffen.js:214` | Text in die Zwischenablage; liefert ein Promise (`then`). | – |

## Gemerkte Events und die Zahl im Menü (neu am 13.10.2026)

**Gemerkte Events:** Events, die man auf der Seite Events merkt, stehen ganz oben auf der Merkliste unter „Gemerkte Events“, jeweils mit dem nächsten Termin und „Entfernen“.

- `savedEvents()` `js/merkliste-seite.js:315` holt die gemerkten Events mit ihrem nächsten Termin in den kommenden 60 Tagen. Seit dem 14.10.2026 rechnet das `Events.savedEntries()` in `js/events.js` `js/merkliste-seite.js:319`, weil auch einzelne Termine gemerkt werden können (siehe unten).
- `eventsGroup()` `js/merkliste-seite.js:331` und `eventItem()` `js/merkliste-seite.js:463` bauen den Abschnitt wie die Gruppen der Orte.

**Die Zahl im Menü:** Neben „Merkliste“ steht auf jeder Seite, wie viele Orte und Events gemerkt sind.

- `updateCounter()` `js/merkliste.js:123` sucht den Link „Merkliste“ im Menü und setzt eine kleine Zahl daneben, für Screenreader mit dem versteckten Wort „gemerkt“. Bei 0 ist sie versteckt `js/merkliste.js:135`.
- Sie läuft beim Laden jeder Seite `js/merkliste.js:150` und nach jedem Merken oder Entfernen. Deshalb laden jetzt alle Seiten `js/konto.js` und `js/merkliste.js`.
- Aussehen: eine runde, dunkle Zahl `css/style.css:1983` (neuer Abschnitt 21 am Ende von `style.css`).

## Events: Route, Treffpunkt, PDF und Route zu allen (neu am 13.10.2026)

- **Route je Event:** Jedes gemerkte Event hat „Auf der Karte“ und „Route“ zum Veranstaltungsort `js/merkliste-seite.js:486`. Die Daten haben keine Adresse, deshalb macht `eventVenue()` `js/merkliste-seite.js:326` aus dem Event einen „Ort“ mit Name des Veranstaltungsorts und Quadrat; Google Maps sucht dann z. B. „Paradeplatz, O1, Mannheim“.
- **Knöpfe oben auch für Events:** `toolbar()` `js/merkliste-seite.js:149` zeigt „Als PDF speichern oder drucken“ und „Route zu allen Orten“ auch, wenn nur Events gemerkt sind. Die Route führt zuerst zu den Events, dann zu den Orten `js/merkliste-seite.js:177`. Im PDF stehen die Events mit; Links und Knöpfe blendet die Druckansicht aus.
- **Event als Treffpunkt:** In „Treffen planen“ stehen die gemerkten Events in einer eigenen Gruppe der Liste „Treffpunkt“ (`<optgroup>` `js/treffen.js:242`). Wählt man eines, stellt `onMeetingPointChange()` `js/treffen.js:75` Tag und Uhrzeit auf seinen nächsten Termin (man kann sie danach noch ändern). Die Einladung nennt dann Ort, Event und Route `js/treffen.js:163`.

## „Tag planen“ (neu am 13.10.2026)

**Was man sieht:** Über „Treffen planen“ steht der Kasten **Tag planen** `merkliste.html:81`. Man wählt Tag, Startzeit (Regler wie auf der Karte) und **Zeit pro Ort** (30 Minuten bis 2 Stunden). Darunter erscheint sofort ein **Plan als Zeitleiste**: „18:00–19:00 1. Jamy's Burger · geöffnet bis 22:00“, dazwischen „ca. 10 Min. zu Fuß“, gemerkte Events zu ihrer festen Zeit (mit hellem Punkt). Am Ende stehen „Ende gegen 23:40 Uhr“, der Knopf **Route in dieser Reihenfolge** (Google Maps mit allen Stationen) und **Nicht eingeplant** mit Grund, zum Beispiel „hat am Dienstag geschlossen“ oder „Öffnungszeiten unbekannt“. Seit dem 14.10.2026 hat der Plan eigene Knöpfe: **Plan als PDF** (nur der Plan kommt aufs Papier), **Plan per E-Mail** (`mailto:` mit dem Plan als Text) und **Text kopieren**. Ins PDF der ganzen Merkliste kommt er nicht mehr.

**So führst du es vor:** Zwei Restaurants, eine Bar und das Kneipenquiz (Events, dienstags) merken, dann Dienstag 18:00 wählen. Der Planer nimmt erst das Essen, das früh schließt, dann das Quiz um 20:00 und danach die Bar, die bis 2 Uhr offen hat. Danach die Startzeit verschieben: Der Plan ändert sich sofort.

**Wie der Planer rechnet** (`plan()` `js/tagesplaner.js:147`). Es ist ein einfaches „gieriges“ Verfahren, das in jedem Schritt die im Moment beste Wahl trifft:
1. Start zur gewählten Zeit. Events sind fest, sie finden zu ihrer Zeit statt.
2. Von den Orten, die bei Ankunft geöffnet sind und noch lange genug offen bleiben (mindestens 30 Minuten, `MIN_STAY` `js/tagesplaner.js:35`), kommt der dran, der **als Erstes schließt** `js/tagesplaner.js:207`. So wird nichts verpasst, was früh zumacht. Steht ein Event an, wird der Besuch davor notfalls kürzer, damit der Fußweg zum Event noch passt `js/tagesplaner.js:200`.
3. Passt kein Ort, geht es zum nächsten Event. Gibt es keins mehr, wartet der Plan, bis der nächste gemerkte Ort öffnet `js/tagesplaner.js:231` („freie Zeit bis …“).
4. Das wiederholt sich, bis alles eingeplant ist oder es 6 Uhr morgens ist (`LAST_MINUTE` `js/tagesplaner.js:34`).

**Fußwege:** `walk()` `js/tagesplaner.js:126` nimmt die Luftlinie zwischen den Orten (Lage aus `js/data/merkmale.js`, Formel aus `js/standort.js`), mal 1,3 für Umwege (`DETOUR` `js/tagesplaner.js:37`), bei 75 m pro Minute, aufgerundet auf 5 Minuten. Ein Event hat keine eigene Lage, deshalb nimmt `centreOf()` `js/tagesplaner.js:97` die Mitte aller Orte in seinem Quadrat.

**Uhrzeiten nach Mitternacht:** Im Plan zählt 01:30 als 1530 Minuten. `openAt()` `js/tagesplaner.js:73` rechnet so eine Zeit auf den nächsten Tag um, bevor es die Öffnungszeiten fragt, und `clock()` `js/tagesplaner.js:68` schreibt sie wieder als „01:30“.

Die Seite ruft `Tagesplaner.refresh()` bei jedem Neuzeichnen der Liste auf `js/merkliste-seite.js:519`, so passt der Plan nach „Entfernen“ sofort.

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Greedy-Verfahren | `js/tagesplaner.js:147` | In jedem Schritt die gerade beste Wahl, ohne alle Reihenfolgen durchzuprobieren. Schnell und erklärbar, aber nicht immer der allerbeste Plan. | – |
| `while`-Schleife | `js/tagesplaner.js:179` | Plant Schritt für Schritt, bis nichts mehr übrig ist oder es zu spät ist. | JS |
| `splice()` / `shift()` | `js/tagesplaner.js:185` | Nimmt eingeplante Orte und Events aus den Listen. | JS |
| `<ol>` | `js/tagesplaner.js:388` | Der Plan ist eine nummerierte Liste, denn die Reihenfolge zählt. | – |
| `border-left` und `::before` | `css/merkliste.css:249` | Die senkrechte Linie der Zeitleiste und die Punkte darauf. | – |

**Mögliche Fragen:**
- **Ist das der beste Plan?** Nicht immer. Bei zehn Orten gäbe es über drei Millionen Reihenfolgen. Die Regel „wer zuerst schließt, kommt zuerst“ ist schnell, nachvollziehbar und meistens gut.
- **Warum Luftlinie?** Ohne Server und ohne Routing-Dienst kennt die Seite keine Straßen. Die genaue Route liefert Google Maps über den Knopf.

### Tag planen: eigenes PDF, E-Mail, Kopieren (neu am 14.10.2026)

Vorher hieß der Kasten „Abend planen“ (Datei `js/abendplaner.js`). Jetzt heißt er **Tag planen**, die Datei `js/tagesplaner.js`.

1. **PDF der Merkliste:** Es zeigt nur noch die gemerkten Events und Orte. `body:not(.print-dayplan) .meeting` `css/merkliste.css:350` blendet beim Drucken „Tag planen“ und „Treffen planen“ aus.
2. **Plan als PDF:** `printPlan()` `js/tagesplaner.js:350` setzt die Klasse `print-dayplan` an `<body>` und öffnet den Druckdialog. Mit dieser Klasse blendet das CSS beim Drucken die Liste und „Treffen planen“ aus. Übrig bleiben der Plan und die OpenStreetMap-Quelle. Nach dem Druckdialog meldet der Browser `afterprint` `js/tagesplaner.js:442`, und die Klasse wird wieder entfernt.
3. **Plan per E-Mail:** `planText()` `js/tagesplaner.js:307` schreibt den Plan als Text (Betreff „Tagesplan für Mittwoch, 14.10.2026“, Stationen, Fußwege, Route, „Nicht eingeplant“). `mailtoUrl()` `js/tagesplaner.js:341` macht daraus einen `mailto:`-Link ohne Empfänger; den trägt man im eigenen Mailprogramm ein. Ist der Link länger als 1800 Zeichen, erscheint ein Hinweis.
4. **Text kopieren:** `copyPlan()` `js/tagesplaner.js:356` legt denselben Text mit `navigator.clipboard.writeText()` in die Zwischenablage.

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `classList.add()` / `remove()` | `js/tagesplaner.js:350` | Hängt eine Klasse an ein Element oder nimmt sie wieder weg; das CSS reagiert darauf. | JS |
| `:not()` | `css/merkliste.css:350` | „Alle `body`, die die Klasse nicht haben.“ | – |
| `afterprint` | `js/tagesplaner.js:442` | Ereignis nach dem Druckdialog, egal ob gedruckt, gespeichert oder abgebrochen. | – |

## Entfernen ohne Sprung, Webseite und Merkmale (neu am 14.10.2026, final-v5)

- **Kein Sprung nach oben mehr:** Vorher zeichnete „Entfernen“ die Liste neu und setzte den Fokus auf die Zusammenfassung ganz oben, und dabei sprang die Seite nach oben. `removeAndStay()` `js/merkliste-seite.js:222` merkt sich die Scroll-Position, zeichnet neu und springt mit `window.scrollTo()` an dieselbe Stelle zurück `js/merkliste-seite.js:226`. Der Fokus geht mit `focus({ preventScroll: true })` auf die Zusammenfassung, ohne zu scrollen `js/merkliste-seite.js:229`.
- **Webseite und Merkmale:** Wie im Steckbrief haben gemerkte Orte jetzt den Link „Webseite“ `js/merkliste-seite.js:259` und die Merkmale wie „vegan“ `js/merkliste-seite.js:262`. Beides kommt aus `js/merkmale.js`.

## Geordnete Merkliste mit Kalender (neu am 14.10.2026, final-v5)

**Was man sieht:** Die Merkliste ist auf breiten Bildschirmen in Reihen geordnet:
1. **Gemerkte Events** und daneben ein **Kalender** des Monats. Jeder Tag mit einem gemerkten Event hat einen Punkt in der Farbe der Art. Ein Klick auf den Tag springt zum Event in der Liste, und das Event leuchtet kurz auf.
2. Die **gemerkten Orte** in zwei Spalten.
3. **Tag planen** und **Treffen planen**: bis zum 14.10.2026 nebeneinander, jetzt untereinander über die ganze Breite (siehe unten) `merkliste.html:76`.

Auf dem Handy steht alles untereinander.

- `eventsCalendar()` `js/merkliste-seite.js:355` baut den Kalender als `<table>`. Die Zahl der Tage liefert `new Date(Jahr, Monat + 1, 0)` `js/merkliste-seite.js:362`, also der „nullte“ Tag des nächsten Monats. Die Termine der gemerkten Events sammelt es nach Tag `js/merkliste-seite.js:367`. Eine gemerkte Reihe bekommt an jedem ihrer Tage einen Punkt, ein einzeln gemerkter Termin nur an seinem Tag `js/merkliste-seite.js:372`.
- Ein Tag mit Events ist ein `<button>` `js/merkliste-seite.js:421`. `showEventInList()` `js/merkliste-seite.js:450` setzt den Fokus auf das Event in der Liste (`focus()` scrollt dorthin) `js/merkliste-seite.js:455` und färbt es kurz ein.
- Die Reihen: `draw()` legt Events und Kalender in `merkliste-events-row` `js/merkliste-seite.js:558` und die Orte in `merkliste-places` `js/merkliste-seite.js:565`. Das CSS macht daraus ab 64rem ein Raster `css/merkliste.css:432`: Events und Kalender stehen als `1fr 20rem` nebeneinander `css/merkliste.css:493`, die Orte in zwei gleichen Spalten.

## Tagespläne im Konto speichern (neu am 14.10.2026, final-v5)

Angemeldet gibt es bei „Tag planen“ den Knopf **Im Konto speichern**. `savePlanToAccount()` `js/tagesplaner.js:473` legt den Plan mit Titel, Text, Tag, Startzeit und Zeit pro Ort im Konto ab (`Verlauf.savePlan()`). Auf der Konto-Seite steht er unter „Deine Tagespläne“. Der Link „In der Merkliste öffnen“ führt zu `merkliste.html?plan=…`. Dort liest `openSavedPlan()` `js/tagesplaner.js:490` die Kennung mit `URLSearchParams` aus der Adresse `js/tagesplaner.js:491` und füllt das Formular. Der Plan wird dann mit den jetzt gemerkten Orten neu berechnet.

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `URLSearchParams` | `js/tagesplaner.js:491` | Liest den Teil nach `?` aus der Adresse, hier `plan=p123`. | – |
| `element.focus()` | `js/merkliste-seite.js:455` | Setzt den Tastatur-Fokus auf ein Element und scrollt es ins Bild. | JS |
| Grid mit zwei Spalten | `css/merkliste.css:493` | `grid-template-columns`: links die Liste, rechts der Kalender mit fester Breite. | – |

## Einzelne Termine merken (neu am 14.10.2026, final-v5)

Auf der Seite Events kann man bei einem Event mit mehreren Terminen **nur diesen Termin** oder **die ganze Reihe** merken (siehe [events.md](events.md)). Auf der Merkliste:

- Neben dem Titel steht „nur dieser Termin“ oder „alle Termine“ `js/merkliste-seite.js:471`. Ist der einzelne Termin vorbei, steht rechts „Termin vorbei“ `js/merkliste-seite.js:496`.
- Im Kalender hat ein einzelner Termin nur an seinem Tag einen Punkt, eine Reihe an allen Tagen (siehe oben).
- „Tag planen“ nimmt ein Event nur an den Tagen in den Plan, die gemerkt sind (`Events.isSavedOccurrence()` `js/tagesplaner.js:168`). „Treffen planen“ zeigt bei einem einzelnen Termin das Datum in der Liste „Treffpunkt“ an, zum Beispiel „nur 15.10.“ `js/treffen.js:248`.

## Tag planen und Treffen planen untereinander, mit Farbe (neu am 14.10.2026, final-v5)

**Was man sieht:** Die beiden Planer stehen untereinander, jeder über die ganze Breite. Jeder hat oben einen farbigen Streifen und ein rundes Zeichen vor dem Titel: **Tag planen** warm orange mit einer Uhr, **Treffen planen** grünblau mit zwei Personen. Die Farbe läuft nach unten in Weiß aus. Auf breiten Bildschirmen steht innen links das Formular und rechts das Ergebnis: der Plan des Tages bzw. die Vorschau der Einladung. Auf dem Handy steht alles untereinander.

- Die Zeichen sind kleine SVG-Bilder direkt im HTML, mit `aria-hidden="true"`, weil sie nur Schmuck sind `merkliste.html:84`.
- Die Farben stehen als zwei Variablen an jedem Planer: `--plan-tint` (hell) und `--plan-accent` (kräftig) `css/merkliste.css:449`. „Treffen planen“ bekommt über die Klasse `meeting--treffen` andere Werte `css/merkliste.css:457`. Alle anderen Regeln benutzen nur die Variablen: der Streifen (`border-top`), der Verlauf (`linear-gradient`), der Kreis um das Zeichen `css/merkliste.css:468`, die Linie des Plans und der Hintergrund der Vorschau.
- **Zwei Spalten in „Tag planen“:** Der Kasten selbst wird ab 64rem ein Raster mit zwei Spalten `css/merkliste.css:510`. Titel und Einleitung gehen über beide Spalten, das Formular steht links, Plan, Knöpfe und Hinweis rechts.
- **Zwei Spalten in „Treffen planen“:** Vorschau, Hinweis und Knöpfe stehen in einem eigenen `<div class="meeting__result">` `merkliste.html:197`. Ab 64rem stehen die Felder links und dieses `div` rechts, von der ersten Zeile an `css/merkliste.css:554`.

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| CSS-Variablen je Kasten | `css/merkliste.css:449` | Dieselben Regeln, andere Werte: Eine Klasse setzt nur die Farben neu. | – |
| `linear-gradient` | `css/merkliste.css:454` | Verlauf von der hellen Farbe oben nach Weiß. | VL5\* |
| `grid-column`, `grid-row` | `css/merkliste.css:554` | Legen fest, in welcher Spalte und Zeile ein Element im Raster steht; `1 / span 5` heißt: ab Zeile 1, fünf Zeilen hoch. | – |
| `aria-hidden="true"` | `merkliste.html:84` | Screenreader lassen das Zeichen aus, der Titel daneben reicht. | – |
