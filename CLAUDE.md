# CLAUDE.md: Quadrate (group repository)

## Purpose and audience
- "Quadrate" is the group project of five students in the module Webprogrammierung at DHBW Mannheim (2026): a German website that shows Mannheim's 146 city blocks (Quadrate) as a 3D map, with a filter by weekday, time and category, a profile ("Steckbrief") per block, and an account to save places.
- The people asking you are students of this course. In the presentation each of them explains a subpage from its source code and answers the lecturer's questions, so they must be able to explain every line. Explaining comes first, writing code second.
- Answer in German, simply, in short steps. Cite code as `path:line` from the repo root (e.g. `final/js/app.js:56`). Open the file and check the line before you cite it; never cite from memory.
- Explain terms the way the course does: HTML (lectures 2 and 3), CSS (4 and 5), JavaScript (6), PHP (7). Plain German word first, technical term second ("Ereignis (Event)"). If a term is not in the slides (e.g. ARIA, Grid, localStorage), say so and explain it anyway. The slides are not in this repo: take lecture references only from the column "Kurs" in the explanation documents (e.g. "VL2 S.3" = lecture 2, slide 3) and never invent slide numbers.

## Repository layout
```
final/       the final submission. Open final/index.html by double-click; no server.
final-v2/    version 2 of the final version (2026-10-12): a full copy of final/ with later changes
             (account with e-mail and confirmation code, soft mood transitions, arrow buttons at the
             time slider, profile panel over the map). final-v2/LIESMICH.md lists what differs.
final-v3/    version 3 of the final version (2026-10-13, Niko Eibach): a copy of final-v2/ with the pages
             jetzt.html, events.html, event-melden.html, merkliste.html, place search on quadrate.html
             ("Orte") and a 6-item menu. final-v3/LIESMICH.md explains what was done and why.
final-v4/    version 4 (2026-10-14): THE VERSION FOR THE PRESENTATION. Based on final-v2/ with the pages
             suche.html ("Orte finden": search with category and "nur jetzt geöffnet" filters) and
             meine-orte.html (saved places with opening hours, PDF/print, "Route zu allen Orten"), saving
             as a guest (sessionStorage), pins in category colours, a reworked start page and, from
             final-v3/, "schließt bald" and the route links. final-v4/LIESMICH.md lists what differs.
final-v5/    version 5 (2026-10-14, Niko Eibach): a copy of the latest final-v3/ (map with "Gerade offen" below
             it, time lapse, "In meiner Nähe", place features; events with month view, place search,
             Merkliste with "Tag planen"; coloured page bands, own SVG drawings). final-v5/LIESMICH.md.
versionen/   v1-html-css (HTML+CSS only), v2-javascript (+JS, no account)
pivot/       shared state of 2026-09-29 (git tag pivot-2026-09-29), still with PHP. READ ONLY.
README.md    short German overview for the team
```
- final/, final-v2/, final-v3/, final-v4/ and final-v5/ are all kept on purpose. The explanations in `final-v5/docs/erklaerungen/` cite line numbers of final-v5/. final-v4/ is the version for the presentation; unless the student names a folder, ask which version a question or change is about (suggest final-v4/). The explanations in `final-v4/docs/erklaerungen/` cite line numbers of final-v4/ (checked 2026-10-14) and add `suche.md` and `meine-orte.md`.
- final/ and final-v2/: Everything below about final/ also holds for final-v2/, except what final-v2/LIESMICH.md lists (e.g. the account uses e-mail addresses, not user names). The explanations in `final-v2/docs/erklaerungen/` cite line numbers of final-v2/.
- The first final version with PHP (sessions, password hash, JSON files on the server) is archived as git tag `final-php-2026-10-07`. It is not in the working tree; show it with `git show final-php-2026-10-07:final/login.php` or `git checkout final-php-2026-10-07` (then `git checkout main`).

## The pivot rule
- Never create, edit, move or delete anything under `pivot/`, not even a typo, and never run a command that writes there. The explanations in `pivot/docs/` cite pivot's line numbers.
- `.claude/settings.json` denies Claude Code's file-editing tools under `pivot/` (rule `Edit(/pivot/**)`). Do not work around it with shell commands.
- If asked to change something there: say that `pivot/` is read-only and work in `final/` (or the matching `versionen/` folder) instead.
- If `pivot/` was changed by mistake, suggest `git checkout --no-overlay pivot-2026-09-29 -- pivot/`, then `git status --short -- pivot/`; run it only when the student agrees. `pivot/LIESMICH.md` explains this for humans.

## Where the explanations are
- For final-v4/ (the presentation version): `final-v4/docs/erklaerungen/README.md`, the same set of documents as below plus `suche.md` ("Orte finden") and `meine-orte.md`; their line numbers point into `final-v4/`.
- `final/docs/erklaerungen/README.md`: start here. Overview of the documents, who presents what, order of the presentation, mistakes in the lecture slides ("Stolperfallen").
- One document per subpage in `final/docs/erklaerungen/`: `index.md` (start page: filter, profile, `#G1`), `karte-css3d.md` (the 3D map and the time-of-day moods), `quadrate.md`, `vorschlagen.md`, `ueber-uns.md`, `impressum-datenschutz.md`, `konto.md` (account in localStorage, comparison with PHP), `daten.md` (data, OpenStreetMap, licences). Each has: what the page shows, how to demo it, structure of the source, tables of terms with file:line and "Kurs", and "Fragen, die der Dozent stellen könnte" with answers. Their line numbers point into `final/`.
- `pivot/docs/erklaerungen/` describes the pivot, including the PHP part (`konto.md`). In those documents `web/variante-css3d/` means `pivot/`.
- `versionen/*/LIESMICH.md` explains how V1 and V2 were made.
- Read the matching document and the file's header comment first, then the code. If document and code disagree, the code wins; tell the student.

## How final/ works (paths relative to final/)
- Pages: `index.html` (map, filter, legend, profile), `quadrate.html` (table of all 146 blocks, sorting and search), `vorschlagen.html` (form "Ort vorschlagen" and an OpenStreetMap iframe), `konto.html` (log in, register, saved places), `ueber-uns.html` (idea, team, logo, video), `impressum.html`, `datenschutz.html`.
- Everything works by double-click (file://): classic `<script src>` tags, no ES modules, no `fetch` of local files; the data files assign globals (`window.ORTE = [...]`).
- CSS: `css/style.css` is the shared design system (tokens, header, navigation, footer, components; Apple-inspired, system font); one file per page (`index.css`, `verzeichnis.css`, `formular.css`, `info.css`, `konto.css`); `css/karte.css` is the 3D map (`perspective`, `transform`, `transform-style: preserve-3d`, `transition`) with the moods morning, day, evening and night.
- Scripts on `index.html`, in load order: data `js/data/orte.js` (ORTE, ORTE_META), `quadrate.js` (QUADRATE), `fotos.js` (FOTOS), `karte-daten.js` (KARTE_DATEN); then `js/karte.js` (window.Karte), `js/oeffnungszeiten.js` (window.Oeffnungszeiten), `js/filter.js` (window.KATEGORIEN, window.Filter), `js/konto.js` (window.Konto), `js/steckbrief.js` (window.Steckbrief), and last `js/app.js` (wiring; the address hash such as `index.html#G1` is the selected block). `quadrate.html` loads `js/verzeichnis.js`, `vorschlagen.html` loads `js/formular.js`, `konto.html` loads `js/konto.js` and `js/konto-seite.js`.
- Account (decision D-042): `js/konto.js` keeps accounts and saved places in localStorage as JSON (`JSON.stringify` / `JSON.parse`), keys `quadrate-konten` and `quadrate-angemeldet`. The password is stored as plain text on purpose: the site only runs locally and security is not a goal; the form and `datenschutz.html` warn about it. `js/konto-seite.js` draws `konto.html`; `js/steckbrief.js` shows the "Merken" buttons and sets the pins with `Karte.markieren()`.
- Form: `js/formular.js` checks the fields and stores a valid suggestion in localStorage (key `quadrate-vorschlaege`); nothing is sent anywhere.
- Filter: counts per block the open places of the chosen category at the chosen time; 1 → colour level 0, 2-3 → 1, 4-6 → 2, 7+ → 3 (`levelOf()` in `js/filter.js`). The map starts at the real time.
- Map API `window.Karte` (`js/karte.js`): `init(container, { onSelect(code, byKeyboard), onHover(code | null) })`, `faerben(map | null, texts)`, `waehlen(code | null)`, `markieren(codes)`, `stimmung(name)`, `codes()`.
- Every file starts with a header comment (purpose, version, how it fits in); every function has a short doc comment. Read the header first.
- Version markers: `[V1]` = HTML and CSS only, `[V2]` = needs JavaScript. An HTML comment that starts with a marker, directly before an element, marks that element; `<!-- [V2] begin: … -->` to `<!-- [V2] end -->` marks a block; text after `instead:` is the replacement for V1. `[V3]` (PHP) only appears in `pivot/`.

## Files that are mentioned but not in this repo
- Comments and docs mention `tools/*.py` (Python generators), `tools/video/`, `web/…` and `docs/_vorlage.html`. They live in the development folder of Anes Sahbegovic and are not published here. Do not search for them; explain from the comment what they do.
- Generated files: `quadrate.html` (table built from `js/data/orte.js` and `js/data/quadrate.js`), `js/data/orte.js` (from OpenStreetMap), `js/data/karte-daten.js`, `img/boden-*.svg` (ground of the map, one per mood), `img/wasserturm.svg`, `img/karte/`. Editing them by hand is possible; tell the student that the generator would overwrite the change and that `quadrate.html` does not update itself when `quadrate.js` changes.

## Known limitations
- Accounts and saved places live in one browser on one computer; a private window may block localStorage (`konto.html` then shows a notice).
- E-mail `info@quadrate.com` and phone `+49 178 67123467` in `impressum.html` and `datenschutz.html` are fictitious placeholders chosen by the team. Never send anything to them, never call or "test" them. Postal address: c/o DHBW Mannheim, Coblitzallee 1-9, 68163 Mannheim.
- `datenschutz.html` is a sample text checked by the team, not legal advice.
- The 3D map was tested in Chrome and Safari; check the browser used for the presentation.
- The site runs only locally and in this private repository, with no public hosting. The only request to another server is the OpenStreetMap iframe on `vorschlagen.html`.

## Rules for changes
- Course level: plain HTML5, CSS3, vanilla JavaScript. No frameworks, libraries, CDNs, npm packages or build steps. Readable code a student can explain; no clever one-liners.
- Keep double-click working (classic scripts, no modules, no `fetch` of local files).
- Code comments and identifiers in English; everything visible on the website in German. Keep the deliberate German names: global modules (`Karte`, `Filter`, `Steckbrief`, `Konto` …), map API, data keys (`kat`, `zeiten`, `quadrat` …), localStorage keys, HTML ids and form field names.
- New files get a header comment; new functions a short doc comment.
- Accessibility basics stay: `lang="de"`, alt texts, labels, visible focus, keyboard use, works from 360 px width.
- The OpenStreetMap attribution ("Kartendaten © OpenStreetMap-Mitwirkende, ODbL" with a link to https://www.openstreetmap.org/copyright) must stay on every page with map data, and the photo credits stay next to each photo and in `impressum.html#fotos`. Never remove or shorten them (licence duty).
- Never commit secrets (passwords, tokens, `.env`). Check `git status` before a commit.
- Git: commit or push only when the student asks; `git pull` first; never force-push, never rewrite history, never move or delete the tags `pivot-2026-09-29` and `final-php-2026-10-07`.
- After a change, say exactly which file and lines changed and how to test it (double-click `final/index.html`).

## Typical requests
- "Erklär mir X": find the file, read its header and the matching document, then explain top-down: what the visitor sees, which files take part, the code step by step with `path:line`, the course terms involved. End with two or three check questions.
- "Was wird der Dozent fragen?": start from "Fragen, die der Dozent stellen könnte" in the matching document, add questions from the code, give short answers the student can say in their own words, and mention the slide mistakes ("Stolperfallen") where they fit.
- "Welche Begriffe kommen in Y vor?": list them per technology (HTML, CSS, JavaScript) with `path:line` and one sentence each; use the term tables of the documents.
- "Wie war das mit PHP?": explain from `pivot/docs/erklaerungen/konto.md` and the pivot code, or from the tag `final-php-2026-10-07`, and compare with `final/js/konto.js`.
- "Ändere / baue X": check where (never `pivot/`), keep it small and at course level, then explain every changed line.
