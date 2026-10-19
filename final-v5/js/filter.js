/*
 * filter.js - the four categories with their colours (window.KATEGORIEN) and the filter of the
 * index page (window.Filter): weekday, time and category decide how the map is coloured.       [V2]
 *
 * How it fits in:
 * - index.html contains the controls: the radios name="tag" (0 = Monday ... 6 = Sunday), the
 *   slider #zeit (minutes 0 ... 1440, steps of 30) with its readout #zeit-anzeige, the arrow
 *   buttons #zeit-zurueck and #zeit-vor (one step each), the button #jetzt, the radios
 *   name="kategorie", the legend #legende and the live summary #zusammenfassung.
 * - On every change (also while the slider moves) Filter counts per Quadrat the places of the
 *   chosen category that are open at the chosen moment (js/oeffnungszeiten.js), turns each count
 *   into a colour level and hands the colours to the map: Karte.faerben({ "G2": "#D23F27", ... }).
 *   The second argument of Karte.faerben() gives the count as text ("9 geöffnet"): the map adds it
 *   to the accessible name of the Quadrat, so screen readers hear what the colour shows.
 * - The page always starts at the current moment, so at night the map shows the night mood
 *   (decision D-040, replaces D-019). If hardly any place to eat is open then but more bars and
 *   pubs are, it starts with the category Trinken; the note #zeit-hinweis says what happened.
 * - js/app.js passes a callback onChange, so the open profile panel follows the filter.
 * - The colours are the same as the tokens --essen-1 ... --shoppen-4 in css/style.css.
 * - The button #zeitraffer (time lapse, added 2026-10-13) moves the time on by PLAY_STEP minutes every
 *   PLAY_DELAY milliseconds up to 24:00, so the map shows how the city fills and empties over the day. A second click,
 *   the slider, the arrows or "Jetzt" stop it.
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

    var STEP = 30;                   // the arrow buttons move by 30 minutes (the slider itself by 15, since 2026-10-14)
    var MAX_MINUTES = 1440;          // 24:00, the right end of the slider
    var DEFAULT_CATEGORY = "essen";
    var FEW_OPEN = 10;               // fewer coloured Quadrate than this at the start: try Trinken, show a note
    // time lapse (2026-10-14): a quarter of an hour every 0.3 s, the whole day in about 30 s. While it runs, the
    // sky, ground and sun fade exactly 0.3 s per step and at an even speed (class map-root--play, css/karte.css), so one fade
    // ends when the next begins and the picture changes at one steady speed. Keep PLAY_DELAY equal to that 300ms.
    var PLAY_STEP = 15;
    var PLAY_DELAY = 300;

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
    var playTimer = null;            // the running time lapse (setInterval), or null
    var frameRequested = false;      // true while apply() is planned for the next screen frame (applySoon)

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
        // at 0:00 there is no earlier step and at 24:00 no later one
        if (elements.backButton) {
            elements.backButton.disabled = state.minutes <= 0;
            elements.forwardButton.disabled = state.minutes >= MAX_MINUTES;
        }
    }

    /** Arrow buttons next to the slider: moves the time by one step (direction -1 or +1), not past 0:00 or 24:00. */
    function stepTime(direction) {
        // to the next full or half hour: from 19:10 back to 19:00 and on to 19:30 (the slider may stand between)
        var minutes = direction < 0 ? Math.ceil(state.minutes / STEP) * STEP - STEP : Math.floor(state.minutes / STEP) * STEP + STEP;
        if (minutes < 0 || minutes > MAX_MINUTES) {
            return;
        }
        state.minutes = minutes;
        elements.slider.value = minutes;
        changedByVisitor();
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
            // Time of day of the map without steps (2026-10-14; before, moodOf() chose one of four moods and
            // duskOf() a veil): js/karte.js mixes sky, ground, colours, sun and lights minute by minute.
            if (Karte.tageszeit) {
                Karte.tageszeit(state.minutes);
            }
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

    /**
     * Time lapse: stops it (if it runs). The summary under the map is read aloud again (aria-live), and it
     * is written once more so screen readers hear where the time lapse ended.
     */
    function stopPlay() {
        if (playTimer === null) {
            return;
        }
        clearInterval(playTimer);
        playTimer = null;
        document.querySelector(".map-root").classList.remove("map-root--play");
        elements.playButton.setAttribute("aria-pressed", "false");
        elements.summary.setAttribute("aria-live", "polite");
        apply();
    }

    /**
     * Time lapse: starts at the chosen time (at 24:00 from 0:00 again) and moves on by one step every
     * PLAY_DELAY milliseconds until 24:00. While it runs the summary is not read aloud at every step
     * (aria-live="off"), otherwise screen readers would talk all the time.
     */
    function startPlay() {
        if (state.minutes >= MAX_MINUTES) {
            state.minutes = 0;
            elements.slider.value = 0;
        }
        elements.playButton.setAttribute("aria-pressed", "true");
        document.querySelector(".map-root").classList.add("map-root--play");   // even speed (css/karte.css)
        elements.summary.setAttribute("aria-live", "off");
        changedByVisitor();
        playTimer = setInterval(function () {
            if (state.minutes >= MAX_MINUTES) {
                stopPlay();
                return;
            }
            state.minutes = Math.min(MAX_MINUTES, state.minutes + PLAY_STEP);
            elements.slider.value = state.minutes;
            apply();
        }, PLAY_DELAY);
    }

    /**
     * Recomputes at the next screen frame (added 2026-10-14). While the slider is dragged, the browser can send
     * several "input" events per frame; requestAnimationFrame runs apply() only once per frame, just before the
     * screen is drawn. So the map does not do work nobody sees, and the colours glide instead of stuttering.
     */
    function applySoon() {
        if (frameRequested) {
            return;                      // already planned for this frame
        }
        frameRequested = true;
        // Safety net: if the browser draws no frame (e.g. the window is hidden), apply after 100 ms anyway.
        // Whichever comes first does the work; the other one finds frameRequested false and does nothing.
        window.requestAnimationFrame(applyPlanned);
        window.setTimeout(applyPlanned, 100);
    }

    /** Runs a planned apply() once (see applySoon). */
    function applyPlanned() {
        if (!frameRequested) {
            return;                      // already done by the other of the two
        }
        frameRequested = false;
        apply();
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
            stopPlay();                  // moving the slider by hand ends the time lapse
            state.minutes = Number(elements.slider.value);
            if (elements.timeNote) {
                elements.timeNote.hidden = true;
            }
            applySoon();                 // smoother (2026-10-14): at most once per screen frame while dragging
        });
        if (elements.backButton) {
            elements.backButton.addEventListener("click", function () {
                stopPlay();
                stepTime(-1);
            });
            elements.forwardButton.addEventListener("click", function () {
                stopPlay();
                stepTime(1);
            });
        }
        if (elements.playButton) {
            elements.playButton.addEventListener("click", function () {
                if (playTimer === null) {
                    startPlay();
                } else {
                    stopPlay();
                }
            });
        }
        var categories = document.querySelectorAll('input[name="kategorie"]');
        for (var k = 0; k < categories.length; k++) {
            categories[k].addEventListener("change", function () {
                state.category = checkedValue("kategorie");
                changedByVisitor();
            });
        }
        if (elements.nowButton) {
            elements.nowButton.addEventListener("click", function () {
                stopPlay();
                setNow();
                changedByVisitor();
            });
        }
    }

    /**
     * Starts the filter: today and the current time, the category checked in the HTML (Essen),
     * then the first colouring. If fewer than FEW_OPEN Quadrate would be coloured now (night,
     * early morning), it starts with Trinken when more bars are open than restaurants, and the
     * note #zeit-hinweis explains it. The time stays the current time in every case.
     * options: { onChange(state) } is called after every change.
     * Call it after Karte.init(), so the colours reach the map.
     */
    function init(options) {
        handlers = options || {};
        elements = {
            slider: document.getElementById("zeit"),
            readout: document.getElementById("zeit-anzeige"),
            nowButton: document.getElementById("jetzt"),
            backButton: document.getElementById("zeit-zurueck"),
            forwardButton: document.getElementById("zeit-vor"),
            playButton: document.getElementById("zeitraffer"),
            legend: document.getElementById("legende"),
            legendTitle: document.getElementById("legende-titel"),
            summary: document.getElementById("zusammenfassung"),
            timeNote: document.getElementById("zeit-hinweis")
        };
        setNow();
        state.category = checkedValue("kategorie") || DEFAULT_CATEGORY;
        // favourite category of the account (js/verlauf.js, "Deine Vorlieben" on konto.html, 2026-10-14): the map
        // starts with it, and then it does not switch to Trinken by itself at night
        var favourite = window.Verlauf ? Verlauf.preferences().kategorie : "";
        if (favourite && window.KATEGORIEN[favourite]) {
            state.category = favourite;
            checkRadio("kategorie", favourite);
        }
        var colouredNow = Object.keys(countOpen(state.day, state.minutes, state.category).perBlock).length;
        if (colouredNow < FEW_OPEN && !favourite) {
            var barsNow = Object.keys(countOpen(state.day, state.minutes, "trinken").perBlock).length;
            var note = "Gerade hat kaum etwas geöffnet. Mit dem Regler siehst du andere Uhrzeiten, „Jetzt“ springt zurück.";
            if (barsNow > colouredNow) {
                state.category = "trinken";
                checkRadio("kategorie", "trinken");
                note = "Gerade haben vor allem Bars und Kneipen geöffnet, deshalb zeigt die Karte zuerst Trinken.";
            }
            if (elements.timeNote) {
                elements.timeNote.textContent = note;
                elements.timeNote.hidden = false;
            }
        }
        bindEvents();
        apply();
    }

    // Only what other scripts use: js/app.js calls init(), js/steckbrief.js reads state,
    // levelOf(), isNow() and isPlaying(). The other functions stay inside this file.
    window.Filter = {
        state: state,                // read only from outside: { day, minutes, category }
        init: init,
        levelOf: levelOf,
        isNow: isNow,
        isPlaying: function () {     // true while the time lapse runs (js/app.js waits with the lists, 2026-10-14)
            return playTimer !== null;
        }
    };
})();
