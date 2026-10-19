/*
 * events.js - dates of the events in js/data/events.js: on which days does an event take place, is it
 * running right now, and the German texts for date and time. Offers window.Events.  [V2] Added 2026-10-13.
 *
 * How it fits in:
 * - js/data/events.js (window.EVENTS) lists the events with one of three kinds of date: one day ("datum"),
 *   a range of days ("von", "bis") or days of the week ("wochentage", 0 = Monday ... 6 = Sunday).
 *   Weekly events may also have a first day "ab" and a last day "bis" (reports of event-melden.html, 2026-10-13).
 * - between(firstDay, days) turns them into single "occurrences" ({ event, date, iso, start, end }),
 *   one per day on which the event takes place. js/events-seite.js (events.html) lists them,
 *   js/gerade-offen.js ("Gerade offen" under the map on index.html) shows the ones of the chosen day.
 * - Events reported with event-melden.html (js/event-melden.js) are kept in localStorage under
 *   "quadrate-events-gemeldet" with "gemeldet": true; between() takes them in like the examples, and
 *   events.html marks them "Deine Meldung – noch nicht geprüft" (added 2026-10-13).
 * - Saved events (since 2026-10-14): the list of js/merkliste.js holds the id of an event ("e05": the whole
 *   series, every date) or the id of one date ("e05@2026-10-16": only this date). savedEntries() and
 *   isSavedOccurrence() read both kinds for merkliste.html, the calendar, "Tag planen" and "Treffen planen".
 * - Times are "HH:MM" in the data and minutes since 00:00 here (as in js/oeffnungszeiten.js). An end
 *   earlier than the start ("23:00" to "04:00") means the event goes on after midnight.
 * Classic script without modules, so the pages also work by double-click (file://).
 */
(function () {
    "use strict";

    var MINUTES_PER_DAY = 1440;
    var REPORTS_KEY = "quadrate-events-gemeldet";   // events reported with event-melden.html (localStorage)

    // German names of the kinds of event (field "art").
    var ART_NAMES = {
        musik: "Musik", kultur: "Kultur", markt: "Markt", party: "Party und Quiz",
        familie: "Familie", essen: "Essen und Trinken", shoppen: "Shoppen"
    };

    var SHORT_DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

    /** Adds a leading zero to numbers below 10: 7 -> "07". */
    function twoDigits(number) {
        return number < 10 ? "0" + number : String(number);
    }

    /** A date as "2026-10-24", the form used in the data (text in this form sorts like the dates). */
    function isoDate(date) {
        return date.getFullYear() + "-" + twoDigits(date.getMonth() + 1) + "-" + twoDigits(date.getDate());
    }

    /** "19:30" -> 1170 minutes since 00:00. */
    function toMinutes(text) {
        var parts = text.split(":");
        return Number(parts[0]) * 60 + Number(parts[1]);
    }

    /** Day number in our order: getDay() counts 0 = Sunday, we count 0 = Monday. */
    function dayIndexOf(date) {
        return (date.getDay() + 6) % 7;
    }

    /** Does the event take place on this date? Checks the three kinds of date of the data. */
    function takesPlaceOn(event, date) {
        var iso = isoDate(date);
        if (event.datum) {
            return event.datum === iso;
        }
        if (event.von && event.bis) {
            return event.von <= iso && iso <= event.bis;    // texts like "2026-11-23" compare like dates
        }
        if (event.wochentage) {
            // weekly events reported with event-melden.html may have a first ("ab") and a last day ("bis")
            if ((event.ab && iso < event.ab) || (event.bis && iso > event.bis)) {
                return false;
            }
            return event.wochentage.indexOf(dayIndexOf(date)) >= 0;
        }
        return false;
    }

    /* ---------------- events reported in this browser (event-melden.html, added 2026-10-13) ---------------- */

    /** The events reported in this browser (empty list if there are none or localStorage is blocked). */
    function reports() {
        try {
            return JSON.parse(localStorage.getItem(REPORTS_KEY)) || [];
        } catch (error) {
            return [];
        }
    }

    /** Adds one reported event and stores the list again; returns false if the browser blocks it. */
    function report(event) {
        try {
            var list = reports();
            list.push(event);
            localStorage.setItem(REPORTS_KEY, JSON.stringify(list));
            return true;
        } catch (error) {
            return false;
        }
    }

    /** Removes a reported event by its id ("Meldung löschen" on events.html). */
    function removeReport(id) {
        var list = reports();
        var kept = [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].id !== id) {
                kept.push(list[i]);
            }
        }
        try {
            localStorage.setItem(REPORTS_KEY, JSON.stringify(kept));
        } catch (error) {
            // blocked: nothing to remove
        }
    }

    /** The example events of js/data/events.js and the events reported in this browser together. */
    function allEvents() {
        return window.EVENTS.concat(reports());
    }

    /**
     * All occurrences from the day firstDay on, for a number of days, sorted by day and start time.
     * One occurrence: { event, date, iso, start, end } with start and end in minutes of that day
     * (end above 1440 if the event goes on after midnight).
     */
    function between(firstDay, days) {
        var result = [];
        var events = allEvents();
        for (var d = 0; d < days; d++) {
            // new Date(year, month, day + d) also works across the end of a month
            var date = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + d);
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                if (takesPlaceOn(event, date)) {
                    var start = toMinutes(event.beginn);
                    var end = toMinutes(event.ende);
                    if (end <= start) {
                        end = end + MINUTES_PER_DAY;         // "23:00" to "04:00": ends the next morning
                    }
                    result.push({ event: event, date: date, iso: isoDate(date), start: start, end: end });
                }
            }
        }
        result.sort(function (a, b) {
            if (a.iso !== b.iso) {
                return a.iso < b.iso ? -1 : 1;
            }
            return a.start - b.start;
        });
        return result;
    }

    /**
     * Is the occurrence running at this moment (a Date)? Also counts events of yesterday that go on
     * after midnight: on yesterday's clock "now" is 1440 minutes later.
     */
    function isRunning(occurrence, now) {
        var minutes = now.getHours() * 60 + now.getMinutes();
        var today = isoDate(now);
        var yesterday = isoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
        if (occurrence.iso === today) {
            return occurrence.start <= minutes && minutes < occurrence.end;
        }
        if (occurrence.iso === yesterday) {
            return minutes + MINUTES_PER_DAY < occurrence.end;
        }
        return false;
    }

    /** Has the occurrence already ended at this moment? */
    function isOver(occurrence, now) {
        var minutes = now.getHours() * 60 + now.getMinutes();
        var today = isoDate(now);
        if (occurrence.iso < today) {
            return !isRunning(occurrence, now);
        }
        return occurrence.iso === today && minutes >= occurrence.end;
    }

    /** "heute", "morgen" or "Do, 24.10." for the day of an occurrence. */
    function dayText(occurrence, now) {
        var tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        if (occurrence.iso === isoDate(now)) {
            return "heute";
        }
        if (occurrence.iso === isoDate(tomorrow)) {
            return "morgen";
        }
        var date = occurrence.date;
        return SHORT_DAYS[dayIndexOf(date)] + ", " + twoDigits(date.getDate()) + "." + twoDigits(date.getMonth() + 1) + ".";
    }

    /** "19:30–23:00 Uhr" from the data of the event. */
    function timeText(event) {
        return event.beginn + "–" + event.ende + " Uhr";
    }

    /** "2026-12-18" -> "18.12." */
    function shortDate(iso) {
        var parts = iso.split("-");
        return parts[2] + "." + parts[1] + ".";
    }

    /** "jeden Donnerstag", "täglich 23.11.–23.12." or "" for a one-day event (shown under the title). */
    function repeatText(event) {
        var DAY_NAMES = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
        if (event.wochentage) {
            var names = [];
            for (var i = 0; i < event.wochentage.length; i++) {
                names.push(DAY_NAMES[event.wochentage[i]]);
            }
            return "jeden " + names.join(" und ") + (event.ab ? " ab " + shortDate(event.ab) : "") +
                (event.bis ? " bis " + shortDate(event.bis) : "");
        }
        if (event.von && event.bis) {
            var from = event.von.split("-");
            var to = event.bis.split("-");
            return "täglich " + from[2] + "." + from[1] + ".–" + to[2] + "." + to[1] + ".";
        }
        return "";
    }

    /* ---------------- saved events: the whole series or one date (added 2026-10-14) ---------------- */

    /** The id of one date of an event for the Merkliste: "e05" and "2026-10-16" -> "e05@2026-10-16". */
    function occurrenceId(event, iso) {
        return event.id + "@" + iso;
    }

    /** Is an occurrence saved in a list of ids: as the whole series ("e05") or as this one date ("e05@2026-10-16")? */
    function isSavedOccurrence(ids, occurrence) {
        return ids.indexOf(occurrence.event.id) >= 0 || ids.indexOf(occurrenceId(occurrence.event, occurrence.iso)) >= 0;
    }

    /**
     * The event behind a saved id: { event, iso }; iso is null for a whole series and the date for one date.
     * null if no event has this id (a place, or an event that was deleted).
     */
    function eventOfId(id) {
        var parts = id.split("@");                       // "e05@2026-10-16" -> ["e05", "2026-10-16"]
        var events = allEvents();
        for (var i = 0; i < events.length; i++) {
            if (events[i].id === parts[0]) {
                return { event: events[i], iso: parts[1] || null };
            }
        }
        return null;
    }

    /**
     * The saved events of a list of ids, in the order of the list: [{ id, event, single, next }].
     *   single  the date ("2026-10-16") if only one date is saved, null for the whole series
     *   next    the next occurrence that is not over yet (within the next 60 days), or null
     */
    function savedEntries(ids) {
        var now = new Date();
        var coming = between(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1), 61);
        var result = [];
        for (var i = 0; i < ids.length; i++) {
            var found = eventOfId(ids[i]);
            if (!found) {
                continue;
            }
            var next = null;
            for (var j = 0; j < coming.length && next === null; j++) {
                var fits = coming[j].event.id === found.event.id && (found.iso === null || coming[j].iso === found.iso);
                if (fits && !isOver(coming[j], now)) {
                    next = coming[j];
                }
            }
            result.push({ id: ids[i], event: found.event, single: found.iso, next: next });
        }
        return result;
    }

    window.Events = {
        ART_NAMES: ART_NAMES,
        isoDate: isoDate,
        between: between,
        isRunning: isRunning,
        isOver: isOver,
        dayText: dayText,
        timeText: timeText,
        repeatText: repeatText,
        shortDate: shortDate,
        report: report,
        removeReport: removeReport,
        allEvents: allEvents,           // examples and own reports, e.g. for saved events on merkliste.html
        occurrenceId: occurrenceId,
        isSavedOccurrence: isSavedOccurrence,
        eventOfId: eventOfId,
        savedEntries: savedEntries
    };
})();
