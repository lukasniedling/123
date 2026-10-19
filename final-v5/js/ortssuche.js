/*
 * ortssuche.js - place search on quadrate.html: find a restaurant, café, museum or shop by its name,
 * its kind ("Kino", "Pizza") or its address, and see in which Quadrat it lies and if it is open now.  [V2]
 * Added 2026-10-13.
 *
 * How it fits in:
 * - quadrate.html has the empty search block <section id="ortssuche"> (hidden without JavaScript) and
 *   loads, in this order: js/data/orte.js (window.ORTE), js/data/karte-daten.js (window.KARTE_DATEN,
 *   here only for the list of Quadrate and their rectangles), js/oeffnungszeiten.js
 *   (window.Oeffnungszeiten), js/steckbrief.js (window.Steckbrief, here only for typeName() and
 *   routeUrl()) and this file.
 * - The search can be limited to one Quadrat, and on request to its neighbours as well: Quadrate whose
 *   rectangles on the map lie at most NEIGHBOR_GAP apart (one street between them).
 * - Below the search the page has the form "Ort vorschlagen" (js/formular.js); the table of the Quadrate was removed on 2026-10-14.
 * - Every hit links to its Quadrat on the map (index.html#G1, opened there by js/app.js) and has a
 *   link "Route" to Google Maps and a button "Merken" (js/merkliste.js, since 2026-10-13), like in the
 *   profile panel.
 * - Since 2026-10-13 also: the tags of js/merkmale.js under every hit ("vegan", "draußen sitzen", "Pizza"),
 *   and they are part of the search text, so "vegan" finds all vegan places. The button "In meiner Nähe"
 *   (js/standort.js) asks for the visitor's position and sorts the hits by distance ("350 m").
 * - "Geöffnet" is counted at the real time of the visitor's computer (not a chosen time as on the map).
 * - Look: the list uses the classes of the profile panel from css/style.css (place-list, place, badge);
 *   css/verzeichnis.css (part 7) adds the layout of the search block.
 * The texts of the places come from OpenStreetMap, so they are escaped before they go into the HTML.
 * Classic script without modules, so the page also works by double-click (file://).
 */
(function () {
    "use strict";

    var MIN_LETTERS = 2;      // shorter texts would find almost everything
    var MAX_HITS = 50;        // more hits are counted, but not all drawn

    // Two Quadrate are neighbours if their rectangles on the map are at most this far apart (pixels of
    // the map plane, 50 px = about 54 m). Measured in js/data/karte-daten.js: neighbours with one street
    // between them are 4 to 36 px apart, the next Quadrat behind them at least 67 px.
    var NEIGHBOR_GAP = 50;

    // "In meiner Nähe": farther than this from every place (metres), the visitor is told how far away they are.
    var FAR_AWAY = 1000;

    // Words of the badge for the three states of a place (the same as in js/steckbrief.js).
    var STATUS_WORDS = { open: "geöffnet", closed: "geschlossen", unknown: "unbekannt" };

    var textInput = null;      // <input id="ortssuche-text">
    var categorySelect = null; // <select id="ortssuche-kategorie">
    var openCheckbox = null;   // <input id="ortssuche-offen">
    var blockSelect = null;    // <select id="ortssuche-quadrat">
    var aroundCheckbox = null; // <input id="ortssuche-umgebung">
    var statusLine = null;     // <p id="ortssuche-status">
    var list = null;           // <ul id="ortssuche-liste">
    var nearButton = null;     // <button id="ortssuche-naehe"> "In meiner Nähe"
    var nearStatus = null;     // <p id="ortssuche-naehe-status">
    var here = null;           // the visitor's position { lat, lon } while "In meiner Nähe" is on, else null
    var searchTexts = [];      // searchTexts[i] = simplified text of window.ORTE[i], built once at the start
    var rects = {};            // code -> [left, top, right, bottom] of the Quadrat on the map plane

    /* ---------------- neighbours of a Quadrat ---------------- */

    /**
     * Rectangle around one Quadrat of window.KARTE_DATEN: [left, top, right, bottom].
     * A Quadrat can have several parts (field "teile", e.g. a block cut by a passage) or be a square
     * (field "platz"); every part has a "box" [left, top, width, height]. The rectangle encloses all.
     */
    function rectOf(block) {
        var boxes = [];
        var parts = block.teile || [];
        for (var i = 0; i < parts.length; i++) {
            boxes.push(parts[i].box);
        }
        if (block.platz) {
            boxes.push(block.platz.box);
        }
        var rect = [Infinity, Infinity, -Infinity, -Infinity];
        for (var j = 0; j < boxes.length; j++) {
            var box = boxes[j];
            rect[0] = Math.min(rect[0], box[0]);
            rect[1] = Math.min(rect[1], box[1]);
            rect[2] = Math.max(rect[2], box[0] + box[2]);
            rect[3] = Math.max(rect[3], box[1] + box[3]);
        }
        return rect;
    }

    /**
     * Distance between two rectangles: the larger of the gaps left/right and above/below,
     * 0 if they touch. Corner neighbours (diagonal) count too, as both gaps are small there.
     */
    function gapBetween(a, b) {
        var gapX = Math.max(0, Math.max(a[0], b[0]) - Math.min(a[2], b[2]));
        var gapY = Math.max(0, Math.max(a[1], b[1]) - Math.min(a[3], b[3]));
        return Math.max(gapX, gapY);
    }

    /** Codes of all Quadrate around one Quadrat ("G1" -> ["F1", "F2", "G2", "H1", ...]). */
    function neighborsOf(code) {
        var result = [];
        for (var other in rects) {
            if (other !== code && gapBetween(rects[code], rects[other]) <= NEIGHBOR_GAP) {
                result.push(other);
            }
        }
        return result;
    }

    /* ---------------- search ---------------- */

    /** Makes text safe for innerHTML: & < > " ' become entities (place names come from OpenStreetMap). */
    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    /**
     * Text for comparing: small letters and no accents, so "cafe" also finds "Café".
     * normalize("NFD") splits "é" into "e" and the accent sign; replace() then deletes the accent signs:
     * \p{Diacritic} means "every accent sign", the flag u (Unicode) is needed for \p{...}.
     */
    function simplify(text) {
        return String(text).toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    }

    /** The moment now: day 0 = Monday ... 6 = Sunday and minutes since 00:00. */
    function now() {
        var date = new Date();
        return { day: Oeffnungszeiten.dayIndexOf(date), minutes: date.getHours() * 60 + date.getMinutes() };
    }

    /** State of a place at a moment: "open", "closed" or "unknown". */
    function statusOf(place, moment) {
        var open = Oeffnungszeiten.isOpen(place, moment.day, moment.minutes);
        if (open === null) {
            return "unknown";
        }
        return open ? "open" : "closed";
    }

    /** One hit: name, kind and address, links to the map and to Google Maps; today's hours and the badge. */
    function hitMarkup(place, moment) {
        var status = statusOf(place, moment);
        var details = Steckbrief.typeName(place) + (place.adresse ? " · " + place.adresse : "");
        var hours = Oeffnungszeiten.hoursText(place, moment.day);
        if (hours === "unbekannt") {
            hours = "keine Angabe";                          // the badge already says "unbekannt"
        } else {
            hours = "heute " + hours;
        }
        var html = '<li class="place place--cat cat-' + escapeHtml(place.kat) + '">';     // stripe in the category colour (2026-10-14)
        html += '<div>';
        html += '<span class="place__name">' + escapeHtml(place.name) + '</span>';
        html += '<span class="place__type">' + escapeHtml(details) + '</span>';
        html += window.Merkmale ? Merkmale.markup(place) : "";       // tags like "vegan" (js/merkmale.js)
        html += '<span class="place-search__links">' +
            '<a href="index.html#' + escapeHtml(place.quadrat) + '">Quadrat ' + escapeHtml(place.quadrat) +
            '<span class="visually-hidden"> auf der Karte</span></a>' +
            '<a href="' + escapeHtml(Steckbrief.routeUrl(place)) + '" target="_blank" rel="noopener">' +
            'Route<span class="visually-hidden"> zu ' + escapeHtml(place.name) +
            ' in Google Maps (öffnet in neuem Tab)</span></a>' +
            (window.Merkmale ? Merkmale.websiteMarkup(place, "place__web") : "") +
            '</span>';
        html += '</div>';
        html += '<div class="place__status">';
        var metres = here ? Standort.distanceTo(place, here) : null;
        if (metres !== null) {
            html += '<span class="place__distance">' + Standort.distanceText(metres) +
                '<span class="visually-hidden"> entfernt</span></span>';
        }
        html += '<span class="place__hours">' + escapeHtml(hours) + '</span>';
        html += '<span class="badge badge--' + status + '">' + STATUS_WORDS[status] + '</span>';
        html += saveButtonMarkup(place);
        html += '</div>';
        return html + '</li>';
    }

    /**
     * "Merken" button of a hit (added 2026-10-13), as in the profile on the map: saves the place in the
     * list of js/merkliste.js (window.Merkliste). aria-pressed tells whether it is saved; the click is
     * handled once for the whole list (onListClick), because the list is drawn again with every letter.
     */
    function saveButtonMarkup(place) {
        if (!window.Merkliste || !Merkliste.isAvailable()) {
            return "";
        }
        return '<button class="button button--secondary button--small place-search__save" type="button"' +
            ' data-id="' + escapeHtml(place.id) + '" aria-pressed="' + Merkliste.isSaved(place.id) + '">' +
            'Merken<span class="visually-hidden">: ' + escapeHtml(place.name) + '</span></button>';
    }

    /** A click in the list of hits: if it was a "Merken" button, save or remove the place. */
    function onListClick(event) {
        var button = event.target.closest(".place-search__save");
        if (button) {
            var saved = Merkliste.toggle(button.getAttribute("data-id"));
            button.setAttribute("aria-pressed", String(saved));
        }
    }

    /**
     * Runs the search with all fields and draws the hits. Without at least 2 letters, a category, a
     * Quadrat or the tick "nur jetzt geöffnet" the list stays empty. Hits are sorted by name (German
     * order); with a chosen Quadrat its own places come first, then those of the neighbours.
     */
    function search() {
        var words = simplify(textInput.value.trim());
        var category = categorySelect.value;               // "" = all categories
        var onlyOpen = openCheckbox.checked;
        var chosen = blockSelect.value;                    // "" = all Quadrate
        var moment = now();

        // The tick "auch umliegende Quadrate" only makes sense with a chosen Quadrat.
        aroundCheckbox.disabled = chosen === "";
        var area = null;                                   // null = everywhere, else the allowed codes
        var neighbors = [];
        if (chosen !== "") {
            area = [chosen];
            if (aroundCheckbox.checked) {
                neighbors = neighborsOf(chosen);
                area = area.concat(neighbors);
            }
        }

        if (words.length < MIN_LETTERS && category === "" && !onlyOpen && chosen === "" && here === null) {
            list.innerHTML = "";
            statusLine.textContent = "Gib mindestens " + MIN_LETTERS + " Buchstaben ein oder wähle eine Kategorie oder ein Quadrat.";
            return;
        }

        var hits = [];
        for (var i = 0; i < window.ORTE.length; i++) {
            var place = window.ORTE[i];
            if (category !== "" && place.kat !== category) {
                continue;
            }
            if (area !== null && area.indexOf(place.quadrat) < 0) {
                continue;
            }
            if (words.length >= MIN_LETTERS && searchTexts[i].indexOf(words) < 0) {
                continue;
            }
            if (onlyOpen && statusOf(place, moment) !== "open") {
                continue;
            }
            hits.push(place);
        }
        hits.sort(function (a, b) {
            // 0. "In meiner Nähe" is on: the nearest first, places without a position at the end
            if (here !== null) {
                var metresA = Standort.distanceTo(a, here);
                var metresB = Standort.distanceTo(b, here);
                if (metresA === null || metresB === null) {
                    return (metresA === null ? 1 : 0) - (metresB === null ? 1 : 0);
                }
                return metresA - metresB;
            }
            // 0b. places with the feature of "Was dir wichtig ist" (konto.html) first (2026-10-14)
            var wishA = window.Merkmale && Merkmale.matchesWish(a) ? 0 : 1;
            var wishB = window.Merkmale && Merkmale.matchesWish(b) ? 0 : 1;
            if (wishA !== wishB) {
                return wishA - wishB;
            }
            // 1. places in the chosen Quadrat before those of the neighbours (0 comes before 1)
            var rankA = a.quadrat === chosen ? 0 : 1;
            var rankB = b.quadrat === chosen ? 0 : 1;
            if (rankA !== rankB) {
                return rankA - rankB;
            }
            // 2. inside each group by name
            return a.name.localeCompare(b.name, "de");
        });

        var html = "";
        var shown = Math.min(hits.length, MAX_HITS);
        for (var j = 0; j < shown; j++) {
            html += hitMarkup(hits[j], moment);
        }
        list.innerHTML = html;

        // Where was searched: "in G1" or "in G1 und den umliegenden Quadraten F1, F2, ..."
        var where = "";
        if (chosen !== "") {
            where = " in " + chosen;
            if (neighbors.length > 0) {
                where += " und den umliegenden Quadraten " + neighbors.join(", ");
            }
        }
        var order = here !== null ? " Die nächsten stehen oben." : "";     // "In meiner Nähe" is on
        var wanted = window.Verlauf ? Verlauf.preferences().merkmal : "";
        if (wanted !== "" && here === null) {
            order = " Orte mit „" + wanted + "“ (dir wichtig, siehe Konto) stehen oben.";
        }
        var time = Oeffnungszeiten.DAY_NAMES[moment.day] + ", " + Oeffnungszeiten.formatTime(moment.minutes) + " Uhr";
        if (hits.length === 0) {
            statusLine.textContent = "Keine Orte" + where + " gefunden. Versuch ein anderes Wort, eine andere Kategorie oder ein anderes Quadrat.";
        } else if (hits.length > MAX_HITS) {
            statusLine.textContent = hits.length + " Orte" + where + " gefunden, die ersten " + MAX_HITS +
                " stehen hier. Gib mehr ein, um die Suche einzugrenzen." + order + " Geöffnet: Stand jetzt (" + time + ").";
        } else {
            statusLine.textContent = (hits.length === 1 ? "1 Ort" : hits.length + " Orte") +
                where + " gefunden." + order + " Geöffnet: Stand jetzt (" + time + ").";
        }
    }

    /**
     * Button "In meiner Nähe": the first click asks for the position (js/standort.js) and sorts the hits
     * by distance, the next click turns it off again. The position is only kept in the variable here.
     */
    function onNearClick() {
        if (here !== null) {
            here = null;
            nearButton.setAttribute("aria-pressed", "false");
            nearStatus.textContent = "";
            search();
            return;
        }
        nearButton.disabled = true;
        nearStatus.textContent = "Standort wird bestimmt …";
        Standort.find(function (position) {
            here = position;
            nearButton.disabled = false;
            nearButton.setAttribute("aria-pressed", "true");
            var closest = Standort.nearest(window.ORTE, here);
            nearStatus.textContent = closest && closest.metres > FAR_AWAY ?
                "Du bist etwa " + Standort.distanceText(closest.metres) + " von den Quadraten entfernt." :
                "Sortiert nach Entfernung von deinem Standort.";
            search();
        }, function (message) {
            nearButton.disabled = false;
            nearStatus.textContent = message;
        });
    }

    /** Fills the list "Quadrat" with one option per Quadrat (A1 ... U6, the order of the map data). */
    function fillBlockSelect() {
        var blocks = window.KARTE_DATEN.quadrate;
        for (var i = 0; i < blocks.length; i++) {
            var option = document.createElement("option");
            option.value = blocks[i].code;
            option.textContent = blocks[i].code;
            blockSelect.appendChild(option);
        }
    }

    /** Start: finds the elements, builds the search texts once, shows the block and listens to the fields. */
    function init() {
        var block = document.getElementById("ortssuche");
        if (!block || !window.ORTE || !window.KARTE_DATEN || !window.Oeffnungszeiten || !window.Steckbrief) {
            return;                   // a file is missing: the block stays hidden, the table still works
        }
        textInput = document.getElementById("ortssuche-text");
        categorySelect = document.getElementById("ortssuche-kategorie");
        openCheckbox = document.getElementById("ortssuche-offen");
        blockSelect = document.getElementById("ortssuche-quadrat");
        aroundCheckbox = document.getElementById("ortssuche-umgebung");
        statusLine = document.getElementById("ortssuche-status");
        list = document.getElementById("ortssuche-liste");
        list.addEventListener("click", onListClick);       // "Merken" (event delegation, added 2026-10-13)

        // The rectangle of every Quadrat, once, for neighborsOf().
        var blocks = window.KARTE_DATEN.quadrate;
        for (var b = 0; b < blocks.length; b++) {
            rects[blocks[b].code] = rectOf(blocks[b]);
        }
        fillBlockSelect();

        // Name, German kind, address, Quadrat and tags of every place in one text, so one search finds all.
        for (var i = 0; i < window.ORTE.length; i++) {
            var place = window.ORTE[i];
            var tags = window.Merkmale ? Merkmale.tags(place).join(" ") : "";
            searchTexts.push(simplify(place.name + " " + Steckbrief.typeName(place) + " " +
                (place.adresse || "") + " " + place.quadrat + " " + tags));
        }

        // "In meiner Nähe" only if the browser can find the position and the positions are loaded.
        nearButton = document.getElementById("ortssuche-naehe");
        nearStatus = document.getElementById("ortssuche-naehe-status");
        if (window.Standort && window.MERKMALE && navigator.geolocation) {
            nearButton.addEventListener("click", onNearClick);
        } else {
            nearButton.parentNode.hidden = true;
        }

        // "input" fires on every typed letter, "change" when a list or a tick changes.
        textInput.addEventListener("input", search);
        categorySelect.addEventListener("change", search);
        openCheckbox.addEventListener("change", search);
        blockSelect.addEventListener("change", search);
        aroundCheckbox.addEventListener("change", search);

        block.hidden = false;
        search();
        // preferences of the account (js/verlauf.js, 2026-10-14): that file is loaded after this one, so they are
        // applied when the whole page is there ("DOMContentLoaded" comes after all scripts at the end of <body>)
        document.addEventListener("DOMContentLoaded", applyPreferences);
    }

    /**
     * "Deine Vorlieben" on konto.html (added 2026-10-14): the search starts with the favourite category. The feature
     * of "Was dir wichtig ist" is not typed in: places with it come first in every search (see search()).
     */
    function applyPreferences() {
        if (!window.Verlauf) {
            return;
        }
        var wishes = Verlauf.preferences();
        if (!wishes.kategorie) {
            return;
        }
        categorySelect.value = wishes.kategorie;
        search();
    }

    init();
})();
