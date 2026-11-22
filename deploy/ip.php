<?php
/**
 * IP information endpoint for /ip/.
 * Uses only what the web server and Cloudflare already know — no external
 * geolocation API, no API key, no persistent process.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$ip = '';
if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
    $ip = trim((string)$_SERVER['HTTP_CF_CONNECTING_IP']);
} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $parts = explode(',', (string)$_SERVER['HTTP_X_FORWARDED_FOR']);
    $ip = trim($parts[0]);
} else {
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? '');
}
if (!filter_var($ip, FILTER_VALIDATE_IP)) {
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? '');
}

$version = '不明';
if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
    $version = 'IPv4';
} elseif (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
    $version = 'IPv6';
}

$code = strtoupper((string)($_SERVER['HTTP_CF_IPCOUNTRY'] ?? ''));
if (!preg_match('/^[A-Z]{2}$/', $code) || $code === 'XX' || $code === 'T1') {
    $code = '';
}

$countryNames = [
    'JP' => '日本', 'US' => 'アメリカ合衆国', 'GB' => 'イギリス', 'CN' => '中国',
    'KR' => '韓国', 'TW' => '台湾', 'HK' => '香港', 'SG' => 'シンガポール',
    'AU' => 'オーストラリア', 'CA' => 'カナダ', 'DE' => 'ドイツ', 'FR' => 'フランス',
    'NL' => 'オランダ', 'IN' => 'インド', 'BR' => 'ブラジル', 'RU' => 'ロシア',
];
$country = $code === '' ? '' : ($countryNames[$code] ?? $code);

$tz = null;
if ($code === 'JP') {
    $tz = ['id' => 'Asia/Tokyo', 'abbr' => 'JST', 'utc' => '+9'];
}

echo json_encode([
    'ok' => true,
    'ip' => $ip,
    'type' => $version,
    'country' => $country,
    'country_code' => $code,
    'city' => null,
    'connection' => ['isp' => null, 'asn' => null],
    'timezone' => $tz,
    'latitude' => null,
    'longitude' => null,
    'source' => 'server',
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
