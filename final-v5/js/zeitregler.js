/*
 * zeitregler.js - the time slider of the map (0 to 24 Uhr in steps of 30 minutes, arrow buttons, readout
 * "19:30 Uhr") as a small building block for other pages. Offers window.Zeitregler.  [V2] Added 2026-10-13.
 *
 * How it fits in:
 * - The map (index.html) keeps its own slider in js/filter.js; this file copies its behaviour for
 *   merkliste.html ("Tag planen", "Treffen planen") and event-melden.html, so every page shows times the same
 *   way, independent of the computer's language (an <input type="time"> may show "7:30 PM").
 * - The look comes from css/style.css (.range, .range-scale, .time-readout, .filter-group__head) and
 *   css/zeitregler.css (arrow buttons and their row, copied from css/index.css).
 * - Times are minutes since 00:00 (0 ... 1440), as everywhere on the site; Oeffnungszeiten.formatTime()
 *   (js/oeffnungszeiten.js) writes them as "19:30".
 *
 * Interface:
 *   var regler = Zeitregler.setup({ slider, readout, back, forward, onChange });
 *   regler.get()          the chosen minutes, e.g. 1170
 *   regler.set(minutes)   moves the slider (to the nearest step) and shows exactly these minutes
 * onChange(minutes) is called when the visitor moves the slider or presses an arrow button.
 * Classic script without modules, so the pages also work by double-click (file://).
 */
(function () {
    "use strict";

    var STEP = 30;                   // like the map: steps of 30 minutes
    var MAX_MINUTES = 1440;          // 24:00

    /**
     * Connects one slider with its readout and arrow buttons. parts: { slider, readout, back, forward,
     * onChange }, the first four are elements. Returns { get, set }.
     */
    function setup(parts) {
        var minutes = Number(parts.slider.value);

        /** Writes "19:30 Uhr" next to the slider and for screen readers; greys out an arrow at 0:00 / 24:00. */
        function show() {
            var text = Oeffnungszeiten.formatTime(minutes);
            parts.readout.innerHTML = text + " <span>Uhr</span>";     // only our own digits, no data from outside
            parts.slider.setAttribute("aria-valuetext", text + " Uhr");
            parts.back.disabled = minutes <= 0;
            parts.forward.disabled = minutes >= MAX_MINUTES;
        }

        /** The visitor changed the time: show it and tell the page. */
        function changed() {
            show();
            if (parts.onChange) {
                parts.onChange(minutes);
            }
        }

        parts.slider.addEventListener("input", function () {
            minutes = Number(parts.slider.value);
            changed();
        });
        parts.back.addEventListener("click", function () {
            minutes = Math.max(0, Math.ceil(minutes / STEP) * STEP - STEP);              // one step back
            parts.slider.value = minutes;
            changed();
        });
        parts.forward.addEventListener("click", function () {
            minutes = Math.min(MAX_MINUTES, Math.floor(minutes / STEP) * STEP + STEP);   // one step on
            parts.slider.value = minutes;
            changed();
        });
        show();

        return {
            get: function () {
                return minutes;
            },
            set: function (newMinutes) {
                minutes = newMinutes;
                parts.slider.value = Math.round(newMinutes / STEP) * STEP;   // the slider only knows whole steps
                show();
            }
        };
    }

    window.Zeitregler = {
        setup: setup
    };
})();
