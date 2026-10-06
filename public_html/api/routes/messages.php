<?php
/**
 * Contact Messages Endpoints
 * POST   /api/messages
 * GET    /api/messages
 * PATCH  /api/messages/:id/read
 * DELETE /api/messages/:id
 */

function handleMessagesRoute($method, $pathParts) {
    $db = getDbConnection();
    $sub = isset($pathParts[0]) ? $pathParts[0] : '';
    $subAction = isset($pathParts[1]) ? $pathParts[1] : '';

    // POST /api/messages (Public contact submission)
    if ($method === 'POST' && empty($sub)) {
        $body = getJsonInput();
        $name    = isset($body['name']) ? trim($body['name']) : '';
        $email   = isset($body['email']) ? trim($body['email']) : '';
        $subject = isset($body['subject']) ? trim($body['subject']) : 'General Inquiry';
        $message = isset($body['message']) ? trim($body['message']) : '';

        if (empty($name) || empty($email) || empty($message)) {
            jsonError('Name, email, and message are required', 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonError('Invalid email address', 400);
        }

        $stmt = $db->prepare("
            INSERT INTO contact_messages (name, email, subject, message)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$name, $email, $subject, $message]);

        jsonResponse([
            'message' => 'Thank you for reaching out! We will get back to you shortly.'
        ], 201);
    }

    // GET /api/messages (Admin list)
    if ($method === 'GET' && empty($sub)) {
        authenticateAdmin();
        $stmt = $db->query("SELECT * FROM contact_messages ORDER BY id DESC");
        $messages = $stmt->fetchAll();

        jsonResponse($messages);
    }

    // PATCH /api/messages/:id/read (Admin mark read)
    if ($method === 'PATCH' && !empty($sub) && $subAction === 'read') {
        authenticateAdmin();
        $id = (int)$sub;
        $stmt = $db->prepare("UPDATE contact_messages SET is_read = 1 WHERE id = ?");
        $stmt->execute([$id]);

        jsonResponse(['message' => 'Message marked as read']);
    }

    // DELETE /api/messages/:id (Admin delete)
    if ($method === 'DELETE' && !empty($sub)) {
        authenticateAdmin();
        $id = (int)$sub;
        $stmt = $db->prepare("DELETE FROM contact_messages WHERE id = ?");
        $stmt->execute([$id]);

        jsonResponse(['message' => 'Message deleted successfully']);
    }

    jsonError('Route not found', 404);
}
