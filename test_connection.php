<?php
/*
 * Database Connection Test for FreeMySQL Hosting
 * Use this file to verify your database connection
 * Delete this file after successful testing
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Database Connection Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .success { color: green; background: #f0fff0; padding: 10px; border: 1px solid green; }
        .error { color: red; background: #fff0f0; padding: 10px; border: 1px solid red; }
        .info { color: blue; background: #f0f0ff; padding: 10px; border: 1px solid blue; }
    </style>
</head>
<body>
    <h1>🧪 Paper Stock Management - Database Test</h1>
    
    <?php
    // FreeMySQL Database Configuration
    $host = 'sql12.freesqldatabase.com';
    $username = 'sql12784281';
    $password = 'TTfcAuK6pP';
    $database = 'sql12784281';
    $port = 3306;
    
    echo "<div class='info'>";
    echo "<h3>Testing Connection to:</h3>";
    echo "<strong>Host:</strong> $host<br>";
    echo "<strong>Database:</strong> $database<br>";
    echo "<strong>Username:</strong> $username<br>";
    echo "<strong>Port:</strong> $port<br>";
    echo "</div>";
    
    // Test connection
    try {
        $conn = new mysqli($host, $username, $password, $database, $port);
        
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
        
        echo "<div class='success'>";
        echo "<h3>✅ Database Connection Successful!</h3>";
        echo "Connected to FreeMySQL database successfully.<br>";
        echo "<strong>MySQL Version:</strong> " . $conn->server_info . "<br>";
        echo "</div>";
        
        // Test if tables exist
        $tables_query = "SHOW TABLES";
        $result = $conn->query($tables_query);
        
        if ($result) {
            echo "<div class='info'>";
            echo "<h3>📋 Database Tables:</h3>";
            
            if ($result->num_rows > 0) {
                echo "<ul>";
                while ($row = $result->fetch_array()) {
                    echo "<li>" . $row[0] . "</li>";
                }
                echo "</ul>";
            } else {
                echo "No tables found. Run the installer to create tables.";
            }
            echo "</div>";
        }
        
        // Test rolls table if exists
        $check_rolls = "SELECT COUNT(*) as count FROM rolls";
        $rolls_result = $conn->query($check_rolls);
        
        if ($rolls_result) {
            $row = $rolls_result->fetch_assoc();
            echo "<div class='success'>";
            echo "<h3>📊 Rolls Table Status:</h3>";
            echo "Total rolls in database: <strong>" . $row['count'] . "</strong>";
            echo "</div>";
        }
        
        $conn->close();
        
    } catch (Exception $e) {
        echo "<div class='error'>";
        echo "<h3>❌ Connection Failed!</h3>";
        echo "<strong>Error:</strong> " . $e->getMessage() . "<br><br>";
        echo "<h4>Possible Solutions:</h4>";
        echo "<ul>";
        echo "<li>Verify FreeMySQL database credentials</li>";
        echo "<li>Check if database service is active</li>";
        echo "<li>Ensure database 'sql12784281' exists</li>";
        echo "<li>Contact FreeMySQL support if issue persists</li>";
        echo "</ul>";
        echo "</div>";
    }
    ?>
    
    <div class='info'>
        <h3>🚀 Next Steps:</h3>
        <ol>
            <li>If connection is successful, you can access: <a href="index.html">Paper Stock Management System</a></li>
            <li>Use the <a href="Install.php">Web Installer</a> if tables need to be created</li>
            <li>Default admin password: <strong>admin123</strong></li>
            <li><strong>Important:</strong> Delete this test file after verification</li>
        </ol>
    </div>
    
    <hr>
    <p><small>Paper Stock Management System - Hosting Setup Test<br>
    Delete this file (test_connection.php) after successful testing.</small></p>
</body>
</html>
