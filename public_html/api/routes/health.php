<?php
/**
 * Health Check Endpoint
 * GET /api/health
 */

function handleHealthRoute($method, $pathParts) {
    jsonResponse([
        'status'    => 'ok',
        'service'   => 'NIRVANA Club Management & Verification API (PHP/MySQL)',
        'timestamp' => date('c')
    ]);
}
