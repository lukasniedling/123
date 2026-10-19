<?php
/*
 * php/lib.php - shared PHP helpers of the website "Quadrate".                          [V3]
 *
 * Purpose: one place for everything the PHP pages need, so each page stays short:
 *   - sessions        start with safe cookie settings, log in, log out, current user
 *   - output          h() escapes text for HTML, redirect() sends the browser elsewhere
 *   - JSON storage    users and saved places live in daten/*.json (no database);
 *                     a lock file lets only one request write at a time, and every
 *                     write goes to a temporary file first, which then replaces the
 *                     old file in one step (rename), so a file is never half written.
 *                     A file that cannot be read is never overwritten (see readJson()).
 *   - validation      rules for user name and password
 *   - CSRF            a secret token per session that every form sends back
 *   - place data      reads js/data/orte.js and js/data/quadrate.js on the server
 *   - saved places    list, add, remove ("Merkliste")
 *
 * How it fits in: every PHP file includes this file first:
 *     require __DIR__ . '/php/lib.php';   (pages in the site root: login.php, meine-orte.php ...)
 *     require __DIR__ . '/lib.php';       (scripts inside php/: merken.php, vorschlag.php)
 * php/kopf.php and php/fuss.php print the page frame. daten/.htaccess stops the web
 * server from delivering the JSON files. Passwords are never stored, only their hash.
 * Needs PHP 8.0 or newer (as in XAMPP). No output happens in this file, so pages can
 * still send headers (cookies, redirects) after including it.
 * Names: functions and constants are English like all code. The form field names
 * (benutzername, passwort ...), the query values (?hinweis=...), the JSON keys and the
 * keys stored in daten/ stay German: they are data, shared with the HTML and JavaScript.
 */


/* ---------------------------------------------------------------------------
   Settings
   --------------------------------------------------------------------------- */

const SESSION_NAME = 'quadrate_sitzung';         // name of the session cookie (datenschutz.html names it)
const DATA_DIR = __DIR__ . '/../daten';           // folder with the JSON files (next to php/)
const USERS_FILE = 'benutzer.json';               // user name => password hash and date
const SAVED_PLACES_FILE = 'merkliste.json';       // user name => list of place ids
const LOCK_FILE = 'sperre.lock';                  // empty file that is only used for locking
const PASSWORD_MIN = 8;                           // minimum length of a password (characters)
const PASSWORD_MAX = 72;                          // bcrypt (password_hash) only uses the first 72 bytes

// German names of the four categories (same as window.KATEGORIEN in js/filter.js).
const CATEGORY_NAMES = [
    'essen'   => 'Essen',
    'trinken' => 'Trinken',
    'kultur'  => 'Kultur',
    'shoppen' => 'Shoppen',
];

// Shown when a JSON file cannot be written (e.g. the folder daten/ is not writable).
const ERROR_SAVE = 'Die Daten konnten nicht gespeichert werden. Bitte versuche es später noch einmal.';

// Shown when the CSRF token of a form is missing or wrong (e.g. the form was open too long).
const ERROR_TOKEN = 'Das Formular ist abgelaufen. Bitte sende es noch einmal ab.';

// All dates the PHP part stores (registration, suggestions) are German local time. Without this
// line PHP uses date.timezone of php.ini, and if that is not set, UTC (1 to 2 hours off).
date_default_timezone_set('Europe/Berlin');


/* ---------------------------------------------------------------------------
   Session
   --------------------------------------------------------------------------- */

/**
 * URL folder of the website, e.g. "/quadrate/" or "/" (always with a slash at the end).
 * The session cookie is only sent to this folder, so two copies of the site on one server
 * (e.g. both map variants in htdocs) do not share a login.
 */
function sitePath(): string
{
    $folder = dirname($_SERVER['SCRIPT_NAME'] ?? '/');   // URL folder of the running script
    if (basePath() === '../') {
        $folder = dirname($folder);                     // scripts in php/: one folder up
    }
    $folder = str_replace('\\', '/', $folder);          // Windows writes the root as "\"
    return rtrim($folder, '/') . '/';
}

/**
 * Starts the session (or resumes it) with safe cookie settings.
 * Must be called before the page prints anything, because it may send a cookie.
 * Calling it a second time does nothing.
 */
function startSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    // On an HTTPS connection the cookie is only ever sent encrypted.
    $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';

    ini_set('session.use_strict_mode', '1');   // accept only session ids that this server created
    ini_set('session.use_only_cookies', '1');  // never take the session id from the URL

    session_name(SESSION_NAME);
    session_set_cookie_params([
        'lifetime' => 0,           // the cookie ends when the browser is closed
        'path'     => sitePath(),  // only for this website's folder
        'secure'   => $https,
        'httponly' => true,        // JavaScript cannot read the cookie
        'samesite' => 'Lax',       // other websites cannot send it along with their forms
    ]);
    session_start();
}

/**
 * Returns the name of the logged-in user, or null if nobody is logged in.
 */
function currentUser(): ?string
{
    // $_SESSION only exists while a session is running; ?? also covers that case.
    $name = $_SESSION['user'] ?? null;
    if (is_string($name) && $name !== '') {
        return $name;
    }
    return null;
}

/**
 * Marks the user as logged in for this session.
 * The session gets a new id first: an id that someone else might have planted
 * in the browser before the login becomes useless ("session fixation").
 */
function setLoggedInUser(string $name): void
{
    startSession();
    session_regenerate_id(true);    // true = delete the old session data on the server
    $_SESSION['user'] = $name;
    unset($_SESSION['csrf']);       // a fresh CSRF token after every login
}

/**
 * Logs the user out: empties the session, deletes the cookie and ends the session.
 */
function logout(): void
{
    startSession();
    $_SESSION = [];

    // Delete the cookie in the browser: same name and settings, date in the past.
    $params = session_get_cookie_params();
    setcookie(session_name(), '', [
        'expires'  => time() - 3600,
        'path'     => $params['path'],
        'domain'   => $params['domain'],
        'secure'   => $params['secure'],
        'httponly' => $params['httponly'],
        'samesite' => $params['samesite'],
    ]);

    session_destroy();
}

/**
 * For pages that only logged-in users may see: returns the user name,
 * or sends the visitor to the login page (with a hint) and stops.
 */
function requireLogin(): string
{
    startSession();
    $name = currentUser();
    if ($name === null) {
        redirect('login.php?hinweis=anmelden');
    }
    return $name;
}


/* ---------------------------------------------------------------------------
   Output and requests
   --------------------------------------------------------------------------- */

/**
 * Escapes text for HTML ("h" for HTML): < > & " ' become harmless entities.
 * Every value that comes from a user or a file goes through h() before it is printed.
 */
function h($text): string
{
    return htmlspecialchars((string) $text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/**
 * Sends the browser to another page and stops the script.
 * Status 303 tells the browser to load the new page with GET, so reloading
 * it does not send the form a second time (pattern "Post/Redirect/Get").
 */
function redirect(string $target): void
{
    header('Location: ' . $target, true, 303);
    exit;
}

/**
 * Returns a text field of the sent form ($_POST), or '' if it is missing.
 * A crafted request could send an array instead of text; that also gives ''.
 */
function postValue(string $field): string
{
    $value = $_POST[$field] ?? '';
    if (is_string($value)) {
        return $value;
    }
    return '';
}

/**
 * True if the page was requested by sending a form (method POST).
 */
function isPost(): bool
{
    return ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';
}

/**
 * Path from the running page to the site root: '' for pages in the root
 * (login.php, meine-orte.php ...), '../' for scripts inside php/ (vorschlag.php).
 * php/kopf.php and php/fuss.php put it in front of every link and stylesheet.
 */
function basePath(): string
{
    // realpath() writes both folders the same way (also on Windows with its backslashes).
    $pageDir = realpath(dirname($_SERVER['SCRIPT_FILENAME'] ?? ''));
    $phpDir = realpath(__DIR__);
    if ($pageDir !== false && $pageDir === $phpDir) {
        return '../';
    }
    return '';
}

/**
 * Class for a form field with an error: ' field--error' or ''.
 * $errors is the list of error messages of the page (field name => message).
 */
function errorClass(array $errors, string $field): string
{
    return isset($errors[$field]) ? ' field--error' : '';
}

/**
 * Extra attributes for an <input>: aria-describedby links the hint below the label
 * (id "<field>-hinweis", only if $withHint) and, if the server found an error,
 * the error text (id "<field>-fehler"); aria-invalid="true" marks the field as wrong.
 * Screen readers then read hint and error together with the label.
 * The first field with an error also gets autofocus: after the page reloads, the cursor
 * is in that field (the $errors list is filled in the order of the form).
 * Example: errorAttributes($errors, 'passwort', true) gives
 *          ' aria-invalid="true" autofocus aria-describedby="passwort-hinweis passwort-fehler"'
 */
function errorAttributes(array $errors, string $field, bool $withHint = false): string
{
    $ids = [];
    $attributes = '';
    if ($withHint) {
        $ids[] = $field . '-hinweis';
    }
    if (isset($errors[$field])) {
        $ids[] = $field . '-fehler';
        $attributes = ' aria-invalid="true"';
        if (array_key_first($errors) === $field) {
            $attributes .= ' autofocus';
        }
    }
    if (count($ids) > 0) {
        $attributes .= ' aria-describedby="' . h(implode(' ', $ids)) . '"';
    }
    return $attributes;
}


/* ---------------------------------------------------------------------------
   JSON storage in daten/
   Reading:  readDataFile('benutzer.json') - takes care of the lock itself.
   Changing: $lock = lockData(LOCK_EX);  $data = readJson(...);
             if $data is null: unlockData($lock) and stop (never write then);
             change $data;  writeJson(..., $data);  unlockData($lock);
   If something fails, a line goes to the web server's error log (XAMPP:
   apache/logs/error_log), visitors only see ERROR_SAVE.
   --------------------------------------------------------------------------- */

/**
 * Full path of a file in daten/.
 */
function dataPath(string $file): string
{
    return DATA_DIR . '/' . $file;
}

/**
 * Waits until this request may use the data files and returns the open lock file,
 * or null if the lock file cannot be opened (e.g. daten/ is not writable).
 * $mode: LOCK_SH = shared (for reading; several requests at the same time) or
 *        LOCK_EX = exclusive (for changing; only this request).
 * We lock a separate file, not the data file itself, because writeJson()
 * replaces the data file by a new one; a lock on the old file would be lost.
 * Never call lockData() again before unlockData(): the second call would wait
 * for the first lock of the same request forever.
 * Return value: a file handle (a "resource"), to be passed to unlockData().
 */
function lockData(int $mode)
{
    // The @ hides PHP's own warning; we handle the failure ourselves (log line, return null).
    $handle = @fopen(dataPath(LOCK_FILE), 'c');   // 'c' = open, create if missing, do not empty it
    if ($handle === false) {
        error_log('Quadrate: cannot write in ' . DATA_DIR . ' - is the folder writable for the web server?');
        return null;
    }
    if (!flock($handle, $mode)) {                  // flock() waits until the lock is free
        fclose($handle);
        return null;
    }
    return $handle;
}

/**
 * Releases a lock from lockData().
 */
function unlockData($handle): void
{
    flock($handle, LOCK_UN);
    fclose($handle);
}

/**
 * Reads a JSON file from daten/ and returns its content as an array. Call it while holding a lock.
 *   []    the file does not exist yet or is empty: nothing is stored yet.
 *   null  the file exists but cannot be read, or it holds broken JSON (e.g. after a hand
 *         edit). null means: DO NOT WRITE. A writer that took this for "empty" would replace
 *         the file and delete every account, saved place or suggestion in it.
 */
function readJson(string $file): ?array
{
    $path = dataPath($file);
    if (!is_file($path)) {
        return [];                           // nothing stored yet
    }
    $text = @file_get_contents($path);
    if ($text === false) {
        error_log('Quadrate: cannot read ' . $path . ', nothing was written');
        return null;                         // cannot read: NOT the same as empty
    }
    if (trim($text) === '') {
        return [];
    }
    $data = json_decode($text, true);        // true = objects become PHP arrays
    if (!is_array($data)) {
        error_log('Quadrate: ' . $path . ' is not valid JSON, nothing was written');
        return null;                         // broken file: writing would delete its content
    }
    return $data;
}

/**
 * Writes an array as JSON into daten/. Returns true on success.
 * Atomic: the text goes into a temporary file first, then rename() replaces the
 * old file in one step. A reader sees either the old or the new file, never half of one.
 * Call it only while holding the exclusive lock (LOCK_EX).
 */
function writeJson(string $file, array $data): bool
{
    $path = dataPath($file);
    $temp = $path . '.tmp';

    $text = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($text === false) {
        return false;
    }
    // file_put_contents() returns the number of bytes written. On a full disk it can write
    // fewer bytes without returning false, so we compare with the length of the text.
    if (@file_put_contents($temp, $text) !== strlen($text)) {
        @unlink($temp);
        error_log('Quadrate: cannot write ' . $temp . ' - is ' . DATA_DIR . ' writable and the disk not full?');
        return false;
    }
    if (!@rename($temp, $path)) {
        @unlink($temp);
        error_log('Quadrate: cannot replace ' . $path . ' - is the folder writable for the web server?');
        return false;
    }
    return true;
}

/**
 * Reads a JSON file from daten/ under a shared lock (for pages that only read).
 * A broken file counts as empty here, because nothing is written afterwards.
 */
function readDataFile(string $file): array
{
    $lock = lockData(LOCK_SH);
    $data = readJson($file) ?? [];
    if ($lock !== null) {
        unlockData($lock);
    }
    return $data;
}


/* ---------------------------------------------------------------------------
   Validation
   --------------------------------------------------------------------------- */

/**
 * Prepares a typed user name: spaces at both ends removed, all lower case
 * ("Anna " becomes "anna"), so "Anna" and "anna" are the same account.
 */
function normalizeUsername(string $input): string
{
    return strtolower(trim($input));
}

/**
 * Checks a (normalised) user name. Returns '' if it is fine, else a German message.
 * Rule: 3 to 30 characters, only a-z, 0-9, underscore and hyphen.
 */
function usernameError(string $name): string
{
    // \z means "end of the text" (a plain $ would also accept a line break at the end).
    if (preg_match('/^[a-z0-9_-]{3,30}\z/', $name) !== 1) {
        return 'Der Benutzername braucht 3 bis 30 Zeichen: Kleinbuchstaben a bis z, Ziffern, _ oder -.';
    }
    return '';
}

/**
 * Checks a new password. Returns '' if it is fine, else a German message.
 * Rules: no NUL byte (password_hash() stops with an error on it; a normal keyboard cannot
 * type it, only a crafted request), at least PASSWORD_MIN characters (mb_strlen counts ä as
 * one character) and at most PASSWORD_MAX bytes (strlen counts ä as two bytes), because
 * bcrypt ignores everything after the 72nd byte.
 */
function passwordError(string $password): string
{
    if (str_contains($password, "\0")) {
        return 'Das Passwort enthält ein unerlaubtes Zeichen.';
    }
    if (mb_strlen($password, 'UTF-8') < PASSWORD_MIN) {
        return 'Das Passwort braucht mindestens ' . PASSWORD_MIN . ' Zeichen.';
    }
    if (strlen($password) > PASSWORD_MAX) {
        return 'Das Passwort darf höchstens ' . PASSWORD_MAX . ' Zeichen haben (Umlaute zählen doppelt).';
    }
    return '';
}


/* ---------------------------------------------------------------------------
   User accounts (daten/benutzer.json)
   Format: { "anna": { "hash": "$2y$10$...", "angelegt": "2026-10-13 10:15" }, ... }
   --------------------------------------------------------------------------- */

/**
 * Creates a new account. The name must already be checked (usernameError).
 * Returns '' on success, else a German message (name taken, file not writable).
 */
function createUser(string $name, string $password): string
{
    // Exclusive lock around "read, check, write": two people registering the
    // same name at the same moment cannot both succeed.
    $lock = lockData(LOCK_EX);
    if ($lock === null) {
        return ERROR_SAVE;
    }

    $users = readJson(USERS_FILE);
    if ($users === null) {
        unlockData($lock);                     // broken file: never overwrite it
        return ERROR_SAVE;
    }
    if (isset($users[$name])) {
        unlockData($lock);
        return 'Diesen Benutzernamen gibt es schon. Bitte wähle einen anderen.';
    }

    $users[$name] = [
        'hash'     => password_hash($password, PASSWORD_DEFAULT),   // salted hash, never the password
        'angelegt' => date('Y-m-d H:i'),
    ];
    $saved = writeJson(USERS_FILE, $users);
    unlockData($lock);

    if ($saved) {
        return '';
    }
    return ERROR_SAVE;
}

/**
 * Checks user name and password. On success the user is logged in (new
 * session id) and the function returns true; otherwise it returns false.
 */
function loginUser(string $name, string $password): bool
{
    $users = readDataFile(USERS_FILE);
    if (!isset($users[$name]['hash'])) {
        return false;
    }
    // password_verify() hashes the typed password the same way and compares.
    if (!password_verify($password, $users[$name]['hash'])) {
        return false;
    }
    setLoggedInUser($name);
    return true;
}


/* ---------------------------------------------------------------------------
   CSRF protection
   Another website could make the browser of a logged-in user send one of our
   forms. To prevent this, every form carries a secret token from the session;
   a request without the right token is refused.
   --------------------------------------------------------------------------- */

/**
 * Returns the CSRF token of this session and creates it on first use.
 */
function csrfToken(): string
{
    startSession();
    if (empty($_SESSION['csrf']) || !is_string($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));   // 64 random hex characters
    }
    return $_SESSION['csrf'];
}

/**
 * Hidden form field with the token, to be printed inside every <form method="post">.
 */
function csrfField(): string
{
    return '<input type="hidden" name="token" value="' . h(csrfToken()) . '">';
}

/**
 * True if the sent token matches the token of the session.
 * hash_equals() compares in constant time, so the answer time reveals nothing.
 */
function isCsrfValid($token): bool
{
    if (!is_string($token) || !isset($_SESSION['csrf']) || !is_string($_SESSION['csrf'])) {
        return false;
    }
    return hash_equals($_SESSION['csrf'], $token);
}


/* ---------------------------------------------------------------------------
   Place data from js/data/ (read on the server)
   --------------------------------------------------------------------------- */

/**
 * Reads a data file from js/data/ and returns the value of one variable as an array.
 * Example: readJsData('orte.js', 'window.ORTE') returns the list of places.
 * The files are JavaScript: window.ORTE = [ { "id": "n1", "name": "..." }, ... ];
 * Their values are written as JSON (keys in quotes), so two steps are enough:
 *   1. cut out the value: from the bracket after "window.ORTE = " to the last
 *      closing bracket of the file (the value is the last thing in the file),
 *   2. json_decode().
 * Returns [] if the file is missing or cannot be read.
 */
function readJsData(string $file, string $variable): array
{
    $text = @file_get_contents(dirname(__DIR__) . '/js/data/' . $file);
    if ($text === false) {
        return [];
    }

    // Step 1. The search text includes " = ", so "window.ORTE" does not find "window.ORTE_META".
    $needle = $variable . ' = ';
    $start = strpos($text, $needle);
    if ($start === false) {
        return [];
    }
    $valueStart = $start + strlen($needle);        // position of "[" or "{"
    if ($valueStart >= strlen($text)) {
        return [];
    }
    $closingBracket = ($text[$valueStart] === '[') ? ']' : '}';
    $end = strrpos($text, $closingBracket);
    if ($end === false || $end < $valueStart) {
        return [];
    }
    $json = substr($text, $valueStart, $end - $valueStart + 1);

    // Step 2.
    $data = json_decode($json, true);
    if (is_array($data)) {
        return $data;
    }
    return [];
}

/**
 * All places from js/data/orte.js, with their id as key:
 * [ "n283313010" => [ "id" => ..., "name" => ..., "kat" => ..., "quadrat" => ..., "adresse" => ... ], ... ]
 * The file is read only once per request.
 */
function placesById(): array
{
    static $places = null;    // "static" keeps the value between calls in the same request
    if ($places === null) {
        $places = [];
        foreach (readJsData('orte.js', 'window.ORTE') as $place) {
            if (isset($place['id']) && is_string($place['id'])) {
                $places[$place['id']] = $place;
            }
        }
    }
    return $places;
}

/**
 * All Quadrate from js/data/quadrate.js: [ "G1" => [ "name" => "Marktplatz", ... ], ... ].
 */
function loadBlocks(): array
{
    static $blocks = null;
    if ($blocks === null) {
        $blocks = readJsData('quadrate.js', 'window.QUADRATE');
    }
    return $blocks;
}

/**
 * True if $id is the id of a place in js/data/orte.js.
 */
function isValidPlaceId($id): bool
{
    if (!is_string($id)) {
        return false;
    }
    // isset() only accepts variables, so the list is stored in $places first.
    $places = placesById();
    return isset($places[$id]);
}


/* ---------------------------------------------------------------------------
   Saved places (daten/merkliste.json)
   Format: { "anna": [ "n283313010", "w123456" ], ... }
   --------------------------------------------------------------------------- */

/**
 * Ids of the places a user has saved (in the order they were saved).
 */
function savedPlaceIds(string $name): array
{
    $all = readDataFile(SAVED_PLACES_FILE);
    if (isset($all[$name]) && is_array($all[$name])) {
        return array_values($all[$name]);
    }
    return [];
}

/**
 * Adds a place to the list of a user or removes it.
 * $add: true = add ("merken"), false = remove ("entfernen").
 * Returns the new list, or null if the file could not be read or written.
 */
function changeSavedPlaces(string $name, string $id, bool $add): ?array
{
    $lock = lockData(LOCK_EX);
    if ($lock === null) {
        return null;
    }

    $all = readJson(SAVED_PLACES_FILE);
    if ($all === null) {
        unlockData($lock);                     // broken file: never overwrite it
        return null;
    }
    $list = [];
    if (isset($all[$name]) && is_array($all[$name])) {
        $list = $all[$name];
    }

    if ($add) {
        if (!in_array($id, $list, true)) {     // every place only once
            $list[] = $id;
        }
    } else {
        $list = array_diff($list, [$id]);
    }
    // array_values() numbers the list again from 0; otherwise json_encode would
    // write an object {"0": ..., "2": ...} instead of a list after a removal.
    $list = array_values($list);

    if (count($list) === 0) {
        unset($all[$name]);                    // no empty lists in the file
    } else {
        $all[$name] = $list;
    }

    $saved = writeJson(SAVED_PLACES_FILE, $all);
    unlockData($lock);

    if ($saved) {
        return $list;
    }
    return null;
}

/**
 * Saves a place for a user. Returns the new list or null (see changeSavedPlaces).
 */
function savePlace(string $name, string $id): ?array
{
    return changeSavedPlaces($name, $id, true);
}

/**
 * Removes a place from the list of a user. Returns the new list or null.
 */
function removePlace(string $name, string $id): ?array
{
    return changeSavedPlaces($name, $id, false);
}


/* ---------------------------------------------------------------------------
   Start
   --------------------------------------------------------------------------- */

// Resume an existing session automatically when the browser sends our cookie.
// A new session (and with it a cookie) is only created by pages that need one:
// the login and registration forms call startSession() themselves. So a visitor
// who never logs in gets no cookie at all, not even from php/merken.php.
if (isset($_COOKIE[SESSION_NAME])) {
    startSession();
}
