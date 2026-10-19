/*
 * steckbrief.js - the profile panel ("Steckbrief"): everything about one Quadrat. On large screens it
 * lies over the right part of the map, on smaller screens it sits below the map (css/index.css).
 * Offers window.Steckbrief.                                                                      [V2]
 *
 * How it fits in:
 * - js/app.js calls Steckbrief.show("G1") when a Quadrat is selected and Steckbrief.clear() when the
 *   selection ends. After every filter change it calls Steckbrief.refresh().
 * - The content comes from window.QUADRATE (text, kind, source), window.ORTE (places and hours),
 *   window.FOTOS (photo and credit) and window.Filter.state (day, time and category of the filter).
 * - Layout and classes come from css/style.css (profile, place-group, place, badge, photo), small
 *   additions from css/index.css.
 * - Every place gets a "Merken" button; Quadrate with saved places get a pin on the map
 *   (Karte.markieren). Where a place is saved decides js/merkliste.js (window.Merkliste): in the
 *   account of js/konto.js when logged in, otherwise only for this tab (since 2026-10-13).
 * - Every place has a link "Route" to Google Maps; an open place that closes within an hour gets the
 *   badge "schließt bald" (Oeffnungszeiten.minutesUntilClose).
 * The texts of the places come from OpenStreetMap, so they are escaped before they go into the HTML.
 * Classic script without modules, so the page also works by double-click (file://).
 */
(function () {
    "use strict";

    var CATEGORY_ORDER = ["essen", "trinken", "kultur", "shoppen"];

    // Kind of Quadrat (field "art" of window.QUADRATE) in German.
    var ART_NAMES = {
        gebaeude: "bebautes Quadrat",
        platz: "Platz",
        park: "Park",
        parkplatz: "Parkplatz",
        teilweise: "teils bebaut"
    };

    // German names of the OpenStreetMap types (field "typ" of window.ORTE).
    var TYPE_NAMES = {
        // essen
        restaurant: "Restaurant", fast_food: "Imbiss", ice_cream: "Eiscafé",
        // trinken
        cafe: "Café", bar: "Bar", pub: "Kneipe", nightclub: "Club",
        // kultur
        arts_centre: "Kulturzentrum", attraction: "Sehenswürdigkeit", cinema: "Kino",
        community_centre: "Gemeinschaftszentrum", concert_hall: "Konzerthaus", gallery: "Galerie",
        library: "Bibliothek", museum: "Museum", place_of_worship: "Gotteshaus", theatre: "Theater",
        // shoppen
        alcohol: "Spirituosen", anime: "Anime und Manga", antiques: "Antiquitäten", art: "Kunsthandel",
        baby_goods: "Babyausstattung", bag: "Taschen", bakery: "Bäckerei", bathroom_furnishing: "Badausstattung",
        bed: "Betten", beverages: "Getränkemarkt", bicycle: "Fahrradladen", books: "Buchhandlung",
        boutique: "Boutique", butcher: "Metzgerei", cannabis: "Cannabis", car_parts: "Autoteile",
        carpet: "Teppiche", charity: "Sozialkaufhaus", chemist: "Drogerie", chocolate: "Schokolade",
        clothes: "Bekleidung", coffee: "Kaffee", computer: "Computer", confectionery: "Süßwaren",
        convenience: "Lebensmittel", cosmetics: "Kosmetik", craft: "Bastelbedarf", curtain: "Gardinen",
        deli: "Feinkost", department_store: "Kaufhaus", doityourself: "Baumarkt", "e-cigarette": "E-Zigaretten",
        electronics: "Elektronik", erotic: "Erotikartikel", fabric: "Stoffe", fairtrade: "Weltladen",
        fan: "Fanartikel", fashion_accessories: "Modeaccessoires", florist: "Blumen", frame: "Bilderrahmen",
        furniture: "Möbel", gift: "Geschenke", greengrocer: "Obst und Gemüse", hairdresser_supply: "Friseurbedarf",
        hearing_aids: "Hörgeräte", hifi: "Hi-Fi", houseware: "Haushaltswaren", hunting: "Jagdbedarf",
        interior_decoration: "Wohnaccessoires", jewelry: "Schmuck", kiosk: "Kiosk", kitchen: "Küchen",
        lighting: "Leuchten", lottery: "Lotto", mall: "Einkaufszentrum", medical_supply: "Sanitätshaus",
        mobile_phone: "Handyladen", mobile_phone_accessories: "Handyzubehör", model: "Modellbau",
        music: "Musik", musical_instrument: "Musikinstrumente", newsagent: "Zeitschriften", optician: "Optiker",
        pastry: "Konditorei", perfumery: "Parfümerie", pet: "Tierbedarf", seafood: "Fisch",
        second_hand: "Secondhand", shoes: "Schuhe", sports: "Sport", stationery: "Schreibwaren",
        supermarket: "Supermarkt", tea: "Tee", telecommunication: "Mobilfunk", tobacco: "Tabakwaren",
        toys: "Spielwaren", variety_store: "Kleinpreisgeschäft", watches: "Uhren", wine: "Wein", yes: "Geschäft"
    };

    // Used when a type is missing from the list above (e.g. after new data).
    var TYPE_FALLBACK = { essen: "Gastronomie", trinken: "Lokal", kultur: "Kultur", shoppen: "Geschäft" };

    // Words of the badge for the three states of a place.
    var STATUS_WORDS = { open: "geöffnet", closed: "geschlossen", unknown: "unbekannt" };

    // An open place that closes within this many minutes gets the badge "schließt bald".
    var CLOSING_SOON_MINUTES = 60;

    // Start of a Google Maps route link (documented URL form, no key needed): the destination is
    // added at the end, the start is left out, so Google Maps uses the visitor's own location.
    var ROUTE_URL = "https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=";

    // "Events hier" in the profile: events of the next 30 days, at most 3 (added 2026-10-13).
    var EVENT_DAYS = 30;
    var EVENT_MAX = 3;

    var panel = null;         // the <section id="steckbrief">
    var handlers = {};        // { onClose: function () } from js/app.js
    var currentCode = null;   // code of the Quadrat shown, or null
    var placeById = {};       // id -> place, for the pins of the saved places

    /* ---------------- small helpers ---------------- */

    /** Makes text safe for innerHTML: & < > " ' become entities (place names come from OpenStreetMap). */
    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    /** "2026-09-28" (date in the data files) -> "28.09.2026" (German date for visible text). */
    function germanDate(isoDate) {
        return String(isoDate).split("-").reverse().join(".");
    }

    /** First letter as a capital: "platz, links ..." -> "Platz, links ...". */
    function capitalise(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    /** "1 Ort" or "5 Orte". */
    function placesWord(count) {
        return count === 1 ? "1 Ort" : count + " Orte";
    }

    /** All places of a Quadrat, grouped by category: { essen: [...], trinken: [...], ... }. */
    function placesOf(code) {
        var groups = { essen: [], trinken: [], kultur: [], shoppen: [] };
        for (var i = 0; i < window.ORTE.length; i++) {
            var place = window.ORTE[i];
            if (place.quadrat === code && groups[place.kat]) {
                groups[place.kat].push(place);
            }
        }
        return groups;
    }

    /** State of a place at the moment of the filter: "open", "closed" or "unknown". */
    function statusOf(place, filter) {
        var open = Oeffnungszeiten.isOpen(place, filter.day, filter.minutes);
        if (open === null) {
            return "unknown";
        }
        return open ? "open" : "closed";
    }

    /** Number of open places in a list. */
    function countOpen(list, filter) {
        var count = 0;
        for (var i = 0; i < list.length; i++) {
            if (statusOf(list[i], filter) === "open") {
                count = count + 1;
            }
        }
        return count;
    }

    /** Sorts places: those with the feature of "Was dir wichtig ist" first (2026-10-14), then open, unknown, closed; by name. */
    function sortPlaces(list, filter) {
        var rank = { open: 0, unknown: 1, closed: 2 };
        return list.slice().sort(function (a, b) {
            // first the places with the feature the visitor finds important ("Was dir wichtig ist", 2026-10-14)
            if (window.Merkmale) {
                var wishA = Merkmale.matchesWish(a) ? 0 : 1;
                var wishB = Merkmale.matchesWish(b) ? 0 : 1;
                if (wishA !== wishB) {
                    return wishA - wishB;
                }
            }
            var difference = rank[statusOf(a, filter)] - rank[statusOf(b, filter)];
            if (difference !== 0) {
                return difference;
            }
            return a.name.localeCompare(b.name, "de");
        });
    }

    /** Swatch class for a number of open places: swatch--none or swatch--l1 ... swatch--l4 (style.css). */
    function swatchClass(openCount) {
        var level = Filter.levelOf(openCount);
        return level < 0 ? "swatch--none" : "swatch--l" + (level + 1);
    }

    /* ---------------- markup of the parts ---------------- */

    /**
     * Close button and head: tile with the code, title and short description. The button shows only
     * "×" (aria-hidden); the hidden text gives screen readers its name. It comes before the head, as a
     * direct child of the panel, so css/index.css can keep it in view while the panel scrolls (sticky).
     */
    function headMarkup(info, total) {
        var title = "Quadrat " + info.code;
        if (info.name && info.art !== "teilweise") {
            title += " – " + info.name;                     // G1 – Marktplatz; U2 keeps its name for the meta line
        }
        var kind = ART_NAMES[info.art] || "Quadrat";
        if (info.art === "teilweise" && info.name) {
            kind += ", mit " + info.name;
        }
        var meta = capitalise(kind) + " · " + info.seite + " der Kurpfalzstraße · " +
            (total === 0 ? "keine Orte eingetragen" : placesWord(total));
        return '<button class="profile__close" type="button" title="Schließen">' +
            '<span aria-hidden="true">×</span><span class="visually-hidden">Steckbrief schließen</span></button>' +
            '<header class="profile__head">' +
            '<span class="block-tile block-tile--selected" aria-hidden="true">' + escapeHtml(info.code) + '</span>' +
            '<div class="profile__heading">' +
            '<h2 class="profile__title" id="steckbrief-titel">' + escapeHtml(title) + '</h2>' +
            '<p class="profile__meta">' + escapeHtml(meta) + '</p>' +
            '</div>' +
            '</header>';
    }

    /**
     * Photo with caption and credit: author, linked licence and source. If the author asks for an exact
     * wording (field "namensnennung" in js/data/fotos.js), that text is printed unchanged instead of the
     * author's name. Photos cropped to 3:2 (field "ausschnitt") say so and link to the Impressum.
     */
    function photoMarkup(key) {
        var photo = window.FOTOS ? window.FOTOS[key] : null;
        if (!photo) {
            return "";
        }
        // The alt texts start with "Name in Quadrat: description"; the part before the colon is the caption.
        var caption = photo.alt.indexOf(":") > 0 ? photo.alt.split(":")[0] : "";
        var sourceName = photo.quelle.indexOf("commons.wikimedia.org") >= 0 ? "Wikimedia Commons" : "Quelle";
        var author;
        if (photo.namensnennung) {
            author = escapeHtml(photo.namensnennung);       // ends with " / ", the licence name follows
        } else {
            author = escapeHtml(photo.urheber) + ", ";
        }
        var cropNote = "";
        if (photo.ausschnitt) {
            cropNote = ', <a href="impressum.html#fotos">Ausschnitt</a>';
        }
        return '<figure class="photo">' +
            '<img src="' + escapeHtml(photo.datei) + '" alt="' + escapeHtml(photo.alt) + '" width="1200" height="800" loading="lazy">' +
            '<figcaption>' +
            (caption ? '<span class="photo__caption">' + escapeHtml(caption) + '</span>' : '') +
            '<span class="photo__credit">Foto: ' + author +
            '<a href="' + escapeHtml(photo.lizenzUrl) + '">' + escapeHtml(photo.lizenz) + '</a>' +
            ', <a href="' + escapeHtml(photo.quelle) + '">' + sourceName + '</a>' + cropNote + '</span>' +
            '</figcaption></figure>';
    }

    /** Number of places per category with the open ones at the chosen moment. */
    function countsMarkup(groups, filter) {
        var html = '<h3 class="profile__subtitle">Orte in diesem Quadrat</h3><ul class="profile-counts">';
        for (var i = 0; i < CATEGORY_ORDER.length; i++) {
            var key = CATEGORY_ORDER[i];
            var list = groups[key];
            var open = countOpen(list, filter);
            html += '<li class="cat-' + key + (list.length === 0 ? ' profile-counts__item--zero' : '') + '">' +
                '<span class="swatch ' + swatchClass(open) + '" aria-hidden="true"></span>' +
                '<span class="profile-counts__name"><span class="cat-icon cat-icon--' + key + '" aria-hidden="true"></span> ' +
                window.KATEGORIEN[key].name + '</span> ' +
                '<span class="profile-counts__number">' + list.length + '</span>' +
                (list.length > 0 ? ' <span class="profile-counts__open">(' + open + ' geöffnet)</span>' : '') +
                '</li>';
        }
        return html + '</ul>';
    }

    /**
     * "Events hier": the next events in this Quadrat within EVENT_DAYS days, each event only once
     * (js/events.js and js/data/events.js, added 2026-10-13). Nothing if they are not loaded or there is none.
     */
    function eventsMarkup(code) {
        if (!window.Events || !window.EVENTS) {
            return "";
        }
        var now = new Date();
        var yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        var all = Events.between(yesterday, EVENT_DAYS + 1);     // from yesterday: events still running from last night
        var shown = [];                                        // ids of the events already listed
        var html = "";
        for (var i = 0; i < all.length && shown.length < EVENT_MAX; i++) {
            var occurrence = all[i];
            var event = occurrence.event;
            if (event.quadrat !== code || Events.isOver(occurrence, now) || shown.indexOf(event.id) >= 0) {
                continue;
            }
            shown.push(event.id);
            html += '<li><span class="profile-events__when">' +
                escapeHtml(Events.dayText(occurrence, now) + ", " + Events.timeText(event)) + '</span> ' +
                escapeHtml(event.titel) +
                (event.anzeige ? ' <span class="profile-events__ad">Anzeige</span>' : '') + '</li>';
        }
        if (shown.length === 0) {
            return "";
        }
        return '<h3 class="profile__subtitle">Events hier</h3><ul class="profile-events">' + html + '</ul>' +
            '<p class="profile__source"><a href="events.html">Alle Events</a> (Beispiel-Einträge)</p>';
    }

    /** Left column: text, source, photo, the counts and the events of this Quadrat. */
    function aboutMarkup(info, groups, filter) {
        var html = '<div class="profile__about">';
        html += '<p>' + escapeHtml(info.text) + '</p>';
        if (info.quelle) {
            html += '<p class="profile__source">Quelle: ' + escapeHtml(info.quelle) + '</p>';
        }
        if (info.foto) {
            html += photoMarkup(info.foto);
        }
        html += countsMarkup(groups, filter);
        html += eventsMarkup(info.code);
        return html + '</div>';
    }

    /**
     * "Merken" toggle button of one place. Since 2026-10-13 also without an account: js/merkliste.js
     * then keeps the place for this tab only. Hidden only if the browser blocks all storage. The visible
     * word stays "Merken"; aria-pressed tells the state (css/index.css draws a tick and the sand colour),
     * and the hidden place name makes every button unique for screen readers ("Merken: Café X").
     */
    function saveButtonMarkup(place) {
        if (!Merkliste.isAvailable()) {
            return "";
        }
        var saved = Merkliste.isSaved(place.id);
        return '<button class="button button--secondary button--small place__save" type="button"' +
            ' data-id="' + escapeHtml(place.id) + '" aria-pressed="' + saved + '">' +
            'Merken<span class="visually-hidden">: ' + escapeHtml(place.name) + '</span></button>';
    }

    /**
     * Google Maps address of a walking route to one place. The data has no coordinates, so Google Maps
     * searches for the name with the address (or the Quadrat, if the address is missing) and "Mannheim".
     * Also used by js/ortssuche.js (quadrate.html).
     */
    function routeUrl(place) {
        return ROUTE_URL + encodeURIComponent(routeDestination(place));
    }

    /** Destination text of a place for Google Maps: "Name, Adresse (or Quadrat), Mannheim". */
    function routeDestination(place) {
        return place.name + ", " + (place.adresse || place.quadrat) + ", Mannheim";
    }

    /** German name of the type of a place ("cinema" -> "Kino"). Also used by js/ortssuche.js. */
    function typeName(place) {
        return TYPE_NAMES[place.typ] || TYPE_FALLBACK[place.kat] || place.typ;
    }

    /**
     * Link "Route" of one place: opens Google Maps in a new tab with a walking route to the place.
     * It is a plain link: nothing is sent to Google before the visitor clicks it
     * (datenschutz.html#schriften).
     */
    function routeMarkup(place) {
        return '<a class="place__route" href="' + escapeHtml(routeUrl(place)) + '" target="_blank" rel="noopener">' +
            'Route<span class="visually-hidden"> zu ' + escapeHtml(place.name) +
            ' in Google Maps (öffnet in neuem Tab)</span></a>';
    }

    /**
     * Badge of one place. An open place that closes within CLOSING_SOON_MINUTES gets the badge
     * "schließt bald" and a note with the closing time instead of the plain "geöffnet".
     */
    function badgeMarkup(place, status, filter) {
        if (status === "open") {
            var minutesLeft = Oeffnungszeiten.minutesUntilClose(place, filter.day, filter.minutes);
            if (minutesLeft !== null && minutesLeft <= CLOSING_SOON_MINUTES) {
                var closingTime = Oeffnungszeiten.formatTime((filter.minutes + minutesLeft) % 1440);
                return '<span class="place__note">schließt um ' + closingTime + ' (in ' + minutesLeft + ' Min.)</span>' +
                    '<span class="badge badge--soon">schließt bald</span>';
            }
        }
        return '<span class="badge badge--' + status + '">' + STATUS_WORDS[status] + '</span>';
    }

    /** One place: name, type, address and route link; hours of the chosen day and the badge. */
    function placeMarkup(place, filter) {
        var status = statusOf(place, filter);
        var type = typeName(place);
        var details = type + (place.adresse ? " · " + place.adresse : "");
        var hours = Oeffnungszeiten.hoursText(place, filter.day);
        if (hours === "unbekannt") {
            hours = "keine Angabe";                          // the badge already says "unbekannt"
        } else if (hours === "geschlossen") {
            hours = "ganztägig geschlossen";
        }
        var carryOver = Oeffnungszeiten.carryOverEnd(place, filter.day, filter.minutes);
        var html = '<li class="place">';
        html += '<div>';
        html += '<span class="place__name">' + escapeHtml(place.name) + '</span>';
        html += '<span class="place__type">' + escapeHtml(details) + '</span>';
        html += window.Merkmale ? Merkmale.markup(place) : "";       // tags like "vegan" (js/merkmale.js)
        html += routeMarkup(place);
        html += window.Merkmale ? Merkmale.websiteMarkup(place, "place__route place__web") : "";
        html += '</div>';
        html += '<div class="place__status">';
        html += '<span class="place__hours">' + escapeHtml(hours) + '</span>';
        if (carryOver !== null) {
            html += '<span class="place__note">vom Vortag bis ' + Oeffnungszeiten.formatTime(carryOver) + '</span>';
        }
        html += badgeMarkup(place, status, filter);
        html += saveButtonMarkup(place);
        html += '</div>';
        return html + '</li>';
    }

    /** List of places, already sorted. */
    function listMarkup(list, filter) {
        var sorted = sortPlaces(list, filter);
        var html = '<ul class="place-list">';
        for (var i = 0; i < sorted.length; i++) {
            html += placeMarkup(sorted[i], filter);
        }
        return html + '</ul>';
    }

    /** Title line of a category: swatch, name and "2 von 3 geöffnet" (or "keine Orte"). */
    function groupLabel(key, list, filter) {
        var open = countOpen(list, filter);
        var count = list.length === 0 ? "keine Orte" : open + " von " + list.length + " geöffnet";
        return '<span class="swatch ' + swatchClass(open) + '" aria-hidden="true"></span>' +
            '<span class="cat-icon cat-icon--' + key + '" aria-hidden="true"></span> ' +   // icon (2026-10-14)
            window.KATEGORIEN[key].name +
            ' <span class="place-group__count">' + count + '</span>';
    }

    /** Right column: the active category open, the other categories folded (<details>), OSM credit. */
    function placesMarkup(info, groups, total, filter) {
        var active = filter.category;
        // The heading names the moment, not a state: the lists also show closed and unknown places.
        var moment = Oeffnungszeiten.DAY_NAMES[filter.day] + ", " + Oeffnungszeiten.formatTime(filter.minutes) + " Uhr";
        var title;
        if (Filter.isNow()) {
            title = "Orte und Öffnungszeiten jetzt (" + moment + ")";
        } else {
            title = "Orte und Öffnungszeiten am " + moment;
        }
        var html = '<div class="profile__places">';
        html += '<h3 class="profile__places-title">' + title + '</h3>';

        if (total === 0) {
            // A Quadrat without any place: a friendly note instead of empty lists.
            html += '<div class="profile-empty-note">' +
                '<p>In ' + escapeHtml(info.code) + ' sind bei OpenStreetMap keine Restaurants, Cafés, ' +
                'Kulturorte oder Geschäfte eingetragen. Ein Blick lohnt sich trotzdem: ' +
                'Viele Quadrate sind Wohnblöcke, Schulen, Ämter oder Plätze.</p>' +
                '<p>Du kennst hier einen Ort? <a href="quadrate.html#vorschlagen">Ort vorschlagen</a></p>' +
                '</div>';
        } else {
            // 1. the category chosen in the filter, always open
            html += '<section class="place-group cat-' + active + '" aria-labelledby="gruppe-' + active + '">';
            html += '<h4 class="place-group__title" id="gruppe-' + active + '">' + groupLabel(active, groups[active], filter) + '</h4>';
            if (groups[active].length > 0) {
                html += listMarkup(groups[active], filter);
            } else {
                html += '<p class="place-group__empty">Keine Orte der Kategorie ' + window.KATEGORIEN[active].name +
                    ' in diesem Quadrat.</p>';
            }
            html += '</section>';
            // 2. the other categories with places, folded
            for (var i = 0; i < CATEGORY_ORDER.length; i++) {
                var key = CATEGORY_ORDER[i];
                if (key === active || groups[key].length === 0) {
                    continue;
                }
                html += '<details class="place-group place-group--folded cat-' + key + '" data-kat="' + key + '">' +
                    '<summary class="place-group__title">' + groupLabel(key, groups[key], filter) + '</summary>' +
                    listMarkup(groups[key], filter) +
                    '</details>';
            }
        }
        html += savingNoteMarkup();
        html += '<p class="profile__source">Orte und Öffnungszeiten: © <a href="https://www.openstreetmap.org/copyright">' +
            'OpenStreetMap</a>-Mitwirkende, ODbL, Stand ' + escapeHtml(germanDate(window.ORTE_META.stand)) +
            '. Angaben ohne Gewähr, Feiertage sind nicht berücksichtigt.</p>';
        return html + '</div>';
    }

    /**
     * A hint under the places: where the saved places are (merkliste.html), and for visitors who are not
     * logged in that the list is only kept until the tab is closed. Nothing if the browser blocks storage.
     */
    function savingNoteMarkup() {
        if (!Merkliste.isAvailable()) {
            return "";
        }
        if (Merkliste.isPermanent()) {
            return '<p class="profile__save-hint">Gemerkte Orte findest du in deiner <a href="merkliste.html">Merkliste</a>.</p>';
        }
        return '<p class="profile__save-hint">Gemerkte Orte findest du in der <a href="merkliste.html">Merkliste</a>. ' +
            'Ohne Konto gilt sie nur, bis du diesen Tab schließt. <a href="konto.html">Melde dich an</a>, um sie dauerhaft zu speichern.</p>';
    }

    /* ---------------- showing and hiding ---------------- */

    /** Empty state: shown before a Quadrat is chosen and after "Auswahl aufheben". */
    function renderEmpty() {
        panel.classList.add("profile--empty");
        panel.removeAttribute("aria-labelledby");
        panel.setAttribute("aria-label", "Steckbrief");
        panel.innerHTML = '<span class="block-tile block-tile--empty" aria-hidden="true">–</span>' +
            '<p>Wähle ein Quadrat auf der Karte oder in der Liste „Quadrat wählen“. ' +
            'Hier erscheinen dann sein Steckbrief und die Orte, die zur gewählten Zeit geöffnet haben.</p>';
    }

    /** Draws the panel for a code with the current filter. Folded groups that were open stay open. */
    function render(code) {
        var info = window.QUADRATE[code];
        var filter = Filter.state;
        var groups = placesOf(code);
        var total = groups.essen.length + groups.trinken.length + groups.kultur.length + groups.shoppen.length;

        var openFolds = [];
        var folds = panel.querySelectorAll("details[open]");
        for (var i = 0; i < folds.length; i++) {
            openFolds.push(folds[i].getAttribute("data-kat"));
        }

        panel.classList.remove("profile--empty");
        panel.removeAttribute("aria-label");
        panel.setAttribute("aria-labelledby", "steckbrief-titel");
        panel.innerHTML = headMarkup(info, total) +
            '<div class="profile__body">' +
            aboutMarkup(info, groups, filter) +
            placesMarkup(info, groups, total, filter) +
            '</div>';

        for (var j = 0; j < openFolds.length; j++) {
            var fold = panel.querySelector('details[data-kat="' + openFolds[j] + '"]');
            if (fold) {
                fold.open = true;
            }
        }
    }

    /** Shows the profile of a Quadrat ("G1"). Unknown codes show the empty state. */
    function show(code) {
        if (!code || !window.QUADRATE[code]) {
            clear();
            return;
        }
        var sameCode = code === currentCode;
        currentCode = code;
        if (!sameCode) {
            panel.innerHTML = "";         // a new Quadrat starts with all folds closed
            panel.scrollTop = 0;          // and at the top of the panel (it scrolls on its own over the map)
        }
        render(code);
    }

    /** Draws the open profile again (after a filter change). */
    function refresh() {
        if (currentCode) {
            render(currentCode);
        }
    }

    /** Back to the empty state. */
    function clear() {
        currentCode = null;
        renderEmpty();
    }

    /** Code of the Quadrat shown, or null. */
    function current() {
        return currentCode;
    }

    /* ---------------- saved places ---------------- */

    /**
     * Puts pins on the Quadrate with saved places and shows "gemerkte Orte" in the legend if there are any.
     * Every pin has the colour of the category of a saved place (2026-10-13); since 2026-10-14 there is one
     * pin per saved place, so two saved places in one Quadrat show two pins side by side (at most 3).
     */
    function showPins() {
        var counts = {};                          // "O7" -> { trinken: 2, essen: 1 }
        var ids = Merkliste.ids();
        for (var i = 0; i < ids.length; i++) {
            var place = placeById[ids[i]];        // saved events have other ids and are left out here
            if (place) {
                counts[place.quadrat] = counts[place.quadrat] || {};
                counts[place.quadrat][place.kat] = (counts[place.quadrat][place.kat] || 0) + 1;
            }
        }
        // "O7" -> ["essen", "trinken", "trinken"]: one pin per saved place, in the order of the categories
        // (since 2026-10-14; before, one pin in the colour of the most saved category). Karte.markieren
        // shows at most 3 of them side by side.
        var colours = {};
        var any = false;
        for (var code in counts) {
            colours[code] = [];
            for (var k = 0; k < CATEGORY_ORDER.length; k++) {
                var kat = CATEGORY_ORDER[k];
                for (var c = 0; c < (counts[code][kat] || 0); c++) {
                    colours[code].push(kat);
                }
            }
            any = true;
        }
        if (window.Karte) {
            Karte.markieren(colours);
        }
        var legendPin = document.getElementById("legende-pin");
        if (legendPin) {
            legendPin.hidden = !any;
        }
    }

    /** A "Merken" button was pressed: save or remove the place, then update the button and the pins. */
    function toggleSaved(button) {
        var saved = Merkliste.toggle(button.getAttribute("data-id"));
        button.setAttribute("aria-pressed", String(saved));   // the button stays, so the keyboard focus stays on it
        showPins();
    }

    /* ---------------- start ---------------- */

    /**
     * The page header sticks to the top of the window and is taller on phones, where the navigation wraps
     * (53 to about 140 px). Its real height goes into the CSS variable --header-offset, so the sticky close
     * button "×" (css/index.css) stops just below the header. ResizeObserver reports every change of size.
     */
    function watchHeaderHeight() {
        var header = document.querySelector(".site-header");
        if (!header || !window.ResizeObserver) {
            return;                   // css/index.css then uses the normal header height
        }
        new ResizeObserver(function () {
            document.documentElement.style.setProperty("--header-offset", header.offsetHeight + "px");
        }).observe(header);
    }

    /**
     * Prepares the panel element (the <section id="steckbrief">) and shows the empty state.
     * options: { onClose() } is called by the close button "×".
     */
    function init(element, options) {
        panel = element;
        handlers = options || {};
        for (var i = 0; i < window.ORTE.length; i++) {
            placeById[window.ORTE[i].id] = window.ORTE[i];
        }
        watchHeaderHeight();
        // One listener for all buttons in the panel (event delegation), because the content is redrawn often.
        panel.addEventListener("click", function (event) {
            var target = event.target;
            if (target.closest(".profile__close")) {
                if (handlers.onClose) {
                    handlers.onClose();
                }
            } else if (target.closest(".place__save")) {
                toggleSaved(target.closest(".place__save"));
            }
        });
        renderEmpty();
        showPins();
    }

    window.Steckbrief = {
        init: init,
        show: show,
        refresh: refresh,
        clear: clear,
        current: current,
        typeName: typeName,       // for the place search on quadrate.html (js/ortssuche.js)
        routeUrl: routeUrl,       // and the list of saved places on merkliste.html (js/merkliste-seite.js)
        routeDestination: routeDestination
    };
})();
