/*
 * gerade-offen.js - the part "Gerade offen" under the map on index.html: "Überrasch mich", the events of the
 * day, and the lists "Schließt bald", "Öffnet gleich" and "Lange offen". Offers window.GeradeOffen.
 * [V2] Added 2026-10-13 as the page jetzt.html (js/jetzt-seite.js); moved under the map on 2026-10-14.
 *
 * How it fits in:
 * - Day, time and category come from the map filter above (window.Filter, js/filter.js): the lists show the
 *   same moment and the same category as the map. So this part needs no controls of its own. If the filter
 *   shows "Jetzt", the lists use the real minute of the clock (the slider only knows half hours).
 * - js/app.js calls GeradeOffen.refresh() after every change of the filter (also during the time lapse),
 *   and this file draws again every minute, so "Jetzt" follows the clock.
 * - The places come from window.ORTE (js/data/orte.js). window.Oeffnungszeiten (js/oeffnungszeiten.js)
 *   answers "how long still open?" (minutesUntilClose) and "when does it open?" (minutesUntilOpen).
 *   window.Steckbrief (js/steckbrief.js) gives the German type names and the route links.
 * - The list "Die meisten offenen Orte" (10 Quadrate) of the old page is gone: the map shows the same thing.
 * - Only places with known hours take part; there are no visitor numbers, so it never says "busy".
 * The texts of the places come from OpenStreetMap; they are set with textContent, never as HTML.
 * Classic script without modules, so the page also works by double-click (file://).
 */
(function () {
    "use strict";

    var CATEGORY_NAMES = { essen: "Essen", trinken: "Trinken", kultur: "Kultur", shoppen: "Shoppen" };

    var SOON_MINUTES = 60;            // "schließt bald" and "öffnet gleich": within the next hour
    var LATE_CLOSING = 23 * 60;       // "lange offen": closes at 23:00 or later (1380)
    var SHORT_LENGTH = 3;             // every list first shows 3 entries, "Alle … anzeigen" shows the rest

    var section = null;               // <section id="gerade-offen">
    var lastData = null;              // result of collect() of the last draw(), for "Überrasch mich"
    var lastMoment = null;            // its moment
    var lastSurpriseId = null;        // the place suggested last, so "Noch ein Vorschlag" gives another one
    var expanded = {};                // list id -> true after "Alle … anzeigen" (kept when draw() runs again)

    /* ---------------- small helpers ---------------- */

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

    /**
     * The moment of the map filter: { day, minutes, date, isNow }. With "Jetzt" the real minute of the clock;
     * otherwise the chosen day and time on the next such day (today counts). date is a real Date of that
     * moment, for the events.
     */
    function moment() {
        var date = new Date();
        if (Filter.isNow()) {
            return { day: Oeffnungszeiten.dayIndexOf(date), minutes: date.getHours() * 60 + date.getMinutes(),
                date: date, isNow: true };
        }
        var day = Filter.state.day;
        var minutes = Filter.state.minutes;
        // days until that day of the week: today 0, tomorrow 1 ... (+7 and % 7 keep it between 0 and 6)
        var daysAhead = (day - Oeffnungszeiten.dayIndexOf(date) + 7) % 7;
        var then = new Date(date.getFullYear(), date.getMonth(), date.getDate() + daysAhead,
            Math.floor(minutes / 60), minutes % 60);
        return { day: day, minutes: minutes, date: then, isNow: false };
    }

    /** Clock time a number of minutes after the moment: 1170 + 30 -> "20:00"; after midnight again from 00:00. */
    function clockIn(now, minutesFromNow) {
        return Oeffnungszeiten.formatTime((now.minutes + minutesFromNow) % 1440);
    }

    /** "in 25 Min." or, from one hour on, "in 1 Std. 5 Min.". */
    function durationText(minutes) {
        if (minutes < 60) {
            return "in " + minutes + " Min.";
        }
        var rest = minutes % 60;
        return "in " + Math.floor(minutes / 60) + " Std." + (rest > 0 ? " " + rest + " Min." : "");
    }

    /* ---------------- the lists ---------------- */

    /**
     * Goes once through all places with known hours of the category and sorts them into the lists.
     * Returns { known, openPlaces, closing, opening, late }; the lists hold { place, minutes } with the
     * minutes until closing or opening.
     */
    function collect(now, category) {
        var result = { known: 0, openPlaces: [], closing: [], opening: [], late: [] };
        for (var i = 0; i < window.ORTE.length; i++) {
            var place = window.ORTE[i];
            if (!place.zeiten || place.kat !== category) {
                continue;                                  // unknown hours or another category
            }
            result.known = result.known + 1;
            var untilClose = Oeffnungszeiten.minutesUntilClose(place, now.day, now.minutes);
            if (untilClose !== null) {
                result.openPlaces.push({ place: place, minutes: untilClose });
                if (untilClose <= SOON_MINUTES) {
                    result.closing.push({ place: place, minutes: untilClose });
                }
                if (now.minutes + untilClose >= LATE_CLOSING) {
                    result.late.push({ place: place, minutes: untilClose });
                }
            } else {
                var untilOpen = Oeffnungszeiten.minutesUntilOpen(place, now.day, now.minutes);
                if (untilOpen !== null && untilOpen <= SOON_MINUTES) {
                    result.opening.push({ place: place, minutes: untilOpen });
                }
            }
        }
        return result;
    }

    /** Sorts entries by their minutes: ascending (soonest first) or descending (latest first). */
    function sortByMinutes(entries, latestFirst) {
        entries.sort(function (a, b) {
            var difference = latestFirst ? b.minutes - a.minutes : a.minutes - b.minutes;
            if (difference !== 0) {
                return difference;
            }
            return a.place.name.localeCompare(b.place.name, "de");
        });
        return entries;
    }

    /* ---------------- drawing ---------------- */

    /** How many of total entries a list shows: all after "Alle … anzeigen", otherwise SHORT_LENGTH. */
    function shownCount(listId, total) {
        return expanded[listId] ? total : Math.min(total, SHORT_LENGTH);
    }

    /**
     * The button under a list: "Alle 35 anzeigen" or, when open, "Weniger anzeigen". It is made once,
     * directly after the list, and only shown if the list has more than SHORT_LENGTH entries.
     * aria-expanded tells screen readers whether the list is open.
     */
    function moreButton(listId, total) {
        var button = document.getElementById(listId + "-mehr");
        if (!button) {
            var list = document.getElementById(listId);
            button = element("button", "button button--secondary button--small now-more");
            button.type = "button";
            button.id = listId + "-mehr";
            button.setAttribute("aria-controls", listId);
            button.addEventListener("click", function () {
                expanded[listId] = !expanded[listId];
                draw();                        // the button stays, so the keyboard focus stays on it
            });
            list.parentNode.insertBefore(button, list.nextSibling);
        }
        button.hidden = total <= SHORT_LENGTH;
        button.textContent = expanded[listId] ? "Weniger anzeigen" : "Alle " + total + " anzeigen";
        button.setAttribute("aria-expanded", String(expanded[listId] === true));
    }

    /**
     * One place: name, type with a link to its Quadrat (#G1 opens its profile on this page), the route
     * link; on the right the time text. The class cat-essen ... gives the coloured stripe (css/style.css).
     */
    function placeItem(place, timeText) {
        var item = element("li", "place place--cat cat-" + place.kat);
        var left = element("div");
        left.appendChild(element("span", "place__name", place.name));
        var details = element("span", "place__type now-place__details");
        details.appendChild(document.createTextNode(Steckbrief.typeName(place) + " · "));
        var blockLink = element("a", "", "Quadrat " + place.quadrat);
        blockLink.href = "#" + place.quadrat;
        details.appendChild(blockLink);
        details.appendChild(document.createTextNode(" · "));
        var route = element("a", "", "Route");
        route.href = Steckbrief.routeUrl(place);
        route.target = "_blank";
        route.rel = "noopener";
        route.appendChild(element("span", "visually-hidden", " zu " + place.name + " in Google Maps (öffnet in neuem Tab)"));
        details.appendChild(route);
        left.appendChild(details);
        item.appendChild(left);
        var right = element("div", "place__status");
        right.appendChild(element("span", "place__hours", timeText));
        item.appendChild(right);
        return item;
    }

    /** Fills one place list (first SHORT_LENGTH entries, or all), or writes a short sentence if it is empty. */
    function fillList(listId, entries, timeTextOf, emptyText) {
        var list = document.getElementById(listId);
        list.textContent = "";
        moreButton(listId, entries.length);
        if (entries.length === 0) {
            list.appendChild(element("li", "now-empty", emptyText));
            return;
        }
        for (var i = 0; i < shownCount(listId, entries.length); i++) {
            list.appendChild(placeItem(entries[i].place, timeTextOf(entries[i])));
        }
    }

    /**
     * Events of the chosen day that are running or still to come (also one from the night before that is
     * still running). Hidden if js/events.js is missing or there are none. Events have kinds of their own,
     * so the category does not apply here.
     */
    function fillEvents(date, isNow) {
        var area = document.getElementById("jetzt-events-bereich");
        if (!window.Events || !area) {
            return;
        }
        document.getElementById("jetzt-events-titel").textContent = isNow ? "Events heute" :
            "Events am " + Oeffnungszeiten.DAY_NAMES[Oeffnungszeiten.dayIndexOf(date)];
        var yesterday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
        var all = Events.between(yesterday, 2);            // yesterday and that day
        var today = [];
        for (var i = 0; i < all.length; i++) {
            if (Events.isOver(all[i], date) || (all[i].iso !== Events.isoDate(date) && !Events.isRunning(all[i], date))) {
                continue;                                  // over, or not that day
            }
            today.push(all[i]);
        }
        var list = document.getElementById("jetzt-events");
        list.textContent = "";
        moreButton("jetzt-events", today.length);
        for (var j = 0; j < shownCount("jetzt-events", today.length); j++) {
            var occurrence = today[j];
            var event = occurrence.event;
            var item = element("li", "now-events__item event--art-" + event.art);
            var when = element("span", "place__hours", Events.isRunning(occurrence, date) ?
                (isNow ? "läuft gerade" : "läuft dann") + ", bis " + event.ende : "ab " + event.beginn);
            item.appendChild(when);
            item.appendChild(element("span", "now-events__title", event.titel));
            var where = element("span", "now-events__place");
            where.appendChild(document.createTextNode(event.ort + " · "));
            var link = element("a", "", "Quadrat " + event.quadrat);
            link.href = "#" + event.quadrat;
            where.appendChild(link);
            if (event.anzeige) {
                where.appendChild(document.createTextNode(" · Anzeige"));
            }
            item.appendChild(where);
            list.appendChild(item);
        }
        area.hidden = today.length === 0;
    }

    /** Computes everything for the moment of the filter and draws the lists and the status line. */
    function draw() {
        var now = moment();
        var category = Filter.state.category;
        var data = collect(now, category);
        lastData = data;                   // "Überrasch mich" picks from the open places of this moment
        lastMoment = now;

        document.getElementById("gerade-offen-titel").textContent = now.isNow ? "Gerade offen" :
            "Offen am " + Oeffnungszeiten.DAY_NAMES[now.day] + " um " + Oeffnungszeiten.formatTime(now.minutes) + " Uhr";
        fillEvents(now.date, now.isNow);
        fillList("jetzt-schliesst", sortByMinutes(data.closing, false), function (entry) {
            return "schließt um " + clockIn(now, entry.minutes) + " (" + durationText(entry.minutes) + ")";
        }, "In der nächsten Stunde schließt nichts.");
        fillList("jetzt-oeffnet", sortByMinutes(data.opening, false), function (entry) {
            return "öffnet um " + clockIn(now, entry.minutes) + " (" + durationText(entry.minutes) + ")";
        }, "In der nächsten Stunde öffnet nichts.");
        fillList("jetzt-lange", sortByMinutes(data.late, true), function (entry) {
            if (entry.minutes >= 1440) {
                return "rund um die Uhr";          // open for at least another whole day
            }
            return "bis " + clockIn(now, entry.minutes);
        }, "Nichts hat offen, das bis 23 Uhr oder länger offen bleibt.");

        document.getElementById("jetzt-status").textContent = CATEGORY_NAMES[category] + ": " +
            data.openPlaces.length + " von " + data.known + " Orten mit bekannten Öffnungszeiten haben " +
            (now.isNow ? "gerade" : "dann") + " geöffnet.";
    }

    /* ---------------- "Überrasch mich" ---------------- */

    /**
     * Picks a random place among the places open at the moment (and of the category) and shows it as a
     * card: name, type, Quadrat, until when it is open, "Route", "Merken" and "Noch ein Vorschlag".
     * Math.random() gives a number from 0 to below 1; times the number of places and rounded down
     * (Math.floor) it is a position in the list. The place of the last suggestion is left out.
     */
    function surprise() {
        var result = document.getElementById("ueberrasch-ergebnis");
        result.textContent = "";
        var choices = [];
        for (var i = 0; i < lastData.openPlaces.length; i++) {
            if (lastData.openPlaces[i].place.id !== lastSurpriseId) {
                choices.push(lastData.openPlaces[i]);
            }
        }
        if (choices.length === 0) {
            // class empty-moon: a small drawing of a moon over sleeping blocks (css/gerade-offen.css, 2026-10-14)
            result.appendChild(element("p", "surprise__empty empty-moon", "Zu dieser Zeit hat leider nichts geöffnet. Probier eine andere Uhrzeit oder Kategorie."));
            return;
        }
        var entry = choices[Math.floor(Math.random() * choices.length)];
        var place = entry.place;
        lastSurpriseId = place.id;

        var card = element("article", "surprise__card cat-" + place.kat);
        var kind = element("p", "surprise__kind");
        var icon = element("span", "cat-icon cat-icon--" + place.kat);       // drawing of the category (2026-10-14)
        icon.setAttribute("aria-hidden", "true");
        kind.appendChild(icon);
        kind.appendChild(document.createTextNode(" " + (CATEGORY_NAMES[place.kat] || "") + " · " + Steckbrief.typeName(place)));
        card.appendChild(kind);
        card.appendChild(element("h4", "surprise__name", place.name));
        var until = entry.minutes >= 1440 ? "rund um die Uhr geöffnet" : "geöffnet bis " + clockIn(lastMoment, entry.minutes) + " Uhr";
        card.appendChild(element("p", "surprise__until", until));

        var links = element("p", "surprise__links");
        var blockLink = element("a", "", "Quadrat " + place.quadrat + (place.adresse ? " · " + place.adresse : ""));
        blockLink.href = "#" + place.quadrat;
        links.appendChild(blockLink);
        card.appendChild(links);

        var buttons = element("div", "button-row surprise__buttons");
        var route = element("a", "button button--secondary", "Route");
        route.href = Steckbrief.routeUrl(place);
        route.target = "_blank";
        route.rel = "noopener";
        route.appendChild(element("span", "visually-hidden", " zu " + place.name + " in Google Maps (öffnet in neuem Tab)"));
        buttons.appendChild(route);
        if (window.Merkliste && Merkliste.isAvailable()) {
            var save = element("button", "button button--secondary surprise__save", "Merken");
            save.type = "button";
            save.setAttribute("aria-pressed", String(Merkliste.isSaved(place.id)));
            save.addEventListener("click", function () {
                save.setAttribute("aria-pressed", String(Merkliste.toggle(place.id)));
                Steckbrief.refresh();          // the pins and an open profile show the change at once
            });
            buttons.appendChild(save);
        }
        card.appendChild(buttons);
        result.appendChild(card);
        document.getElementById("ueberrasch-knopf").textContent = "Noch ein Vorschlag";
    }

    /** Draws again with the current filter. Called by js/app.js after every change of the filter. */
    function refresh() {
        if (section && !section.hidden) {
            draw();
        }
    }

    /** Start: shows the part, draws it and redraws every minute (the lists follow the clock). js/app.js calls it. */
    function init() {
        section = document.getElementById("gerade-offen");
        if (!section || !window.Filter) {
            return;
        }
        section.hidden = false;
        document.getElementById("ueberrasch-knopf").addEventListener("click", surprise);
        draw();
        setInterval(draw, 60 * 1000);
    }

    window.GeradeOffen = {
        init: init,
        refresh: refresh
    };
})();
