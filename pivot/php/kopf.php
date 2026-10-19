<?php
/*
 * php/kopf.php - start of every PHP page: <head>, header with logo and main navigation.  [V3]
 *
 * Purpose: the PHP pages show the same frame as the static pages (copied from
 * docs/_vorlage.html). Only the account link at the end of the navigation depends
 * on the session:
 *   logged in:      "Meine Orte" (meine-orte.php) and "Abmelden" (logout.php)
 *   not logged in:  "Anmelden" (login.php)
 *
 * How to use it (the page has included php/lib.php first and done its work,
 * because redirects and cookies must be sent before any HTML):
 *     pageHeader('Anmelden', 'anmelden', ['css/konto.css']);
 *     ... content of <main> ...
 *     pageFooter();                                  (php/fuss.php)
 *
 * Every link gets basePath() in front, so the same frame also works for scripts
 * inside php/ (php/vorschlag.php): there the links start with "../".
 * The keys of the navigation links ('karte', 'anmelden' ...) are plain words, not code names.
 */

require_once __DIR__ . '/lib.php';

/**
 * Returns one link of the main navigation as HTML. The link of the current page
 * gets aria-current="page": css/style.css draws a sand strip under it, and
 * screen readers announce "aktuelle Seite".
 * $target: file in the site root, $key: key of this link, $activeKey: key of the current page.
 */
function navLink(string $target, string $text, string $key, string $activeKey): string
{
    $currentAttribute = '';
    if ($key === $activeKey) {
        $currentAttribute = ' aria-current="page"';
    }
    return '<a href="' . h(basePath() . $target) . '"' . $currentAttribute . '>' . h($text) . '</a>';
}

/**
 * Prints the start of a page, from <!DOCTYPE html> to the opening <main> tag.
 * $title:       page name; the <title> becomes "Anmelden – Quadrate"
 * $activeKey:   key of the navigation link to mark: 'karte', 'quadrate', 'vorschlagen',
 *               'ueber-uns', 'anmelden', 'meine-orte', 'abmelden', or '' for none
 * $stylesheets: extra CSS files, relative to the site root, e.g. ['css/konto.css']
 */
function pageHeader(string $title, string $activeKey = '', array $stylesheets = []): void
{
    $base = basePath();
    $user = currentUser();
    ?>
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= h($title) ?> – Quadrate</title>
  <!-- [V3] PHP pages (account pages and the answers to the form) should not be listed by search engines -->
  <meta name="robots" content="noindex">
  <link rel="icon" href="<?= h($base) ?>img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="<?= h($base) ?>css/style.css">
<?php foreach ($stylesheets as $file) : ?>
  <link rel="stylesheet" href="<?= h($base . $file) ?>">
<?php endforeach; ?>
</head>
<body>
  <!-- Skip link: first element on the page, lets keyboard users jump over the navigation. -->
  <a class="skip-link" href="#inhalt">Zum Inhalt springen</a>

  <header class="site-header">
    <div class="site-header__inner container">
      <a class="site-logo" href="<?= h($base) ?>index.html">
        <img src="<?= h($base) ?>img/logo.svg" alt="Quadrate – zur Karte" width="200" height="33">
      </a>

      <nav class="site-nav" aria-label="Hauptnavigation">
        <ul class="site-nav__list">
          <li><?= navLink('index.html', 'Karte', 'karte', $activeKey) ?></li>
          <li><?= navLink('quadrate.html', 'Quadrate', 'quadrate', $activeKey) ?></li>
          <li><?= navLink('vorschlagen.html', 'Ort vorschlagen', 'vorschlagen', $activeKey) ?></li>
          <li><?= navLink('ueber-uns.html', 'Über uns', 'ueber-uns', $activeKey) ?></li>
<?php if ($user !== null) : ?>
          <!-- [V3] account links while a user is logged in -->
          <li class="site-nav__item--account"><?= navLink('meine-orte.php', 'Meine Orte', 'meine-orte', $activeKey) ?></li>
          <li><?= navLink('logout.php', 'Abmelden', 'abmelden', $activeKey) ?></li>
<?php else : ?>
          <!-- [V3] account link while nobody is logged in -->
          <li class="site-nav__item--account"><?= navLink('login.php', 'Anmelden', 'anmelden', $activeKey) ?></li>
<?php endif; ?>
        </ul>
      </nav>
    </div>
  </header>

  <main id="inhalt" class="container">
<?php
}
