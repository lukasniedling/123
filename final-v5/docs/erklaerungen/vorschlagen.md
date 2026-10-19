# Ort vorschlagen: das Formular auf der Seite Orte (`quadrate.html#vorschlagen`)

Erklärung für die Präsentation der Endversion, Version 5 (`final-v5/`, Kopie von `final-v3/`, aufbauend auf `final-v2/`). Zeilennummern erzeugt am 2026-10-07 14:25, geprüft und korrigiert am 2026-10-13 aus den aktuellen Dateien in `final-v3/`.

**Seit dem 14.10.2026 (final-v5):** Das Formular hat keine eigene Seite mehr. Es steht mit der Karte als Abschnitt „Ein Ort fehlt? Schlag ihn vor“ unten auf der Seite **Orte** (`quadrate.html`), damit es nicht in der Fußzeile untergeht. Die Datei `vorschlagen.html` gibt es nicht mehr. Der Link „Ort vorschlagen“ oben auf der Seite Orte springt zum Abschnitt (`#vorschlagen`). Formular, iframe und Inline-Stil sind unverändert.

**Vorschlag für die Präsentation:** Lukas Niedling (Tests und Präsentation) zeigt Formular, Prüfungen im Browser und mit JavaScript, das Speichern und das iframe. Die ganze Aufteilung für alle fünf steht in [README.md](README.md) unter „Vorschlag: wer präsentiert was“.

## Was die Seite zeigt und warum

Besucher schlagen einen Ort in den Quadraten vor oder schicken eine allgemeine Frage. Links steht das **Kontaktformular** („Über dich“: Name und E-Mail; „Dein Vorschlag“: Ort, Quadrat, Kategorie, Nachricht), rechts eine **OpenStreetMap-Karte im iframe**, auf der man das richtige Quadrat findet.

Warum so:

- Formular und iframe sind Pflicht-Elemente der Team-Übung 2 (Vorlesung 3). Auf dieser Seite steht außerdem das eine Beispiel für eine Inline-Formatierung mit dem Attribut `style` (Vorlesung 3 und 4).
- Die Seite wächst mit den Versionen: **V1** nutzt die Prüfungen des Browsers (`required`, `minlength`, `pattern` …) und speichert nichts. **V2** ergänzt freundliche Meldungen, einen Zeichenzähler und speichert einen richtigen Vorschlag im Browser (`js/formular.js`, localStorage).
- Es gibt keinen Server (Entscheidung D-042): Die Website läuft nur auf dem eigenen Rechner. Ein Vorschlag wird deshalb nicht verschickt, sondern im Browser unter dem Schlüssel `quadrate-vorschlaege` gesammelt. Eine archivierte Fassung mit PHP-Versand liegt im Git-Tag `final-php-2026-10-07`.

## So führst du es vor

Menü **Orte**, oben auf **Ort vorschlagen** klicken (oder nach unten scrollen).

1. Ohne etwas einzutragen auf „Vorschlag speichern“ klicken: Über dem Formular erscheint die Liste „Noch nicht gespeichert“ mit den 4 Pflichtfeldern, jedes falsche Feld bekommt eine rote Kante und eine Meldung darunter, der Cursor steht im ersten Feld.
2. Eine E-Mail ohne Punkt nach dem @ eintippen (`anna@beispiel`) und das Feld verlassen: Die Meldung erklärt, was fehlt.
3. In die Nachricht tippen: Der Zähler zählt mit („12 von 1.000 Zeichen“).
4. Alles richtig ausfüllen und speichern: Das Formular wird leer, über den Knöpfen steht „Danke!“ mit der Zahl der gespeicherten Vorschläge. In den Entwicklertools (Application → Local Storage) steht der Vorschlag als JSON unter `quadrate-vorschlaege`.
5. Rechts die Karte verschieben: Das ist eine fremde Seite (openstreetmap.org) in einem `<iframe>`.

## Aufbau des Quelltexts

### Beteiligte Dateien

| Datei | Aufgabe | Version |
|---|---|---|
| `quadrate.html` (Abschnitt `#vorschlagen`) | Formular, Karte im iframe, Hinweise | V1 |
| `css/style.css`, Abschnitt 12 | Aussehen aller Formularfelder, Fehler- und Gültig-Zustände | V1 |
| `css/formular.css` | das Formular: zwei Spalten (in der Karte der Orte-Seite erst ab 80rem, `css/verzeichnis.css`), Felder in Gruppen, Zähler | V1, V2 |
| `js/formular.js` | freundliche Prüfung, Fehlerliste, Zeichenzähler, Speichern im localStorage, Dank | V2 |

### Der Abschnitt von oben nach unten

1. Kopfkommentar `quadrate.html:3` mit den Teilen von V1 und V2.
2. Seit dem 14.10.2026 steht das Formular als Abschnitt „Ein Ort fehlt? Schlag ihn vor“ auf der Seite Orte `quadrate.html:118`, mit grünem Band und eigener Einleitung.
3. Zweispaltiges Layout `quadrate.html:122`: links `<section>` mit dem Formular, rechts `<aside>` mit der Karte.
4. Leerer Platz für Meldungen aus JavaScript `quadrate.html:127`.
5. Das Formular `quadrate.html:130`: `action="#"` (es geht nirgendwohin, JavaScript speichert), `accept-charset="utf-8"`.
6. Gruppe „Über dich“ `quadrate.html:133`: Name `quadrate.html:138` und E-Mail `quadrate.html:147`. Jedes Feld steckt in einem `<div class="field">` mit Beschriftung, Hinweis und Fehlermeldung.
7. Gruppe „Dein Vorschlag“ `quadrate.html:154`: Name des Ortes, Auswahlliste mit allen 146 Quadraten in zwei `<optgroup>` `quadrate.html:167`, Kategorie als Optionsfelder `quadrate.html:323`, Nachricht als `<textarea>` `quadrate.html:339` mit Zähler.
8. Hinweis, dass nur im Browser gespeichert wird `quadrate.html:347`.
9. Knöpfe „Vorschlag speichern“ und „Eingaben löschen“ `quadrate.html:350`.
10. Karte: `<aside>` `quadrate.html:356`, `<iframe>` `quadrate.html:363` und der Absatz mit Inline-Stil `quadrate.html:372`.
11. Fußzeile und `js/formular.js` `quadrate.html:403`.

### Prüfen und Speichern

1. **Browser (V1):** Die Attribute `required`, `minlength`, `maxlength`, `pattern` und `type="email"` prüft der Browser selbst. Die CSS-Pseudoklasse `:user-invalid` `css/style.css:1233` färbt ein falsches Feld erst, nachdem jemand etwas eingegeben oder das Senden versucht hat.
2. **JavaScript (V2):** `initForm()` `js/formular.js:464` schaltet die kleinen Sprechblasen des Browsers ab (`noValidate`) und meldet sich für `submit` an. `handleSubmit()` `js/formular.js:313` prüft jedes Feld mit `checkField()` `js/formular.js:171`, das die Regel aus `findError()` `js/formular.js:100` holt. `event.preventDefault()` verhindert immer, dass der Browser die Seite neu lädt. Bei Fehlern zeigt `showErrorList()` `js/formular.js:228` zeigt die Liste mit Links zu den Feldern.
3. **Speichern (V2):** Ist alles richtig, legt `saveSuggestion()` `js/formular.js:274` ein Objekt mit allen Feldern und der Uhrzeit an, liest die bisherige Liste `js/formular.js:285`, hängt den Vorschlag an und schreibt die Liste zurück `js/formular.js:287`. Danach leert `form.reset()` das Formular `js/formular.js:330`, und `showThanks()` `js/formular.js:297` zeigt „Danke!“.

## Begriffe aus dem Quelltext

Spalte „Kurs“: **VL3 S.2** = Vorlesung 3, Folie 2. **VL5\*** = im Inhaltsverzeichnis von Vorlesung 4 (Folie 2–3) angekündigt. **JS** = Thema der JavaScript-Vorlesung (VL6). **–** = nicht in den Folien.

### HTML

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Grundgerüst | `quadrate.html:1`, `quadrate.html:24` | HTML5-Dokument mit Zeichenkodierung UTF-8, wie auf jeder Seite. | VL2 S.3 |
| `<section>` und `<aside>` | `quadrate.html:123`, `quadrate.html:356` | Hauptabschnitt mit dem Formular und ein Nebenbereich mit ergänzendem Inhalt (die Karte). | – |
| `<form action>` | `quadrate.html:130` | `action` sagt, wohin die Daten gehen. Hier `#`: Es gibt keinen Server, JavaScript fängt das Absenden ab und speichert im Browser. | VL3 S.2 |
| `<fieldset>` und `<legend>` | `quadrate.html:133`, `quadrate.html:133` | Rahmen um zusammengehörige Felder mit einer Überschrift. | VL3 S.2 |
| `<label for>` | `quadrate.html:136` | Beschriftung, die zu dem Feld mit dieser id gehört; ein Klick auf den Text setzt den Cursor ins Feld. | VL3 S.2 |
| `<input type="text">` mit `name` | `quadrate.html:138` | Textfeld; über `name` findet JavaScript den Wert (`form.elements.name`). | VL3 S.2 |
| `required`, `minlength`, `maxlength` | `quadrate.html:138` | Pflichtfeld, mindestens 2 und höchstens 80 Zeichen; der Browser prüft das selbst. | – |
| `autocomplete` | `quadrate.html:138` | Sagt dem Browser, welche gespeicherte Angabe er vorschlagen darf. | – |
| `type="email"` und `pattern` | `quadrate.html:148` | `type="email"` verlangt ein @; das Muster (regulärer Ausdruck) verlangt zusätzlich einen Punkt dahinter. | – |
| `title` bei einem Feld | `quadrate.html:148` | Tooltip und Zusatztext der Browsermeldung, wenn das Muster nicht passt. | VL2 S.7 |
| `aria-describedby` | `quadrate.html:138` | Verknüpft das Feld mit seinem Hinweistext, den Screenreader dann mit vorlesen. | – |
| `placeholder` | `quadrate.html:159` | Grauer Beispieltext im leeren Feld; er ersetzt keine Beschriftung. | – |
| `<select>`, `<optgroup>`, `<option value>` | `quadrate.html:166`, `quadrate.html:167`, `quadrate.html:209` | Auswahlliste mit Gruppen; gespeichert wird der `value`, angezeigt der Text. | VL3 S.2 |
| Optionsfelder mit `required` | `quadrate.html:327` | Alle Felder mit `name="kategorie"` sind eine Gruppe; `required` an einem macht die ganze Gruppe zur Pflicht. | VL3 S.2 |
| `<textarea>` | `quadrate.html:339` | Mehrzeiliges Textfeld; `rows="6"` gibt die sichtbare Höhe an. | VL3 S.2 |
| `<button type="submit">` / `type="reset"` | `quadrate.html:351`, `quadrate.html:351` | Der eine Knopf schickt das Formular ab (JavaScript speichert es), der andere leert alle Felder. | VL3 S.2 |
| `<iframe>` | `quadrate.html:363` | Bettet eine fremde Webseite ein, hier die Karte von openstreetmap.org; `title` beschreibt sie für Screenreader. | VL3 S.2 |
| `&amp;` in der Adresse | `quadrate.html:363` | Im HTML-Quelltext schreibt man das Zeichen `&` als Entität `&amp;`. | VL2 S.5 |
| `loading="lazy"` | `quadrate.html:365` | Die Karte lädt erst, wenn sie in den sichtbaren Bereich kommt. | – |
| Inline-Stil `style="..."` | `quadrate.html:372` | CSS direkt am Element; gilt nur für dieses eine Element und schlägt die Regeln aus den CSS-Dateien. | VL3 S.3, VL4 S.11 |
| `hidden` am Zähler | `quadrate.html:341` | Der Zähler ist versteckt, bis `formular.js` ihn einblendet. | – |

### CSS

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Grid mit Media Query | `css/formular.css:19`, `css/formular.css:25` | Eine Spalte auf dem Handy; ab 64rem stehen Formular und Karte nebeneinander. | VL4 S.4 |
| `minmax(0, 40rem)` | `css/formular.css:27` | Die Formularspalte ist höchstens 40rem breit, die Kartenspalte nimmt den Rest (`1fr`). | – |
| Feld als kleines Grid | `css/style.css:1167` | Beschriftung, Hinweis, Eingabefeld und Fehlermeldung stehen mit gleichem Abstand untereinander. | – |
| `:not()` mit Liste | `css/style.css:1050` | Alle Eingabefelder außer Ankreuz- und Optionsfeldern, Reglern und Knöpfen bekommen denselben Rahmen. | – |
| Fehlermeldung ein- und ausblenden | `css/style.css:1190`, `css/style.css:1215` | Die Meldung hat `display: none`; erst die Klasse `field--error` am umgebenden Feld zeigt sie. | – |
| `::before` mit `content` | `css/style.css:1201` | Erzeugt das kleine Quadrat mit „!“ vor jeder Fehlermeldung. | VL5\* |
| `:user-invalid` | `css/style.css:1233` | Zustand „ungültig“, aber erst nachdem jemand etwas eingegeben oder das Senden versucht hat. | – |
| `:has()` | `css/style.css:1231` | Wählt das Feld, das ein ungültiges Eingabefeld enthält, und blendet seine Meldung ein (ohne JavaScript). | – |
| `:placeholder-shown` | `css/formular.css:107` | Ein leeres freiwilliges Feld bekommt nach dem Speichern keinen grünen Rand. | – |
| `box-shadow: inset` | `css/style.css:1227` | Innenschatten als dicke linke Kante: Fehler sind auch ohne Farbsehen erkennbar. | – |
| `background-image` mit SVG | `css/style.css:1086` | Der Pfeil der Auswahlliste ist ein kleines SVG-Bild direkt im CSS, damit er überall gleich aussieht. | VL5\* |
| Nachbar-Selektor bei Chips | `css/style.css:919` | Das Label direkt nach dem gewählten Optionsfeld wird zum farbigen Chip. | – |
| `calc()` | `css/formular.css:54` | Rechnet mit CSS-Werten; hier ein negativer Abstand, damit der Hinweis näher an der Überschrift steht. | – |
| `aspect-ratio` am iframe | `css/style.css:610` | Der Rahmen der Karte behält auf jeder Breite das Seitenverhältnis 4 : 3. | – |
| Klassen für Zustände | `css/formular.css:123` | Der Zähler wird braun, wenn weniger als 100 Zeichen frei sind; der Text sagt es zusätzlich. | – |

### JavaScript

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Objekt mit Meldungen | `js/formular.js:27` | Ein Objekt je Feld mit den deutschen Meldungen, zum Beispiel `MESSAGES.name.missing`. | JS |
| Array | `js/formular.js:55` | Die Liste der Felder, die das Skript prüft, in der Reihenfolge des Formulars. | JS |
| `getElementById`, `querySelector` | `js/formular.js:66`, `js/formular.js:66` | Holt Elemente aus dem DOM über id bzw. CSS-Selektor. | JS |
| `form.noValidate` | `js/formular.js:468` | Schaltet die Sprechblasen des Browsers ab, weil das Skript eigene Meldungen zeigt. | JS |
| Ereignis `submit` | `js/formular.js:469` | Feuert, wenn das Formular abgeschickt werden soll. | JS |
| `event.preventDefault()` | `js/formular.js:314` | Verhindert, dass der Browser das Formular verschickt und die Seite neu lädt. | JS |
| `localStorage`, `JSON.parse`, `JSON.stringify` | `js/formular.js:287` | Speicher im Browser, der nur Text kennt: Die Liste wird als JSON-Text gelesen und geschrieben. | JS |
| `try` / `catch` | `js/formular.js:289` | Fängt den Fehler ab, wenn der Browser das Speichern verbietet (zum Beispiel privates Fenster). | – |
| `form.reset()` | `js/formular.js:330` | Leert alle Felder; löst das Ereignis `reset` aus, das auch die Meldungen entfernt. | – |
| `form.elements` | `js/formular.js:105` | Alle Felder eines Formulars nach ihrem `name`; bei Optionsfeldern ist `value` der gewählte Wert. | JS |
| `validity` | `js/formular.js:122` | Das Ergebnis der Browser-Prüfung, zum Beispiel „passt nicht zu type="email"“. | JS |
| `trim()` | `js/formular.js:112` | Entfernt Leerzeichen am Anfang und Ende; ein Name nur aus Leerzeichen gilt als leer. | JS |
| `closest()` | `js/formular.js:160` | Sucht vom Feld aus nach oben den umgebenden Kasten mit der Klasse `field`. | JS |
| `classList.add`, `remove`, `toggle` | `js/formular.js:188`, `js/formular.js:428` | Fügt CSS-Klassen hinzu, entfernt sie oder schaltet sie je nach Bedingung. | JS |
| `setAttribute("aria-invalid")` | `js/formular.js:189` | Sagt Screenreadern, dass dieses Feld falsch ausgefüllt ist. | JS |
| `split`, `filter`, `join` | `js/formular.js:145` | Zerlegt einen Text in ein Array, behält nur passende Einträge und setzt sie wieder zusammen. | JS |
| `forEach` | `js/formular.js:316` | Ruft eine Funktion für jeden Eintrag eines Arrays auf. | JS |
| `createElement`, `appendChild` | `js/formular.js:204` | Baut den Meldungskasten als neue Elemente und hängt ihn in die Seite. | JS |
| `role="alert"` / `role="status"` aus JS | `js/formular.js:237`, `js/formular.js:304` | Screenreader lesen die Fehlerliste sofort vor, den Dank höflich nach der aktuellen Ansage. | JS |
| Ereignisse `blur`, `input`, `change` | `js/formular.js:371`, `js/formular.js:386`, `js/formular.js:397` | Feld verlassen, jede Eingabe, Auswahl geändert. | JS |
| `window.confirm` | `js/formular.js:351` | Fragt mit „OK / Abbrechen“ nach, bevor alle Eingaben gelöscht werden. | JS |
| `setTimeout(..., 0)` | `js/formular.js:355` | Führt die Aufräumarbeit aus, gleich nachdem der Browser die Felder geleert hat. | JS |
| `toLocaleString("de-DE")` | `js/formular.js:427` | Schreibt Zahlen deutsch: 1000 wird „1.000“. | JS |
| `aria-live` aus JS | `js/formular.js:453` | Ein unsichtbarer Bereich sagt Screenreadern „Noch 50 Zeichen frei“, aber nur beim Wechsel der Stufe. | JS |
| Ereignis `pageshow` | `js/formular.js:476` | Feuert auch, wenn der Browser die Seite mit der Zurück-Taste aus dem Zwischenspeicher zeigt. | JS |

## Fragen, die der Dozent stellen könnte

1. **Warum prüft ihr die Eingaben zweimal: im Browser und in JavaScript?**
   Der Browser prüft ohne jede Zeile Code (Version V1), zeigt aber nur kurze Sprechblasen. JavaScript gibt freundlichere Meldungen direkt am Feld und eine Liste über dem Formular. Mit einem Server müsste dieser alles noch einmal prüfen, weil man Browser-Prüfungen umgehen kann; die archivierte PHP-Fassung hat das getan.

2. **Wohin geht der Vorschlag?**
   Nirgendwohin. Die Website hat keinen Server (D-042). `formular.js` hängt den Vorschlag an eine Liste im localStorage an (`quadrate-vorschlaege`). Er bleibt in diesem Browser auf diesem Rechner. Das Team sieht ihn nur dort, zum Beispiel in den Entwicklertools.

3. **Warum `action="#"` und `preventDefault()`?**
   Ohne JavaScript würde der Browser das Formular an die Adresse in `action` schicken. `#` heißt „diese Seite“: Es passiert nichts Schlimmes. Mit JavaScript verhindert `preventDefault()` das Abschicken ganz, und das Skript speichert selbst.

4. **Wie verhindert ihr, dass eingegebenes HTML ausgeführt wird?**
   Die Fehlerliste und der Dank werden mit `createElement` und `textContent` gebaut. Eingaben landen nie als HTML in der Seite, nur als Text.

5. **Warum steht die Karte in einem `<iframe>`, und warum gibt es hier ein `style`-Attribut?**
   Das iframe bettet die Karte von openstreetmap.org ein, ohne dass wir sie selbst bauen müssen. Dabei verbindet sich der Browser mit den Servern von OpenStreetMap und schickt seine IP-Adresse; deshalb steht darunter ein Hinweis, und die Datenschutzerklärung erklärt es. Das `style`-Attribut ist bewusst das einzige Beispiel für Inline-CSS aus der Vorlesung: Es gilt nur für diesen Absatz und schlägt die Regeln der CSS-Dateien. Sonst trennen wir Inhalt (HTML) und Gestaltung (CSS-Dateien).
