<?php
/**
 * Common Helper Functions for API Responses and Inputs
 */

/**
 * Send JSON response and terminate script execution
 * @param mixed $data
 * @param int $statusCode
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Send JSON error response and terminate script execution
 * @param string $message
 * @param int $statusCode
 */
function jsonError($message, $statusCode = 400) {
    jsonResponse(['error' => $message], $statusCode);
}

/**
 * Parse JSON request body
 * @return array
 */
function getJsonInput() {
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return $_POST;
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        return $_POST;
    }
    return $decoded;
}
