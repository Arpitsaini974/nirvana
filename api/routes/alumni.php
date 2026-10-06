<?php
/**
 * Alumni Endpoints
 * GET    /api/alumni
 * GET    /api/alumni/all
 * GET    /api/alumni/:id
 * POST   /api/alumni
 * PUT    /api/alumni/:id
 * DELETE /api/alumni/:id
 */

require_once __DIR__ . '/../../includes/qrcode.php';

function formatAlumni($a) {
    if (!$a) return null;
    $timeSpan = !empty($a['time_span']) ? $a['time_span'] : (!empty($a['batch']) ? $a['batch'] : '');
    $role = !empty($a['previous_role']) ? $a['previous_role'] : (!empty($a['current_role']) ? $a['current_role'] : '');

    return [
        'id'               => (int)$a['id'],
        'name'             => $a['name'],
        'admission_number' => !empty($a['admission_number']) ? $a['admission_number'] : '',
        'email'            => !empty($a['email']) ? $a['email'] : '',
        'time_span'        => $timeSpan,
        'role'             => $role,
        'bio'              => !empty($a['bio']) ? $a['bio'] : '',
        'photo_url'        => !empty($a['photo_url']) ? $a['photo_url'] : '',
        'qr_data'          => !empty($a['qr_data']) ? $a['qr_data'] : null,
        'status'           => !empty($a['status']) ? $a['status'] : 'active'
    ];
}

function handleAlumniRoute($method, $pathParts) {
    $db = getDbConnection();
    $sub = isset($pathParts[0]) ? $pathParts[0] : '';

    // GET /api/alumni (Public active)
    if ($method === 'GET' && empty($sub)) {
        $stmt = $db->query("SELECT * FROM alumni WHERE status = 'active' ORDER BY id ASC");
        $list = $stmt->fetchAll();
        $formatted = [];

        foreach ($list as $a) {
            if (empty($a['qr_data'])) {
                try {
                    $qr = generateAlumniQR($a['id']);
                    $up = $db->prepare('UPDATE alumni SET qr_data = ? WHERE id = ?');
                    $up->execute([$qr, $a['id']]);
                    $a['qr_data'] = $qr;
                } catch (Exception $e) {}
            }
            $formatted[] = formatAlumni($a);
        }

        jsonResponse($formatted);
    }

    // GET /api/alumni/all (Admin all)
    if ($method === 'GET' && $sub === 'all') {
        authenticateAdmin();
        $stmt = $db->query("SELECT * FROM alumni ORDER BY id DESC");
        $list = $stmt->fetchAll();
        $formatted = [];

        foreach ($list as $a) {
            if (empty($a['qr_data'])) {
                try {
                    $qr = generateAlumniQR($a['id']);
                    $up = $db->prepare('UPDATE alumni SET qr_data = ? WHERE id = ?');
                    $up->execute([$qr, $a['id']]);
                    $a['qr_data'] = $qr;
                } catch (Exception $e) {}
            }
            $formatted[] = formatAlumni($a);
        }

        jsonResponse($formatted);
    }

    // GET /api/alumni/:id (Public single)
    if ($method === 'GET' && !empty($sub) && $sub !== 'all') {
        $id = (int)$sub;
        $stmt = $db->prepare('SELECT * FROM alumni WHERE id = ?');
        $stmt->execute([$id]);
        $a = $stmt->fetch();

        if (!$a) {
            jsonError('Alumni not found', 404);
        }

        if (empty($a['qr_data'])) {
            try {
                $qr = generateAlumniQR($a['id']);
                $up = $db->prepare('UPDATE alumni SET qr_data = ? WHERE id = ?');
                $up->execute([$qr, $a['id']]);
                $a['qr_data'] = $qr;
            } catch (Exception $e) {}
        }

        jsonResponse(['alumni' => formatAlumni($a)]);
    }

    // POST /api/alumni (Admin add)
    if ($method === 'POST' && empty($sub)) {
        authenticateAdmin();
        $body = getJsonInput();

        $name = isset($body['name']) ? trim($body['name']) : '';
        if (empty($name)) {
            jsonError('Alumni name is required', 400);
        }

        $role = !empty($body['role']) ? trim($body['role']) : 'NIRVANA Alumni';
        $admNo = !empty($body['admission_number']) ? trim($body['admission_number']) : 'U20' . substr((string)time(), -3);
        $userEmail = !empty($body['email']) ? trim($body['email']) : strtolower(preg_replace('/\s+/', '.', $name)) . '@alumni.svnit.ac.in';
        $span = !empty($body['time_span']) ? trim($body['time_span']) : '2020 – 2024';
        $bio = !empty($body['bio']) ? trim($body['bio']) : '';
        $photo_url = !empty($body['photo_url']) ? trim($body['photo_url']) : '';

        $stmt = $db->prepare("
            INSERT INTO alumni (
                name, admission_number, email, time_span, previous_role, current_role, batch, bio, photo_url, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$name, $admNo, $userEmail, $span, $role, $role, $span, $bio, $photo_url, 'active']);

        $newId = (int)$db->lastInsertId();
        $qrData = generateAlumniQR($newId);

        $up = $db->prepare('UPDATE alumni SET qr_data = ? WHERE id = ?');
        $up->execute([$qrData, $newId]);

        $getStmt = $db->prepare('SELECT * FROM alumni WHERE id = ?');
        $getStmt->execute([$newId]);
        $created = $getStmt->fetch();

        jsonResponse([
            'message' => 'Alumni profile created successfully',
            'alumni'  => formatAlumni($created)
        ], 201);
    }

    // PUT /api/alumni/:id (Admin update)
    if ($method === 'PUT' && !empty($sub)) {
        authenticateAdmin();
        $id = (int)$sub;
        $stmt = $db->prepare('SELECT * FROM alumni WHERE id = ?');
        $stmt->execute([$id]);
        $existing = $stmt->fetch();

        if (!$existing) {
            jsonError('Alumni not found', 404);
        }

        $body = getJsonInput();
        $name = isset($body['name']) ? trim($body['name']) : $existing['name'];
        $admNo = array_key_exists('admission_number', $body) ? trim($body['admission_number']) : $existing['admission_number'];
        $email = array_key_exists('email', $body) ? trim($body['email']) : $existing['email'];
        $span = array_key_exists('time_span', $body) ? trim($body['time_span']) : ($existing['time_span'] ?: $existing['batch']);
        $role = array_key_exists('role', $body) ? trim($body['role']) : ($existing['previous_role'] ?: $existing['current_role']);
        $bio = array_key_exists('bio', $body) ? trim($body['bio']) : $existing['bio'];
        $photo_url = array_key_exists('photo_url', $body) ? trim($body['photo_url']) : $existing['photo_url'];

        $upStmt = $db->prepare("
            UPDATE alumni SET
                name = ?,
                admission_number = ?,
                email = ?,
                time_span = ?,
                previous_role = ?,
                current_role = ?,
                batch = ?,
                bio = ?,
                photo_url = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        $upStmt->execute([$name, $admNo, $email, $span, $role, $role, $span, $bio, $photo_url, $id]);

        if (empty($existing['qr_data'])) {
            $qrData = generateAlumniQR($id);
            $upQr = $db->prepare('UPDATE alumni SET qr_data = ? WHERE id = ?');
            $upQr->execute([$qrData, $id]);
        }

        $getStmt = $db->prepare('SELECT * FROM alumni WHERE id = ?');
        $getStmt->execute([$id]);
        $updated = $getStmt->fetch();

        jsonResponse([
            'message' => 'Alumni updated successfully',
            'alumni'  => formatAlumni($updated)
        ]);
    }

    // DELETE /api/alumni/:id (Admin delete)
    if ($method === 'DELETE' && !empty($sub)) {
        authenticateAdmin();
        $id = (int)$sub;
        $stmt = $db->prepare('SELECT * FROM alumni WHERE id = ?');
        $stmt->execute([$id]);
        $existing = $stmt->fetch();

        if (!$existing) {
            jsonError('Alumni not found', 404);
        }

        $delStmt = $db->prepare('DELETE FROM alumni WHERE id = ?');
        $delStmt->execute([$id]);

        jsonResponse(['message' => 'Alumni profile deleted successfully']);
    }

    jsonError('Route not found', 404);
}
