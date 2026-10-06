<?php
/**
 * Events Endpoints
 * GET    /api/events/stats
 * GET    /api/events/featured
 * GET    /api/events
 * GET    /api/events/:id
 * POST   /api/events
 * PUT    /api/events/:id
 * DELETE /api/events/:id
 */

function handleEventsRoute($method, $pathParts) {
    $db = getDbConnection();
    $sub = isset($pathParts[0]) ? $pathParts[0] : '';

    // GET /api/events/stats (Public event statistics)
    if ($method === 'GET' && $sub === 'stats') {
        $total     = (int)$db->query("SELECT count(*) as count FROM events")->fetch()['count'];
        $upcoming  = (int)$db->query("SELECT count(*) as count FROM events WHERE status = 'upcoming'")->fetch()['count'];
        $live      = (int)$db->query("SELECT count(*) as count FROM events WHERE status = 'live'")->fetch()['count'];
        $past      = (int)$db->query("SELECT count(*) as count FROM events WHERE status = 'past'")->fetch()['count'];

        $catRows = $db->query("SELECT DISTINCT category FROM events WHERE category IS NOT NULL AND category != ''")->fetchAll();
        $categories = array_map(fn($r) => $r['category'], $catRows);

        $typeRows = $db->query("SELECT DISTINCT event_type FROM events WHERE event_type IS NOT NULL AND event_type != ''")->fetchAll();
        $eventTypes = array_map(fn($r) => $r['event_type'], $typeRows);

        $modeRows = $db->query("SELECT DISTINCT delivery_mode FROM events WHERE delivery_mode IS NOT NULL AND delivery_mode != ''")->fetchAll();
        $deliveryModes = array_map(fn($r) => $r['delivery_mode'], $modeRows);

        $yearRows = $db->query("SELECT DISTINCT SUBSTR(date, 1, 4) as year FROM events WHERE date IS NOT NULL AND LENGTH(date) >= 4 ORDER BY year DESC")->fetchAll();
        $years = array_map(fn($r) => $r['year'], $yearRows);

        jsonResponse([
            'total'         => $total,
            'upcoming'      => $upcoming,
            'live'          => $live,
            'past'          => $past,
            'categories'    => $categories,
            'eventTypes'    => $eventTypes,
            'deliveryModes' => $deliveryModes,
            'years'         => $years
        ]);
    }

    // GET /api/events/featured (Public featured)
    if ($method === 'GET' && $sub === 'featured') {
        $stmt = $db->query("
            SELECT * FROM events
            ORDER BY CASE status WHEN 'live' THEN 1 WHEN 'upcoming' THEN 2 ELSE 3 END, date DESC
            LIMIT 3
        ");
        $events = $stmt->fetchAll();
        jsonResponse($events);
    }

    // GET /api/events (Public list with search & multi-dimensional filters)
    if ($method === 'GET' && empty($sub)) {
        $search        = isset($_GET['search']) ? trim($_GET['search']) : '';
        $status        = isset($_GET['status']) ? trim($_GET['status']) : '';
        $category      = isset($_GET['category']) ? trim($_GET['category']) : '';
        $event_type    = isset($_GET['event_type']) ? trim($_GET['event_type']) : '';
        $delivery_mode = isset($_GET['delivery_mode']) ? trim($_GET['delivery_mode']) : '';
        $year          = isset($_GET['year']) ? trim($_GET['year']) : '';
        $location      = isset($_GET['location']) ? trim($_GET['location']) : '';

        $query = "SELECT * FROM events WHERE 1=1";
        $params = [];

        if (!empty($search)) {
            $query .= " AND (
                title LIKE ? OR
                speakers LIKE ? OR
                description LIKE ? OR
                short_description LIKE ? OR
                location LIKE ? OR
                category LIKE ?
            )";
            $term = "%$search%";
            $params = array_merge($params, [$term, $term, $term, $term, $term, $term]);
        }

        if (!empty($status) && $status !== 'all') {
            $query .= " AND status = ?";
            $params[] = $status;
        }

        if (!empty($category) && $category !== 'all') {
            $query .= " AND category = ?";
            $params[] = $category;
        }

        if (!empty($event_type) && $event_type !== 'all') {
            $query .= " AND event_type = ?";
            $params[] = $event_type;
        }

        if (!empty($delivery_mode) && $delivery_mode !== 'all') {
            $query .= " AND delivery_mode = ?";
            $params[] = $delivery_mode;
        }

        if (!empty($year) && $year !== 'all') {
            $query .= " AND date LIKE ?";
            $params[] = "$year%";
        }

        if (!empty($location) && $location !== 'all') {
            $query .= " AND location LIKE ?";
            $params[] = "%$location%";
        }

        $query .= " ORDER BY CASE status WHEN 'live' THEN 1 WHEN 'upcoming' THEN 2 ELSE 3 END, date DESC, id DESC";

        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $events = $stmt->fetchAll();

        jsonResponse($events);
    }

    // GET /api/events/:id (Public single)
    if ($method === 'GET' && !empty($sub) && $sub !== 'stats' && $sub !== 'featured') {
        $id = (int)$sub;
        $stmt = $db->prepare("SELECT * FROM events WHERE id = ?");
        $stmt->execute([$id]);
        $event = $stmt->fetch();

        if (!$event) {
            jsonError('Event not found', 404);
        }

        jsonResponse($event);
    }

    // POST /api/events (Admin add)
    if ($method === 'POST' && empty($sub)) {
        authenticateAdmin();
        $body = getJsonInput();

        $title = isset($body['title']) ? trim($body['title']) : '';
        $date  = isset($body['date']) ? trim($body['date']) : '';

        if (empty($title) || empty($date)) {
            jsonError('Event title and date are required', 400);
        }

        $time              = isset($body['time']) ? trim($body['time']) : '10:00 AM - 1:00 PM';
        $location          = isset($body['location']) ? trim($body['location']) : 'Campus Auditorium / Lab';
        $image_url         = isset($body['image_url']) ? trim($body['image_url']) : '';
        $short_description = isset($body['short_description']) ? trim($body['short_description']) : '';
        $description       = isset($body['description']) ? trim($body['description']) : '';
        $category          = isset($body['category']) ? trim($body['category']) : 'Robotics & Hardware';
        $event_type        = isset($body['event_type']) ? trim($body['event_type']) : 'Workshop';
        $delivery_mode     = isset($body['delivery_mode']) ? trim($body['delivery_mode']) : 'Offline';
        $speakers          = isset($body['speakers']) ? trim($body['speakers']) : '';
        $organizer         = isset($body['organizer']) ? trim($body['organizer']) : 'Club Executive Council';
        $regUrl            = isset($body['registration_url']) ? trim($body['registration_url']) : (isset($body['registration_link']) ? trim($body['registration_link']) : '');
        $status            = isset($body['status']) ? trim($body['status']) : 'upcoming';

        $stmt = $db->prepare("
            INSERT INTO events (
                title, date, time, location, image_url,
                short_description, description, category, event_type,
                delivery_mode, speakers, organizer, registration_url, registration_link, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $title, $date, $time, $location, $image_url,
            $short_description, $description, $category, $event_type,
            $delivery_mode, $speakers, $organizer, $regUrl, $regUrl, $status
        ]);

        $newId = (int)$db->lastInsertId();
        $getStmt = $db->prepare("SELECT * FROM events WHERE id = ?");
        $getStmt->execute([$newId]);
        $created = $getStmt->fetch();

        jsonResponse([
            'message' => 'Event created successfully',
            'event'   => $created
        ], 201);
    }

    // PUT /api/events/:id (Admin update)
    if ($method === 'PUT' && !empty($sub)) {
        authenticateAdmin();
        $id = (int)$sub;
        $stmt = $db->prepare("SELECT * FROM events WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();

        if (!$existing) {
            jsonError('Event not found', 404);
        }

        $body = getJsonInput();
        $title             = isset($body['title']) ? trim($body['title']) : $existing['title'];
        $date              = isset($body['date']) ? trim($body['date']) : $existing['date'];
        $time              = array_key_exists('time', $body) ? trim($body['time']) : $existing['time'];
        $location          = array_key_exists('location', $body) ? trim($body['location']) : $existing['location'];
        $image_url         = array_key_exists('image_url', $body) ? $body['image_url'] : $existing['image_url'];
        $short_description = array_key_exists('short_description', $body) ? $body['short_description'] : $existing['short_description'];
        $description       = array_key_exists('description', $body) ? $body['description'] : $existing['description'];
        $category          = array_key_exists('category', $body) ? $body['category'] : $existing['category'];
        $event_type        = array_key_exists('event_type', $body) ? $body['event_type'] : $existing['event_type'];
        $delivery_mode     = array_key_exists('delivery_mode', $body) ? $body['delivery_mode'] : $existing['delivery_mode'];
        $speakers          = array_key_exists('speakers', $body) ? $body['speakers'] : $existing['speakers'];
        $organizer         = array_key_exists('organizer', $body) ? $body['organizer'] : $existing['organizer'];
        $regUrl            = array_key_exists('registration_url', $body) ? $body['registration_url'] : (array_key_exists('registration_link', $body) ? $body['registration_link'] : $existing['registration_url']);
        $status            = array_key_exists('status', $body) ? $body['status'] : $existing['status'];

        $upStmt = $db->prepare("
            UPDATE events SET
                title = ?,
                date = ?,
                time = ?,
                location = ?,
                image_url = ?,
                short_description = ?,
                description = ?,
                category = ?,
                event_type = ?,
                delivery_mode = ?,
                speakers = ?,
                organizer = ?,
                registration_url = ?,
                registration_link = ?,
                status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");

        $upStmt->execute([
            $title, $date, $time, $location, $image_url,
            $short_description, $description, $category, $event_type,
            $delivery_mode, $speakers, $organizer, $regUrl, $regUrl, $status,
            $id
        ]);

        $getStmt = $db->prepare("SELECT * FROM events WHERE id = ?");
        $getStmt->execute([$id]);
        $updated = $getStmt->fetch();

        jsonResponse([
            'message' => 'Event updated successfully',
            'event'   => $updated
        ]);
    }

    // DELETE /api/events/:id (Admin delete)
    if ($method === 'DELETE' && !empty($sub)) {
        authenticateAdmin();
        $id = (int)$sub;
        $stmt = $db->prepare("SELECT id, title FROM events WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();

        if (!$existing) {
            jsonError('Event not found', 404);
        }

        $delStmt = $db->prepare("DELETE FROM events WHERE id = ?");
        $delStmt->execute([$id]);

        jsonResponse(['message' => "Event \"{$existing['title']}\" deleted successfully"]);
    }

    jsonError('Route not found', 404);
}
