/*
 * event-melden.js - the form on event-melden.html: fills the list of Quadrate, allows only dates from
 * today on and stores a correct report in the browser.  [V2] Added 2026-10-13 (final-v3).
 *
 * How it fits in:
 * - The browser checks the fields itself (required, minlength, pattern, type="email", type="url", min
 *   of the date). The event "submit" only fires when all fields are correct, so this file does not
 *   repeat those checks; style.css shows the messages under wrong fields (:user-invalid).
 * - Events.report() (js/events.js) stores the event in localStorage ("quadrate-events-gemeldet").
 *   events.html then lists it with the label "Deine Meldung – noch nicht geprüft".
 * - Beginn and Ende are time sliders as on the map (js/zeitregler.js, 0 to 24 Uhr, since 2026-10-13); their
 *   minutes are stored as "19:30" like in js/data/events.js.
 * - "Wiederholung: jede Woche" (added 2026-10-13) stores the weekday of the date as "wochentage" with "ab"
 *   (the date) and an optional "bis" (last day), so events.html shows "jeden Donnerstag ab 15.10.".
 * - A wished highlight ("Als Anzeige hervorheben") is stored as "anzeigeGewuenscht", not as "anzeige":
 *   an entry only becomes a real "Anzeige" after the team has checked it (and it has been paid).
 * The names of the Quadrate come from window.QUADRATE (js/data/quadrate.js).
 * Classic script without modules, so the page also works by double-click (file://).
 */
(function () {
    "use strict";

    var form = null;           // <form id="event-formular">
    var result = null;         // <div id="event-ergebnis">: the thank-you note
    var startSlider = null;     // time sliders "Beginn" and "Ende" (js/zeitregler.js, 2026-10-13)
    var endSlider = null;

    /** One option per Quadrat in the list "Quadrat", e.g. "O1 (Paradeplatz)". */
    function fillBlocks() {
        var select = document.getElementById("quadrat");
        for (var code in window.QUADRATE) {
            var option = document.createElement("option");
            option.value = code;
            var name = window.QUADRATE[code].name;
            option.textContent = name ? code + " (" + name + ")" : code;
            select.appendChild(option);
        }
    }

    /**
     * "Wiederholung" (added 2026-10-13): the field "Letzter Termin" is only shown for weekly events, and it
     * may not lie before the date (min). The browser checks min itself when the form is sent.
     */
    function showRepeat() {
        var weekly = form.elements.wiederholung.value === "woche";
        var last = document.getElementById("bis");
        document.getElementById("bis-feld").hidden = !weekly;
        last.min = form.elements.datum.value || Events.isoDate(new Date());
        if (!weekly) {
            last.value = "";                       // a hidden field must not stop the form
        }
    }

    /** The form was sent and is correct: store the event, empty the form and say thank you. */
    function onSubmit(event) {
        event.preventDefault();                    // no page load: everything happens in the browser
        var fields = form.elements;
        var entry = {
            id: "m" + Date.now(),                  // unique enough: milliseconds since 1970
            titel: fields.titel.value.trim(),
            art: fields.art.value,
            quadrat: fields.quadrat.value,
            ort: fields.ort.value.trim(),
            text: fields.text.value.trim(),
            datum: fields.datum.value,             // "2026-10-24", the form of the data file (one-day events)
            beginn: Oeffnungszeiten.formatTime(startSlider.get()),   // slider minutes -> "19:30" as in the data file
            ende: Oeffnungszeiten.formatTime(endSlider.get()),
            anzeige: false,                        // only the team can make it an "Anzeige"
            anzeigeGewuenscht: fields.anzeige.checked,
            anbieter: fields.veranstalter.value.trim(),
            email: fields.email.value.trim(),      // for questions only, never shown on the page
            link: fields.link.value.trim() || null,
            gemeldet: true
        };
        // "jede Woche": the weekday of the date, from that day on (and up to the last day, if given),
        // in the form of js/data/events.js: { wochentage: [3], ab: "2026-10-15", bis: "2026-12-17" }
        if (fields.wiederholung.value === "woche") {
            entry.wochentage = [Oeffnungszeiten.dayIndexOf(new Date(fields.datum.value + "T12:00"))];
            entry.ab = entry.datum;
            if (fields.bis.value) {
                entry.bis = fields.bis.value;
            }
            delete entry.datum;
        }

        result.textContent = "";
        var notice = document.createElement("div");
        var title = document.createElement("p");
        title.className = "notice__title";
        var text = document.createElement("p");
        if (Events.report(entry)) {
            notice.className = "notice notice--success";
            title.textContent = "Danke, dein Event ist gemeldet!";
            text.textContent = "„" + entry.titel + "“ steht jetzt auf der Seite Events, markiert als „noch nicht geprüft“. ";
            var link = document.createElement("a");
            link.href = "events.html";
            link.textContent = "Zu den Events";
            text.appendChild(link);
            form.reset();
            startSlider.set(1140);                 // reset() moves the sliders back, the readouts follow here
            endSlider.set(1320);
            showRepeat();                          // reset() chose "nur an diesem Tag" again
        } else {
            notice.className = "notice notice--warning";
            title.textContent = "Nicht gespeichert";
            text.textContent = "Dein Browser erlaubt dieser Seite nicht, Daten zu speichern (zum Beispiel in einem privaten Fenster).";
        }
        notice.appendChild(title);
        notice.appendChild(text);
        result.appendChild(notice);
    }

    function init() {
        form = document.getElementById("event-formular");
        result = document.getElementById("event-ergebnis");
        startSlider = Zeitregler.setup({
            slider: document.getElementById("beginn"),
            readout: document.getElementById("beginn-anzeige"),
            back: document.getElementById("beginn-zurueck"),
            forward: document.getElementById("beginn-vor")
        });
        endSlider = Zeitregler.setup({
            slider: document.getElementById("ende"),
            readout: document.getElementById("ende-anzeige"),
            back: document.getElementById("ende-zurueck"),
            forward: document.getElementById("ende-vor")
        });
        fillBlocks();
        // Only dates from today on: the browser then rejects a past date by itself.
        document.getElementById("datum").min = Events.isoDate(new Date());
        form.addEventListener("submit", onSubmit);
        form.addEventListener("change", function (event) {
            if (event.target.name === "wiederholung" || event.target.name === "datum") {
                showRepeat();
            }
        });
        showRepeat();
    }

    init();
})();
