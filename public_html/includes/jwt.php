<?php
/**
 * JWT (JSON Web Token) Implementation in Pure PHP
 * Compatible with Node.js jsonwebtoken (HS256)
 */

define('JWT_SECRET', getenv('JWT_SECRET') ?: 'club-secret-key-2026-very-secure');

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4 ? strlen($data) + 4 - strlen($data) % 4 : strlen($data), '=', STR_PAD_RIGHT));
}

/**
 * Encode payload into a JWT
 * @param array $payload
 * @param string $secret
 * @param int $expiresInSeconds (default 7 days = 604800s)
 * @return string
 */
function jwt_encode($payload, $secret = JWT_SECRET, $expiresInSeconds = 604800) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $now = time();
    $payload['iat'] = $now;
    if ($expiresInSeconds > 0) {
        $payload['exp'] = $now + $expiresInSeconds;
    }

    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode(json_encode($payload));

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = base64UrlEncode($signature);

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

/**
 * Decode and verify JWT
 * @param string $jwt
 * @param string $secret
 * @return array|false Returns decoded payload array or false if invalid/expired
 */
function jwt_decode($jwt, $secret = JWT_SECRET) {
    if (empty($jwt)) return false;

    $parts = explode('.', $jwt);
    if (count($parts) !== 3) return false;

    [$header64, $payload64, $sig64] = $parts;

    $signature = base64UrlDecode($sig64);
    $expectedSig = hash_hmac('sha256', $header64 . "." . $payload64, $secret, true);

    if (!hash_equals($expectedSig, $signature)) {
        return false;
    }

    $payload = json_decode(base64UrlDecode($payload64), true);
    if (!is_array($payload)) {
        return false;
    }

    // Check expiration if present
    if (isset($payload['exp']) && time() >= $payload['exp']) {
        return false; // Expired
    }

    return $payload;
}
