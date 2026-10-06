<?php
/**
 * Club Settings Endpoints
 * GET /api/settings
 * PUT /api/settings
 */

function handleSettingsRoute($method, $pathParts) {
    $db = getDbConnection();

    // GET /api/settings (Public)
    if ($method === 'GET') {
        $stmt = $db->query("SELECT * FROM club_settings WHERE id = 1");
        $settings = $stmt->fetch();

        if (!$settings) {
            jsonError('Settings not found', 404);
        }

        $objectives = [];
        $social_links = new stdClass();

        if (!empty($settings['objectives'])) {
            $parsed = json_decode($settings['objectives'], true);
            $objectives = is_array($parsed) ? $parsed : [$settings['objectives']];
        }

        if (!empty($settings['social_links'])) {
            $parsed = json_decode($settings['social_links'], true);
            $social_links = is_array($parsed) ? (object)$parsed : new stdClass();
        }

        $settings['objectives'] = $objectives;
        $settings['social_links'] = $social_links;

        jsonResponse($settings);
    }

    // PUT /api/settings (Admin update)
    if ($method === 'PUT') {
        authenticateAdmin();
        $body = getJsonInput();

        $club_name = isset($body['club_name']) ? trim($body['club_name']) : '';
        if (empty($club_name)) {
            jsonError('Club name is required', 400);
        }

        $tagline     = isset($body['tagline']) ? $body['tagline'] : '';
        $logo_url    = isset($body['logo_url']) ? $body['logo_url'] : '';
        $favicon_url = isset($body['favicon_url']) ? $body['favicon_url'] : '';
        $banner_url  = isset($body['banner_url']) ? $body['banner_url'] : '';
        $about       = isset($body['about']) ? $body['about'] : '';
        $history     = isset($body['history']) ? $body['history'] : '';
        $mission     = isset($body['mission']) ? $body['mission'] : '';
        $vision      = isset($body['vision']) ? $body['vision'] : '';
        $email       = isset($body['email']) ? $body['email'] : '';
        $phone       = isset($body['phone']) ? $body['phone'] : '';
        $address     = isset($body['address']) ? $body['address'] : '';

        $objectives = isset($body['objectives']) ? $body['objectives'] : [];
        $objectivesStr = is_array($objectives) ? json_encode($objectives, JSON_UNESCAPED_UNICODE) : (string)$objectives;

        $social_links = isset($body['social_links']) ? $body['social_links'] : new stdClass();
        $socialLinksStr = (is_array($social_links) || is_object($social_links)) ? json_encode($social_links, JSON_UNESCAPED_UNICODE) : (string)$social_links;

        $stmt = $db->prepare("
            UPDATE club_settings SET
                club_name = ?,
                tagline = ?,
                logo_url = ?,
                favicon_url = ?,
                banner_url = ?,
                about = ?,
                history = ?,
                mission = ?,
                vision = ?,
                objectives = ?,
                email = ?,
                phone = ?,
                address = ?,
                social_links = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
        ");

        $stmt->execute([
            $club_name,
            $tagline,
            $logo_url,
            $favicon_url,
            $banner_url,
            $about,
            $history,
            $mission,
            $vision,
            $objectivesStr,
            $email,
            $phone,
            $address,
            $socialLinksStr
        ]);

        jsonResponse(['message' => 'Club settings updated successfully']);
    }

    jsonError('Route not found', 404);
}
