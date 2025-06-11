<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    $request_method = $_SERVER['REQUEST_METHOD'] ?? 'POST';
    if ($request_method !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        exit;
    }

    // Validate required fields - check both rollNumber and rollnumber
    $rollNumber = $input['rollNumber'] ?? $input['rollnumber'] ?? null;
    $material = $input['material'] ?? null;
    $paperCompany = $input['paperCompany'] ?? $input['papercompany'] ?? null;
    $gsm = $input['gsm'] ?? null;
    $width = $input['width'] ?? null;
    $length = $input['length'] ?? null;
    $weight = $input['weight'] ?? null;    // Handle lotNo with both capitalization variations
    $lotNo = isset($input['lotNo']) ? $input['lotNo'] : (isset($input['lotno']) ? $input['lotno'] : null);

    if (!$rollNumber || !$material || !$paperCompany || !$gsm || !$width || !$length || !$weight) {
        echo json_encode(['success' => false, 'message' => 'Required fields are missing']);
        exit;
    }
    
    // Only set lotNo to N/A if it's truly empty or null
    // Allow users to enter "0" or any other value they want
    if ($lotNo === null || trim($lotNo) === '') {
        $lotNo = 'N/A';
    } else {
        // Keep the user's input, just trim whitespace
        $lotNo = trim($lotNo);
    }

    // Check if roll number already exists
    $check_sql = "SELECT id FROM rolls WHERE rollnumber = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("s", $rollNumber);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Roll number already exists']);
        exit;
    }
    
    // Calculate square meter
    $squareMeter = ($width * $length) / 1000;
      // Insert new roll
    $sql = "INSERT INTO rolls (
        rollnumber, material, papercompany, gsm, width, length, weight, 
        lotno, squaremeter, mainrollnumber, rolltype, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Main Roll', 'Stock')";
      $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssiiidsss", 
        $rollNumber, $material, $paperCompany, $gsm, $width, $length, 
        $weight, $lotNo, $squareMeter, $rollNumber
    );
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Roll added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add roll']);
    }
    
} catch(Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
