<?php
/*
 * php/merken.php - JSON interface for saved places ("Merkliste").                    [V3]
 *
 * js/merkliste.js on the map page talks to this script with fetch():
 *
 *   GET  php/merken.php
 *        200 { "angemeldet": true,  "name": "anna", "orte": ["n283313010", ...], "token": "3f9a..." }
 *        200 { "angemeldet": false, "name": null,   "orte": [],                  "token": null }
 *
 *   POST php/merken.php   body (JSON): { "aktion": "merken" | "entfernen", "id": "n283313010", "token": "3f9a..." }
 *        200 same answer as GET, with the new list
 *
 *   Errors: { "fehler": "German message" } with the matching HTTP status code:
 *        400 the body is not JSON, the action is unknown or the id is not in js/data/orte.js
 *        401 nobody is logged in
 *        403 the CSRF token is missing or wrong
 *        405 another method than GET or POST
 *        500 daten/merkliste.json could not be read or written
 *
 * The JSON keys (angemeldet, name, orte, token, aktion, id, fehler) and the action values are
 * German: they are the contract with js/merkliste.js, not names in the code.
 *
 * The token is the CSRF token of the session (csrfToken() in php/lib.php). The GET
 * answer hands it to the page, which sends it back with every change. Other websites
 * cannot read our answers (the browser's same-origin rule), so they never learn it.
 * Only logged-in users get a token and may change their list.
 */

require_once __DIR__ . '/lib.php';

/**
 * Sends a JSON answer with the given HTTP status code and stops the script.
 */
function sendJson(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * The normal answer: login state, the list of saved place ids and the token.
 * $places: the list to send (for GET the stored list, for POST the new list).
 */
function stateAnswer(?string $user, array $places): array
{
    return [
        'angemeldet' => $user !== null,
        'name'       => $user,
        'orte'       => array_values($places),
        'token'      => $user !== null ? csrfToken() : null,
    ];
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');              // never answer from a stored copy
header('X-Content-Type-Options: nosniff');     // the browser must treat the answer as JSON only

$user = currentUser();                          // lib.php resumed the session if there is a cookie
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// --- GET: read the list ---
if ($method === 'GET') {
    $places = [];
    if ($user !== null) {
        $places = savedPlaceIds($user);
    }
    sendJson(200, stateAnswer($user, $places));
}

// --- every other method except POST is not allowed ---
if ($method !== 'POST') {
    header('Allow: GET, POST');
    sendJson(405, ['fehler' => 'Nur GET und POST sind erlaubt.']);
}

// --- POST: change the list ---
if ($user === null) {
    sendJson(401, ['fehler' => 'Bitte melde dich an, um Orte zu merken.']);
}

// The body is JSON, not a form: read it as text and decode it.
$input = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($input)) {
    sendJson(400, ['fehler' => 'Die Anfrage enthält kein gültiges JSON.']);
}

if (!isCsrfValid($input['token'] ?? null)) {
    sendJson(403, ['fehler' => 'Das Sicherheits-Token fehlt oder ist abgelaufen. Bitte lade die Seite neu.']);
}

$action = $input['aktion'] ?? '';
$id = $input['id'] ?? '';

if ($action !== 'merken' && $action !== 'entfernen') {
    sendJson(400, ['fehler' => 'Unbekannte Aktion. Erlaubt sind merken und entfernen.']);
}
if (!isValidPlaceId($id)) {
    sendJson(400, ['fehler' => 'Diesen Ort gibt es in den Daten nicht.']);
}

if ($action === 'merken') {
    $newList = savePlace($user, $id);
} else {
    $newList = removePlace($user, $id);
}

if ($newList === null) {
    sendJson(500, ['fehler' => ERROR_SAVE]);
}
sendJson(200, stateAnswer($user, $newList));
