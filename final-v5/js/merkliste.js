/*
 * merkliste.js - the list of saved places, with or without an account. Offers window.Merkliste.  [V2]
 * Added 2026-10-13.
 *
 * How it fits in:
 * - Logged in: everything goes to the account in js/konto.js (window.Konto, localStorage), exactly as
 *   before. This file only passes the calls on.
 * - Not logged in: the ids are kept in sessionStorage under the key "quadrate-merkliste". The browser
 *   keeps sessionStorage only for this tab: when the tab is closed, the list is gone.
 * - Logging in takes the places of the session over into the account (mergeSession()), so nothing
 *   saved before is lost. js/konto-seite.js calls it in show(); ids() calls it too.
 * - Used by js/steckbrief.js (button "Merken", pins on the map), js/merkliste-seite.js (merkliste.html)
 *   and js/konto-seite.js. Needs js/konto.js before it.
 *
 * Interface:
 *   Merkliste.isAvailable()   false if the browser blocks both storages (then "Merken" is hidden)
 *   Merkliste.isPermanent()   true if a visitor is logged in (the list is kept in the account)
 *   Merkliste.ids()           ids of the saved places, e.g. ["n283313010"]
 *   Merkliste.isSaved(id)     true or false
 *   Merkliste.toggle(id)      saves the place or removes it again; returns true if it is saved now
 *   Merkliste.mergeSession()  moves the places of the session into the account of the logged-in visitor
 *   Merkliste.updateCounter() shows the number of saved entries next to "Merkliste" in the menu
 * Since 2026-10-13 the list may also hold events (ids of js/data/events.js); every page loads this file
 * (with js/konto.js) for the number in the menu.
 * Classic script without modules, so the pages also work by double-click (file://).
 */
(function () {
    "use strict";

    var SESSION_KEY = "quadrate-merkliste";

    /** True if sessionStorage can be used (it throws in some private modes). */
    function sessionAvailable() {
        try {
            sessionStorage.setItem("quadrate-test", "1");
            sessionStorage.removeItem("quadrate-test");
            return true;
        } catch (error) {
            return false;
        }
    }

    /** The ids saved in this tab without an account (empty list if there are none). */
    function loadSession() {
        try {
            return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || [];
        } catch (error) {
            return [];                     // missing, blocked or not valid JSON
        }
    }

    /** Writes the ids of the session back as JSON text. */
    function saveSession(list) {
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(list));
        } catch (error) {
            // blocked: the change is lost, the page goes on working
        }
    }

    function isAvailable() {
        return Konto.isAvailable() || sessionAvailable();
    }

    function isPermanent() {
        return Konto.user() !== null;
    }

    function mergeSession() {
        if (Konto.user() === null) {
            return;
        }
        var list = loadSession();
        for (var i = 0; i < list.length; i++) {
            if (!Konto.isSaved(list[i])) {
                Konto.toggle(list[i]);     // not saved yet, so toggle saves it
            }
        }
        if (list.length > 0) {
            saveSession([]);               // taken over: the session list starts empty again
        }
    }

    function ids() {
        mergeSession();
        if (Konto.user() !== null) {
            return Konto.savedIds();
        }
        return loadSession();
    }

    function isSaved(id) {
        return ids().indexOf(id) >= 0;
    }

    function toggle(id) {
        var saved;
        if (Konto.user() !== null) {
            saved = Konto.toggle(id);
        } else {
            var list = loadSession();
            var position = list.indexOf(id);
            if (position >= 0) {
                list.splice(position, 1);  // remove the one entry at this position
            } else {
                list.push(id);
            }
            saveSession(list);
            saved = position < 0;
        }
        updateCounter();
        if (window.Verlauf) {
            Verlauf.saved(id, saved);      // history of the account on konto.html (js/verlauf.js, 2026-10-14)
        }
        return saved;
    }

    /**
     * The number of saved places and events next to "Merkliste" in the menu, e.g. "Merkliste 3"
     * (added 2026-10-13). Nothing if the list is empty. The hidden text gives screen readers
     * "3 gemerkt"; the visible number alone would be unclear to them.
     */
    function updateCounter() {
        var link = document.querySelector('.site-nav a[href="merkliste.html"]');
        if (!link) {
            return;
        }
        var badge = link.querySelector(".nav-count");
        if (!badge) {
            badge = document.createElement("span");
            badge.className = "nav-count";
            link.appendChild(badge);
        }
        var count = isAvailable() ? ids().length : 0;
        badge.hidden = count === 0;
        badge.innerHTML = count + '<span class="visually-hidden"> gemerkt</span>';   // only our own number
    }

    window.Merkliste = {
        isAvailable: isAvailable,
        isPermanent: isPermanent,
        ids: ids,
        isSaved: isSaved,
        toggle: toggle,
        mergeSession: mergeSession,
        updateCounter: updateCounter
    };

    // The scripts stand at the end of every page, so the menu exists already: show the number at once.
    updateCounter();
})();
