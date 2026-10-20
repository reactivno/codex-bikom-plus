<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$respond = static function (int $status, array $data): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
};

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    $respond(405, ['ok' => false, 'error' => 'Метод не поддерживается.']);
}

if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 4096) {
    $respond(413, ['ok' => false, 'error' => 'Слишком большой запрос.']);
}

$field = static fn (string $key): string => is_string($_POST[$key] ?? null)
    ? trim($_POST[$key]) : '';

// Бот получает нейтральный ответ, письмо не отправляется.
if ($field('website') !== '') {
    $respond(200, ['ok' => true]);
}

$name = $field('name');
$phone = $field('phone');
$digits = preg_replace('/\D/', '', $phone);
$errors = [];
if (mb_strlen($name) > 80 || preg_match('/[\r\n]/', $name)) {
    $errors[] = 'Имя: не более 80 символов в одной строке.';
}
if (strlen($phone) > 40 || !preg_match('/^\+?[\d\s()\-]+$/D', $phone)
    || strlen($digits) < 10 || strlen($digits) > 15) {
    $errors[] = 'Введите телефон с кодом страны: от 10 до 15 цифр.';
}
if ($field('consent') !== 'on') {
    $errors[] = 'Необходимо согласие на обработку персональных данных.';
}
if ($errors !== []) {
    $respond(422, ['ok' => false, 'errors' => $errors]);
}

$to = trim((string) getenv('MAIL_TO'));
$from = trim((string) (getenv('MAIL_FROM') ?: $to));
$prefix = trim((string) getenv('MAIL_SUBJECT_PREFIX'));
if (!filter_var($to, FILTER_VALIDATE_EMAIL) || !filter_var($from, FILTER_VALIDATE_EMAIL)
    || preg_match('/[\r\n]/', $prefix)) {
    $respond(500, ['ok' => false, 'error' => 'Отправка заявок пока не настроена. Позвоните в салон.']);
}

$page = $field('page');
if (!preg_match('~^/[a-zA-Z0-9/_\-.]*$~D', $page) || strlen($page) > 200) {
    $page = '/';
}
$date = (new DateTimeImmutable('now', new DateTimeZone('Europe/Moscow')))->format('d.m.Y H:i:s');
$body = "Заявка на обратный звонок\nИмя: " . ($name ?: 'Не указано')
    . "\nТелефон: {$phone}\nСтраница: {$page}\nДата: {$date} МСК"
    . "\nСогласие на обработку персональных данных: получено\n";
$headers = implode("\r\n", [
    'From: ' . $from,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
]);
// Пользовательские поля находятся только в теле письма.
if (!@mail($to, trim('Обратный звонок ' . $prefix), $body, $headers)) {
    $respond(500, ['ok' => false, 'error' => 'Не удалось отправить заявку. Попробуйте позже или позвоните в салон.']);
}
$respond(200, ['ok' => true]);
