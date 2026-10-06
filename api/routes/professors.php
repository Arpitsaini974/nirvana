<?php
/**
 * Professors / Faculty Advisory Endpoints
 * GET    /api/professors
 * GET    /api/professors/:id
 * POST   /api/professors
 * PUT    /api/professors/:id
 * DELETE /api/professors/:id
 */

function handleProfessorsRoute($method, $pathParts) {
    $db = getDbConnection();
    $sub = isset($pathParts[0]) ? $pathParts[0] : '';

    // GET /api/professors (Public list)
    if ($method === 'GET' && empty($sub)) {
        $stmt = $db->query("SELECT id, name, role, bio, photo_url FROM professors ORDER BY display_order ASC, id ASC");
        $list = $stmt->fetchAll();
        $formatted = array_map(function($p) {
            return [
                'id'        => (int)$p['id'],
                'name'      => $p['name'],
                'role'      => $p['role'],
                'bio'       => !empty($p['bio']) ? $p['bio'] : '',
                'photo_url' => !empty($p['photo_url']) ? $p['photo_url'] : ''
            ];
        }, $list);

        jsonResponse($formatted);
    }

    // GET /api/professors/:id (Public single)
    if ($method === 'GET' && !empty($sub)) {
        $id = (int)$sub;
        $stmt = $db->prepare("SELECT id, name, role, bio, photo_url FROM professors WHERE id = ?");
        $stmt->execute([$id]);
        $p = $stmt->fetch();

        if (!$p) {
            jsonError('Professor not found', 404);
        }

        jsonResponse([
            'id'        => (int)$p['id'],
            'name'      => $p['name'],
            'role'      => $p['role'],
            'bio'       => !empty($p['bio']) ? $p['bio'] : '',
            'photo_url' => !empty($p['photo_url']) ? $p['photo_url'] : ''
        ]);
    }

    // POST /api/professors (Admin add)
    if ($method === 'POST' && empty($sub)) {
        authenticateAdmin();
        $body = getJsonInput();

        $name = isset($body['name']) ? trim($body['name']) : '';
        $role = isset($body['role']) ? trim($body['role']) : '';
        $bio = isset($body['bio']) ? trim($body['bio']) : '';
        $photo_url = isset($body['photo_url']) ? trim($body['photo_url']) : '';

        if (empty($name)) {
            jsonError('Professor name is required', 400);
        }
        if (empty($role)) {
            jsonError('Role / position is required', 400);
        }

        $stmt = $db->prepare("INSERT INTO professors (name, role, bio, photo_url) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $role, $bio, $photo_url]);

        $newId = (int)$db->lastInsertId();
        $getStmt = $db->prepare("SELECT id, name, role, bio, photo_url FROM professors WHERE id = ?");
        $getStmt->execute([$newId]);
        $created = $getStmt->fetch();

        jsonResponse([
            'message'   => 'Professor added successfully',
            'professor' => [
                'id'        => (int)$created['id'],
                'name'      => $created['name'],
                'role'      => $created['role'],
                'bio'       => !empty($created['bio']) ? $created['bio'] : '',
                'photo_url' => !empty($created['photo_url']) ? $created['photo_url'] : ''
            ]
        ], 201);
    }

    // PUT /api/professors/:id (Admin update)
    if ($method === 'PUT' && !empty($sub)) {
        authenticateAdmin();
        $id = (int)$sub;
        $stmt = $db->prepare("SELECT * FROM professors WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();

        if (!$existing) {
            jsonError('Professor not found', 404);
        }

        $body = getJsonInput();
        $name = isset($body['name']) ? trim($body['name']) : $existing['name'];
        $role = isset($body['role']) ? trim($body['role']) : $existing['role'];
        $bio = array_key_exists('bio', $body) ? trim($body['bio']) : $existing['bio'];
        $photo_url = array_key_exists('photo_url', $body) ? trim($body['photo_url']) : $existing['photo_url'];

        $upStmt = $db->prepare("
            UPDATE professors SET
                name = ?,
                role = ?,
                bio = ?,
                photo_url = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        $upStmt->execute([$name, $role, $bio, $photo_url, $id]);

        $getStmt = $db->prepare("SELECT id, name, role, bio, photo_url FROM professors WHERE id = ?");
        $getStmt->execute([$id]);
        $updated = $getStmt->fetch();

        jsonResponse([
            'message'   => 'Professor updated successfully',
            'professor' => [
                'id'        => (int)$updated['id'],
                'name'      => $updated['name'],
                'role'      => $updated['role'],
                'bio'       => !empty($updated['bio']) ? $updated['bio'] : '',
                'photo_url' => !empty($updated['photo_url']) ? $updated['photo_url'] : ''
            ]
        ]);
    }

    // DELETE /api/professors/:id (Admin delete)
    if ($method === 'DELETE' && !empty($sub)) {
        authenticateAdmin();
        $id = (int)$sub;
        $stmt = $db->prepare("SELECT * FROM professors WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();

        if (!$existing) {
            jsonError('Professor not found', 404);
        }

        $delStmt = $db->prepare("DELETE FROM professors WHERE id = ?");
        $delStmt->execute([$id]);

        jsonResponse(['message' => 'Professor removed successfully']);
    }

    jsonError('Route not found', 404);
}
