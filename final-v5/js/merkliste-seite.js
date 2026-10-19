/*
 * merkliste-seite.js - the page merkliste.html: shows the saved places, removes them, prints them
 * (or saves them as a PDF) and builds one Google Maps route through them.  [V2] Added 2026-10-13.
 *
 * How it fits in:
 * - window.Merkliste (js/merkliste.js) gives the ids of the saved places, in the account or in this tab.
 * - The places and their hours come from window.ORTE (js/data/orte.js) and window.Oeffnungszeiten
 *   (js/oeffnungszeiten.js), the names of the Quadrate from window.QUADRATE (js/data/quadrate.js),
 *   German type names and route links from window.Steckbrief (js/steckbrief.js).
 * - Everything is built with createElement and textContent, so names from OpenStreetMap never
 *   become HTML. After every change draw() builds the page again, so page and stored list match.
 * - PDF: there is no server and no PDF library, so "Als PDF speichern" opens the print dialog of the
 *   browser (window.print()); there you choose "Als PDF speichern". css/merkliste.css (@media print)
 *   hides navigation and buttons; before printing all week hours are unfolded (event "beforeprint").
 * - Since 2026-10-14 the page is ordered in rows: the saved events with a calendar of their dates next to them
 *   (eventsCalendar), then the places in two columns (css/merkliste.css, part 5).
 * Classic script without modules, so the page also works by double-click (file://).
 */
(function () {
    "use strict";

    var CATEGORY_NAMES = { essen: "Essen", trinken: "Trinken", kultur: "Kultur", shoppen: "Shoppen" };
    var STATUS_WORDS = { open: "geöffnet", closed: "geschlossen", unknown: "unbekannt" };

    // Google Maps takes at most 9 stops on the way plus the destination in one route link
    // (fewer in some mobile browsers); more places are left out of the route and the page says so.
    var MAX_ROUTE_PLACES = 10;

    var container = null;      // <div id="merkliste-inhalt">
    var calendarMonth = null;  // the month shown in the calendar of saved events (first day), added 2026-10-14
    var MONTH_NAMES = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September",
        "Oktober", "November", "Dezember"];
    var WEEKDAY_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    var placeById = {};        // id -> place of window.ORTE

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

    /** "1 Ort", "3 Orte". */
    function count(number, one, many) {
        return number + " " + (number === 1 ? one : many);
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

    /** Hours of one day as shown here: "09:00–20:00", "geschlossen" or "keine Angabe". */
    function hoursOf(place, dayIndex) {
        var text = Oeffnungszeiten.hoursText(place, dayIndex);
        return text === "unbekannt" ? "keine Angabe" : text;
    }

    /** The saved places that still exist in the data, sorted by Quadrat (L9 before L10), then by name. */
    function savedPlaces() {
        var ids = Merkliste.ids();
        var places = [];
        for (var i = 0; i < ids.length; i++) {
            if (placeById[ids[i]]) {            // places no longer in the data are simply left out
                places.push(placeById[ids[i]]);
            }
        }
        places.sort(function (a, b) {
            var byBlock = a.quadrat.localeCompare(b.quadrat, "de", { numeric: true });
            if (byBlock !== 0) {
                return byBlock;
            }
            return a.name.localeCompare(b.name, "de");
        });
        return places;
    }

    /**
     * One Google Maps link through up to MAX_ROUTE_PLACES places in the order of the list: the last one
     * is the destination, the others are stops on the way ("waypoints", separated by "|").
     */
    function routeAllUrl(places) {
        // places may also hold the venues of saved events ({ name, adresse, quadrat }, see eventVenue)
        var stops = places.slice(0, MAX_ROUTE_PLACES);              // only the first 10 places: Google Maps takes no more
        var url = Steckbrief.routeUrl(stops[stops.length - 1]);     // the LAST place is the destination: "...&destination=Name, Address, Mannheim"
        if (stops.length > 1) {                                     // more than one place? then the others become stops on the way
            var waypoints = [];                                     // empty list, filled with the stops in the loop below
            for (var i = 0; i < stops.length - 1; i++) {            // every place except the last one (that one is the destination)
                waypoints.push(Steckbrief.routeDestination(stops[i]));   // add "Name, Address, Mannheim" of this place to the list
            }
            url += "&waypoints=" + encodeURIComponent(waypoints.join("|"));   // join: "A|B|C"; encode: spaces, umlauts and "|" may stand in a link
        }
        return url;                                                 // only a link: Google Maps calculates the route when it is opened
    }

    /* ---------------- parts of the page ---------------- */

    /** Notice where the list is kept: in the account, or only until the tab is closed. */
    function modeNotice() {
        var notice = element("div", "notice merkliste-mode");
        var text = element("p");
        if (Merkliste.isPermanent()) {
            notice.className += " notice--info";
            text.appendChild(document.createTextNode("Angemeldet als " + Konto.user() +
                ". Deine Merkliste ist in deinem Konto gespeichert."));
        } else {
            notice.className += " notice--warning";
            text.appendChild(document.createTextNode("Du bist nicht angemeldet. Die Merkliste gilt nur, bis du diesen Tab schließt. "));
            var link = element("a", "", "Melde dich an");
            link.href = "konto.html";
            text.appendChild(link);
            text.appendChild(document.createTextNode(", dann kommen die Orte in dein Konto."));
        }
        notice.appendChild(text);
        return notice;
    }

    /** Empty state: nothing saved yet. */
    function emptyState() {
        var empty = element("section", "panel merkliste-empty");
        empty.appendChild(element("h2", "", "Noch keine Orte gemerkt"));
        empty.appendChild(element("p", "", "Wähle auf der Karte ein Quadrat. Im Steckbrief steht bei jedem Ort der Knopf „Merken“. " +
            "Gemerkte Orte erscheinen hier, und ihr Quadrat bekommt auf der Karte eine Stecknadel. " +
            "Auch Events kannst du dir auf der Seite Events merken."));
        var link = element("a", "button", "Zur Karte");
        link.href = "index.html";
        empty.appendChild(link);
        return empty;
    }

    /** Summary line and the buttons "Als PDF speichern oder drucken" and "Route zu allen Orten". */
    function toolbar(places, blockCount, events) {
        var bar = element("div", "merkliste-tools");
        // "1 Event · 3 Orte in 2 Quadraten" (events since 2026-10-13)
        var parts = [];
        if (events.length > 0) {
            parts.push(count(events.length, "Event", "Events"));
        }
        if (places.length > 0) {
            parts.push(count(places.length, "Ort", "Orte") + " in " + count(blockCount, "Quadrat", "Quadraten"));
        }
        var summary = element("p", "merkliste-tools__summary", parts.join(" · "));
        summary.id = "merkliste-zusammenfassung";
        summary.tabIndex = -1;                  // so "Entfernen" can put the keyboard focus here
        bar.appendChild(summary);

        var buttons = element("div", "button-row merkliste-tools__buttons");
        var print = element("button", "button", "Als PDF speichern oder drucken");
        print.type = "button";
        print.addEventListener("click", function () {
            window.print();                     // the browser's dialog; there: "Als PDF speichern"
        });
        buttons.appendChild(print);

        // the route goes first to the venues of the saved events, then to the places (in the order of the page)
        var stops = [];
        for (var e = 0; e < events.length; e++) {
            stops.push(eventVenue(events[e].event));
        }
        stops = stops.concat(places);
        var route = element("a", "button button--secondary", "Route zu allen Orten");
        route.href = routeAllUrl(stops);
        route.target = "_blank";
        route.rel = "noopener";
        route.appendChild(element("span", "visually-hidden", " in Google Maps (öffnet in neuem Tab)"));
        buttons.appendChild(route);
        bar.appendChild(buttons);

        var hint = "PDF: Im Druckfenster bei „Ziel“ oder „Drucker“ den Eintrag „Als PDF speichern“ " +
            "(unter Windows auch „Microsoft Print to PDF“) wählen. " +
            "Die Route führt zu Fuß in der Reihenfolge der Liste von deinem Standort aus.";
        if (stops.length > MAX_ROUTE_PLACES) {
            hint += " Google Maps nimmt höchstens " + MAX_ROUTE_PLACES + " Orte: Die Route enthält die ersten " +
                MAX_ROUTE_PLACES + " der Liste.";
        }
        bar.appendChild(element("p", "merkliste-tools__hint", hint));
        return bar;
    }

    /** The hours of the whole week, folded (<details>); the current day is marked. */
    function weekHours(place, moment) {
        var details = element("details", "merkliste-week");
        details.appendChild(element("summary", "", "Öffnungszeiten der Woche"));
        var list = element("dl", "merkliste-week__list");
        for (var day = 0; day < 7; day++) {
            var name = element("dt", "", Oeffnungszeiten.DAY_NAMES[day]);
            var hours = element("dd", "", hoursOf(place, day));
            if (day === moment.day) {
                name.className = "merkliste-week__today";
                hours.className = "merkliste-week__today";
            }
            list.appendChild(name);
            list.appendChild(hours);
        }
        details.appendChild(list);
        return details;
    }

    /**
     * "Entfernen" of a place or an event: removes it and draws the list again, but the page stays where it was
     * (fixed 2026-10-14: before, the focus moved to the summary line at the top and the page jumped up).
     * scrollTo() puts the page back to its old position; focus({ preventScroll: true }) keeps the keyboard focus
     * near without scrolling.
     */
    function removeAndStay(id) {
        var top = window.scrollY;
        Merkliste.toggle(id);
        draw();
        window.scrollTo(0, top);
        var summary = document.getElementById("merkliste-zusammenfassung");
        if (summary) {
            summary.focus({ preventScroll: true });   // the button is gone: keep the keyboard focus near
        }
    }

    /** One saved place: name, category, type and address, links, week hours; today's hours, state, "Entfernen". */
    function placeItem(place, moment) {
        var item = element("li", "place place--cat cat-" + place.kat);     // stripe in the category colour (2026-10-14)

        var text = element("div");
        text.appendChild(element("span", "place__name", place.name));
        var details = element("span", "place__type merkliste-place__details");
        var category = element("span", "merkliste-place__category cat-" + place.kat);
        category.appendChild(element("span", "swatch swatch--l3"));
        category.appendChild(document.createTextNode(CATEGORY_NAMES[place.kat] || place.kat));
        details.appendChild(category);
        details.appendChild(element("span", "", Steckbrief.typeName(place) + (place.adresse ? " · " + place.adresse : "")));
        text.appendChild(details);

        var links = element("span", "merkliste-place__links");
        var mapLink = element("a", "", "Auf der Karte");
        mapLink.href = "index.html#" + place.quadrat;
        links.appendChild(mapLink);
        var route = element("a", "", "Route");
        route.href = Steckbrief.routeUrl(place);
        route.target = "_blank";
        route.rel = "noopener";
        route.appendChild(element("span", "visually-hidden", " zu " + place.name + " in Google Maps (öffnet in neuem Tab)"));
        links.appendChild(route);
        if (window.Merkmale) {
            // link "Webseite" of the place, if OpenStreetMap knows one (js/merkmale.js builds it escaped, 2026-10-14)
            links.insertAdjacentHTML("beforeend", Merkmale.websiteMarkup(place, ""));
        }
        if (window.Merkmale) {
            text.insertAdjacentHTML("beforeend", Merkmale.markup(place));   // tags like "vegan" (2026-10-14)
        }
        text.appendChild(links);
        if (place.zeiten) {
            text.appendChild(weekHours(place, moment));
        }
        item.appendChild(text);

        var status = statusOf(place, moment);
        var right = element("div", "place__status");
        right.appendChild(element("span", "place__hours", "heute " + hoursOf(place, moment.day)));
        right.appendChild(element("span", "badge badge--" + status, STATUS_WORDS[status]));
        var remove = element("button", "button button--small button--secondary merkliste-place__remove", "Entfernen");
        remove.type = "button";
        remove.setAttribute("aria-label", "Entfernen: " + place.name);
        remove.addEventListener("click", function () {
            removeAndStay(place.id);            // the place is saved, so toggle removes it
        });
        right.appendChild(remove);
        item.appendChild(right);
        return item;
    }

    /** One panel per Quadrat: code, name, number of places, link to the map, and the list. */
    function blockGroup(code, places, moment) {
        var section = element("section", "panel merkliste-group");
        var head = element("div", "merkliste-group__head");
        var title = element("h2", "merkliste-group__title");
        title.appendChild(element("span", "block-code", code));
        var block = window.QUADRATE[code];
        if (block && block.name) {
            title.appendChild(element("span", "", block.name));
        }
        title.appendChild(element("span", "merkliste-group__count", count(places.length, "Ort", "Orte")));
        head.appendChild(title);
        section.appendChild(head);

        var list = element("ul", "place-list");
        for (var i = 0; i < places.length; i++) {
            list.appendChild(placeItem(places[i], moment));
        }
        section.appendChild(list);
        return section;
    }

    /* ---------------- saved events (added 2026-10-13) ---------------- */

    /**
     * The saved events (their ids are in the same list as the places, js/merkliste.js), each with its next
     * occurrence within the next 60 days: [{ id, event, single, next }], next is null if no date is coming any
     * more; single is the date if only one date of the event is saved (since 2026-10-14, Events.savedEntries()).
     * Empty if js/events.js is not loaded.
     */
    function savedEvents() {
        if (!window.Events) {
            return [];
        }
        return Events.savedEntries(Merkliste.ids());
    }

    /**
     * The venue of an event in the form of a place, for the route links: name = the place in the Quadrat
     * ("Paradeplatz"), no address, the Quadrat. Google Maps then searches "Paradeplatz, O1, Mannheim".
     */
    function eventVenue(event) {
        return { name: event.ort, adresse: null, quadrat: event.quadrat };
    }

    /** One panel "Gemerkte Events": title, kind and place, the next date and "Entfernen" per event. */
    function eventsGroup(entries) {
        var now = new Date();
        var section = element("section", "panel merkliste-group merkliste-events");
        var head = element("div", "merkliste-group__head");
        var title = element("h2", "merkliste-group__title");
        title.appendChild(element("span", "", "Gemerkte Events"));
        title.appendChild(element("span", "merkliste-group__count", count(entries.length, "Event", "Events")));
        head.appendChild(title);
        section.appendChild(head);

        var list = element("ul", "place-list");
        for (var i = 0; i < entries.length; i++) {
            list.appendChild(eventItem(entries[i], now));
        }
        section.appendChild(list);
        return section;
    }

    /**
     * Calendar of the saved events (added 2026-10-14), next to the list "Gemerkte Events": one month as a table,
     * every day with a saved event has a dot per event in the colour of its kind (classes event--art-... from
     * css/events.css) and is a button: a click moves the focus to that event in the list and lights it up.
     * The arrows show the month before or after; only the calendar is drawn again then.
     */
    function eventsCalendar(entries) {
        var today = new Date();
        if (calendarMonth === null) {
            calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        }
        var year = calendarMonth.getFullYear();
        var month = calendarMonth.getMonth();
        var daysInMonth = new Date(year, month + 1, 0).getDate();   // day 0 of the next month = last day
        var todayIso = Events.isoDate(today);

        // the dates of the saved events in this month: { "2026-10-16": [entry, ...] }; a saved series has a dot on
        // every one of its days, a single saved date only on its day (2026-10-14)
        var perDay = {};
        var all = Events.between(calendarMonth, daysInMonth);
        for (var j = 0; j < all.length; j++) {
            for (var i = 0; i < entries.length; i++) {
                var sameEvent = entries[i].event.id === all[j].event.id;
                if (sameEvent && (entries[i].single === null || entries[i].single === all[j].iso)) {
                    (perDay[all[j].iso] = perDay[all[j].iso] || []).push(entries[i]);
                }
            }
        }

        var section = element("section", "panel merkliste-calendar");
        section.setAttribute("aria-label", "Kalender deiner gemerkten Events");
        var head = element("div", "merkliste-calendar__head");
        var back = element("button", "button button--secondary button--small", "‹");
        back.type = "button";
        back.setAttribute("aria-label", "Vorheriger Monat");
        var title = element("h2", "merkliste-calendar__title", MONTH_NAMES[month] + " " + year);
        var forward = element("button", "button button--secondary button--small", "›");
        forward.type = "button";
        forward.setAttribute("aria-label", "Nächster Monat");
        head.appendChild(back);
        head.appendChild(title);
        head.appendChild(forward);
        section.appendChild(head);
        back.addEventListener("click", function () {
            calendarMonth = new Date(year, month - 1, 1);
            section.replaceWith(eventsCalendar(entries));
        });
        forward.addEventListener("click", function () {
            calendarMonth = new Date(year, month + 1, 1);
            section.replaceWith(eventsCalendar(entries));
        });

        var table = element("table", "merkliste-calendar__grid");
        var headRow = element("tr");
        for (var d = 0; d < 7; d++) {
            var th = element("th", "", WEEKDAY_SHORT[d]);
            th.scope = "col";
            headRow.appendChild(th);
        }
        var thead = element("thead");
        thead.appendChild(headRow);
        table.appendChild(thead);
        var body = element("tbody");
        var row = element("tr");
        var offset = (calendarMonth.getDay() + 6) % 7;            // empty cells before the 1st (0 = Monday)
        for (var e = 0; e < offset; e++) {
            row.appendChild(element("td"));
        }
        for (var day = 1; day <= daysInMonth; day++) {
            var iso = Events.isoDate(new Date(year, month, day));
            var events = perDay[iso] || [];
            var cell = element("td");
            var box = element(events.length > 0 ? "button" : "span",
                "merkliste-calendar__day" + (iso === todayIso ? " merkliste-calendar__day--today" : ""));
            box.appendChild(element("span", "", String(day)));
            if (events.length > 0) {
                box.type = "button";
                box.setAttribute("aria-label", day + ". " + MONTH_NAMES[month] + ": " + events.map(function (entry) {
                    return entry.event.titel;
                }).join(", "));
                var dots = element("span", "merkliste-calendar__dots");
                dots.setAttribute("aria-hidden", "true");
                for (var k = 0; k < Math.min(events.length, 3); k++) {
                    dots.appendChild(element("span", "merkliste-calendar__dot event--art-" + events[k].event.art));
                }
                box.appendChild(dots);
                box.addEventListener("click", showEventInList.bind(null, events[0].id));   // the saved id
            }
            cell.appendChild(box);
            row.appendChild(cell);
            if ((offset + day) % 7 === 0 || day === daysInMonth) {
                body.appendChild(row);
                row = element("tr");
            }
        }
        table.appendChild(body);
        section.appendChild(table);
        return section;
    }

    /** A day of the calendar was clicked: move the focus to the event in the list and light it up for a moment. */
    function showEventInList(id) {
        var item = container.querySelector('[data-event="' + id + '"]');
        if (!item) {
            return;
        }
        item.focus();                                     // focus() also scrolls it into view
        item.classList.add("is-highlighted");
        window.setTimeout(function () {
            item.classList.remove("is-highlighted");
        }, 1600);
    }

    /** One saved event as a list item, built like a place: name and details on the left, date and button on the right. */
    function eventItem(entry, now) {
        var event = entry.event;
        var item = element("li", "place");
        item.setAttribute("data-event", entry.id);       // the calendar next to the list finds the event by it
        item.tabIndex = -1;                               // ... and can move the keyboard focus to it
        var text = element("div");
        text.appendChild(element("span", "place__name", event.titel));
        if (entry.single) {
            text.appendChild(element("span", "merkliste-event__single", "nur dieser Termin"));   // 2026-10-14
        } else if (Events.repeatText(event)) {
            text.appendChild(element("span", "merkliste-event__single", "alle Termine"));
        }
        var details = element("span", "place__type merkliste-place__details");
        details.appendChild(element("span", "", (Events.ART_NAMES[event.art] || event.art) + " · " + event.ort +
            " · Quadrat " + event.quadrat));
        text.appendChild(details);

        // the same links as for a place: to the Quadrat on the map, and a route to the venue (2026-10-13)
        var links = element("span", "merkliste-place__links");
        var mapLink = element("a", "", "Auf der Karte");
        mapLink.href = "index.html#" + event.quadrat;
        links.appendChild(mapLink);
        var route = element("a", "", "Route");
        route.href = Steckbrief.routeUrl(eventVenue(event));
        route.target = "_blank";
        route.rel = "noopener";
        route.appendChild(element("span", "visually-hidden", " zu " + event.ort + " in Google Maps (öffnet in neuem Tab)"));
        links.appendChild(route);
        text.appendChild(links);
        item.appendChild(text);

        var right = element("div", "place__status");
        var when = entry.next ? Events.dayText(entry.next, now) + ", " + Events.timeText(event) :
            (entry.single ? "Termin vorbei" : "kein kommender Termin");
        right.appendChild(element("span", "place__hours", when));
        var remove = element("button", "button button--small button--secondary merkliste-place__remove", "Entfernen");
        remove.type = "button";
        remove.setAttribute("aria-label", "Entfernen: " + event.titel);
        remove.addEventListener("click", function () {
            removeAndStay(entry.id);            // the event (or its date) is saved, so toggle removes it
        });
        right.appendChild(remove);
        item.appendChild(right);
        return item;
    }

    /* ---------------- drawing ---------------- */

    /** Draws the whole content again: notice, buttons and the places grouped by Quadrat. */
    function draw() {
        // "Treffen planen" (js/treffen.js, added 2026-10-13) follows the list: meeting points, shown or hidden.
        if (window.Treffen) {
            Treffen.refresh();
        }
        // "Tag planen" (js/tagesplaner.js, added 2026-10-13) follows the list in the same way.
        if (window.Tagesplaner) {
            Tagesplaner.refresh();
        }
        container.textContent = "";
        var moment = now();
        document.getElementById("merkliste-stand").textContent = "Stand: " +
            new Date().toLocaleDateString("de-DE") + ", " + Oeffnungszeiten.formatTime(moment.minutes) + " Uhr";

        if (!Merkliste.isAvailable()) {
            var blocked = element("div", "notice notice--warning");
            blocked.appendChild(element("p", "notice__title", "Merken nicht möglich"));
            blocked.appendChild(element("p", "", "Dein Browser erlaubt dieser Seite nicht, Daten zu speichern (zum Beispiel in einem privaten Fenster)."));
            container.appendChild(blocked);
            return;
        }
        container.appendChild(modeNotice());

        var places = savedPlaces();
        var events = savedEvents();
        if (places.length === 0 && events.length === 0) {
            container.appendChild(emptyState());
            return;
        }
        // Group the sorted places by Quadrat: { "G1": [place, place], ... } and the codes in order.
        var groups = {};
        var codes = [];
        for (var i = 0; i < places.length; i++) {
            var code = places[i].quadrat;
            if (!groups[code]) {
                groups[code] = [];
                codes.push(code);
            }
            groups[code].push(places[i]);
        }

        // buttons (PDF, route to all) on top, then the saved events (they have a fixed time), then the places
        container.appendChild(toolbar(places, codes.length, events));
        // Ordered in rows since 2026-10-14 (css/merkliste.css): the saved events with their calendar side by side,
        // then the places in two columns on wide screens.
        if (events.length > 0) {
            var eventsRow = element("div", "merkliste-events-row");
            eventsRow.appendChild(eventsGroup(events));
            if (window.Events) {
                eventsRow.appendChild(eventsCalendar(events));
            }
            container.appendChild(eventsRow);
        }
        var placesBox = element("div", "merkliste-places");
        for (var c = 0; c < codes.length; c++) {
            placesBox.appendChild(blockGroup(codes[c], groups[codes[c]], moment));
        }
        container.appendChild(placesBox);
    }

    /** Before printing (also "Als PDF speichern"): unfold the week hours of every place. */
    function openAllWeeks() {
        var folds = container.querySelectorAll("details");
        for (var i = 0; i < folds.length; i++) {
            folds[i].open = true;
        }
    }

    function init() {
        container = document.getElementById("merkliste-inhalt");
        for (var i = 0; i < window.ORTE.length; i++) {
            placeById[window.ORTE[i].id] = window.ORTE[i];
        }
        window.addEventListener("beforeprint", openAllWeeks);
        draw();
    }

    init();
})();
