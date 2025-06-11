<?php
/*
 * Paper Stock Management System - Web Installer
 * Version: 1.0
 * Compatible with InfinityFree and other shared hosting providers
 * Uses MySQLi (No PDO Required)
 */

// Error handling for hosting environments
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set('display_errors', 0);

// Start session with error handling
if (session_status() === PHP_SESSION_NONE) {
    @session_start();
}

// Installation configuration
$version = "1.0";
$app_name = "Paper Stock Management System";
$required_php_version = "7.4";

// Installer state
$step = isset($_GET['step']) ? (int)$_GET['step'] : 1;
$max_steps = 6;

// Handle POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    switch ($step) {
        case 2: // Requirements check
            $_SESSION['requirements_passed'] = true;
            header('Location: install.php?step=3');
            exit;
            
        case 3: // Database configuration
            $db_host = trim($_POST['db_host']);
            $db_name = trim($_POST['db_name']);
            $db_user = trim($_POST['db_user']);
            $db_pass = $_POST['db_pass']; // Don't trim password
            
            // Test database connection
            $connection_test = testDatabaseConnection($db_host, $db_user, $db_pass, $db_name);
            
            if ($connection_test['success']) {
                $_SESSION['db_config'] = [
                    'host' => $db_host,
                    'name' => $db_name,
                    'user' => $db_user,
                    'pass' => $db_pass
                ];
                header('Location: install.php?step=4');
                exit;
            } else {
                $db_error = $connection_test['error'];
            }
            break;
            
        case 4: // Admin configuration
            $admin_username = trim($_POST['admin_username']);
            $admin_password = $_POST['admin_password'];
            $admin_password_confirm = $_POST['admin_password_confirm'];
            
            if (strlen($admin_password) < 6) {
                $admin_error = "Password must be at least 6 characters long";
            } elseif ($admin_password !== $admin_password_confirm) {
                $admin_error = "Passwords do not match";
            } else {
                $_SESSION['admin_config'] = [
                    'username' => $admin_username,
                    'password' => $admin_password
                ];
                header('Location: install.php?step=5');
                exit;
            }
            break;
            
        case 5: // Installation process
            if (isset($_POST['start_installation'])) {
                $installation_result = performInstallation();
                if ($installation_result['success']) {
                    $_SESSION['installation_complete'] = true;
                    header('Location: install.php?step=6');
                    exit;
                } else {
                    $installation_error = $installation_result['error'];
                }
            }
            break;
    }
}

// Functions
function testDatabaseConnection($host, $user, $pass, $db) {
    try {
        // Suppress connection warnings for cleaner error handling
        $conn = @new mysqli($host, $user, $pass, $db);
        if ($conn->connect_error) {
            return ['success' => false, 'error' => 'Connection failed: ' . $conn->connect_error];
        }
        
        // Test if we can actually query the database
        $test_query = $conn->query("SELECT 1");
        if (!$test_query) {
            $conn->close();
            return ['success' => false, 'error' => 'Database access test failed: ' . $conn->error];
        }
        
        $conn->close();
        return ['success' => true];
    } catch (Exception $e) {
        return ['success' => false, 'error' => 'Connection error: ' . $e->getMessage()];
    } catch (mysqli_sql_exception $e) {
        return ['success' => false, 'error' => 'MySQL error: ' . $e->getMessage()];
    }
}

function performInstallation() {
    $db = $_SESSION['db_config'];
    $admin = $_SESSION['admin_config'];
    
    try {
        // Connect to database
        $conn = new mysqli($db['host'], $db['user'], $db['pass'], $db['name']);
        if ($conn->connect_error) {
            throw new Exception("Database connection failed: " . $conn->connect_error);
        }
        
        $conn->set_charset("utf8");
        
        // Create tables
        $tables_created = createTables($conn);
        if (!$tables_created['success']) {
            throw new Exception("Failed to create tables: " . $tables_created['error']);
        }
        
        // Setup admin user
        $admin_setup = setupAdminUser($conn, $admin['password']);
        if (!$admin_setup['success']) {
            throw new Exception("Failed to setup admin user: " . $admin_setup['error']);
        }
        
        // Add sample data
        $sample_data = addSampleData($conn);
        if (!$sample_data['success']) {
            throw new Exception("Failed to add sample data: " . $sample_data['error']);
        }
        
        // Create config file
        $config_created = createConfigFile($db);
        if (!$config_created['success']) {
            throw new Exception("Failed to create config file: " . $config_created['error']);
        }
        
        $conn->close();
        return ['success' => true];
        
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

function createTables($conn) {
    try {
        // Create rolls table
        $sql_rolls = "CREATE TABLE IF NOT EXISTS rolls (
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
        
        if (!$conn->query($sql_rolls)) {
            throw new Exception("Error creating rolls table: " . $conn->error);
        }
        
        // Create admin_settings table
        $sql_admin = "CREATE TABLE IF NOT EXISTS admin_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_name VARCHAR(50) NOT NULL UNIQUE,
            setting_value TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        
        if (!$conn->query($sql_admin)) {
            throw new Exception("Error creating admin_settings table: " . $conn->error);
        }
        
        return ['success' => true];
        
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

function setupAdminUser($conn, $password) {
    try {
        // Hash the password
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        
        // Check if admin password already exists
        $check_sql = "SELECT * FROM admin_settings WHERE setting_name = 'admin_password'";
        $result = $conn->query($check_sql);
        
        if ($result->num_rows > 0) {
            // Update existing password
            $update_sql = "UPDATE admin_settings SET setting_value = ? WHERE setting_name = 'admin_password'";
            $stmt = $conn->prepare($update_sql);
            $stmt->bind_param("s", $password_hash);
        } else {
            // Insert new password
            $insert_sql = "INSERT INTO admin_settings (setting_name, setting_value) VALUES ('admin_password', ?)";
            $stmt = $conn->prepare($insert_sql);
            $stmt->bind_param("s", $password_hash);
        }
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to setup admin password: " . $stmt->error);
        }
        
        $stmt->close();
        return ['success' => true];
        
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

function addSampleData($conn) {
    try {
        // Check if sample data already exists
        $check_sql = "SELECT COUNT(*) as count FROM rolls WHERE rollnumber = 'SAMPLE001'";
        $result = $conn->query($check_sql);
        $row = $result->fetch_assoc();
        
        if ($row['count'] == 0) {
            // Add sample roll
            $insert_sql = "INSERT INTO rolls (rollnumber, material, papercompany, gsm, width, length, weight, lotno, squaremeter, status, rolltype) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($insert_sql);
            
            $rollnumber = 'SAMPLE001';
            $material = 'Art Paper';
            $papercompany = 'Sample Company';
            $gsm = '80';
            $width = '1000';
            $length = '2000';
            $weight = 160.00;
            $lotno = 'LOT001';
            $squaremeter = 2000.00;
            $status = 'Stock';
            $rolltype = 'Main Roll';
            
            $stmt->bind_param("ssssssddsss", $rollnumber, $material, $papercompany, $gsm, $width, $length, $weight, $lotno, $squaremeter, $status, $rolltype);
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to add sample data: " . $stmt->error);
            }
            
            $stmt->close();
        }
        
        return ['success' => true];
        
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

function createConfigFile($db) {
    try {
        $config_content = "<?php
// Database configuration for Paper Stock Management System
// Generated by installer on " . date('Y-m-d H:i:s') . "

// Suppress PHP errors for clean JSON output
error_reporting(0);
ini_set('display_errors', 0);

\$host = '" . addslashes($db['host']) . "';
\$username = '" . addslashes($db['user']) . "';
\$password = '" . addslashes($db['pass']) . "';
\$database = '" . addslashes($db['name']) . "';

// Create connection
\$conn = new mysqli(\$host, \$username, \$password, \$database);

// Check connection
if (\$conn->connect_error) {
    // Return JSON error instead of dying
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

// Set charset
\$conn->set_charset(\"utf8\");

// Function to send JSON response
function sendResponse(\$success, \$message = '', \$data = null) {
    header('Content-Type: application/json');
    \$response = [
        'success' => \$success,
        'message' => \$message
    ];
    
    if (\$data !== null) {
        \$response['data'] = \$data;
    }
    
    echo json_encode(\$response);
    exit;
}
?>";        $config_dir = __DIR__ . '/api';
        if (!is_dir($config_dir)) {
            if (!mkdir($config_dir, 0755, true)) {
                throw new Exception("Failed to create api directory");
            }
        }
        
        $config_file = $config_dir . '/config.php';
        if (file_put_contents($config_file, $config_content) === false) {
            throw new Exception("Failed to write config file");
        }
        
        return ['success' => true];
        
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

function checkRequirements() {
    $requirements = [];
    
    // PHP Version
    $php_version = phpversion();
    $requirements['php_version'] = [
        'name' => 'PHP Version',
        'required' => $GLOBALS['required_php_version'] . '+',
        'current' => $php_version,
        'status' => version_compare($php_version, $GLOBALS['required_php_version'], '>=')
    ];
    
    // MySQLi Extension
    $requirements['mysqli'] = [
        'name' => 'MySQLi Extension',
        'required' => 'Enabled',
        'current' => extension_loaded('mysqli') ? 'Available' : 'Not Available',
        'status' => extension_loaded('mysqli')
    ];
    
    // File Permissions
    $requirements['file_write'] = [
        'name' => 'File Write Permissions',
        'required' => 'Writable',
        'current' => is_writable(__DIR__) ? 'Writable' : 'Not Writable',
        'status' => is_writable(__DIR__)
    ];
    
    // JSON Extension
    $requirements['json'] = [
        'name' => 'JSON Extension',
        'required' => 'Enabled',
        'current' => extension_loaded('json') ? 'Available' : 'Not Available',
        'status' => extension_loaded('json')
    ];
    
    return $requirements;
}

?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title><?php echo htmlspecialchars($app_name); ?> - Installation</title>
    <meta name="robots" content="noindex, nofollow">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" integrity="sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg==" crossorigin="anonymous">    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .installer-container {
            max-width: 800px;
            margin: 50px auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .installer-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .step-indicator {
            display: flex;
            justify-content: center;
            margin: 30px 0;
        }
        .step {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e9ecef;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 10px;
            font-weight: bold;
            position: relative;
        }
        .step.active {
            background: #28a745;
            color: white;
        }
        .step.completed {
            background: #007bff;
            color: white;
        }
        .step:not(:last-child)::after {
            content: '';
            position: absolute;
            left: 50px;
            top: 50%;
            width: 20px;
            height: 2px;
            background: #e9ecef;
        }
        .step.completed:not(:last-child)::after {
            background: #007bff;
        }
        .requirement-item {
            padding: 15px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            margin-bottom: 10px;
        }
        .requirement-pass {
            border-color: #28a745;
            background-color: #f8fff9;
        }
        .requirement-fail {
            border-color: #dc3545;
            background-color: #fff8f8;
        }
        .progress-container {
            margin: 20px 0;
        }
        .installation-log {
            max-height: 300px;
            overflow-y: auto;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
        }
        /* Fallback styles for when Bootstrap doesn't load */
        .btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 4px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
        }
        .btn:hover { background: #0056b3; }
        .btn-primary { background: #007bff; }
        .btn-success { background: #28a745; }
        .btn-danger { background: #dc3545; }
        .btn-lg { padding: 16px 32px; font-size: 18px; }
        .alert {
            padding: 15px;
            margin: 15px 0;
            border-radius: 6px;
            border: 1px solid;
        }
        .alert-info { background: #d1ecf1; border-color: #bee5eb; color: #0c5460; }
        .alert-success { background: #d4edda; border-color: #c3e6cb; color: #155724; }
        .alert-warning { background: #fff3cd; border-color: #ffeaa7; color: #856404; }
        .alert-danger { background: #f8d7da; border-color: #f5c6cb; color: #721c24; }
        .form-control {
            width: 100%;
            padding: 10px;
            margin: 5px 0;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
        }
        .form-label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .text-center { text-align: center; }
        .mt-3, .mt-4 { margin-top: 20px; }
        .mb-3 { margin-bottom: 15px; }
        .p-4 { padding: 30px; }
        .row { display: flex; flex-wrap: wrap; }
        .col-md-6 { flex: 0 0 50%; max-width: 50%; padding: 0 15px; }
        @media (max-width: 768px) {
            .col-md-6 { flex: 0 0 100%; max-width: 100%; }
        }
    </style>
</head>
<body>
    <div class="installer-container">
        <div class="installer-header">
            <h1><i class="fas fa-industry"></i> <?php echo $app_name; ?></h1>
            <p class="mb-0">Version <?php echo $version; ?> - Installation Wizard</p>
        </div>

        <div class="step-indicator">
            <?php for ($i = 1; $i <= $max_steps; $i++): ?>
                <div class="step <?php echo $i < $step ? 'completed' : ($i == $step ? 'active' : ''); ?>">
                    <?php echo $i; ?>
                </div>
            <?php endfor; ?>
        </div>

        <div class="p-4">
            <?php switch ($step): case 1: ?>
                <!-- Step 1: Welcome -->
                <h2><i class="fas fa-home text-primary"></i> Welcome to Installation</h2>
                <p class="lead">This installer will help you set up your Paper Stock Management System on your web server.</p>
                
                <div class="alert alert-info">
                    <h5><i class="fas fa-info-circle"></i> What this installer will do:</h5>
                    <ul class="mb-0">
                        <li>Check system requirements</li>
                        <li>Test database connection</li>
                        <li>Create necessary database tables</li>
                        <li>Set up admin credentials</li>
                        <li>Configure the application</li>
                        <li>Add sample data for testing</li>
                    </ul>
                </div>

                <div class="alert alert-warning">
                    <h5><i class="fas fa-exclamation-triangle"></i> Before you start:</h5>
                    <ul class="mb-0">
                        <li>Make sure you have created a MySQL database</li>
                        <li>Have your database credentials ready</li>
                        <li>Ensure your web server supports PHP 7.4 or higher</li>
                        <li>Make sure the MySQLi extension is enabled</li>
                    </ul>
                </div>

                <div class="text-center mt-4">
                    <a href="install.php?step=2" class="btn btn-primary btn-lg">
                        <i class="fas fa-arrow-right"></i> Start Installation
                    </a>
                </div>

            <?php break; case 2: ?>
                <!-- Step 2: System Requirements -->
                <h2><i class="fas fa-check-circle text-primary"></i> System Requirements</h2>
                <p>Checking if your server meets the requirements...</p>

                <?php 
                $requirements = checkRequirements();
                $all_passed = true;
                foreach ($requirements as $req) {
                    if (!$req['status']) $all_passed = false;
                }
                ?>

                <?php foreach ($requirements as $key => $req): ?>
                    <div class="requirement-item <?php echo $req['status'] ? 'requirement-pass' : 'requirement-fail'; ?>">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <strong><?php echo $req['name']; ?></strong>
                                <br><small class="text-muted">Required: <?php echo $req['required']; ?></small>
                            </div>
                            <div class="text-end">
                                <span class="badge <?php echo $req['status'] ? 'bg-success' : 'bg-danger'; ?>">
                                    <?php echo $req['status'] ? 'PASS' : 'FAIL'; ?>
                                </span>
                                <br><small><?php echo $req['current']; ?></small>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>

                <?php if ($all_passed): ?>
                    <div class="alert alert-success mt-3">
                        <i class="fas fa-check-circle"></i> All requirements passed! You can proceed with the installation.
                    </div>
                    <form method="post" class="text-center">
                        <button type="submit" class="btn btn-success btn-lg">
                            <i class="fas fa-arrow-right"></i> Continue
                        </button>
                    </form>
                <?php else: ?>
                    <div class="alert alert-danger mt-3">
                        <i class="fas fa-exclamation-triangle"></i> Some requirements are not met. Please contact your hosting provider or check your server configuration.
                    </div>
                    <div class="text-center">
                        <a href="install.php?step=2" class="btn btn-outline-primary">
                            <i class="fas fa-refresh"></i> Recheck Requirements
                        </a>
                    </div>
                <?php endif; ?>

            <?php break; case 3: ?>
                <!-- Step 3: Database Configuration -->
                <h2><i class="fas fa-database text-primary"></i> Database Configuration</h2>
                <p>Enter your database connection details:</p>

                <?php if (isset($db_error)): ?>
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle"></i> <?php echo htmlspecialchars($db_error); ?>
                    </div>
                <?php endif; ?>

                <form method="post">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">                                <label for="db_host" class="form-label">Database Host</label>
                                <input type="text" class="form-control" id="db_host" name="db_host" 
                                       value="<?php echo htmlspecialchars($_POST['db_host'] ?? 'sql12.freesqldatabase.com'); ?>" required>
                                <small class="form-text text-muted">FreeMySQL Host: sql12.freesqldatabase.com</small>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">                                <label for="db_name" class="form-label">Database Name</label>
                                <input type="text" class="form-control" id="db_name" name="db_name" 
                                       value="<?php echo htmlspecialchars($_POST['db_name'] ?? 'sql12784281'); ?>" required>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">                                <label for="db_user" class="form-label">Database Username</label>
                                <input type="text" class="form-control" id="db_user" name="db_user" 
                                       value="<?php echo htmlspecialchars($_POST['db_user'] ?? 'sql12784281'); ?>" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="db_pass" class="form-label">Database Password</label>
                                <input type="password" class="form-control" id="db_pass" name="db_pass">
                                <small class="form-text text-muted">Leave blank if no password is required</small>
                            </div>
                        </div>
                    </div>                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i> <strong>For InfinityFree users:</strong> 
                        <ul class="mb-0 mt-2">
                            <li>Database Host: Usually <code>sql200.infinityfree.com</code> or similar</li>
                            <li>Database Name: Starts with <code>if0_</code> followed by numbers</li>
                            <li>Username: Usually starts with <code>if0_</code></li>
                            <li>Find these details in your VistaPanel under "MySQL Databases"</li>
                        </ul>
                    </div>

                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i> <strong>Common Issues:</strong>
                        <ul class="mb-0 mt-2">
                            <li>Make sure the database exists before installing</li>
                            <li>Check that your hosting account is not suspended</li>
                            <li>Verify the database details are exactly as shown in your control panel</li>
                        </ul>
                    </div>

                    <div class="text-center">
                        <button type="submit" class="btn btn-primary btn-lg">
                            <i class="fas fa-plug"></i> Test Connection & Continue
                        </button>
                    </div>
                </form>

            <?php break; case 4: ?>
                <!-- Step 4: Admin Configuration -->
                <h2><i class="fas fa-user-shield text-primary"></i> Admin Configuration</h2>
                <p>Set up your admin credentials:</p>

                <?php if (isset($admin_error)): ?>
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle"></i> <?php echo htmlspecialchars($admin_error); ?>
                    </div>
                <?php endif; ?>

                <form method="post">
                    <div class="row justify-content-center">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="admin_username" class="form-label">Admin Username</label>
                                <input type="text" class="form-control" id="admin_username" name="admin_username" 
                                       value="<?php echo htmlspecialchars($_POST['admin_username'] ?? 'admin'); ?>" required>
                                <small class="form-text text-muted">This is for display purposes only</small>
                            </div>
                            <div class="mb-3">
                                <label for="admin_password" class="form-label">Admin Password</label>
                                <input type="password" class="form-control" id="admin_password" name="admin_password" required>
                                <small class="form-text text-muted">Minimum 6 characters</small>
                            </div>
                            <div class="mb-3">
                                <label for="admin_password_confirm" class="form-label">Confirm Password</label>
                                <input type="password" class="form-control" id="admin_password_confirm" name="admin_password_confirm" required>
                            </div>
                        </div>
                    </div>

                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i> <strong>Important:</strong> Remember this password! You'll need it to access the admin features of your application.
                    </div>

                    <div class="text-center">
                        <button type="submit" class="btn btn-success btn-lg">
                            <i class="fas fa-arrow-right"></i> Continue
                        </button>
                    </div>
                </form>

            <?php break; case 5: ?>
                <!-- Step 5: Installation Process -->
                <h2><i class="fas fa-cog text-primary"></i> Installation Process</h2>
                <p>Ready to install the application with the following settings:</p>

                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-primary text-white">
                                <i class="fas fa-database"></i> Database Configuration
                            </div>
                            <div class="card-body">
                                <p><strong>Host:</strong> <?php echo htmlspecialchars($_SESSION['db_config']['host']); ?></p>
                                <p><strong>Database:</strong> <?php echo htmlspecialchars($_SESSION['db_config']['name']); ?></p>
                                <p><strong>Username:</strong> <?php echo htmlspecialchars($_SESSION['db_config']['user']); ?></p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-success text-white">
                                <i class="fas fa-user-shield"></i> Admin Configuration
                            </div>
                            <div class="card-body">
                                <p><strong>Username:</strong> <?php echo htmlspecialchars($_SESSION['admin_config']['username']); ?></p>
                                <p><strong>Password:</strong> ••••••••</p>
                            </div>
                        </div>
                    </div>
                </div>

                <?php if (isset($installation_error)): ?>
                    <div class="alert alert-danger mt-3">
                        <i class="fas fa-exclamation-triangle"></i> Installation failed: <?php echo htmlspecialchars($installation_error); ?>
                    </div>
                    <div class="text-center">
                        <a href="install.php?step=3" class="btn btn-outline-primary">
                            <i class="fas fa-arrow-left"></i> Go Back
                        </a>
                    </div>
                <?php else: ?>
                    <form method="post" class="text-center mt-4">
                        <button type="submit" name="start_installation" class="btn btn-success btn-lg">
                            <i class="fas fa-play"></i> Start Installation
                        </button>
                    </form>
                <?php endif; ?>

            <?php break; case 6: ?>
                <!-- Step 6: Installation Complete -->
                <h2><i class="fas fa-check-circle text-success"></i> Installation Complete!</h2>
                
                <div class="alert alert-success">
                    <h4><i class="fas fa-party-horn"></i> Congratulations!</h4>
                    <p>Your Paper Stock Management System has been successfully installed and configured.</p>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="card border-success">
                            <div class="card-header bg-success text-white">
                                <i class="fas fa-info-circle"></i> Installation Summary
                            </div>
                            <div class="card-body">
                                <ul class="list-unstyled">
                                    <li><i class="fas fa-check text-success"></i> Database tables created</li>
                                    <li><i class="fas fa-check text-success"></i> Admin user configured</li>
                                    <li><i class="fas fa-check text-success"></i> Configuration file created</li>
                                    <li><i class="fas fa-check text-success"></i> Sample data added</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card border-info">
                            <div class="card-header bg-info text-white">
                                <i class="fas fa-key"></i> Login Credentials
                            </div>
                            <div class="card-body">
                                <p><strong>Admin Username:</strong> <?php echo htmlspecialchars($_SESSION['admin_config']['username']); ?></p>
                                <p><strong>Admin Password:</strong> [The password you set]</p>
                                <small class="text-muted">Use these credentials to access admin features</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="alert alert-warning mt-3">
                    <h5><i class="fas fa-shield-alt"></i> Security Notice</h5>
                    <p><strong>Important:</strong> For security reasons, please delete this installer file (<code>install.php</code>) from your server after installation.</p>
                </div>

                <div class="alert alert-info">
                    <h5><i class="fas fa-rocket"></i> Next Steps</h5>
                    <ol>
                        <li>Delete the installer file <code>install.php</code></li>
                        <li>Access your application by visiting <code><?php echo (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']); ?>/index.html</code></li>
                        <li>Login with your admin credentials</li>
                        <li>Start managing your paper stock!</li>
                    </ol>
                </div>

                <div class="text-center mt-4">
                    <a href="index.html" class="btn btn-primary btn-lg me-3">
                        <i class="fas fa-external-link-alt"></i> Launch Application
                    </a>
                    <a href="<?php echo $_SERVER['SCRIPT_NAME']; ?>?delete=true" class="btn btn-danger btn-lg" 
                       onclick="return confirm('Are you sure you want to delete the installer? This action cannot be undone.')">
                        <i class="fas fa-trash"></i> Delete Installer
                    </a>
                </div>

            <?php break; endswitch; ?>
        </div>
    </div>    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
    
    <?php if ($step == 5 && isset($_POST['start_installation'])): ?>
    <script>
        // Auto-refresh to show installation progress
        setTimeout(function() {
            try {
                window.location.reload();
            } catch(e) {
                // Fallback for environments with strict JavaScript policies
                window.location.href = window.location.href;
            }
        }, 3000);
    </script>
    <?php endif; ?>
    
    <script>
        // Enhanced form validation and user experience
        document.addEventListener('DOMContentLoaded', function() {
            // Password confirmation validation
            var passwordField = document.getElementById('admin_password');
            var confirmField = document.getElementById('admin_password_confirm');
            
            if (passwordField && confirmField) {
                function validatePasswords() {
                    if (passwordField.value !== confirmField.value) {
                        confirmField.setCustomValidity('Passwords do not match');
                    } else {
                        confirmField.setCustomValidity('');
                    }
                }
                
                passwordField.addEventListener('input', validatePasswords);
                confirmField.addEventListener('input', validatePasswords);
            }
            
            // Form submission loading states
            var forms = document.querySelectorAll('form');
            forms.forEach(function(form) {
                form.addEventListener('submit', function() {
                    var submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        var originalText = submitBtn.innerHTML;
                        submitBtn.innerHTML = '<span>Processing...</span>';
                        submitBtn.disabled = true;
                        
                        // Re-enable after 10 seconds as fallback
                        setTimeout(function() {
                            submitBtn.innerHTML = originalText;
                            submitBtn.disabled = false;
                        }, 10000);
                    }
                });
            });
        });
    </script>
</body>
</html>

<?php
// Handle installer deletion
if (isset($_GET['delete']) && $_GET['delete'] === 'true') {
    if (unlink(__FILE__)) {
        echo "<script>alert('Installer deleted successfully!'); window.location.href = 'index.html';</script>";
    } else {
        echo "<script>alert('Failed to delete installer. Please delete it manually.');</script>";
    }
}
?>
