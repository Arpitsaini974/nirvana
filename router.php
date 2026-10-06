<?php
/**
 * Local Development Router for PHP built-in server (php -S localhost:8000 router.php)
 * Simulates Hostinger Apache .htaccess behavior
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// 1. API calls
if (strpos($uri, '/api') === 0) {
    require __DIR__ . '/api/index.php';
    return;
}

// 2. Static uploads
if (strpos($uri, '/uploads/') === 0) {
    $filePath = __DIR__ . $uri;
    if (file_exists($filePath)) {
        return false; // serve directly
    }
}

// 3. Client dist files
$clientDist = __DIR__ . '/client/dist';
if (file_exists($clientDist . $uri) && is_file($clientDist . $uri)) {
    return false; // serve directly
}

// 4. Client SPA fallback
if (file_exists($clientDist . '/index.html')) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($clientDist . '/index.html');
    return;
}

return false;
