<?php
// Sample configuration file for deployment
// Copy this to config.php and update with your database settings

// Database configuration for Paper Stock Management System
$host = 'localhost';          // Database host (usually localhost)
$username = 'your_db_user';   // Database username
$password = 'your_db_pass';   // Database password
$database = 'your_db_name';   // Database name

// Create connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    // Return JSON error instead of dying
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

// Set charset
$conn->set_charset("utf8");

// Function to create tables if they don't exist
function createTablesIfNotExist($conn) {
    // Create rolls table
    $sql = "CREATE TABLE IF NOT EXISTS rolls (
        id INT AUTO_INCREMENT PRIMARY KEY,
        rollnumber VARCHAR(50) UNIQUE NOT NULL,
        material VARCHAR(100) NOT NULL,
        company VARCHAR(100) NOT NULL,
        width DECIMAL(10,2) NOT NULL,
        length DECIMAL(10,2) NOT NULL,
        weight DECIMAL(10,2) NOT NULL,
        lotno VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    if (!$conn->query($sql)) {
        error_log("Error creating rolls table: " . $conn->error);
    }
    
    // Create admin_settings table
    $sql_admin = "CREATE TABLE IF NOT EXISTS admin_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    if (!$conn->query($sql_admin)) {
        error_log("Error creating admin_settings table: " . $conn->error);
    }
    
    // Insert default admin password if table is empty
    $check_admin = "SELECT COUNT(*) as count FROM admin_settings";
    $result = $conn->query($check_admin);
    if ($result && $result->fetch_assoc()['count'] == 0) {
        $default_password = password_hash('admin123', PASSWORD_DEFAULT);
        $insert_admin = "INSERT INTO admin_settings (password_hash) VALUES ('$default_password')";
        $conn->query($insert_admin);
    }
}

// Create tables when config is loaded
createTablesIfNotExist($conn);

// Admin settings
$ADMIN_SESSION_TIMEOUT = 3600; // 1 hour in seconds

// Application settings
$MAX_UPLOAD_SIZE = '10M';
$ALLOWED_EXPORT_FORMATS = ['xlsx', 'csv'];
$DEFAULT_ROLLS_PER_PAGE = 50;

// Enable error logging for debugging (disable in production)
$DEBUG_MODE = false;
if ($DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    ini_set('log_errors', 1);
    ini_set('error_log', 'debug.log');
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

?>
