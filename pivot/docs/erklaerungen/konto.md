# Konto und PHP: Anmelden, Registrieren, Meine Orte

Erklärung für die Präsentation. Zeilennummern erzeugt am 2026-09-29 11:54 aus den aktuellen Dateien; sie gelten in beiden Varianten (`web/variante-svg` und `web/variante-css3d`), denn alle PHP-Dateien sind dort gleich. Alles auf dieser Seite gehört zur Version **V3**.

**Vorschlag für die Präsentation:** Anes Sahbegovic (Programmierung), dazu der PHP-Teil von [vorschlagen.md](vorschlagen.md). Die ganze Aufteilung für alle fünf steht in [README.md](README.md) unter „Vorschlag: wer präsentiert was“.

## Was die Seiten zeigen und warum

| Seite | Was sie tut |
|---|---|
| `registrieren.php` | Konto anlegen mit Benutzername und Passwort (keine E-Mail nötig); danach ist man sofort angemeldet. |
| `login.php` | Anmelden. Nach dem Abmelden oder wenn „Meine Orte“ eine Anmeldung braucht, steht oben ein kurzer Hinweis. |
| `meine-orte.php` | Alle gemerkten Orte, nach Quadrat geordnet, mit „Auf der Karte zeigen“ und „Entfernen“. Nur für Angemeldete. |
| `logout.php` | Fragt „Möchtest du dich abmelden?“ und meldet erst nach dem Klick auf den Knopf ab. |
| Karte (`index.html`) | Für Angemeldete steht im Steckbrief bei jedem Ort ein Knopf „Merken“; Quadrate mit gemerkten Orten bekommen auf der Karte eine Stecknadel. |

Warum so: PHP ist das Thema der Vorlesung 7. Die Seiten zeigen die typischen Aufgaben eines Servers: Formulare mit POST annehmen und auf dem Server prüfen, Passwörter sicher speichern, sich über eine **Session** merken, wer angemeldet ist, und Daten dauerhaft ablegen. Statt einer Datenbank nutzen wir JSON-Dateien im Ordner `daten/` (Entscheidung D-003): Das reicht für ein Studienprojekt und läuft ohne Einrichtung in XAMPP.

PHP läuft nur auf einem Server. Per Doppelklick (`file://`) zeigt der Browser PHP-Dateien nicht an, und die Karte blendet „Merken“ dann aus. Für die Vorführung: XAMPP starten, den Variantenordner nach `htdocs` kopieren (zum Beispiel als `htdocs/quadrate`), unter macOS einmal `chmod 777 daten` im Ordner der Website (siehe `daten/LIESMICH.txt`), dann `http://localhost/quadrate/index.html` öffnen.

## So führst du es vor

1. Oben rechts auf **Anmelden**, dann **Jetzt registrieren**: Benutzername `anna`, Passwort mit mindestens 8 Zeichen, zweimal. Es folgt „Meine Orte“ mit „Willkommen!“ und dem leeren Zustand.
2. Zur Karte, ein Quadrat wählen, im Steckbrief bei einem Ort **Merken**: Der Knopf bekommt ein Häkchen, auf der Karte erscheint eine Stecknadel.
3. **Meine Orte** öffnen: Der Ort steht unter seinem Quadrat; **Entfernen** löscht ihn wieder.
4. **Abmelden** und bestätigen: Die Anmeldeseite sagt „Abgemeldet“.
5. Zum Zeigen der Sicherheit: `daten/benutzer.json` öffnen. Dort steht nur ein Hash, der mit `$2y$` beginnt, nie das Passwort. Im Browser `http://localhost/quadrate/daten/LIESMICH.txt` aufrufen: „403 Forbidden“, der Ordner ist gesperrt.

## Aufbau des Quelltexts

### Beteiligte Dateien

| Datei | Aufgabe |
|---|---|
| `registrieren.php`, `login.php`, `logout.php`, `meine-orte.php` | die vier Seiten; jede prüft zuerst, dann gibt sie HTML aus |
| `php/lib.php` | gemeinsame Funktionen: Session, Ausgabe (`h()`), Weiterleitung, Prüfregeln, CSRF-Schutz, JSON-Speicher mit Sperre, Orte lesen, Merkliste |
| `php/kopf.php`, `php/fuss.php` | Seitenrahmen: `pageHeader()` gibt Kopf und Navigation aus, `pageFooter()` die Fußzeile |
| `php/merken.php` | Schnittstelle für die Karte: antwortet mit JSON statt HTML |
| `js/merkliste.js` | spricht auf der Karte mit `php/merken.php` (`fetch`) |
| `js/steckbrief.js` (Teile mit `[V3]`) | Knöpfe „Merken“, Stecknadeln über `Karte.markieren()` |
| `css/konto.css` | Aussehen der vier Seiten |
| `daten/` | `benutzer.json`, `merkliste.json`, `vorschlaege.json` entstehen hier; `.htaccess` sperrt den Ordner, `.gitignore` hält die Daten aus Git heraus |

### Aufbau einer PHP-Seite am Beispiel `login.php`

1. `require_once` bindet `php/lib.php`, `php/kopf.php` und `php/fuss.php` ein `login.php:19`.
2. `startSession()` `login.php:23` startet die Session. Das muss vor jeder Ausgabe passieren, weil dabei ein Cookie gesendet wird.
3. Wer schon angemeldet ist, wird weitergeleitet `login.php:26`.
4. Kam das Formular per POST `login.php:34`: Felder lesen, CSRF-Token prüfen `login.php:38`, leere Felder melden, dann `loginUser()` `login.php:49`. Bei Erfolg Weiterleitung zu „Meine Orte“, sonst eine Sekunde Pause `login.php:52` und eine Meldung mit Status 400.
5. Erst jetzt beginnt die Ausgabe: `pageHeader()` `login.php:63` schreibt `<head>`, Kopf und Navigation; danach folgt HTML mit eingestreutem PHP, zum Beispiel `login.php:100`; am Ende `pageFooter()` `login.php:140`.

Die anderen Seiten folgen demselben Muster: oben die Arbeit (prüfen, speichern, weiterleiten), unten die Ausgabe.

### Registrieren

`registrieren.php` prüft den Namen mit `usernameError()` `registrieren.php:43` (3 bis 30 Zeichen: a–z, 0–9, `_`, `-`) und das Passwort mit `passwordError()` `registrieren.php:48` (mindestens 8 Zeichen, höchstens 72 Bytes), dann ob beide Passwörter gleich sind `registrieren.php:51`. `createUser()` `php/lib.php:457` sperrt den Speicher, liest `benutzer.json`, meldet einen vergebenen Namen `php/lib.php:471` und speichert sonst den Namen mit `password_hash()` `php/lib.php:477` und dem Datum. Danach ist der neue Nutzer angemeldet `registrieren.php:60`.

Gespeichert wird so: `{ "anna": { "hash": "$2y$10$...", "angelegt": "2026-10-13 10:15" } }` `php/lib.php:450`.

### Anmelden und die Session

- `loginUser()` `php/lib.php:493` liest die Konten und vergleicht mit `password_verify()` `php/lib.php:500`. Das Passwort wird nie entschlüsselt: PHP berechnet den Hash der Eingabe mit demselben Salz und vergleicht.
- `setLoggedInUser()` `php/lib.php:127` gibt der Session eine neue Kennung `php/lib.php:130` und merkt sich den Namen in `$_SESSION['user']` `php/lib.php:131`.
- `startSession()` `php/lib.php:86` stellt das Cookie sicher ein `php/lib.php:99`: Es gilt nur bis zum Schließen des Browsers, nur für den Ordner der Website, JavaScript kann es nicht lesen (`httponly`), und fremde Websites können es nicht mit ihren Formularen mitschicken (`samesite`).
- `currentUser()` `php/lib.php:112` liefert den Namen oder `null`. `requireLogin()` `php/lib.php:161` schickt Nicht-Angemeldete zur Anmeldung.
- `logout()` `php/lib.php:138` leert die Session, löscht das Cookie und beendet die Session.
- Ganz unten in `lib.php` wird eine Session nur fortgesetzt, wenn der Browser schon unser Cookie schickt `php/lib.php:729`. Ein neues Cookie entsteht erst, wenn eine Seite die Session selbst startet, zum Beispiel die Anmeldeseite für ihr CSRF-Token. Wer nur die Karte ansieht, bekommt kein Cookie.

### Schutz gegen gefälschte Anfragen (CSRF)

Eine fremde Website könnte den Browser eines angemeldeten Nutzers dazu bringen, eines unserer Formulare abzuschicken. Deshalb trägt jedes Formular ein geheimes Token aus der Session: `csrfToken()` `php/lib.php:518` erzeugt 64 Zufallszeichen, `csrfField()` `php/lib.php:530` schreibt sie als verstecktes Feld ins Formular, zum Beispiel `login.php:94`, und `isCsrfValid()` `php/lib.php:539` vergleicht das gesendete Token mit dem der Session. Ohne passendes Token antwortet die Seite mit Status 403.

### Speichern ohne Datenbank

- Alle Daten liegen als JSON in `daten/` `php/lib.php:36`.
- Damit nie zwei Anfragen gleichzeitig schreiben, sperrt `lockData()` `php/lib.php:302` eine Hilfsdatei mit `flock()` `php/lib.php:310`. Alle anderen warten, bis die Sperre frei ist.
- `readJson()` `php/lib.php:333` liefert `[]` für „noch nichts gespeichert“, aber `null` für eine kaputte Datei. Dann wird nie geschrieben, damit keine Konten verloren gehen.
- `writeJson()` `php/lib.php:361` schreibt zuerst in eine `.tmp`-Datei und ersetzt dann die alte Datei in einem Schritt mit `rename()` `php/lib.php:377`. So ist eine Datei nie halb geschrieben.
- `daten/.htaccess` verbietet dem Webserver, die Dateien auszuliefern `daten/.htaccess:8`; `daten/.gitignore` hält sie aus Git heraus `daten/.gitignore:6`.

### Meine Orte

`meine-orte.php` holt den Namen mit `requireLogin()` `meine-orte.php:26`. Ein POST mit `aktion=entfernen` `meine-orte.php:55` entfernt einen Ort `meine-orte.php:56` und lädt die Seite neu. Dann liest die Seite die gemerkten Kennungen `meine-orte.php:73`, sucht Name und Quadrat in `js/data/orte.js` (PHP liest die JavaScript-Datei mit `readJsData()` `php/lib.php:562`), gruppiert nach Quadrat `meine-orte.php:80` und sortiert `meine-orte.php:86`. Jede Gruppe verlinkt auf `index.html#G1` `meine-orte.php:150`, jeder Ort hat ein kleines Formular zum Entfernen `meine-orte.php:173`.

### „Merken“ auf der Karte: JavaScript spricht mit PHP

1. `js/steckbrief.js` fragt beim Start `js/steckbrief.js:497`, ob Speichern möglich ist. `Merkliste.isAvailable()` ist nur über `http:` oder `https:` wahr `js/merkliste.js:36`.
2. `Merkliste.status()` schickt eine GET-Anfrage an `php/merken.php` `js/merkliste.js:88`. Die Antwort ist JSON: `{ "angemeldet": true, "name": "anna", "orte": [...], "token": "..." }` `php/merken.php:46`.
3. Für Angemeldete zeigt der Steckbrief bei jedem Ort den Knopf „Merken“ `js/steckbrief.js:248`; `aria-pressed` sagt, ob er gedrückt ist.
4. Ein Klick ruft `toggleSaved()` `js/steckbrief.js:474` auf, das `Merkliste.save(id)` oder `Merkliste.remove(id)` wählt. `merkliste.js` schickt eine POST-Anfrage mit JSON-Inhalt `js/merkliste.js:73`: Aktion, Kennung des Ortes und Token.
5. `php/merken.php` liest den JSON-Inhalt `php/merken.php:84`, prüft Anmeldung (401), Token (403) `php/merken.php:89` und Kennung (400) `php/merken.php:99`, speichert und antwortet mit der neuen Liste `php/merken.php:112`.
6. Der Steckbrief nimmt die neue Liste und setzt die Stecknadeln `js/steckbrief.js:456`.

### Der Seitenrahmen: `php/kopf.php` und `php/fuss.php`

`pageHeader()` `php/kopf.php:46` gibt dasselbe Gerüst aus wie die HTML-Seiten. Nur der Konto-Link hängt von der Session ab `php/kopf.php:81`: angemeldet „Meine Orte“ und „Abmelden“, sonst „Anmelden“. `navLink()` `php/kopf.php:30` setzt `aria-current="page"` beim Link der aktuellen Seite. `pageFooter()` `php/fuss.php:16` schließt `<main>` und gibt die Fußzeile aus.

## Begriffe aus dem Quelltext

Spalte „Kurs“: **PHP** = Thema der PHP-Vorlesung (VL7), **JS** = Thema der JavaScript-Vorlesung (VL6), **VL3 S.2** = Vorlesung 3, Folie 2. **–** = nicht in den Folien.

### PHP

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `<?php` … `?>` | `login.php:1`, `login.php:64` | Zwischen diesen Marken steht PHP-Code; der Server führt ihn aus und schickt nur das Ergebnis an den Browser. | PHP |
| `require_once` | `login.php:19` | Bindet eine andere PHP-Datei ein, auch wenn es mehrfach verlangt wird nur einmal. | PHP |
| Variable `$name` | `login.php:30` | PHP-Variablen beginnen mit `$`. | PHP |
| `const` | `php/lib.php:40` | Fester Wert mit Namen, zum Beispiel die Mindestlänge des Passworts. | PHP |
| Funktion mit Typangaben | `php/lib.php:112` | `?string` heißt: Die Funktion gibt einen Text oder `null` zurück. | PHP |
| `$_SERVER['REQUEST_METHOD']` | `php/lib.php:214` | Sagt, ob die Seite normal aufgerufen (GET) oder ein Formular gesendet wurde (POST). | PHP |
| `$_POST` | `php/lib.php:202` | Die Felder des gesendeten Formulars, nach ihrem `name`. | PHP |
| `$_GET` | `login.php:61` | Werte aus der Adresse, hier `login.php?hinweis=abgemeldet`. | PHP |
| `??` (Null-Koaleszenz) | `php/lib.php:115` | Nimmt den Wert rechts, wenn links nichts steht: kein Fehler bei fehlenden Feldern. | PHP |
| Session starten | `php/lib.php:106` | Startet oder setzt die Sitzung fort; der Browser bekommt ein Cookie mit einer zufälligen Kennung. | PHP |
| `session_set_cookie_params` | `php/lib.php:99` | Einstellungen des Sitzungs-Cookies: Lebensdauer, Pfad, `httponly`, `samesite`. | PHP |
| `httponly` | `php/lib.php:103` | JavaScript kann das Cookie nicht lesen; ein eingeschleustes Skript kommt nicht an die Sitzung. | – |
| `samesite` | `php/lib.php:104` | Der Browser schickt das Cookie nicht mit, wenn eine fremde Website ein Formular an uns sendet. | – |
| `$_SESSION` | `php/lib.php:131` | Daten der Sitzung auf dem Server; hier steht, wer angemeldet ist. | PHP |
| `session_regenerate_id` | `php/lib.php:130` | Neue Sitzungskennung beim Anmelden; eine vorher untergeschobene Kennung wird wertlos. | – |
| `session_destroy` und `setcookie` | `php/lib.php:154`, `php/lib.php:145` | Beendet die Sitzung auf dem Server und löscht das Cookie, indem es ein Ablaufdatum in der Vergangenheit bekommt. | PHP |
| `password_hash` | `php/lib.php:477` | Berechnet aus dem Passwort einen gesalzenen Hash (bcrypt); das Passwort selbst wird nie gespeichert. | PHP |
| `password_verify` | `php/lib.php:500` | Prüft, ob ein eingegebenes Passwort zum gespeicherten Hash passt. | PHP |
| `strlen` und `mb_strlen` | `php/lib.php:438`, `php/lib.php:441` | `mb_strlen` zählt Zeichen („ä“ = 1), `strlen` Bytes („ä“ = 2); bcrypt nutzt nur die ersten 72 Bytes. | PHP |
| `preg_match` | `php/lib.php:420` | Prüft einen Text gegen ein Muster (regulärer Ausdruck): 3 bis 30 erlaubte Zeichen. | PHP |
| `strtolower(trim())` | `php/lib.php:410` | Entfernt Leerzeichen am Rand und macht Kleinbuchstaben: „Anna “ und „anna“ sind dasselbe Konto. | PHP |
| `random_bytes`, `bin2hex` | `php/lib.php:522` | Erzeugt 32 sichere Zufallsbytes und schreibt sie als 64 Hex-Zeichen: das CSRF-Token. | – |
| `hash_equals` | `php/lib.php:544` | Vergleicht zwei geheime Texte immer gleich schnell, damit die Antwortzeit nichts verrät. | – |
| `htmlspecialchars` in `h()` | `php/lib.php:180` | Macht `<`, `>`, `&` und Anführungszeichen harmlos, bevor ein Wert ins HTML kommt (Schutz vor XSS). | PHP |
| Kurzausgabe `<?= ?>` | `meine-orte.php:98` | Schreibt einen Wert ins HTML; kurz für `<?php echo ...; ?>`. | PHP |
| `header('Location')` und `exit` | `php/lib.php:192`, `php/lib.php:193` | Schickt den Browser auf eine andere Seite (Status 303) und beendet das Skript sofort. | PHP |
| `http_response_code` | `registrieren.php:69` | Setzt den HTTP-Status: 400 falsche Eingabe, 403 Token falsch, 409 Name vergeben, 500 Speichern fehlgeschlagen. | PHP |
| `sleep(1)` | `login.php:52` | Wartet nach einem falschen Passwort eine Sekunde; das bremst Programme, die Passwörter durchprobieren. | – |
| `if ... :` / `endif;` | `login.php:74` | Andere Schreibweise für `if`, gut lesbar zwischen HTML-Blöcken. | PHP |
| `foreach ... as $key => $value` | `meine-orte.php:135` | Schleife über ein Array mit Schlüssel (Code des Quadrats) und Wert (Liste der Orte). | PHP |
| assoziatives Array | `php/lib.php:44` | Array mit Namen als Schlüssel: `'essen' => 'Essen'`. | PHP |
| Array erweitern `[] =` | `meine-orte.php:80` | Hängt einen Ort an die Liste seines Quadrats an; die Liste entsteht beim ersten Mal von selbst. | PHP |
| `isset`, `unset` | `php/lib.php:471`, `php/lib.php:690` | Prüft, ob ein Eintrag existiert, bzw. löscht ihn. | PHP |
| `in_array`, `array_diff`, `array_values` | `php/lib.php:679`, `php/lib.php:683`, `php/lib.php:687` | Ist der Ort schon in der Liste? Liste ohne diesen Ort; Liste neu durchnummerieren. | PHP |
| `usort`, `uksort` | `meine-orte.php:88`, `meine-orte.php:86` | Sortieren mit eigener Vergleichsfunktion nach Werten bzw. nach Schlüsseln; `strnatcmp` sortiert L2 vor L10. | PHP |
| `static` in einer Funktion | `php/lib.php:601` | Die Variable behält ihren Wert zwischen zwei Aufrufen; die Orte werden nur einmal je Anfrage gelesen. | – |
| `json_decode` / `json_encode` | `php/lib.php:347`, `php/lib.php:366` | Wandelt JSON-Text in ein PHP-Array um und zurück. | PHP |
| `file_get_contents`, `file_put_contents` | `php/lib.php:339`, `php/lib.php:372` | Liest bzw. schreibt eine ganze Datei auf einmal. | PHP |
| `fopen` und `flock` | `php/lib.php:305`, `php/lib.php:310` | Öffnet die Sperrdatei und sperrt sie: exklusiv zum Schreiben, geteilt zum Lesen. | – |
| `@` vor einem Aufruf | `php/lib.php:305` | Unterdrückt die Warnung von PHP, weil wir den Fehler selbst behandeln. | – |
| `error_log` | `php/lib.php:307` | Schreibt den genauen Grund eines Fehlers in das Fehlerprotokoll von Apache, nicht auf die Seite. | – |
| `rename` | `php/lib.php:377` | Ersetzt die alte Datei in einem Schritt durch die neue. | – |
| Funktion mit Standardwerten | `php/kopf.php:46` | Parameter mit `=` dürfen beim Aufruf fehlen und bekommen dann diesen Wert. | PHP |
| HTML in einer Funktion | `php/kopf.php:56` | Mit `?>` endet PHP mitten in der Funktion; das HTML danach wird ausgegeben, wenn die Funktion läuft. | PHP |
| JSON-Antwort mit Header | `php/merken.php:56` | Sagt dem Browser, dass die Antwort JSON ist und kein HTML. | PHP |
| `php://input` | `php/merken.php:84` | Der rohe Inhalt der Anfrage; `merkliste.js` schickt JSON statt Formularfeldern. | – |
| `echo json_encode` | `php/merken.php:38` | Gibt die Antwort als JSON-Text aus. | PHP |

### HTML in den PHP-Seiten

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `<form method="post" action>` | `login.php:93` | Das Formular schickt sich an dieselbe Seite; PHP erkennt den POST und prüft ihn. | VL3 S.2 |
| verstecktes Feld | `meine-orte.php:173` | Ein Feld, das man nicht sieht, das aber mitgeschickt wird: welche Aktion und welcher Ort. | VL3 S.2 |
| `type="password"` | `login.php:106` | Eingabefeld, das Punkte statt Zeichen zeigt. | VL3 S.2 |
| `autocomplete="current-password"` / `"new-password"` | `login.php:107`, `registrieren.php:117` | Sagt dem Passwort-Manager, ob er ein gespeichertes Passwort einsetzen oder ein neues vorschlagen soll. | – |
| `pattern` wie auf dem Server | `registrieren.php:107` | Dieselbe Regel wie `usernameError()`: Der Browser prüft vorab, der Server prüft sicher. | – |
| `aria-invalid`, `autofocus` vom Server | `php/lib.php:252` | Bei einem Fehler markiert PHP das Feld als ungültig und setzt den Cursor ins erste falsche Feld. | – |
| `<meta name="robots" content="noindex">` | `php/kopf.php:58` | Suchmaschinen sollen Konto- und Antwortseiten nicht aufnehmen. | – |
| Inline-SVG | `login.php:132` | Ein kleines Schloss-Symbol direkt im HTML, gezeichnet aus einem Rechteck und einem Bogen. | – |

### JavaScript (`js/merkliste.js` und `js/steckbrief.js`)

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| `fetch` | `js/merkliste.js:88` | Schickt eine Anfrage an den Server, ohne die Seite neu zu laden. | JS |
| Optionen einer Anfrage | `js/merkliste.js:66` | Methode, Header, Inhalt; `same-origin` schickt das Sitzungs-Cookie mit. | JS |
| `JSON.stringify` | `js/merkliste.js:73` | Macht aus einem JavaScript-Objekt einen JSON-Text zum Senden. | JS |
| `response.json()` | `js/merkliste.js:90` | Liest die Antwort des Servers als JSON und macht daraus ein Objekt. | JS |
| Promise und `.then` | `js/merkliste.js:45`, `js/steckbrief.js:484` | Ein Versprechen auf ein späteres Ergebnis; `.then` sagt, was danach passieren soll. | JS |
| Warteschlange | `js/merkliste.js:51` | Anfragen laufen nacheinander, damit Antworten nie in falscher Reihenfolge ankommen. | JS |
| `AbortController` und `setTimeout` | `js/merkliste.js:79` | Bricht eine Anfrage nach 8 Sekunden ohne Antwort ab. | JS |
| `typeof` und `Array.isArray` | `js/merkliste.js:108` | Prüft, ob die Antwort die erwartete Form hat. | JS |
| Statuscode auswerten | `js/merkliste.js:173` | 401 heißt „nicht angemeldet“: Die Sitzung ist abgelaufen, die Änderung ist nicht passiert. | JS |
| `aria-pressed` | `js/steckbrief.js:254` | Macht „Merken“ zu einem Umschaltknopf: gedrückt oder nicht. | – |
| `aria-disabled` | `js/steckbrief.js:483` | Sperrt den Knopf, solange die Anfrage läuft, ohne dass er den Tastaturfokus verliert. | – |
| Modul-Objekt | `js/merkliste.js:238` | Nur diese fünf Funktionen sind von außen sichtbar. | JS |

### CSS (`css/konto.css`) und Server-Einstellungen

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Grid mit Media Query | `css/konto.css:18`, `css/konto.css:26` | Auf dem Handy untereinander, ab 56rem Formular links (höchstens 30rem) und Infospalte rechts. | VL4 S.4 |
| zwei Spalten für Gruppen | `css/konto.css:137` | Ab 64rem stehen die Quadrate von „Meine Orte“ in zwei Spalten. | – |
| `flex-direction` wechseln | `css/konto.css:222`, `css/konto.css:229` | Leerer Zustand: Kachel über dem Text, ab 30rem daneben. | – |
| `fill: currentColor` | `css/konto.css:103` | Die kleinen SVG-Symbole nehmen die Textfarbe an. | – |
| `:last-child` | `css/konto.css:186` | Der letzte Ort einer Gruppe braucht keine Linie darunter. | – |
| Umschaltknopf gedrückt | `css/index.css:242` | Gedrückter „Merken“-Knopf: sandfarben und mit Häkchen, nicht nur andere Farbe. | – |
| Stecknadel in der Legende | `css/style.css:1887` | Weißes Quadrat mit drei runden Ecken, um 45 Grad gedreht (`transform: rotate`). | – |
| `.htaccess` | `daten/.htaccess:8` | Einstellung für Apache: Jede Anfrage an diesen Ordner wird mit 403 abgelehnt. | – |
| `.gitignore` | `daten/.gitignore:6` | Git ignoriert alle JSON-Dateien hier: Konten kommen nie ins Repository. | – |

## Fragen, die der Dozent stellen könnte

1. **Wie speichert ihr die Passwörter?**
   Gar nicht im Klartext. `password_hash()` berechnet beim Registrieren einen Hash mit zufälligem Salz (Verfahren bcrypt); nur dieser steht in `daten/benutzer.json`. Beim Anmelden prüft `password_verify()`, ob die Eingabe zum Hash passt. Selbst wer die Datei liest, kennt die Passwörter nicht, und zwei gleiche Passwörter ergeben verschiedene Hashes.

2. **Was ist eine Session, und woher weiß der Server, dass ich angemeldet bin?**
   Beim Anmelden legt PHP auf dem Server eine Sitzung an und schickt dem Browser ein Cookie mit einer zufälligen Kennung (`quadrate_sitzung`). Bei jeder weiteren Anfrage schickt der Browser das Cookie mit, PHP findet die Sitzung und liest `$_SESSION['user']`. Das Cookie gilt nur bis zum Schließen des Browsers, JavaScript kann es nicht lesen (`httponly`), und beim Anmelden bekommt die Sitzung eine neue Kennung.

3. **Was ist CSRF, und wie schützt ihr euch dagegen?**
   Cross-Site Request Forgery: Eine fremde Seite bringt den Browser eines angemeldeten Nutzers dazu, eines unserer Formulare abzuschicken, zum Beispiel „Ort entfernen“. Jedes unserer Formulare enthält deshalb ein verstecktes Feld mit einem geheimen Zufallswert aus der Session. PHP nimmt eine Anfrage nur an, wenn der Wert stimmt; eine fremde Seite kennt ihn nicht. Zusätzlich schickt der Browser das Cookie wegen `samesite=Lax` nicht mit fremden Formularen mit.

4. **Warum keine Datenbank, und was passiert, wenn zwei gleichzeitig speichern?**
   Für ein paar Konten und Listen reichen JSON-Dateien, und sie laufen ohne Einrichtung in XAMPP (Entscheidung D-003). Damit zwei Anfragen sich nicht gegenseitig überschreiben, sperrt `flock()` während „lesen, ändern, schreiben“ eine Hilfsdatei; die andere Anfrage wartet. Geschrieben wird zuerst in eine `.tmp`-Datei, die dann in einem Schritt die alte ersetzt. Eine kaputte Datei wird nie überschrieben. Der Ordner `daten/` ist per `.htaccess` für Browser gesperrt.

5. **Wie kommt ein Klick auf „Merken“ auf den Server, ohne dass die Seite neu lädt?**
   `js/merkliste.js` schickt mit `fetch()` eine POST-Anfrage an `php/merken.php`. Der Inhalt ist JSON: `{ "aktion": "merken", "id": "n283313010", "token": "..." }`. PHP prüft Anmeldung, Token und Kennung, speichert und antwortet mit JSON, das die neue Liste enthält. JavaScript setzt daraufhin den Knopf auf „gedrückt“ und die Stecknadel auf der Karte (`Karte.markieren`).
