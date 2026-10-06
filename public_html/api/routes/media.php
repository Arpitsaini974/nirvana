<?php
/**
 * Media File Upload and Library Endpoints
 * POST   /api/media/upload
 * GET    /api/media
 * DELETE /api/media/:id
 */

function handleMediaRoute($method, $pathParts) {
    $db = getDbConnection();
    $sub = isset($pathParts[0]) ? $pathParts[0] : '';

    $uploadsDir = __DIR__ . '/../../uploads';
    if (!file_exists($uploadsDir)) {
        @mkdir($uploadsDir, 0755, true);
    }

    // POST /api/media/upload (Admin upload)
    if ($method === 'POST' && $sub === 'upload') {
        authenticateAdmin();

        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            $msg = 'No file uploaded';
            if (isset($_FILES['file']['error'])) {
                switch ($_FILES['file']['error']) {
                    case UPLOAD_ERR_INI_SIZE:
                    case UPLOAD_ERR_FORM_SIZE:
                        $msg = 'File size exceeds maximum allowed limit';
                        break;
                    case UPLOAD_ERR_NO_FILE:
                        $msg = 'No file uploaded';
                        break;
                    default:
                        $msg = 'File upload failed with error code: ' . $_FILES['file']['error'];
                }
            }
            jsonError($msg, 400);
        }

        $file = $_FILES['file'];
        $maxSize = 10 * 1024 * 1024; // 10MB
        if ($file['size'] > $maxSize) {
            jsonError('File size exceeds 10MB limit', 400);
        }

        // Validate MIME type
        $allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/svg+xml',
            'image/gif',
            'application/pdf'
        ];

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mime, $allowedMimes)) {
            jsonError('Only images (JPEG, PNG, WebP, SVG, GIF) and PDF files are allowed!', 400);
        }

        $origName = basename($file['name']);
        $ext = pathinfo($origName, PATHINFO_EXTENSION);
        $cleanExt = !empty($ext) ? '.' . strtolower($ext) : '';
        $newFilename = 'file-' . time() . '-' . random_int(100000000, 999999999) . $cleanExt;
        $destPath = $uploadsDir . '/' . $newFilename;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            jsonError('Failed to save uploaded file to disk', 500);
        }

        $fileUrl = '/uploads/' . $newFilename;
        $category = isset($_POST['category']) ? trim($_POST['category']) : 'general';

        $stmt = $db->prepare("
            INSERT INTO media_files (filename, original_name, file_path, mime_type, file_size, category)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $newFilename,
            $origName,
            $fileUrl,
            $mime,
            $file['size'],
            $category
        ]);

        $newId = (int)$db->lastInsertId();

        jsonResponse([
            'message' => 'File uploaded successfully',
            'file'    => [
                'id'            => $newId,
                'url'           => $fileUrl,
                'filename'      => $newFilename,
                'original_name' => $origName,
                'mime_type'     => $mime,
                'file_size'     => (int)$file['size'],
                'category'      => $category
            ]
        ], 201);
    }

    // GET /api/media (Admin list)
    if ($method === 'GET' && empty($sub)) {
        authenticateAdmin();
        $stmt = $db->query("SELECT * FROM media_files ORDER BY id DESC");
        $files = $stmt->fetchAll();

        jsonResponse($files);
    }

    // DELETE /api/media/:id (Admin delete)
    if ($method === 'DELETE' && !empty($sub)) {
        authenticateAdmin();
        $id = (int)$sub;
        $stmt = $db->prepare("SELECT * FROM media_files WHERE id = ?");
        $stmt->execute([$id]);
        $file = $stmt->fetch();

        if (!$file) {
            jsonError('File not found', 404);
        }

        $fullPath = $uploadsDir . '/' . $file['filename'];
        if (file_exists($fullPath)) {
            @unlink($fullPath);
        }

        $delStmt = $db->prepare("DELETE FROM media_files WHERE id = ?");
        $delStmt->execute([$id]);

        jsonResponse(['message' => 'File deleted successfully']);
    }

    jsonError('Route not found', 404);
}
