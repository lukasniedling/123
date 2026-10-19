/*
 * verlauf.js - history and preferences of an account: which Quadrate were looked at last, what was saved or removed
 * on the Merkliste and when, and the preferences "Lieblingskategorie" and "wichtiges Merkmal".
 * Offers window.Verlauf.  [V2] Added 2026-10-14 (final-v5).
 *
 * How it fits in:
 * - Only for a logged-in account (Konto.user() of js/konto.js); without an account nothing is recorded.
 *   js/konto.js stays unchanged: everything is kept apart in localStorage under two keys of its own:
 *     "quadrate-verlauf"   { "anna@example.de": { gesehen: [{ code, zeit }], merkliste: [{ id, gemerkt, zeit }] } }
 *     "quadrate-vorlieben" { "anna@example.de": { kategorie: "trinken", merkmal: "vegan" } }
 *     "quadrate-tagesplaene" { "anna@example.de": [{ id, titel, text, datum, start, dauer, zeit }] } (since 2026-10-14)
 *   zeit = milliseconds since 1970 (Date.now()), so it can be sorted and turned back into a date.
 * - Recorded by: js/app.js (a Quadrat was opened on the map -> seen()) and js/merkliste.js (a place or an event
 *   was saved or removed -> saved()).
 * - Shown by js/konto-seite.js on konto.html ("Zuletzt angesehen", "Verlauf deiner Merkliste", "Deine Vorlieben").
 * - Used by js/filter.js (the map starts with the favourite category) and js/ortssuche.js (the place search starts
 *   with the favourite category and the important feature).
 * Classic script without modules, so the pages also work by double-click (file://).
 */
(function () {
    "use strict";

    var HISTORY_KEY = "quadrate-verlauf";
    var PREFERENCES_KEY = "quadrate-vorlieben";
    var MAX_SEEN = 12;                 // "Zuletzt angesehen": the last 12 different Quadrate
    var MAX_SAVED = 30;                // "Verlauf deiner Merkliste": the last 30 changes
    var PLANS_KEY = "quadrate-tagesplaene";   // saved day plans of "Tag planen" (2026-10-14)
    var MAX_PLANS = 10;                // the last 10 saved day plans

    /** Reads one key of localStorage as an object; {} if it is empty or storage is blocked. */
    function read(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || {};
        } catch (error) {
            return {};
        }
    }

    /** Writes an object under a key; false if the browser does not allow it. */
    function write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            return false;
        }
    }

    /** The logged-in account, or null (then nothing is recorded). */
    function account() {
        return window.Konto ? Konto.user() : null;
    }

    /** The history of the logged-in account: { gesehen: [...], merkliste: [...] }, newest first. */
    function history() {
        var email = account();
        var all = read(HISTORY_KEY);
        var mine = (email && all[email]) || {};
        return { gesehen: mine.gesehen || [], merkliste: mine.merkliste || [] };
    }

    /** Stores the history of the logged-in account again. */
    function storeHistory(mine) {
        var all = read(HISTORY_KEY);
        all[account()] = mine;
        write(HISTORY_KEY, all);
    }

    /**
     * A Quadrat was opened on the map: it goes to the front of "Zuletzt angesehen". A Quadrat that is already in
     * the list moves to the front instead of standing there twice; the list keeps the last MAX_SEEN.
     */
    function seen(code) {
        if (!account()) {
            return;
        }
        var mine = history();
        var list = [{ code: code, zeit: Date.now() }];
        for (var i = 0; i < mine.gesehen.length && list.length < MAX_SEEN; i++) {
            if (mine.gesehen[i].code !== code) {
                list.push(mine.gesehen[i]);
            }
        }
        mine.gesehen = list;
        storeHistory(mine);
    }

    /** A place or an event was saved (gemerkt = true) or removed (false): one new line at the top of the list. */
    function saved(id, gemerkt) {
        if (!account()) {
            return;
        }
        var mine = history();
        mine.merkliste.unshift({ id: id, gemerkt: gemerkt, zeit: Date.now() });   // unshift: in front
        mine.merkliste = mine.merkliste.slice(0, MAX_SAVED);
        storeHistory(mine);
    }

    /** Empties "Verlauf deiner Merkliste" of the logged-in account (button "Verlauf leeren" on konto.html, 2026-10-14). */
    function clearSaved() {
        if (!account()) {
            return;
        }
        var mine = history();
        mine.merkliste = [];
        storeHistory(mine);
    }

    /** The preferences of the logged-in account: { kategorie: "" | "essen" ..., merkmal: "" | "vegan" ... }. */
    function preferences() {
        var email = account();
        var mine = (email && read(PREFERENCES_KEY)[email]) || {};
        return { kategorie: mine.kategorie || "", merkmal: mine.merkmal || "" };
    }

    /** Stores the preferences of the logged-in account; returns false if that is not possible. */
    function setPreferences(values) {
        var email = account();
        if (!email) {
            return false;
        }
        var all = read(PREFERENCES_KEY);
        all[email] = { kategorie: values.kategorie || "", merkmal: values.merkmal || "" };
        return write(PREFERENCES_KEY, all);
    }

    /* ---------------- saved day plans (added 2026-10-14) ---------------- */

    /** The day plans saved by the logged-in account, newest first: [{ id, titel, text, datum, start, dauer, zeit }]. */
    function plans() {
        var email = account();
        return (email && read(PLANS_KEY)[email]) || [];
    }

    /**
     * Saves a day plan of merkliste.html ("Im Konto speichern", js/tagesplaner.js): its title and text as they were
     * shown, and the values of the form (date, start in minutes, minutes per place), so it can be opened again.
     * Keeps the last MAX_PLANS. Returns false without an account or if the browser does not allow it.
     */
    function savePlan(plan) {
        var email = account();
        if (!email) {
            return false;
        }
        var all = read(PLANS_KEY);
        var mine = all[email] || [];
        plan.id = "p" + Date.now();
        plan.zeit = Date.now();
        mine.unshift(plan);
        all[email] = mine.slice(0, MAX_PLANS);
        return write(PLANS_KEY, all);
    }

    /** Deletes one saved day plan (button "Löschen" on konto.html). */
    function removePlan(id) {
        var email = account();
        var all = read(PLANS_KEY);
        var kept = [];
        var mine = (email && all[email]) || [];
        for (var i = 0; i < mine.length; i++) {
            if (mine[i].id !== id) {
                kept.push(mine[i]);
            }
        }
        all[email] = kept;
        write(PLANS_KEY, all);
    }

    /** Deletes history, preferences and day plans of an account (when the account is deleted on konto.html). */
    function forget(email) {
        var keys = [HISTORY_KEY, PREFERENCES_KEY, PLANS_KEY];
        for (var i = 0; i < keys.length; i++) {
            var all = read(keys[i]);
            delete all[email];
            write(keys[i], all);
        }
    }

    /**
     * German text for a moment of the history: "heute, 14:05", "gestern, 19:30" or "12.10., 18:00".
     * The days are compared as dates (toDateString), not as 24 hours back.
     */
    function whenText(time) {
        var date = new Date(time);
        var now = new Date();
        var yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        var clock = (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" +
            (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
        if (date.toDateString() === now.toDateString()) {
            return "heute, " + clock;
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return "gestern, " + clock;
        }
        return date.getDate() + "." + (date.getMonth() + 1) + "., " + clock;
    }

    window.Verlauf = {
        seen: seen,
        saved: saved,
        clearSaved: clearSaved,
        history: history,
        preferences: preferences,
        setPreferences: setPreferences,
        plans: plans,
        savePlan: savePlan,
        removePlan: removePlan,
        forget: forget,
        whenText: whenText
    };
})();
