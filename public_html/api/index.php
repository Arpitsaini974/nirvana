<?php
/**
 * NIRVANA Web Platform & Club Management System
 * PHP API Front Controller
 * 
 * Works out-of-the-box on Apache / Hostinger Shared Hosting with .htaccess
 */

// Error reporting: Log to server log, never output HTML errors to API clients
error_reporting(E_ALL);
ini_set('display_errors', '0');

header('Connection: close');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/cors.php';
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../includes/jwt.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/qrcode.php';

// Route Handlers
require_once __DIR__ . '/routes/auth.php';
require_once __DIR__ . '/routes/members.php';
require_once __DIR__ . '/routes/alumni.php';
require_once __DIR__ . '/routes/professors.php';
require_once __DIR__ . '/routes/settings.php';
require_once __DIR__ . '/routes/media.php';
require_once __DIR__ . '/routes/messages.php';
require_once __DIR__ . '/routes/events.php';
require_once __DIR__ . '/routes/certificates.php';
require_once __DIR__ . '/routes/stats.php';
require_once __DIR__ . '/routes/health.php';

// Handle CORS
handleCors();

// Extract HTTP Method (handle spoofed methods if any)
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $method = strtoupper($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
}

// Parse Request Path
$uri = $_SERVER['REQUEST_URI'];
$cleanUri = parse_url($uri, PHP_URL_PATH);

// If running in subfolder or root, extract the portion after /api/
$apiPrefixPos = strpos($cleanUri, '/api');
if ($apiPrefixPos !== false) {
    $path = substr($cleanUri, $apiPrefixPos + 4); // Strip '/api'
} else {
    $path = $cleanUri;
}

$path = trim($path, '/');
$parts = empty($path) ? [] : explode('/', $path);

$resource = isset($parts[0]) ? strtolower($parts[0]) : '';
$subparts = array_slice($parts, 1);

try {
    switch ($resource) {
        case 'auth':
            handleAuthRoute($method, $subparts);
            break;

        case 'members':
            handleMembersRoute($method, $subparts);
            break;

        case 'alumni':
            handleAlumniRoute($method, $subparts);
            break;

        case 'professors':
            handleProfessorsRoute($method, $subparts);
            break;

        case 'settings':
            handleSettingsRoute($method, $subparts);
            break;

        case 'media':
            handleMediaRoute($method, $subparts);
            break;

        case 'messages':
            handleMessagesRoute($method, $subparts);
            break;

        case 'events':
            handleEventsRoute($method, $subparts);
            break;

        case 'certificates':
            handleCertificatesRoute($method, $subparts);
            break;

        case 'stats':
            handleStatsRoute($method, $subparts);
            break;

        case 'health':
            handleHealthRoute($method, $subparts);
            break;

        default:
            jsonError("API route '/api/$path' not found", 404);
            break;
    }
} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
    jsonError('An unexpected internal error occurred', 500);
}
