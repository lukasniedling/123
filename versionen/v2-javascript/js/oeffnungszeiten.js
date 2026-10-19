/*
 * oeffnungszeiten.js - opening-hours helpers: is a place open at a given moment, and the German
 * text of its hours for one day. Offers window.Oeffnungszeiten.                                  [V2]
 *
 * How it fits in:
 * - The places in js/data/orte.js carry their hours in the field "zeiten": null (unknown) or seven
 *   lists, Monday to Sunday, of ranges [start, end] in minutes since 00:00. An end above 1440 means
 *   the range goes on after midnight into the next day ([1200, 1560] = 20:00 to 02:00).
 * - js/filter.js counts the open places per Quadrat with isOpen(); js/steckbrief.js shows
 *   hoursText() and the badge "geöffnet / geschlossen / unbekannt" for every place.
 * - Day numbers are 0 = Monday ... 6 = Sunday (the order of "zeiten"), times are minutes 0 ... 1440.
 * Classic script without modules, so the page also works by double-click (file://).
 */
(function () {
    "use strict";

    var MINUTES_PER_DAY = 1440;

    // German day names, index 0 = Monday (same order as the "zeiten" lists).
    var DAY_NAMES = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

    /** Adds a leading zero to numbers below 10: 7 -> "07". */
    function twoDigits(number) {
        return number < 10 ? "0" + number : String(number);
    }

    /** Turns minutes since 00:00 into "HH:MM": 870 -> "14:30", 1440 -> "24:00". */
    function formatTime(minutes) {
        var hours = Math.floor(minutes / 60);
        return twoDigits(hours) + ":" + twoDigits(minutes % 60);
    }

    /** Clock text of a range end: ends after midnight are shown as the time of the next day (1560 -> "02:00"). */
    function formatEnd(end) {
        if (end > MINUTES_PER_DAY) {
            return formatTime(end - MINUTES_PER_DAY);
        }
        return formatTime(end);        // exactly 1440 stays "24:00"
    }

    /** The day before: Monday (0) -> Sunday (6). */
    function previousDay(dayIndex) {
        return (dayIndex + 6) % 7;
    }

    /**
     * True if a range of the day itself contains the time (minutes 0 ... 1439).
     * The start counts, the end not: a place open until 23:00 is closed at 23:00 exactly.
     */
    function openToday(place, dayIndex, minutes) {
        var today = place.zeiten[dayIndex] || [];
        for (var i = 0; i < today.length; i++) {
            if (today[i][0] <= minutes && minutes < today[i][1]) {
                return true;
            }
        }
        return false;
    }

    /**
     * If a range of the day before goes on after midnight and still contains the time, returns
     * the end of that range in minutes of this day (e.g. 120 for "until 02:00"), otherwise null.
     * On the previous day's clock our time is minutes + 1440 (Saturday 01:00 = Friday 25:00).
     */
    function yesterdayEnd(place, dayIndex, minutes) {
        var yesterday = place.zeiten[previousDay(dayIndex)] || [];
        for (var j = 0; j < yesterday.length; j++) {
            if (yesterday[j][1] > MINUTES_PER_DAY && minutes + MINUTES_PER_DAY < yesterday[j][1]) {
                return yesterday[j][1] - MINUTES_PER_DAY;
            }
        }
        return null;
    }

    /**
     * Is the place open on day dayIndex (0 = Monday) at the time minutes (0 ... 1440)?
     * Returns true or false, or null if its hours are unknown.
     * Also counts a range of the previous day that goes on after midnight
     * (a bar open Friday 20:00-02:00 is open on Saturday at 01:00).
     */
    function isOpen(place, dayIndex, minutes) {
        if (!place.zeiten) {
            return null;
        }
        // 24:00 is the same moment as 00:00 of the next day.
        if (minutes >= MINUTES_PER_DAY) {
            dayIndex = (dayIndex + 1) % 7;
            minutes = minutes - MINUTES_PER_DAY;
        }
        return openToday(place, dayIndex, minutes) || yesterdayEnd(place, dayIndex, minutes) !== null;
    }

    /**
     * If the place is open at this time only because a range of the previous day goes on after
     * midnight, returns the end of that range in minutes of this day (e.g. 120 for "until 02:00");
     * otherwise null. The profile panel uses it for the note "vom Vortag bis 02:00", because the
     * hours text of a day lists only the ranges that start on that day.
     */
    function carryOverEnd(place, dayIndex, minutes) {
        if (!place.zeiten || minutes >= MINUTES_PER_DAY) {
            return null;
        }
        if (openToday(place, dayIndex, minutes)) {
            return null;                                   // open anyway by a range of this day
        }
        return yesterdayEnd(place, dayIndex, minutes);
    }

    /**
     * German text of the hours of one day, e.g. "11:00–14:30, 17:30–23:00" or "20:00–02:00";
     * "geschlossen" for a day without ranges, "unbekannt" if the place has no known hours.
     */
    function hoursText(place, dayIndex) {
        if (!place.zeiten) {
            return "unbekannt";
        }
        var ranges = place.zeiten[dayIndex] || [];
        if (ranges.length === 0) {
            return "geschlossen";
        }
        var parts = [];
        for (var i = 0; i < ranges.length; i++) {
            parts.push(formatTime(ranges[i][0]) + "–" + formatEnd(ranges[i][1]));
        }
        return parts.join(", ");
    }

    /** Day number of a JavaScript date in our order: getDay() counts 0 = Sunday, we count 0 = Monday. */
    function dayIndexOf(date) {
        return (date.getDay() + 6) % 7;
    }

    window.Oeffnungszeiten = {
        DAY_NAMES: DAY_NAMES,
        isOpen: isOpen,
        carryOverEnd: carryOverEnd,
        hoursText: hoursText,
        formatTime: formatTime,
        dayIndexOf: dayIndexOf
    };
})();
