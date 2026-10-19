/*
 * karte.js - map module of the CSS 3D variant: builds the 3D map of the Quadrate from ordinary HTML
 * elements, which css/karte.css turns in 3D, and offers window.Karte (web/ARCHITECTURE.md).      [V2]
 *
 * How it fits in:
 * - js/data/karte-daten.js (window.KARTE_DATEN, made by tools/export_karte_css3d.py) holds the geometry:
 *   stage, camera, the tilted ground plate, and per Quadrat its roofs, walls, label and growth.
 *   This file only creates the elements and writes the numbers into CSS custom properties.
 * - The page (js/app.js) only uses the interface window.Karte:
 *     Karte.init(container, { onSelect(code, byKeyboard), onHover(code | null) })  builds the map
 *     Karte.faerben(map | null, texts)  { "G2": "#D23F27", ... } colours whole buildings; null = default;
 *                                       texts { "G2": "9 geöffnet" } go into the accessible names
 *     Karte.waehlen(code | null)        selects a Quadrat (it grows and is lit from below); null = none
 *     Karte.markieren(codes)            pins on Quadrate with saved places; [] removes all pins;
 *                                       { "G2": "essen" } colours a pin like its category (2026-10-13)
 *     Karte.stimmung(name)              time-of-day mood: "tag", "aufgang", "untergang" or "nacht"
 *                                       (final version only; js/filter.js chooses it from the filter time)
 *     Karte.codes()                     array of all 146 codes
 *   Without JavaScript the page shows the static image img/karte-statisch.png instead of this map.
 * Classic script without modules, so the page also works by double-click (file://).
 */
(function () {
    "use strict";
    // Everything lives inside this function so that our variables do not collide with other scripts.
    // Only window.Karte (at the end) is visible from outside.

    // Smallest scale of the map. Below it the map frame scrolls sideways (phones), so the codes stay readable.
    var MIN_SCALE = 0.5;
    var TEXT_DARK = "#2b2d31";        // dark code text, the same as --map-text-dark in css/karte.css
    var MAX_PINS = 3;                 // at most 3 pins on one Quadrat, one per saved place (2026-10-14)
    var PIN_GAP = 20;                 // distance between two pins side by side, in pixels of the map plane

    var data = null;                  // window.KARTE_DATEN
    var frame = null;                 // div.map-scroll: may scroll sideways on narrow screens
    var sizer = null;                 // div.map-sizer: has the size of the scaled stage
    var stage = null;                 // div.map-stage: the 3D stage with the perspective
    var plane = null;                 // div.map-plane: the tilted ground plate
    var pools = null;                 // div.map-pools: the glows on the ground, under all buildings
    var elementsByCode = {};          // code -> div.map-block
    var poolsByCode = {};             // code -> div.map-pool (glow under the selected Quadrat)
    var entriesByCode = {};           // code -> entry of KARTE_DATEN.quadrate
    var selected = null;              // code of the selected Quadrat or null
    var handlers = {};                // functions of the page: onSelect, onHover
    var countTexts = {};              // code -> text such as "9 geöffnet" from Karte.faerben()
    var pinned = {};                  // code -> true for Quadrate with a pin
    var pinCategory = {};             // code -> list of categories of its pins (null = red), 2026-10-13/14
    var resizeObserver = null;        // rescales the map when the frame changes its width
    var walls = [];                   // every wall: { element, angle }, for the light of the moods
    var mood = null;                  // current time-of-day mood, e.g. "tag"
    var moodsGlide = false;           // false at the start: the first mood appears at once, later ones glide
    var moodTimer = null;             // ends the class map-root--wechsel after a change of mood
    var layers = [];                  // every layer that fades with a mood: { element, mood }, see tageszeit()
    var suns = [];                    // the three suns, moved by tageszeit()
    var lastMinutes = null;           // the minute of the last call of tageszeit(), to notice big jumps

    // How long a change of mood takes, a little more than --mood-duration (1.4 s since 2026-10-14) in css/karte.css.
    var MOOD_CHANGE_MS = 1500;

    // Direction towards the sun (or the moon) per mood, as [east, south] on the map: on the map east is on the
    // right and south at the bottom. Sunrise: from the east; sunset: from the west; day: from the south-west
    // (like the reference images); night: the moon in the west. maxShade = how dark a wall turned away gets.
    var LIGHT = {
        tag: { direction: [-0.55, 0.83], maxShade: 0.3 },
        aufgang: { direction: [1, 0.25], maxShade: 0.45 },
        untergang: { direction: [-1, 0.25], maxShade: 0.45 },
        nacht: { direction: [-0.8, 0.6], maxShade: 0.4 }
    };

    // Colours of the city per mood (the same values as in css/karte.css). Since 2026-10-14 tageszeit() mixes them
    // minute by minute, so the city does not jump from one mood to the next. sun = colour of the sunlight on the
    // walls (r, g, b), strength = how strongly sunlit walls take it.
    var PALETTES = {
        tag: { ground: "#e6e4df", roof: "#fbfbf9", wall: "#dad7d0", edge: "#c8c4bc", sun: [255, 248, 235], strength: 0.15 },
        aufgang: { ground: "#e4dde3", roof: "#f6f1f2", wall: "#d9ccd3", edge: "#c8bcc6", sun: [255, 176, 102], strength: 0.55 },
        untergang: { ground: "#ead7cf", roof: "#f5e9e2", wall: "#d8c0b4", edge: "#ccb2a6", sun: [255, 140, 80], strength: 0.6 },
        nacht: { ground: "#7d7466", roof: "#33353c", wall: "#575a63", edge: "#8c8e95", sun: [190, 205, 240], strength: 0.12 }
    };

    // The day as key frames [minute, mood]: at that minute the mood is complete; between two key frames the two
    // moods are mixed. Every change takes 2 hours, so the city changes at the same speed in the morning and in the
    // evening (4:30 night -> 6:30 sunrise -> 8:30 day -> 17:30 day -> 19:30 sunset -> 21:30 night).
    var KEYFRAMES = [[0, "nacht"], [270, "nacht"], [390, "aufgang"], [510, "tag"], [1050, "tag"],
        [1170, "untergang"], [1290, "nacht"], [1440, "nacht"]];
    var SUN_RISE = 360;               // the sun's way over the sky: from 6:00 on the right (east) ...
    var SUN_SET = 1290;               // ... to 21:30 on the left (west), highest at noon in between

    /* ---------------- small helpers ---------------- */

    /** Turns a number into a CSS pixel value: 12 -> "12px". */
    function px(value) {
        return value + "px";
    }

    /** Creates an element (tag, e.g. "div") with a CSS class and appends it to the parent element. */
    function createChild(tag, className, parent) {
        var element = document.createElement(tag);
        element.className = className;
        parent.appendChild(element);
        return element;
    }

    /**
     * Creates one layer per mood (div.mood-layer.mood-layer--tag, --aufgang, ...) in the parent element.
     * css/karte.css gives each layer its colour gradient; tageszeit() sets how visible each one is.
     * group: a name for layers that cover each other completely (sky, ground), see tageszeit(); null for the
     * light layers, which are partly transparent anyway.
     */
    function createMoodLayers(parent, group) {
        for (var name in LIGHT) {
            layers.push({
                element: createChild("div", "mood-layer mood-layer--" + name, parent),
                mood: name,
                group: group
            });
        }
    }

    /** Places an element on the plate: box = [left, top, width, height] in plate pixels. */
    function setBox(element, box) {
        element.style.left = px(box[0]);
        element.style.top = px(box[1]);
        element.style.width = px(box[2]);
        element.style.height = px(box[3]);
    }

    /**
     * Stores a footprint as a CSS custom property, e.g. --outline-outer: polygon(1px 2px, ...).
     * css/karte.css uses it for clip-path, so the edge and the roof surface get the shape of the block.
     * points is a list of "x y" points relative to the element.
     */
    function setOutline(element, name, points) {
        element.style.setProperty(name, "polygon(" + points + ")");
    }

    /**
     * Accessible name of a Quadrat: "Quadrat O3"; open squares add their
     * name ("Quadrat G1, Marktplatz"), the filter adds the number of open places ("Quadrat G2, 9 geöffnet")
     * and a Quadrat with a pin adds ", gemerkte Orte".
     */
    function labelText(block) {
        var text = "Quadrat " + block.code;
        if (block.name) {
            text += ", " + block.name;
        }
        if (countTexts[block.code]) {
            text += ", " + countTexts[block.code];
        }
        if (pinned[block.code] === true) {
            text += ", gemerkte Orte";
        }
        return text;
    }

    /** Writes the accessible name of a Quadrat onto its element (see labelText). */
    function updateLabel(code) {
        elementsByCode[code].setAttribute("aria-label", labelText(entriesByCode[code]));
    }

    /* ---------------- building the map ---------------- */

    /**
     * Builds one wall. wall = [x, y, length, angle, darkening]: (x, y) is the corner where the wall starts.
     * The wall's bottom edge must lie on that corner, so the element starts one wall height above it.
     */
    function buildWall(parent, wall, height) {
        var element = createChild("div", "map-wall", parent);
        element.style.left = px(wall[0]);
        element.style.top = px(wall[1] - height);
        element.style.width = px(wall[2]);
        element.style.setProperty("--angle", wall[3] + "deg");
        element.style.setProperty("--shade", wall[4]);
        // every wall starts its lit windows (night, css/karte.css) at its own offset of 0 to 16 px
        element.style.setProperty("--win-x", px((walls.length * 7) % 17));
        walls.push({ element: element, angle: wall[3] });
    }

    /** Builds one building part of a Quadrat: walls, roof with edge and the code on the roof. */
    function buildPart(blockElement, part, code) {
        var partElement = createChild("div", "map-part", blockElement);
        // when selected, the part is scaled around this point (see .is-selected .map-part in karte.css)
        partElement.style.transformOrigin = px(part.zentrum[0]) + " " + px(part.zentrum[1]);
        partElement.style.setProperty("--sx", part.skala[0]);
        partElement.style.setProperty("--sy", part.skala[1]);

        for (var i = 0; i < part.waende.length; i++) {
            buildWall(partElement, part.waende[i], data.hoehen.block);
        }

        var roof = createChild("div", "map-roof", partElement);
        setBox(roof, part.box);
        setOutline(roof, "--outline-outer", part.aussen);
        setOutline(roof, "--outline-inner", part.innen);
        setOutline(roof, "--outline-selected", part.innenAuswahl);
        createChild("div", "map-roof-edge", roof);
        createChild("div", "map-roof-surface", roof);

        var label = createChild("span", "map-code", roof);
        label.textContent = code;
        label.style.left = px(part.schrift[0] - part.box[0]);
        label.style.top = px(part.schrift[1] - part.box[1]);
        label.style.fontSize = px(part.schrift[2]);
        label.style.setProperty("--label-matrix", "matrix(" + part.matrix.join(", ") + ", 0, 0)");
    }

    /** Builds an open square (flat): outline for hover and selection, and an upright sign with code and name. */
    function buildSquare(blockElement, block) {
        var square = createChild("div", "map-square", blockElement);
        setBox(square, block.platz.box);
        setOutline(square, "--outline-outer", block.platz.rand);      // a ring: only the edge of the square
        setOutline(square, "--outline-inner", block.platz.innen);
        createChild("div", "map-square-edge", square);
        createChild("div", "map-square-inner", square);

        // the sign stands on the ground at (x, y) and faces the camera (see .map-sign in karte.css)
        var sign = createChild("div", "map-sign", blockElement);
        sign.style.left = px(block.platz.schrift[0]);
        sign.style.top = px(block.platz.schrift[1]);
        sign.style.setProperty("--sign-scale", block.platz.massstab);
        var text = createChild("span", "map-sign-text", sign);
        text.style.setProperty("--halo", block.platz.halo);
        createChild("span", "map-sign-code", text).textContent = block.code;
        if (block.name) {
            var name = createChild("span", "map-sign-name", text);
            name.textContent = block.name;
            name.style.fontSize = px(block.platz.schrift[3]);
        }
    }

    /** Builds one Quadrat with everything that belongs to it and makes it usable with mouse and keyboard. */
    function buildBlock(block) {
        var blockElement = createChild("div", "map-block", plane);
        blockElement.setAttribute("data-code", block.code);
        blockElement.setAttribute("tabindex", "0");
        blockElement.setAttribute("role", "button");

        // The glow lies in the shared ground layer (div.map-pools), not inside the block: as a flat layer
        // between the buildings it made Safari draw A4 behind B4 and B5 when A4 was selected.
        var lightPool = createChild("div", "map-pool", pools);
        setBox(lightPool, block.licht);
        poolsByCode[block.code] = lightPool;

        if (block.art === "platz") {
            blockElement.classList.add("map-block--open");
            buildSquare(blockElement, block);
        } else {
            for (var i = 0; i < block.teile.length; i++) {
                buildPart(blockElement, block.teile[i], block.code);
            }
        }

        blockElement.addEventListener("click", function () {
            choose(block.code, false);
        });
        blockElement.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();           // the space bar must not scroll the page
                choose(block.code, true);
            }
        });
        // The div.map-block itself has no size (its parts are placed absolutely), so the browser would
        // scroll to the corner of the plate instead of the block. Scroll its roof (or sign) into view.
        blockElement.addEventListener("focus", function () {
            var target = blockElement.querySelector(".map-roof, .map-sign-text");
            if (target) {
                target.scrollIntoView({ block: "nearest", inline: "nearest" });
            }
        });
        blockElement.addEventListener("mouseenter", function () {
            if (handlers.onHover) {
                handlers.onHover(block.code);
            }
        });
        blockElement.addEventListener("mouseleave", function () {
            if (handlers.onHover) {
                handlers.onHover(null);
            }
        });
        return blockElement;
    }

    /** Builds the Schloss: camera-facing walls and the roof picture with the courtyards (not clickable). */
    function buildPalace() {
        var palace = createChild("div", "map-palace", plane);
        palace.setAttribute("aria-hidden", "true");
        for (var i = 0; i < data.schloss.waende.length; i++) {
            buildWall(palace, data.schloss.waende[i], data.hoehen.schloss);
        }
        setBox(createChild("div", "map-palace-roof", palace), data.schloss.box);
    }

    /**
     * Places the upright trees (only the trees that stand close in front of a building; all others are painted
     * into the ground picture) and the Wasserturm.
     */
    function buildTreesAndLandmarks() {
        for (var i = 0; i < data.baeume.length; i++) {
            var tree = createChild("div", "map-tree", plane);
            tree.style.left = px(data.baeume[i][0]);
            tree.style.top = px(data.baeume[i][1]);
        }
        for (var j = 0; j < data.wahrzeichen.length; j++) {
            var landmark = data.wahrzeichen[j];
            var image = createChild("img", "map-landmark", plane);
            image.src = landmark.bild;
            image.alt = landmark.alt;
            setBox(image, landmark.box);
        }
    }

    /**
     * Builds the sky above the city: a light layer over the whole map, the sky band at the top with the stars,
     * the sun and the moon in it. css/karte.css shows or hides them per mood.
     */
    function buildSky() {
        // Sky and light lie in the box around the stage (map-sizer), not in the stage itself (2026-10-14): in the
        // stage the browser sorted them in depth together with the tilted plate, and where the plate came closer,
        // they stopped at a hard edge (a "rectangle" in the picture). The sizer is flat, so nothing cuts them.
        // The sky band is scaled like the stage (css/karte.css), so the sun keeps its place in stage pixels.
        var sky = createChild("div", "map-sky", sizer);
        sky.setAttribute("aria-hidden", "true");
        createMoodLayers(sky, "sky");               // first, so stars, sun and moon lie on top of them
        layers.push({ element: createChild("div", "map-stars", sky), mood: "nacht" });
        // three suns in the same place (moved by tageszeit()): yellow-white by day, orange in the
        // morning, red in the evening; their opacity follows the weights, so the colour of the sun changes softly
        // while it wanders over the sky (since 2026-10-14; before, two suns with fixed places)
        var sunMoods = ["tag", "aufgang", "untergang"];
        for (var i = 0; i < sunMoods.length; i++) {
            var sun = createChild("div", "map-sun map-sun--" + sunMoods[i], sky);
            layers.push({ element: sun, mood: sunMoods[i] });
            suns.push(sun);
        }
        layers.push({ element: createChild("div", "map-moon", sky), mood: "nacht" });
        var light = createChild("div", "map-light", sizer);   // over the whole map, also over the sky
        light.setAttribute("aria-hidden", "true");
        createMoodLayers(light, null);
    }

    /** Writes the numbers of the stage and the plate into CSS custom properties (used in css/karte.css). */
    function setDimensions() {
        var stageData = data.buehne;
        var planeData = data.ebene;
        var values = {
            "--stage-width": px(stageData.breite),
            "--stage-height": px(stageData.hoehe),
            "--perspective": px(stageData.perspektive),
            "--origin-x": px(stageData.ursprung[0]),
            "--origin-y": px(stageData.ursprung[1]),
            "--plane-left": px(planeData.links),
            "--plane-top": px(planeData.oben),
            "--plane-width": px(planeData.breite),
            "--plane-height": px(planeData.hoehe),
            "--pivot-x": px(planeData.drehpunkt[0]),
            "--pivot-y": px(planeData.drehpunkt[1]),
            "--tilt": planeData.kippung + "deg",
            "--untilt": (-planeData.kippung) + "deg",
            "--stretch": planeData.streckung,
            "--block-height": px(data.hoehen.block),
            "--palace-height": px(data.hoehen.schloss),
            "--palace-wall": data.schloss.wand,
            "--tree-width": px(data.baum.breite),
            "--tree-height": px(data.baum.hoehe)
        };
        for (var name in values) {
            sizer.style.setProperty(name, values[name]);   // the stage and the sky inherit them (2026-10-14)
        }
    }

    /** Scales the whole stage to the width of the frame (but not below MIN_SCALE). */
    function fitToFrame() {
        var width = frame.clientWidth;
        if (width === 0) {
            return;                                 // hidden: keep the last size
        }
        var scale = Math.max(width / data.buehne.breite, MIN_SCALE);
        sizer.style.setProperty("--scale", scale);      // for the stage and the sky band
        sizer.style.width = px(data.buehne.breite * scale);
        sizer.style.height = px(data.buehne.hoehe * scale);
    }

    /** A Quadrat was clicked (byKeyboard false) or chosen with Enter or Space (true): select it and tell the page. */
    function choose(code, byKeyboard) {
        waehlen(code);
        if (handlers.onSelect) {
            handlers.onSelect(code, byKeyboard);
        }
    }

    /* ---------------- colours ---------------- */

    /** Relative luminance of a colour like "#F3C2B5" (WCAG 2 formula): 0 = black, 1 = white. */
    function luminance(hex) {
        var channels = [];
        for (var i = 0; i < 3; i++) {
            var c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
            channels.push(c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
        }
        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    }

    /**
     * True if dark text is easier to read on this roof colour than white.
     * The text colour with the higher contrast ratio wins.
     */
    function needsDarkText(hex) {
        var l = luminance(hex);
        var contrastWhite = 1.05 / (l + 0.05);
        var contrastDark = (l + 0.05) / (luminance(TEXT_DARK) + 0.05);
        return contrastDark > contrastWhite;
    }

    /* ---------------- public interface ---------------- */

    /** Builds the map inside the container. options: { onSelect(code, byKeyboard), onHover(code or null) }. */
    function init(container, options) {
        data = window.KARTE_DATEN;
        if (!container || !data) {
            return;
        }
        handlers = options || {};
        elementsByCode = {};
        poolsByCode = {};
        entriesByCode = {};
        selected = null;
        walls = [];
        mood = null;
        moodsGlide = false;
        container.textContent = "";                 // remove whatever was there before
        container.classList.add("map-root");

        frame = createChild("div", "map-scroll", container);
        frame.setAttribute("role", "group");
        frame.setAttribute("aria-label", "3D-Karte der Mannheimer Quadrate");
        sizer = createChild("div", "map-sizer", frame);
        stage = createChild("div", "map-stage", sizer);
        plane = createChild("div", "map-plane", stage);
        // the ground pictures of the four moods on top of each other (2026-10-14): their opacity follows the weights of
        // tageszeit(), so the streets turn from day to night without a jump (before: one picture, changed at once)
        for (var groundMood in LIGHT) {
            layers.push({
                element: createChild("div", "map-ground-layer map-ground-layer--" + groundMood, plane),
                mood: groundMood,
                group: "ground"
            });
        }
        pools = createChild("div", "map-pools", plane);   // first child: painted with the ground, under everything
        setDimensions();

        buildPalace();
        for (var i = 0; i < data.quadrate.length; i++) {
            var block = data.quadrate[i];
            elementsByCode[block.code] = buildBlock(block);
            entriesByCode[block.code] = block;
            updateLabel(block.code);
        }
        buildTreesAndLandmarks();
        buildSky();
        stimmung("tag");
        // js/filter.js sets the mood of the real time right after init(); that one should appear at once.
        // setTimeout(..., 0) runs the function after all scripts of the start have finished.
        window.setTimeout(function () {
            moodsGlide = true;
        }, 0);

        fitToFrame();
        if (resizeObserver) {
            resizeObserver.disconnect();            // init() called again: stop watching the old frame
        }
        if (window.ResizeObserver) {
            resizeObserver = new ResizeObserver(fitToFrame);
            resizeObserver.observe(frame);
        } else {
            window.addEventListener("resize", fitToFrame);
        }
        // on narrow screens start with the city centre (Kurpfalzstrasse) in the middle of the frame
        frame.scrollLeft = (frame.scrollWidth - frame.clientWidth) / 2;
    }

    /**
     * Colours whole buildings (roof and walls). Quadrate missing in the map get the default colours back.
     * Light colours (e.g. level 1 of every category) get the class is-tinted-light: dark code on the roof.
     * colours: e.g. { "G2": "#D23F27" }, or null for all default.
     * texts (optional): e.g. { "G2": "9 geöffnet" }, added to the accessible name of each Quadrat.
     */
    function faerben(colours, texts) {
        countTexts = texts || {};
        for (var code in elementsByCode) {
            var element = elementsByCode[code];
            var colour = colours ? colours[code] : null;
            if (colour) {
                element.style.setProperty("--tint", colour);
                element.classList.add("is-tinted");
                element.classList.toggle("is-tinted-light", needsDarkText(colour));
            } else {
                element.style.removeProperty("--tint");
                element.classList.remove("is-tinted", "is-tinted-light");
            }
            updateLabel(code);
        }
    }

    /**
     * Selects a Quadrat: it grows (CSS transition), the previous one shrinks back at the same time.
     * code: e.g. "O3"; null or an unknown code removes the selection. The chosen Quadrat gets
     * aria-current="true" (announced as "aktuell"); pressing it again does not unselect it.
     */
    function waehlen(code) {
        if (!elementsByCode[code]) {
            code = null;
        }
        if (selected === code) {
            return;
        }
        if (selected) {
            elementsByCode[selected].classList.remove("is-selected");
            elementsByCode[selected].removeAttribute("aria-current");
            poolsByCode[selected].classList.remove("is-lit");
        }
        selected = code;
        if (code) {
            elementsByCode[code].classList.add("is-selected");
            elementsByCode[code].setAttribute("aria-current", "true");
            poolsByCode[code].classList.add("is-lit");
        }
    }

    /**
     * Puts pins on the Quadrate in codes and removes all other pins. codes is a list (["G2", "O7"]: one red
     * pin each, as before), or, since 2026-10-13, an object { "G2": "essen", "O7": "trinken" }: then each pin
     * gets the colour of its category (classes cat-essen ... from css/style.css, see css/karte.css).
     * Since 2026-10-14 the value may also be a list of categories, one per saved place:
     * { "O7": ["trinken", "essen"] } puts two pins side by side on O7, each in its colour (at most MAX_PINS).
     */
    function markieren(codes) {
        var colours = {};                           // code -> list of categories (null = red)
        if (Array.isArray(codes)) {
            for (var i = 0; i < codes.length; i++) {
                colours[codes[i]] = [null];
            }
        } else if (codes) {
            for (var key0 in codes) {
                colours[key0] = Array.isArray(codes[key0]) ? codes[key0] : [codes[key0]];
            }
        }
        pinned = {};
        pinCategory = {};
        for (var key in colours) {
            if (elementsByCode[key]) {
                pinned[key] = true;
                pinCategory[key] = colours[key].slice(0, MAX_PINS);
            }
        }
        if (!plane) {
            return;                                 // map not built yet
        }
        var oldPins = plane.querySelectorAll(".map-pin");
        for (var j = 0; j < oldPins.length; j++) {
            oldPins[j].remove();
        }
        for (var code in pinned) {
            var anchor = entriesByCode[code].pin;
            var list = pinCategory[code];
            for (var p = 0; p < list.length; p++) {
                var pin = createChild("span", "map-pin" + (list[p] ? " cat-" + list[p] : ""), elementsByCode[code]);
                // several pins stand side by side, PIN_GAP apart, around the middle of the Quadrat
                var shift = (p - (list.length - 1) / 2) * PIN_GAP;
                pin.style.left = px(anchor[0] - 12 + shift);   // the tip of the 24 x 23 px pin is its bottom middle
                pin.style.top = px(anchor[1] - 23);
                if (anchor.length > 2) {
                    pin.style.setProperty("--pin-z", px(anchor[2]));   // open square: on top of its sign
                }
            }
        }
        for (var c in elementsByCode) {
            updateLabel(c);
        }
    }

    /**
     * For a moment every part of the map takes --mood-duration for its transitions (class map-root--wechsel,
     * css/karte.css), so the new colours, shadows, windows and sky glide in instead of jumping.
     */
    function glideOnce() {
        var root = stage.closest(".map-root");
        root.classList.add("map-root--wechsel");
        window.clearTimeout(moodTimer);             // a new change while the last one runs: start counting again
        moodTimer = window.setTimeout(function () {
            root.classList.remove("map-root--wechsel");
        }, MOOD_CHANGE_MS);
    }

    /**
     * Sets the time-of-day mood: "tag", "aufgang" (sunrise), "untergang" (sunset) or "nacht".
     * The colours come from css/karte.css (class mood-...). Here every wall gets two numbers:
     *   --sun    how much it faces the sun or the moon, from 0 (not at all) to 1 (straight at it)
     *   --shade  how dark it is: walls turned away from the light are darker.
     * A wall's outside points in the direction (-sin(angle), cos(angle)) on the map (east, south); the scalar
     * product with the direction of the light says how much the two point the same way.
     */
    function stimmung(name, quiet) {
        if (!LIGHT[name] || !stage) {
            return;
        }
        if (name === mood) {
            return;                                 // nothing changes: keep the walls as they are
        }
        var root = stage.closest(".map-root");
        if (moodsGlide && !quiet) {
            glideOnce();
        }
        if (mood) {
            root.classList.remove("mood-" + mood);
        }
        mood = name;
        root.classList.add("mood-" + name);
        if (!quiet) {
            shadeWalls(LIGHT[name].direction, LIGHT[name].maxShade);
        }
    }

    /**
     * Light and shade of every wall for a direction of the light [east, south] and the darkest shade (since
     * 2026-10-14 its own function, so tageszeit() can give it a mixed direction).
     */
    function shadeWalls(direction, maxShade) {
        var length = Math.sqrt(direction[0] * direction[0] + direction[1] * direction[1]);
        var towardsX = direction[0] / length;
        var towardsY = direction[1] / length;
        for (var i = 0; i < walls.length; i++) {
            var radians = walls[i].angle * Math.PI / 180;
            var facing = -Math.sin(radians) * towardsX + Math.cos(radians) * towardsY;
            if (facing < 0) {
                facing = 0;                         // turned away from the light
            }
            var shade = (1 - facing) * maxShade;
            walls[i].element.style.setProperty("--sun", facing.toFixed(2));
            walls[i].element.style.setProperty("--shade", shade.toFixed(2));
        }
    }

    /** All 146 codes in the order A1 ... U6 (including M3a and M4a); also works before init(). */
    function codes() {
        var source = data || window.KARTE_DATEN;
        var list = [];
        if (!source) {
            return list;
        }
        for (var i = 0; i < source.quadrate.length; i++) {
            list.push(source.quadrate[i].code);
        }
        return list;
    }

    /* ---------------- time of day without steps (added 2026-10-14) ---------------- */

    var written = {};                 // the values tageszeit() wrote last: name -> text

    /**
     * Writes one CSS custom property onto the map, but only if its value changed (2026-10-14). Every change of an
     * inherited property makes the browser check all ~1500 parts of the map again; by day nothing changes for
     * hours, so most steps of the time lapse now cost almost nothing. The values are rounded for the same reason.
     */
    function setVariable(name, value) {
        if (written[name] !== value) {
            written[name] = value;
            stage.closest(".map-root").style.setProperty(name, value);
        }
    }

    /**
     * How much of each mood there is at a minute of the day: { tag: 0.25, untergang: 0.75, aufgang: 0, nacht: 0 }.
     * Finds the two key frames around the minute and mixes them in a straight line (linear): every quarter of an
     * hour changes the picture by the same amount, so the time lapse looks evenly fast (since 2026-10-14; a curve
     * that starts and ends softly made the middle of each change look like a jump).
     */
    function weightsAt(minutes) {
        var weights = { tag: 0, aufgang: 0, untergang: 0, nacht: 0 };
        for (var i = 0; i < KEYFRAMES.length - 1; i++) {
            var from = KEYFRAMES[i];
            var to = KEYFRAMES[i + 1];
            if (minutes >= from[0] && minutes <= to[0]) {
                var t = (minutes - from[0]) / (to[0] - from[0]);
                weights[from[1]] += 1 - t;
                weights[to[1]] += t;
                return weights;
            }
        }
        weights.nacht = 1;
        return weights;
    }

    /** "#33353c" -> [51, 53, 60] */
    function hexToRgb(hex) {
        return [parseInt(hex.substr(1, 2), 16), parseInt(hex.substr(3, 2), 16), parseInt(hex.substr(5, 2), 16)];
    }

    /** Mixes one colour of the four palettes by the weights: returns [r, g, b]. key: "roof", "wall" ... or "sun". */
    function mixColour(key, weights) {
        var result = [0, 0, 0];
        for (var name in PALETTES) {
            var colour = key === "sun" ? PALETTES[name].sun : hexToRgb(PALETTES[name][key]);
            for (var c = 0; c < 3; c++) {
                result[c] += colour[c] * weights[name];
            }
        }
        return [Math.round(result[0]), Math.round(result[1]), Math.round(result[2])];
    }

    /**
     * Sets the opacity of a layer, but only if it changed. The layer glides to it by itself (transition: opacity
     * in css/karte.css); the graphics card can do that alone, without the browser checking the city again.
     */
    function setOpacity(element, value) {
        var text = value.toFixed(3);
        if (element.style.opacity !== text) {
            element.style.opacity = text;
        }
    }

    /**
     * Sets the look of the map for a time of day (minutes 0 ... 1440), without steps (added 2026-10-14).
     * js/filter.js calls it on every change of the time, also during the time lapse (every 15 minutes).
     * Two kinds of change, because they cost very different amounts (measured 2026-10-14):
     * - The big pictures fade: sky, light, the ground pictures, the three suns, moon and stars. Each is one layer
     *   whose opacity is its weight (layers, setOpacity()); the sun moves with transform. Opacity and transform
     *   glide on the graphics card, so they stay smooth, like a video.
     * - The city itself (about 1500 parts) gets its mixed colours as CSS custom properties on the map:
     *     --map-ground, --map-roof, --map-wall, --map-roof-edge   the mixed colours of the city,
     *     --map-roof-text   dark on light roofs, light on dark roofs (a mixed grey would be hard to read),
     *     --w-nacht   the weight of the night (trees, floodlights), --w-lights   the lit windows.
     *   Every change makes the browser check all parts again (about 0.1 s), so these colours do not glide but
     *   change in small steps; only for a big jump of the time (more than 2 hours) they glide once (wechsel).
     * The walls' light and shade follow the mixed direction of the light.
     */
    function tageszeit(minutes) {
        if (!stage) {
            return;
        }
        var weights = weightsAt(minutes);
        if (moodsGlide && lastMinutes !== null && Math.abs(minutes - lastMinutes) > 120) {
            glideOnce();                            // a big jump, e.g. from noon to night: glide once
        }
        lastMinutes = minutes;

        // 1. the layers: each as visible as its mood is strong. Sky and ground pictures are opaque and lie on top
        //    of each other; there a layer gets its weight divided by the weights of itself and the layers below it
        //    (since 2026-10-14). Example at 20:30, half sunset, half night: the sunset picture gets 0.5 / 0.5 = 1,
        //    the night picture on top 0.5 / 1 = 0.5, together exactly half and half. With the plain weights
        //    (0.5 and 0.5) the plate came out a little different from the ground colour around it, and its edge
        //    showed as a rectangle.
        var sums = {};                              // group -> sum of the weights of the layers so far
        for (var i = 0; i < layers.length; i++) {
            var weight = weights[layers[i].mood];
            var group = layers[i].group;
            if (group) {
                sums[group] = (sums[group] || 0) + weight;
                weight = sums[group] > 0 ? weight / sums[group] : 0;
            }
            setOpacity(layers[i].element, weight);
        }
        // the sun: share of its way over the sky (0 = rising in the east, 1 = setting in the west); x from 92 % of
        // the stage width on the right to 8 % on the left, y highest at noon
        var way = Math.max(0, Math.min(1, (minutes - SUN_RISE) / (SUN_SET - SUN_RISE)));
        var sunX = data.buehne.breite * (0.92 - 0.84 * way);
        var sunY = 70 - 75 * Math.sin(Math.PI * way);
        var place = "translate(" + sunX.toFixed(0) + "px, " + sunY.toFixed(0) + "px) translateX(-50%)";
        for (var s = 0; s < suns.length; s++) {
            if (suns[s].style.transform !== place) {
                suns[s].style.transform = place;
            }
        }

        // 2. the colours of the city
        var keys = { ground: "--map-ground", roof: "--map-roof", wall: "--map-wall", edge: "--map-roof-edge" };
        for (var key in keys) {
            setVariable(keys[key], "rgb(" + mixColour(key, weights).join(", ") + ")");
        }
        // light or dark text: by the brightness of the mixed roof colour (0 ... 255)
        var roof = mixColour("roof", weights);
        var brightness = 0.299 * roof[0] + 0.587 * roof[1] + 0.114 * roof[2];
        setVariable("--map-roof-text", brightness > 140 ? "#3a3d43" : "#eceae4");
        setVariable("--sun-rgb", mixColour("sun", weights).join(", "));
        var strength = 0;
        for (var name in weights) {
            strength += PALETTES[name].strength * weights[name];
        }
        setVariable("--sun-strength", strength.toFixed(2));
        setVariable("--w-nacht", weights.nacht.toFixed(2));
        setVariable("--w-lights", Math.min(1, weights.nacht + 0.5 * weights.untergang).toFixed(2));

        // the class of the strongest mood (for the few rules that still need one, e.g. the names of the squares)
        var strongest = "tag";
        for (var candidate in weights) {
            if (weights[candidate] > weights[strongest]) {
                strongest = candidate;
            }
        }
        stimmung(strongest, true);

        // light and shade of the walls: the directions of the moods mixed by their weights, so the light moves
        // over to the other side softly (before 2026-10-14 it jumped when the strongest mood changed)
        var direction = [0, 0];
        var maxShade = 0;
        for (var lightMood in weights) {
            direction[0] += LIGHT[lightMood].direction[0] * weights[lightMood];
            direction[1] += LIGHT[lightMood].direction[1] * weights[lightMood];
            maxShade += LIGHT[lightMood].maxShade * weights[lightMood];
        }
        // rounded to one decimal: the walls (368 of them, the most expensive part) change only every few steps
        var wallKey = direction[0].toFixed(1) + "," + direction[1].toFixed(1) + "," + maxShade.toFixed(2);
        if (wallKey !== written.walls) {
            written.walls = wallKey;
            shadeWalls(direction, maxShade);
        }
    }

    window.Karte = {
        init: init,
        faerben: faerben,
        waehlen: waehlen,
        markieren: markieren,
        stimmung: stimmung,
        tageszeit: tageszeit,
        codes: codes
    };
})();
