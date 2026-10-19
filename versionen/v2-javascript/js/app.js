/*
 * app.js - wiring of the index page: connects the map (window.Karte), the filter (window.Filter),
 * the profile panel (window.Steckbrief) and the list "Quadrat wählen".                            [V2]
 *
 * How it fits in:
 * - Loaded last on index.html, after the data files and the other scripts.
 * - The address is the single source of truth for the selection: choosing a Quadrat (click on the
 *   map, Enter on a block, the list) sets location.hash to "#O3"; the event "hashchange" then selects
 *   the block on the map, fills the profile and updates the list. So links like index.html#G1 from
 *   other pages work, and the browser's back button returns to the previous Quadrat.
 * - "Auswahl aufheben" and the Escape key close the profile and remove the "#O3" from the address.
 * - Keyboard users: a Quadrat chosen with Enter or Space moves the focus to the profile, and closing
 *   the profile puts the focus back on that Quadrat of the map. The link "Steckbrief von O3 lesen"
 *   under the map and the jump link move the focus to the profile without changing the address.
 * - Filter changes redraw the open profile (hours and badges follow the chosen day and time).
 * - Elements that only work with JavaScript carry the attribute hidden in the HTML; init() shows them.
 *   Without JavaScript the page shows the static map image instead (see index.html, [V1]).
 * Classic script without modules, so the page also works by double-click (file://).
 */
(function () {
    "use strict";

    // Phones: below this width the profile is far below the map. The same width is the breakpoint of
    // the SVG variant's css/karte.css (there the map scrolls sideways); the CSS 3D map keeps at least 800 px.
    var SMALL_SCREEN = "(max-width: 47.99rem)";

    // Elements that stay hidden without JavaScript (attribute hidden in index.html).
    var JS_ONLY_IDS = ["anleitung", "filter", "karten-tipp", "karten-legende", "steckbrief"];

    var mapBox = document.getElementById("karte");
    var select = document.getElementById("quadrat-wahl");
    var panel = document.getElementById("steckbrief");
    var announcer = document.getElementById("ansage");
    var profileLink = document.getElementById("zum-steckbrief");            // "Steckbrief von O3 lesen"
    var profileLinkCode = document.getElementById("zum-steckbrief-code");

    // true after a choice with the keyboard: the profile gets the focus as soon as it is shown.
    var focusPanelAfterOpen = false;

    /* ---------------- helpers ---------------- */

    /** The real code for a text like "g1" or "M3A" (any case), or null if there is no such Quadrat. */
    function findCode(text) {
        var allCodes = Karte.codes();
        var wanted = text.trim().toLowerCase();
        for (var i = 0; i < allCodes.length; i++) {
            if (allCodes[i].toLowerCase() === wanted) {
                return allCodes[i];
            }
        }
        return null;
    }

    /** Code in the address (index.html#G1 -> "G1"), or null if the part after # is not a Quadrat. */
    function codeFromHash() {
        var text = window.location.hash.replace("#", "");
        try {
            text = decodeURIComponent(text);
        } catch (error) {
            return null;                  // broken escape sequence such as "#%E0"
        }
        return findCode(text);
    }

    /** True on narrow screens, where the profile is far below the map. */
    function isSmallScreen() {
        return window.matchMedia(SMALL_SCREEN).matches;
    }

    /** True if the visitor asked the operating system for less motion. */
    function reducedMotion() {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    /** Short message for screen readers (the element #ansage is a polite live region). */
    function announce(text) {
        announcer.textContent = text;
    }

    /**
     * Moves the focus to the profile panel (it has tabindex="-1"); focus() also scrolls it into view.
     * Used by the jump link and the link under the map instead of their href="#steckbrief", so the
     * address keeps "#O3" and a copied or bookmarked address still opens the Quadrat.
     */
    function focusPanel(event) {
        if (event) {
            event.preventDefault();
        }
        panel.focus();
    }

    /** Removes "#O3" from the address without scrolling and without a new history entry. */
    function removeHash() {
        if (window.location.hash === "") {
            return;
        }
        try {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
        } catch (error) {
            // Some browsers do not allow this for pages opened from the disk (file://).
            // Fallback: an empty hash; the scroll position is kept by hand.
            var x = window.scrollX;
            var y = window.scrollY;
            window.location.hash = "";
            window.scrollTo(x, y);
        }
    }

    /* ---------------- opening and closing ---------------- */

    /**
     * Shows a Quadrat: grows on the map, profile below, list and link under the map updated.
     * After a keyboard choice the profile gets the focus; on phones it scrolls into view.
     */
    function openBlock(code) {
        Karte.waehlen(code);
        Steckbrief.show(code);
        select.value = code;
        profileLinkCode.textContent = code;
        profileLink.hidden = false;
        var info = window.QUADRATE[code];
        announce("Quadrat " + code + (info && info.name ? ", " + info.name : "") + " gewählt. Der Steckbrief steht unter der Karte.");
        if (focusPanelAfterOpen) {
            focusPanelAfterOpen = false;
            panel.focus();
        } else if (isSmallScreen()) {
            panel.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
        }
    }

    /**
     * Ends the selection: map without selection, empty profile, list reset, address without "#O3".
     * If the focus was in the profile (e.g. on "Auswahl aufheben"), it goes back to the Quadrat on the map.
     */
    function closeBlock() {
        var code = Steckbrief.current();
        var focusWasInPanel = panel.contains(document.activeElement);
        Karte.waehlen(null);
        Steckbrief.clear();
        select.value = "";
        profileLink.hidden = true;
        removeHash();
        announce("Auswahl aufgehoben.");
        if (focusWasInPanel) {
            // Both map variants put data-code and tabindex="0" on the focusable element of a Quadrat.
            var block = code ? mapBox.querySelector('[data-code="' + code + '"][tabindex="0"]') : null;
            if (block) {
                block.focus();
            } else {
                select.focus();
            }
        }
    }

    /**
     * A visitor chose a Quadrat (map or list). Setting the hash triggers "hashchange", which opens it.
     * The same Quadrat again gives no "hashchange", so it is opened directly (scrolls again on phones).
     */
    function chooseBlock(code) {
        if (codeFromHash() === code) {
            openBlock(code);
        } else {
            window.location.hash = code;
        }
    }

    /** The address changed (our own hash, the back button, a link): follow it. */
    function onHashChange() {
        var code = codeFromHash();
        if (code) {
            openBlock(code);
        } else if (window.location.hash === "" && Steckbrief.current()) {
            closeBlock();                 // back to the address without a Quadrat
        }
        // Other hashes (e.g. "#inhalt" of the skip link) do not change the selection.
    }

    /* ---------------- start ---------------- */

    /** Fills the list "Quadrat wählen" with all 146 codes, open spaces with their name ("G1 – Marktplatz"). */
    function fillSelect() {
        var allCodes = Karte.codes();
        for (var i = 0; i < allCodes.length; i++) {
            var info = window.QUADRATE[allCodes[i]];
            var option = document.createElement("option");
            option.value = allCodes[i];
            option.textContent = allCodes[i] + (info && info.name ? " – " + info.name : "");
            select.appendChild(option);
        }
    }

    /** Builds the page: map, profile, filter, list; then opens the Quadrat from the address (if any). */
    function init() {
        // [V1] -> [V2]: the static image and its layout class give way to the interactive map.
        mapBox.classList.remove("map-fallback");
        Karte.init(mapBox, {
            // byKeyboard is true after Enter or Space on a block (both map variants pass it)
            onSelect: function (code, byKeyboard) {
                focusPanelAfterOpen = byKeyboard === true;
                chooseBlock(code);        // the map has already selected the block itself
            }
        });
        Steckbrief.init(panel, { onClose: closeBlock });
        Filter.init({
            onChange: function () {
                Steckbrief.refresh();     // hours and badges follow the filter
            }
        });
        fillSelect();
        for (var i = 0; i < JS_ONLY_IDS.length; i++) {
            document.getElementById(JS_ONLY_IDS[i]).hidden = false;
        }

        select.addEventListener("change", function () {
            if (select.value) {
                chooseBlock(select.value);
            } else {
                closeBlock();
            }
        });
        window.addEventListener("hashchange", onHashChange);
        document.querySelector(".jump-link").addEventListener("click", focusPanel);
        profileLink.addEventListener("click", focusPanel);
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && Steckbrief.current()) {
                closeBlock();
            }
        });

        var start = codeFromHash();
        if (start) {
            openBlock(start);             // index.html#G1 from another page
        }
    }

    init();
})();
