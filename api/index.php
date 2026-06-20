<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = trim((string) ($_GET['route'] ?? ''), '/');

if ($path === '' && !empty($_SERVER['PATH_INFO'])) {
    $path = trim((string) $_SERVER['PATH_INFO'], '/');
}

if ($path === '') {
    $uri = (string) ($_SERVER['REQUEST_URI'] ?? '');
    if (preg_match('#/api/(?:index\.php/)?([^?]+)#', $uri, $matches)) {
        $path = trim($matches[1], '/');
    }
}

try {
    match (true) {
        $path === 'auth/login' && $method === 'POST' => handle_auth_login(),
        $path === 'auth/logout' && $method === 'POST' => handle_auth_logout(),
        $path === 'auth/session' && $method === 'GET' => handle_auth_session(),
        $path === 'properties' && $method === 'GET' => handle_properties_list(),
        $path === 'properties' && $method === 'POST' => handle_properties_create(),
        preg_match('#^properties/(\d+)$#', $path, $m) && $method === 'GET' => handle_properties_get((int) $m[1]),
        preg_match('#^properties/(\d+)$#', $path, $m) && $method === 'PUT' => handle_properties_update((int) $m[1]),
        preg_match('#^properties/(\d+)$#', $path, $m) && $method === 'DELETE' => handle_properties_delete((int) $m[1]),
        $path === 'reviews' && $method === 'GET' => handle_reviews_list(),
        $path === 'reviews' && $method === 'POST' => handle_reviews_create(),
        preg_match('#^reviews/(\d+)$#', $path, $m) && $method === 'PUT' => handle_reviews_update((int) $m[1]),
        preg_match('#^reviews/(\d+)$#', $path, $m) && $method === 'DELETE' => handle_reviews_delete((int) $m[1]),
        $path === 'upload' && $method === 'POST' => handle_upload(),
        $path === 'geocode' && $method === 'GET' => handle_geocode(),
        default => json_error('Endpoint nenalezen.', 404),
    };
} catch (PDOException $e) {
    json_error('Chyba databáze: ' . $e->getMessage(), 500);
}

function handle_auth_login(): void
{
    $body = read_json_body();
    $email = trim((string) ($body['email'] ?? ''));
    $password = (string) ($body['password'] ?? '');

    if ($email === '' || $password === '') {
        json_error('Zadejte e-mail a heslo.', 400);
    }

    $pdo = get_pdo();
    $stmt = $pdo->prepare('SELECT id, email, password_hash FROM admin_users WHERE email = :email LIMIT 1');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        json_error('Neplatný e-mail nebo heslo.', 401);
    }

    $session = create_session((int) $user['id']);

    json_response([
        'token' => $session['token'],
        'expires_at' => $session['expires_at'],
        'user' => ['email' => $user['email']],
    ]);
}

function handle_auth_logout(): void
{
    $token = bearer_token();
    if ($token) {
        $pdo = get_pdo();
        $stmt = $pdo->prepare('DELETE FROM admin_sessions WHERE token = :token');
        $stmt->execute(['token' => hash('sha256', $token)]);
    }

    json_response(['ok' => true]);
}

function handle_auth_session(): void
{
    $user = require_auth();
    json_response(['user' => ['email' => $user['email']]]);
}

function handle_properties_list(): void
{
    $pdo = get_pdo();
    $slug = trim((string) ($_GET['slug'] ?? ''));
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    $admin = bearer_token() !== null;

    if ($slug !== '') {
        $stmt = $pdo->prepare('SELECT * FROM properties WHERE slug = :slug LIMIT 1');
        $stmt->execute(['slug' => $slug]);
        $row = $stmt->fetch();
        if (!$row) {
            json_error('Nemovitost nenalezena.', 404);
        }
        if (!$admin && !in_array($row['status'], ['available', 'reserved', 'sold'], true)) {
            json_error('Nemovitost nenalezena.', 404);
        }
        json_response(property_row_to_api($row));
    }

    if ($id > 0) {
        $stmt = $pdo->prepare('SELECT * FROM properties WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        if (!$row) {
            json_error('Nemovitost nenalezena.', 404);
        }
        json_response(property_row_to_api($row));
    }

    if ($admin) {
        try {
            require_auth();
            $stmt = $pdo->query('SELECT * FROM properties ORDER BY title ASC');
        } catch (Throwable) {
            json_error('Neautorizováno – přihlaste se.', 401);
        }
    } else {
        $stmt = $pdo->query(
            "SELECT * FROM properties WHERE status IN ('available', 'reserved', 'sold') ORDER BY title ASC"
        );
    }

    $rows = $stmt->fetchAll();
    json_response(array_map('property_row_to_api', $rows));
}

function handle_properties_get(int $id): void
{
    $pdo = get_pdo();
    $stmt = $pdo->prepare('SELECT * FROM properties WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();

    if (!$row) {
        json_error('Nemovitost nenalezena.', 404);
    }

    json_response(property_row_to_api($row));
}

function handle_properties_create(): void
{
    require_auth();
    $payload = validate_property_payload(read_json_body(), false);
    $pdo = get_pdo();

    $stmt = $pdo->prepare(
        'INSERT INTO properties (
            slug, title, status, offer_type, property_type, price,
            location, map_lat, map_lng, map_approximate,
            area, floor, land_area, rooms, condition_text, image,
            images, description, params
        ) VALUES (
            :slug, :title, :status, :offer_type, :property_type, :price,
            :location, :map_lat, :map_lng, :map_approximate,
            :area, :floor, :land_area, :rooms, :condition_text, :image,
            :images, :description, :params
        )'
    );

    try {
        $stmt->execute([
            'slug' => $payload['slug'],
            'title' => $payload['title'],
            'status' => $payload['status'],
            'offer_type' => $payload['offer_type'],
            'property_type' => $payload['property_type'],
            'price' => $payload['price'],
            'location' => $payload['location'],
            'map_lat' => $payload['map_lat'],
            'map_lng' => $payload['map_lng'],
            'map_approximate' => $payload['map_approximate'],
            'area' => $payload['area'],
            'floor' => $payload['floor'],
            'land_area' => $payload['land_area'],
            'rooms' => $payload['rooms'],
            'condition_text' => $payload['condition_text'],
            'image' => $payload['image'],
            'images' => encode_json_column($payload['images']),
            'description' => $payload['description'],
            'params' => encode_json_column($payload['params']),
        ]);
    } catch (PDOException $e) {
        if ((int) $e->getCode() === 23000) {
            json_error('Slug už existuje – zvolte jiný odkaz.', 409);
        }
        throw $e;
    }

    $id = (int) $pdo->lastInsertId();
    handle_properties_get($id);
}

function handle_properties_update(int $id): void
{
    require_auth();
    $body = read_json_body();
    $payload = validate_property_payload($body, true);
    $pdo = get_pdo();

    $stmt = $pdo->prepare('SELECT image, images FROM properties WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $id]);
    $existing = $stmt->fetch();
    if (!$existing) {
        json_error('Nemovitost nenalezena.', 404);
    }

    $existingExtraImages = normalize_images_list($existing['images'] ?? null);

    $stmt = $pdo->prepare(
        'UPDATE properties SET
            slug = :slug, title = :title, status = :status, offer_type = :offer_type,
            property_type = :property_type, price = :price,
            location = :location, map_lat = :map_lat, map_lng = :map_lng, map_approximate = :map_approximate,
            area = :area, floor = :floor, land_area = :land_area,
            rooms = :rooms, condition_text = :condition_text, image = :image,
            images = :images, description = :description, params = :params
         WHERE id = :id'
    );

    try {
        $stmt->execute([
            'id' => $id,
            'slug' => $payload['slug'],
            'title' => $payload['title'],
            'status' => $payload['status'],
            'offer_type' => $payload['offer_type'],
            'property_type' => $payload['property_type'],
            'price' => $payload['price'],
            'location' => $payload['location'],
            'map_lat' => $payload['map_lat'],
            'map_lng' => $payload['map_lng'],
            'map_approximate' => $payload['map_approximate'],
            'area' => $payload['area'],
            'floor' => $payload['floor'],
            'land_area' => $payload['land_area'],
            'rooms' => $payload['rooms'],
            'condition_text' => $payload['condition_text'],
            'image' => $payload['image'],
            'images' => encode_json_column($payload['images']),
            'description' => $payload['description'],
            'params' => encode_json_column($payload['params']),
        ]);
    } catch (PDOException $e) {
        if ((int) $e->getCode() === 23000) {
            json_error('Slug už existuje – zvolte jiný odkaz.', 409);
        }
        throw $e;
    }

    if ($existing['image'] !== $payload['image']) {
        delete_uploaded_image($existing['image']);
    }

    delete_removed_uploaded_images($existingExtraImages, $payload['images']);

    handle_properties_get($id);
}

function handle_properties_delete(int $id): void
{
    require_auth();
    $pdo = get_pdo();

    $stmt = $pdo->prepare('SELECT image, images FROM properties WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();
    if (!$row) {
        json_error('Nemovitost nenalezena.', 404);
    }

    $stmt = $pdo->prepare('DELETE FROM properties WHERE id = :id');
    $stmt->execute(['id' => $id]);

    delete_property_uploaded_files($row['image'] ?? null, $row['images'] ?? null);

    json_response(['ok' => true]);
}

function handle_reviews_list(): void
{
    $pdo = get_pdo();
    $stmt = $pdo->query('SELECT id, text, author, created_at FROM reviews ORDER BY created_at DESC');
    json_response($stmt->fetchAll());
}

function handle_reviews_create(): void
{
    require_auth();
    $body = read_json_body();
    $text = trim((string) ($body['text'] ?? ''));
    $author = trim((string) ($body['author'] ?? ''));

    if ($text === '' || $author === '') {
        json_error('Text a autor jsou povinné.');
    }

    $pdo = get_pdo();
    $stmt = $pdo->prepare('INSERT INTO reviews (text, author) VALUES (:text, :author)');
    $stmt->execute(['text' => $text, 'author' => $author]);

    $id = (int) $pdo->lastInsertId();
    $stmt = $pdo->prepare('SELECT id, text, author, created_at FROM reviews WHERE id = :id');
    $stmt->execute(['id' => $id]);
    json_response($stmt->fetch(), 201);
}

function handle_reviews_update(int $id): void
{
    require_auth();
    $body = read_json_body();
    $text = trim((string) ($body['text'] ?? ''));
    $author = trim((string) ($body['author'] ?? ''));

    if ($text === '' || $author === '') {
        json_error('Text a autor jsou povinné.');
    }

    $pdo = get_pdo();
    $stmt = $pdo->prepare('UPDATE reviews SET text = :text, author = :author WHERE id = :id');
    $stmt->execute(['text' => $text, 'author' => $author, 'id' => $id]);

    if ($stmt->rowCount() === 0) {
        json_error('Recenze nenalezena.', 404);
    }

    $stmt = $pdo->prepare('SELECT id, text, author, created_at FROM reviews WHERE id = :id');
    $stmt->execute(['id' => $id]);
    json_response($stmt->fetch());
}

function handle_reviews_delete(int $id): void
{
    require_auth();
    $pdo = get_pdo();
    $stmt = $pdo->prepare('DELETE FROM reviews WHERE id = :id');
    $stmt->execute(['id' => $id]);

    if ($stmt->rowCount() === 0) {
        json_error('Recenze nenalezena.', 404);
    }

    json_response(['ok' => true]);
}

function handle_upload(): void
{
    global $CONFIG;

    require_auth();

    if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
        json_error('Nebyl nahrán žádný soubor.');
    }

    $file = $_FILES['file'];
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        json_error('Nahrání souboru se nezdařilo.');
    }

    $maxBytes = (int) ($CONFIG['upload']['max_bytes'] ?? 5 * 1024 * 1024);
    if (($file['size'] ?? 0) > $maxBytes) {
        json_error('Soubor je příliš velký (max. 5 MB).');
    }

    $allowed = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']) ?: '';
    if (!isset($allowed[$mime])) {
        json_error('Povolené formáty: JPEG, PNG, WebP, GIF.');
    }

    $uploadDir = rtrim((string) $CONFIG['upload']['dir'], DIRECTORY_SEPARATOR);
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
        json_error('Nelze vytvořit složku pro upload.', 500);
    }

    $filename = time() . '-' . bin2hex(random_bytes(4)) . '.' . $allowed[$mime];
    $target = $uploadDir . DIRECTORY_SEPARATOR . $filename;

    if (!move_uploaded_file($file['tmp_name'], $target)) {
        json_error('Uložení souboru se nezdařilo.', 500);
    }

    $urlPrefix = rtrim((string) ($CONFIG['upload']['url_prefix'] ?? '/uploads/properties'), '/');
    json_response(['url' => $urlPrefix . '/' . $filename]);
}

function handle_geocode(): void
{
    require_auth();

    $query = trim((string) ($_GET['q'] ?? ''));
    if ($query === '') {
        json_error('Zadejte text lokality.', 400);
    }

    $url = 'https://nominatim.openstreetmap.org/search?' . http_build_query([
        'q' => $query,
        'format' => 'jsonv2',
        'limit' => 1,
        'countrycodes' => 'cz',
    ]);

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "User-Agent: MichalJanousek-PropertyAdmin/1.0\r\nAccept: application/json\r\n",
            'timeout' => 10,
        ],
    ]);

    $response = @file_get_contents($url, false, $context);
    if ($response === false) {
        json_error('Geokódování se nezdařilo – zkuste to znovu.', 502);
    }

    $results = json_decode($response, true);
    if (!is_array($results) || count($results) === 0) {
        json_error('Místo se nepodařilo najít – upřesněte lokalitu.', 404);
    }

    $hit = $results[0];
    json_response([
        'lat' => (float) $hit['lat'],
        'lng' => (float) $hit['lon'],
        'label' => (string) ($hit['display_name'] ?? $query),
    ]);
}
