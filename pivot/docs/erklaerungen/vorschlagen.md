# Ort vorschlagen: das Formular `vorschlagen.html`

Erklärung für die Präsentation. Zeilennummern erzeugt am 2026-09-29 11:54 aus den aktuellen Dateien; sie gelten in beiden Varianten (`web/variante-svg` und `web/variante-css3d`), denn diese Seite ist dort gleich.

**Vorschlag für die Präsentation:** Lukas Niedling (Tests und Präsentation) zeigt Formular, Prüfungen im Browser und mit JavaScript und das iframe; den PHP-Teil (`php/vorschlag.php`) erklärt Anes Sahbegovic (Programmierung). Die ganze Aufteilung für alle fünf steht in [README.md](README.md) unter „Vorschlag: wer präsentiert was“.

## Was die Seite zeigt und warum

Besucher schlagen einen Ort in den Quadraten vor oder schicken eine allgemeine Frage. Links steht das **Kontaktformular** („Über dich“: Name und E-Mail; „Dein Vorschlag“: Ort, Quadrat, Kategorie, Nachricht; Zustimmung zum Datenschutz), rechts eine **OpenStreetMap-Karte im iframe**, auf der man das richtige Quadrat findet.

Warum so:

- Formular und iframe sind Pflicht-Elemente der Team-Übung 2 (Vorlesung 3). Auf dieser Seite steht außerdem das eine Beispiel für eine Inline-Formatierung mit dem Attribut `style` (Vorlesung 3 und 4).
- Die Seite wächst mit den Versionen: **V1** nutzt die Prüfungen des Browsers (`required`, `minlength`, `pattern` …) und sendet nichts. **V2** ergänzt freundliche Meldungen, einen Zeichenzähler und einen Hinweis, wenn die Seite als Datei geöffnet ist (`js/formular.js`). **V3** sendet das Formular an `php/vorschlag.php`, das alles noch einmal prüft und speichert.

## So führst du die Seite vor

1. Ohne etwas einzutragen auf „Vorschlag senden“ klicken: Über dem Formular erscheint die Liste „Bitte prüfe diese 5 Felder“, jedes falsche Feld bekommt eine rote Kante und eine Meldung darunter, der Cursor steht im ersten Feld.
2. Eine E-Mail ohne Punkt nach dem @ eintippen (`anna@beispiel`) und das Feld verlassen: Die Meldung erklärt, was fehlt.
3. In die Nachricht tippen: Der Zähler zählt mit („12 von 1.000 Zeichen“).
4. Per Doppelklick geöffnet (Adresse `file://`): Der Hinweis „Senden nur mit PHP-Server“ erklärt, dass Senden einen PHP-Server braucht. Über XAMPP (`http://localhost/…`) richtig ausfüllen und senden: Es folgt die Seite „Danke für deinen Vorschlag“.
5. Rechts die Karte verschieben: Das ist eine fremde Seite (openstreetmap.org) in einem `<iframe>`.

## Aufbau des Quelltexts

### Beteiligte Dateien

| Datei | Aufgabe | Version |
|---|---|---|
| `vorschlagen.html` | Formular, Karte im iframe, Hinweise | V1 (Versand V3) |
| `css/style.css`, Abschnitt 12 | Aussehen aller Formularfelder, Fehler- und Gültig-Zustände, Checkbox | V1 |
| `css/formular.css` | nur diese Seite: zwei Spalten, Felder in Gruppen, Zähler, versteckter Honigtopf | V1, V2, V3 |
| `js/formular.js` | freundliche Prüfung, Fehlerliste, Zeichenzähler, Hinweis bei `file://` | V2 |
| `php/vorschlag.php` | nimmt das Formular an, prüft es auf dem Server, speichert es, zeigt Dank- oder Fehlerseite | V3 |
| `php/lib.php` | gemeinsame PHP-Hilfen: `h()`, `postValue()`, `redirect()`, Sperre und JSON-Speicher | V3 |
| `daten/vorschlaege.json` | entsteht beim ersten Vorschlag; `daten/.htaccess` verbietet den Abruf von außen | V3 |

### `vorschlagen.html` von oben nach unten

1. Kopfkommentar `vorschlagen.html:3` mit den Teilen von V1, V2 und V3.
2. Kopf, Navigation (hier `aria-current` bei „Ort vorschlagen“ `vorschlagen.html:44`) und Einleitung.
3. Zweispaltiges Layout `vorschlagen.html:61`: links `<section>` mit dem Formular, rechts `<aside>` mit der Karte.
4. Leerer Platz für Meldungen aus JavaScript `vorschlagen.html:67`.
5. Das Formular `vorschlagen.html:74`: `action="php/vorschlag.php"` (wohin), `method="post"` (wie), `accept-charset="utf-8"`.
6. Gruppe „Über dich“ `vorschlagen.html:77`: Name `vorschlagen.html:82` und E-Mail `vorschlagen.html:91`. Jedes Feld steckt in einem `<div class="field">` mit Beschriftung, Hinweis und Fehlermeldung.
7. Gruppe „Dein Vorschlag“ `vorschlagen.html:98`: Name des Ortes, Auswahlliste mit allen 146 Quadraten in zwei `<optgroup>` `vorschlagen.html:111`, Kategorie als Optionsfelder `vorschlagen.html:267`, Nachricht als `<textarea>` `vorschlagen.html:283` mit Zähler.
8. Honigtopf-Feld gegen Spam-Roboter `vorschlagen.html:293` und Zustimmung zum Datenschutz `vorschlagen.html:303`.
9. Knöpfe „Vorschlag senden“ und „Eingaben löschen“ `vorschlagen.html:310`.
10. Karte: `<aside>` `vorschlagen.html:316`, `<iframe>` `vorschlagen.html:323` und der Absatz mit Inline-Stil `vorschlagen.html:332`.
11. Fußzeile und `js/formular.js` `vorschlagen.html:351`.

### Drei Stufen der Prüfung

1. **Browser (V1):** Die Attribute `required`, `minlength`, `maxlength`, `pattern` und `type="email"` prüft der Browser selbst. Die CSS-Pseudoklasse `:user-invalid` `css/style.css:1314` färbt ein falsches Feld erst, nachdem jemand etwas eingegeben oder das Senden versucht hat.
2. **JavaScript (V2):** `initForm()` `js/formular.js:486` schaltet die kleinen Sprechblasen des Browsers ab (`noValidate`) und meldet sich für `submit` an. `handleSubmit()` `js/formular.js:332` prüft jedes Feld mit `checkField()` `js/formular.js:189`, das die Regel aus `findError()` `js/formular.js:111` holt. Bei Fehlern stoppt `event.preventDefault()` das Senden, und `showErrorList()` `js/formular.js:246` zeigt die Liste mit Links zu den Feldern.
3. **PHP (V3):** `php/vorschlag.php` prüft alles noch einmal `php/vorschlag.php:131`, denn jeder kann Daten an diese Adresse schicken, ohne unser Formular zu benutzen.

### Was `php/vorschlag.php` tut

1. Kommt die Anfrage nicht per POST, zeigt es mit `?status=gesendet` die Dankseite, sonst den Status 405 `php/vorschlag.php:261`.
2. Liest alle Felder ohne Leerzeichen am Rand `php/vorschlag.php:101`.
3. Ist das versteckte Feld `website` ausgefüllt, war es fast sicher ein Roboter: Er bekommt die Dankseite, gespeichert wird nichts `php/vorschlag.php:276`.
4. Prüft, ob das Formular von unserer Website kommt (Header `Origin`) `php/vorschlag.php:188`, dann alle Felder.
5. Speichert den Vorschlag unter einer Sperre in `daten/vorschlaege.json` `php/vorschlag.php:217`.
6. Leitet bei Erfolg auf die Dankseite weiter `php/vorschlag.php:314` (Muster Post/Redirect/Get: Neu laden sendet nicht noch einmal). Bei Problemen zeigt es eine Fehlerseite mit der Liste der Probleme und den eingegebenen Werten.

## Begriffe aus dem Quelltext

Spalte „Kurs“: **VL3 S.2** = Vorlesung 3, Folie 2. **VL5\*** = im Inhaltsverzeichnis von Vorlesung 4 (Folie 2–3) angekündigt. **JS** = Thema der JavaScript-Vorlesung (VL6), **PHP** = Thema der PHP-Vorlesung (VL7). **–** = nicht in den Folien.

### HTML

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Grundgerüst | `vorschlagen.html:1`, `vorschlagen.html:22` | HTML5-Dokument mit Zeichenkodierung UTF-8, wie auf jeder Seite. | VL2 S.3 |
| `<section>` und `<aside>` | `vorschlagen.html:62`, `vorschlagen.html:316` | Hauptabschnitt mit dem Formular und ein Nebenbereich mit ergänzendem Inhalt (die Karte). | – |
| `<form action method>` | `vorschlagen.html:74` | `action` sagt, wohin die Daten gehen, `method="post"` schickt sie im Inhalt der Anfrage statt in der Adresse. | VL3 S.2 |
| `<fieldset>` und `<legend>` | `vorschlagen.html:76`, `vorschlagen.html:77` | Rahmen um zusammengehörige Felder mit einer Überschrift. | VL3 S.2 |
| `<label for>` | `vorschlagen.html:80` | Beschriftung, die zu dem Feld mit dieser id gehört; ein Klick auf den Text setzt den Cursor ins Feld. | VL3 S.2 |
| `<input type="text">` mit `name` | `vorschlagen.html:82` | Textfeld; unter `name` kommt der Wert beim Server an (`$_POST['name']`). | VL3 S.2 |
| `required`, `minlength`, `maxlength` | `vorschlagen.html:82` | Pflichtfeld, mindestens 2 und höchstens 80 Zeichen; der Browser prüft das selbst. | – |
| `autocomplete` | `vorschlagen.html:82` | Sagt dem Browser, welche gespeicherte Angabe er vorschlagen darf. | – |
| `type="email"` und `pattern` | `vorschlagen.html:92` | `type="email"` verlangt ein @; das Muster (regulärer Ausdruck) verlangt zusätzlich einen Punkt dahinter. | – |
| `title` bei einem Feld | `vorschlagen.html:92` | Tooltip und Zusatztext der Browsermeldung, wenn das Muster nicht passt. | VL2 S.7 |
| `aria-describedby` | `vorschlagen.html:82` | Verknüpft das Feld mit seinem Hinweistext, den Screenreader dann mit vorlesen. | – |
| `placeholder` | `vorschlagen.html:103` | Grauer Beispieltext im leeren Feld; er ersetzt keine Beschriftung. | – |
| `<select>`, `<optgroup>`, `<option value>` | `vorschlagen.html:109`, `vorschlagen.html:111`, `vorschlagen.html:153` | Auswahlliste mit Gruppen; gesendet wird der `value`, angezeigt der Text. | VL3 S.2 |
| Optionsfelder mit `required` | `vorschlagen.html:271` | Alle Felder mit `name="kategorie"` sind eine Gruppe; `required` an einem macht die ganze Gruppe zur Pflicht. | VL3 S.2 |
| `<textarea>` | `vorschlagen.html:283` | Mehrzeiliges Textfeld; `rows="6"` gibt die sichtbare Höhe an. | VL3 S.2 |
| `<input type="checkbox">` | `vorschlagen.html:303` | Ankreuzfeld; nur wenn es angekreuzt ist, sendet der Browser `datenschutz=ja`. | VL3 S.2 |
| `target="_blank"` | `vorschlagen.html:304` | Öffnet den Link in einem neuen Tab, damit die Eingaben im Formular nicht verloren gehen. | VL2 S.6 |
| `tabindex="-1"` am Honigtopf | `vorschlagen.html:295` | Das Feld wird mit der Tab-Taste übersprungen; Menschen sehen es ohnehin nicht. | – |
| `<button type="submit">` / `type="reset"` | `vorschlagen.html:310`, `vorschlagen.html:311` | Der eine Knopf sendet das Formular, der andere leert alle Felder. | VL3 S.2 |
| `<iframe>` | `vorschlagen.html:323` | Bettet eine fremde Webseite ein, hier die Karte von openstreetmap.org; `title` beschreibt sie für Screenreader. | VL3 S.2 |
| `&amp;` in der Adresse | `vorschlagen.html:323` | Im HTML-Quelltext schreibt man das Zeichen `&` als Entität `&amp;`. | VL2 S.5 |
| `loading="lazy"` | `vorschlagen.html:325` | Die Karte lädt erst, wenn sie in den sichtbaren Bereich kommt. | – |
| Inline-Stil `style="..."` | `vorschlagen.html:332` | CSS direkt am Element; gilt nur für dieses eine Element und schlägt die Regeln aus den CSS-Dateien. | VL3 S.3, VL4 S.11 |
| `hidden` am Zähler | `vorschlagen.html:285` | Der Zähler ist versteckt, bis `formular.js` ihn einblendet. | – |

### CSS

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Grid mit Media Query | `css/formular.css:19`, `css/formular.css:25` | Eine Spalte auf dem Handy; ab 64rem stehen Formular und Karte nebeneinander. | VL4 S.4 |
| `minmax(0, 40rem)` | `css/formular.css:27` | Die Formularspalte ist höchstens 40rem breit, die Kartenspalte nimmt den Rest (`1fr`). | – |
| Feld als kleines Grid | `css/style.css:1248` | Beschriftung, Hinweis, Eingabefeld und Fehlermeldung stehen mit gleichem Abstand untereinander. | – |
| `:not()` mit Liste | `css/style.css:1123` | Alle Eingabefelder außer Checkboxen, Optionsfeldern, Reglern und Knöpfen bekommen denselben Rahmen. | – |
| Fehlermeldung ein- und ausblenden | `css/style.css:1271`, `css/style.css:1296` | Die Meldung hat `display: none`; erst die Klasse `field--error` am umgebenden Feld zeigt sie. | – |
| `::before` mit `content` | `css/style.css:1281` | Erzeugt das kleine Quadrat mit „!“ vor jeder Fehlermeldung. | VL5\* |
| `:user-invalid` | `css/style.css:1314` | Zustand „ungültig“, aber erst nachdem jemand etwas eingegeben oder das Senden versucht hat. | – |
| `:has()` | `css/style.css:1322` | Wählt das Feld, das ein ungültiges Eingabefeld enthält, und blendet seine Meldung ein (ohne JavaScript). | – |
| `:placeholder-shown` | `css/formular.css:105` | Ein leeres freiwilliges Feld bekommt nach dem Senden keinen grünen Rand. | – |
| `box-shadow: inset` | `css/style.css:1308` | Innenschatten als dicke linke Kante: Fehler sind auch ohne Farbsehen erkennbar. | – |
| `background-image` mit SVG | `css/style.css:1156` | Der Pfeil der Auswahlliste ist ein kleines SVG-Bild direkt im CSS, damit er überall gleich aussieht. | VL5\* |
| `accent-color` | `css/style.css:1356` | Färbt das Häkchen der Checkbox dunkelgrau statt blau. | – |
| Nachbar-Selektor bei Chips | `css/style.css:990` | Das Label direkt nach dem gewählten Optionsfeld wird zum farbigen Chip. | – |
| `calc()` | `css/formular.css:52` | Rechnet mit CSS-Werten; hier ein negativer Abstand, damit der Hinweis näher an der Überschrift steht. | – |
| `display: none` (Honigtopf) | `css/formular.css:145` | Versteckt das Feld für Menschen und Screenreader; Roboter lesen kein CSS und füllen es aus. | – |
| `aspect-ratio` am iframe | `css/style.css:682` | Der Rahmen der Karte behält auf jeder Breite das Seitenverhältnis 4 : 3. | – |
| Klassen für Zustände | `css/formular.css:129` | Der Zähler wird braun, wenn weniger als 100 Zeichen frei sind; der Text sagt es zusätzlich. | – |

### JavaScript

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Objekt mit Meldungen | `js/formular.js:28` | Ein Objekt je Feld mit den deutschen Meldungen, zum Beispiel `MESSAGES.name.missing`. | JS |
| Array | `js/formular.js:60` | Die Liste der Felder, die das Skript prüft, in der Reihenfolge des Formulars. | JS |
| `getElementById`, `querySelector` | `js/formular.js:71`, `js/formular.js:75` | Holt Elemente aus dem DOM über id bzw. CSS-Selektor. | JS |
| `form.noValidate` | `js/formular.js:490` | Schaltet die Sprechblasen des Browsers ab, weil das Skript eigene Meldungen zeigt. | JS |
| Ereignis `submit` | `js/formular.js:491` | Feuert, wenn das Formular gesendet werden soll. | JS |
| `event.preventDefault()` | `js/formular.js:341` | Hält das Senden an, solange Fehler da sind. | JS |
| `form.elements` | `js/formular.js:116` | Alle Felder eines Formulars nach ihrem `name`; bei Optionsfeldern ist `value` der gewählte Wert. | JS |
| `validity` | `js/formular.js:140` | Das Ergebnis der Browser-Prüfung, zum Beispiel „passt nicht zu type="email"“. | JS |
| `trim()` | `js/formular.js:130` | Entfernt Leerzeichen am Anfang und Ende; ein Name nur aus Leerzeichen gilt als leer. | JS |
| `closest()` | `js/formular.js:178` | Sucht vom Feld aus nach oben den umgebenden Kasten mit der Klasse `field`. | JS |
| `classList.add`, `remove`, `toggle` | `js/formular.js:206`, `js/formular.js:450` | Fügt CSS-Klassen hinzu, entfernt sie oder schaltet sie je nach Bedingung. | JS |
| `setAttribute("aria-invalid")` | `js/formular.js:207` | Sagt Screenreadern, dass dieses Feld falsch ausgefüllt ist. | JS |
| `split`, `filter`, `join` | `js/formular.js:163` | Zerlegt einen Text in ein Array, behält nur passende Einträge und setzt sie wieder zusammen. | JS |
| `forEach` | `js/formular.js:334` | Ruft eine Funktion für jeden Eintrag eines Arrays auf. | JS |
| `createElement`, `appendChild` | `js/formular.js:216` | Baut den Meldungskasten als neue Elemente und hängt ihn in die Seite. | JS |
| `role="alert"` aus JS | `js/formular.js:255` | Screenreader lesen die Fehlerliste sofort vor. | JS |
| `window.location.protocol` | `js/formular.js:291` | Erkennt, ob die Seite als Datei (per Doppelklick) geöffnet ist. | JS |
| Ereignisse `blur`, `input`, `change` | `js/formular.js:400`, `js/formular.js:408`, `js/formular.js:419` | Feld verlassen, jede Eingabe, Auswahl geändert. | JS |
| `window.confirm` | `js/formular.js:376` | Fragt mit „OK / Abbrechen“ nach, bevor alle Eingaben gelöscht werden. | JS |
| `setTimeout(..., 0)` | `js/formular.js:382` | Führt die Aufräumarbeit aus, gleich nachdem der Browser die Felder geleert hat. | JS |
| `toLocaleString("de-DE")` | `js/formular.js:449` | Schreibt Zahlen deutsch: 1000 wird „1.000“. | JS |
| `aria-live` aus JS | `js/formular.js:475` | Ein unsichtbarer Bereich sagt Screenreadern „Noch 50 Zeichen frei“, aber nur beim Wechsel der Stufe. | JS |
| `disabled` | `js/formular.js:356` | Sperrt den Knopf nach dem Senden, damit ein Doppelklick nicht zweimal sendet. | JS |
| Ereignis `pageshow` | `js/formular.js:502` | Feuert auch, wenn der Browser die Seite mit der Zurück-Taste aus dem Zwischenspeicher zeigt. | JS |

### PHP (Version V3)

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `<?php` | `php/vorschlag.php:1` | Ab hier ist PHP-Code, den der Server ausführt, bevor er die Seite schickt. | PHP |
| `require_once` und `__DIR__` | `php/vorschlag.php:47` | Bindet eine andere PHP-Datei genau einmal ein; `__DIR__` ist der Ordner dieser Datei. | PHP |
| `const` | `php/vorschlag.php:68` | Eine Konstante: ein fester Wert, der sich nicht ändert, hier die Höchstlänge wie im HTML. | PHP |
| assoziatives Array | `php/vorschlag.php:71` | Array mit Namen als Schlüsseln: `'name' => 'Dein Name'`. | PHP |
| Funktion mit Typen | `php/vorschlag.php:101` | Der Parameter muss ein Text sein, das Ergebnis auch. | PHP |
| `$_POST` | `php/lib.php:202` | Die Felder des gesendeten Formulars; `?? ''` nimmt einen leeren Text, wenn das Feld fehlt. | PHP |
| `$_GET` | `php/vorschlag.php:257` | Werte aus der Adresse nach dem `?`, hier `?status=gesendet`. | PHP |
| `$_SERVER` | `php/vorschlag.php:190` | Angaben zur Anfrage, zum Beispiel von welcher Website das Formular kommt. | PHP |
| `trim`, `mb_strlen` | `php/vorschlag.php:107`, `php/vorschlag.php:135` | Leerzeichen am Rand entfernen; Zeichen zählen, wobei „ä“ ein Zeichen ist (`strlen` würde Bytes zählen). | PHP |
| `filter_var` und `preg_match` | `php/vorschlag.php:119`, `php/vorschlag.php:123` | PHP prüft die E-Mail selbst und mit demselben Muster wie das HTML. | PHP |
| `array_key_exists` | `php/vorschlag.php:155` | Prüft, ob es das gesendete Quadrat in unseren Daten gibt. | PHP |
| `if` / `elseif` / `else` | `php/vorschlag.php:138` | Verzweigung wie in JavaScript. | PHP |
| `http_response_code` | `php/vorschlag.php:294` | Setzt den HTTP-Statuscode, zum Beispiel 400 „ungültige Anfrage“. | PHP |
| `header()` | `php/vorschlag.php:262` | Schickt eine Kopfzeile der Antwort; muss vor jeder Ausgabe stehen. | PHP |
| Weiterleitung, Post/Redirect/Get | `php/lib.php:192` | Status 303 schickt den Browser mit GET zur Dankseite; Neu laden sendet dann nicht noch einmal. | PHP |
| `date()` | `php/vorschlag.php:303` | Datum und Uhrzeit als Text, zum Beispiel „2026-10-13 10:15“. | PHP |
| `flock` über `lockData` | `php/vorschlag.php:219` | Sperre: Während ein Vorschlag gespeichert wird, warten alle anderen Anfragen. | PHP |
| Array erweitern `$list[] =` | `php/vorschlag.php:234` | Hängt einen Eintrag hinten an ein Array an. | PHP |
| `json_encode` beim Speichern | `php/lib.php:366` | Macht aus dem PHP-Array Text im JSON-Format, der in die Datei geschrieben wird. | PHP |
| `htmlspecialchars` in `h()` | `php/lib.php:182` | Macht `<`, `>`, `&` und Anführungszeichen harmlos, bevor Text in die Seite kommt (Schutz vor XSS). | PHP |
| Kurzausgabe `<?= ?>` | `php/vorschlag.php:376` | Schreibt einen Wert in das HTML; `<?= x ?>` ist kurz für `<?php echo x; ?>`. | PHP |
| `foreach` mit `:` und `endforeach` | `php/vorschlag.php:384` | Schleife über alle Einträge, in dieser Schreibweise gut zwischen HTML lesbar. | PHP |
| `nl2br` | `php/vorschlag.php:403` | Macht Zeilenumbrüche der Nachricht zu `<br>`, nachdem der Text maskiert wurde. | PHP |

## Fragen, die der Dozent stellen könnte

1. **Warum prüft ihr die Eingaben dreimal: im Browser, in JavaScript und in PHP?**
   Der Browser prüft ohne jede Zeile Code (Version V1), zeigt aber nur kurze Sprechblasen. JavaScript gibt freundlichere Meldungen direkt am Feld. Beides läuft beim Besucher und lässt sich umgehen: Jeder kann Daten an `php/vorschlag.php` schicken, ohne unser Formular zu benutzen. Deshalb prüft der Server zum Schluss alles noch einmal mit denselben Regeln.

2. **Was ist der Unterschied zwischen GET und POST, und was macht ihr nach dem Senden?**
   Bei GET stehen die Daten in der Adresse (`?status=gesendet`), bei POST im Inhalt der Anfrage, wo sie nicht in der Adresszeile und im Verlauf landen. Nach dem Speichern leitet PHP mit Status 303 auf die Dankseite weiter (Post/Redirect/Get). Lädt jemand die Dankseite neu, wird das Formular nicht noch einmal gesendet.

3. **Was passiert, wenn man die Seite per Doppelklick öffnet und auf Senden klickt?**
   Ohne Server kann der Browser PHP nicht ausführen; er würde nur den Programmtext von `vorschlag.php` anzeigen. `formular.js` erkennt an `window.location.protocol === "file:"`, dass die Seite als Datei geöffnet ist, zeigt einen Hinweis und hält das Senden an. Zum Senden braucht man einen PHP-Server wie XAMPP.

4. **Wie schützt ihr euch vor Spam und vor eingeschleustem HTML?**
   Gegen einfache Roboter gibt es ein unsichtbares Honigtopf-Feld: Menschen sehen es nicht, Roboter füllen es aus, und dann wird nichts gespeichert. Außerdem prüft PHP den Header `Origin`, also ob das Formular von unserer Website kommt. Alles, was ein Besucher eingegeben hat, läuft vor der Ausgabe durch `h()` (`htmlspecialchars`), damit niemand HTML oder JavaScript in die Seite schmuggeln kann (XSS).

5. **Warum steht die Karte in einem `<iframe>`, und warum gibt es hier ein `style`-Attribut?**
   Das iframe bettet die Karte von openstreetmap.org ein, ohne dass wir sie selbst bauen müssen. Dabei verbindet sich der Browser mit den Servern von OpenStreetMap und schickt seine IP-Adresse; deshalb steht darunter ein Hinweis, und die Datenschutzerklärung erklärt es. Das `style`-Attribut ist bewusst das einzige Beispiel für Inline-CSS aus der Vorlesung: Es gilt nur für diesen Absatz und schlägt die Regeln der CSS-Dateien. Sonst trennen wir Inhalt (HTML) und Gestaltung (CSS-Dateien).
