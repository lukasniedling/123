<?php
/*
 * login.php - log in with user name and password ("Anmelden").                        [V3]
 *
 * How it works:
 *   GET   shows the form; after logging out, or when meine-orte.php needed a login,
 *         a short hint appears above it (?hinweis=abgemeldet or ?hinweis=anmelden).
 *   POST  checks the CSRF token, then user name and password (loginUser() in php/lib.php).
 *         Success: the session gets a new id, the browser goes to meine-orte.php.
 *         Failure: a one-second pause (slows down automatic password guessing), then
 *         the form again with a message and HTTP status 400 (403 for a wrong token).
 *         The message does not say which of the two was wrong. (Whether a name is
 *         taken can still be seen on registrieren.php; a site without e-mail
 *         addresses cannot avoid that.)
 * How it fits in: page frame from php/kopf.php and php/fuss.php, page styles in
 * css/konto.css, accounts in daten/benutzer.json. Link to registrieren.php.
 */

require_once __DIR__ . '/php/lib.php';
require_once __DIR__ . '/php/kopf.php';
require_once __DIR__ . '/php/fuss.php';

startSession();      // the form needs a session for its CSRF token

// Already logged in: nothing to do here, go to the saved places.
if (currentUser() !== null) {
    redirect('meine-orte.php');
}

$name = '';          // typed user name, shown again in the form (never the password)
$errors = [];        // field name => message shown below that field
$message = '';       // message above the form

if (isPost()) {
    $name = normalizeUsername(postValue('benutzername'));
    $password = postValue('passwort');

    if (!isCsrfValid(postValue('token'))) {
        http_response_code(403);   // 403 = "Forbidden": the token is missing or wrong
        $message = ERROR_TOKEN;
    } else {
        if ($name === '') {
            $errors['benutzername'] = 'Bitte gib deinen Benutzernamen ein.';
        }
        if ($password === '') {
            $errors['passwort'] = 'Bitte gib dein Passwort ein.';
        }
        if (count($errors) === 0) {
            if (loginUser($name, $password)) {
                redirect('meine-orte.php');
            }
            sleep(1);    // wait one second after every wrong attempt
            $message = 'Benutzername oder Passwort stimmt nicht. Bitte prüfe beide Angaben.';
        }
        http_response_code(400);   // 400 = "Bad Request": empty fields or wrong name/password
    }
}

// Hint from the address, e.g. login.php?hinweis=abgemeldet. Only fixed words are
// compared; the value itself is never printed.
$hint = $_GET['hinweis'] ?? '';

pageHeader('Anmelden', 'anmelden', ['css/konto.css']);
?>
    <div class="page-intro">
      <h1>Anmelden</h1>
      <p class="lead">Mit einem Konto merkst du dir Orte aus dem Steckbrief. Quadrate mit gemerkten Orten bekommen auf der Karte eine Markierung.</p>
    </div>

    <div class="account-layout">
      <section class="panel account-panel" aria-labelledby="formular-titel">
        <h2 class="account-panel__title" id="formular-titel">Mit deinem Konto anmelden</h2>

<?php if ($hint === 'abgemeldet' && !isPost()) : ?>
        <div class="notice notice--success" role="status">
          <p class="notice__title">Abgemeldet</p>
          <p>Du bist jetzt abgemeldet. Bis bald!</p>
        </div>
<?php elseif ($hint === 'anmelden' && !isPost()) : ?>
        <div class="notice notice--info" role="status">
          <p class="notice__title">Bitte zuerst anmelden</p>
          <p>Deine gemerkten Orte siehst du, sobald du angemeldet bist.</p>
        </div>
<?php endif; ?>

<?php if ($message !== '') : ?>
        <div class="notice notice--error" role="alert">
          <p class="notice__title">Anmeldung nicht möglich</p>
          <p><?= h($message) ?></p>
        </div>
<?php endif; ?>

        <form class="form" method="post" action="login.php">
          <?= csrfField() ?>

          <div class="field<?= errorClass($errors, 'benutzername') ?>">
            <label class="field__label" for="benutzername">Benutzername</label>
            <input id="benutzername" name="benutzername" type="text" required maxlength="30"
                   autocomplete="username" autocapitalize="none" spellcheck="false"
                   value="<?= h($name) ?>"<?= errorAttributes($errors, 'benutzername') ?>>
            <p class="field__error" id="benutzername-fehler"><?= h($errors['benutzername'] ?? 'Bitte gib deinen Benutzernamen ein.') ?></p>
          </div>

          <div class="field<?= errorClass($errors, 'passwort') ?>">
            <label class="field__label" for="passwort">Passwort</label>
            <input id="passwort" name="passwort" type="password" required
                   autocomplete="current-password"<?= errorAttributes($errors, 'passwort') ?>>
            <p class="field__error" id="passwort-fehler"><?= h($errors['passwort'] ?? 'Bitte gib dein Passwort ein.') ?></p>
          </div>

          <div class="button-row">
            <button class="button" type="submit">Anmelden</button>
          </div>
        </form>

        <p class="account-switch">Noch kein Konto? <a href="registrieren.php">Jetzt registrieren</a></p>
      </section>

      <aside class="account-info" aria-labelledby="info-titel">
        <h2 class="account-info__title" id="info-titel">Was dein Konto kann</h2>
        <ul class="account-info__list">
          <li>
            <span class="account-info__icon" aria-hidden="true"><span class="swatch swatch--pin"></span></span>
            <span>Gemerkte Orte markieren ihr Quadrat auf der Karte mit einer Stecknadel.</span>
          </li>
          <li>
            <span class="account-info__icon" aria-hidden="true"><span class="block-code">G1</span></span>
            <span>Unter Meine Orte stehen alle gemerkten Orte, geordnet nach Quadrat.</span>
          </li>
          <li>
            <span class="account-info__icon" aria-hidden="true">
              <svg class="account-info__lock" viewBox="0 0 16 16" width="16" height="16"><rect x="2.5" y="7" width="11" height="8" rx="1"/><path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
            </span>
            <span>Gespeichert werden nur dein Benutzername, ein Prüfwert deines Passworts, der Zeitpunkt der Registrierung und deine gemerkten Orte. <a href="datenschutz.html">Mehr zum Datenschutz</a></span>
          </li>
        </ul>
      </aside>
    </div>
<?php
pageFooter();
