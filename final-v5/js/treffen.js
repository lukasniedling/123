/*
 * treffen.js - "Treffen planen" on merkliste.html: day, time and meeting point, and an invitation that says
 * whether the meeting point is open then, with a route. Offers window.Treffen.  [V2] Added 2026-10-13 (final-v3).
 *
 * How it fits in:
 * - The saved places come from window.Merkliste (js/merkliste.js) and window.ORTE (js/data/orte.js);
 *   "open at that time?" from window.Oeffnungszeiten (js/oeffnungszeiten.js); type names and route links
 *   from window.Steckbrief (js/steckbrief.js).
 * - js/merkliste-seite.js calls Treffen.refresh() whenever it draws the list (also after "Entfernen"),
 *   so the list "Treffpunkt" always matches the saved places.
 * - The time is chosen with the same slider as on the map, 0 to 24 Uhr in steps of 30 minutes
 *   (js/zeitregler.js), so it never shows "7:30 PM".
 * - Saved events (js/events.js) are meeting points too: choosing one sets day and time to its next date,
 *   and the invitation names the event and a route to its venue (2026-10-13).
 * - The invitation names only the meeting point (hours on that day, open at the time?, route), not the
 *   whole list of saved places (changed 2026-10-13 after testing: the list made it too long).
 * - "Einladung per E-Mail" builds a mailto: link (lecture 2: links): subject and text are encoded with
 *   encodeURIComponent, and the visitor's own e-mail program opens. The website sends nothing itself.
 *   "Text kopieren" copies the same text, e.g. for a chat.
 * Classic script without modules, so the page also works by double-click (file://).
 */
(function () {
    "use strict";

    // Some e-mail programs cut mailto: links longer than about 2000 characters.
    var MAILTO_LIMIT = 1800;

    var form = null;           // <form id="treffen-formular">
    var section = null;        // <section id="treffen">
    var preview = null;        // <pre id="treffen-vorschau">
    var note = null;           // <p id="treffen-hinweis">
    var timeSlider = null;     // the time slider as on the map (js/zeitregler.js): get() gives the minutes
    var placeById = {};        // id -> place of window.ORTE

    /** Adds a leading zero to numbers below 10: 7 -> "07". */
    function twoDigits(number) {
        return number < 10 ? "0" + number : String(number);
    }

    /** A date as "2026-10-16", the value of <input type="date">. */
    function isoDate(date) {
        return date.getFullYear() + "-" + twoDigits(date.getMonth() + 1) + "-" + twoDigits(date.getDate());
    }

    /**
     * The saved events with their next date within 60 days: [{ id, event, single, next }], next = null if none
     * is coming (added 2026-10-13; since 2026-10-14 from Events.savedEntries(), so a single saved date counts
     * only on its day). Empty if js/events.js is not loaded.
     */
    function savedEvents() {
        if (!window.Events) {
            return [];
        }
        return Events.savedEntries(Merkliste.ids());
    }

    /** The saved event behind a value "event:e05" of the list "Treffpunkt", or null. */
    function chosenEvent(value) {
        if (value.indexOf("event:") !== 0) {
            return null;
        }
        var events = savedEvents();
        for (var i = 0; i < events.length; i++) {
            if ("event:" + events[i].id === value) {
                return events[i];
            }
        }
        return null;
    }

    /**
     * An event was chosen as meeting point: day and time jump to its next date (they can still be changed),
     * then the preview is updated.
     */
    function onMeetingPointChange() {
        var entry = chosenEvent(form.elements.ort.value);
        if (entry && entry.next) {
            if (entry.next.iso >= form.elements.datum.min) {
                form.elements.datum.value = entry.next.iso;
            }
            timeSlider.set(Math.min(entry.next.start, 1440));
        }
        update();
    }

    /** The saved places that still exist in the data, in the order of the list (by Quadrat, then name). */
    function savedPlaces() {
        var ids = Merkliste.ids();
        var places = [];
        for (var i = 0; i < ids.length; i++) {
            if (placeById[ids[i]]) {
                places.push(placeById[ids[i]]);
            }
        }
        places.sort(function (a, b) {
            var byBlock = a.quadrat.localeCompare(b.quadrat, "de", { numeric: true });
            return byBlock !== 0 ? byBlock : a.name.localeCompare(b.name, "de");
        });
        return places;
    }

    /**
     * The chosen moment from the fields: { date, day, minutes, dayText, clock }. date is read as a local date
     * ("2026-10-16" split into its numbers), day is 0 = Monday ... 6 = Sunday as in the opening hours.
     */
    function chosenMoment() {
        var dateParts = form.elements.datum.value.split("-");
        var minutes = timeSlider.get();                    // the time slider, 0 ... 1440 (js/zeitregler.js)
        var date = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
        var day = Oeffnungszeiten.dayIndexOf(date);
        return {
            date: date,
            day: day,
            minutes: minutes,
            dayText: Oeffnungszeiten.DAY_NAMES[day] + ", " + twoDigits(date.getDate()) + "." +
                twoDigits(date.getMonth() + 1) + "." + date.getFullYear(),
            clock: Oeffnungszeiten.formatTime(minutes)
        };
    }

    /** "um 19:00 geöffnet", "um 19:00 geschlossen" or "Öffnungszeiten unbekannt". */
    function stateText(place, moment) {
        var open = Oeffnungszeiten.isOpen(place, moment.day, moment.minutes);
        if (open === null) {
            return "Öffnungszeiten unbekannt";
        }
        return "um " + moment.clock + " " + (open ? "geöffnet" : "geschlossen");
    }

    /** "Café Muster (Café, N 3, 5, Quadrat N3)": name with type, address and Quadrat. */
    function placeText(place) {
        return place.name + " (" + Steckbrief.typeName(place) + (place.adresse ? ", " + place.adresse : "") +
            ", Quadrat " + place.quadrat + ")";
    }

    /**
     * Builds subject and text of the invitation from the fields: { subject, body }. Only the meeting point
     * goes in (not the whole list): with a saved place its hours on that day, whether it is open at the
     * time, and a Google Maps route; with a meeting point of one's own just its text.
     */
    function invitation() {
        var moment = chosenMoment();                                     // the chosen day and time from the form
        var meetingPlace = placeById[form.elements.ort.value] || null;   // the chosen saved place, or null if it is no place
        var meetingEvent = chosenEvent(form.elements.ort.value);         // the chosen saved event ("event:e05"), or null
        var other = form.elements.anderer.value.trim();                  // the text of "Anderer Treffpunkt", spaces at the ends removed
        var lines = [];                                                  // the lines of the invitation, filled one by one

        lines.push("Hallo,");                                            // push(): add a line at the end of the list
        lines.push("");
        lines.push("lass uns treffen!");
        lines.push("Wann: " + moment.dayText + ", " + moment.clock + " Uhr");   // e.g. "Wann: Sonntag, 18.10.2026, 19:00 Uhr"
        // DECISION: which kind of meeting point was chosen? Exactly one of the three cases fills the line "Wo:".
        if (meetingPlace) {                                              // Case 1: a saved place
            lines.push("Wo: " + placeText(meetingPlace));                // its name, type, address and Quadrat
            var hours = Oeffnungszeiten.hoursText(meetingPlace, moment.day);   // its hours on that day, e.g. "11:00–22:00"
            if (hours === "unbekannt") {                                 // no hours in the data?
                lines.push("Öffnungszeiten: unbekannt");
            } else {                                                     // otherwise the hours and "um 19:00 geöffnet/geschlossen"
                lines.push("Öffnungszeiten am " + Oeffnungszeiten.DAY_NAMES[moment.day] + ": " + hours +
                    " (" + stateText(meetingPlace, moment) + ")");
            }
            lines.push("Route: " + Steckbrief.routeUrl(meetingPlace));   // a Google Maps link to the place
        } else if (meetingEvent) {                                       // Case 2: a saved event
            var ev = meetingEvent.event;                                 // the event itself (title, venue, Quadrat, times)
            lines.push("Wo: " + ev.ort + " (Quadrat " + ev.quadrat + ")");   // its venue
            lines.push("Event: " + ev.titel + ", " + Events.timeText(ev));   // title and time, e.g. "19:30–23:00 Uhr"
            lines.push("Route: " + Steckbrief.routeUrl({ name: ev.ort, adresse: null, quadrat: ev.quadrat }));   // route to the venue
        } else if (other !== "") {                                       // Case 3: nothing saved chosen, but a text typed in
            lines.push("Wo: " + other);                                  // just that text
        }
        var message = form.elements.nachricht.value.trim();              // the optional message of the visitor
        if (message !== "") {                                            // only if something was typed in
            lines.push("");
            lines.push(message);
        }
        lines.push("");
        lines.push("Geplant mit „Quadrate“. Öffnungszeiten von OpenStreetMap, ohne Gewähr.");

        return {                                                         // two parts: update() shows both, mailtoUrl() puts both into the link
            subject: "Treffen am " + moment.dayText.slice(0, 2) + ", " + twoDigits(moment.date.getDate()) + "." +
                twoDigits(moment.date.getMonth() + 1) + ". um " + moment.clock,   // e.g. "Treffen am So, 18.10. um 19:00"
            body: lines.join("\n")                                       // join(): all lines into one text, "\n" = line break
        };
    }

    /** The mailto: link: recipients, then subject and text, both encoded (spaces, umlauts, line breaks). */
    function mailtoUrl(text) {
        var recipients = form.elements.an.value.replace(/\s/g, "");     // "a@x.de, b@y.de" -> "a@x.de,b@y.de"
        return "mailto:" + recipients + "?subject=" + encodeURIComponent(text.subject) +
            "&body=" + encodeURIComponent(text.body.replace(/\n/g, "\r\n"));    // e-mail line breaks are \r\n
    }

    /** Writes the invitation into the preview and warns if the e-mail link gets too long. */
    function update() {
        var text = invitation();
        preview.textContent = "Betreff: " + text.subject + "\n\n" + text.body;
        if (mailtoUrl(text).length > MAILTO_LIMIT) {
            note.textContent = "Die Einladung ist lang. Manche E-Mail-Programme kürzen sie; nimm dann „Text kopieren“.";
        } else {
            note.textContent = "";
        }
    }

    /** "Einladung per E-Mail": the browser checks the fields, then the e-mail program opens with the text. */
    function onSubmit(event) {
        event.preventDefault();                          // do not send the form anywhere and do not reload the page
        window.location.href = mailtoUrl(invitation());  // open the "mailto:" link: the visitor's own e-mail program opens with the text
    }

    /** "Text kopieren": into the clipboard; if the browser does not allow it, a hint to copy by hand. */
    function onCopy() {
        var text = preview.textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                note.textContent = "Text kopiert. Du kannst ihn jetzt zum Beispiel in einen Chat einfügen.";
            }, function () {
                note.textContent = "Kopieren nicht möglich: Markiere den Text in der Vorschau und kopiere ihn mit Strg+C.";
            });
        } else {
            note.textContent = "Kopieren nicht möglich: Markiere den Text in der Vorschau und kopiere ihn mit Strg+C.";
        }
    }

    /**
     * Shows the section only when places are saved, fills the list "Treffpunkt" with them (the chosen one
     * stays chosen if it is still there) and updates the preview. Called by js/merkliste-seite.js.
     */
    function refresh() {
        if (!form) {
            return;
        }
        var places = savedPlaces();
        var events = savedEvents();
        section.hidden = (places.length === 0 && events.length === 0) || !Merkliste.isAvailable();
        var select = form.elements.ort;
        var chosen = select.value;
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);   // keep only the first option "Anderer Treffpunkt"
        }
        // two groups in the list (<optgroup>): the saved events and the saved places (events since 2026-10-13)
        if (events.length > 0) {
            var eventGroup = document.createElement("optgroup");
            eventGroup.label = "Gemerkte Events";
            for (var e = 0; e < events.length; e++) {
                var eventOption = document.createElement("option");
                eventOption.value = "event:" + events[e].id;               // "e05" or one date "e05@2026-10-16"
                eventOption.textContent = events[e].event.titel + " (" + events[e].event.ort + ", " + events[e].event.quadrat +
                    (events[e].single ? ", nur " + Events.shortDate(events[e].single) : "") + ")";
                eventGroup.appendChild(eventOption);
            }
            select.appendChild(eventGroup);
        }
        var placeGroup = document.createElement("optgroup");
        placeGroup.label = "Gemerkte Orte";
        for (var i = 0; i < places.length; i++) {
            var option = document.createElement("option");
            option.value = places[i].id;
            option.textContent = places[i].name + " (" + places[i].quadrat + ")";
            placeGroup.appendChild(option);
        }
        if (places.length > 0) {
            select.appendChild(placeGroup);
        }
        select.value = chosen;
        if (select.value !== chosen) {
            select.value = "";                 // the chosen place was removed from the list
        }
        update();
    }

    function init() {
        form = document.getElementById("treffen-formular");
        section = document.getElementById("treffen");
        preview = document.getElementById("treffen-vorschau");
        note = document.getElementById("treffen-hinweis");
        if (!form) {
            return;
        }
        for (var i = 0; i < window.ORTE.length; i++) {
            placeById[window.ORTE[i].id] = window.ORTE[i];
        }
        timeSlider = Zeitregler.setup({
            slider: document.getElementById("treffen-zeit"),
            readout: document.getElementById("treffen-zeit-anzeige"),
            back: document.getElementById("treffen-zeit-zurueck"),
            forward: document.getElementById("treffen-zeit-vor"),
            onChange: update                       // every new time updates the preview
        });
        var today = isoDate(new Date());
        form.elements.datum.min = today;           // no meetings in the past
        form.elements.datum.value = today;
        form.addEventListener("input", update);    // every change in a field updates the preview
        form.addEventListener("change", update);
        form.elements.ort.addEventListener("change", onMeetingPointChange);   // an event sets day and time
        form.addEventListener("submit", onSubmit);
        document.getElementById("treffen-kopieren").addEventListener("click", onCopy);
    }

    window.Treffen = {
        refresh: refresh
    };

    init();
})();
