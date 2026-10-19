/*
 * events-seite.js - the page events.html: lists the events of the chosen period and kind, the paid
 * ones once more on top as "Hervorgehoben" with the label "Anzeige".  [V2] Added 2026-10-13.
 *
 * How it fits in:
 * - window.Events (js/events.js) gives the occurrences of the events (one per day) and the texts for
 *   day and time; the events themselves are in window.EVENTS (js/data/events.js).
 * - window.QUADRATE (js/data/quadrate.js) gives the names of the Quadrate, window.Steckbrief
 *   (js/steckbrief.js) the Google Maps route links.
 * - draw() runs at the start, when "Zeitraum" or "Art" changes, and every minute (setInterval), so
 *   "läuft gerade" and the end of past events follow the clock.
 * - Look (2026-10-13): each day starts with a calendar sheet, every event has the colour of its kind
 *   (class event--art-musik ..., css/events.css), and a "Merken" button saves it in the list of
 *   js/merkliste.js (window.Merkliste); merkliste.html shows saved events. Since 2026-10-14 an event with
 *   several dates has "Termin merken" (only this date) and "Reihe merken" (every date).
 * - Search and month view (added 2026-10-13): the field "Suchen" filters by title, text, place, Quadrat
 *   and kind. "Ansicht: Monat" shows a calendar of one month (fillMonth): a button per day with one dot
 *   per event in the colour of its kind; a click on a day lists that day's events below the calendar.
 * Everything is built with createElement and textContent, never as HTML.
 * Classic script without modules, so the page also works by double-click (file://).
 */
(function () {
    "use strict";

    // Names for the calendar sheets and the full date (added 2026-10-13).
    var MONTHS_SHORT = ["JAN", "FEB", "MÄR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"];
    var MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September",
        "Oktober", "November", "Dezember"];
    var WEEKDAYS_SHORT = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"];
    var WEEKDAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

    var periodSelect = null;   // <select id="events-zeitraum">: number of days
    var kindSelect = null;     // <select id="events-art">: "" = all
    var searchInput = null;    // <input id="events-suche"> (added 2026-10-13)
    var monthFirst = null;     // month view: the first day of the shown month (a Date)
    var chosenIso = null;      // month view: the chosen day ("2026-10-16"), or null for the default day
    var MAX_DOTS = 4;          // month view: at most this many dots per day, then "+2"

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

    /** "Freitag, 16. Oktober": the full date under the day heading. getDay() counts 0 = Sunday, we 0 = Monday. */
    function fullDate(date) {
        return WEEKDAYS[(date.getDay() + 6) % 7] + ", " + date.getDate() + ". " + MONTHS[date.getMonth()];
    }

    /** "Paradeplatz · O1 Paradeplatz" or "Planken · P7": the place and its Quadrat as a link to the map. */
    function placeLine(event) {
        var line = element("p", "event__place");
        line.appendChild(document.createTextNode(event.ort + " · "));
        var link = element("a", "", "Quadrat " + event.quadrat);
        link.href = "index.html#" + event.quadrat;
        line.appendChild(link);
        line.appendChild(document.createTextNode(" · "));
        var route = element("a", "", "Route");
        // Steckbrief.routeUrl needs a place: here the name of the event's place and its Quadrat
        route.href = Steckbrief.routeUrl({ name: event.ort, adresse: null, quadrat: event.quadrat });
        route.target = "_blank";
        route.rel = "noopener";
        route.appendChild(element("span", "visually-hidden", " zu " + event.ort + " in Google Maps (öffnet in neuem Tab)"));
        line.appendChild(route);
        return line;
    }

    /** One occurrence as a list item: time (and "läuft gerade"), title, kind, place, text, ad label. */
    function eventItem(occurrence, now, withDay) {
        var event = occurrence.event;
        // class event--art-musik ...: colour of the kind of event (css/events.css), since 2026-10-13
        var item = element("li", "event event--art-" + event.art + (event.anzeige ? " event--ad" : ""));
        if (withDay) {
            item.appendChild(calendarSheet(occurrence.date, "event__cal"));   // cards on top: with their day
        }
        var body = element("div", "event__body");
        item.appendChild(body);
        fillEventBody(body, occurrence, now, withDay);
        return item;
    }

    /**
     * A small calendar sheet for a day (added 2026-10-13): month on top ("OKT"), the day big ("16"), the day of
     * the week below ("FR"). Only decoration (aria-hidden): the same date stands as text next to it.
     */
    function calendarSheet(date, className) {
        var sheet = element("span", "cal " + className);
        sheet.setAttribute("aria-hidden", "true");
        sheet.appendChild(element("span", "cal__month", MONTHS_SHORT[date.getMonth()]));
        sheet.appendChild(element("span", "cal__day", String(date.getDate())));
        sheet.appendChild(element("span", "cal__weekday", WEEKDAYS_SHORT[(date.getDay() + 6) % 7]));
        return sheet;
    }

    /**
     * The "Merken" buttons of an event (added 2026-10-13): they save an id in the same list as the places
     * (js/merkliste.js); merkliste.html shows saved events in a section of their own. Since 2026-10-14 an event
     * with several dates gets two buttons: "Termin merken" saves only this date (id "e05@2026-10-16", see
     * Events.occurrenceId()), "Reihe merken" saves every date (id "e05"). An event with one date keeps "Merken".
     */
    function saveButtons(occurrence, now) {
        var event = occurrence.event;
        var buttons = document.createDocumentFragment();   // a container that disappears when it is inserted
        if (Events.repeatText(event)) {
            buttons.appendChild(saveButton(Events.occurrenceId(event, occurrence.iso), "Termin merken",
                event.titel + ", nur der Termin " + Events.dayText(occurrence, now)));
            buttons.appendChild(saveButton(event.id, "Reihe merken", event.titel + ", alle Termine"));
        } else {
            buttons.appendChild(saveButton(event.id, "Merken", event.titel));
        }
        return buttons;
    }

    /** One "Merken" button for an id; the hidden text tells screen readers what it saves. */
    function saveButton(id, label, hiddenText) {
        var button = element("button", "button button--secondary button--small event__save", label);
        button.type = "button";
        button.setAttribute("data-id", id);
        button.appendChild(element("span", "visually-hidden", ": " + hiddenText));
        showSaved(button, Merkliste.ids());
        button.addEventListener("click", function () {
            var saved = Merkliste.toggle(id);
            if (saved && id.indexOf("@") < 0) {
                // the whole series is saved now: single dates of it saved before are not needed any more
                var ids = Merkliste.ids();
                for (var i = 0; i < ids.length; i++) {
                    if (ids[i].indexOf(id + "@") === 0) {
                        Merkliste.toggle(ids[i]);
                    }
                }
            }
            // the same event may stand several times (on top, in the list, other dates): update every button
            var all = document.querySelectorAll(".event__save");
            var now = Merkliste.ids();
            for (var j = 0; j < all.length; j++) {
                showSaved(all[j], now);
            }
        });
        return button;
    }

    /**
     * Shows on a button whether its id is in the list (aria-pressed: sand colour and a tick, css/events.css).
     * A date of a saved series counts as saved: its button "Termin merken" is pressed and cannot be clicked
     * (disabled) as long as the whole series is saved.
     */
    function showSaved(button, ids) {
        var id = button.getAttribute("data-id");
        var series = id.split("@")[0];                    // "e05@2026-10-16" -> "e05"
        var bySeries = id !== series && ids.indexOf(series) >= 0;
        button.setAttribute("aria-pressed", String(ids.indexOf(id) >= 0 || bySeries));
        button.disabled = bySeries;
    }

    /** Everything of one event apart from the calendar sheet: time and labels, title, kind, place, text, buttons. */
    function fillEventBody(item, occurrence, now, withDay) {
        var event = occurrence.event;
        var head = element("p", "event__when");
        var time = element("span", "event__time");
        if (withDay) {
            // the calendar sheet shows the day; screen readers do not read it (aria-hidden), so it stays as hidden text
            time.appendChild(element("span", "visually-hidden", Events.dayText(occurrence, now) + ", "));
        }
        time.appendChild(document.createTextNode(Events.timeText(event)));
        head.appendChild(time);
        if (Events.isRunning(occurrence, now)) {
            head.appendChild(element("span", "badge badge--open", "läuft gerade"));
        }
        if (event.anzeige) {
            head.appendChild(element("span", "event__ad-label", "Anzeige"));
        }
        if (event.gemeldet) {
            // reported with event-melden.html in this browser: not checked by the team yet
            head.appendChild(element("span", "event__report-label", "Deine Meldung – noch nicht geprüft"));
        }
        item.appendChild(head);

        item.appendChild(element("h4", "event__title", event.titel));
        var kind = element("p", "event__kind");
        kind.appendChild(element("span", "event__art", Events.ART_NAMES[event.art] || event.art));
        var repeat = Events.repeatText(event);
        if (repeat) {
            kind.appendChild(document.createTextNode(repeat));
        }
        item.appendChild(kind);
        item.appendChild(placeLine(event));
        item.appendChild(element("p", "event__text", event.text));
        if (event.anzeige && event.anbieter) {
            item.appendChild(element("p", "event__sponsor", "Anzeige von " + event.anbieter));
        }
        if (event.link) {
            var more = element("a", "event__link", "Zur Seite des Veranstalters");
            more.href = event.link;
            item.appendChild(more);
        }
        if (event.gemeldet) {
            var note = "Gemeldet von " + event.anbieter + (event.anzeigeGewuenscht ? " · Hervorhebung als Anzeige gewünscht" : "");
            item.appendChild(element("p", "event__sponsor", note));
        }
        var actions = element("div", "event__actions");
        if (window.Merkliste && Merkliste.isAvailable()) {
            actions.appendChild(saveButtons(occurrence, now));
        }
        if (event.gemeldet) {
            var remove = element("button", "button button--secondary button--small event__remove", "Meldung löschen");
            remove.type = "button";
            remove.setAttribute("aria-label", "Meldung löschen: " + event.titel);
            remove.addEventListener("click", function () {
                Events.removeReport(event.id);
                draw();
            });
            actions.appendChild(remove);
        }
        item.appendChild(actions);
    }

    /** The paid entries of the period once more on top, each event only once (its next date). */
    function fillHighlights(occurrences, now) {
        var area = document.getElementById("events-hervorgehoben-bereich");
        var list = document.getElementById("events-hervorgehoben");
        list.textContent = "";
        var shown = [];                                    // ids of events already listed
        for (var i = 0; i < occurrences.length; i++) {
            var event = occurrences[i].event;
            if (event.anzeige && shown.indexOf(event.id) < 0) {
                shown.push(event.id);
                list.appendChild(eventItem(occurrences[i], now, true));
            }
        }
        area.hidden = shown.length === 0;
    }

    /**
     * All occurrences grouped by day: a heading per day ("heute", "morgen", "Do, 24.10."), then the events.
     * container: the element to fill (#events-liste, or #events-monat-liste in the month view);
     * emptyText: what to say if there is nothing.
     */
    function fillDays(occurrences, now, container, emptyText) {
        container.textContent = "";
        if (occurrences.length === 0) {
            container.appendChild(element("p", "events-empty", emptyText));
            return;
        }
        var currentDay = "";
        var list = null;
        for (var i = 0; i < occurrences.length; i++) {
            var occurrence = occurrences[i];
            if (occurrence.iso !== currentDay) {           // a new day starts: heading and a new list
                currentDay = occurrence.iso;
                var day = element("section", "panel events-day");
                // heading with a calendar sheet: "heute" / "morgen" / "Do, 15.10." and the full date
                var title = element("h3", "events-day__title");
                title.appendChild(calendarSheet(occurrence.date, "events-day__cal"));
                // "heute" / "morgen" with the full date below; later days: "Donnerstag" with "15. Oktober" below
                var label = element("span", "events-day__label");
                var dayWord = Events.dayText(occurrence, now);
                var weekday = WEEKDAYS[(occurrence.date.getDay() + 6) % 7];
                var isNear = dayWord === "heute" || dayWord === "morgen";
                label.appendChild(element("span", "events-day__when", isNear ? dayWord : weekday));
                label.appendChild(element("span", "events-day__date", isNear ? fullDate(occurrence.date) :
                    occurrence.date.getDate() + ". " + MONTHS[occurrence.date.getMonth()]));
                title.appendChild(label);
                day.appendChild(title);
                list = element("ul", "events-day__list");
                day.appendChild(list);
                container.appendChild(day);
            }
            list.appendChild(eventItem(occurrence, now, false));
        }
    }

    /**
     * Text for comparing (search): small letters and no accents, so "cafe" also finds "Café"
     * (the same as in js/ortssuche.js: \p{Diacritic} = every accent sign, flag u is needed for \p{...}).
     */
    function simplify(text) {
        return String(text).toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    }

    /** Does an event fit the chosen kind and the search text? The search looks at title, text, place, Quadrat and kind. */
    function fits(event, kind, words) {
        if (kind !== "" && event.art !== kind) {
            return false;
        }
        if (words === "") {
            return true;
        }
        var text = simplify([event.titel, event.text, event.ort, event.quadrat, Events.ART_NAMES[event.art] || "",
            event.anbieter || ""].join(" "));
        return text.indexOf(words) >= 0;
    }

    /** The chosen view: "liste" or "monat". */
    function chosenView() {
        return document.querySelector('input[name="events-ansicht"]:checked').value;
    }

    /** Status line: "1 Termin" or "5 Termine", with an ending like " im Oktober". */
    function showStatus(count, ending) {
        document.getElementById("events-status").textContent = (count === 1 ? "1 Termin" : count + " Termine") + ending;
    }

    /** List view: the occurrences of the chosen period that fit kind and search; ended ones are left out. */
    function drawList(now, kind, words) {
        var days = Number(periodSelect.value);
        // From yesterday on, so an event of last night that is still running is included; ended ones are left out.
        var yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        var all = Events.between(yesterday, days + 1);
        var occurrences = [];
        for (var i = 0; i < all.length; i++) {
            if (!Events.isOver(all[i], now) && fits(all[i].event, kind, words)) {
                occurrences.push(all[i]);
            }
        }
        fillHighlights(occurrences, now);
        fillDays(occurrences, now, document.getElementById("events-liste"),
            "In diesem Zeitraum gibt es keine passenden Events.");
        showStatus(occurrences.length, "");
    }

    /** Month view: the first day with events in a list of days ({ "2026-10-16": [...] }), or null. */
    function firstDayOf(perDay) {
        var first = null;
        for (var iso in perDay) {
            if (first === null || iso < first) {
                first = iso;
            }
        }
        return first;
    }

    /** Month view: one button for a day of the calendar, with its number and a dot per event. */
    function dayButton(date, list, todayIso) {
        var iso = Events.isoDate(date);
        var button = element("button", "events-month__day" + (iso === todayIso ? " events-month__day--today" : "") +
            (iso < todayIso ? " events-month__day--past" : ""));
        button.type = "button";
        button.setAttribute("data-iso", iso);
        button.setAttribute("aria-pressed", String(iso === chosenIso));
        button.disabled = list.length === 0;
        button.appendChild(element("span", "events-month__num", String(date.getDate())));
        var dots = element("span", "events-month__dots");
        dots.setAttribute("aria-hidden", "true");
        for (var d = 0; d < Math.min(list.length, MAX_DOTS); d++) {
            dots.appendChild(element("span", "events-month__dot event--art-" + list[d].event.art));
        }
        if (list.length > MAX_DOTS) {
            dots.appendChild(element("span", "events-month__more", "+" + (list.length - MAX_DOTS)));
        }
        button.appendChild(dots);
        // screen readers hear "Freitag, 16. Oktober: 2 Events" instead of only "16"
        button.setAttribute("aria-label", fullDate(date) + ": " + (list.length === 0 ? "keine Events" :
            list.length === 1 ? "1 Event" : list.length + " Events"));
        return button;
    }

    /**
     * Month view (added 2026-10-13): a table with one row per week (Monday first) and one button per day.
     * Days without events are disabled. Below the calendar: the events of the chosen day (at the start
     * today in the current month, else the first day with events).
     */
    function drawMonth(now, kind, words) {
        var year = monthFirst.getFullYear();
        var month = monthFirst.getMonth();
        var daysInMonth = new Date(year, month + 1, 0).getDate();     // day 0 of the next month = last day of this one
        var todayIso = Events.isoDate(now);
        var monthKey = Events.isoDate(monthFirst).slice(0, 7);        // "2026-10"

        // the occurrences of the whole month that fit kind and search, grouped by day
        var all = Events.between(monthFirst, daysInMonth);
        var perDay = {};
        var count = 0;
        for (var i = 0; i < all.length; i++) {
            if (fits(all[i].event, kind, words)) {
                perDay[all[i].iso] = (perDay[all[i].iso] || []).concat([all[i]]);
                count = count + 1;
            }
        }
        if (chosenIso === null || chosenIso.slice(0, 7) !== monthKey) {
            chosenIso = todayIso.slice(0, 7) === monthKey ? todayIso : firstDayOf(perDay);
        }

        document.getElementById("events-monat-titel").textContent = MONTHS[month] + " " + year;
        var body = document.getElementById("events-monat-tage");
        var focused = document.activeElement ? document.activeElement.getAttribute("data-iso") : null;
        body.textContent = "";
        var row = element("tr");
        var offset = (monthFirst.getDay() + 6) % 7;                   // empty cells before the 1st (0 = Monday)
        for (var e = 0; e < offset; e++) {
            row.appendChild(element("td"));
        }
        for (var day = 1; day <= daysInMonth; day++) {
            var date = new Date(year, month, day);
            var cell = element("td");
            cell.appendChild(dayButton(date, perDay[Events.isoDate(date)] || [], todayIso));
            row.appendChild(cell);
            if ((offset + day) % 7 === 0 || day === daysInMonth) {   // Sunday or the last day: the row is done
                body.appendChild(row);
                row = element("tr");
            }
        }
        if (focused) {                                                 // drawn again: keep the focus on the same day
            var again = body.querySelector('[data-iso="' + focused + '"]');
            if (again && !again.disabled) {
                again.focus();
            }
        }

        // "Hervorgehoben" only in the list view: in the month view the calendar comes first (paid entries
        // still show their label "Anzeige" in the list of the chosen day)
        document.getElementById("events-hervorgehoben-bereich").hidden = true;
        var emptyText = chosenIso ? "Am " + fullDate(new Date(chosenIso + "T12:00")) + " gibt es keine passenden Events." :
            "In diesem Monat gibt es keine passenden Events.";
        fillDays(perDay[chosenIso] || [], now, document.getElementById("events-monat-liste"), emptyText);
        showStatus(count, " im " + MONTHS[month]);
    }

    /** Draws the chosen view (list or month) with the chosen kind and search text. */
    function draw() {
        var now = new Date();
        var kind = kindSelect.value;
        var words = simplify(searchInput.value.trim());
        var monthView = chosenView() === "monat";
        document.getElementById("events-listenansicht").hidden = monthView;
        document.getElementById("events-monatsansicht").hidden = !monthView;
        document.getElementById("events-zeitraum-feld").hidden = monthView;     // the month is the period there
        if (monthView) {
            drawMonth(now, kind, words);
        } else {
            drawList(now, kind, words);
        }
    }

    /** Month view: one month back (-1) or on (+1); the chosen day goes back to the default day. */
    function moveMonth(step) {
        monthFirst = new Date(monthFirst.getFullYear(), monthFirst.getMonth() + step, 1);
        chosenIso = null;
        draw();
    }

    function init() {
        periodSelect = document.getElementById("events-zeitraum");
        kindSelect = document.getElementById("events-art");
        searchInput = document.getElementById("events-suche");
        var today = new Date();
        monthFirst = new Date(today.getFullYear(), today.getMonth(), 1);
        periodSelect.addEventListener("change", draw);
        kindSelect.addEventListener("change", draw);
        searchInput.addEventListener("input", draw);
        var views = document.querySelectorAll('input[name="events-ansicht"]');
        for (var i = 0; i < views.length; i++) {
            views[i].addEventListener("change", draw);
        }
        document.getElementById("events-monat-zurueck").addEventListener("click", function () {
            moveMonth(-1);
        });
        document.getElementById("events-monat-vor").addEventListener("click", function () {
            moveMonth(1);
        });
        // a click on a day of the calendar: one listener for all days, because the table is drawn again often
        document.getElementById("events-monat-tage").addEventListener("click", function (event) {
            var button = event.target.closest(".events-month__day");
            if (button && !button.disabled) {
                chosenIso = button.getAttribute("data-iso");
                draw();
            }
        });
        document.getElementById("events-werkzeuge").hidden = false;
        draw();
        setInterval(draw, 60 * 1000);
    }

    init();
})();
