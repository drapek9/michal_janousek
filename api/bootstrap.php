<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

$configPath = __DIR__ . '/config.local.php';
if (!is_file($configPath)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Chybí api/config.local.php – zkopírujte config.example.php a doplňte údaje z Wedos.',
    ]);
    exit;
}

/** @var array<string, mixed> $CONFIG */
$CONFIG = require $configPath;

function json_response(mixed $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error(string $message, int $status = 400): void
{
    json_response(['error' => $message], $status);
}

function get_pdo(): PDO
{
    global $CONFIG;

    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $db = $CONFIG['db'];
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        $db['host'],
        $db['name'],
        $db['charset'] ?? 'utf8mb4'
    );

    $pdo = new PDO($dsn, $db['user'], $db['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        json_error('Neplatný JSON v těle požadavku.', 400);
    }

    return $data;
}

function bearer_token(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
        return trim($matches[1]);
    }
    return null;
}

function require_auth(): array
{
    $token = bearer_token();
    if (!$token) {
        json_error('Neautorizováno – přihlaste se.', 401);
    }

    $pdo = get_pdo();
    $stmt = $pdo->prepare(
        'SELECT u.id, u.email
         FROM admin_sessions s
         INNER JOIN admin_users u ON u.id = s.user_id
         WHERE s.token = :token AND s.expires_at > NOW()
         LIMIT 1'
    );
    $stmt->execute(['token' => hash('sha256', $token)]);
    $user = $stmt->fetch();

    if (!$user) {
        json_error('Neplatná nebo expirovaná session – přihlaste se znovu.', 401);
    }

    return $user;
}

function create_session(int $userId): array
{
    global $CONFIG;

    $token = bin2hex(random_bytes(32));
    $ttlDays = (int) ($CONFIG['session_ttl_days'] ?? 7);
    $expiresAt = (new DateTimeImmutable("+{$ttlDays} days"))->format('Y-m-d H:i:s');

    $pdo = get_pdo();
    $stmt = $pdo->prepare(
        'INSERT INTO admin_sessions (token, user_id, expires_at) VALUES (:token, :user_id, :expires_at)'
    );
    $stmt->execute([
        'token' => hash('sha256', $token),
        'user_id' => $userId,
        'expires_at' => $expiresAt,
    ]);

    return [
        'token' => $token,
        'expires_at' => $expiresAt,
    ];
}

function decode_json_column(mixed $value): mixed
{
    if ($value === null || $value === '') {
        return null;
    }

    if (is_array($value)) {
        return $value;
    }

    if (!is_string($value)) {
        return null;
    }

    $decoded = json_decode($value, true);
    return json_last_error() === JSON_ERROR_NONE ? $decoded : null;
}

function normalize_images_list(mixed $value): array
{
    if ($value === null || $value === '') {
        return [];
    }

    if (is_string($value)) {
        $decoded = decode_json_column($value);
        if (is_array($decoded)) {
            $value = $decoded;
        } else {
            $single = trim($value);
            return $single !== '' ? [$single] : [];
        }
    }

    if (!is_array($value)) {
        return [];
    }

    return array_values(array_filter(array_map(
        static fn ($item) => trim((string) $item),
        $value
    ), static fn ($item) => $item !== ''));
}

function encode_json_column(mixed $value): ?string
{
    if ($value === null) {
        return null;
    }

    return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function property_row_to_api(array $row): array
{
    $map = resolve_property_map($row);

    return [
        'id' => (int) $row['id'],
        'slug' => $row['slug'],
        'title' => $row['title'],
        'status' => $row['status'],
        'offer_type' => $row['offer_type'],
        'property_type' => $row['property_type'],
        'price' => $row['price'] !== null ? (int) $row['price'] : null,
        'location' => $row['location'],
        'map_lat' => $map['lat'] ?? null,
        'map_lng' => $map['lng'] ?? null,
        'area' => $row['area'] !== null ? (int) $row['area'] : null,
        'floor' => $row['floor'] ?? null,
        'land_area' => isset($row['land_area']) && $row['land_area'] !== null ? (int) $row['land_area'] : null,
        'rooms' => $row['rooms'],
        'condition' => $row['condition_text'],
        'image' => $row['image'],
        'images' => normalize_images_list($row['images'] ?? null),
        'description' => $row['description'],
        'location_detail' => $map,
        'params' => decode_json_column($row['params'] ?? null),
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'],
    ];
}

function resolve_property_map(array $row): ?array
{
    $lat = isset($row['map_lat']) && $row['map_lat'] !== null && $row['map_lat'] !== ''
        ? (float) $row['map_lat']
        : null;
    $lng = isset($row['map_lng']) && $row['map_lng'] !== null && $row['map_lng'] !== ''
        ? (float) $row['map_lng']
        : null;
    if ($lat === null || $lng === null) {
        $legacy = decode_json_column($row['location_detail'] ?? null);
        if (is_array($legacy) && isset($legacy['lat'], $legacy['lng'])) {
            $lat = (float) $legacy['lat'];
            $lng = (float) $legacy['lng'];
        }
    }

    if ($lat === null || $lng === null) {
        return null;
    }

    return [
        'lat' => $lat,
        'lng' => $lng,
    ];
}

function parse_map_coordinates(array $data): array
{
    $lat = $data['map_lat'] ?? null;
    $lng = $data['map_lng'] ?? null;

    if (($lat === null || $lat === '') && isset($data['location_detail']['lat'])) {
        $lat = $data['location_detail']['lat'];
    }
    if (($lng === null || $lng === '') && isset($data['location_detail']['lng'])) {
        $lng = $data['location_detail']['lng'];
    }

    if ($lat === '' || $lat === null) {
        $lat = null;
    } else {
        $lat = (float) $lat;
    }

    if ($lng === '' || $lng === null) {
        $lng = null;
    } else {
        $lng = (float) $lng;
    }

    if ($lat === null && $lng === null) {
        return [
            'map_lat' => null,
            'map_lng' => null,
            'map_approximate' => 0,
        ];
    }

    if ($lat === null || $lng === null) {
        json_error('Souřadnice mapy musí být vyplněny obě, nebo žádná.');
    }

    if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
        json_error('Neplatné souřadnice mapy.');
    }

    return [
        'map_lat' => $lat,
        'map_lng' => $lng,
        'map_approximate' => 0,
    ];
}

function slugify(string $text): string
{
    $text = strtolower(trim($text));
    $map = [
        'á' => 'a', 'č' => 'c', 'ď' => 'd', 'é' => 'e', 'ě' => 'e', 'í' => 'i',
        'ň' => 'n', 'ó' => 'o', 'ř' => 'r', 'š' => 's', 'ť' => 't', 'ú' => 'u',
        'ů' => 'u', 'ý' => 'y', 'ž' => 'z',
    ];
    $text = strtr($text, $map);
    $text = preg_replace('/[^a-z0-9]+/', '-', $text) ?? '';
    return trim($text, '-') ?: 'nemovitost';
}

function allowed_dispositions(): array
{
    $options = [];
    for ($i = 1; $i <= 11; $i++) {
        $options[] = "{$i}+kk";
        $options[] = "{$i}+1";
    }
    $options[] = '12+kk a větší';
    return $options;
}

function allowed_ownership_types(): array
{
    return ['Osobní', 'Družstevní', 'Státní/obecní', 'Jiné'];
}

function allowed_penb_classes(): array
{
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
}

function sanitize_property_params(?array $params): ?array
{
    if ($params === null) {
        return null;
    }

    unset($params['floors'], $params['parking'], $params['floor'], $params['landArea']);

    return $params ?: null;
}

function strip_amenity_params(array $params): array
{
    foreach (['balcony', 'loggia', 'terrace', 'cellar', 'garage', 'elevator', 'barrierFree'] as $key) {
        unset($params[$key]);
    }

    return $params;
}

function apply_property_type_params_rules(string $propertyType, ?array $params, ?string $rooms): array
{
    $params = $params ?? [];

    if ($propertyType === 'pozemek') {
        unset(
            $params['penb'],
            $params['disposition'],
            $params['buildingType'],
            $params['condition']
        );
        $params = strip_amenity_params($params);
        $rooms = null;

        return ['params' => $params ?: null, 'rooms' => $rooms];
    }

    if ($propertyType === 'garaz') {
        unset($params['disposition']);
        $params = strip_amenity_params($params);
        $rooms = null;

        return ['params' => $params ?: null, 'rooms' => $rooms];
    }

    if ($propertyType === 'byt') {
        // land_area se neukládá u bytu
    }

    if ($rooms !== null) {
        $params['disposition'] = $rooms;
    } else {
        unset($params['disposition']);
    }

    return ['params' => $params ?: null, 'rooms' => $rooms];
}

function validate_property_payload(array $data, bool $isUpdate = false): array
{
    $title = trim((string) ($data['title'] ?? ''));
    $slug = trim((string) ($data['slug'] ?? ''));
    $location = trim((string) ($data['location'] ?? ''));
    $image = trim((string) ($data['image'] ?? ''));

    if (!$isUpdate || array_key_exists('title', $data)) {
        if ($title === '') {
            json_error('Název je povinný.');
        }
    }

    if ($slug === '' && $title !== '') {
        $slug = slugify($title);
    }

    if (!$isUpdate || array_key_exists('slug', $data)) {
        if ($slug === '') {
            json_error('Slug / odkaz je povinný.');
        }
        if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
            json_error('Slug smí obsahovat jen malá písmena, číslice a pomlčky.');
        }
    }

    if (!$isUpdate || array_key_exists('location', $data)) {
        if ($location === '') {
            json_error('Lokalita je povinná.');
        }
    }

    if (!$isUpdate || array_key_exists('image', $data)) {
        if ($image === '') {
            json_error('Obrázek je povinný.');
        }
    }

    $status = (string) ($data['status'] ?? 'available');
    if (!in_array($status, ['available', 'reserved', 'sold'], true)) {
        json_error('Neplatný stav nemovitosti.');
    }

    $offerType = (string) ($data['offer_type'] ?? 'prodej');
    if (!in_array($offerType, ['prodej', 'pronajem'], true)) {
        json_error('Neplatný typ nabídky.');
    }

    $propertyType = (string) ($data['property_type'] ?? 'byt');
    if (!in_array($propertyType, ['byt', 'dum', 'chata', 'pozemek', 'komercni', 'garaz'], true)) {
        json_error('Neplatný typ nemovitosti.');
    }

    $price = $data['price'] ?? null;
    if ($price === '' || $price === null) {
        $price = null;
    } else {
        $price = (int) $price;
        if ($price < 0) {
            json_error('Cena musí být nezáporná.');
        }
    }

    $images = $data['images'] ?? [];
    if (!is_array($images)) {
        json_error('Pole images musí být pole URL.');
    }
    $images = normalize_images_list($images);

    foreach (['location_detail', 'params'] as $jsonField) {
        if (isset($data[$jsonField]) && $data[$jsonField] !== null && !is_array($data[$jsonField])) {
            json_error("Pole {$jsonField} musí být objekt.");
        }
    }

    $rooms = trim((string) ($data['rooms'] ?? '')) ?: null;
    if ($rooms !== null && strlen($rooms) > 50) {
        json_error('Dispozice je příliš dlouhá.');
    }

    $params = sanitize_property_params($data['params'] ?? null) ?? [];
    if (!is_array($params)) {
        $params = [];
    }

    $ownership = trim((string) ($params['ownership'] ?? ''));
    if ($ownership !== '' && !in_array($ownership, allowed_ownership_types(), true)) {
        json_error('Neplatný typ vlastnictví.');
    }
    if ($ownership === '') {
        unset($params['ownership']);
    } else {
        $params['ownership'] = $ownership;
    }

    if ($propertyType !== 'pozemek') {
        $penb = strtoupper(trim((string) ($params['penb'] ?? '')));
        if ($penb === '') {
            json_error('PENB je povinné.');
        }
        if (!in_array($penb, allowed_penb_classes(), true)) {
            json_error('Neplatná třída PENB.');
        }
        $params['penb'] = $penb;
    } else {
        unset($params['penb']);
    }

    $floor = trim((string) ($data['floor'] ?? $params['floor'] ?? '')) ?: null;
    $landArea = null;
    if (isset($data['land_area']) && $data['land_area'] !== '' && $data['land_area'] !== null) {
        $landArea = (int) $data['land_area'];
    } elseif (isset($params['landArea']) && $params['landArea'] !== '' && $params['landArea'] !== null) {
        $landArea = (int) $params['landArea'];
    }

    if ($propertyType === 'byt') {
        $landArea = null;
    } elseif ($propertyType === 'dum' || $propertyType === 'chata') {
        $floor = null;
    } else {
        $floor = null;
        $landArea = null;
    }

    if ($landArea !== null && $landArea < 0) {
        json_error('Plocha pozemku musí být nezáporná.');
    }

    $typeRules = apply_property_type_params_rules($propertyType, $params, $rooms);
    $params = $typeRules['params'];
    $rooms = $typeRules['rooms'];

    $map = parse_map_coordinates($data);

    return [
        'slug' => $slug,
        'title' => $title,
        'status' => $status,
        'offer_type' => $offerType,
        'property_type' => $propertyType,
        'price' => $price,
        'location' => $location,
        'map_lat' => $map['map_lat'],
        'map_lng' => $map['map_lng'],
        'map_approximate' => $map['map_approximate'],
        'area' => isset($data['area']) && $data['area'] !== '' ? (int) $data['area'] : null,
        'floor' => $floor,
        'land_area' => $landArea,
        'rooms' => $rooms,
        'condition_text' => $propertyType === 'pozemek'
            ? null
            : (trim((string) ($data['condition'] ?? '')) ?: null),
        'image' => $image,
        'images' => $images,
        'description' => trim((string) ($data['description'] ?? '')) ?: null,
        'params' => $params,
    ];
}

function delete_uploaded_image(?string $imageUrl): void
{
    global $CONFIG;

    $prefix = rtrim((string) ($CONFIG['upload']['url_prefix'] ?? '/uploads/properties'), '/');
    if (!$imageUrl || !str_starts_with($imageUrl, $prefix . '/')) {
        return;
    }

    $filename = basename(parse_url($imageUrl, PHP_URL_PATH) ?: '');
    if ($filename === '') {
        return;
    }

    $path = rtrim((string) $CONFIG['upload']['dir'], DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $filename;
    if (is_file($path)) {
        @unlink($path);
    }
}

function delete_uploaded_images(array $imageUrls): void
{
    foreach ($imageUrls as $url) {
        delete_uploaded_image(is_string($url) ? $url : null);
    }
}

function delete_removed_uploaded_images(array $previous, array $next): void
{
    $keep = array_flip($next);
    foreach ($previous as $url) {
        if (!isset($keep[$url])) {
            delete_uploaded_image($url);
        }
    }
}

function delete_property_uploaded_files(?string $mainImage, mixed $extraImages): void
{
    $urls = normalize_images_list($extraImages);
    if ($mainImage !== null && $mainImage !== '') {
        $urls[] = $mainImage;
    }

    delete_uploaded_images(array_values(array_unique($urls)));
}
