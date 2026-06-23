<?php
declare(strict_types=1);

require __DIR__ . '/api/bootstrap.php';

header('Content-Type: application/xml; charset=utf-8');

$base = 'https://michaljanousek.cz';
$today = (new DateTimeImmutable('today'))->format('Y-m-d');

$staticPages = [
    ['loc' => '/', 'changefreq' => 'weekly', 'priority' => '0.9'],
    ['loc' => '/odhad-zdarma.html', 'changefreq' => 'weekly', 'priority' => '1.0'],
    ['loc' => '/o-mne.html', 'changefreq' => 'monthly', 'priority' => '0.8'],
    ['loc' => '/sluzby.html', 'changefreq' => 'monthly', 'priority' => '0.8'],
    ['loc' => '/nemovitosti.html', 'changefreq' => 'daily', 'priority' => '0.9'],
    ['loc' => '/reference.html', 'changefreq' => 'monthly', 'priority' => '0.7'],
    ['loc' => '/kontakt.html', 'changefreq' => 'monthly', 'priority' => '0.8'],
    ['loc' => '/ochrana-osobnich-udaju.html', 'changefreq' => 'yearly', 'priority' => '0.3'],
    ['loc' => '/cookies.html', 'changefreq' => 'yearly', 'priority' => '0.3'],
];

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

foreach ($staticPages as $page) {
    echo "  <url>\n";
    echo '    <loc>' . htmlspecialchars($base . $page['loc'], ENT_XML1) . "</loc>\n";
    echo "    <lastmod>{$today}</lastmod>\n";
    echo "    <changefreq>{$page['changefreq']}</changefreq>\n";
    echo "    <priority>{$page['priority']}</priority>\n";
    echo "  </url>\n";
}

try {
    $pdo = get_pdo();
    $stmt = $pdo->query(
        "SELECT slug, updated_at FROM properties WHERE status IN ('available', 'reserved', 'sold') ORDER BY updated_at DESC"
    );

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $slug = rawurlencode((string) $row['slug']);
        $lastmod = !empty($row['updated_at'])
            ? (new DateTimeImmutable((string) $row['updated_at']))->format('Y-m-d')
            : $today;

        echo "  <url>\n";
        echo '    <loc>' . htmlspecialchars("{$base}/nemovitost.html?slug={$slug}", ENT_XML1) . "</loc>\n";
        echo "    <lastmod>{$lastmod}</lastmod>\n";
        echo "    <changefreq>weekly</changefreq>\n";
        echo "    <priority>0.7</priority>\n";
        echo "  </url>\n";
    }
} catch (Throwable $e) {
    // Statické stránky zůstanou v sitemapě i bez DB.
}

echo "</urlset>\n";
