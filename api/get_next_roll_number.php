<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once 'config.php';

try {
    // Get the latest roll number from the database
    $sql = "SELECT rollnumber FROM rolls WHERE rollnumber NOT LIKE '%-%' ORDER BY id DESC LIMIT 1";
    $result = $conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $lastRollNumber = $row['rollnumber'];
        
        // Parse the roll number to extract prefix and number
        // Expected format: "prefix/parts/number" like "slk/uy/78"
        if (preg_match('/^(.+)(\d+)$/', $lastRollNumber, $matches)) {
            $prefix = $matches[1]; // Everything except the last number
            $lastNumber = intval($matches[2]); // The numeric part
            $nextNumber = $lastNumber + 1;
            $nextRollNumber = $prefix . $nextNumber;
            
            echo json_encode([
                'success' => true,
                'nextRollNumber' => $nextRollNumber,
                'lastRollNumber' => $lastRollNumber,
                'debug' => [
                    'prefix' => $prefix,
                    'lastNumber' => $lastNumber,
                    'nextNumber' => $nextNumber
                ]
            ]);
        } else {
            // If the format doesn't match expected pattern, suggest a default
            echo json_encode([
                'success' => true,
                'nextRollNumber' => '',
                'lastRollNumber' => $lastRollNumber,
                'message' => 'Unable to parse last roll number format. Please enter manually.',
                'debug' => [
                    'unparseable' => $lastRollNumber
                ]
            ]);
        }
    } else {
        // No rolls found, suggest a starting format
        echo json_encode([
            'success' => true,
            'nextRollNumber' => 'slk/uy/1',
            'lastRollNumber' => null,
            'message' => 'No previous rolls found. Starting with default format.'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error getting next roll number: ' . $e->getMessage()
    ]);
}
