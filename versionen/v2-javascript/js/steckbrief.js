/*
 * steckbrief.js - the profile panel ("Steckbrief") below the map: everything about one Quadrat.
 * Offers window.Steckbrief.                                                                      [V2]
 *
 * How it fits in:
 * - js/app.js calls Steckbrief.show("G1") when a Quadrat is selected and Steckbrief.clear() when the
 *   selection ends. After every filter change it calls Steckbrief.refresh().
 * - The content comes from window.QUADRATE (text, kind, source), window.ORTE (places and hours),
 *   window.FOTOS (photo and credit) and window.Filter.state (day, time and category of the filter).
 * - Layout and classes come from css/style.css (profile, place-group, place, badge, photo), small
 *   additions from css/index.css.
 * - Interim version V2 (JavaScript, no PHP): the "Merken" buttons of the final version are left out.
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

    var panel = null;         // the <section id="steckbrief">
    var handlers = {};        // { onClose: function () } from js/app.js
    var currentCode = null;   // code of the Quadrat shown, or null

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

    /** Sorts places: open first, then unknown, then closed; inside each state by name (German order). */
    function sortPlaces(list, filter) {
        var rank = { open: 0, unknown: 1, closed: 2 };
        return list.slice().sort(function (a, b) {
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

    /** Head: tile with the code, title, short description and the close button. */
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
        return '<header class="profile__head">' +
            '<span class="block-tile block-tile--selected" aria-hidden="true">' + escapeHtml(info.code) + '</span>' +
            '<div class="profile__heading">' +
            '<h2 class="profile__title" id="steckbrief-titel">' + escapeHtml(title) + '</h2>' +
            '<p class="profile__meta">' + escapeHtml(meta) + '</p>' +
            '</div>' +
            '<button class="button button--secondary button--small profile__close" type="button">Auswahl aufheben</button>' +
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
                '<span class="profile-counts__name">' + window.KATEGORIEN[key].name + '</span> ' +
                '<span class="profile-counts__number">' + list.length + '</span>' +
                (list.length > 0 ? ' <span class="profile-counts__open">(' + open + ' geöffnet)</span>' : '') +
                '</li>';
        }
        return html + '</ul>';
    }

    /** Left column: text, source, photo and the counts. */
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
        return html + '</div>';
    }

    /** One place: name, type and address; hours of the chosen day and the badge. */
    function placeMarkup(place, filter) {
        var status = statusOf(place, filter);
        var type = TYPE_NAMES[place.typ] || TYPE_FALLBACK[place.kat] || place.typ;
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
        html += '</div>';
        html += '<div class="place__status">';
        html += '<span class="place__hours">' + escapeHtml(hours) + '</span>';
        if (carryOver !== null) {
            html += '<span class="place__note">vom Vortag bis ' + Oeffnungszeiten.formatTime(carryOver) + '</span>';
        }
        html += '<span class="badge badge--' + status + '">' + STATUS_WORDS[status] + '</span>';
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
                '<p>Du kennst hier einen Ort? <a href="vorschlagen.html">Ort vorschlagen</a></p>' +
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
        html += '<p class="profile__source">Orte und Öffnungszeiten: © <a href="https://www.openstreetmap.org/copyright">' +
            'OpenStreetMap</a>-Mitwirkende, ODbL, Stand ' + escapeHtml(germanDate(window.ORTE_META.stand)) +
            '. Angaben ohne Gewähr, Feiertage sind nicht berücksichtigt.</p>';
        return html + '</div>';
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

    /* ---------------- start ---------------- */

    /**
     * Prepares the panel element (the <section id="steckbrief">) and shows the empty state.
     * options: { onClose() } is called by the button "Auswahl aufheben".
     */
    function init(element, options) {
        panel = element;
        handlers = options || {};
        // One listener for all buttons in the panel (event delegation), because the content is redrawn often.
        panel.addEventListener("click", function (event) {
            var target = event.target;
            if (target.closest(".profile__close")) {
                if (handlers.onClose) {
                    handlers.onClose();
                }
            }
        });
        renderEmpty();
    }

    window.Steckbrief = {
        init: init,
        show: show,
        refresh: refresh,
        clear: clear,
        current: current
    };
})();
