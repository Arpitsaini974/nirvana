<?php
/**
 * NIRVANA Club Management System
 * Database Configuration (PDO)
 * 
 * Supports both MySQL (Hostinger Shared Hosting) and SQLite (Local Development)
 */

// Database Driver: 'mysql' or 'sqlite'
// On Hostinger, set this to 'mysql' (or leave default and configure credentials below)
define('DB_DRIVER', getenv('DB_DRIVER') ?: 'mysql');

// MySQL Configuration (Hostinger hPanel Database details)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'nirvana_club');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

// SQLite Fallback Configuration (if using SQLite locally or on hosting)
define('DB_SQLITE_PATH', __DIR__ . '/../server/club.db');

/**
 * Get or create PDO Database Connection
 * @return PDO
 */
function getDbConnection() {
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    $driver = DB_DRIVER;

    // Check if MySQL is selected
    if ($driver === 'mysql') {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            return $pdo;
        } catch (PDOException $e) {
            // If MySQL fails and local SQLite database exists, fall back smoothly for development
            if (file_exists(DB_SQLITE_PATH)) {
                $driver = 'sqlite';
            } else {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
                exit;
            }
        }
    }

    // SQLite Connection
    if ($driver === 'sqlite') {
        try {
            $path = DB_SQLITE_PATH;
            // Also check root club.db if path doesn't exist
            if (!file_exists($path) && file_exists(__DIR__ . '/../club.db')) {
                $path = __DIR__ . '/../club.db';
            }
            $pdo = new PDO("sqlite:" . $path);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $pdo->exec("PRAGMA foreign_keys = ON;");
            return $pdo;
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'SQLite connection failed: ' . $e->getMessage()]);
            exit;
        }
    }

    throw new Exception("Unsupported database driver: " . $driver);
}
