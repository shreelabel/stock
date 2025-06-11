<?php
// Suppress PHP errors for clean JSON output
error_reporting(0);
ini_set('display_errors', 0);

// Database configuration for Paper Stock Management System
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'bappa';

// Create connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    // Return JSON error instead of dying
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
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
        material VARCHAR(100),
        papercompany VARCHAR(100),
        gsm VARCHAR(20),
        width VARCHAR(20),
        length VARCHAR(20),
        weight DECIMAL(10,2),
        lotno VARCHAR(50),
        squaremeter DECIMAL(10,2),
        rolltype VARCHAR(50) DEFAULT 'Main Roll',
        status VARCHAR(20) DEFAULT 'Stock',
        originalroll VARCHAR(50),
        jobname VARCHAR(100),
        jobno VARCHAR(50),
        jobsize VARCHAR(50),
        date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_rollnumber (rollnumber),
        INDEX idx_material (material),
        INDEX idx_status (status),
        INDEX idx_papercompany (papercompany),
        INDEX idx_date_added (date_added)
    )";
    
    if ($conn->query($sql) === FALSE) {
        error_log("Error creating rolls table: " . $conn->error);
    }

    // Create admin_settings table for storing admin password
    $sql_settings = "CREATE TABLE IF NOT EXISTS admin_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_name VARCHAR(50) NOT NULL UNIQUE,
        setting_value TEXT NOT NULL,
        date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    if ($conn->query($sql_settings) === FALSE) {
        error_log("Error creating admin_settings table: " . $conn->error);
    }

    // Insert default admin password if not exists
    $check_password = "SELECT * FROM admin_settings WHERE setting_name = 'admin_password'";
    $result = $conn->query($check_password);
    
    if ($result->num_rows == 0) {
        $default_password = password_hash('admin123', PASSWORD_DEFAULT);
        $insert_password = "INSERT INTO admin_settings (setting_name, setting_value) VALUES ('admin_password', ?)";
        $stmt = $conn->prepare($insert_password);
        $stmt->bind_param("s", $default_password);
        $stmt->execute();
        $stmt->close();
    }
}

// Create tables
createTablesIfNotExist($conn);

// Function to send JSON response
function sendResponse($success, $message = '', $data = null) {
    header('Content-Type: application/json');
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response = array_merge($response, $data);
    }
    
    echo json_encode($response);
    exit;
}

// Function to validate required fields
function validateRequired($data, $required_fields) {
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            return "Field '$field' is required";
        }
    }
    return null;
}

// Function to sanitize input
function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)));
}
?>
