# Nicht bearbeiten – nur kopieren

Dieser Ordner `pivot/` ist die stabile, vollständige Website „Quadrate“ (Karte mit CSS 3D). Das Git-Tag `pivot-2026-09-29` markiert genau diesen Stand.

## Warum?

- `pivot/` ist der gemeinsame Stand, von dem alle ausgehen. Jede Version in `versionen/` und die Endabgabe in `final/` entstehen als Kopie davon.
- Die Erklärungen für die Präsentation (`docs/erklaerungen/`, `docs/*.html`) nennen Fundstellen wie `js/app.js:56`. Schon eine einzige zusätzliche Zeile verschiebt alle Zeilen darunter, und die Erklärungen der anderen stimmen nicht mehr.
- Geht in einer Kopie etwas schief, ist `pivot/` immer noch da, und man fängt einfach neu an.

## So kopierst du

**Finder (macOS) oder Explorer (Windows):** den Ordner `pivot` kopieren, in `versionen/` (oder als `final/` ins Hauptverzeichnis des Repos) einfügen und umbenennen, z. B. in `v1-html-css`.

**Terminal** (macOS, Linux oder Git Bash unter Windows), im Hauptordner des Repos:

```
mkdir -p versionen
cp -R pivot versionen/v1-html-css
```

Der Zielordner darf vorher nicht existieren, sonst landet die Kopie als Unterordner `pivot` darin.

Danach in der Kopie diese Datei `LIESMICH.md` löschen: Sie gilt nur hier in `pivot/`. Dann die Kopie mit Git speichern (`git add`, `git commit`, `git push`, siehe `README.md` im Hauptordner).

## Aus Versehen etwas geändert?

Kein Problem, Git hat den richtigen Stand. Im Hauptordner des Repos:

```
git checkout --no-overlay pivot-2026-09-29 -- pivot/
git status --short -- pivot/
```

Der erste Befehl holt alle Dateien in `pivot/` so zurück, wie sie beim Tag `pivot-2026-09-29` waren, egal ob die Änderung schon committet ist oder nicht. `--no-overlay` sorgt dafür, dass auch Dateien verschwinden, die jemand später in `pivot/` angelegt und committet hat. Der zweite Befehl zeigt kurz, was in `pivot/` jetzt anders ist als beim letzten Commit (ein Kürzel vor jeder Datei); Dateien außerhalb von `pivot/`, zum Beispiel deine Kopie in `versionen/`, erscheint hier nicht und bleibt unangetastet:

- Steht keine Datei aus `pivot/` mehr da: Die Änderung war noch nicht committet. Fertig.
- Stehen Dateien mit `M` oder `D` da: Die Änderung war schon committet. Dann speichern: `git commit -m "pivot/ auf Tag pivot-2026-09-29 zurückgesetzt"` und `git push`.
- Stehen Dateien aus `pivot/` mit `??` da: Sie sind neu in `pivot/` und nie committet worden. Nur diese Dateien löschen oder in die eigene Kopie verschieben.

Zum Schluss prüfen: `git diff --stat pivot-2026-09-29 -- pivot/` darf nichts mehr ausgeben.

Falls das Tag fehlt (`git tag` zeigt es nicht an): erst `git fetch --tags`, dann noch einmal.

Nie `git push --force` und nie das Tag verschieben oder löschen. Im Zweifel im Team fragen oder Claude Code bitten, den Befehl zu erklären.
