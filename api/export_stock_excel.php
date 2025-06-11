<?php
// Export Stock to Excel - Scheduled Export API
// This file can be called via command line for scheduled exports

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database configuration
$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'bappa';

// Function to log messages
function logMessage($message) {
    $timestamp = date('Y-m-d H:i:s');
    $logFile = __DIR__ . '/../exports/export_log.txt';
    
    // Ensure exports directory exists
    $exportsDir = __DIR__ . '/../exports';
    if (!is_dir($exportsDir)) {
        mkdir($exportsDir, 0755, true);
    }
    
    file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND | LOCK_EX);
    
    // Also output to console if running from command line
    if (php_sapi_name() === 'cli') {
        echo "[$timestamp] $message\n";
    }
}

// Function to create Excel-compatible CSV
function createExcelCSV($data, $filename) {
    $exportsDir = __DIR__ . '/../exports';
    if (!is_dir($exportsDir)) {
        mkdir($exportsDir, 0755, true);
    }
    
    $filepath = $exportsDir . '/' . $filename;
    
    $file = fopen($filepath, 'w');
    if (!$file) {
        throw new Exception("Cannot create file: $filepath");
    }
    
    // Write BOM for proper Unicode support in Excel
    fwrite($file, "\xEF\xBB\xBF");
      // Headers
    $headers = [
        'ID',
        'Roll Number',
        'Status',
        'Material',
        'Paper Company',
        'GSM',
        'Width (mm)',
        'Length (m)',
        'Weight (kg)',
        'Square Meter',
        'Lot No',
        'Job Name',
        'Job No',
        'Job Size',
        'Date Added'
    ];
    
    fputcsv($file, $headers);
    
    // Data rows
    foreach ($data as $row) {
        // Calculate square meter
        $squareMeter = ($row['width'] && $row['length']) ? 
            round(($row['width'] / 1000) * $row['length'], 2) : 0;
            
        $csvRow = [
            $row['id'],
            $row['rollnumber'],
            $row['status'],
            $row['material'],
            $row['papercompany'],
            $row['gsm'],
            $row['width'],
            $row['length'],
            $row['weight'],
            $squareMeter,
            $row['lotno'] ?: 'N/A',
            $row['jobname'] ?: '',
            $row['jobno'] ?: '',
            $row['jobsize'] ?: '',
            $row['date_added']
        ];
        fputcsv($file, $csvRow);
    }
    
    fclose($file);
    return $filepath;
}

try {
    logMessage("Starting scheduled stock export...");
    
    // Get database connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    logMessage("Database connection established");
      // Get all stock data
    $stmt = $pdo->prepare("
        SELECT 
            id,
            rollnumber,
            status,
            material,
            papercompany,
            gsm,
            width,
            length,
            weight,
            lotno,
            jobname,
            jobno,
            jobsize,
            date_added
        FROM rolls 
        ORDER BY date_added DESC
    ");
    
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    logMessage("Retrieved " . count($data) . " records from database");
    
    if (empty($data)) {
        logMessage("No data found to export");
        
        // Return JSON response if called via web
        if (php_sapi_name() !== 'cli') {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false, 
                'message' => 'No data found to export'
            ]);
        }
        exit;
    }
    
    // Create filename with timestamp
    $timestamp = date('Y-m-d_H-i-s');
    $filename = "stock_export_$timestamp.csv";
    
    // Create Excel CSV
    $filepath = createExcelCSV($data, $filename);
    
    logMessage("Export completed successfully: $filename");
    logMessage("File saved to: $filepath");
    
    // Clean up old exports (keep only last 10 files)
    $exportsDir = __DIR__ . '/../exports';
    $files = glob($exportsDir . '/stock_export_*.csv');
    if (count($files) > 10) {
        // Sort by modification time (oldest first)
        usort($files, function($a, $b) {
            return filemtime($a) - filemtime($b);
        });
        
        // Delete oldest files
        $filesToDelete = array_slice($files, 0, count($files) - 10);
        foreach ($filesToDelete as $fileToDelete) {
            if (unlink($fileToDelete)) {
                logMessage("Deleted old export: " . basename($fileToDelete));
            }
        }
    }
    
    // Return response
    if (php_sapi_name() === 'cli') {
        // Command line - exit with success
        logMessage("Export process completed successfully");
        exit(0);
    } else {
        // Web request - return JSON
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'Export completed successfully',
            'filename' => $filename,
            'records' => count($data),
            'filepath' => $filepath
        ]);
    }
    
} catch (PDOException $e) {
    $error = "Database error: " . $e->getMessage();
    logMessage("ERROR: $error");
    
    if (php_sapi_name() === 'cli') {
        exit(1);
    } else {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => $error
        ]);
    }
    
} catch (Exception $e) {
    $error = "Export error: " . $e->getMessage();
    logMessage("ERROR: $error");
    
    if (php_sapi_name() === 'cli') {
        exit(1);
    } else {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => $error
        ]);
    }
}
?>
