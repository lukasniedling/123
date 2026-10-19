/*
 * fotos.js - photo data for the profile panel ("Steckbrief")
 *
 * Purpose:  lists one free photo per landmark with everything needed for the
 *           credit line next to the photo (author, licence, licence link,
 *           source page on Wikimedia Commons) and a German alt text.
 * Version:  [V2] this file is read by JavaScript (js/steckbrief.js looks up
 *           window.FOTOS[q.foto] for the selected block, see js/data/quadrate.js).
 *           The image files in img/fotos/ can also be used directly in [V1] HTML.
 * How it fits in: plain data, no logic. Loaded with a classic <script src> tag
 *           before js/steckbrief.js, so the site keeps working via file://.
 *
 * Source:   all photos come from Wikimedia Commons (retrieved 2026-09-29 via the
 *           Commons API). Allowed licences only: CC0, public domain, CC BY, CC BY-SA.
 *           Each photo was only scaled down to 1200 px width (standard Commons
 *           thumbnail, re-saved as JPEG); nothing else was changed.
 * Credits:  the credit line must show urheber, lizenz (linked to lizenzUrl) and a
 *           link to quelle. For "jesuitenkirche" the author asks for an exact
 *           attribution text (Commons file page, read 2026-09-29):
 *           "© Achim Lammerts / Wikimedia Commons / „2025-08-31 D500-0570 Achim-Lammerts
 *           Mannheim Jesuitenkirche“ / CC BY-SA 4.0". The field namensnennung holds it up to
 *           the licence name; js/steckbrief.js prints it unchanged and adds the linked licence.
 *           ausschnitt: true marks photos that the site shows cropped to 3:2 (their own format
 *           is wider or taller); the credit line then says "Ausschnitt" (CC licences ask to
 *           indicate changes) and links to impressum.html#fotos.
 *
 * Format (see web/ARCHITECTURE.md):
 *   key: { datei, alt, urheber, lizenz, lizenzUrl, quelle, ausschnitt (optional),
 *          namensnennung (optional) }
 */

window.FOTOS = {
    "marktplatz": {
        datei: "img/fotos/marktplatz.jpg",
        alt: "Marktplatz in G 1: das Alte Rathaus und die Kirche St. Sebastian mit rot-weißer Barockfassade und Mittelturm unter blauem Himmel",
        urheber: "Georg Buzin",
        lizenz: "CC BY-SA 4.0",
        lizenzUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.de",
        quelle: "https://commons.wikimedia.org/wiki/File:Altes_Rathaus_und_Sankt_Sebastianskirche_auf_dem_Mannheimer_Marktplatz.jpg"
    },
    "paradeplatz": {
        datei: "img/fotos/paradeplatz.jpg",
        alt: "Paradeplatz in O 1 von oben: Rasenflächen und Bäume, in der Mitte der Brunnen mit der Grupello-Pyramide, dahinter das Stadthaus N 1",
        urheber: "Hubert Berberich (HubiB)",
        lizenz: "CC BY-SA 3.0",
        lizenzUrl: "https://creativecommons.org/licenses/by-sa/3.0/deed.de",
        quelle: "https://commons.wikimedia.org/wiki/File:Paradeplatz_Mannheim_2019.jpg"
    },
    "schillerplatz": {
        datei: "img/fotos/schillerplatz.jpg",
        alt: "Schillerplatz in B 3: das Schillerdenkmal, eine grüne Bronzestatue von Friedrich Schiller, vor einem großen Baum und Wohnhäusern",
        urheber: "Flocci Nivis",
        lizenz: "CC BY 4.0",
        lizenzUrl: "https://creativecommons.org/licenses/by/4.0/deed.de",
        quelle: "https://commons.wikimedia.org/wiki/File:20180714_Schillerdenkmal_Mannheim_02.jpg"
    },
    "jesuitenkirche": {
        datei: "img/fotos/jesuitenkirche.jpg",
        alt: "Jesuitenkirche in A 4: barocke Fassade aus rotem Sandstein mit Kuppel und zwei Türmen, davor Bäume und Rasen",
        urheber: "Achim Lammerts",
        namensnennung: "© Achim Lammerts / Wikimedia Commons / „2025-08-31 D500-0570 Achim-Lammerts Mannheim Jesuitenkirche“ / ",
        lizenz: "CC BY-SA 4.0",
        lizenzUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.de",
        quelle: "https://commons.wikimedia.org/wiki/File:2025-08-31_D500-0570_Achim-Lammerts_Mannheim_Jesuitenkirche.jpg",
        ausschnitt: true
    },
    "zeughaus": {
        datei: "img/fotos/zeughaus.jpg",
        alt: "Zeughaus in C 5: lang gestreckter Barockbau aus Sandstein mit hohem Dach, heute ein Museum der Reiss-Engelhorn-Museen",
        urheber: "Tournasol7",
        lizenz: "CC BY-SA 4.0",
        lizenzUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.de",
        quelle: "https://commons.wikimedia.org/wiki/File:Zeughaus_in_Mannheim_(2).jpg",
        ausschnitt: true
    },
    "konkordienkirche": {
        datei: "img/fotos/konkordienkirche.jpg",
        alt: "Konkordienkirche in R 2: weißes Kirchenschiff mit hohen Rundbogenfenstern und ein Turm aus rotem Sandstein",
        urheber: "Immanuel Giel",
        lizenz: "CC BY-SA 4.0",
        lizenzUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.de",
        quelle: "https://commons.wikimedia.org/wiki/File:Konkordienkirche_Mannheim_06.jpg",
        ausschnitt: true
    },
    "herschelbad": {
        datei: "img/fotos/herschelbad.jpg",
        alt: "Herschelbad in U 3: Hallenbad aus hellem Sandstein mit Turm und Giebel, davor ein gepflasterter Platz",
        urheber: "Hubert Berberich (HubiB)",
        lizenz: "CC BY 3.0",
        lizenzUrl: "https://creativecommons.org/licenses/by/3.0/deed.de",
        quelle: "https://commons.wikimedia.org/wiki/File:Herschelbad_Mannheim_Front.jpg"
    },
    "wasserturm": {
        datei: "img/fotos/wasserturm.jpg",
        alt: "Wasserturm am Friedrichsplatz: runder Turm aus Sandstein mit grüner Kuppel, davor Wasserbecken, Treppen und Bäume",
        urheber: "Flocci Nivis",
        lizenz: "CC BY 4.0",
        lizenzUrl: "https://creativecommons.org/licenses/by/4.0/deed.de",
        quelle: "https://commons.wikimedia.org/wiki/File:20180714_Mannheimer_Wasserturm_05.jpg"
    },
    "schloss": {
        datei: "img/fotos/schloss.jpg",
        alt: "Barockschloss Mannheim: Blick über den gepflasterten Ehrenhof auf den Mittelbau und die beiden Seitenflügel",
        urheber: "Hubert Berberich (HubiB)",
        lizenz: "CC BY 3.0",
        lizenzUrl: "https://creativecommons.org/licenses/by/3.0/deed.de",
        quelle: "https://commons.wikimedia.org/wiki/File:SchlossEhrenhof_2017.jpg",
        ausschnitt: true
    },
    "planken": {
        datei: "img/fotos/planken.jpg",
        alt: "Die Planken: breite Einkaufsstraße mit Straßenbahngleisen und Baumreihen, am Ende der Wasserturm",
        urheber: "AnRo0002",
        lizenz: "CC0 1.0",
        lizenzUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.de",
        quelle: "https://commons.wikimedia.org/wiki/File:20171119Planken_Mannheim.jpg",
        ausschnitt: true
    }
};
