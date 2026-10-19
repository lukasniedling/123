# Konto: Anmelden, Registrieren, Mein Konto (im Browser gespeichert)

Erklärung für die Präsentation. Zeilennummern erzeugt am 2026-10-07 14:25, geprüft und korrigiert am 2026-10-13, für `konto.js`, `konto-seite.js`, `konto.html` und `konto.css` neu am 2026-10-10 (Anmelden mit E-Mail und Bestätigungscode). Alle Fundstellen beziehen sich auf `final-v5/`. Das Konto braucht keinen Server: Konten und gemerkte Orte speichert der Browser selbst mit **localStorage** (Entscheidung D-042, 2026-10-07). Die Seite funktioniert deshalb per Doppelklick auf `index.html`.

**Vorschlag für die Präsentation:** Anes Sahbegovic (Programmierung). Die ganze Aufteilung für alle fünf steht in [README.md](README.md) unter „Vorschlag: wer präsentiert was“.

## Was die Seite zeigt und warum

| Wo | Was passiert |
|---|---|
| `konto.html`, nicht angemeldet | Zwei Formulare nebeneinander: **Anmelden** und **Konto anlegen** (E-Mail-Adresse und Passwort). |
| `konto.html`, registriert, aber nicht bestätigt | **E-Mail bestätigen**: ein Feld für den 6-stelligen Code und daneben ein **Postfach (Simulation)** mit der E-Mail, die den Code enthält. Erst mit dem richtigen Code kann man sich anmelden. |
| `konto.html`, angemeldet | **Mein Konto** (bis 14.10.2026 „Meine Orte“): Profilbild, Vorlieben, Überblick, Verlauf und Tagespläne; ganz unten **Abmelden** und **Konto löschen**. Die gemerkten Orte selbst stehen seit dem 14.10.2026 nur noch auf der Merkliste (siehe unten). |
| Karte (`index.html`) | Im Steckbrief steht bei jedem Ort der Knopf **Merken**, seit 13.10.2026 auch ohne Anmeldung (dann gilt die Merkliste nur bis zum Schließen des Tabs, siehe [merkliste.md](merkliste.md)). Quadrate mit gemerkten Orten bekommen eine Stecknadel, die Legende zeigt „gemerkte Orte“. Beim Anmelden kommen die Orte aus dem Tab ins Konto. |

Warum so: Die Website läuft nur auf dem eigenen Rechner und wird nicht veröffentlicht. Ein PHP-Server (XAMPP) wäre nur für die Vorführung nötig und macht das Öffnen umständlich. localStorage ist ein Speicher im Browser, den JavaScript lesen und schreiben kann. Er bleibt nach dem Schließen des Browsers erhalten. Sicherheit ist hier kein Ziel: Das Passwort steht als Klartext im Browser. Darauf weisen das Formular und `datenschutz.html` hin.

Warum die E-Mail nur simuliert ist: Eine echte E-Mail kann nur ein Server verschicken (zum Beispiel PHP mit einem Mailserver) oder ein fremder Versanddienst. Beides passt nicht zu „per Doppelklick, ohne Server“. Die Seite macht deshalb alles, was ein Server tun würde, im Browser: Sie erzeugt einen Code, speichert ihn beim Konto und prüft ihn. Nur das Verschicken ersetzt sie durch das Postfach auf der Seite, das deutlich als Simulation beschriftet ist.

Eine erste Fassung mit PHP (Sessions, Passwort-Hash, JSON-Dateien auf dem Server) ist archiviert: im Git-Tag `final-php-2026-10-07` und in `pivot/`. Der Vergleich steht unten unter „Fragen, die der Dozent stellen könnte“.

## So führst du es vor

1. `final-v5/index.html` per Doppelklick öffnen, oben rechts auf **Konto**.
2. Unter **Konto anlegen**: E-Mail-Adresse `anna@example.de`, Passwort mit mindestens 6 Zeichen. Danach erscheint **E-Mail bestätigen** mit dem simulierten Postfach.
3. Zum Zeigen der Prüfung: einen falschen Code eingeben → „Der Code stimmt nicht.“ Dann den Code aus dem Postfach eingeben → zurück bei **Anmelden**, mit grüner Meldung und schon eingetragener Adresse.
4. Passwort eingeben, **Anmelden**: „Mein Konto“ mit Profilbild, Vorlieben und Überblick (noch ohne Einträge).
5. Zur Karte, ein Quadrat wählen, im Steckbrief bei einem Ort **Merken**: Der Knopf bekommt ein Häkchen, das Quadrat eine Stecknadel.
6. **Merkliste** öffnen: Der Ort steht unter seinem Quadrat, **Entfernen** löscht ihn wieder. Auf **Konto** zählt „Dein Überblick“ ihn mit.
7. Zum Zeigen, wo die Daten liegen: Entwicklertools öffnen (Chrome: Application → Local Storage, Safari: Speicher → Lokaler Speicher). Dort stehen die Schlüssel `quadrate-konten` und `quadrate-angemeldet` mit JSON-Text. Bei einem unbestätigten Konto sieht man `"bestaetigt": false` und den Code.
8. **Abmelden**: Die Formulare erscheinen wieder, auf der Karte verschwinden die Stecknadeln (die Orte bleiben im Konto). „Merken“ bleibt, merkt jetzt aber nur noch für diesen Tab.

## Aufbau des Quelltexts

### Beteiligte Dateien

| Datei | Aufgabe |
|---|---|
| `js/konto.js` | speichert und liest Konten und gemerkte Orte im localStorage; bietet `window.Konto` |
| `js/konto-seite.js` | steuert `konto.html`: Formulare, Profilbild, Vorlieben, Überblick, Verlauf, Tagespläne, Abmelden, Konto löschen |
| `konto.html` | die Seite mit drei Teilen (nicht angemeldet / nicht bestätigt / angemeldet) |
| `js/steckbrief.js` (Teil „saved places“) | Knöpfe „Merken“ im Steckbrief, Stecknadeln über `Karte.markieren()` |
| `css/konto.css` | Anordnung der Formulare, das simulierte Postfach und die Kästen des Kontos |

### So liegen die Daten im Browser

localStorage speichert nur Text, immer als Paar aus Schlüssel und Wert. Deshalb wird das Objekt mit allen Konten mit `JSON.stringify` in Text verwandelt und beim Lesen mit `JSON.parse` zurück `js/konto.js:14`:

```
quadrate-konten      {"anna@example.de":{"passwort":"geheim1","seit":"2026-10-10T09:12:00.000Z","bestaetigt":true,"orte":["n283313010"]}}
quadrate-angemeldet  anna@example.de
```

Vor der Bestätigung steht beim Konto `"bestaetigt":false` und `"code":"483920"`. Nach der Bestätigung wird der Code gelöscht.

Die Schlüssel stehen als Konstanten am Anfang `js/konto.js:36`, `js/konto.js:37`.

### `js/konto.js` von oben nach unten

1. Alles steht in einer Funktion, die sich sofort selbst aufruft `js/konto.js:33`. So bleiben die Hilfsfunktionen privat; nach außen geht nur `window.Konto` `js/konto.js:187`.
2. `isAvailable()` `js/konto.js:42` schreibt einen Testwert und löscht ihn wieder. In manchen privaten Fenstern wirft localStorage einen Fehler; `try`/`catch` fängt ihn ab.
3. `loadAccounts()` `js/konto.js:53` liest den Text und macht daraus ein Objekt `js/konto.js:55`. Gibt es noch nichts, liefert `getItem` `null`, und `|| {}` nimmt ein leeres Objekt.
4. `saveAccounts()` `js/konto.js:62` schreibt alles zurück `js/konto.js:63`.
5. `normalize()` `js/konto.js:67` entfernt Leerzeichen am Rand und macht Kleinbuchstaben: „Anna@Example.de “ und „anna@example.de“ sind dasselbe Konto.
6. `newCode()` `js/konto.js:72` erzeugt den Bestätigungscode: `Math.random()` liefert eine Zahl von 0 bis unter 1, mal 900000 plus 100000, abgerundet mit `Math.floor`. So entsteht immer eine 6-stellige Zahl von 100000 bis 999999 `js/konto.js:73`.
7. `register()` `js/konto.js:86` prüft die Adresse mit einem regulären Ausdruck `js/konto.js:38` (Text, `@`, Text, Punkt, Text, keine Leerzeichen), dann die Länge des Passworts `js/konto.js:91`, dann ob es die Adresse schon gibt `js/konto.js:95`. Geht alles, legt es das Konto an `js/konto.js:98`: noch **nicht bestätigt** und mit neuem Code. Anders als früher meldet es **nicht** an. Rückgabe: `""` bei Erfolg, sonst ein deutscher Fehlertext.
8. `code()` `js/konto.js:109` gibt den Code eines unbestätigten Kontos heraus. Das braucht nur das simulierte Postfach; ein echter Server würde den Code nie an die Seite geben, sondern nur per E-Mail schicken.
9. `confirm()` `js/konto.js:114` vergleicht den eingegebenen Code mit dem gespeicherten `js/konto.js:124`. Stimmt er, wird `bestaetigt` auf `true` gesetzt `js/konto.js:127` und der Code mit `delete` entfernt `js/konto.js:128`.
10. `login()` `js/konto.js:133` liefert eines von drei Wörtern: `"falsch"` (Adresse unbekannt oder Passwort falsch), `"unbestaetigt"` (Passwort richtig, aber noch nicht bestätigt, `js/konto.js:139`) oder `"ok"`. Nur bei `"ok"` merkt es sich die Adresse unter `quadrate-angemeldet` `js/konto.js:142`.
11. `user()` `js/konto.js:76` liefert die angemeldete Adresse, aber nur, wenn es das Konto noch gibt und es bestätigt ist.
12. `toggle()` `js/konto.js:159` sucht den Ort in der Liste `js/konto.js:166`: gefunden → entfernen mit `splice` `js/konto.js:168`, sonst anhängen mit `push`. Rückgabe: `true`, wenn der Ort jetzt gemerkt ist.
13. `deleteAccount()` `js/konto.js:176` löscht das Konto mit `delete` `js/konto.js:182` und meldet ab.

### `konto.html` und `js/konto-seite.js`

- Die Seite enthält drei Teile, alle mit dem Attribut `hidden` `konto.html:69`, `konto.html:119`, `konto.html:163`. `show()` `js/konto-seite.js:43` blendet den passenden Teil ein `js/konto-seite.js:51`–`js/konto-seite.js:53`.
- Welche Adresse gerade auf ihren Code wartet, steht in der Variablen `pendingEmail` `js/konto-seite.js:26`. Ist sie leer und niemand angemeldet, erscheinen die Formulare.
- **Konto anlegen**: `onRegister()` `js/konto-seite.js:345` ruft `Konto.register()` `js/konto-seite.js:349`. Ohne Fehler geht es mit `startConfirming()` `js/konto-seite.js:337` zum Code-Formular, der Cursor springt ins Code-Feld `js/konto-seite.js:341`.
- `showMail()` `js/konto-seite.js:330` füllt das simulierte Postfach mit Adresse und Code `konto.html:147`, `konto.html:155`.
- **Bestätigen**: `onConfirm()` `js/konto-seite.js:358` ruft `Konto.confirm()` `js/konto-seite.js:361`. Stimmt der Code, zeigt die Seite wieder „Anmelden“ mit grüner Meldung `konto.html:79` und trägt die Adresse schon ein.
- **Anmelden**: `onLogin()` `js/konto-seite.js:376` wertet die drei Antworten von `Konto.login()` aus `js/konto-seite.js:383`, `js/konto-seite.js:385`. Bei `"unbestaetigt"` kommt man zum Code-Formular. So geht kein Konto verloren, wenn jemand die Seite vor dem Bestätigen schließt.
- Beim Absenden verhindert `preventDefault()` das Neuladen der Seite `js/konto-seite.js:346`. Fehlertexte kommen in den Fehlerabsatz `konto.html:89`, `role="alert"` lässt Screenreader ihn vorlesen.
- Bis zum 14.10.2026 stand hier auch die Liste der gemerkten Orte (`showPlaces()`). Sie war doppelt zur Merkliste und ist entfernt (siehe unten).
- Alle Kästen werden mit `createElement` und `textContent` gebaut `js/konto-seite.js:31`, nicht mit `innerHTML`. `textContent` setzt reinen Text, HTML in einem Namen wird nie ausgeführt.
- „Konto löschen“ fragt mit `confirm()` nach `js/konto-seite.js:415`.
- Blockiert der Browser localStorage, zeigt die Seite einen Hinweis `js/konto-seite.js:397`.

### „Merken“ auf der Karte (`js/steckbrief.js`)

Seit 13.10.2026 spricht der Steckbrief nicht mehr direkt mit `Konto`, sondern mit `Merkliste` (`js/merkliste.js`, erklärt in [merkliste.md](merkliste.md)). Angemeldet reicht `Merkliste` alles an `Konto` weiter, `js/konto.js` ist unverändert.

1. `saveButtonMarkup()` `js/steckbrief.js:308` gibt einen Knopf aus, außer der Browser blockiert jedes Speichern `js/steckbrief.js:309`. `aria-pressed` sagt, ob der Ort gemerkt ist `js/steckbrief.js:314`.
2. `savingNoteMarkup()` `js/steckbrief.js:471` verlinkt die Merkliste; ohne Anmeldung sagt es dazu, dass sie nur bis zum Schließen des Tabs gilt, mit Link zu `konto.html`.
3. Ein Klick landet bei einem einzigen Zuhörer für den ganzen Steckbrief `js/steckbrief.js:634` und ruft `toggleSaved()` `js/steckbrief.js:599`. Das speichert mit `Merkliste.toggle()` und setzt `aria-pressed` neu `js/steckbrief.js:601`.
4. `showPins()` `js/steckbrief.js:564` sammelt die Quadrate der gemerkten Orte und setzt die Stecknadeln `js/steckbrief.js:590`. In der Legende erscheint „gemerkte Orte“, sobald etwas gemerkt ist `js/steckbrief.js:594`.
5. Beim Anmelden übernimmt `show()` die Orte aus dem Tab ins Konto: `Merkliste.mergeSession()` `js/konto-seite.js:46`.

## Begriffe aus dem Quelltext

Spalte „Kurs“: **JS** = Thema der JavaScript-Vorlesung (VL6), **VL3 S.2** = Vorlesung 3, Folie 2. **–** = nicht in den Folien.

### JavaScript

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `localStorage.setItem` / `getItem` / `removeItem` | `js/konto.js:63`, `js/konto.js:78`, `js/konto.js:147` | Speicher des Browsers für Text, je Website getrennt. Bleibt nach dem Schließen des Browsers erhalten. | – |
| `JSON.stringify` | `js/konto.js:63` | Macht aus einem Objekt einen JSON-Text, weil localStorage nur Text speichert. | JS |
| `JSON.parse` | `js/konto.js:55` | Macht aus dem JSON-Text wieder ein Objekt. | JS |
| `try` / `catch` | `js/konto.js:47` | Fängt einen Fehler ab, statt das Skript abbrechen zu lassen, zum Beispiel wenn localStorage gesperrt ist. | – |
| `\|\|` als Ersatzwert | `js/konto.js:55` | Ist links nichts (`null`), gilt der Wert rechts: noch keine Konten = leeres Objekt. | JS |
| Objekt als Verzeichnis | `js/konto.js:135` | Konten stehen unter ihrer E-Mail-Adresse: `accounts["anna@example.de"]`. | JS |
| `delete` | `js/konto.js:128`, `js/konto.js:182` | Entfernt einen Eintrag aus einem Objekt: den verbrauchten Code, ein ganzes Konto. | – |
| regulärer Ausdruck und `test` | `js/konto.js:38`, `js/konto.js:88` | Prüft einen Text gegen ein Muster: Text, `@`, Text, Punkt, Text, ohne Leerzeichen. |
| `Math.random`, `Math.floor` | `js/konto.js:73` | Zufallszahl von 0 bis unter 1; abrunden auf eine ganze Zahl. Ergibt den 6-stelligen Code. | JS | – |
| `trim`, `toLowerCase` | `js/konto.js:68` | Leerzeichen am Rand weg, alles klein. | JS |
| `indexOf`, `push`, `splice` | `js/konto.js:168`, `js/konto.js:170`, `js/konto.js:168` | Position im Array suchen (−1 = nicht da), hinten anhängen, an einer Stelle entfernen. | JS |
| `slice()` | `js/konto.js:152` | Gibt eine Kopie der Liste zurück, damit niemand die gespeicherte Liste aus Versehen ändert. | – |
| `new Date().toISOString()` | `js/konto.js:100` | Datum und Uhrzeit als Text, zum Beispiel `2026-10-10T09:12:00.000Z`. | JS |
| sofort aufgerufene Funktion | `js/konto.js:33` | Hält Variablen privat; nur `window.Konto` ist von außen sichtbar. | – |
| Modul-Objekt | `js/konto.js:187` | Die Funktionen, die andere Skripte nutzen dürfen. | JS |
| `addEventListener("submit")` | `js/konto-seite.js:403` | Reagiert auf das Absenden des Formulars (Ereignis, Event). | JS |
| `preventDefault` | `js/konto-seite.js:346` | Verhindert, dass der Browser das Formular verschickt und die Seite neu lädt. | JS |
| `form.elements` | `js/konto-seite.js:348` | Die Felder eines Formulars über ihr `name`-Attribut. | JS |
| `form.reset()` | `js/konto-seite.js:352` | Leert alle Felder des Formulars. | – |
| `createElement`, `appendChild` | `js/konto-seite.js:32`, `js/konto-seite.js:154` | Baut ein neues Element und hängt es in die Seite. | JS |
| `textContent` | `js/konto-seite.js:37` | Setzt reinen Text; HTML darin wird angezeigt, nicht ausgeführt. | JS |
| `hidden` setzen | `js/konto-seite.js:51` | Blendet ein Element aus oder ein. | – |
| `confirm` | `js/konto-seite.js:415` | Fragt mit „OK“ und „Abbrechen“ nach, bevor das Konto gelöscht wird. | JS |
| Ereignis-Delegation | `js/steckbrief.js:617` | Ein Zuhörer für den ganzen Steckbrief; `closest` findet den Knopf, der geklickt wurde. | – |
| `setAttribute` | `js/steckbrief.js:601` | Setzt ein Attribut, hier den Zustand des Umschaltknopfs. | JS |
| `focus()` | `js/konto-seite.js:341` | Setzt den Cursor in ein Feld, hier ins Feld für den Code. | – |

### HTML und CSS

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Attribut `hidden` | `konto.html:119` | Element ist unsichtbar, bis JavaScript es zeigt. | – |
| `novalidate` | `konto.html:80` | Der Browser zeigt keine eigenen Sprechblasen; die Prüfung macht `konto.js` mit deutschen Texten. | – |
| `type="password"` | `konto.html:87` | Eingabefeld, das Punkte statt Zeichen zeigt. | VL3 S.2 |
| `autocomplete` | `konto.html:87`, `konto.html:107`, `konto.html:132` | Sagt dem Passwort-Manager, ob er ein gespeichertes Passwort einsetzen oder ein neues vorschlagen soll; `one-time-code` heißt: Hier kommt ein Einmal-Code hin. | – |
| `aria-describedby` | `konto.html:107` | Verbindet das Feld mit seinem Hinweistext, Screenreader lesen ihn mit vor. | – |
| `role="alert"` | `konto.html:89` | Screenreader lesen eine neue Fehlermeldung sofort vor. | – |
| `role="status"` | `konto.html:79` | Screenreader lesen die Erfolgsmeldung „E-Mail-Adresse bestätigt“ vor, ohne zu unterbrechen. | – |
| `type="email"` | `konto.html:83`, `konto.html:102` | Feld für eine E-Mail-Adresse; auf dem Handy erscheint eine Tastatur mit `@`. | VL3 S.2 |
| `inputmode="numeric"` | `konto.html:132` | Auf dem Handy erscheint eine Zifferntastatur für den Code. | – |
| Beschreibungsliste `<dl>`, `<dt>`, `<dd>` | `konto.html:148` | Begriff und Wert: „Von“, „An“, „Betreff“ der simulierten E-Mail. | – |
| `<noscript>` | `konto.html:55` | Wird nur gezeigt, wenn JavaScript aus ist. | – |
| `aria-pressed` | `js/steckbrief.js:314` | Macht „Merken“ zu einem Umschaltknopf: gedrückt oder nicht. | – |
| Grid mit Media Query | `css/konto.css:16`, `css/konto.css:24` | Auf dem Handy untereinander, ab 56rem die zwei Formulare nebeneinander. | VL4 S.4 |
| `:empty` | `css/konto.css:41` | Ein leerer Fehlerabsatz nimmt keinen Platz weg. | – |
| Grid mit zwei Spalten `auto 1fr` | `css/konto.css:53` | Kopf der E-Mail: links die Begriffe so breit wie nötig, rechts der Rest. | – |
| `letter-spacing` | `css/konto.css:79` | Abstand zwischen den Ziffern des Codes, damit man ihn gut abliest. | – |
| Umschaltknopf gedrückt | `css/index.css:270` | Gedrückter „Merken“-Knopf: sandfarben und mit Häkchen, nicht nur andere Farbe. | – |
| Stecknadel in der Legende | `css/style.css:1803` | Weißes Quadrat mit drei runden Ecken, um 45 Grad gedreht (`transform: rotate`). | – |

## Fragen, die der Dozent stellen könnte

1. **Wo werden die Konten gespeichert?**
   Im Browser, im localStorage. Das ist ein Speicher, den jede Website für sich hat. JavaScript schreibt mit `setItem` und liest mit `getItem`. Er bleibt nach dem Schließen erhalten, gilt aber nur für diesen Browser auf diesem Rechner. Ein Konto aus Chrome kennt Safari nicht.

2. **Warum `JSON.stringify` und `JSON.parse`?**
   localStorage speichert nur Text. Unsere Konten sind ein Objekt mit Namen, Passwort, Datum und einer Liste von Orten. `JSON.stringify` macht daraus einen Text, `JSON.parse` beim Lesen wieder ein Objekt.

3. **Ist das sicher?**
   Nein, und das ist bewusst so. Das Passwort steht als Klartext im Browser; wer an den Rechner kommt, kann es in den Entwicklertools lesen. Für eine Website, die nur lokal läuft und nur Lieblingsorte speichert, reicht das. Das Formular und die Datenschutzseite sagen deshalb: kein echtes Passwort verwenden.

4. **Was wäre mit PHP anders gewesen?**
   Wir haben die PHP-Fassung gebaut und archiviert (Git-Tag `final-php-2026-10-07`). Dort liegen die Konten auf dem Server in JSON-Dateien, das Passwort nur als Hash (`password_hash`), und eine Session merkt sich, wer angemeldet ist. Vorteil: Konten gelten auf jedem Gerät, und das Passwort ist geschützt. Nachteil: Ohne laufenden Server (XAMPP) funktioniert nichts, ein Doppelklick auf `index.html` reicht nicht. Weil die Seite nur lokal vorgeführt wird, haben wir localStorage gewählt (D-042).

5. **Wird wirklich eine E-Mail verschickt?**
   Nein. Eine E-Mail verschicken kann nur ein Server, und unsere Seite läuft ohne Server per Doppelklick. Alles andere passiert wie bei einer echten Bestätigung: Beim Registrieren entsteht ein zufälliger 6-stelliger Code (`Math.random`), er wird beim Konto gespeichert, das Konto ist bis zur Eingabe des Codes gesperrt, und danach wird der Code gelöscht. Nur statt der E-Mail zeigen wir den Code in einem Postfach auf der Seite, deutlich als Simulation beschriftet. Mit PHP würde der Server den Code mit `mail()` verschicken und ihn nie an den Browser geben.

6. **Ist der Code sicher?**
   Nein. Der Code steht im localStorage und im simulierten Postfach, jeder am Rechner kann ihn lesen. Es geht darum, den Ablauf einer E-Mail-Bestätigung zu zeigen, nicht um Sicherheit (wie beim Passwort).

7. **Warum `textContent` und nicht `innerHTML`?**
   Die Namen der Orte kommen aus Daten. `textContent` setzt sie immer als reinen Text. Stünde in einem Namen HTML, würde es angezeigt, aber nie ausgeführt.

## Profilbild (neu am 14.10.2026, final-v5)

**Profilbild:** Angemeldet steht oben auf „Mein Konto“ der Kasten **Profilbild** `konto.html:172`. Mit **Bild wählen** sucht man ein Foto aus. Es erscheint rund auf der Seite und klein im Menü vor „Konto“, auf jeder Seite. **Bild entfernen** löscht es wieder, „Konto löschen“ auch.

`js/konto.js` (Konto) bleibt unverändert. Die Bilder stehen in einer eigenen Datei und unter einem eigenen Schlüssel: `js/avatar.js`, Schlüssel `quadrate-avatare` `js/avatar.js:20` mit `{ "E-Mail": Bild }`.
1. `<input type="file" accept="image/*">` `konto.html:181` öffnet die Dateiauswahl. Das Feld ist versteckt, sein `<label>` sieht aus wie ein Knopf.
2. `shrink()` `js/avatar.js:61` liest die Datei mit `FileReader` als Daten-Adresse (`readAsDataURL` `js/avatar.js:88`). Dann nimmt es das größte Quadrat aus der Mitte `js/avatar.js:74` und zeichnet es mit `drawImage` auf ein `<canvas>` mit 160 × 160 Pixeln `js/avatar.js:78`. `toDataURL("image/jpeg")` `js/avatar.js:81` macht daraus Text von wenigen KB, der in den localStorage passt.
3. `showInMenu()` `js/avatar.js:95` setzt das kleine Bild in den Link „Konto“. Jede Seite lädt dafür `js/avatar.js`.
4. `js/konto-seite.js` startet das Feld mit `Avatar.setup()` `js/konto-seite.js:61`. Beim Löschen des Kontos entfernt es das Bild `js/konto-seite.js:417`.
5. `object-fit: cover` `css/konto.css:132` füllt den Kreis, ohne das Bild zu verzerren.

**Deine gemeldeten Events** standen kurz ebenfalls auf der Konto-Seite. Seit dem 14.10.2026 (zweite Runde) sind sie dort wieder entfernt: Man findet die eigenen Meldungen auf der Seite Events, mit dem Hinweis „noch nicht geprüft“ und dem Knopf „Meldung löschen“ (siehe [events.md](events.md)). Auf „Event melden“ ist der Reiter **Events** markiert (`aria-current="page"` `event-melden.html:40`), denn das Melden gehört zu den Events, nicht zum Konto.

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `<input type="file">`, `accept` | `konto.html:181` | Dateiauswahl, `accept="image/*"` zeigt nur Bilder an. | VL3 S.2 |
| `FileReader` | `js/avatar.js:88` | Liest eine Datei des Besuchers im Browser, ohne Server. | – |
| `<canvas>` und `drawImage()` | `js/avatar.js:78` | Eine Zeichenfläche: Hier wird das Foto verkleinert und quadratisch zugeschnitten. | – |
| `toDataURL()` | `js/avatar.js:81` | Macht aus dem Bild Text (`data:image/jpeg;base64,…`), der sich speichern lässt. | – |
| `object-fit: cover` | `css/konto.css:132` | Bild füllt den Rahmen und wird an den Rändern abgeschnitten statt verzerrt. | – |

**Großes Profilbild oben (14.10.2026):** Hat man ein Bild gewählt, ersetzt es im blauen Band von „Mein Konto“ die Zeichnung (Person mit Schlüssel). Es erscheint dort groß und rund. `showInBand()` `js/avatar.js:119` schaltet die Zeichnung mit `--band-image: none` ab und hängt ein `<img class="band-avatar">` in das Band. `showPicture()` ruft sie bei jeder Änderung auf `js/avatar.js:154`. Aussehen: `.band-avatar` `css/konto.css:177`, weißer Rand und Schatten, auf dem Handy kleiner oben rechts.

## Überblick, Verlauf und Vorlieben (neu am 14.10.2026, final-v5)

**Was man sieht:** Angemeldet stehen auf der Konto-Seite vier neue Bereiche. Seit dem 14.10.2026 (zweite Runde) stehen **Deine Vorlieben** direkt unter dem Profilbild, danach Überblick und Verlauf:
- **Dein Überblick** `konto.html:222`: vier Kästen (Orte gemerkt, Events gemerkt, Quadrate zuletzt angesehen, dein Lieblingsquadrat mit Link zur Karte), darunter ein Balken je Kategorie in ihrer Farbe. Die Kästen „Orte gemerkt“ und „Events gemerkt“ haben den Link „zur Merkliste“ (`listTile()` `js/konto-seite.js:108`).
- **Zuletzt angesehen** `konto.html:229`: die Quadrate, die man auf der Karte geöffnet hat, mit Uhrzeit („heute, 14:05“) und Link zurück zur Karte.
- **Verlauf deiner Merkliste:** eine Zeitleiste mit „gemerkt“ (grüner Punkt) und „entfernt“ (grauer Ring) für Orte und Events. Seit der zweiten Runde am 14.10.2026 zeigt sie zuerst nur die letzten 5 Änderungen; „Alle anzeigen“ klappt sie auf, „Verlauf leeren“ löscht sie nach einer Rückfrage `konto.html:239`.
- **Deine Vorlieben** `konto.html:192`: Lieblingskategorie (Knöpfe wie auf der Karte) und „Was dir wichtig ist“ (vegan, vegetarisch, rollstuhlgerecht, draußen sitzen, WLAN) `konto.html:208`. Die Karte und die Ortssuche starten dann mit dieser Kategorie. Orte mit dem gewählten Merkmal stehen im Steckbrief und in der Ortssuche **oben**, und das Merkmal hat einen Stern (★).

**So führst du es vor:** Anmelden, auf der Karte drei Quadrate öffnen und zwei Orte merken, dann einen davon wieder entfernen. Auf der Konto-Seite stehen jetzt Überblick und Verlauf. Bei „Deine Vorlieben“ Trinken und „vegan“ wählen, dann auf „Karte“ und „Orte“ wechseln.

**Wie es gebaut ist:** `js/konto.js` bleibt unverändert. Alles Neue steht in `js/verlauf.js`, unter zwei eigenen Schlüsseln im localStorage (`quadrate-verlauf` `js/verlauf.js:23`, `quadrate-vorlieben` `js/verlauf.js:24`), je Konto unter der E-Mail-Adresse. Ohne Konto wird nichts aufgezeichnet.
1. **Aufzeichnen:**
   - Öffnet man auf der Karte ein Quadrat, ruft `js/app.js` `Verlauf.seen()` auf `js/app.js:130`. `seen()` `js/verlauf.js:73` setzt das Quadrat vorne in die Liste, nimmt ein doppeltes heraus und behält die letzten 12.
   - Beim Merken oder Entfernen ruft `js/merkliste.js` `Verlauf.saved()` auf `js/merkliste.js:113`. `saved()` `js/verlauf.js:89` hängt die Änderung mit `unshift()` vorne an `js/verlauf.js:94` (die neueste zuerst) und behält die letzten 30.
   - Die Zeit wird als `Date.now()` gespeichert, also als Millisekunden seit 1970. `whenText()` `js/verlauf.js:183` macht daraus „heute“, „gestern“ oder ein Datum. Dafür vergleicht es die Tage mit `toDateString()` `js/verlauf.js:189`.
2. **Überblick:** `showOverview()` `js/konto-seite.js:120` zählt die gemerkten Orte je Kategorie und je Quadrat. Das Quadrat mit den meisten Orten ist das Lieblingsquadrat `js/konto-seite.js:135`. Die Balken sind so breit wie ihr Anteil an der größten Zahl `js/konto-seite.js:170` und bekommen die Farbe der Kategorie über `--cat-3` `css/konto.css:268`.
3. **Verlauf:** `showHistory()` `js/konto-seite.js:180` baut beide Listen. `nameOf()` `js/konto-seite.js:87` sucht zu jeder Kennung den Ort oder das Event. Die Punkte der Zeitleiste sind ein `::before` `css/konto.css:347`.
   - **Einklappen und Leeren (zweite Runde 14.10.2026):** `SHORT_HISTORY` = 5 `js/konto-seite.js:27` und `historyOpen` sagen, wie viele Zeilen gezeigt werden `js/konto-seite.js:209`. `setupHistoryButtons()` `js/konto-seite.js:226` schaltet „Alle anzeigen (7)“ und „Weniger anzeigen“ um und setzt `aria-expanded`, damit Screenreader hören, ob die Liste offen ist. „Verlauf leeren“ fragt mit `confirm()` nach und ruft `Verlauf.clearSaved()` `js/verlauf.js:100`. Die gemerkten Orte und Events selbst bleiben.
4. **Vorlieben:** `setupPreferences()` `js/konto-seite.js:300` speichert jede Änderung sofort (Ereignis `change`). Der Zuhörer wird nur einmal angehängt (`dataset.ready` `js/konto-seite.js:312`), denn `show()` läuft nach jeder Änderung auf der Seite neu.
   - `js/filter.js` startet die Karte mit der Lieblingskategorie `js/filter.js:411` und schaltet dann nachts nicht von selbst auf Trinken um `js/filter.js:417`.
   - `js/ortssuche.js` setzt die Kategorie `js/ortssuche.js:403`. Weil `js/verlauf.js` auf dieser Seite erst nach der Ortssuche geladen wird, wartet sie auf das Ereignis `DOMContentLoaded` `js/ortssuche.js:396`, das nach allen Skripten kommt.
5. **Konto löschen** löscht auch Verlauf und Vorlieben (`Verlauf.forget()`).

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `Date.now()` | `js/verlauf.js:94` | Der aktuelle Zeitpunkt als Zahl (Millisekunden seit 1970), leicht zu speichern und zu vergleichen. | JS |
| `unshift()` / `slice()` | `js/verlauf.js:94` | Vorne an eine Liste anhängen, dann nur die ersten 30 behalten. | JS |
| Ereignis `DOMContentLoaded` | `js/ortssuche.js:396` | Feuert, wenn die ganze Seite und alle Skripte am Ende geladen sind. | – |
| `dataset` | `js/konto-seite.js:312` | Eigene Daten an einem Element (`data-ready`), hier als Merker „schon eingerichtet“. | – |
| Grid mit `auto-fill` | `css/konto.css:213` | So viele Kästen nebeneinander, wie hineinpassen, jeder mindestens 9rem breit. | – |
| `aria-expanded` | `konto.html:240` | Sagt Screenreadern, ob die Liste, die der Knopf steuert (`aria-controls`), gerade aufgeklappt ist. | – |
| `confirm()` | `js/konto-seite.js:243` | Fragt mit „OK“ und „Abbrechen“ nach, bevor der Verlauf gelöscht wird. | JS |

**Was dir wichtig ist, genauer (14.10.2026):** Das Merkmal wird nicht als Suchwort eingetragen, es sortiert. `Merkmale.matchesWish()` `js/merkmale.js:131` prüft, ob ein Ort das Merkmal hat („vegan“ zählt auch „rein vegan“). Der Steckbrief `js/steckbrief.js:155` und die Ortssuche `js/ortssuche.js:259` stellen solche Orte an den Anfang, und das Merkmal bekommt die Klasse `place__tag--wish` mit Stern `css/style.css:2132`.

## Tagespläne und Aufräumen der Konto-Seite (neu am 14.10.2026, final-v5)

- **Deine Tagespläne** `konto.html:247`: Pläne, die man auf der Merkliste mit „Im Konto speichern“ abgelegt hat. Jeder zeigt Titel und Zeitpunkt, „Plan anzeigen“ klappt seinen Text auf (`<details>`), dazu „In der Merkliste öffnen“ und „Löschen“. `showPlans()` `js/konto-seite.js:256` baut die Liste. Der Link setzt die Kennung in die Adresse `js/konto-seite.js:275`. Gespeichert wird in `js/verlauf.js` unter `quadrate-tagesplaene` `js/verlauf.js:27` (`plans()` `js/verlauf.js:130`, `savePlan()` `js/verlauf.js:140`), höchstens 10 Pläne.
- **Abmelden** und **Konto löschen** stehen jetzt ganz unten auf der Seite `konto.html:257`. Sie sind nur sichtbar, wenn jemand angemeldet ist `js/konto-seite.js:81`.
- **Zweite Runde am 14.10.2026:** „Deine Vorlieben“ steht direkt unter dem Profilbild `konto.html:192`, weil man dort einstellt, womit Karte und Ortssuche starten. Die Liste „Deine gemerkten Orte“ ist entfernt: Sie zeigte dasselbe wie die Merkliste. „Deine gemeldeten Events“ ist ebenfalls entfernt (siehe oben unter „Profilbild“). Die Überschrift im Band heißt jetzt **Mein Konto** `konto.html:165`.
