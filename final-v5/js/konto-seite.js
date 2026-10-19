/*
 * konto-seite.js - the page konto.html: register, confirm the e-mail address, log in, the account's
 * profile picture, overview, history, preferences and day plans, log out.
 *
 * How it fits in: js/konto.js keeps accounts and saved places in localStorage (window.Konto);
 * this file only shows them. Not logged in: the two forms (#konto-anmelden). Registered but not
 * confirmed: the simulated e-mail with the code and the code form (#konto-bestaetigen). Logged
 * in: the account (#konto-orte). After every change the page is drawn
 * again with show(), so the page and the stored data always match.
 * The names come from window.ORTE (js/data/orte.js) and window.QUADRATE (js/data/quadrate.js).
 * Since 2026-10-13 places can also be saved without an account (js/merkliste.js, only for the tab);
 * show() takes them over into the account as soon as someone is logged in.
 * Since 2026-10-14 (final-v5): the field "Profilbild" (js/avatar.js) when logged in.
 * Also since 2026-10-14: "Dein Überblick", "Zuletzt angesehen", "Verlauf deiner Merkliste" and "Deine Vorlieben"
 * from js/verlauf.js (only when logged in), and "Deine Tagespläne" (saved day plans).
 * Taken out again on 2026-10-14: the list of saved places (the same as merkliste.html; "Dein Überblick" links
 * there now) and the list "Deine gemeldeten Events" (they stay on events.html with "Meldung löschen").
 * Classic script without modules, so the page also works by double-click (file://).
 */
(function () {
    "use strict";

    var CATEGORY_NAMES = { essen: "Essen", trinken: "Trinken", kultur: "Kultur", shoppen: "Shoppen" };

    var placeById = {};
    var pendingEmail = "";                // address waiting for its code; "" = none
    var SHORT_HISTORY = 5;                // "Verlauf deiner Merkliste" shows the newest 5 changes until it is opened
    var historyOpen = false;              // true after "Alle anzeigen" (2026-10-14)

    /** Creates an element with a class and an optional text (textContent never interprets HTML). */
    function element(tag, className, text) {
        var node = document.createElement(tag);
        if (className) {
            node.className = className;
        }
        if (text !== undefined) {
            node.textContent = text;
        }
        return node;
    }

    /** Shows the part of the page that fits: the forms, the code form or the account. */
    function show() {
        // Places saved without an account in this tab go into the account after logging in (js/merkliste.js).
        if (window.Merkliste) {
            Merkliste.mergeSession();
            Merkliste.updateCounter();     // logged in or out: the number in the menu changes
        }
        var email = Konto.user();
        var confirming = email === null && pendingEmail !== "";
        document.getElementById("konto-anmelden").hidden = email !== null || confirming;
        document.getElementById("konto-bestaetigen").hidden = !confirming;
        document.getElementById("konto-orte").hidden = email === null;
        if (confirming) {
            showMail();
        }
        if (email !== null) {
            document.getElementById("konto-name").textContent = email;
            if (window.Avatar) {
                // the field "Profilbild" (js/avatar.js, 2026-10-14)
                Avatar.setup({
                    image: document.getElementById("profilbild-bild"),
                    placeholder: document.getElementById("profilbild-buchstabe"),
                    input: document.getElementById("profilbild-datei"),
                    removeButton: document.getElementById("profilbild-entfernen"),
                    message: document.getElementById("profilbild-meldung"),
                    band: document.querySelector("#konto-orte .page-intro--band")   // big picture at the top
                });
            }
        }
        if (window.Avatar) {
            Avatar.showInMenu();               // logged in or out: the picture in the menu follows
        }
        if (email !== null && window.Verlauf) {
            showOverview();                    // overview, history and preferences (2026-10-14)
            showHistory();
            showPlans();
            setupPreferences();
        }
        // "Abmelden" and "Konto löschen" stand at the very end of the page (2026-10-14), only when logged in
        document.getElementById("konto-aktionen").hidden = email === null;
    }

    /* ---------------- overview, history, preferences (added 2026-10-14, data from js/verlauf.js) ---------------- */

    /** The name of a saved id: a place of window.ORTE or an event of js/events.js; null if it is gone. */
    function nameOf(id) {
        if (placeById[id]) {
            return placeById[id].name + " (" + placeById[id].quadrat + ")";
        }
        var found = window.Events ? Events.eventOfId(id) : null;     // "e05" or one date "e05@2026-10-16"
        if (found) {
            return found.event.titel + " (Event" + (found.iso ? ", nur " + Events.shortDate(found.iso) : "") + ", " +
                found.event.quadrat + ")";
        }
        return null;
    }

    /** A small box with a big number and a word under it, e.g. "12" / "Orte gemerkt". */
    function statTile(number, text) {
        var tile = element("div", "stat-tile");
        tile.appendChild(element("span", "stat-tile__number", String(number)));
        tile.appendChild(element("span", "stat-tile__text", text));
        return tile;
    }

    /** Adds the link "zur Merkliste" to a tile and returns it. */
    function listTile(tile) {
        var link = element("a", "stat-tile__link", "zur Merkliste");
        link.href = "merkliste.html";
        tile.appendChild(link);
        return tile;
    }

    /**
     * "Dein Überblick": numbers (places and events saved, Quadrate looked at, favourite Quadrat) and one bar per
     * category with the number of saved places. The longest bar is as wide as the box; the others are shorter in
     * proportion (width in percent of the largest number).
     */
    function showOverview() {
        var box = document.getElementById("ueberblick");
        box.textContent = "";
        var ids = Konto.savedIds();
        var perCategory = { essen: 0, trinken: 0, kultur: 0, shoppen: 0 };
        var perBlock = {};
        var places = 0;
        for (var i = 0; i < ids.length; i++) {
            var place = placeById[ids[i]];
            if (place) {
                places = places + 1;
                perCategory[place.kat] = perCategory[place.kat] + 1;
                perBlock[place.quadrat] = (perBlock[place.quadrat] || 0) + 1;
            }
        }
        var favourite = null;                   // the Quadrat with the most saved places
        for (var code in perBlock) {
            if (favourite === null || perBlock[code] > perBlock[favourite]) {
                favourite = code;
            }
        }

        var tiles = element("div", "stat-tiles");
        // the saved places and events themselves stand on merkliste.html: both tiles link there (2026-10-14)
        tiles.appendChild(listTile(statTile(places, places === 1 ? "Ort gemerkt" : "Orte gemerkt")));
        tiles.appendChild(listTile(statTile(ids.length - places, ids.length - places === 1 ? "Event gemerkt" : "Events gemerkt")));
        tiles.appendChild(statTile(Verlauf.history().gesehen.length, "Quadrate zuletzt angesehen"));
        var favouriteTile = statTile(favourite || "–", "dein Lieblingsquadrat");
        if (favourite) {
            var link = element("a", "stat-tile__link", "auf der Karte");
            link.href = "index.html#" + favourite;
            favouriteTile.appendChild(link);
        }
        tiles.appendChild(favouriteTile);
        box.appendChild(tiles);

        // one bar per category, in its colour (class cat-essen ... sets --cat-3, css/konto.css)
        var most = Math.max(1, perCategory.essen, perCategory.trinken, perCategory.kultur, perCategory.shoppen);
        var bars = element("ul", "category-bars");
        bars.setAttribute("aria-label", "Gemerkte Orte je Kategorie");
        for (var key in perCategory) {
            var row = element("li", "category-bars__row cat-" + key);
            var label = element("span", "category-bars__label");
            var icon = element("span", "cat-icon cat-icon--" + key);
            icon.setAttribute("aria-hidden", "true");
            label.appendChild(icon);
            label.appendChild(document.createTextNode(" " + CATEGORY_NAMES[key]));
            row.appendChild(label);
            var track = element("span", "category-bars__track");
            var bar = element("span", "category-bars__bar");
            bar.style.width = perCategory[key] === 0 ? "0" : Math.max(3, perCategory[key] / most * 100) + "%";   // at least a little piece
            track.appendChild(bar);
            row.appendChild(track);
            row.appendChild(element("span", "category-bars__count", String(perCategory[key])));
            bars.appendChild(row);
        }
        box.appendChild(bars);
    }

    /** "Zuletzt angesehen" and "Verlauf deiner Merkliste" from the history of js/verlauf.js, newest first. */
    function showHistory() {
        var history = Verlauf.history();

        var seenList = document.getElementById("gesehen-liste");
        seenList.textContent = "";
        if (history.gesehen.length === 0) {
            seenList.appendChild(element("li", "account-empty", "Noch nichts. Öffne auf der Karte ein Quadrat, dann steht es hier."));
        }
        for (var i = 0; i < history.gesehen.length; i++) {
            var entry = history.gesehen[i];
            var item = element("li", "seen-list__item");
            var link = element("a", "seen-list__link");
            link.href = "index.html#" + entry.code;
            link.appendChild(element("span", "block-code", entry.code));
            var info = window.QUADRATE && window.QUADRATE[entry.code];
            if (info && info.name) {
                link.appendChild(element("span", "seen-list__name", info.name));
            }
            item.appendChild(link);
            item.appendChild(element("span", "seen-list__time", Verlauf.whenText(entry.zeit)));
            seenList.appendChild(item);
        }

        var timeline = document.getElementById("merkverlauf-liste");
        timeline.textContent = "";
        if (history.merkliste.length === 0) {
            timeline.appendChild(element("li", "account-empty", "Noch nichts. Merkst du dir einen Ort oder ein Event, steht es hier."));
        }
        // folded (2026-10-14): only the newest SHORT_HISTORY changes, unless "Alle anzeigen" was clicked
        var shown = historyOpen ? history.merkliste.length : Math.min(SHORT_HISTORY, history.merkliste.length);
        for (var j = 0; j < shown; j++) {
            var change = history.merkliste[j];
            var line = element("li", "timeline__item " + (change.gemerkt ? "timeline__item--saved" : "timeline__item--removed"));
            line.appendChild(element("span", "timeline__what", change.gemerkt ? "gemerkt" : "entfernt"));
            line.appendChild(element("span", "timeline__name", nameOf(change.id) || "nicht mehr vorhanden"));
            line.appendChild(element("span", "timeline__time", Verlauf.whenText(change.zeit)));
            timeline.appendChild(line);
        }
        setupHistoryButtons(history.merkliste.length);
    }

    /**
     * The buttons under "Verlauf deiner Merkliste" (added 2026-10-14): "Alle anzeigen" / "Weniger anzeigen" folds
     * the list open or shut, "Verlauf leeren" deletes it after a question. Without changes both are hidden.
     * The click handlers are added only once (dataset.ready), because show() runs again after every change.
     */
    function setupHistoryButtons(count) {
        var tools = document.getElementById("merkverlauf-knoepfe");
        var more = document.getElementById("merkverlauf-mehr");
        var clear = document.getElementById("merkverlauf-leeren");
        tools.hidden = count === 0;
        more.hidden = count <= SHORT_HISTORY;
        more.textContent = historyOpen ? "Weniger anzeigen" : "Alle anzeigen (" + count + ")";
        more.setAttribute("aria-expanded", String(historyOpen));
        if (tools.dataset.ready) {
            return;
        }
        tools.dataset.ready = "true";
        more.addEventListener("click", function () {
            historyOpen = !historyOpen;
            showHistory();
        });
        clear.addEventListener("click", function () {
            if (window.confirm("Verlauf deiner Merkliste leeren? Die gemerkten Orte und Events bleiben.")) {
                Verlauf.clearSaved();
                historyOpen = false;
                showHistory();
            }
        });
    }

    /**
     * "Deine Tagespläne" (added 2026-10-14): the plans saved with "Im Konto speichern" on merkliste.html. Each one shows
     * its title and when it was saved; "Plan anzeigen" unfolds its text (<details>), "In der Merkliste öffnen" goes
     * to merkliste.html?plan=... (js/tagesplaner.js fills the form with it), "Löschen" removes it.
     */
    function showPlans() {
        var list = document.getElementById("tagesplaene-liste");
        list.textContent = "";
        var plans = Verlauf.plans();
        if (plans.length === 0) {
            list.appendChild(element("li", "account-empty",
                "Noch keine. Plane auf der Merkliste deinen Tag und drücke dort „Im Konto speichern“."));
            return;
        }
        for (var i = 0; i < plans.length; i++) {
            var plan = plans[i];
            var item = element("li", "account-plans__item");
            var head = element("div", "account-plans__head");
            var text = element("div");
            text.appendChild(element("span", "account-plans__title", plan.titel));
            text.appendChild(element("span", "account-plans__time", "gespeichert " + Verlauf.whenText(plan.zeit)));
            head.appendChild(text);
            var buttons = element("div", "button-row account-plans__buttons");
            var open = element("a", "button button--small", "In der Merkliste öffnen");
            open.href = "merkliste.html?plan=" + encodeURIComponent(plan.id) + "#tagesplan";
            buttons.appendChild(open);
            var remove = element("button", "button button--secondary button--small", "Löschen");
            remove.type = "button";
            remove.setAttribute("aria-label", "Löschen: " + plan.titel);
            remove.setAttribute("data-id", plan.id);
            remove.addEventListener("click", function () {
                Verlauf.removePlan(this.getAttribute("data-id"));
                showPlans();
            });
            buttons.appendChild(remove);
            head.appendChild(buttons);
            item.appendChild(head);
            var details = element("details", "account-plans__details");
            details.appendChild(element("summary", "", "Plan anzeigen"));
            details.appendChild(element("pre", "account-plans__text", plan.text));
            item.appendChild(details);
            list.appendChild(item);
        }
    }

    /**
     * "Deine Vorlieben": shows the stored preferences in the form and stores every change at once (event "change").
     * The form is connected only once (dataset.ready), because show() runs again after every change on the page.
     */
    function setupPreferences() {
        var form = document.getElementById("vorlieben-formular");
        var message = document.getElementById("vorlieben-meldung");
        var wishes = Verlauf.preferences();
        var radio = form.querySelector('input[name="lieblingskategorie"][value="' + wishes.kategorie + '"]');
        if (radio) {
            radio.checked = true;
        }
        form.elements.merkmal.value = wishes.merkmal;
        if (form.dataset.ready) {
            return;
        }
        form.dataset.ready = "true";
        form.addEventListener("change", function () {
            var chosen = form.querySelector('input[name="lieblingskategorie"]:checked');
            var values = { kategorie: chosen ? chosen.value : "", merkmal: form.elements.merkmal.value };
            if (Verlauf.setPreferences(values)) {
                message.textContent = "Gespeichert." +
                    (values.kategorie ? " Die Karte startet mit " + CATEGORY_NAMES[values.kategorie] + "." : "") +
                    (values.merkmal ? " Orte mit „" + values.merkmal + "“ stehen im Steckbrief und in der Ortssuche oben (mit Stern)." : "");
            } else {
                message.textContent = "Nicht gespeichert: Der Browser erlaubt das gerade nicht.";
            }
        });
        form.addEventListener("submit", function (event) {
            event.preventDefault();             // nothing to send: every change is stored at once
        });
    }

    /** Fills the simulated e-mail with the address and the code from js/konto.js. */
    function showMail() {
        document.getElementById("bestaetigen-email").textContent = pendingEmail;
        document.getElementById("mail-an").textContent = pendingEmail;
        document.getElementById("mail-code").textContent = Konto.code(pendingEmail);
    }

    /** Switches to the code form for this address. */
    function startConfirming(email) {
        pendingEmail = email.trim().toLowerCase();
        document.getElementById("bestaetigen-fehler").textContent = "";
        show();
        document.getElementById("bestaetigen-code").focus();
    }

    /** "Konto anlegen": creates the unconfirmed account, then asks for the code. */
    function onRegister(event) {
        event.preventDefault();           // no page load: everything happens in the browser
        var form = event.target;
        var email = form.elements.email.value;
        var error = Konto.register(email, form.elements.passwort.value);
        document.getElementById("registrieren-fehler").textContent = error;
        if (error === "") {
            form.reset();
            startConfirming(email);
        }
    }

    /** "Bestätigen": checks the code; if it is right, back to "Anmelden" with the address filled in. */
    function onConfirm(event) {
        event.preventDefault();
        var form = event.target;
        var error = Konto.confirm(pendingEmail, form.elements.code.value);
        document.getElementById("bestaetigen-fehler").textContent = error;
        if (error === "") {
            form.reset();
            var info = document.getElementById("anmelden-info");
            info.textContent = "E-Mail-Adresse bestätigt. Du kannst dich jetzt anmelden.";
            info.hidden = false;
            document.getElementById("anmelden-email").value = pendingEmail;
            pendingEmail = "";
            show();
            document.getElementById("anmelden-passwort").focus();
        }
    }

    /** "Anmelden": logs in, or asks for the code if the address is not confirmed yet. */
    function onLogin(event) {
        event.preventDefault();
        var form = event.target;
        var email = form.elements.email.value;
        var result = Konto.login(email, form.elements.passwort.value);
        var error = document.getElementById("anmelden-fehler");
        error.textContent = "";
        if (result === "falsch") {
            error.textContent = "E-Mail-Adresse oder Passwort stimmt nicht.";
        } else if (result === "unbestaetigt") {
            form.reset();
            startConfirming(email);
        } else {
            form.reset();
            document.getElementById("anmelden-info").hidden = true;
            show();
        }
    }

    function init() {
        if (!Konto.isAvailable()) {
            document.getElementById("konto-gesperrt").hidden = false;
            return;
        }
        for (var i = 0; i < window.ORTE.length; i++) {
            placeById[window.ORTE[i].id] = window.ORTE[i];
        }
        document.getElementById("anmelden-formular").addEventListener("submit", onLogin);
        document.getElementById("registrieren-formular").addEventListener("submit", onRegister);
        document.getElementById("bestaetigen-formular").addEventListener("submit", onConfirm);
        document.getElementById("bestaetigen-zurueck").addEventListener("click", function () {
            pendingEmail = "";
            show();
        });
        document.getElementById("abmelden").addEventListener("click", function () {
            Konto.logout();
            show();
        });
        document.getElementById("konto-loeschen").addEventListener("click", function () {
            if (window.confirm("Konto und alle gemerkten Orte löschen?")) {
                if (window.Avatar) {
                    Avatar.remove(Konto.user());   // the profile picture goes too (2026-10-14)
                }
                if (window.Verlauf) {
                    Verlauf.forget(Konto.user());  // and the history and the preferences
                }
                Konto.deleteAccount();
                show();
            }
        });
        show();
    }

    init();
})();
