<?php
// Suppress PHP errors for clean JSON output
error_reporting(0);
ini_set('display_errors', 0);

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Ensure clean output buffer
ob_clean();
header('Content-Type: application/json');

require_once 'config.php';

$request_method = $_SERVER['REQUEST_METHOD'] ?? 'POST';
if ($request_method !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

// Handle both JSON input and form data
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    // Fallback to POST data
    $input = $_POST;
}

if (!$input || (!isset($input['currentPassword']) && !isset($input['current_password'])) || (!isset($input['newPassword']) && !isset($input['new_password']))) {
    sendResponse(false, 'Current password and new password are required');
}

// Handle both field name formats for backward compatibility
$currentPassword = $input['currentPassword'] ?? $input['current_password'] ?? '';
$newPassword = $input['newPassword'] ?? $input['new_password'] ?? '';

if (empty($currentPassword) || empty($newPassword)) {
    sendResponse(false, 'Current password and new password are required');
}

try {    // Check if admin_settings table exists, create if not
    $check_table = "SHOW TABLES LIKE 'admin_settings'";
    $table_result = $conn->query($check_table);
    
    if ($table_result->num_rows == 0) {
        // Create table first
        $create_table = "CREATE TABLE admin_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_name VARCHAR(100) UNIQUE NOT NULL,
            setting_value TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        
        if (!$conn->query($create_table)) {
            sendResponse(false, 'Failed to create admin_settings table: ' . $conn->error);
        }
        
        // Insert default password
        $default_hash = password_hash('admin123', PASSWORD_DEFAULT);
        $insert_default = "INSERT INTO admin_settings (setting_name, setting_value) VALUES ('admin_password', ?)";
        $stmt = $conn->prepare($insert_default);
        $stmt->bind_param("s", $default_hash);
        $stmt->execute();
        $stmt->close();
    }
    
    // Get current admin password from database
    $check_password = "SELECT setting_value FROM admin_settings WHERE setting_name = 'admin_password'";
    $result = $conn->query($check_password);
    
    if ($result->num_rows == 0) {
        // If password still doesn't exist after check, insert it
        $default_hash = password_hash('admin123', PASSWORD_DEFAULT);
        $insert_default = "INSERT INTO admin_settings (setting_name, setting_value) VALUES ('admin_password', ?)";
        $stmt = $conn->prepare($insert_default);
        $stmt->bind_param("s", $default_hash);
        $stmt->execute();
        $stmt->close();
        
        // Re-fetch the password
        $result = $conn->query($check_password);
        if ($result->num_rows == 0) {
            sendResponse(false, 'Failed to set up admin password in database');
        }
    }
    
    $row = $result->fetch_assoc();
    $current_hash = $row['setting_value'];
      // If the current password is 'admin123' and it's not hashed, accept the default
    if ($currentPassword === 'admin123' && substr($current_hash, 0, 1) !== '$') {
        // It's the default password and not properly hashed
    } else {
        // Verify current password
        if (!password_verify($currentPassword, $current_hash)) {
            sendResponse(false, 'Current password is incorrect');
        }
    }
    
    // Validate new password
    if (strlen($newPassword) < 6) {
        sendResponse(false, 'New password must be at least 6 characters long');
    }      // Update password in database
    $new_hash = password_hash($newPassword, PASSWORD_DEFAULT);
    $update_password = "UPDATE admin_settings SET setting_value = ? WHERE setting_name = 'admin_password'";
    $stmt = $conn->prepare($update_password);
    $stmt->bind_param("s", $new_hash);
    
    if ($stmt->execute()) {
        // Verify the password was actually updated
        $verify_sql = "SELECT setting_value FROM admin_settings WHERE setting_name = 'admin_password'";
        $verify_result = $conn->query($verify_sql);
        $verify_row = $verify_result->fetch_assoc();
        
        if (password_verify($newPassword, $verify_row['setting_value'])) {
            // Also update the session admin password if it exists
            if (isset($_SESSION['adminLoggedIn']) && $_SESSION['adminLoggedIn'] === true) {
                $_SESSION['adminPassword'] = $new_hash;
            }
            
            // Log the successful password change for troubleshooting
            error_log("Password changed successfully at " . date('Y-m-d H:i:s'));
            
            $stmt->close();
            sendResponse(true, 'Password changed successfully');
        } else {
            $stmt->close();
            sendResponse(false, 'Password update verification failed');
        }
    } else {
        $stmt->close();
        sendResponse(false, 'Failed to update password in database: ' . $conn->error);
    }
    
} catch(Exception $e) {
    sendResponse(false, 'Error changing password: ' . $e->getMessage());
}
?>
