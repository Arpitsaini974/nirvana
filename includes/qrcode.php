<?php
/**
 * Pure PHP QR Code Generator Engine
 * Generates Base64 Data URI PNG for member and alumni verification URLs
 * Self-contained, zero Composer dependencies, PHP 8+ compatible
 */

class QRCodeHelper {
    private static $exp = [];
    private static $log = [];
    private static $initialized = false;

    private static function initGF() {
        if (self::$initialized) return;
        self::$exp = array_fill(0, 512, 0);
        self::$log = array_fill(0, 256, 0);
        $x = 1;
        for ($i = 0; $i < 255; $i++) {
            self::$exp[$i] = $x;
            self::$log[$x] = $i;
            $x <<= 1;
            if ($x & 0x100) $x ^= 0x11D;
        }
        for ($i = 255; $i < 512; $i++) {
            self::$exp[$i] = self::$exp[$i - 255];
        }
        self::$initialized = true;
    }

    private static function gfMul($x, $y) {
        if ($x == 0 || $y == 0) return 0;
        return self::$exp[self::$log[$x] + self::$log[$y]];
    }

    private static function rsGenPoly($n) {
        $poly = [1];
        for ($i = 0; $i < $n; $i++) {
            $next = [1, self::$exp[$i]];
            $p = array_fill(0, count($poly) + 1, 0);
            for ($j = 0; $j < count($poly); $j++) {
                for ($k = 0; $k < count($next); $k++) {
                    $p[$j + $k] ^= self::gfMul($poly[$j], $next[$k]);
                }
            }
            $poly = $p;
        }
        return $poly;
    }

    private static function rsEncode($data, $ecCount) {
        self::initGF();
        $gen = self::rsGenPoly($ecCount);
        $res = array_fill(0, count($data) + $ecCount, 0);
        for ($i = 0; $i < count($data); $i++) {
            $res[$i] = $data[$i];
        }
        for ($i = 0; $i < count($data); $i++) {
            $coef = $res[$i];
            if ($coef != 0) {
                for ($j = 0; $j < count($gen); $j++) {
                    $res[$i + $j] ^= self::gfMul($gen[$j], $coef);
                }
            }
        }
        return array_slice($res, count($data));
    }

    public static function generateDataURI($text, $pixelSize = 8, $margin = 2) {
        self::initGF();
        $bytes = array_values(unpack('C*', $text));
        $len = count($bytes);

        // Version selection (Level M error correction)
        if ($len <= 14) {
            $version = 1;
            $size = 21;
            $dataCap = 16;
            $ecCount = 10;
            $alignPos = [];
        } elseif ($len <= 26) {
            $version = 2;
            $size = 25;
            $dataCap = 28;
            $ecCount = 16;
            $alignPos = [6, 18];
        } else {
            $version = 3;
            $size = 29;
            $dataCap = 44;
            $ecCount = 26;
            $alignPos = [6, 22];
        }

        // Build bitstream: Mode (0100 = 8-bit byte), Char Count (8 bits for V1-V9)
        $bits = [0, 1, 0, 0];
        for ($i = 7; $i >= 0; $i--) {
            $bits[] = ($len >> $i) & 1;
        }
        foreach ($bytes as $b) {
            for ($i = 7; $i >= 0; $i--) {
                $bits[] = ($b >> $i) & 1;
            }
        }
        // Terminator
        $termLen = min(4, ($dataCap * 8) - count($bits));
        for ($i = 0; $i < $termLen; $i++) $bits[] = 0;
        // Pad to byte boundary
        while (count($bits) % 8 !== 0) $bits[] = 0;
        // Pad bytes (0xEC, 0x11)
        $padBytes = [0xEC, 0x11];
        $padIdx = 0;
        while (count($bits) < $dataCap * 8) {
            $pb = $padBytes[$padIdx % 2];
            $padIdx++;
            for ($i = 7; $i >= 0; $i--) {
                $bits[] = ($pb >> $i) & 1;
            }
        }

        // Group into data codewords
        $dataCodewords = [];
        for ($i = 0; $i < count($bits); $i += 8) {
            $byte = 0;
            for ($j = 0; $j < 8; $j++) {
                $byte = ($byte << 1) | $bits[$i + $j];
            }
            $dataCodewords[] = $byte;
        }

        // Compute EC codewords
        $ecCodewords = self::rsEncode($dataCodewords, $ecCount);
        $allCodewords = array_merge($dataCodewords, $ecCodewords);

        // Turn all codewords into bit stream
        $allBits = [];
        foreach ($allCodewords as $cw) {
            for ($i = 7; $i >= 0; $i--) {
                $allBits[] = ($cw >> $i) & 1;
            }
        }

        // Initialize matrix (-1: unset, 0: white, 1: black)
        $matrix = array_fill(0, $size, array_fill(0, $size, -1));
        $reserved = array_fill(0, $size, array_fill(0, $size, false));

        // Place Finder Patterns (7x7)
        $finderPositions = [[0, 0], [$size - 7, 0], [0, $size - 7]];
        foreach ($finderPositions as [$row, $col]) {
            for ($r = 0; $r < 7; $r++) {
                for ($c = 0; $c < 7; $c++) {
                    $isBlack = ($r == 0 || $r == 6 || $c == 0 || $c == 6 || ($r >= 2 && $r <= 4 && $c >= 2 && $c <= 4));
                    $matrix[$row + $r][$col + $c] = $isBlack ? 1 : 0;
                    $reserved[$row + $r][$col + $c] = true;
                }
            }
            // Separator around finders
            for ($r = -1; $r <= 7; $r++) {
                for ($c = -1; $c <= 7; $c++) {
                    $nr = $row + $r;
                    $nc = $col + $c;
                    if ($nr >= 0 && $nr < $size && $nc >= 0 && $nc < $size) {
                        if (!$reserved[$nr][$nc]) {
                            $matrix[$nr][$nc] = 0;
                            $reserved[$nr][$nc] = true;
                        }
                    }
                }
            }
        }

        // Alignment pattern for V2 and V3
        if (!empty($alignPos)) {
            $ar = $alignPos[1];
            $ac = $alignPos[1];
            for ($r = -2; $r <= 2; $r++) {
                for ($c = -2; $c <= 2; $c++) {
                    $nr = $ar + $r;
                    $nc = $ac + $c;
                    if (!$reserved[$nr][$nc]) {
                        $isB = (abs($r) == 2 || abs($c) == 2 || ($r == 0 && $c == 0));
                        $matrix[$nr][$nc] = $isB ? 1 : 0;
                        $reserved[$nr][$nc] = true;
                    }
                }
            }
        }

        // Timing patterns
        for ($i = 8; $i < $size - 8; $i++) {
            if (!$reserved[6][$i]) {
                $matrix[6][$i] = ($i % 2 == 0) ? 1 : 0;
                $reserved[6][$i] = true;
            }
            if (!$reserved[$i][6]) {
                $matrix[$i][6] = ($i % 2 == 0) ? 1 : 0;
                $reserved[$i][6] = true;
            }
        }

        // Dark module
        $matrix[$size - 8][8] = 1;
        $reserved[$size - 8][8] = true;

        // Reserve format info area
        for ($i = 0; $i < 9; $i++) {
            $reserved[8][$i] = true;
            $reserved[$i][8] = true;
        }
        for ($i = $size - 8; $i < $size; $i++) {
            $reserved[8][$i] = true;
            $reserved[$i][8] = true;
        }

        // Place data bits using zigzag column scanner
        $bitIdx = 0;
        $totalBits = count($allBits);
        $up = true;
        for ($col = $size - 1; $col > 0; $col -= 2) {
            if ($col == 6) $col--; // skip timing col
            $rows = $up ? range($size - 1, 0, -1) : range(0, $size - 1);
            foreach ($rows as $row) {
                for ($c = $col; $c >= $col - 1; $c--) {
                    if (!$reserved[$row][$c]) {
                        $b = ($bitIdx < $totalBits) ? $allBits[$bitIdx++] : 0;
                        // Apply Mask Pattern 0: (row + col) % 2 == 0
                        if (($row + $c) % 2 == 0) {
                            $b ^= 1;
                        }
                        $matrix[$row][$c] = $b;
                    }
                }
            }
            $up = !$up;
        }

        // Format Info (Level M = 00, Mask 0 = 000 => 00000 => with BCH & mask 101010000010010)
        $fmtBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
        $matrix[8][0] = $fmtBits[0];
        $matrix[8][1] = $fmtBits[1];
        $matrix[8][2] = $fmtBits[2];
        $matrix[8][3] = $fmtBits[3];
        $matrix[8][4] = $fmtBits[4];
        $matrix[8][5] = $fmtBits[5];
        $matrix[8][7] = $fmtBits[6];
        $matrix[8][8] = $fmtBits[7];
        $matrix[7][8] = $fmtBits[8];
        $matrix[5][8] = $fmtBits[9];
        $matrix[4][8] = $fmtBits[10];
        $matrix[3][8] = $fmtBits[11];
        $matrix[2][8] = $fmtBits[12];
        $matrix[1][8] = $fmtBits[13];
        $matrix[0][8] = $fmtBits[14];

        for ($i = 0; $i < 7; $i++) {
            $matrix[$size - 1 - $i][8] = $fmtBits[$i];
        }
        for ($i = 0; $i < 8; $i++) {
            $matrix[8][$size - 8 + $i] = $fmtBits[7 + $i];
        }

        // Render to GD PNG
        $imgW = ($size + 2 * $margin) * $pixelSize;
        $img = imagecreatetruecolor($imgW, $imgW);
        $white = imagecolorallocate($img, 255, 255, 255);
        $dark = imagecolorallocate($img, 15, 23, 42); // #0f172a matching node version

        imagefill($img, 0, 0, $white);

        for ($r = 0; $r < $size; $r++) {
            for ($c = 0; $c < $size; $c++) {
                if ($matrix[$r][$c] == 1) {
                    $x = ($c + $margin) * $pixelSize;
                    $y = ($r + $margin) * $pixelSize;
                    imagefilledrectangle($img, $x, $y, $x + $pixelSize - 1, $y + $pixelSize - 1, $dark);
                }
            }
        }

        ob_start();
        imagepng($img);
        $pngData = ob_get_clean();
        imagedestroy($img);

        return 'data:image/png;base64,' . base64_encode($pngData);
    }
}

/**
 * Generate Member QR Data URI
 * @param int|string $id
 * @return string
 */
function generateMemberQR($id) {
    return QRCodeHelper::generateDataURI("/team/$id");
}

/**
 * Generate Alumni QR Data URI
 * @param int|string $id
 * @return string
 */
function generateAlumniQR($id) {
    return QRCodeHelper::generateDataURI("/alumni/$id");
}
