<?php
/*
 * registrieren.php - create an account ("Registrieren").                              [V3]
 *
 * How it works:
 *   GET   shows the form: user name, password, password again.
 *   POST  checks the CSRF token and the rules from php/lib.php (user name 3 to 30
 *         characters a-z 0-9 _ -, password 8 characters to 72 bytes, both passwords the
 *         same). Then createUser() stores the name with a password hash and the date in
 *         daten/benutzer.json. Success: the new user is logged in right away and
 *         goes to meine-orte.php. Errors appear below the field they belong to, with
 *         the HTTP status 400 (field rules), 409 (name taken), 403 (wrong token) or
 *         500 (file not writable).
 * The browser checks the same rules before sending (required, minlength, pattern);
 * the server checks again, because a request can also be sent without the form.
 * How it fits in: page frame from php/kopf.php and php/fuss.php, styles in css/konto.css.
 */

require_once __DIR__ . '/php/lib.php';
require_once __DIR__ . '/php/kopf.php';
require_once __DIR__ . '/php/fuss.php';

startSession();      // the form needs a session for its CSRF token

// Already logged in: no second account needed.
if (currentUser() !== null) {
    redirect('meine-orte.php');
}

$name = '';          // typed user name, shown again in the form (never the passwords)
$errors = [];        // field name => message shown below that field (in the order of the form)
$message = '';       // message above the form

if (isPost()) {
    $name = normalizeUsername(postValue('benutzername'));
    $password = postValue('passwort');
    $passwordRepeat = postValue('passwort2');

    if (!isCsrfValid(postValue('token'))) {
        http_response_code(403);   // 403 = "Forbidden": the token is missing or wrong
        $message = ERROR_TOKEN;
    } else {
        $text = usernameError($name);
        if ($text !== '') {
            $errors['benutzername'] = $text;
        }

        $text = passwordError($password);
        if ($text !== '') {
            $errors['passwort'] = $text;
        } elseif ($password !== $passwordRepeat) {
            $errors['passwort2'] = 'Die beiden Passwörter sind verschieden. Bitte gib das Passwort noch einmal ein.';
        }

        if (count($errors) > 0) {
            http_response_code(400);   // 400 = "Bad Request": the fields break the rules
        } else {
            $text = createUser($name, $password);
            if ($text === '') {
                setLoggedInUser($name);
                redirect('meine-orte.php?hinweis=neu');
            }
            // Two possible problems: the file could not be written (message above
            // the form) or the name is taken (message below the name field).
            if ($text === ERROR_SAVE) {
                http_response_code(500);   // 500 = "Internal Server Error": our side failed
                $message = $text;
            } else {
                http_response_code(409);   // 409 = "Conflict": the name exists already
                $errors['benutzername'] = $text;
            }
        }
    }
}

pageHeader('Registrieren', '', ['css/konto.css']);
?>
    <div class="page-intro">
      <h1>Registrieren</h1>
      <p class="lead">Ein Konto ist kostenlos und braucht keine E-Mail-Adresse. Danach kannst du Orte auf der Karte merken.</p>
    </div>

    <div class="account-layout">
      <section class="panel account-panel" aria-labelledby="formular-titel">
        <h2 class="account-panel__title" id="formular-titel">Neues Konto anlegen</h2>

<?php if ($message !== '') : ?>
        <div class="notice notice--error" role="alert">
          <p class="notice__title">Konto nicht angelegt</p>
          <p><?= h($message) ?></p>
        </div>
<?php elseif (count($errors) > 0) : ?>
        <div class="notice notice--error" role="alert">
          <p class="notice__title">Konto nicht angelegt</p>
          <p>Bitte korrigiere die markierten Felder.</p>
        </div>
<?php endif; ?>

        <form class="form" method="post" action="registrieren.php">
          <?= csrfField() ?>

          <div class="field<?= errorClass($errors, 'benutzername') ?>">
            <label class="field__label" for="benutzername">Benutzername</label>
            <p class="field__hint" id="benutzername-hinweis">3 bis 30 Zeichen: Kleinbuchstaben a bis z, Ziffern, _ oder -</p>
            <!-- pattern: the same rule as usernameError() in php/lib.php; "\-" is a hyphen -->
            <input id="benutzername" name="benutzername" type="text" required minlength="3" maxlength="30"
                   pattern="[a-z0-9_\-]{3,30}" autocomplete="username" autocapitalize="none" spellcheck="false"
                   value="<?= h($name) ?>"<?= errorAttributes($errors, 'benutzername', true) ?>>
            <p class="field__error" id="benutzername-fehler"><?= h($errors['benutzername'] ?? 'Bitte wähle einen Benutzernamen mit 3 bis 30 Zeichen: Kleinbuchstaben a bis z, Ziffern, _ oder -.') ?></p>
          </div>

          <div class="field<?= errorClass($errors, 'passwort') ?>">
            <label class="field__label" for="passwort">Passwort</label>
            <p class="field__hint" id="passwort-hinweis">Mindestens <?= PASSWORD_MIN ?>, höchstens <?= PASSWORD_MAX ?> Zeichen (Umlaute zählen doppelt). Ein kurzer Satz ist leichter zu merken als ein einzelnes Wort.</p>
            <!-- maxlength: bcrypt (password_hash) only uses the first 72 bytes of a password -->
            <input id="passwort" name="passwort" type="password" required minlength="<?= PASSWORD_MIN ?>"
                   maxlength="<?= PASSWORD_MAX ?>" autocomplete="new-password"<?= errorAttributes($errors, 'passwort', true) ?>>
            <p class="field__error" id="passwort-fehler"><?= h($errors['passwort'] ?? 'Das Passwort braucht mindestens ' . PASSWORD_MIN . ' Zeichen.') ?></p>
          </div>

          <div class="field<?= errorClass($errors, 'passwort2') ?>">
            <label class="field__label" for="passwort2">Passwort wiederholen</label>
            <input id="passwort2" name="passwort2" type="password" required maxlength="<?= PASSWORD_MAX ?>"
                   autocomplete="new-password"<?= errorAttributes($errors, 'passwort2') ?>>
            <p class="field__error" id="passwort2-fehler"><?= h($errors['passwort2'] ?? 'Bitte gib das Passwort noch einmal ein.') ?></p>
          </div>

          <div class="button-row">
            <button class="button" type="submit">Konto anlegen</button>
          </div>
        </form>

        <p class="account-switch">Schon registriert? <a href="login.php">Zur Anmeldung</a></p>
      </section>

      <aside class="account-info" aria-labelledby="info-titel">
        <h2 class="account-info__title" id="info-titel">Was wir speichern</h2>
        <ul class="account-info__list">
          <li>
            <span class="account-info__icon" aria-hidden="true">
              <svg class="account-info__person" viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="5" r="3"/><path d="M2 15c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5z"/></svg>
            </span>
            <span>Deinen Benutzernamen. Er erscheint nur für dich, oben auf der Seite Meine Orte.</span>
          </li>
          <li>
            <span class="account-info__icon" aria-hidden="true">
              <svg class="account-info__lock" viewBox="0 0 16 16" width="16" height="16"><rect x="2.5" y="7" width="11" height="8" rx="1"/><path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <span>Einen Prüfwert (Hash) deines Passworts. Das Passwort selbst wird nirgends gespeichert.</span>
          </li>
          <li>
            <span class="account-info__icon" aria-hidden="true">
              <svg class="account-info__clock" viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 4v4.5l3 1.8" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <span>Datum und Uhrzeit der Registrierung.</span>
          </li>
          <li>
            <span class="account-info__icon" aria-hidden="true"><span class="swatch swatch--pin"></span></span>
            <span>Die Orte, die du merkst. Keine E-Mail-Adresse, kein Tracking. <a href="datenschutz.html">Mehr zum Datenschutz</a></span>
          </li>
        </ul>
      </aside>
    </div>
<?php
pageFooter();
