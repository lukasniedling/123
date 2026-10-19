/*
 * tagesplaner.js - "Tag planen" on merkliste.html: puts the saved places and events into an order in which
 * every place is still open when you get there, with times, walking times and one route through all of them.
 * Offers window.Tagesplaner.  [V2] Added 2026-10-13 (final-v3).
 *
 * How it fits in:
 * - The saved ids come from window.Merkliste (js/merkliste.js), the places from window.ORTE, their hours
 *   from window.Oeffnungszeiten, the events and their dates from window.Events (js/events.js).
 * - Walking times: distance between the positions of js/data/merkmale.js (Standort.distance in
 *   js/standort.js), a bit longer than the straight line (DETOUR). An event has no position of its own, so
 *   it gets the middle of all places in its Quadrat. Without a position the planner counts DEFAULT_WALK minutes.
 * - js/merkliste-seite.js calls Tagesplaner.refresh() whenever it draws the list (also after "Entfernen").
 * - Changed 2026-10-14: called "Tag planen" (before: "Abend planen", file abendplaner.js). The plan has its
 *   own buttons: "Plan als PDF" prints only the plan (class print-dayplan on <body>, css/merkliste.css),
 *   "Plan per E-Mail" is a mailto: link with the plan as text, "Text kopieren" copies the same text.
 *   The PDF of the whole Merkliste no longer contains "Tag planen" and "Treffen planen".
 *
 * The plan (function plan) is a simple "greedy" method, worked out step by step:
 *   1. Start at the chosen time. Events are fixed: they happen at their time.
 *   2. Of the places that are open when you arrive and stay open for the chosen time, take the one that
 *      CLOSES FIRST (so nothing is missed later); if two close at the same time, the nearer one. Before an
 *      event the stay may be shorter (at least MIN_STAY minutes), so there is time to walk to the event.
 *   3. If no place fits, go to the next event. If there is no event left either, wait until the next
 *      saved place opens (shown as "freie Zeit").
 *   4. Repeat until everything is planned or it is 6 in the morning; the rest is listed with the reason.
 * It does not try every order (that would be too many with ten places), so it finds a good plan, not
 * always the best one. That is enough for an dayplan, and every step can be explained.
 * Classic script without modules, so the page also works by double-click (file://).
 */
(function () {
    "use strict";

    var MINUTES_PER_DAY = 1440;
    var LAST_MINUTE = MINUTES_PER_DAY + 360;   // the plan ends at 06:00 the next morning at the latest
    var MIN_STAY = 30;                         // a place that closes sooner than this after arriving is left out
    var WALK_SPEED = 75;                       // metres per minute (4.5 km/h)
    var DETOUR = 1.3;                          // streets are longer than the straight line
    var DEFAULT_WALK = 10;                     // minutes, if a position is missing
    var MAX_ROUTE_STOPS = 10;                  // Google Maps takes the destination and up to 9 stops
    var MAILTO_LIMIT = 1800;                   // some e-mail programs cut mailto: links longer than about 2000 characters

    var form = null;           // <form id="tagesplan-formular">
    var section = null;        // <section id="tagesplan">
    var output = null;         // <div id="tagesplan-plan">
    var mailLink = null;       // <a id="tagesplan-mail"> "Plan per E-Mail" (added 2026-10-14)
    var note = null;           // <p id="tagesplan-hinweis">: messages of the buttons
    var lastText = { subject: "", body: "" };   // the plan as text, made again by every update()
    var openedNote = "";       // "Gespeicherter Plan geöffnet ...", shown until the visitor changes the form (2026-10-14)
    var timeSlider = null;     // start time (js/zeitregler.js)
    var placeById = {};        // id -> place of window.ORTE
    var blockCentre = null;    // code -> { lat, lon }: middle of all places in a Quadrat (for events)

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

    /** Minutes of the plan as a clock time; after midnight 1530 -> "01:30". */
    function clock(minutes) {
        return Oeffnungszeiten.formatTime(minutes % MINUTES_PER_DAY);
    }

    /** Is the place open at minutes of the plan (above 1440 = the next day)? */
    function openAt(place, day, minutes) {
        if (minutes >= MINUTES_PER_DAY) {
            return Oeffnungszeiten.isOpen(place, (day + 1) % 7, minutes - MINUTES_PER_DAY) === true;
        }
        return Oeffnungszeiten.isOpen(place, day, minutes) === true;
    }

    /** Minutes until the place closes, counted from minutes of the plan (null if closed). */
    function untilClose(place, day, minutes) {
        if (minutes >= MINUTES_PER_DAY) {
            return Oeffnungszeiten.minutesUntilClose(place, (day + 1) % 7, minutes - MINUTES_PER_DAY);
        }
        return Oeffnungszeiten.minutesUntilClose(place, day, minutes);
    }

    /** Minutes until the place opens, counted from minutes of the plan (null if open or not soon). */
    function untilOpen(place, day, minutes) {
        if (minutes >= MINUTES_PER_DAY) {
            return Oeffnungszeiten.minutesUntilOpen(place, (day + 1) % 7, minutes - MINUTES_PER_DAY);
        }
        return Oeffnungszeiten.minutesUntilOpen(place, day, minutes);
    }

    /** The middle of all places of every Quadrat (worked out once): the position of an event's venue. */
    function centreOf(code) {
        if (blockCentre === null) {
            var sums = {};
            for (var i = 0; i < window.ORTE.length; i++) {
                var position = Merkmale.position(window.ORTE[i]);
                if (position) {
                    var sum = sums[window.ORTE[i].quadrat] || (sums[window.ORTE[i].quadrat] = { lat: 0, lon: 0, n: 0 });
                    sum.lat += position.lat;
                    sum.lon += position.lon;
                    sum.n += 1;
                }
            }
            blockCentre = {};
            for (var key in sums) {
                blockCentre[key] = { lat: sums[key].lat / sums[key].n, lon: sums[key].lon / sums[key].n };
            }
        }
        return blockCentre[code] || null;
    }

    /** Position of a stop of the plan ({ place } or { event }), or null. */
    function positionOf(stop) {
        if (!window.Merkmale) {
            return null;
        }
        return stop.place ? Merkmale.position(stop.place) : centreOf(stop.event.quadrat);
    }

    /** Walking minutes between two stops, rounded up to 5 minutes; 0 at the very start (from = null). */
    function walk(from, to) {
        if (from === null) {
            return 0;
        }
        var a = positionOf(from);
        var b = positionOf(to);
        if (!a || !b || !window.Standort) {
            return DEFAULT_WALK;
        }
        var minutes = Standort.distance(a, b) * DETOUR / WALK_SPEED;
        return Math.max(5, Math.ceil(minutes / 5) * 5);
    }

    /* ---------------- the plan ---------------- */

    /**
     * Works out the plan for a date, a start time (minutes) and the time per place (minutes).
     * Returns { steps, skipped }:
     *   steps: [{ place or event, from, to, walk, closes (places), free (minutes of waiting before it) }]
     *   skipped: [{ name, reason }]
     */
    function plan(date, start, stay) {
        var day = Oeffnungszeiten.dayIndexOf(date);
        var left = [];                         // saved places with known hours, not planned yet
        var skipped = [];
        var ids = Merkliste.ids();
        for (var i = 0; i < ids.length; i++) {
            var place = placeById[ids[i]];
            if (!place) {
                continue;
            }
            if (place.zeiten) {
                left.push(place);
            } else {
                skipped.push({ name: place.name, reason: "Öffnungszeiten unbekannt" });
            }
        }
        // the saved events that take place on this day, in the order of their start
        var events = [];
        if (window.Events) {
            var occurrences = Events.between(date, 1);
            for (var e = 0; e < occurrences.length; e++) {
                if (Events.isSavedOccurrence(ids, occurrences[e])) {   // the series or this date (2026-10-14)
                    events.push(occurrences[e]);
                }
            }
        }

        var steps = [];                        // the finished plan: one entry per stop, in order
        var time = start;                      // the "clock" of the plan in minutes since 00:00 (e.g. 1080 = 18:00)
        var here = null;                       // where we are now: the last stop ({ place } or { event }), null at the start
        var free = 0;                          // minutes of waiting before the next stop (shown as "freie Zeit")
        // Repeat: decide the next stop, add it to "steps", move the clock on.
        while (time < LAST_MINUTE && (left.length > 0 || events.length > 0)) {   // until 06:00 next morning, while something is left
            // 1. Is the next event still reachable?
            var nextEvent = events.length > 0 ? events[0] : null;                // the earliest saved event of the day, or null if none
            // next line: true if we would only get there when less than 30 minutes of the event are left (end - 30 < arrival)
            if (nextEvent && nextEvent.end - MIN_STAY < time + walk(here, { event: nextEvent.event })) {
                skipped.push({ name: nextEvent.event.titel, reason: "ist zu dieser Zeit schon (fast) vorbei" });   // into "nicht im Plan"
                events.shift();                                                  // remove it from the front of the list of events
                continue;                                                        // start the loop again with the next event
            }

            // 2. THE DECISION RULE: of all places that fit now, take the one that CLOSES FIRST ("greedy" method).
            var best = null;                                                     // the best place of this round; none found yet
            for (var p = 0; p < left.length; p++) {                              // look at every saved place not planned yet
                var stop = { place: left[p] };                                   // the place as a stop, the form walk() needs
                var arrive = time + walk(here, stop);                            // arrival = now + walking minutes from where we are
                if (!openAt(left[p], day, arrive)) {                             // a) is it open when we arrive?
                    continue;                                                    //    no: skip it, try the next place
                }
                var open = untilClose(left[p], day, arrive);                     // minutes it is still open after we arrive
                var length = Math.min(stay, open);                               // stay the chosen time per place, but at most until it closes
                if (nextEvent) {                                                 // c) is an event coming later?
                    length = Math.min(length, nextEvent.start - walk(stop, { event: nextEvent.event }) - arrive);   //    leave in time to walk to it
                }
                if (length < MIN_STAY) {                                         // b) less than 30 minutes left there?
                    continue;                                                    //    not worth it: skip it
                }
                var closes = arrive + open;                                      // the closing time of this place (minutes since 00:00)
                // next line: the first place that fits, or one that closes earlier than the best so far (same time: the nearer one)
                if (best === null || closes < best.closes || (closes === best.closes && arrive < best.from)) {
                    best = { place: left[p], from: arrive, to: arrive + length, closes: closes, index: p };   // remember it as the best place
                }
            }

            // 3. A place was found: plan it.
            if (best !== null) {
                best.walk = walk(here, { place: best.place });                   // walking minutes to it, shown as "ca. 5 Min. zu Fuß"
                best.free = free;                                                // waiting time before it, shown as "freie Zeit"
                steps.push(best);                                                // add it at the end of the plan
                left.splice(best.index, 1);                                      // take it out of the places still to plan
                here = { place: best.place };                                    // we are now at this place
                time = best.to;                                                  // the clock jumps to the time we leave it
                free = 0;                                                        // no waiting time yet before the next stop
            } else if (nextEvent) {                                              // 4. no place fits, but an event is next: go there
                var way = walk(here, { event: nextEvent.event });                // walking minutes to the event
                var begin = Math.max(time + way, nextEvent.start);               // we arrive or it starts, whichever is later
                steps.push({ event: nextEvent.event, from: begin, to: nextEvent.end, walk: way,
                    free: free + Math.max(0, nextEvent.start - (time + way)) });   // add the event; waiting time if we are early
                events.shift();                                                  // the event is planned: remove it from the list
                here = { event: nextEvent.event };                               // we are now at the event
                time = nextEvent.end;                                            // the clock jumps to the end of the event
                free = 0;
            } else {                                                             // 5. nothing fits, no event left: wait for an opening
                var wait = null;                                                 // the shortest wait until any place opens
                for (var w = 0; w < left.length; w++) {                          // look at every place still to plan
                    var opens = untilOpen(left[w], day, time);                   // minutes until it opens, or null if not any more today
                    if (opens !== null && (wait === null || opens < wait)) {     // does it open sooner than the others so far?
                        wait = opens;                                            // then this is the shortest wait so far
                    }
                }
                if (wait === null || time + wait >= LAST_MINUTE) {              // nothing opens any more before 06:00?
                    break;                                                       // then the plan is finished: leave the loop
                }
                time = time + wait;                                              // move the clock on to that opening ...
                free = free + wait;                                              // ... and count it as waiting time ("freie Zeit")
            }
        }
        for (var r = 0; r < left.length; r++) {
            var closedAllDay = Oeffnungszeiten.hoursText(left[r], day) === "geschlossen";
            skipped.push({ name: left[r].name, reason: closedAllDay ?
                "hat am " + Oeffnungszeiten.DAY_NAMES[day] + " geschlossen" :
                "passt mit seinen Öffnungszeiten (" + Oeffnungszeiten.hoursText(left[r], day) + ") nicht in den Plan" });
        }
        for (var s = 0; s < events.length; s++) {
            skipped.push({ name: events[s].event.titel, reason: "passt zeitlich nicht mehr hinein" });
        }
        return { steps: steps, skipped: skipped };
    }

    /* ---------------- drawing ---------------- */

    /** Google Maps link through the stops of the plan in their order (at most MAX_ROUTE_STOPS). */
    function routeUrl(steps) {
        var stops = [];
        for (var i = 0; i < steps.length && stops.length < MAX_ROUTE_STOPS; i++) {
            // an event's venue in the form of a place: Google Maps searches "Paradeplatz, O1, Mannheim"
            stops.push(steps[i].place || { name: steps[i].event.ort, adresse: null, quadrat: steps[i].event.quadrat });
        }
        var url = Steckbrief.routeUrl(stops[stops.length - 1]);
        if (stops.length > 1) {
            var waypoints = [];
            for (var j = 0; j < stops.length - 1; j++) {
                waypoints.push(Steckbrief.routeDestination(stops[j]));
            }
            url += "&waypoints=" + encodeURIComponent(waypoints.join("|"));
        }
        return url;
    }

    /** One step of the plan as a list item: "19:00–20:00", name, details and the walk to it. */
    function stepItem(step, number) {
        var item = element("li", "dayplan__step" + (step.event ? " dayplan__step--event" : " cat-" + step.place.kat));   // dot in the category colour (2026-10-14)
        if (step.free >= 15) {
            item.appendChild(element("p", "dayplan__gap", "freie Zeit bis " + clock(step.from - step.walk)));
        }
        if (step.walk > 0) {
            item.appendChild(element("p", "dayplan__walk", "ca. " + step.walk + " Min. zu Fuß"));
        }
        var line = element("p", "dayplan__line");
        line.appendChild(element("span", "dayplan__time", clock(step.from) + "–" + clock(step.to)));
        line.appendChild(element("span", "dayplan__name", number + ". " + (step.place ? step.place.name : step.event.titel)));
        item.appendChild(line);
        item.appendChild(element("p", "dayplan__details", detailsOf(step)));
        return item;
    }

    /** The line under a stop: "Imbiss · Quadrat Q1 · geöffnet bis 22:00" or "Event · Quartiersplatz · Quadrat T4". */
    function detailsOf(step) {
        if (step.place) {
            return Steckbrief.typeName(step.place) + " · Quadrat " + step.place.quadrat +
                " · geöffnet bis " + clock(step.closes);
        }
        return "Event · " + step.event.ort + " · Quadrat " + step.event.quadrat;
    }

    /**
     * The plan as plain text (added 2026-10-14), for the e-mail and "Text kopieren":
     * { subject: "Tagesplan für Dienstag, 14.10.2026", body: "18:00–19:00  Jamy's Burger ..." }.
     */
    function planText(date, result) {
        var dayName = Oeffnungszeiten.DAY_NAMES[Oeffnungszeiten.dayIndexOf(date)];
        var subject = "Tagesplan für " + dayName + ", " + date.toLocaleDateString("de-DE");
        var lines = [subject, ""];
        if (result.steps.length === 0) {
            lines.push("Zu dieser Zeit hat keiner der gemerkten Orte lange genug geöffnet.");
        }
        for (var i = 0; i < result.steps.length; i++) {
            var step = result.steps[i];
            if (step.walk > 0) {
                lines.push("   ca. " + step.walk + " Min. zu Fuß");
            }
            lines.push(clock(step.from) + "–" + clock(step.to) + "  " + (i + 1) + ". " +
                (step.place ? step.place.name : step.event.titel));
            lines.push("   " + detailsOf(step));
        }
        if (result.steps.length > 0) {
            lines.push("");
            lines.push("Ende gegen " + clock(result.steps[result.steps.length - 1].to) + " Uhr.");
            lines.push("Route in dieser Reihenfolge: " + routeUrl(result.steps));
        }
        if (result.skipped.length > 0) {
            lines.push("");
            lines.push("Nicht eingeplant:");
            for (var s = 0; s < result.skipped.length; s++) {
                lines.push("- " + result.skipped[s].name + ": " + result.skipped[s].reason);
            }
        }
        lines.push("");
        lines.push("Öffnungszeiten laut OpenStreetMap, ohne Gewähr.");
        return { subject: subject, body: lines.join("\n") };
    }

    /** The mailto: link with subject and text, both encoded (spaces, umlauts, line breaks); no recipient. */
    function mailtoUrl(text) {
        return "mailto:?subject=" + encodeURIComponent(text.subject) +
            "&body=" + encodeURIComponent(text.body.replace(/\n/g, "\r\n"));    // e-mail line breaks are \r\n
    }

    /**
     * "Plan als PDF" (added 2026-10-14): only the plan goes on paper. The class print-dayplan on <body>
     * tells css/merkliste.css (part 4) to hide everything else while printing; "afterprint" removes it.
     */
    function printPlan() {
        document.body.classList.add("print-dayplan");
        window.print();
    }

    /** "Text kopieren": into the clipboard; if the browser does not allow it, a hint to use the e-mail. */
    function copyPlan() {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(lastText.body).then(function () {        // the text starts with the title
                note.textContent = "Plan kopiert. Du kannst ihn jetzt zum Beispiel in einen Chat einfügen.";
            }, function () {
                note.textContent = "Kopieren nicht möglich. Nimm „Plan per E-Mail“ oder „Plan als PDF“.";
            });
        } else {
            note.textContent = "Kopieren nicht möglich. Nimm „Plan per E-Mail“ oder „Plan als PDF“.";
        }
    }

    /** Works out the plan with the values of the form and shows it. */
    function update() {
        output.textContent = "";
        if (!form.elements.datum.value) {
            return;
        }
        var parts = form.elements.datum.value.split("-");
        var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        var result = plan(date, timeSlider.get(), Number(form.elements.dauer.value));

        // the same plan as text for "Plan per E-Mail" and "Text kopieren" (added 2026-10-14)
        lastText = planText(date, result);
        mailLink.href = mailtoUrl(lastText);
        note.textContent = mailLink.href.length > MAILTO_LIMIT ?
            "Der Plan ist lang. Manche E-Mail-Programme kürzen ihn; nimm dann „Text kopieren“ oder „Plan als PDF“." : openedNote;   // the note of a saved plan stays

        if (result.steps.length === 0) {
            output.appendChild(element("p", "dayplan__empty", "Zu dieser Zeit hat keiner deiner gemerkten Orte lange genug geöffnet. " +
                "Versuch eine frühere Startzeit oder einen anderen Tag."));
        } else {
            var list = element("ol", "dayplan__steps");
            for (var i = 0; i < result.steps.length; i++) {
                list.appendChild(stepItem(result.steps[i], i + 1));
            }
            output.appendChild(list);
            var last = result.steps[result.steps.length - 1];
            output.appendChild(element("p", "dayplan__end", "Ende gegen " + clock(last.to) + " Uhr."));
            var route = element("a", "button dayplan__route", "Route in dieser Reihenfolge");
            route.href = routeUrl(result.steps);
            route.target = "_blank";
            route.rel = "noopener";
            route.appendChild(element("span", "visually-hidden", " (Google Maps, öffnet in neuem Tab)"));
            output.appendChild(route);
        }
        if (result.skipped.length > 0) {
            output.appendChild(element("h3", "dayplan__skipped-title", "Nicht eingeplant"));
            var skippedList = element("ul", "dayplan__skipped");
            for (var s = 0; s < result.skipped.length; s++) {
                skippedList.appendChild(element("li", "", result.skipped[s].name + ": " + result.skipped[s].reason));
            }
            output.appendChild(skippedList);
        }
        output.appendChild(element("p", "dayplan__note", "Fußwege grob geschätzt aus der Luftlinie. Öffnungszeiten laut OpenStreetMap, ohne Gewähr."));
    }

    /** Shows the section only when places or events are saved, then plans again. Called by js/merkliste-seite.js. */
    function refresh() {
        if (!form) {
            return;
        }
        section.hidden = Merkliste.ids().length === 0 || !Merkliste.isAvailable();
        if (!section.hidden) {
            update();
        }
    }

    function init() {
        form = document.getElementById("tagesplan-formular");
        section = document.getElementById("tagesplan");
        output = document.getElementById("tagesplan-plan");
        mailLink = document.getElementById("tagesplan-mail");
        note = document.getElementById("tagesplan-hinweis");
        if (!form) {
            return;
        }
        document.getElementById("tagesplan-pdf").addEventListener("click", printPlan);
        document.getElementById("tagesplan-kopieren").addEventListener("click", copyPlan);
        // "Im Konto speichern" (2026-10-14): only shown when someone is logged in
        var saveButton = document.getElementById("tagesplan-speichern");
        if (window.Verlauf && window.Konto && Konto.user()) {
            saveButton.hidden = false;
            saveButton.addEventListener("click", savePlanToAccount);
        }
        // after the print dialog (printed, saved or cancelled) the page prints everything normally again
        window.addEventListener("afterprint", function () {
            document.body.classList.remove("print-dayplan");
        });
        for (var i = 0; i < window.ORTE.length; i++) {
            placeById[window.ORTE[i].id] = window.ORTE[i];
        }
        timeSlider = Zeitregler.setup({
            slider: document.getElementById("tagesplan-zeit"),
            readout: document.getElementById("tagesplan-zeit-anzeige"),
            back: document.getElementById("tagesplan-zeit-zurueck"),
            forward: document.getElementById("tagesplan-zeit-vor"),
            onChange: update
        });
        var today = Events.isoDate(new Date());
        form.elements.datum.min = today;
        form.elements.datum.value = today;
        form.addEventListener("input", function () {
            openedNote = "";                   // the visitor changes the plan: the note of the saved plan is gone
        });
        form.addEventListener("input", update);
        form.addEventListener("change", update);
        form.addEventListener("submit", function (event) {
            event.preventDefault();            // Enter in a field: nothing to send
        });
        openSavedPlan();
    }

    /**
     * "Im Konto speichern" (added 2026-10-14): keeps the plan as it is shown (title and text) together with the values
     * of the form, so it can be read on konto.html and opened here again (js/verlauf.js, Verlauf.savePlan).
     */
    function savePlanToAccount() {
        var ok = Verlauf.savePlan({
            titel: lastText.subject,
            text: lastText.body,
            datum: form.elements.datum.value,
            start: timeSlider.get(),
            dauer: Number(form.elements.dauer.value)
        });
        note.textContent = ok ? "Gespeichert. Du findest den Plan auf der Seite Konto unter „Deine Tagespläne“." :
            "Nicht gespeichert: Melde dich an, oder der Browser erlaubt das Speichern gerade nicht.";
    }

    /**
     * Opens a saved plan: konto.html links here with "merkliste.html?plan=p123#tagesplan". The form gets the saved
     * date, start and time per place, and the plan is worked out again with the places saved now.
     * URLSearchParams reads the part after "?" of the address.
     */
    function openSavedPlan() {
        var id = new URLSearchParams(window.location.search).get("plan");
        if (!id || !window.Verlauf) {
            return;
        }
        var saved = Verlauf.plans();
        for (var i = 0; i < saved.length; i++) {
            if (saved[i].id === id) {
                form.elements.datum.value = saved[i].datum;
                form.elements.dauer.value = String(saved[i].dauer);
                timeSlider.set(saved[i].start);
                openedNote = "Gespeicherter Plan geöffnet: " + saved[i].titel + ". Er wird mit deinen jetzt " +
                    "gemerkten Orten neu berechnet.";
                return;
            }
        }
    }

    window.Tagesplaner = {
        refresh: refresh
    };

    init();
})();
