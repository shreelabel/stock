<?php
header('Content-Type: application/json');
require_once 'config.php';

$request_method = $_SERVER['REQUEST_METHOD'] ?? 'POST';
if ($request_method !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['password'])) {
    sendResponse(false, 'Password is required');
}

try {
    // Get admin password from database
    $check_password = "SELECT setting_value FROM admin_settings WHERE setting_name = 'admin_password'";
    $result = $conn->query($check_password);
    
    if ($result->num_rows == 0) {
        // Fallback to hardcoded password if database doesn't have it
        if ($input['password'] === 'admin123') {
            sendResponse(true, 'Login successful (fallback)');
        } else {
            sendResponse(false, 'Invalid password');
        }
        return;
    }
    
    $row = $result->fetch_assoc();
    $stored_hash = $row['setting_value'];
    
    // Verify password
    if (password_verify($input['password'], $stored_hash)) {
        sendResponse(true, 'Login successful');
    } else {
        sendResponse(false, 'Invalid password');
    }
    
} catch(Exception $e) {
    // Fallback to hardcoded password if there's a database error
    if ($input['password'] === 'admin123') {
        sendResponse(true, 'Login successful (fallback)');
    } else {
        sendResponse(false, 'Database error: ' . $e->getMessage());
    }
}
?>
