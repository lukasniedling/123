/*
 * karte.js - map module of the CSS 3D variant: builds the 3D map of the Quadrate from ordinary HTML
 * elements, which css/karte.css turns in 3D, and offers window.Karte (web/ARCHITECTURE.md).      [V2]
 *
 * How it fits in:
 * - js/data/karte-daten.js (window.KARTE_DATEN, made by tools/export_karte_css3d.py) holds the geometry:
 *   stage, camera, the tilted ground plate, and per Quadrat its roofs, walls, label and growth.
 *   This file only creates the elements and writes the numbers into CSS custom properties.
 * - The page (js/app.js or the test page karte-test.html) only uses the interface window.Karte:
 *     Karte.init(container, { onSelect(code, byKeyboard), onHover(code | null) })  builds the map
 *     Karte.faerben(map | null, texts)  { "G2": "#D23F27", ... } colours whole buildings; null = default;
 *                                       texts { "G2": "9 geöffnet" } go into the accessible names
 *     Karte.waehlen(code | null)        selects a Quadrat (it grows and is lit from below); null = none
 *     Karte.markieren(codes)            [V3] pins on Quadrate with saved places; [] removes all pins
 *     Karte.codes()                     array of all 146 codes
 *   The SVG variant implements the same interface with the same words, so the rest of the site works
 *   with both. Version 1 shows the static image img/karte-statisch.png instead of this map.
 * Classic script without modules, so the page also works by double-click (file://).
 */
(function () {
    "use strict";
    // Everything lives inside this function so that our variables do not collide with other scripts.
    // Only window.Karte (at the end) is visible from outside.

    // Smallest scale of the map. Below it the map frame scrolls sideways (phones), so the codes stay readable.
    var MIN_SCALE = 0.5;
    var TEXT_DARK = "#2b2d31";        // dark code text, the same as --map-text-dark in css/karte.css

    var data = null;                  // window.KARTE_DATEN
    var frame = null;                 // div.map-scroll: may scroll sideways on narrow screens
    var sizer = null;                 // div.map-sizer: has the size of the scaled stage
    var stage = null;                 // div.map-stage: the 3D stage with the perspective
    var plane = null;                 // div.map-plane: the tilted ground plate
    var elementsByCode = {};          // code -> div.map-block
    var entriesByCode = {};           // code -> entry of KARTE_DATEN.quadrate
    var selected = null;              // code of the selected Quadrat or null
    var handlers = {};                // functions of the page: onSelect, onHover
    var countTexts = {};              // code -> text such as "9 geöffnet" from Karte.faerben()
    var pinned = {};                  // [V3] code -> true for Quadrate with a pin
    var resizeObserver = null;        // rescales the map when the frame changes its width

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
     * Accessible name of a Quadrat, worded like in the SVG variant: "Quadrat O3"; open squares add their
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
            text += ", gemerkte Orte";                    // [V3]
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

        var lightPool = createChild("div", "map-pool", blockElement);
        setBox(lightPool, block.licht);

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
            stage.style.setProperty(name, values[name]);
        }
    }

    /** Scales the whole stage to the width of the frame (but not below MIN_SCALE). */
    function fitToFrame() {
        var width = frame.clientWidth;
        if (width === 0) {
            return;                                 // hidden: keep the last size
        }
        var scale = Math.max(width / data.buehne.breite, MIN_SCALE);
        stage.style.setProperty("--scale", scale);
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
     * Same rule as the SVG variant: the text colour with the higher contrast ratio wins.
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
        entriesByCode = {};
        selected = null;
        container.textContent = "";                 // remove whatever was there before
        container.classList.add("map-root");

        frame = createChild("div", "map-scroll", container);
        frame.setAttribute("role", "group");
        frame.setAttribute("aria-label", "3D-Karte der Mannheimer Quadrate");
        sizer = createChild("div", "map-sizer", frame);
        stage = createChild("div", "map-stage", sizer);
        plane = createChild("div", "map-plane", stage);
        setDimensions();

        buildPalace();
        for (var i = 0; i < data.quadrate.length; i++) {
            var block = data.quadrate[i];
            elementsByCode[block.code] = buildBlock(block);
            entriesByCode[block.code] = block;
            updateLabel(block.code);
        }
        buildTreesAndLandmarks();

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
        }
        selected = code;
        if (code) {
            elementsByCode[code].classList.add("is-selected");
            elementsByCode[code].setAttribute("aria-current", "true");
        }
    }

    /** [V3] Puts a pin on every Quadrat in the list codes (e.g. ["G2", "O7"]) and removes all other pins. */
    function markieren(codes) {
        if (!codes) {
            codes = [];
        }
        pinned = {};
        for (var i = 0; i < codes.length; i++) {
            if (elementsByCode[codes[i]]) {
                pinned[codes[i]] = true;
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
            var pin = createChild("span", "map-pin", elementsByCode[code]);
            pin.style.left = px(anchor[0] - 12);    // the tip of the 24 x 23 px pin is its bottom middle
            pin.style.top = px(anchor[1] - 23);
            if (anchor.length > 2) {
                pin.style.setProperty("--pin-z", px(anchor[2]));   // open square: on top of its sign
            }
        }
        for (var c in elementsByCode) {
            updateLabel(c);
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

    window.Karte = {
        init: init,
        faerben: faerben,
        waehlen: waehlen,
        markieren: markieren,
        codes: codes
    };
})();
