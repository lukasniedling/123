/*
 * konto.js - accounts and saved places in the browser (localStorage), offers window.Konto.
 *
 * Decision D-042 (2026-10-07): the site only runs locally and is never published, so accounts
 * and saved places are kept in the browser instead of on a PHP server. Opening index.html by
 * double-click is enough. Security is not a goal: the password is stored as plain text in the
 * browser, so nobody should use a real password here (datenschutz.html says so).
 *
 * E-mail confirmation (2026-10-10): an account belongs to an e-mail address and starts unconfirmed.
 * register() creates a 6-digit code; only confirm() with this code lets the account log in.
 * Without a server the site cannot send a real e-mail, so js/konto-seite.js shows the e-mail
 * with the code in a simulated inbox on konto.html.
 *
 * Storage (localStorage keeps text only, so objects are turned into JSON text and back):
 *   "quadrate-konten"      { "anna@example.de": { "passwort": "…", "seit": "2026-10-10T…",
 *                            "bestaetigt": false, "code": "483920", "orte": ["n123", …] } }
 *   "quadrate-angemeldet"  "anna@example.de" (the account that is logged in) or nothing
 *
 * Interface (used by js/steckbrief.js and js/konto-seite.js):
 *   Konto.isAvailable()              false if the browser blocks localStorage (then nothing works)
 *   Konto.user()                     e-mail address of the logged-in account or null
 *   Konto.register(email, password)  "" on success (account still unconfirmed), otherwise a German error message
 *   Konto.code(email)                the confirmation code of an unconfirmed account (for the simulated e-mail) or ""
 *   Konto.confirm(email, code)       "" if the code is right (account confirmed), otherwise a German error message
 *   Konto.login(email, password)     "ok" (logged in), "falsch" (wrong address or password) or "unbestaetigt"
 *   Konto.logout()
 *   Konto.savedIds()                ids of the saved places of the logged-in account, e.g. ["n283313010"]
 *   Konto.isSaved(id)               true or false
 *   Konto.toggle(id)                saves the place or removes it again; returns true if it is saved now
 *   Konto.deleteAccount()           removes the logged-in account with all its saved places
 * Classic script without modules, so the pages also work by double-click (file://).
 */
(function () {
    "use strict";

    var ACCOUNTS_KEY = "quadrate-konten";
    var CURRENT_KEY = "quadrate-angemeldet";
    var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;   // text@text.text, no spaces
    var PASSWORD_MIN = 6;

    /** True if localStorage can be used (it throws in some private modes). */
    function isAvailable() {
        try {
            localStorage.setItem("quadrate-test", "1");
            localStorage.removeItem("quadrate-test");
            return true;
        } catch (error) {
            return false;
        }
    }

    /** All accounts as an object (empty object if there are none yet). */
    function loadAccounts() {
        try {
            return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || {};
        } catch (error) {
            return {};                     // missing, blocked or not valid JSON
        }
    }

    /** Writes all accounts back as JSON text. */
    function saveAccounts(accounts) {
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }

    /** E-mail addresses are compared in small letters without spaces around them: "Anna@X.de " = "anna@x.de". */
    function normalize(email) {
        return String(email || "").trim().toLowerCase();
    }

    /** A new confirmation code: 6 random digits as text, from "100000" to "999999". */
    function newCode() {
        return String(Math.floor(100000 + Math.random() * 900000));
    }

    function user() {
        try {
            var email = localStorage.getItem(CURRENT_KEY);
            var account = email ? loadAccounts()[email] : null;
            return account && account.bestaetigt === true ? email : null;
        } catch (error) {
            return null;
        }
    }

    function register(email, password) {
        email = normalize(email);
        if (!EMAIL_PATTERN.test(email)) {
            return "Bitte gib eine gültige E-Mail-Adresse ein, zum Beispiel anna@example.de.";
        }
        if (String(password).length < PASSWORD_MIN) {
            return "Das Passwort braucht mindestens " + PASSWORD_MIN + " Zeichen.";
        }
        var accounts = loadAccounts();
        if (accounts[email]) {
            return "Mit dieser E-Mail-Adresse gibt es schon ein Konto. Melde dich an.";
        }
        accounts[email] = {
            passwort: String(password),
            seit: new Date().toISOString(),
            bestaetigt: false,           // becomes true in confirm()
            code: newCode(),
            orte: []
        };
        saveAccounts(accounts);
        return "";
    }

    function code(email) {
        var account = loadAccounts()[normalize(email)];
        return account && !account.bestaetigt ? account.code : "";
    }

    function confirm(email, enteredCode) {
        email = normalize(email);
        var accounts = loadAccounts();
        var account = accounts[email];
        if (!account) {
            return "Zu dieser E-Mail-Adresse gibt es kein Konto.";
        }
        if (account.bestaetigt) {
            return "";                     // already confirmed: nothing left to do
        }
        if (String(enteredCode).trim() !== account.code) {
            return "Der Code stimmt nicht. Sieh in der E-Mail nach und versuche es noch einmal.";
        }
        account.bestaetigt = true;
        delete account.code;               // the code is used up
        saveAccounts(accounts);
        return "";
    }

    function login(email, password) {
        email = normalize(email);
        var account = loadAccounts()[email];
        if (!account || account.passwort !== String(password)) {
            return "falsch";
        }
        if (account.bestaetigt !== true) {
            return "unbestaetigt";         // right password, but the address is not confirmed yet
        }
        localStorage.setItem(CURRENT_KEY, email);
        return "ok";
    }

    function logout() {
        localStorage.removeItem(CURRENT_KEY);
    }

    function savedIds() {
        var name = user();
        return name ? loadAccounts()[name].orte.slice() : [];
    }

    function isSaved(id) {
        return savedIds().indexOf(id) >= 0;
    }

    function toggle(id) {
        var name = user();
        if (!name) {
            return false;
        }
        var accounts = loadAccounts();
        var list = accounts[name].orte;
        var position = list.indexOf(id);
        if (position >= 0) {
            list.splice(position, 1);      // remove the one entry at this position
        } else {
            list.push(id);
        }
        saveAccounts(accounts);
        return position < 0;
    }

    function deleteAccount() {
        var name = user();
        if (!name) {
            return;
        }
        var accounts = loadAccounts();
        delete accounts[name];
        saveAccounts(accounts);
        logout();
    }

    window.Konto = {
        isAvailable: isAvailable,
        user: user,
        register: register,
        code: code,
        confirm: confirm,
        login: login,
        logout: logout,
        savedIds: savedIds,
        isSaved: isSaved,
        toggle: toggle,
        deleteAccount: deleteAccount
    };
})();
