/*
 * filter.js - the four categories with their colours (window.KATEGORIEN) and the filter of the
 * index page (window.Filter): weekday, time and category decide how the map is coloured.       [V2]
 *
 * How it fits in:
 * - index.html contains the controls: the radios name="tag" (0 = Monday ... 6 = Sunday), the
 *   slider #zeit (minutes 0 ... 1440, steps of 30) with its readout #zeit-anzeige, the button
 *   #jetzt, the radios name="kategorie", the legend #legende and the live summary #zusammenfassung.
 * - On every change (also while the slider moves) Filter counts per Quadrat the places of the
 *   chosen category that are open at the chosen moment (js/oeffnungszeiten.js), turns each count
 *   into a colour level and hands the colours to the map: Karte.faerben({ "G2": "#D23F27", ... }).
 *   The second argument of Karte.faerben() gives the count as text ("9 geöffnet"): the map adds it
 *   to the accessible name of the Quadrat, so screen readers hear what the colour shows.
 * - The page starts at the current moment. If then hardly anything is open (at night or early in
 *   the morning), it shows 12:00 instead and the note #zeit-hinweis says so.
 * - js/app.js passes a callback onChange, so the open profile panel follows the filter.
 * - The colours are the same as the tokens --essen-1 ... --shoppen-4 in css/style.css.
 * Classic script without modules, so the page also works by double-click (file://).
 */

/* [V2] categories and their four colour levels: 1 open place, 2-3, 4-6, 7 and more */
window.KATEGORIEN = {
    essen: { name: "Essen", stufen: ["#F3C2B5", "#EA8B70", "#D23F27", "#A32F1C"] },
    trinken: { name: "Trinken", stufen: ["#F4DDA6", "#E9B955", "#D0901A", "#9A6710"] },
    kultur: { name: "Kultur", stufen: ["#D3CCF3", "#A597E6", "#6B5BD2", "#4A3BA3"] },
    shoppen: { name: "Shoppen", stufen: ["#BDE6DF", "#6CC7B7", "#25A792", "#156E60"] }
};

(function () {
    "use strict";

    var STEP = 30;                   // the slider moves in steps of 30 minutes
    var DEFAULT_CATEGORY = "essen";
    var FEW_OPEN = 10;               // fewer coloured Quadrate than this at the start: show 12:00 instead
    var FALLBACK_MINUTES = 720;      // 12:00

    // Plural words for the live summary ("In 23 Quadraten haben jetzt Geschäfte geöffnet").
    var SUMMARY_WORDS = {
        essen: "Restaurants oder Imbisse",
        trinken: "Cafés, Bars oder Kneipen",
        kultur: "Kulturorte",
        shoppen: "Geschäfte"
    };

    // The current filter. day: 0 = Monday ... 6 = Sunday; minutes: 0 ... 1440; category: key of KATEGORIEN.
    var state = { day: 0, minutes: 720, category: DEFAULT_CATEGORY };

    var handlers = {};               // { onChange: function (state) } from js/app.js
    var elements = {};               // the controls of index.html, found in init()
    var unknownCounts = {};          // category -> number of places without known hours (counted once)

    /* ---------------- counting and colours (no page elements needed) ---------------- */

    /** The current moment rounded to the slider steps: { day, minutes } (14:44 -> 14:30, 14:46 -> 15:00). */
    function now() {
        var date = new Date();
        var minutes = date.getHours() * 60 + date.getMinutes();
        return {
            day: Oeffnungszeiten.dayIndexOf(date),
            minutes: Math.round(minutes / STEP) * STEP     // 23:50 becomes 24:00 (end of the day)
        };
    }

    /**
     * Counts per Quadrat the places of a category that are open on the given day and time.
     * Returns { perBlock: { "G2": 5, ... } (only Quadrate with at least one), places: total number }.
     * Places with unknown hours are not counted.
     */
    function countOpen(day, minutes, category) {
        var perBlock = {};
        var places = 0;
        for (var i = 0; i < window.ORTE.length; i++) {
            var place = window.ORTE[i];
            if (place.kat === category && Oeffnungszeiten.isOpen(place, day, minutes) === true) {
                perBlock[place.quadrat] = (perBlock[place.quadrat] || 0) + 1;
                places = places + 1;
            }
        }
        return { perBlock: perBlock, places: places };
    }

    /** Colour level of a number of open places: -1 = none, 0 = one, 1 = two or three, 2 = four to six, 3 = seven and more. */
    function levelOf(count) {
        if (count <= 0) {
            return -1;
        }
        if (count === 1) {
            return 0;
        }
        if (count <= 3) {
            return 1;
        }
        if (count <= 6) {
            return 2;
        }
        return 3;
    }

    /** Colour for a number of open places in a category, or null for none (the map then keeps its grey). */
    function colourOf(category, count) {
        var level = levelOf(count);
        return level < 0 ? null : window.KATEGORIEN[category].stufen[level];
    }

    /** Number of places of a category whose opening hours are unknown (they never count as open). */
    function countUnknown(category) {
        if (unknownCounts[category] === undefined) {
            var count = 0;
            for (var i = 0; i < window.ORTE.length; i++) {
                if (window.ORTE[i].kat === category && !window.ORTE[i].zeiten) {
                    count = count + 1;
                }
            }
            unknownCounts[category] = count;
        }
        return unknownCounts[category];
    }

    /** True while the filter shows the current weekday and (rounded) time. */
    function isNow() {
        var current = now();
        return state.day === current.day && state.minutes === current.minutes;
    }

    /** German words for the chosen moment: "jetzt" or "am Mittwoch um 19:30". */
    function timePhrase() {
        if (isNow()) {
            return "jetzt";
        }
        return "am " + Oeffnungszeiten.DAY_NAMES[state.day] + " um " + Oeffnungszeiten.formatTime(state.minutes);
    }

    /* ---------------- page elements ---------------- */

    /** Value of the checked radio button of a group, or null. */
    function checkedValue(name) {
        var checked = document.querySelector('input[name="' + name + '"]:checked');
        return checked ? checked.value : null;
    }

    /** Checks the radio button of a group that has the given value. */
    function checkRadio(name, value) {
        var radio = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
        if (radio) {
            radio.checked = true;
        }
    }

    /** Shows the chosen time next to the slider, and tells screen readers "14:30 Uhr" instead of "870". */
    function showTime() {
        var text = Oeffnungszeiten.formatTime(state.minutes);
        // Only our own digits go into innerHTML here, no data from outside.
        elements.readout.innerHTML = text + " <span>Uhr</span>";
        elements.slider.setAttribute("aria-valuetext", text + " Uhr");
    }

    /** Legend under the map: colours and title of the chosen category. */
    function showLegend() {
        var legend = elements.legend;
        for (var key in window.KATEGORIEN) {
            legend.classList.remove("cat-" + key);     // the cat-... class sets the swatch colours (style.css)
        }
        legend.classList.add("cat-" + state.category);
        elements.legendTitle.textContent = window.KATEGORIEN[state.category].name + ": geöffnete Orte je Quadrat";
    }

    /**
     * Live summary under the map, e.g. "In 23 Quadraten haben jetzt Restaurants oder Imbisse geöffnet (58 Orte).
     * Bei 74 weiteren Orten sind keine Öffnungszeiten bekannt."
     */
    function showSummary(result) {
        var blocks = Object.keys(result.perBlock).length;
        var where;
        if (blocks === 0) {
            where = "In keinem Quadrat";
        } else if (blocks === 1) {
            where = "In 1 Quadrat";
        } else {
            where = "In " + blocks + " Quadraten";
        }
        var text = where + " haben " + timePhrase() + " " + SUMMARY_WORDS[state.category] + " geöffnet";
        if (result.places > 0) {
            text += " (" + result.places + (result.places === 1 ? " Ort" : " Orte") + ")";
        }
        text += ".";
        // Many places (above all in Kultur) have no known hours; say how many, so a pale map is explained.
        var unknown = countUnknown(state.category);
        if (unknown === 1) {
            text += " Bei einem weiteren Ort sind keine Öffnungszeiten bekannt.";
        } else if (unknown > 1) {
            text += " Bei " + unknown + " weiteren Orten sind keine Öffnungszeiten bekannt.";
        }
        elements.summary.textContent = text;
    }

    /** Recomputes everything after a change: colours of the map, legend, summary, then tells app.js. */
    function apply() {
        var result = countOpen(state.day, state.minutes, state.category);
        var colours = {};
        var texts = {};                  // "9 geöffnet": part of the accessible name of the Quadrat
        for (var code in result.perBlock) {
            colours[code] = colourOf(state.category, result.perBlock[code]);
            texts[code] = result.perBlock[code] + " geöffnet";
        }
        if (window.Karte) {
            Karte.faerben(colours, texts);
        }
        showTime();
        showLegend();
        showSummary(result);
        if (handlers.onChange) {
            handlers.onChange(state);
        }
    }

    /** Sets weekday and time to the current moment (start of the page and button "Jetzt"). */
    function setNow() {
        var current = now();
        state.day = current.day;
        state.minutes = current.minutes;
        checkRadio("tag", state.day);
        elements.slider.value = state.minutes;
    }

    /** A visitor changed the filter: the note about the 12:00 start is no longer needed. */
    function changedByVisitor() {
        if (elements.timeNote) {
            elements.timeNote.hidden = true;
        }
        apply();
    }

    /** Connects the controls: radios react to "change", the slider already while it moves ("input"). */
    function bindEvents() {
        var days = document.querySelectorAll('input[name="tag"]');
        for (var i = 0; i < days.length; i++) {
            days[i].addEventListener("change", function () {
                state.day = Number(checkedValue("tag"));
                changedByVisitor();
            });
        }
        elements.slider.addEventListener("input", function () {
            state.minutes = Number(elements.slider.value);
            changedByVisitor();
        });
        var categories = document.querySelectorAll('input[name="kategorie"]');
        for (var k = 0; k < categories.length; k++) {
            categories[k].addEventListener("change", function () {
                state.category = checkedValue("kategorie");
                changedByVisitor();
            });
        }
        if (elements.nowButton) {
            elements.nowButton.addEventListener("click", function () {
                setNow();
                changedByVisitor();
            });
        }
    }

    /**
     * Starts the filter: today and the current time, the category checked in the HTML (Essen),
     * then the first colouring. If fewer than FEW_OPEN Quadrate would be coloured now (night,
     * early morning), the filter starts at 12:00 of today and shows the note #zeit-hinweis.
     * options: { onChange(state) } is called after every change.
     * Call it after Karte.init(), so the colours reach the map.
     */
    function init(options) {
        handlers = options || {};
        elements = {
            slider: document.getElementById("zeit"),
            readout: document.getElementById("zeit-anzeige"),
            nowButton: document.getElementById("jetzt"),
            legend: document.getElementById("legende"),
            legendTitle: document.getElementById("legende-titel"),
            summary: document.getElementById("zusammenfassung"),
            timeNote: document.getElementById("zeit-hinweis")
        };
        setNow();
        state.category = checkedValue("kategorie") || DEFAULT_CATEGORY;
        var colouredNow = Object.keys(countOpen(state.day, state.minutes, state.category).perBlock).length;
        if (colouredNow < FEW_OPEN) {
            state.minutes = FALLBACK_MINUTES;
            elements.slider.value = FALLBACK_MINUTES;
            if (elements.timeNote) {
                elements.timeNote.hidden = false;
            }
        }
        bindEvents();
        apply();
    }

    // Only what other scripts use: js/app.js calls init(), js/steckbrief.js reads state,
    // levelOf() and isNow(). The other functions stay inside this file.
    window.Filter = {
        state: state,                // read only from outside: { day, minutes, category }
        init: init,
        levelOf: levelOf,
        isNow: isNow
    };
})();
