<?php
/**
 * Dashboard Statistics Endpoint
 * GET /api/stats (Admin only)
 */

function handleStatsRoute($method, $pathParts) {
    if ($method !== 'GET') {
        jsonError('Method not allowed', 405);
    }

    authenticateAdmin();
    $db = getDbConnection();

    $totalMembers      = (int)$db->query("SELECT count(*) as count FROM team_members")->fetch()['count'];
    $activeMembers     = (int)$db->query("SELECT count(*) as count FROM team_members WHERE status = 'active'")->fetch()['count'];
    $totalAlumni       = (int)$db->query("SELECT count(*) as count FROM alumni")->fetch()['count'];
    $totalCertificates = (int)$db->query("SELECT count(*) as count FROM certificates")->fetch()['count'];
    $totalEvents       = (int)$db->query("SELECT count(*) as count FROM events")->fetch()['count'];
    $unreadMessages    = (int)$db->query("SELECT count(*) as count FROM contact_messages WHERE is_read = 0")->fetch()['count'];

    $recentMembers      = $db->query("SELECT id, member_id, name, role, department, status, created_at, photo_url FROM team_members ORDER BY id DESC LIMIT 5")->fetchAll();
    $recentAlumni       = $db->query("SELECT id, name, batch, previous_role, current_company, photo_url FROM alumni ORDER BY id DESC LIMIT 5")->fetchAll();
    $recentCertificates = $db->query("SELECT id, title, recipient_name, certificate_type, issue_date FROM certificates ORDER BY id DESC LIMIT 5")->fetchAll();
    $recentEvents       = $db->query("SELECT id, title, date, location, status FROM events ORDER BY date DESC LIMIT 5")->fetchAll();

    jsonResponse([
        'metrics' => [
            'totalMembers'       => $totalMembers,
            'activeMembers'      => $activeMembers,
            'inactiveMembers'    => $totalMembers - $activeMembers,
            'totalAlumni'        => $totalAlumni,
            'totalCertificates'  => $totalCertificates,
            'totalEvents'        => $totalEvents,
            'unreadMessages'     => $unreadMessages
        ],
        'recentMembers'      => $recentMembers,
        'recentAlumni'       => $recentAlumni,
        'recentCertificates' => $recentCertificates,
        'recentEvents'       => $recentEvents
    ]);
}
