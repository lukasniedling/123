<?php
/*
 * meine-orte.php - the saved places of the logged-in user ("Meine Orte").              [V3]
 *
 * How it works:
 *   - Only for logged-in users; everybody else goes to login.php (requireLogin()).
 *   - The ids of the saved places come from daten/merkliste.json. Name, category,
 *     address and Quadrat of each place come from js/data/orte.js, which PHP reads on
 *     the server (placesById() in php/lib.php); the names of the Quadrate come from
 *     js/data/quadrate.js (loadBlocks()).
 *   - The places are grouped by Quadrat (A1, A2 ... U6) and sorted by name. Each group
 *     links to index.html#CODE, where the map opens the profile of that Quadrat.
 *   - "Entfernen" is a small form per place (POST with CSRF token). After removing,
 *     the page loads itself again with GET (Post/Redirect/Get). A wrong token gives
 *     status 403, a file that cannot be written status 500.
 *   - Saved ids that are no longer in orte.js (after a data update) are listed in
 *     their own group, so they can still be removed.
 *   - No saved places: a short explanation and a link to the map.
 * Places are saved on the map page (index.html) through js/merkliste.js and php/merken.php.
 */

require_once __DIR__ . '/php/lib.php';
require_once __DIR__ . '/php/kopf.php';
require_once __DIR__ . '/php/fuss.php';

$user = requireLogin();

/**
 * Returns a number with the right word: 1 Ort, 2 Orte, 1 Quadrat, 3 Quadraten.
 */
function withCount(int $number, string $singular, string $plural): string
{
    if ($number === 1) {
        return '1 ' . $singular;
    }
    return $number . ' ' . $plural;
}

/**
 * Compares two places by name, for usort(). strnatcasecmp ignores upper and
 * lower case and sorts numbers naturally ("Café 2" before "Café 10").
 */
function comparePlaces(array $a, array $b): int
{
    return strnatcasecmp((string) ($a['name'] ?? ''), (string) ($b['name'] ?? ''));
}

$message = '';       // error message above the list

// Remove a place (the form of each list entry sends aktion=entfernen and the id).
if (isPost()) {
    if (!isCsrfValid(postValue('token'))) {
        http_response_code(403);   // 403 = "Forbidden": the token is missing or wrong
        $message = ERROR_TOKEN;
    } elseif (postValue('aktion') === 'entfernen') {
        $newList = removePlace($user, postValue('id'));
        if ($newList === null) {
            http_response_code(500);   // 500 = "Internal Server Error": the file could not be written
            $message = ERROR_SAVE;
        } else {
            redirect('meine-orte.php?hinweis=entfernt');
        }
    }
}

// Group the saved places by Quadrat.
$places = placesById();
$blocks = loadBlocks();
$groups = [];        // Quadrat code => list of places, e.g. "G1" => [ place, place ]
$unknownIds = [];    // saved ids that are not in js/data/orte.js any more
$savedCount = 0;     // number of saved places

foreach (savedPlaceIds($user) as $id) {
    if (!is_string($id)) {
        continue;    // skip anything that is not an id (only possible if the file was edited by hand)
    }
    $savedCount++;
    if (isset($places[$id])) {
        $place = $places[$id];
        $groups[(string) ($place['quadrat'] ?? '')][] = $place;
    } else {
        $unknownIds[] = $id;
    }
}

uksort($groups, 'strnatcmp');           // A1, A2 ... L9, L10 ... U6 (numbers in natural order)
foreach ($groups as $code => $list) {
    usort($list, 'comparePlaces');      // the name of the compare function is passed as text
    $groups[$code] = $list;
}

$hint = $_GET['hinweis'] ?? '';         // only compared with fixed words, never printed

pageHeader('Meine Orte', 'meine-orte', ['css/konto.css']);
?>
    <div class="page-intro">
      <h1>Meine Orte</h1>
      <p class="lead">Angemeldet als <strong><?= h($user) ?></strong>. Hier stehen alle Orte, die du auf der Karte gemerkt hast, geordnet nach Quadrat.</p>
    </div>

<?php if ($message !== '') : ?>
    <div class="notice notice--error account-message" role="alert">
      <p class="notice__title">Nicht gespeichert</p>
      <p><?= h($message) ?></p>
    </div>
<?php elseif ($hint === 'neu' && !isPost()) : ?>
    <div class="notice notice--success account-message" role="status">
      <p class="notice__title">Willkommen!</p>
      <p>Dein Konto ist angelegt und du bist angemeldet. Auf der Karte kannst du jetzt Orte merken.</p>
    </div>
<?php elseif ($hint === 'entfernt' && !isPost()) : ?>
    <div class="notice notice--success account-message" role="status">
      <p class="notice__title">Entfernt</p>
      <p>Der Ort steht nicht mehr auf deiner Liste.</p>
    </div>
<?php endif; ?>

<?php if ($savedCount === 0) : ?>
    <!-- Empty state: nothing saved yet -->
    <section class="panel saved-empty" aria-labelledby="leer-titel">
      <span class="block-tile block-tile--empty" aria-hidden="true">–</span>
      <div class="saved-empty__text">
        <h2 id="leer-titel">Noch keine Orte gemerkt</h2>
        <p>Wähle auf der Karte ein Quadrat. Im Steckbrief steht bei jedem Ort der Knopf Merken. Gemerkte Orte erscheinen hier, und ihr Quadrat bekommt auf der Karte eine Stecknadel.</p>
        <a class="button" href="index.html">Zur Karte</a>
      </div>
    </section>
<?php else : ?>
<?php if (count($groups) > 0) : ?>
    <!-- Only places that are still in the data count here; unknown ones have their own group below. -->
    <p class="saved-summary"><?= h(withCount($savedCount - count($unknownIds), 'Ort', 'Orte')) ?> in <?= h(withCount(count($groups), 'Quadrat', 'Quadraten')) ?> gemerkt</p>
<?php endif; ?>

    <div class="saved-groups">
<?php foreach ($groups as $code => $list) : ?>
<?php
    // Name of the Quadrat, e.g. "Marktplatz" for G1 (most Quadrate have none).
    $blockName = $blocks[$code]['name'] ?? null;
?>
      <section class="panel saved-group" aria-labelledby="quadrat-<?= h($code) ?>">
        <div class="saved-group__head">
          <h2 class="saved-group__title" id="quadrat-<?= h($code) ?>">
            <span class="visually-hidden">Quadrat</span>
            <span class="block-code"><?= h($code) ?></span>
<?php if (is_string($blockName) && $blockName !== '') : ?>
            <span><?= h($blockName) ?></span>
<?php endif; ?>
            <span class="saved-group__count"><?= h(withCount(count($list), 'Ort', 'Orte')) ?></span>
          </h2>
          <a class="saved-group__map-link" href="index.html#<?= h($code) ?>">Auf der Karte zeigen<span class="visually-hidden">: Quadrat <?= h($code) ?></span></a>
        </div>

        <ul class="place-list">
<?php foreach ($list as $place) : ?>
<?php
        // German name of the category ("essen" -> "Essen"); an unknown key is shown as it is.
        $category = (string) ($place['kat'] ?? '');
        $categoryName = array_key_exists($category, CATEGORY_NAMES) ? CATEGORY_NAMES[$category] : $category;
?>
          <li class="place">
            <div>
              <span class="place__name"><?= h($place['name'] ?? '') ?></span>
              <span class="place__type saved-place__details">
                <span class="saved-place__category cat-<?= h($category) ?>"><span class="swatch swatch--l3" aria-hidden="true"></span><?= h($categoryName) ?></span>
<?php if (!empty($place['adresse'])) : ?>
                <span><?= h($place['adresse']) ?></span>
<?php endif; ?>
              </span>
            </div>
            <div class="place__status">
              <form class="saved-place__form" method="post" action="meine-orte.php">
                <?= csrfField() ?>
                <input type="hidden" name="aktion" value="entfernen">
                <input type="hidden" name="id" value="<?= h($place['id']) ?>">
                <button class="button button--small button--secondary" type="submit">Entfernen<span class="visually-hidden">: <?= h($place['name'] ?? '') ?></span></button>
              </form>
            </div>
          </li>
<?php endforeach; ?>
        </ul>
      </section>
<?php endforeach; ?>

<?php if (count($unknownIds) > 0) : ?>
      <!-- Saved ids that the current data (js/data/orte.js) does not contain any more -->
      <section class="panel saved-group" aria-labelledby="quadrat-unbekannt">
        <div class="saved-group__head">
          <h2 class="saved-group__title" id="quadrat-unbekannt">Nicht mehr in den Daten</h2>
        </div>
        <p class="saved-group__text">Diese Orte stehen nicht mehr in den aktuellen OpenStreetMap-Daten, zum Beispiel weil sie geschlossen haben. Du kannst sie entfernen.</p>
        <ul class="place-list">
<?php foreach ($unknownIds as $id) : ?>
          <li class="place">
            <div>
              <span class="place__name">Unbekannter Ort</span>
              <span class="place__type">Kennung <span class="mono"><?= h($id) ?></span></span>
            </div>
            <div class="place__status">
              <form class="saved-place__form" method="post" action="meine-orte.php">
                <?= csrfField() ?>
                <input type="hidden" name="aktion" value="entfernen">
                <input type="hidden" name="id" value="<?= h($id) ?>">
                <button class="button button--small button--secondary" type="submit">Entfernen<span class="visually-hidden">: Unbekannter Ort <?= h($id) ?></span></button>
              </form>
            </div>
          </li>
<?php endforeach; ?>
        </ul>
      </section>
<?php endif; ?>
    </div>
<?php endif; ?>
<?php
pageFooter();
