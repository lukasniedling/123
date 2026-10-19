# Impressum und Datenschutz: `impressum.html` und `datenschutz.html`

Erklärung für die Präsentation der Endversion, Version 5 (`final-v5/`, Kopie von `final-v3/`, aufbauend auf `final-v2/`). Zeilennummern erzeugt am 2026-10-07 14:25, geprüft und korrigiert am 2026-10-13 aus den aktuellen Dateien in `final-v3/`.

**Vorschlag für die Präsentation:** Matti Katila (Inhalte und Anforderungen). Die ganze Aufteilung für alle fünf steht in [README.md](README.md) unter „Vorschlag: wer präsentiert was“.

## Was die Seiten zeigen und warum

Laut Vorlesung 2 (Folie 8) ist **Rechtliches Pflicht**: ein Impressum mit Verantwortlichem, Telefon, Anschrift und E-Mail, und eine Datenschutzerklärung nach DSGVO, die die Rechte der Besucher nennt und alle eingesetzten Inhalte beschreibt. Beide Seiten sind über die Fußzeile jeder Seite erreichbar.

- **Impressum**: wer die Website anbietet (die Projektgruppe), wie man sie erreicht, dass es ein nicht-kommerzielles Studienprojekt ist, Haftung für Inhalte und Links, und alle Lizenzen: Kartendaten (OpenStreetMap, ODbL), Fotos (Wikimedia Commons, Tabelle mit Urheber und Lizenz) und Schriften (Systemschrift, Logo).
- **Datenschutz**: ein Inhaltsverzeichnis mit Ankerlinks, dann Verantwortliche, das Wichtigste in Kürze, Aufruf der Website (ohne Server), was im Browser passiert, was im Browser gespeichert wird (Konto, gemerkte Orte, Vorschläge), die OpenStreetMap-Karte im iframe, Video, Schriften und Fotos, die Rechte der Besucher und die zuständige Aufsichtsbehörde.

Wichtig für die Präsentation:

- Die Folie nennt noch das **Telemediengesetz**. Es gilt seit dem 14.05.2024 nicht mehr; die Impressumspflicht steht jetzt in **§ 5 DDG** (Digitale-Dienste-Gesetz). Deshalb steht auf unserer Seite „Angaben gemäß § 5 DDG“.
- Im Impressum stehen die **fünf Mitglieder** der Projektgruppe (Matti Katila, Nikita Ermotschenko, Niko Eibach, Anes Sahbegovic, Lukas Niedling) mit der Postanschrift „c/o Duale Hochschule Baden-Württemberg Mannheim, Coblitzallee 1-9, 68163 Mannheim“ (laut Impressum der DHBW Mannheim, abgerufen am 2026-09-29). Verantwortlich für den Inhalt ist die ganze Gruppe.
- **E-Mail-Adresse und Telefonnummer sind erfunden**: Das Team hat sie als Platzhalter für das Studienprojekt gewählt; ein Kommentar im Quelltext sagt das `impressum.html:84`. Nie eine E-Mail dorthin schicken und nie die Nummer anrufen. Die Telefonnummer ist deshalb auch kein `tel:`-Link.
- Die **Datenschutzerklärung** ist ein Muster für das Studienprojekt: Alle Angaben sind ausgefüllt, die Löschfristen lauten „spätestens nach Abschluss des Studienprojekts“ `datenschutz.html:9`. Der Hinweiskasten oben bleibt, bis das Team den Text geprüft hat.
- Die Website hat keinen Server und setzt keine Cookies (Entscheidung D-042). Konto, gemerkte Orte und Vorschläge liegen im localStorage des Browsers; der Abschnitt „Konto, gemerkte Orte und Vorschläge“ nennt die drei Schlüssel und warnt, dass das Passwort unverschlüsselt gespeichert wird.

## So führst du die Seiten vor

1. In der Fußzeile auf **Impressum** klicken: Namen und Anschrift im `<address>`-Block, `mailto:`-Link, Tabelle der Fotonachweise.
2. Auf **Datenschutz** wechseln und im Inhaltsverzeichnis auf **Konto, gemerkte Orte und Vorschläge** klicken (Anker): keine Cookies, alles bleibt im Browser.
3. Auf **OpenStreetMap-Karte** klicken: Das ist der einzige Fall, in dem eine fremde Website Daten (die IP-Adresse) bekommt.
4. Optional die Druckansicht zeigen: Links werden mit ihrer Adresse ausgedruckt.

## Aufbau des Quelltexts

### Beteiligte Dateien

| Datei | Aufgabe | Version |
|---|---|---|
| `impressum.html` | Anbieter, Kontakt, Haftung, Lizenzen, Fotonachweise | V1 |
| `datenschutz.html` | Datenschutzerklärung mit Inhaltsverzeichnis | V1 (Teile V2) |
| `css/info.css` | Abschnitt 1 (Inhaltsverzeichnis), 2 (Platzhalter), 7 (Anschrift, Datum), 8 (Druck) | V1 |
| `css/style.css` | Textspalte `.prose`, Hinweiskästen `.notice`, Tabellen, Druckregeln | V1 |

### `impressum.html` von oben nach unten

1. Kopfkommentar `impressum.html:3`: Rechtsgrundlage § 5 DDG, Hinweise für das Team.
2. „Angaben gemäß § 5 DDG“ `impressum.html:64` mit den fünf Namen und der Anschrift in `<address>` `impressum.html:66`; der Kommentar darüber nennt die Quelle der Anschrift `impressum.html:75`.
3. Kontakt mit `mailto:`-Link `impressum.html:87` und Telefon `impressum.html:88` (beide erfunden, siehe Kommentar), dann „Über dieses Projekt“ `impressum.html:90`, Verantwortlich für den Inhalt: die ganze Gruppe `impressum.html:95`, Haftung für Inhalte `impressum.html:99` und Links `impressum.html:104`.
4. Trennlinie `<hr>` `impressum.html:109`, dann „Urheberrecht und Lizenzen“ `impressum.html:111` mit Kartendaten `impressum.html:116`, Fotos `impressum.html:120` samt Tabelle `impressum.html:127` und Schriften `impressum.html:191`.
5. Stand der Seite `impressum.html:194` und Fußzeile, in der der Link „Impressum“ als aktuelle Seite markiert ist `impressum.html:204`.

### `datenschutz.html` von oben nach unten

1. Kopfkommentar `datenschutz.html:3`: Zweck (Art. 13 DSGVO), dass es keinen Server gibt, mit welchen Dateien der Text übereinstimmen muss, wann die Fakten geprüft wurden.
2. Hinweiskasten „Muster, noch zu prüfen“ `datenschutz.html:68`.
3. Inhaltsverzeichnis `datenschutz.html:73`: eine nummerierte Liste von Ankerlinks, zum Beispiel `datenschutz.html:80`.
4. Die Abschnitte, jeder mit `<h2 id="...">` als Sprungziel: Verantwortliche `datenschutz.html:93`, Das Wichtigste in Kürze `datenschutz.html:114`, Aufruf der Website `datenschutz.html:123`, Browser `datenschutz.html:129`, Konto, gemerkte Orte und Vorschläge `datenschutz.html:138`, Standort `datenschutz.html:159`, OpenStreetMap `datenschutz.html:165`, Video `datenschutz.html:173`, Schriften, Fotos und Links `datenschutz.html:181`, Rechte `datenschutz.html:191`, Beschwerde `datenschutz.html:207`, Änderungen `datenschutz.html:221`.
5. Andere Seiten verlinken direkt auf Abschnitte, zum Beispiel der Hinweis unter der Karte auf `datenschutz.html#openstreetmap` `quadrate.html:372`.

### Wo die Fakten herkommen

Die Datenschutzerklärung beschreibt, was der Code wirklich tut. Deshalb stehen im Kopfkommentar die Dateien, mit denen sie übereinstimmen muss `datenschutz.html:14`: `js/konto.js` und `js/formular.js` (was gespeichert wird, Namen der Schlüssel `js/konto.js:28`, `js/formular.js:56`), `vorschlagen.html` (OpenStreetMap-iframe) und `ueber-uns.html` (Video).

## Begriffe aus dem Quelltext

Spalte „Kurs“: **VL2 S.6** = Vorlesung 2, Folie 6. **VL5\*** = im Inhaltsverzeichnis von Vorlesung 4 (Folie 2–3) angekündigt. **–** = nicht in den Folien.

### HTML

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Grundgerüst | `impressum.html:1`, `impressum.html:21` | HTML5-Dokument mit UTF-8, damit „§“ und Umlaute richtig erscheinen. | VL2 S.3 |
| `<address>` | `impressum.html:66` | Kennzeichnet Kontaktangaben der Verantwortlichen; Browser zeigen es kursiv, unser CSS stellt es gerade. | – |
| `<br>` | `impressum.html:67` | Zeilenumbruch innerhalb eines Absatzes, hier zwischen Namen und Anschrift; ohne End-Tag. | VL2 S.6 |
| `<hr>` | `impressum.html:109` | Thematische Trennlinie zwischen Anbieterangaben und Lizenzen; ohne End-Tag. | VL2 S.6 |
| `mailto:`-Link | `impressum.html:87` | Ein Klick öffnet das E-Mail-Programm mit der Adresse als Empfänger. | VL2 S.6 |
| `id` an Überschriften | `impressum.html:120` | Sprungziel: Die Bildnachweise der Fotos verlinken mit `impressum.html#fotos` genau hierher. | VL3 S.2 |
| `<h2>`, `<h3>` | `impressum.html:113`, `impressum.html:113` | Überschriften gliedern den langen Text in Abschnitte und Unterabschnitte. | VL2 S.3 |
| `<code>` | `impressum.html:118` | Dateinamen im Text erscheinen in der Code-Schrift. | – |
| Tabelle der Fotonachweise | `impressum.html:127`, `impressum.html:128` | Motiv, Urheber, Lizenz und Quelle je Foto; `<caption>` ist die Tabellenüberschrift. | VL3 S.2 |
| `<th scope="row">` | `impressum.html:138` | Die erste Zelle jeder Zeile benennt das Motiv. | VL3 S.2 |
| `<td>` mit Links | `impressum.html:140` | Datenzelle mit Links auf den Lizenztext und die Quelle. | VL3 S.2 |
| `role="status"` | `datenschutz.html:67` | Kennzeichnet den Hinweiskasten „Muster, noch zu prüfen“ als Statusmeldung für Screenreader. | – |
| `aria-current="page"` in der Fußzeile | `impressum.html:204` | Markiert den Link auf die Seite, auf der man gerade ist. | – |
| Inhaltsverzeichnis `<nav>` + `<ol>` | `datenschutz.html:75`, `datenschutz.html:75` | Navigation innerhalb der Seite als nummerierte Liste von Ankerlinks. | VL2 S.6, S.8 |
| Anker `href="#..."` | `datenschutz.html:76` | Springt zu `<h2 id="verantwortliche">` `datenschutz.html:93` auf derselben Seite. | VL3 S.2 |
| Versionsmarke im Kommentar | `datenschutz.html:130` | Zeigt, welche Absätze in V1 (ohne JavaScript) durch den Text nach `V1 instead:` ersetzt werden. | VL2 S.5 |
| `<ul>` | `datenschutz.html:115` | Aufzählung ohne Reihenfolge, hier „Das Wichtigste in Kürze“. | VL2 S.6 |
| `<strong>` | `datenschutz.html:194` | Hebt ein wichtiges Wort hervor (fett), hier den Namen jedes Rechts. | VL2 S.6 |
| auskommentierter Absatz | `datenschutz.html:178` | Ein fertiger Satz, den das Team nur einfügt, falls es ein YouTube-Video verlinkt. | VL2 S.5 |
| absoluter Link | `datenschutz.html:168` | Link auf die Datenschutzerklärung der OpenStreetMap Foundation. | VL2 S.6 |

### CSS

| Begriff | Fundstelle | Erklärung | Kurs |
|---|---|---|---|
| Textspalte `.prose` | `css/style.css:579` | Begrenzt Textzeilen auf `var(--measure)` (68 Zeichen), damit lange Texte gut lesbar bleiben. | – |
| Abstände an Überschriften | `css/style.css:583` | Mehr Abstand über jeder `<h2>` in der Textspalte (`margin-top`). | VL5\* |
| `font-style: normal` | `css/info.css:422` | Hebt die Kursivschrift auf, die Browser für `<address>` vorgeben. | VL4 S.21 |
| dicke linke Kante `border-left` | `css/info.css:425` | Die Anschrift bekommt links eine dunkle Kante wie die Wand eines Blocks. | VL5\* |
| Nachbar-Selektor `p + p` | `css/info.css:433` | Nur ein Absatz, der direkt auf einen anderen folgt, bekommt Abstand nach oben. | – |
| `columns: 2` | `css/info.css:81` | Das Inhaltsverzeichnis fließt ab 40rem Breite in zwei Spalten wie in einer Zeitung. | – |
| `break-inside: avoid` | `css/info.css:86` | Ein Eintrag wird nicht auf zwei Spalten verteilt. | – |
| Media Query | `css/info.css:79` | Die zwei Spalten gibt es erst, wenn der Bildschirm breit genug ist. | VL4 S.4 |
| Platzhalter `.placeholder` | `css/info.css:122` | Sandfarbener Hintergrund und gestrichelter Rand, damit offene Angaben beim Korrekturlesen auffallen. Seit dem 29.09.2026 ist keine Angabe mehr offen; die Regel bleibt für spätere Änderungen. | – |
| Hinweiskasten `.notice` | `css/style.css:1865`, `css/style.css:1907` | Farbiger Kasten; die Variante setzt nur zwei Variablen (`--notice-color`, `--notice-bg`) um. | – |
| `::before` am Titel | `css/style.css:1893` | Erzeugt das kleine farbige Quadrat vor dem Titel des Kastens. | VL5\* |
| `padding-inline` auf dem Handy | `css/info.css:454` | Weniger Innenabstand in der Fototabelle, damit sie in 360 px passt. | VL5\* |
| `hr` gestalten | `css/style.css:316` | Die Trennlinie ist eine dünne obere Rahmenlinie mit Abstand darüber und darunter. | VL2 S.6 |
| `strong, b` / `em, i` | `css/style.css:294` | Fett und kursiv sind im CSS festgelegt, wie auf der Folie. | VL4 S.21 |
| Attributselektor `[href^="http"]` und `attr()` | `css/style.css:1971` | Beim Drucken wird hinter jeden externen Link seine Adresse geschrieben; `^=` heißt „beginnt mit“. | VL4 S.6 |

## Fragen, die der Dozent stellen könnte

1. **Auf der Folie steht „Telemediengesetz“, bei euch „§ 5 DDG“. Warum?**
   Das Telemediengesetz ist am 14.05.2024 außer Kraft getreten. Die Pflicht zum Impressum steht seitdem in § 5 des Digitale-Dienste-Gesetzes (DDG), mit demselben Inhalt: Name, Anschrift, schnelle Kontaktmöglichkeit (E-Mail, Telefon). Wir zitieren deshalb das geltende Gesetz.

2. **Muss ein Studienprojekt überhaupt ein Impressum haben?**
   Die Pflicht aus § 5 DDG gilt für geschäftsmäßige, in der Regel gegen Entgelt angebotene digitale Dienste; so steht es auch im Abschnitt „Über dieses Projekt“. Ob ein nicht-kommerzielles Studienprojekt darunter fällt, müssen wir nicht entscheiden: Die Vorlesung verlangt ein Impressum, und wir machen die Angaben vollständig, damit jeder weiß, wer hinter der Seite steht.

3. **Welche Daten verarbeitet eure Website, und welche Cookies setzt sie?**
   Keine Cookies, und es gibt keinen Server, also auch keine Server-Logdateien. Filter und Karte laufen im Browser: Welchen Tag, welche Uhrzeit und welches Quadrat jemand wählt, wird nirgendwohin geschickt. Konto, gemerkte Orte und Vorschläge speichert der Browser im localStorage unter drei Schlüsseln, nur auf dem Gerät des Besuchers. Weil das Passwort dort unverschlüsselt steht, warnt die Seite davor, ein echtes Passwort zu nehmen. Löschen kann man alles mit „Konto löschen“ oder in den Browser-Einstellungen.

4. **Warum keine Google Fonts, und wann bekommt doch eine fremde Firma Daten?**
   Vorlesung 4 (Folie 25) warnt: Über eingebundene Schriften von Google lassen sich Nutzerprofile bilden. Wir laden deshalb gar keine Schriften, sondern nutzen die Systemschrift des Geräts. Fotos, Daten und Video liegen als Dateien bei der Website. Einzige Ausnahme ist die OpenStreetMap-Karte im iframe auf „Ort vorschlagen“: Sie lädt von den Servern der OpenStreetMap Foundation, die dabei die IP-Adresse sieht. Das steht im Abschnitt „OpenStreetMap-Karte“, und unter der Karte steht ein Hinweis.

5. **Welche Rechte haben die Besucher?**
   Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit, Widerspruch und Widerruf einer Einwilligung (Art. 15 bis 21 und Art. 7 Abs. 3 DSGVO), dazu die Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO); für Baden-Württemberg ist das der Landesbeauftragte für den Datenschutz (LfDI BW). Zu jeder Verarbeitung nennt die Seite die Rechtsgrundlage, zum Beispiel Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) für die OpenStreetMap-Karte.
