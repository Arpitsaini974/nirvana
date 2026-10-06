<?php
/**
 * Team Members Endpoints
 * GET    /api/members
 * GET    /api/members/all
 * GET    /api/members/:id
 * POST   /api/members
 * PUT    /api/members/:id
 * DELETE /api/members/:id
 */

require_once __DIR__ . '/../../includes/qrcode.php';

function formatMember($m) {
    if (!$m) return null;
    return [
        'id'        => (int)$m['id'],
        'member_id' => !empty($m['member_id']) ? $m['member_id'] : 'NIRVANA-' . $m['id'],
        'name'      => $m['name'],
        'role'      => $m['role'],
        'bio'       => !empty($m['bio']) ? $m['bio'] : '',
        'photo_url' => !empty($m['photo_url']) ? $m['photo_url'] : '',
        'qr_data'   => !empty($m['qr_data']) ? $m['qr_data'] : null,
        'status'    => !empty($m['status']) ? $m['status'] : 'active'
    ];
}

function handleMembersRoute($method, $pathParts) {
    $db = getDbConnection();
    $sub = isset($pathParts[0]) ? $pathParts[0] : '';

    // GET /api/members (Public active)
    if ($method === 'GET' && empty($sub)) {
        $stmt = $db->query("SELECT * FROM team_members WHERE status = 'active' ORDER BY id ASC");
        $list = $stmt->fetchAll();
        $formatted = [];

        foreach ($list as $m) {
            if (empty($m['qr_data'])) {
                try {
                    $qr = generateMemberQR($m['id']);
                    $up = $db->prepare('UPDATE team_members SET qr_data = ? WHERE id = ?');
                    $up->execute([$qr, $m['id']]);
                    $m['qr_data'] = $qr;
                } catch (Exception $e) {}
            }
            $formatted[] = formatMember($m);
        }

        jsonResponse($formatted);
    }

    // GET /api/members/all (Admin all)
    if ($method === 'GET' && $sub === 'all') {
        authenticateAdmin();
        $stmt = $db->query("SELECT * FROM team_members ORDER BY id DESC");
        $list = $stmt->fetchAll();
        $formatted = [];

        foreach ($list as $m) {
            if (empty($m['qr_data'])) {
                try {
                    $qr = generateMemberQR($m['id']);
                    $up = $db->prepare('UPDATE team_members SET qr_data = ? WHERE id = ?');
                    $up->execute([$qr, $m['id']]);
                    $m['qr_data'] = $qr;
                } catch (Exception $e) {}
            }
            $formatted[] = formatMember($m);
        }

        jsonResponse($formatted);
    }

    // GET /api/members/:id (Public single profile)
    if ($method === 'GET' && !empty($sub) && $sub !== 'all') {
        $m = null;
        if (is_numeric($sub)) {
            $stmt = $db->prepare('SELECT * FROM team_members WHERE id = ?');
            $stmt->execute([(int)$sub]);
            $m = $stmt->fetch();
        }
        if (!$m) {
            $stmt = $db->prepare('SELECT * FROM team_members WHERE member_id = ?');
            $stmt->execute([$sub]);
            $m = $stmt->fetch();
        }

        if (!$m) {
            jsonResponse(['exists' => false, 'error' => 'NIRVANA Team Member not found'], 404);
        }

        if (empty($m['qr_data'])) {
            try {
                $qr = generateMemberQR($m['id']);
                $up = $db->prepare('UPDATE team_members SET qr_data = ? WHERE id = ?');
                $up->execute([$qr, $m['id']]);
                $m['qr_data'] = $qr;
            } catch (Exception $e) {}
        }

        jsonResponse([
            'exists'    => true,
            'is_active' => ($m['status'] === 'active'),
            'member'    => formatMember($m)
        ]);
    }

    // POST /api/members (Admin add)
    if ($method === 'POST' && empty($sub)) {
        authenticateAdmin();
        $body = getJsonInput();

        $name = isset($body['name']) ? trim($body['name']) : '';
        $role = isset($body['role']) ? trim($body['role']) : '';
        $bio = isset($body['bio']) ? trim($body['bio']) : '';
        $photo_url = isset($body['photo_url']) ? trim($body['photo_url']) : '';

        if (empty($name)) {
            jsonError('Member name is required', 400);
        }
        if (empty($role)) {
            jsonError('Role / position is required', 400);
        }

        $member_id = 'NIRVANA-' . substr((string)time(), -4);

        $stmt = $db->prepare("
            INSERT INTO team_members (
                member_id, name, role, department, bio, photo_url, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$member_id, $name, $role, 'NIRVANA', $bio, $photo_url, 'active']);

        $newId = (int)$db->lastInsertId();
        $qrData = generateMemberQR($newId);

        $up = $db->prepare('UPDATE team_members SET qr_data = ? WHERE id = ?');
        $up->execute([$qrData, $newId]);

        $createdStmt = $db->prepare('SELECT * FROM team_members WHERE id = ?');
        $createdStmt->execute([$newId]);
        $created = $createdStmt->fetch();

        jsonResponse([
            'message' => 'Team member added successfully',
            'member'  => formatMember($created)
        ], 201);
    }

    // PUT /api/members/:id (Admin update)
    if ($method === 'PUT' && !empty($sub)) {
        authenticateAdmin();
        $id = (int)$sub;
        $stmt = $db->prepare('SELECT * FROM team_members WHERE id = ?');
        $stmt->execute([$id]);
        $existing = $stmt->fetch();

        if (!$existing) {
            jsonError('Team member not found', 404);
        }

        $body = getJsonInput();
        $name = isset($body['name']) ? trim($body['name']) : $existing['name'];
        $role = isset($body['role']) ? trim($body['role']) : $existing['role'];
        $bio = array_key_exists('bio', $body) ? trim($body['bio']) : $existing['bio'];
        $photo_url = array_key_exists('photo_url', $body) ? trim($body['photo_url']) : $existing['photo_url'];

        $upStmt = $db->prepare("
            UPDATE team_members SET
                name = ?,
                role = ?,
                bio = ?,
                photo_url = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        $upStmt->execute([$name, $role, $bio, $photo_url, $id]);

        if (empty($existing['qr_data'])) {
            $qrData = generateMemberQR($id);
            $upQr = $db->prepare('UPDATE team_members SET qr_data = ? WHERE id = ?');
            $upQr->execute([$qrData, $id]);
        }

        $getStmt = $db->prepare('SELECT * FROM team_members WHERE id = ?');
        $getStmt->execute([$id]);
        $updated = $getStmt->fetch();

        jsonResponse([
            'message' => 'Team member updated successfully',
            'member'  => formatMember($updated)
        ]);
    }

    // DELETE /api/members/:id (Admin delete)
    if ($method === 'DELETE' && !empty($sub)) {
        authenticateAdmin();
        $id = (int)$sub;
        $stmt = $db->prepare('SELECT * FROM team_members WHERE id = ?');
        $stmt->execute([$id]);
        $existing = $stmt->fetch();

        if (!$existing) {
            jsonError('Team member not found', 404);
        }

        $delStmt = $db->prepare('DELETE FROM team_members WHERE id = ?');
        $delStmt->execute([$id]);

        jsonResponse(['message' => 'Team member deleted successfully']);
    }

    jsonError('Route not found', 404);
}
