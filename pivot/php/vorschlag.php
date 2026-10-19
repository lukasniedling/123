<?php
/*
 * php/vorschlag.php - receives the form "Ort vorschlagen / Kontakt" of vorschlagen.html.   [V3]
 *
 * How it works:
 *   POST  1. spam checks: the hidden honeypot field "website" must be empty, and the
 *            form must come from a page of this website (Origin header, see below);
 *         2. reads every field, removes spaces at both ends and checks it again on the
 *            server (same rules as the HTML attributes and js/formular.js), because
 *            anyone can send data to this address without using our form;
 *         3. appends the suggestion to daten/vorschlaege.json under the exclusive lock
 *            of php/lib.php (flock), so two suggestions at the same moment cannot
 *            overwrite each other (a file that cannot be read is never overwritten);
 *         4. success: redirects to vorschlag.php?status=gesendet (pattern
 *            "Post/Redirect/Get": reloading the thank-you page does not send the form
 *            again). Problems: an error page that lists them and shows the entered text.
 *   GET   with ?status=gesendet: the thank-you page. Without it: status 405, because
 *         this address only accepts the sent form (POST).
 * Everything the visitor typed goes through h() (htmlspecialchars, php/lib.php) before
 * it is printed, so nobody can inject HTML or JavaScript into the page (XSS).
 *
 * Why a honeypot and no CSRF token: login.php and registrieren.php protect their
 * forms with a secret token from the session (csrfField() in php/lib.php). A token
 * must be written into the form by PHP. vorschlagen.html is a static HTML page (it
 * also has to work by double-click), so it cannot carry a token, and it starts no
 * session. The risk is also small: this script does nothing in the name of a
 * logged-in user, so a forged request could only send a suggestion that anyone can
 * send anyway. What remains is spam, and against spam we use two simple checks:
 *   - the honeypot: a text field that css/formular.css hides. People never see it
 *     and leave it empty; simple robots fill in every field they find.
 *   - the Origin check: browsers add the header "Origin" (e.g. http://localhost) to
 *     every form they send with method="post". If it names another website, the
 *     request is refused.
 *
 * Stored per suggestion: date and time, name, e-mail, name of the place, Quadrat,
 * category, message. No IP address (see datenschutz.html, "Vorschläge und Nachrichten").
 *
 * How it fits in: helpers from php/lib.php (h, postValue, isPost, redirect, lockData,
 * readJson, writeJson, loadBlocks, CATEGORY_NAMES, basePath); page frame from php/kopf.php
 * and php/fuss.php, which put "../" in front of every link because this script lives in
 * php/. daten/.htaccess stops the web server from handing out the JSON file.
 * The form field names (name, email, ort, quadrat, kategorie, nachricht, datenschutz) and
 * the stored keys stay German: they are the contract with the form in vorschlagen.html.
 * Only style.css classes are used on these pages, so no extra stylesheet is needed.
 */

require_once __DIR__ . '/lib.php';
require_once __DIR__ . '/kopf.php';
require_once __DIR__ . '/fuss.php';


/* ---------------------------------------------------------------------------
   Settings
   --------------------------------------------------------------------------- */

// File in daten/ that collects the suggestions: a JSON list, the newest at the end.
const SUGGESTION_FILE = 'vorschlaege.json';

// Upper limit of stored suggestions, so that a flood of spam cannot fill the disk.
const SUGGESTION_LIMIT = 1000;

// Length limits in characters, the same as minlength/maxlength in vorschlagen.html.
const NAME_MIN = 2;
const NAME_MAX = 80;
const EMAIL_MAX = 254;
const PLACE_MAX = 120;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 1000;

// Names of the form fields, for the list of problems and the table of entries.
const FIELD_LABELS = [
    'name'        => 'Dein Name',
    'email'       => 'E-Mail',
    'ort'         => 'Name des Ortes',
    'quadrat'     => 'Quadrat',
    'kategorie'   => 'Kategorie',
    'nachricht'   => 'Nachricht',
    'datenschutz' => 'Datenschutzerklärung',
];


/* ---------------------------------------------------------------------------
   Functions
   --------------------------------------------------------------------------- */

/**
 * Values of the radio buttons "Kategorie" and their German names: the four categories
 * of the map (CATEGORY_NAMES in php/lib.php) plus "Sonstiges" for general questions.
 */
function suggestionCategories(): array
{
    return CATEGORY_NAMES + ['sonstiges' => 'Sonstiges'];
}

/**
 * Returns a text field of the sent form without spaces at both ends.
 * Browsers send a line break of the textarea as "\r\n"; it becomes "\n", so a
 * line break counts as one character, as in the browser's character counter.
 * Text that is not valid UTF-8 (only possible with a crafted request) counts as empty.
 */
function readText(string $field): string
{
    $text = str_replace("\r\n", "\n", postValue($field));
    if (!mb_check_encoding($text, 'UTF-8')) {
        return '';
    }
    return trim($text);
}

/**
 * True if the e-mail address looks usable: PHP's own e-mail check (filter_var)
 * plus a dot after the @, the same rule as the pattern attribute in vorschlagen.html.
 */
function isEmailValid(string $email): bool
{
    if (mb_strlen($email, 'UTF-8') > EMAIL_MAX) {
        return false;
    }
    if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        return false;
    }
    // \z = end of the text (a plain $ would also accept a line break at the end).
    return preg_match('/^[^@\s]+@[^@\s]+\.[^@\s]+\z/', $email) === 1;
}

/**
 * Checks all fields of a suggestion. Returns the problems as a list
 * (field name => German message); an empty list means everything is fine.
 * mb_strlen() counts characters ("ä" is one); strlen() would count bytes ("ä" is two).
 */
function validateSuggestion(array $input): array
{
    $errors = [];

    $nameLength = mb_strlen($input['name'], 'UTF-8');
    if ($input['name'] === '') {
        $errors['name'] = 'Bitte gib deinen Namen ein. Ein Vorname reicht.';
    } elseif ($nameLength < NAME_MIN || $nameLength > NAME_MAX) {
        $errors['name'] = 'Der Name muss ' . NAME_MIN . ' bis ' . NAME_MAX . ' Zeichen lang sein.';
    }

    if ($input['email'] === '') {
        $errors['email'] = 'Bitte gib deine E-Mail-Adresse ein, damit wir dir antworten können.';
    } elseif (!isEmailValid($input['email'])) {
        $errors['email'] = 'Diese E-Mail-Adresse ist unvollständig. Sie braucht ein @ und eine Endung, zum Beispiel anna@beispiel.de.';
    }

    // The name of the place is optional, only its length is limited.
    if (mb_strlen($input['ort'], 'UTF-8') > PLACE_MAX) {
        $errors['ort'] = 'Der Name des Ortes darf höchstens ' . PLACE_MAX . ' Zeichen haben.';
    }

    // The Quadrat is optional ("Weiß ich nicht" sends ""); if given, it must be one of the 146
    // codes in js/data/quadrate.js. array_key_exists() compares exactly ("m3a" is not "M3a").
    if ($input['quadrat'] !== '' && !array_key_exists($input['quadrat'], loadBlocks())) {
        $errors['quadrat'] = 'Dieses Quadrat gibt es nicht. Bitte wähle eines aus der Liste.';
    }

    if (!array_key_exists($input['kategorie'], suggestionCategories())) {
        $errors['kategorie'] = 'Bitte wähle eine Kategorie. Bei einer allgemeinen Frage passt Sonstiges.';
    }

    $messageLength = mb_strlen($input['nachricht'], 'UTF-8');
    if ($input['nachricht'] === '') {
        $errors['nachricht'] = 'Bitte schreib uns eine kurze Nachricht.';
    } elseif ($messageLength < MESSAGE_MIN) {
        $errors['nachricht'] = 'Die Nachricht ist noch sehr kurz. Bitte schreib mindestens ' . MESSAGE_MIN . ' Zeichen.';
    } elseif ($messageLength > MESSAGE_MAX) {
        $errors['nachricht'] = 'Die Nachricht darf höchstens ' . MESSAGE_MAX . ' Zeichen haben.';
    }

    // The checkbox sends "ja" only while it is ticked; otherwise the field is missing.
    if ($input['datenschutz'] !== 'ja') {
        $errors['datenschutz'] = 'Bitte bestätige, dass du die Datenschutzerklärung gelesen hast. Ohne deine Zustimmung dürfen wir deine Angaben nicht speichern.';
    }

    return $errors;
}

/**
 * True if the form was sent from a page of this website.
 * Browsers send the header "Origin" with every form that uses method="post",
 * e.g. "http://localhost" or "http://localhost:8080"; it must name the same
 * server as the header "Host" ("localhost" or "localhost:8080").
 * Requests without an Origin header (very old browsers, tools) are let through;
 * the honeypot and the field checks still apply to them.
 */
function isSameOriginRequest(): bool
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') {
        return true;
    }

    // "http://localhost:8080" gives the host "localhost" and the port 8080.
    // The value "null" (a page without its own address) has no host and is refused.
    $host = parse_url($origin, PHP_URL_HOST);
    if (!is_string($host)) {
        return false;
    }
    $port = parse_url($origin, PHP_URL_PORT);
    if ($port !== null) {
        $host = $host . ':' . $port;
    }

    return strtolower($host) === strtolower($_SERVER['HTTP_HOST'] ?? '');
}

/**
 * Appends one suggestion to daten/vorschlaege.json. Returns '' on success,
 * otherwise a German message for the visitor.
 * lockData(LOCK_EX) from php/lib.php locks with flock(): while this request reads
 * the list, adds the suggestion and writes the list back, every other request
 * waits. Without the lock, two suggestions sent at the same moment could both
 * read the old list, and the one written second would delete the first.
 */
function saveSuggestion(array $suggestion): string
{
    $lock = lockData(LOCK_EX);
    if ($lock === null) {
        return ERROR_SAVE;
    }

    $list = readJson(SUGGESTION_FILE);
    if ($list === null) {
        unlockData($lock);                     // broken file: never overwrite it
        return ERROR_SAVE;
    }
    if (count($list) >= SUGGESTION_LIMIT) {
        unlockData($lock);
        return 'Unser Speicher für Vorschläge ist gerade voll. Bitte versuche es in ein paar Tagen noch einmal.';
    }

    $list[] = $suggestion;
    $saved = writeJson(SUGGESTION_FILE, $list);
    unlockData($lock);

    if ($saved) {
        return '';
    }
    return ERROR_SAVE;
}


/* ---------------------------------------------------------------------------
   Handle the request
   --------------------------------------------------------------------------- */

$page = '';           // which page to show: 'thanks', 'post-only' or 'problem'
$problemTitle = '';   // heading of the problem page
$problemLead = '';    // first sentence below that heading
$noticeTitle = '';    // title of the red notice box
$problems = [];       // list of problems, each one a German sentence
$input = [];          // cleaned form values, shown again on the problem page

if (!isPost()) {
    if (($_GET['status'] ?? '') === 'gesendet') {
        $page = 'thanks';
    } else {
        // Someone opened this address directly: it only accepts the sent form.
        http_response_code(405);   // 405 = "Method Not Allowed"
        header('Allow: POST');
        $page = 'post-only';
    }
} else {
    $input = [
        'name'        => readText('name'),
        'email'       => readText('email'),
        'ort'         => readText('ort'),
        'quadrat'     => readText('quadrat'),
        'kategorie'   => readText('kategorie'),
        'nachricht'   => readText('nachricht'),
        'datenschutz' => readText('datenschutz'),
    ];

    if (readText('website') !== '') {
        // Honeypot filled in: almost certainly a robot. It gets the normal thank-you
        // page, so it cannot tell that it was caught, but nothing is stored.
        redirect('vorschlag.php?status=gesendet');
    }

    $page = 'problem';

    if (!isSameOriginRequest()) {
        http_response_code(403);   // 403 = "Forbidden"
        $problemTitle = 'Vorschlag nicht angenommen';
        $problemLead = 'Das Formular wurde nicht von unserer Website gesendet. Es wurde nichts gespeichert.';
        $noticeTitle = 'Fremde Website';
        $problems[] = 'Bitte nutze das Formular auf unserer Seite Ort vorschlagen.';
    } else {
        $errors = validateSuggestion($input);

        if (count($errors) > 0) {
            http_response_code(400);   // 400 = "Bad Request": the data is not usable
            $problemTitle = 'Vorschlag nicht gesendet';
            $problemLead = 'Ein paar Angaben fehlen noch oder passen nicht. Es wurde nichts gespeichert.';
            $noticeTitle = 'Bitte prüfe deine Angaben';
            foreach ($errors as $field => $message) {
                $problems[] = FIELD_LABELS[$field] . ': ' . $message;
            }
        } else {
            $saveError = saveSuggestion([
                'zeit'      => date('Y-m-d H:i'),     // German local time (php/lib.php sets the time zone)
                'name'      => $input['name'],
                'email'     => $input['email'],
                'ort'       => $input['ort'],         // '' if not given
                'quadrat'   => $input['quadrat'],     // '' = "Weiß ich nicht"
                'kategorie' => $input['kategorie'],
                'nachricht' => $input['nachricht'],
            ]);

            if ($saveError === '') {
                // Post/Redirect/Get: the browser loads the thank-you page with GET.
                redirect('vorschlag.php?status=gesendet');
            }

            http_response_code(500);   // 500 = "Internal Server Error": our side failed
            $problemTitle = 'Speichern hat nicht geklappt';
            $problemLead = 'Deine Angaben sind in Ordnung, aber wir konnten sie nicht speichern.';
            $noticeTitle = 'Fehler beim Speichern';
            $problems[] = $saveError;
        }
    }
}


/* ---------------------------------------------------------------------------
   Show the page (pageHeader() opens <main>, pageFooter() closes it)
   --------------------------------------------------------------------------- */

$base = basePath();    // "../": this script lives in php/, the pages in the site root

if ($page === 'thanks') {
    pageHeader('Vorschlag gesendet', 'vorschlagen');
    ?>
    <div class="page-intro">
      <h1>Danke für deinen Vorschlag</h1>
      <p class="lead">Deine Nachricht ist bei uns angekommen.</p>
    </div>

    <div class="prose">
      <div class="notice notice--success" role="status">
        <p class="notice__title">Vorschlag gesendet</p>
        <p>Danke. Wir prüfen den Ort und nehmen ihn beim nächsten Daten-Stand auf. Wenn wir eine Frage haben, schreiben wir dir an die angegebene E-Mail-Adresse.</p>
      </div>

      <div class="button-row">
        <a class="button" href="<?= h($base) ?>index.html">Zur Karte</a>
        <a class="button button--secondary" href="<?= h($base) ?>vorschlagen.html">Noch einen Ort vorschlagen</a>
      </div>
    </div>
    <?php
} elseif ($page === 'post-only') {
    pageHeader('Ort vorschlagen', 'vorschlagen');
    ?>
    <div class="page-intro">
      <h1>Hier geht es zum Formular</h1>
      <p class="lead">Diese Adresse nimmt nur ausgefüllte Formulare entgegen.</p>
    </div>

    <div class="prose">
      <p>Einen Ort schlägst du auf der Seite <a href="<?= h($base) ?>vorschlagen.html">Ort vorschlagen</a> vor.</p>
    </div>
    <?php
} else {
    // German name of the chosen category ("essen" -> "Essen"); an unknown value is shown as sent.
    $categoryText = $input['kategorie'];
    $categories = suggestionCategories();
    if (array_key_exists($categoryText, $categories)) {
        $categoryText = $categories[$categoryText];
    }

    pageHeader($problemTitle, 'vorschlagen');
    ?>
    <div class="page-intro">
      <h1><?= h($problemTitle) ?></h1>
      <p class="lead"><?= h($problemLead) ?></p>
    </div>

    <div class="prose">
      <div class="notice notice--error" role="alert">
        <p class="notice__title"><?= h($noticeTitle) ?></p>
        <ul>
<?php foreach ($problems as $problem) : ?>
          <li><?= h($problem) ?></li>
<?php endforeach; ?>
        </ul>
      </div>

      <p>Mit der Zurück-Taste deines Browsers kommst du zum Formular. Deine Eingaben sind dort meist noch vorhanden; zur Sicherheit stehen sie auch hier, damit nichts verloren geht.</p>

      <?php /* nl2br() in the last row runs after h(): line breaks of the message
               become <br>, the text itself stays escaped. */ ?>
      <div class="table-wrap">
        <table class="data-table">
          <caption>Deine Eingaben</caption>
          <tbody>
            <tr><th scope="row"><?= h(FIELD_LABELS['name']) ?></th><td><?= h($input['name']) ?></td></tr>
            <tr><th scope="row"><?= h(FIELD_LABELS['email']) ?></th><td><?= h($input['email']) ?></td></tr>
            <tr><th scope="row"><?= h(FIELD_LABELS['ort']) ?></th><td><?= h($input['ort']) ?></td></tr>
            <tr><th scope="row"><?= h(FIELD_LABELS['quadrat']) ?></th><td><?= h($input['quadrat']) ?></td></tr>
            <tr><th scope="row"><?= h(FIELD_LABELS['kategorie']) ?></th><td><?= h($categoryText) ?></td></tr>
            <tr><th scope="row"><?= h(FIELD_LABELS['nachricht']) ?></th><td><?= nl2br(h($input['nachricht'])) ?></td></tr>
          </tbody>
        </table>
      </div>

      <div class="button-row">
        <a class="button button--secondary" href="<?= h($base) ?>vorschlagen.html">Formular neu öffnen</a>
      </div>
    </div>
    <?php
}

pageFooter();
