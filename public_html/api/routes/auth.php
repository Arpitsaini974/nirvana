<?php
/**
 * Authentication Endpoints
 * POST /api/auth/login
 * POST /api/auth/forgot-password
 * POST /api/auth/reset-password
 * GET  /api/auth/me
 * POST /api/auth/change-password
 */

function handleAuthRoute($method, $pathParts) {
    $db = getDbConnection();
    $subAction = isset($pathParts[0]) ? $pathParts[0] : '';

    // POST /api/auth/login
    if ($method === 'POST' && $subAction === 'login') {
        $body = getJsonInput();
        $email = isset($body['email']) ? trim($body['email']) : '';
        $password = isset($body['password']) ? $body['password'] : '';

        if (empty($email) || empty($password)) {
            jsonError('Email and password are required', 400);
        }

        $cleanEmail = strtolower($email);
        $stmt = $db->prepare('SELECT * FROM admins WHERE LOWER(email) = ?');
        $stmt->execute([$cleanEmail]);
        $admin = $stmt->fetch();

        if (!$admin || !password_verify($password, $admin['password_hash'])) {
            jsonError('Invalid email or password', 401);
        }

        $tokenPayload = [
            'id'    => (int)$admin['id'],
            'name'  => $admin['name'],
            'email' => $admin['email']
        ];
        $token = jwt_encode($tokenPayload, JWT_SECRET, 7 * 86400);

        jsonResponse([
            'message' => 'Login successful',
            'token'   => $token,
            'admin'   => [
                'id'    => (int)$admin['id'],
                'name'  => $admin['name'],
                'email' => $admin['email']
            ]
        ]);
    }

    // POST /api/auth/forgot-password
    if ($method === 'POST' && $subAction === 'forgot-password') {
        $body = getJsonInput();
        $email = isset($body['email']) ? trim($body['email']) : '';

        if (empty($email)) {
            jsonError('Please enter your registered admin email address', 400);
        }

        $cleanEmail = strtolower($email);
        $stmt = $db->prepare('SELECT id, name, email FROM admins WHERE LOWER(email) = ?');
        $stmt->execute([$cleanEmail]);
        $admin = $stmt->fetch();

        if (!$admin) {
            jsonError('No administrator account found with this email address', 404);
        }

        // Clean previous reset codes
        $delStmt = $db->prepare('DELETE FROM password_resets WHERE LOWER(email) = ?');
        $delStmt->execute([$cleanEmail]);

        // Generate 6-digit OTP
        $resetCode = (string)random_int(100000, 900000);
        $expiresAt = date('Y-m-d H:i:s', time() + 15 * 60);

        $insStmt = $db->prepare('INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, ?)');
        $insStmt->execute([$cleanEmail, $resetCode, $expiresAt]);

        jsonResponse([
            'success' => true,
            'message' => "Verification code generated for $cleanEmail. Valid for 15 minutes.",
            'code'    => $resetCode
        ]);
    }

    // POST /api/auth/reset-password
    if ($method === 'POST' && $subAction === 'reset-password') {
        $body = getJsonInput();
        $email = isset($body['email']) ? strtolower(trim($body['email'])) : '';
        $code = isset($body['code']) ? trim($body['code']) : '';
        $newPassword = isset($body['newPassword']) ? trim($body['newPassword']) : '';

        if (empty($email) || empty($code) || empty($newPassword)) {
            jsonError('Email, verification code, and new password are required', 400);
        }

        if (strlen($newPassword) < 6) {
            jsonError('New password must be at least 6 characters long', 400);
        }

        $stmt = $db->prepare('SELECT * FROM password_resets WHERE LOWER(email) = ? AND code = ? ORDER BY id DESC LIMIT 1');
        $stmt->execute([$email, $code]);
        $record = $stmt->fetch();

        if (!$record) {
            jsonError('Invalid verification code or email address', 400);
        }

        if (strtotime($record['expires_at']) < time()) {
            $delStmt = $db->prepare('DELETE FROM password_resets WHERE id = ?');
            $delStmt->execute([$record['id']]);
            jsonError('Verification code has expired. Please request a new one.', 400);
        }

        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $updateStmt = $db->prepare('UPDATE admins SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE LOWER(email) = ?');
        $updateStmt->execute([$newHash, $email]);

        if ($updateStmt->rowCount() === 0) {
            jsonError('Admin record could not be updated', 404);
        }

        $delStmt = $db->prepare('DELETE FROM password_resets WHERE LOWER(email) = ?');
        $delStmt->execute([$email]);

        jsonResponse([
            'success' => true,
            'message' => 'Password has been successfully updated! You can now log in with your new password.'
        ]);
    }

    // GET /api/auth/me
    if ($method === 'GET' && $subAction === 'me') {
        $currentAdmin = authenticateAdmin();
        $stmt = $db->prepare('SELECT id, name, email, created_at FROM admins WHERE id = ?');
        $stmt->execute([$currentAdmin['id']]);
        $admin = $stmt->fetch();

        if (!$admin) {
            jsonError('Admin not found', 404);
        }

        jsonResponse(['admin' => [
            'id'         => (int)$admin['id'],
            'name'       => $admin['name'],
            'email'      => $admin['email'],
            'created_at' => $admin['created_at']
        ]]);
    }

    // POST /api/auth/change-password
    if ($method === 'POST' && $subAction === 'change-password') {
        $currentAdmin = authenticateAdmin();
        $body = getJsonInput();
        $currentPassword = isset($body['currentPassword']) ? $body['currentPassword'] : '';
        $newPassword = isset($body['newPassword']) ? $body['newPassword'] : '';

        if (empty($currentPassword) || empty($newPassword)) {
            jsonError('Both current and new password are required', 400);
        }
        if (strlen($newPassword) < 6) {
            jsonError('New password must be at least 6 characters long', 400);
        }

        $stmt = $db->prepare('SELECT * FROM admins WHERE id = ?');
        $stmt->execute([$currentAdmin['id']]);
        $admin = $stmt->fetch();

        if (!$admin || !password_verify($currentPassword, $admin['password_hash'])) {
            jsonError('Incorrect current password', 400);
        }

        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $upStmt = $db->prepare('UPDATE admins SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        $upStmt->execute([$newHash, $currentAdmin['id']]);

        jsonResponse(['message' => 'Password updated successfully']);
    }

    jsonError('Route not found', 404);
}
