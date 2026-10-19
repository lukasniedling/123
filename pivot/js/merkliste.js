/*
 * merkliste.js - client for saved places ("Merkliste"), offers window.Merkliste.          [V3]
 *
 * How it fits in: js/steckbrief.js uses this module to show "Merken" buttons in the profile
 * panel and pins on the map (Karte.markieren). The list itself lives on the server:
 * php/merken.php stores it per user in daten/merkliste.json and answers with JSON.
 * The global name window.Merkliste mirrors the German file name (see web/ARCHITECTURE.md).
 *
 * Interface (used by js/steckbrief.js):
 *   Merkliste.isAvailable()  true or false: can places be saved at all?
 *                            false when the page was opened by double-click (file://, no PHP)
 *                            and after php/merken.php gave no usable answer (e.g. a server
 *                            without PHP). Ask it after status() has finished, because only
 *                            the first request shows whether the server answers.
 *   Merkliste.status()       Promise -> { angemeldet: true/false, name: "anna" or null }
 *   Merkliste.list()         Promise -> ids of the saved places, e.g. ["n283313010"]
 *   Merkliste.save(id)       Promise -> the new list of ids
 *   Merkliste.remove(id)     Promise -> the new list of ids
 * The JSON keys (angemeldet, name, orte, aktion, token) and the action values "merken" and
 * "entfernen" are the contract with php/merken.php, so they stay German.
 *
 * Failures never break the page: the promises never reject. If something goes wrong (no
 * server, not logged in, network error) they resolve with the list as it was before the
 * attempt. So after save(id) the caller can simply check whether id is in the list.
 *
 * Classic script without modules (works from file:// too). Uses fetch() and Promise,
 * which every current browser has.
 */
(function () {
    "use strict";

    var ENDPOINT = "php/merken.php";  // relative to the page; index.html lies in the site root
    var TIMEOUT_MS = 8000;            // give up a request after 8 seconds without an answer

    // Saving needs a web server with PHP: never on file://, and only if fetch() exists.
    var serverAvailable = (window.location.protocol === "http:" || window.location.protocol === "https:") &&
        typeof window.fetch === "function";

    var loaded = false;               // true after the first good answer of the server
    var token = null;                 // CSRF token of the session, sent back with every change
    var state = { angemeldet: false, name: null, orte: [] };   // last known state (keys as in the JSON answer)

    // Requests run one after another (a queue): a second click on "Merken" waits until
    // the first request is finished, so the answers can never arrive in the wrong order.
    var queue = Promise.resolve();

    /**
     * Runs the function task after all earlier requests have finished.
     * Returns a promise for the result of task.
     */
    function runInOrder(task) {
        var result = queue.then(task);
        // The next task waits for this one, even if it should fail.
        queue = result.then(null, function () {});
        return result;
    }

    /**
     * Sends one request to php/merken.php. payload = null sends GET, an object sends POST with JSON.
     * Resolves with { status: 200, data: {...} }; rejects on network errors, time-out and
     * answers that are not JSON (e.g. the PHP source text of a server without PHP).
     */
    function sendRequest(payload) {
        var options = {
            method: "GET",
            credentials: "same-origin",   // send the session cookie
            cache: "no-store",            // always ask the server, never a stored copy
            headers: { "Accept": "application/json" }
        };
        if (payload !== null) {
            options.method = "POST";
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(payload);
        }

        // Time-out: AbortController stops the request after TIMEOUT_MS milliseconds.
        var controller = null;
        if (typeof window.AbortController === "function") {
            controller = new AbortController();
            options.signal = controller.signal;
        }
        var timer = window.setTimeout(function () {
            if (controller) {
                controller.abort();
            }
        }, TIMEOUT_MS);

        return fetch(ENDPOINT, options)
            .then(function (response) {
                return response.json().then(function (json) {
                    return { status: response.status, data: json };
                });
            })
            .then(function (result) {
                window.clearTimeout(timer);
                return result;
            }, function (error) {
                window.clearTimeout(timer);
                throw error;
            });
    }

    /**
     * True if an answer of the server has the expected form { angemeldet, orte: [...] }.
     */
    function isValidAnswer(data) {
        return data !== null && typeof data === "object" &&
            typeof data.angemeldet === "boolean" && Array.isArray(data.orte);
    }

    /**
     * Stores a good answer of the server as the new known state.
     */
    function applyAnswer(data) {
        var ids = [];
        for (var i = 0; i < data.orte.length; i++) {
            if (typeof data.orte[i] === "string") {
                ids.push(data.orte[i]);
            }
        }
        state = {
            angemeldet: data.angemeldet,
            name: typeof data.name === "string" ? data.name : null,
            orte: ids
        };
        token = typeof data.token === "string" ? data.token : null;
    }

    /**
     * Forgets the login, e.g. after the server answered 401 (session expired).
     */
    function forgetLogin() {
        state = { angemeldet: false, name: null, orte: [] };
        token = null;
    }

    /**
     * Loads the current state from the server (GET) and resolves with it.
     * If the very first request fails, saving is switched off (isAvailable() becomes false).
     */
    function load() {
        if (!serverAvailable) {
            return Promise.resolve(state);
        }
        return sendRequest(null).then(function (result) {
            if (result.status === 200 && isValidAnswer(result.data)) {
                applyAnswer(result.data);
                loaded = true;
            } else if (!loaded) {
                serverAvailable = false;
            }
            return state;
        }, function () {
            if (!loaded) {
                serverAvailable = false;
            }
            return state;
        });
    }

    /**
     * Sends a change (action "merken" or "entfernen") and resolves with the list afterwards.
     * previous: the list before the attempt; it is returned whenever the change did not happen.
     * retry = true: if the token is outdated (403), load a new one and try a second time.
     */
    function sendChange(action, id, previous, retry) {
        var payload = { aktion: action, id: String(id), token: token };
        return sendRequest(payload).then(function (result) {
            if (result.status === 200 && isValidAnswer(result.data)) {
                applyAnswer(result.data);
                return state.orte.slice();
            }
            if (result.status === 401) {
                forgetLogin();            // session expired: the change did NOT happen
                return previous;
            }
            if (result.status === 403 && retry) {
                return load().then(function () {
                    if (!state.angemeldet) {
                        return previous;
                    }
                    return sendChange(action, id, previous, false);
                });
            }
            return previous;              // any other error: nothing changed
        }, function () {
            return previous;              // no answer: the list stays as it was
        });
    }

    /**
     * Shared part of save() and remove(): makes sure a token is there, then sends.
     */
    function change(action, id) {
        return runInOrder(function () {
            var previous = state.orte.slice();      // the list before this attempt
            var ready = token ? Promise.resolve(state) : load();
            return ready.then(function () {
                if (!serverAvailable || !state.angemeldet) {
                    return previous;
                }
                return sendChange(action, id, previous, true);
            });
        });
    }

    /* ---------------- public interface ---------------- */

    /** True if saving is possible (web server with PHP); see the header comment. */
    function isAvailable() {
        return serverAvailable;
    }

    /** Resolves with { angemeldet, name } of the current visitor. */
    function status() {
        return runInOrder(load).then(function (current) {
            return { angemeldet: current.angemeldet, name: current.name };
        });
    }

    /** Resolves with a copy of the list of saved place ids (fresh from the server). */
    function list() {
        return runInOrder(load).then(function (current) {
            return current.orte.slice();
        });
    }

    /** Saves the place with this id; resolves with the new list. */
    function save(id) {
        return change("merken", id);
    }

    /** Removes the place with this id; resolves with the new list. */
    function remove(id) {
        return change("entfernen", id);
    }

    window.Merkliste = {
        isAvailable: isAvailable,
        status: status,
        list: list,
        save: save,
        remove: remove
    };
})();
