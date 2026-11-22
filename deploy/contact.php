<?php
/**
 * Contact form endpoint for https://icekun.net/
 *
 * - Stores every submission in ~/<domain>/contact-submissions.jsonl (outside
 *   the web root), one JSON object per line.
 * - Also emails it when ~/<domain>/contact-recipient.txt contains an address.
 * - No email address is exposed in the page.
 */
declare(strict_types=1);

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

$acceptsJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');

function respond(bool $ok, string $message, bool $acceptsJson): void
{
    if ($acceptsJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
        exit;
    }
    header('Content-Type: text/html; charset=utf-8');
    $safe = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    echo '<!doctype html><html lang="ja"><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<title>送信</title>'
        . '<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1.5rem;line-height:1.9;color:#2c2b33;background:#f7f3ea">'
        . '<p>' . $safe . '</p><p><a href="/">道具箱へ戻る</a></p></body></html>';
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(false, '送信はフォームからお願いします。', $acceptsJson);
}

// Honeypot: bots fill every field. Pretend success and drop it.
if (trim((string)($_POST['website'] ?? '')) !== '') {
    respond(true, '送信しました。', $acceptsJson);
}

// Cross-site posts are not needed for this form.
$origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
if ($origin !== '' && !preg_match('#^https://(?:www\.)?icekun\.net/?$#', $origin)) {
    respond(false, 'このサイトのフォームから送信してください。', $acceptsJson);
}

// Global daily cap: still bounded if a spoofed header hides repeated senders.
$storePath = dirname(__DIR__) . '/contact-submissions.jsonl';
$today = date('Y-m-d');
$todayCount = 0;
if (is_file($storePath) && ($fh = @fopen($storePath, 'r'))) {
    while (($line = fgets($fh)) !== false) {
        if (str_contains($line, $today)) {
            $todayCount++;
            if ($todayCount >= 100) break;
        }
    }
    fclose($fh);
}
if ($todayCount >= 100) {
    respond(false, '本日の受付上限に達しました。時間をおいてお試しください。', $acceptsJson);
}

$name = trim((string)($_POST['name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, '返信先メールアドレスを確認してください。', $acceptsJson);
}
if (mb_strlen($message) < 5) {
    respond(false, '内容を5文字以上で入力してください。', $acceptsJson);
}
if (mb_strlen($name) > 80 || mb_strlen($email) > 160 || mb_strlen($message) > 2000) {
    respond(false, '入力が長すぎます。', $acceptsJson);
}

// 3 submissions per IP per 10 minutes. The site is behind Cloudflare, so the
// origin only sees Cloudflare's address; use the forwarded client IP.
$ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (!filter_var($ip, FILTER_VALIDATE_IP)) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}
$rateFile = sys_get_temp_dir() . '/icekun-contact-' . hash('sha256', $ip);
$now = time();
$hits = [];
if (is_file($rateFile)) {
    $decoded = json_decode((string)file_get_contents($rateFile), true);
    if (is_array($decoded)) {
        $hits = $decoded;
    }
}
$hits = array_values(array_filter($hits, static fn ($t): bool => $now - (int)$t < 600));
if (count($hits) >= 3) {
    respond(false, '送信回数が多すぎます。しばらくしてからお試しください。', $acceptsJson);
}
$hits[] = $now;
@file_put_contents($rateFile, json_encode($hits), LOCK_EX);

$record = [
    'at' => date('c'),
    'name' => $name,
    'email' => $email,
    'message' => $message,
];
$base = dirname(__DIR__);
$line = json_encode($record, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
if ($line === false) {
    $line = json_encode(['at' => date('c'), 'email' => $email, 'message' => '(encoding error)']);
}
@file_put_contents($base . '/contact-submissions.jsonl', $line . "\n", FILE_APPEND | LOCK_EX);

$recipientFile = $base . '/contact-recipient.txt';
if (is_readable($recipientFile)) {
    $to = trim((string)file_get_contents($recipientFile));
    if ($to !== '' && filter_var($to, FILTER_VALIDATE_EMAIL)) {
        $subject = '道具箱へのお問い合わせ';
        $body = "お名前: {$name}\n返信先: {$email}\n\n{$message}\n";
        $headers = "From: no-reply@icekun.net\r\n"
            . "Reply-To: {$email}\r\n"
            . "Content-Type: text/plain; charset=UTF-8\r\n";
        @mail($to, $subject, $body, $headers);
    }
}

respond(true, '送信しました。返信が必要な場合は、ご記入のメールアドレスへご連絡します。', $acceptsJson);
