<?php
/*
 * logout.php - log out ("Abmelden").                                                  [V3]
 *
 * How it works:
 *   GET   asks "Möchtest du dich abmelden?" with a button. Logging out only happens
 *         through this form (POST with CSRF token), so a link or image on another
 *         website cannot log the user out.
 *   POST  checks the token, ends the session (logout() in php/lib.php) and sends
 *         the browser to login.php?hinweis=abgemeldet. A wrong token gives status 403.
 * Nobody logged in: straight to login.php.
 * How it fits in: the navigation shows "Abmelden" (php/kopf.php) while a user is logged in.
 */

require_once __DIR__ . '/php/lib.php';
require_once __DIR__ . '/php/kopf.php';
require_once __DIR__ . '/php/fuss.php';

$user = currentUser();
if ($user === null) {
    redirect('login.php');
}

$message = '';       // message above the form

if (isPost()) {
    if (isCsrfValid(postValue('token'))) {
        logout();
        redirect('login.php?hinweis=abgemeldet');
    }
    http_response_code(403);   // 403 = "Forbidden": the token is missing or wrong
    $message = ERROR_TOKEN;
}

pageHeader('Abmelden', 'abmelden', ['css/konto.css']);
?>
    <div class="page-intro">
      <h1>Abmelden</h1>
    </div>

    <section class="panel account-panel account-panel--single" aria-labelledby="frage">
<?php if ($message !== '') : ?>
      <div class="notice notice--error" role="alert">
        <p class="notice__title">Nicht abgemeldet</p>
        <p><?= h($message) ?></p>
      </div>
<?php endif; ?>
      <h2 class="account-panel__title" id="frage">Möchtest du dich abmelden?</h2>
      <p>Du bist angemeldet als <strong><?= h($user) ?></strong>. Deine gemerkten Orte bleiben gespeichert und sind nach der nächsten Anmeldung wieder da.</p>

      <form method="post" action="logout.php">
        <?= csrfField() ?>
        <div class="button-row">
          <button class="button" type="submit">Abmelden</button>
          <a class="button button--secondary" href="meine-orte.php">Zurück zu meinen Orten</a>
        </div>
      </form>
    </section>
<?php
pageFooter();
