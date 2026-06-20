<?php
/**
 * Zkopírujte jako config.local.php a doplňte údaje z Wedos administrace.
 * Soubor config.local.php necommitujte (je v .gitignore).
 */
return [
    'db' => [
        'host' => 'mdXXX.wedos.net',
        'name' => 'dXXXXX',
        'user' => 'wXXXXX',
        'pass' => 'HESLO_Z_WEDOS',
        'charset' => 'utf8mb4',
    ],
    'base_url' => 'https://michaljanousek.cz',
    // true = admin i API bez přihlášení (jen vývoj, na produkci vypněte)
    // 'auth_optional' => true,
    'session_ttl_days' => 7,
    // Volitelný klíč pro jednorázové skripty install.php a setup-admin.php (po použití smažte skripty)
    // 'install_key' => 'vymyslete-silne-tajne-heslo',
    'upload' => [
        'dir' => __DIR__ . '/../uploads/properties',
        'url_prefix' => '/uploads/properties',
        'max_bytes' => 5 * 1024 * 1024,
    ],
];
