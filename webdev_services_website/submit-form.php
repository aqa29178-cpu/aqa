<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

$recipient = 'aqa29178@gmail.com';

function field(string $key): string {
    return trim((string)($_POST[$key] ?? ''));
}

$formType = field('form_type');
$name = field('name');
$email = field('email');
$message = field('message');
$service = field('service');
$phone = field('phone');
$budget = field('budget');
$rating = field('rating');

if (mb_strlen($name) < 2) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Please enter your name.']);
    exit;
}
if ($formType === 'contact' && (!filter_var($email, FILTER_VALIDATE_EMAIL) || $service === '' || mb_strlen($message) < 10)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Please check your email, service, and project details.']);
    exit;
}
if ($formType === 'feedback' && ($rating === '' || mb_strlen($message) < 5)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Please select a rating and enter at least 5 characters of feedback.']);
    exit;
}
if ($formType !== 'contact' && $formType !== 'feedback') {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Unknown form type.']);
    exit;
}

$subject = $formType === 'contact' ? 'New Website Project Enquiry' : 'New Website Feedback';
$body = "New " . ($formType === 'contact' ? "project enquiry" : "feedback") . " received from your website.\n\n";
$body .= "Name: {$name}\n";
if ($formType === 'contact') {
    $body .= "Email: {$email}\nPhone: {$phone}\nService: {$service}\nBudget: {$budget}\n";
} else {
    $body .= "Rating: {$rating}/5\n";
}
$body .= "\nMessage:\n{$message}\n";
$body .= "\nReceived at: " . date('Y-m-d H:i:s') . "\n";

$host = (string)($_SERVER['HTTP_HOST'] ?? 'your website');
$host = preg_replace('/[^a-zA-Z0-9.-]/', '', $host);
$fromAddress = 'website@' . ($host !== '' ? $host : 'localhost');
$headers = [
    'From' => 'Website Forms <' . $fromAddress . '>',
    'Reply-To' => ($formType === 'contact' && filter_var($email, FILTER_VALIDATE_EMAIL)) ? $email : $fromAddress,
    'Content-Type' => 'text/plain; charset=UTF-8',
    'X-Mailer' => 'PHP/' . phpversion()
];

$sent = @mail($recipient, $subject, $body, $headers);
if ($sent) {
    echo json_encode([
        'success' => true,
        'message' => $formType === 'contact'
            ? 'Thank you! Your enquiry has been submitted successfully. We will get back to you soon.'
            : 'Thank you! Your feedback has been submitted successfully.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Your form could not be emailed right now. Please try again later or contact the website owner directly.'
    ]);
}
