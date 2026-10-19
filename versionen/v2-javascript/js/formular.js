/*
 * formular.js - friendly checks for the form on vorschlagen.html.
 * Version: [V2] (needs JavaScript). Without this file the form still works
 * with the browser's own checks and the :user-invalid styles of style.css (V1).
 *
 * What it does:
 *  1. Checks the fields and writes a short German message directly under each
 *     field that needs attention, plus a list of these fields above the form.
 *     The browser's small pop-up bubbles are switched off for this.
 *  2. Counts the characters of the message ("123 von 1.000 Zeichen").
 *  3. Interim version V2 has no PHP yet: when everything is correct it says so
 *     and stops the submit, because there is nothing that could receive the form.
 *
 * How it fits in: loaded with a classic <script> tag at the end of
 * vorschlagen.html, so the form already exists when this file runs. The rules
 * match the HTML attributes (required, minlength, maxlength, pattern). From V3
 * on, PHP checks everything again on the server. Page styles for the counter
 * and the notices: css/formular.css.
 *
 * Like the other scripts, everything is wrapped in a function that runs at once and uses
 * "use strict", so the names below (form, checkField ...) do not become page-wide globals.
 */
(function () {
    "use strict";

    // Messages per field: each one says what is wrong and how to fix it.
    var MESSAGES = {
        name: {
            missing: "Bitte gib deinen Namen ein. Ein Vorname reicht.",
            tooShort: "Der Name ist zu kurz. Bitte gib mindestens 2 Zeichen ein."
        },
        email: {
            missing: "Bitte gib deine E-Mail-Adresse ein, damit wir dir antworten können.",
            invalid: "Diese E-Mail-Adresse ist unvollständig. Sie braucht ein @ und eine Endung, zum Beispiel anna@beispiel.de."
        },
        kategorie: {
            missing: "Bitte wähle eine Kategorie. Bei einer allgemeinen Frage passt Sonstiges."
        },
        nachricht: {
            missing: "Bitte schreib uns eine kurze Nachricht.",
            tooShort: "Die Nachricht ist noch sehr kurz. Bitte schreib mindestens 10 Zeichen."
        },
        datenschutz: {
            missing: "Bitte bestätige, dass du die Datenschutzerklärung gelesen hast. Ohne deine Zustimmung dürfen wir deine Angaben nicht speichern."
        }
    };

    // Names of the fields in the list above the form.
    var FIELD_LABELS = {
        name: "Dein Name",
        email: "E-Mail",
        kategorie: "Kategorie",
        nachricht: "Nachricht",
        datenschutz: "Zustimmung zur Datenschutzerklärung"
    };

    // The fields this script checks, in the order of the form. "ort" and
    // "quadrat" are optional and cannot be wrong (maxlength, fixed list).
    var CHECKED_FIELDS = ["name", "email", "kategorie", "nachricht"];

    // The consent checkbox exists only once PHP stores the form (V3); V2 has none.
    var consentBox = document.getElementById("datenschutz");
    if (consentBox) {
        CHECKED_FIELDS.push("datenschutz");
    }

    // Below this many characters left, the counter turns brown.
    var COUNTER_WARNING = 100;

    var form = document.getElementById("vorschlag-formular");
    var noticeArea = document.getElementById("formular-meldungen");
    var messageField = document.getElementById("nachricht");
    var counter = document.getElementById("nachricht-zaehler");
    var buttonRow = form ? form.querySelector(".button-row") : null;

    // Hidden text for screen readers that announces the counter at its two limits.
    var counterAnnouncer = null;
    // Last state of the counter ("ok", "near", "full"), so each state is announced only once.
    var counterState = "ok";


    /**
     * Returns the element that stands for a field: the input, textarea or checkbox
     * itself, or for the category the fieldset around its five radios.
     */
    function getFieldElement(fieldName) {
        if (fieldName === "kategorie") {
            return document.getElementById("kategorie-gruppe");
        }
        return document.getElementById(fieldName);
    }

    /**
     * Returns the element that receives the focus for a field
     * (for the category: the first radio of the group).
     */
    function getFocusTarget(fieldName) {
        if (fieldName === "kategorie") {
            return document.getElementById("kategorie-essen");
        }
        return document.getElementById(fieldName);
    }

    /**
     * Checks one field and returns its error message, or "" if the field is fine.
     * Text is checked without spaces at the start and end, like the server does,
     * so a name made only of spaces counts as empty.
     */
    function findError(fieldName) {
        var messages = MESSAGES[fieldName];

        if (fieldName === "kategorie") {
            // form.elements.kategorie is the group of radios; its value stays "" until one is chosen.
            if (form.elements.kategorie.value === "") {
                return messages.missing;
            }
            return "";
        }

        if (fieldName === "datenschutz") {
            if (!form.elements.datenschutz.checked) {
                return messages.missing;
            }
            return "";
        }

        var control = form.elements[fieldName];
        var text = control.value.trim();

        if (text === "") {
            return messages.missing;
        }
        // minLength is -1 when the field has no minlength attribute.
        if (control.minLength > 0 && text.length < control.minLength) {
            return messages.tooShort;
        }
        // The browser's own check of type="email" (typeMismatch) and of the pattern attribute.
        if (control.validity.typeMismatch || control.validity.patternMismatch) {
            return messages.invalid;
        }
        return "";
    }

    /**
     * Adds an id to the aria-describedby list of an element. Screen readers then
     * read the text of that element together with the field.
     */
    function addDescription(element, id) {
        var ids = (element.getAttribute("aria-describedby") || "").split(" ");
        if (ids.indexOf(id) === -1) {
            ids.push(id);
            element.setAttribute("aria-describedby", ids.join(" ").trim());
        }
    }

    /**
     * Removes an id from the aria-describedby list of an element.
     */
    function removeDescription(element, id) {
        var ids = (element.getAttribute("aria-describedby") || "").split(" ");
        var remaining = ids.filter(function (entry) {
            return entry !== "" && entry !== id;
        });
        if (remaining.length > 0) {
            element.setAttribute("aria-describedby", remaining.join(" "));
        } else {
            element.removeAttribute("aria-describedby");
        }
    }

    /**
     * Removes every mark from a field: error message, green tick, aria-invalid.
     */
    function clearFieldState(fieldName) {
        var element = getFieldElement(fieldName);
        var box = element.closest(".field");
        box.classList.remove("field--error", "field--valid");
        element.removeAttribute("aria-invalid");
        removeDescription(element, fieldName + "-fehler");
    }

    /**
     * Checks one field and shows the result: the message under the field and the
     * error look (class "field--error", aria-invalid) or, for filled text fields,
     * the green tick (class "field--valid"). Returns true if the field is fine.
     */
    function checkField(fieldName) {
        var message = findError(fieldName);
        var element = getFieldElement(fieldName);
        var box = element.closest(".field");
        var errorText = document.getElementById(fieldName + "-fehler");

        clearFieldState(fieldName);

        if (message === "") {
            // The tick only makes sense inside one-line text fields (name, e-mail).
            if (element.tagName === "INPUT" && element.type !== "checkbox") {
                box.classList.add("field--valid");
            }
            return true;
        }

        errorText.textContent = message;
        box.classList.add("field--error");
        element.setAttribute("aria-invalid", "true");
        addDescription(element, errorText.id);
        return false;
    }

    /**
     * Creates a notice box as in style.css (section 19): a title line and a text.
     */
    function createNotice(type, title, text) {
        var notice = document.createElement("div");
        notice.className = "notice " + type;

        var titleLine = document.createElement("p");
        titleLine.className = "notice__title";
        titleLine.textContent = title;
        notice.appendChild(titleLine);

        var textLine = document.createElement("p");
        textLine.textContent = text;
        notice.appendChild(textLine);

        return notice;
    }

    /**
     * Removes the notice of the last submit attempt (error list or file:// result).
     */
    function removeResultNotice() {
        var oldNotice = document.getElementById("formular-ergebnis");
        if (oldNotice) {
            oldNotice.remove();
        }
    }

    /**
     * Shows the list of fields that still need attention above the form. Every
     * entry is a link that moves the focus to its field. role="alert" makes
     * screen readers read the list at once.
     */
    function showErrorList(fieldNames) {
        removeResultNotice();

        var intro = "Bitte prüfe diese " + fieldNames.length + " Felder:";
        if (fieldNames.length === 1) {
            intro = "Bitte prüfe dieses Feld:";
        }
        var notice = createNotice("notice--error", "Noch nicht gesendet", intro);
        notice.id = "formular-ergebnis";
        notice.setAttribute("role", "alert");

        var list = document.createElement("ul");
        fieldNames.forEach(function (fieldName) {
            var target = getFocusTarget(fieldName);
            var item = document.createElement("li");
            var link = document.createElement("a");
            link.href = "#" + target.id;
            link.textContent = FIELD_LABELS[fieldName];
            // A plain anchor link would only scroll; this also puts the cursor into the field.
            link.addEventListener("click", function (event) {
                event.preventDefault();
                target.focus();
            });
            item.appendChild(link);
            list.appendChild(item);
        });
        notice.appendChild(list);

        noticeArea.appendChild(notice);
    }

    /**
     * Removes the error list as soon as the last marked field has been fixed.
     */
    function updateErrorList() {
        var errorList = document.getElementById("formular-ergebnis");
        if (errorList && errorList.classList.contains("notice--error") && !form.querySelector(".field--error")) {
            errorList.remove();
        }
    }

    /**
     * Shows, right above the buttons, that the form is complete. Nothing is sent:
     * sending follows with PHP in lecture 7 (version V3).
     */
    function showResult() {
        removeResultNotice();
        var notice = createNotice(
            "notice--info",
            "Alles richtig ausgefüllt",
            "Gesendet wurde aber nichts: Den Versand bauen wir mit PHP (Vorlesung 7). In dieser Version " +
            "prüft JavaScript nur, ob alles richtig ausgefüllt ist."
        );
        notice.id = "formular-ergebnis";
        notice.setAttribute("role", "status");
        form.insertBefore(notice, buttonRow);
    }

    /**
     * Runs when the form is sent: checks all fields. With errors it stops the
     * sending, lists the fields and puts the cursor into the first one. Without
     * errors it also stops (V2 has no PHP yet) and shows that everything is correct.
     */
    function handleSubmit(event) {
        var wrongFields = [];
        CHECKED_FIELDS.forEach(function (fieldName) {
            if (!checkField(fieldName)) {
                wrongFields.push(fieldName);
            }
        });

        if (wrongFields.length > 0) {
            event.preventDefault();
            showErrorList(wrongFields);
            getFocusTarget(wrongFields[0]).focus();
            return;
        }

        // Everything is fine. V2 cannot send yet, so the page stays as it is.
        event.preventDefault();
        showResult();
    }

    /**
     * True if the visitor has entered or chosen anything in the form.
     */
    function formHasInput() {
        var textFields = ["name", "email", "ort", "quadrat", "nachricht"];
        var hasText = textFields.some(function (fieldName) {
            return form.elements[fieldName].value.trim() !== "";
        });
        return hasText || form.elements.kategorie.value !== "" || (consentBox !== null && consentBox.checked);
    }

    /**
     * Runs when "Eingaben löschen" is pressed: asks first (typed text would be
     * lost), then removes all messages once the browser has emptied the fields.
     */
    function handleReset(event) {
        if (formHasInput() && !window.confirm("Möchtest du wirklich alle Eingaben löschen?")) {
            event.preventDefault();
            return;
        }
        // The browser empties the fields only after this event; setTimeout(..., 0)
        // runs the clean-up right after that.
        window.setTimeout(function () {
            CHECKED_FIELDS.forEach(clearFieldState);
            removeResultNotice();
            updateCounter();
        }, 0);
    }

    /**
     * Connects the checks with the fields. A text field is checked when the
     * visitor leaves it. While a message is shown, the field is checked again on
     * every key, so the message disappears as soon as the input is fine.
     * Radios and the checkbox are checked on every change.
     */
    function watchFields() {
        ["name", "email", "nachricht"].forEach(function (fieldName) {
            var control = form.elements[fieldName];
            var box = control.closest(".field");

            control.addEventListener("blur", function () {
                // Only passing an empty field with the Tab key is not an error yet.
                if (control.value.trim() !== "" || box.classList.contains("field--error")) {
                    checkField(fieldName);
                    updateErrorList();
                }
            });

            control.addEventListener("input", function () {
                if (box.classList.contains("field--error")) {
                    checkField(fieldName);
                    updateErrorList();
                } else {
                    // No tick while typing; it comes back when the field is left.
                    box.classList.remove("field--valid");
                }
            });
        });

        form.addEventListener("change", function (event) {
            var fieldName = event.target.name;
            if (fieldName === "kategorie" || fieldName === "datenschutz") {
                checkField(fieldName);
                updateErrorList();
            }
        });
    }

    /**
     * Writes "123 von 1.000 Zeichen" under the message. Near the limit the counter
     * also says how many characters are left and changes its colour. Screen
     * readers hear it only when this state changes, not on every key.
     */
    function updateCounter() {
        var max = messageField.maxLength;
        var used = messageField.value.length;
        var left = max - used;

        var state = "ok";
        var extra = "";
        if (left <= 0) {
            state = "full";
            extra = " · Höchstlänge erreicht";
        } else if (left <= COUNTER_WARNING) {
            state = "near";
            extra = " · noch " + left + " frei";
        }

        // toLocaleString("de-DE") writes 1000 as "1.000".
        counter.textContent = used.toLocaleString("de-DE") + " von " + max.toLocaleString("de-DE") + " Zeichen" + extra;
        counter.classList.toggle("counter--near", state === "near");
        counter.classList.toggle("counter--full", state === "full");

        if (state !== counterState) {
            counterState = state;
            if (state === "full") {
                counterAnnouncer.textContent = "Höchstlänge von " + max.toLocaleString("de-DE") + " Zeichen erreicht.";
            } else if (state === "near") {
                counterAnnouncer.textContent = "Noch " + left + " Zeichen frei.";
            } else {
                counterAnnouncer.textContent = "";
            }
        }
    }

    /**
     * Shows the counter under the message (it is hidden without JavaScript) and
     * adds the hidden announcer for screen readers.
     */
    function setUpCounter() {
        counter.hidden = false;
        addDescription(messageField, counter.id);

        counterAnnouncer = document.createElement("p");
        counterAnnouncer.className = "visually-hidden";
        counterAnnouncer.setAttribute("aria-live", "polite");
        counter.after(counterAnnouncer);

        messageField.addEventListener("input", updateCounter);
        updateCounter();
    }

    /**
     * Starts everything once. The browser's own bubbles are switched off
     * (noValidate) because this script now shows the messages.
     */
    function initForm() {
        if (!form) {
            return;
        }
        form.noValidate = true;
        form.addEventListener("submit", handleSubmit);
        form.addEventListener("reset", handleReset);
        watchFields();
        setUpCounter();

        // Coming back with the browser's back button can show the page from the
        // cache: count the text the browser kept.
        window.addEventListener("pageshow", function () {
            updateCounter();
        });
    }

    /* [V2] start the form checks */
    initForm();
})();
