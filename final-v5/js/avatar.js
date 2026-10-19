/*
 * avatar.js - a profile picture ("Avatar") for the account: choose a picture on konto.html, it is made small
 * and square, stored in the browser and shown in the menu next to "Konto" on every page. Offers window.Avatar.
 * [V2] Added 2026-10-14 (final-v5).
 *
 * How it fits in:
 * - The accounts themselves are in js/konto.js (Anes), which stays unchanged: the pictures are kept apart in
 *   localStorage under the key "quadrate-avatare" as { "anna@example.de": "data:image/jpeg;base64,..." }.
 *   Konto.user() says who is logged in.
 * - js/konto-seite.js calls Avatar.setup() for the field "Profilbild" on konto.html and Avatar.remove() when an
 *   account is deleted.
 * - The picture never leaves the browser: FileReader reads the chosen file, a <canvas> makes it 160 x 160 pixels
 *   (cut to a square in the middle) and toDataURL() turns it into text that fits into localStorage (a few KB).
 * - Every page loads this file after js/konto.js; showInMenu() puts the small round picture into the menu.
 * Classic script without modules, so the pages also work by double-click (file://).
 */
(function () {
    "use strict";

    var STORAGE_KEY = "quadrate-avatare";
    var SIZE = 160;                    // the stored picture is SIZE x SIZE pixels
    var MAX_FILE_BYTES = 10 * 1024 * 1024;   // bigger files are refused (10 MB), the browser would get slow

    /** All stored pictures: { email: dataUrl }. Empty if there are none or storage is blocked. */
    function all() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (error) {
            return {};
        }
    }

    /** Stores the list again; false if the browser does not allow it (or it is full). */
    function store(list) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
            return true;
        } catch (error) {
            return false;
        }
    }

    /** The picture of an account as a data URL, or null. */
    function get(email) {
        return (email && all()[email]) || null;
    }

    /** Removes the picture of an account (button "Bild entfernen", and when the account is deleted). */
    function remove(email) {
        var list = all();
        delete list[email];
        store(list);
        showInMenu();
    }

    /**
     * Makes a chosen image file small and square and calls done(dataUrl), or done(null, message).
     * 1. FileReader reads the file as a data URL, 2. an <img> loads it, 3. a <canvas> of SIZE x SIZE draws the
     * middle square of the picture into it (drawImage with a part of the source), 4. toDataURL gives a JPEG.
     */
    function shrink(file, done) {
        if (!file.type || file.type.indexOf("image/") !== 0) {
            done(null, "Das ist keine Bilddatei. Bitte wähle ein Foto (zum Beispiel JPG oder PNG).");
            return;
        }
        if (file.size > MAX_FILE_BYTES) {
            done(null, "Das Bild ist zu groß (mehr als 10 MB).");
            return;
        }
        var reader = new FileReader();
        reader.onload = function () {
            var image = new Image();
            image.onload = function () {
                var side = Math.min(image.width, image.height);          // the largest square in the middle
                var canvas = document.createElement("canvas");
                canvas.width = SIZE;
                canvas.height = SIZE;
                canvas.getContext("2d").drawImage(image,
                    (image.width - side) / 2, (image.height - side) / 2, side, side,   // part of the source
                    0, 0, SIZE, SIZE);                                                 // whole canvas
                done(canvas.toDataURL("image/jpeg", 0.85));
            };
            image.onerror = function () {
                done(null, "Das Bild konnte nicht gelesen werden.");
            };
            image.src = reader.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Shows the picture of the logged-in account in the menu, in front of the word "Konto" (on every page).
     * Without an account or a picture the menu stays as it is.
     */
    function showInMenu() {
        var link = document.querySelector('.site-nav a[href="konto.html"]');
        if (!link || !window.Konto) {
            return;
        }
        var old = link.querySelector(".nav-avatar");
        if (old) {
            old.remove();
        }
        var picture = get(Konto.user());
        if (picture) {
            var image = document.createElement("img");
            image.className = "nav-avatar";
            image.src = picture;
            image.alt = "";                    // the link already says "Konto"; the picture is decoration here
            link.insertBefore(image, link.firstChild);
        }
    }

    /**
     * The picture big in the coloured band at the top of "Mein Konto" (konto.html), in place of the drawing (added 2026-10-14).
     * band: the element div.page-intro--band. With a picture the drawing is switched off (--band-image: none)
     * and a round <img class="band-avatar"> takes its place; without one the drawing comes back.
     */
    function showInBand(band, picture) {
        if (!band) {
            return;
        }
        var image = band.querySelector(".band-avatar");
        if (!picture) {
            if (image) {
                image.remove();
            }
            band.style.removeProperty("--band-image");
            band.classList.remove("page-intro--avatar");
            return;
        }
        if (!image) {
            image = document.createElement("img");
            image.className = "band-avatar";
            image.alt = "Dein Profilbild";
            band.appendChild(image);
        }
        image.src = picture;
        band.style.setProperty("--band-image", "none");
        band.classList.add("page-intro--avatar");
    }

    /**
     * The field "Profilbild" on konto.html (called by js/konto-seite.js when the account is shown).
     * parts: { image, placeholder, input, removeButton, message, band } - the elements of the field and the
     * coloured band at the top of the page (the picture is shown there big as well).
     */
    function setup(parts) {
        var email = Konto.user();

        /** Shows the stored picture, or the first letter of the e-mail address in a circle. */
        function showPicture() {
            var picture = get(email);
            showInBand(parts.band, picture);
            parts.image.src = picture || "";
            parts.image.hidden = !picture;
            parts.placeholder.hidden = !!picture;
            parts.placeholder.textContent = email ? email.charAt(0).toUpperCase() : "?";
            parts.removeButton.hidden = !picture;
        }

        parts.input.onchange = function () {
            var file = parts.input.files[0];
            if (!file) {
                return;
            }
            parts.message.textContent = "Bild wird verkleinert …";
            shrink(file, function (dataUrl, problem) {
                parts.input.value = "";            // the same file can be chosen again
                if (!dataUrl) {
                    parts.message.textContent = problem;
                    return;
                }
                var list = all();
                list[email] = dataUrl;
                parts.message.textContent = store(list) ? "Profilbild gespeichert." :
                    "Das Bild konnte nicht gespeichert werden (Speicher des Browsers voll oder gesperrt).";
                showPicture();
                showInMenu();
            });
        };
        parts.removeButton.onclick = function () {
            remove(email);
            parts.message.textContent = "Profilbild entfernt.";
            showPicture();
        };
        showPicture();
    }

    window.Avatar = {
        get: get,
        remove: remove,
        setup: setup,
        showInMenu: showInMenu
    };

    showInMenu();
})();
