<?php
declare(strict_types=1);

/**
 * Jednorázový skript pro vytvoření admin účtu.
 * Použití: php create-admin.php email@domena.cz Heslo123
 * Po vytvoření účtu soubor z hostingu smažte.
 */

require __DIR__ . '/bootstrap.php';

if (PHP_SAPI !== 'cli') {
    json_error('Tento skript spusťte z příkazové řádky.', 403);
}

$email = trim((string) ($argv[1] ?? ''));
$password = (string) ($argv[2] ?? '');

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "Použití: php create-admin.php email@domena.cz Heslo\n");
    exit(1);
}

if (strlen($password) < 6) {
    fwrite(STDERR, "Heslo musí mít alespoň 6 znaků.\n");
    exit(1);
}

$pdo = get_pdo();
$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare('INSERT INTO admin_users (email, password_hash) VALUES (:email, :hash)');
try {
    $stmt->execute(['email' => $email, 'hash' => $hash]);
} catch (PDOException $e) {
    if ((int) $e->getCode() === 23000) {
        fwrite(STDERR, "Uživatel s tímto e-mailem už existuje.\n");
        exit(1);
    }
    throw $e;
}

fwrite(STDOUT, "Admin účet vytvořen: {$email}\n");
