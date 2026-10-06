<?php
/**
 * Certificates Endpoints
 * GET    /api/certificates
 * GET    /api/certificates/all
 * GET    /api/certificates/types
 * GET    /api/certificates/:id
 * POST   /api/certificates
 * PUT    /api/certificates/:id
 * DELETE /api/certificates/:id
 */

function handleCertificatesRoute($method, $pathParts) {
    $db = getDbConnection();
    $sub = isset($pathParts[0]) ? $pathParts[0] : '';

    // GET /api/certificates/types (Public distinct types)
    if ($method === 'GET' && $sub === 'types') {
        $stmt = $db->query("SELECT DISTINCT certificate_type FROM certificates WHERE certificate_type IS NOT NULL ORDER BY certificate_type ASC");
        $rows = $stmt->fetchAll();
        $types = array_map(fn($r) => $r['certificate_type'], $rows);
        jsonResponse($types);
    }

    // GET /api/certificates/all (Admin all)
    if ($method === 'GET' && $sub === 'all') {
        authenticateAdmin();
        $stmt = $db->query("
            SELECT c.*,
                   m.name as member_name, m.member_id as member_code,
                   a.name as alumni_name, a.batch as alumni_batch
            FROM certificates c
            LEFT JOIN team_members m ON c.team_member_id = m.id
            LEFT JOIN alumni a ON c.alumni_id = a.id
            ORDER BY c.id DESC
        ");
        $certs = $stmt->fetchAll();
        jsonResponse($certs);
    }

    // GET /api/certificates (Public with search & filters)
    if ($method === 'GET' && empty($sub)) {
        $search         = isset($_GET['search']) ? trim($_GET['search']) : '';
        $type           = isset($_GET['type']) ? trim($_GET['type']) : '';
        $recipient_type = isset($_GET['recipient_type']) ? trim($_GET['recipient_type']) : '';

        $query = "
            SELECT c.*,
                   m.name as member_name, m.member_id as member_code,
                   a.name as alumni_name, a.batch as alumni_batch
            FROM certificates c
            LEFT JOIN team_members m ON c.team_member_id = m.id
            LEFT JOIN alumni a ON c.alumni_id = a.id
            WHERE c.is_public = 1
        ";
        $params = [];

        if (!empty($search)) {
            $query .= " AND (c.title LIKE ? OR c.recipient_name LIKE ? OR c.verification_id LIKE ? OR c.description LIKE ?)";
            $term = "%$search%";
            $params = array_merge($params, [$term, $term, $term, $term]);
        }

        if (!empty($type) && $type !== 'all') {
            $query .= " AND c.certificate_type = ?";
            $params[] = $type;
        }

        if (!empty($recipient_type) && $recipient_type !== 'all') {
            $query .= " AND c.recipient_type = ?";
            $params[] = $recipient_type;
        }

        $query .= " ORDER BY c.issue_date DESC, c.id DESC";

        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $certs = $stmt->fetchAll();

        jsonResponse($certs);
    }

    // GET /api/certificates/:id (Public or admin single)
    if ($method === 'GET' && !empty($sub) && $sub !== 'types' && $sub !== 'all') {
        $stmt = $db->prepare("
            SELECT c.*,
                   m.name as member_name, m.member_id as member_code,
                   a.name as alumni_name, a.batch as alumni_batch
            FROM certificates c
            LEFT JOIN team_members m ON c.team_member_id = m.id
            LEFT JOIN alumni a ON c.alumni_id = a.id
            WHERE c.id = ?
        ");
        $stmt->execute([(int)$sub]);
        $cert = $stmt->fetch();

        if (!$cert) {
            jsonError('Certificate not found', 404);
        }

        jsonResponse($cert);
    }

    // POST /api/certificates (Admin add)
    if ($method === 'POST' && empty($sub)) {
        authenticateAdmin();
        $body = getJsonInput();

        $title          = isset($body['title']) ? trim($body['title']) : '';
        $recipient_name = isset($body['recipient_name']) ? trim($body['recipient_name']) : '';
        $file_url       = isset($body['file_url']) ? trim($body['file_url']) : '';

        if (empty($title) || empty($recipient_name) || empty($file_url)) {
            jsonError('Title, recipient name, and certificate file/image URL are required', 400);
        }

        $recipient_type   = !empty($body['recipient_type']) ? $body['recipient_type'] : 'team_member';
        $team_member_id   = !empty($body['team_member_id']) ? (int)$body['team_member_id'] : null;
        $alumni_id        = !empty($body['alumni_id']) ? (int)$body['alumni_id'] : null;
        $certificate_type = !empty($body['certificate_type']) ? $body['certificate_type'] : 'Achievement';
        $issue_date       = !empty($body['issue_date']) ? $body['issue_date'] : date('Y-m-d');
        $description      = isset($body['description']) ? $body['description'] : '';
        $is_public        = isset($body['is_public']) ? ($body['is_public'] ? 1 : 0) : 1;

        $verification_id = !empty($body['verification_id']) ? strtoupper(trim($body['verification_id'])) : 'CERT-ARC-' . date('Y') . '-' . random_int(1000, 9999);

        $stmt = $db->prepare("
            INSERT INTO certificates (
                title, recipient_name, recipient_type, team_member_id, alumni_id,
                certificate_type, issue_date, description, file_url, verification_id, is_public
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $title, $recipient_name, $recipient_type, $team_member_id, $alumni_id,
            $certificate_type, $issue_date, $description, $file_url, $verification_id, $is_public
        ]);

        $newId = (int)$db->lastInsertId();
        $getStmt = $db->prepare("SELECT * FROM certificates WHERE id = ?");
        $getStmt->execute([$newId]);
        $created = $getStmt->fetch();

        jsonResponse([
            'message'     => 'Certificate created successfully',
            'certificate' => $created
        ], 201);
    }

    // PUT /api/certificates/:id (Admin update)
    if ($method === 'PUT' && !empty($sub)) {
        authenticateAdmin();
        $id = (int)$sub;
        $stmt = $db->prepare("SELECT * FROM certificates WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();

        if (!$existing) {
            jsonError('Certificate not found', 404);
        }

        $body = getJsonInput();
        $title          = isset($body['title']) ? trim($body['title']) : $existing['title'];
        $recipient_name = isset($body['recipient_name']) ? trim($body['recipient_name']) : $existing['recipient_name'];
        $recipient_type = isset($body['recipient_type']) ? $body['recipient_type'] : $existing['recipient_type'];
        $team_member_id = array_key_exists('team_member_id', $body) ? (!empty($body['team_member_id']) ? (int)$body['team_member_id'] : null) : $existing['team_member_id'];
        $alumni_id      = array_key_exists('alumni_id', $body) ? (!empty($body['alumni_id']) ? (int)$body['alumni_id'] : null) : $existing['alumni_id'];
        $certificate_type = isset($body['certificate_type']) ? $body['certificate_type'] : $existing['certificate_type'];
        $issue_date     = isset($body['issue_date']) ? $body['issue_date'] : $existing['issue_date'];
        $description    = array_key_exists('description', $body) ? $body['description'] : $existing['description'];
        $file_url       = isset($body['file_url']) ? trim($body['file_url']) : $existing['file_url'];
        $verification_id = !empty($body['verification_id']) ? strtoupper(trim($body['verification_id'])) : $existing['verification_id'];
        $is_public      = array_key_exists('is_public', $body) ? ($body['is_public'] ? 1 : 0) : $existing['is_public'];

        $upStmt = $db->prepare("
            UPDATE certificates SET
                title = ?,
                recipient_name = ?,
                recipient_type = ?,
                team_member_id = ?,
                alumni_id = ?,
                certificate_type = ?,
                issue_date = ?,
                description = ?,
                file_url = ?,
                verification_id = ?,
                is_public = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");

        $upStmt->execute([
            $title, $recipient_name, $recipient_type, $team_member_id, $alumni_id,
            $certificate_type, $issue_date, $description, $file_url, $verification_id, $is_public,
            $id
        ]);

        $getStmt = $db->prepare("SELECT * FROM certificates WHERE id = ?");
        $getStmt->execute([$id]);
        $updated = $getStmt->fetch();

        jsonResponse([
            'message'     => 'Certificate updated successfully',
            'certificate' => $updated
        ]);
    }

    // DELETE /api/certificates/:id (Admin delete)
    if ($method === 'DELETE' && !empty($sub)) {
        authenticateAdmin();
        $id = (int)$sub;
        $stmt = $db->prepare("SELECT id, title FROM certificates WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();

        if (!$existing) {
            jsonError('Certificate not found', 404);
        }

        $delStmt = $db->prepare("DELETE FROM certificates WHERE id = ?");
        $delStmt->execute([$id]);

        jsonResponse(['message' => "Certificate \"{$existing['title']}\" deleted successfully"]);
    }

    jsonError('Route not found', 404);
}
