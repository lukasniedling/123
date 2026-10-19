/*
 * standort.js - "In meiner Nähe": asks the browser for the visitor's position and measures how far the
 * places are from it. Offers window.Standort.  [V2] Added 2026-10-13.
 *
 * How it fits in:
 * - The position comes from the Geolocation API of the browser (navigator.geolocation). The browser asks
 *   the visitor first; without a "yes" nothing happens. The position stays in the page: it is not stored
 *   and not sent anywhere (datenschutz.html, part "Standort").
 * - The places' positions come from js/merkmale.js (window.Merkmale.position, OpenStreetMap data).
 * - Used by js/app.js (map: button "In meiner Nähe" opens the nearest Quadrat) and js/ortssuche.js
 *   (place search: sorts the hits by distance); js/tagesplaner.js uses distance() for walking times.
 * Classic script without modules, so the pages also work by double-click (file://).
 */
(function () {
    "use strict";

    var EARTH_RADIUS = 6371000;       // metres
    var TIMEOUT = 15000;              // wait at most 15 seconds for the position

    /**
     * Distance in metres between two points { lat, lon } (haversine formula: distance on a sphere).
     * For a few hundred metres it is accurate to about a metre.
     */
    function distance(a, b) {
        var rad = Math.PI / 180;
        var dLat = (b.lat - a.lat) * rad;
        var dLon = (b.lon - a.lon) * rad;
        var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(h));
    }

    /** Distance as German text: "80 m", "450 m", "1,2 km" (rounded, the position is not exact anyway). */
    function distanceText(metres) {
        if (metres < 1000) {
            return Math.max(10, Math.round(metres / 10) * 10) + " m";
        }
        return (Math.round(metres / 100) / 10).toFixed(1).replace(".", ",") + " km";
    }

    /** Distance of a place from a position in metres, or null if the place has no position. */
    function distanceTo(place, here) {
        var position = window.Merkmale ? Merkmale.position(place) : null;
        return position ? distance(here, position) : null;
    }

    /** The place of a list with the shortest distance: { place, metres }, or null. */
    function nearest(places, here) {
        var best = null;
        for (var i = 0; i < places.length; i++) {
            var metres = distanceTo(places[i], here);
            if (metres !== null && (best === null || metres < best.metres)) {
                best = { place: places[i], metres: metres };
            }
        }
        return best;
    }

    /**
     * Asks the browser for the position. onSuccess({ lat, lon }) or onError(German message).
     * Works on https pages and on pages opened from the disk (file://), not on plain http pages.
     */
    function find(onSuccess, onError) {
        if (!navigator.geolocation) {
            onError("Dein Browser kann den Standort nicht bestimmen.");
            return;
        }
        navigator.geolocation.getCurrentPosition(function (result) {
            onSuccess({ lat: result.coords.latitude, lon: result.coords.longitude });
        }, function (error) {
            if (error.code === error.PERMISSION_DENIED) {
                onError("Du hast den Standort nicht freigegeben. Du kannst ihn in den Einstellungen des Browsers erlauben.");
            } else if (error.code === error.TIMEOUT) {
                onError("Der Standort hat zu lange gedauert. Versuch es noch einmal.");
            } else {
                onError("Der Standort konnte nicht bestimmt werden.");
            }
        }, { enableHighAccuracy: true, timeout: TIMEOUT, maximumAge: 60000 });
    }

    window.Standort = {
        find: find,
        distance: distance,          // also used by js/tagesplaner.js for walking times
        distanceTo: distanceTo,
        distanceText: distanceText,
        nearest: nearest
    };
})();
