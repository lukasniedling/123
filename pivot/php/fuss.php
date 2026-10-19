<?php
/*
 * php/fuss.php - end of every PHP page: closes <main> and prints the footer.          [V3]
 *
 * Purpose: the same footer as the static pages (docs/_vorlage.html): OpenStreetMap
 * credit, links to Impressum and Datenschutz, project line.
 * How to use it: call pageFooter() as the last line of a page that started with
 * pageHeader() from php/kopf.php. Links get basePath() in front, like in kopf.php.
 */

require_once __DIR__ . '/lib.php';

/**
 * Prints the end of a page: </main>, the footer, </body> and </html>.
 */
function pageFooter(): void
{
    $base = basePath();
    ?>
  </main>

  <footer class="site-footer">
    <div class="site-footer__inner container">
      <p>Kartendaten © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, ODbL</p>
      <nav class="site-footer__links" aria-label="Rechtliches">
        <ul>
          <li><a href="<?= h($base) ?>impressum.html">Impressum</a></li>
          <li><a href="<?= h($base) ?>datenschutz.html">Datenschutz</a></li>
        </ul>
      </nav>
      <p>Studienprojekt <span aria-hidden="true">·</span> DHBW Mannheim <span aria-hidden="true">·</span> Webprogrammierung 2026</p>
    </div>
  </footer>
</body>
</html>
<?php
}
