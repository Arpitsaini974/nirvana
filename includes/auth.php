<?php
/**
 * Authentication Middleware for Protected Admin Endpoints
 */

require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/helpers.php';

/**
 * Extract Bearer token from HTTP headers
 * Handles normal Authorization, Apache REDIRECT_HTTP_AUTHORIZATION, and getallheaders()
 * @return string|null
 */
function getBearerToken() {
    $header = null;

    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $header = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $header = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    } elseif (function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $key => $val) {
            if (strtolower($key) === 'authorization') {
                $header = trim($val);
                break;
            }
        }
    }

    if (!empty($header) && preg_match('/Bearer\s(\S+)/i', $header, $matches)) {
        return $matches[1];
    }

    return null;
}

/**
 * Authenticate Admin from Bearer Token
 * Exits with exact status codes and JSON messages matching Node.js middleware
 * @return array Decoded admin payload ['id' => ..., 'name' => ..., 'email' => ...]
 */
function authenticateAdmin() {
    $token = getBearerToken();

    if (!$token) {
        jsonError('Unauthorized: No token provided', 401);
    }

    $decoded = jwt_decode($token);
    if (!$decoded) {
        jsonError('Forbidden: Invalid or expired token', 403);
    }

    return $decoded;
}
