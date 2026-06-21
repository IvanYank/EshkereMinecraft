cat > bluemap/web/sql.php << 'EOF'
<?php
$host = getenv('BLUEMAP_DB_HOST') ?: 'localhost';
$port = getenv('BLUEMAP_DB_PORT') ?: '3306';
$dbname = getenv('BLUEMAP_DB_NAME') ?: 'bluemap';
$user = getenv('BLUEMAP_DB_USER') ?: 'root';
$pass = getenv('BLUEMAP_DB_PASSWORD') ?: '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    die('DB connection failed');
}

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = ltrim($path, '/');
$path = str_replace(['..', '\\', "\0"], '', $path);

if (strpos($path, 'map/') === 0) {
    $path = substr($path, 4);
}

function getMimeType($path) {
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    $mimes = ['png' => 'image/png', 'json' => 'application/json', 'js' => 'application/javascript', 'css' => 'text/css', 'html' => 'text/html'];
    return $mimes[$ext] ?? 'application/octet-stream';
}

try {
    $stmt = $pdo->prepare("SELECT data, mime_type FROM map_files WHERE path = :path");
    $stmt->execute(['path' => $path]);
    $result = $stmt->fetch();
    if ($result) {
        $data = $result['data'];
        header('Content-Type: ' . ($result['mime_type'] ?: getMimeType($path)));
        header('Content-Length: ' . strlen($data));
        echo $data;
        exit;
    }
    http_response_code(404);
    echo 'Not found';
} catch (PDOException $e) {
    http_response_code(500);
    die('DB error');
}
EOF