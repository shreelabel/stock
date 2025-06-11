<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }

    // Validate required fields
    if (!isset($input['rollNumber']) || !isset($input['slits']) || empty($input['slits'])) {
        throw new Exception('Missing required fields: rollNumber or slits');
    }

    // Start transaction
    $conn->begin_transaction();
    
    // Get original roll details
    $stmt = $conn->prepare("SELECT * FROM rolls WHERE rollnumber = ?");
    $stmt->bind_param("s", $input['rollNumber']);
    $stmt->execute();
    $result = $stmt->get_result();
    $originalRoll = $result->fetch_assoc();
    
    if (!$originalRoll) {
        throw new Exception('Original roll not found');
    }
    
    // Mark original roll as "Original"
    $updateOriginal = $conn->prepare("
        UPDATE rolls 
        SET status = 'Original', 
            rolltype = 'Main Roll'
        WHERE rollnumber = ?
    ");
    $updateOriginal->bind_param("s", $input['rollNumber']);
    $updateOriginal->execute();
    
    // Create slit rolls
    foreach ($input['slits'] as $index => $slit) {
        $newRollNumber = $input['rollNumber'] . '-' . ($index + 1);
          $stmt = $conn->prepare("
            INSERT INTO rolls (
                rollnumber, material, papercompany, gsm, width, length, weight, 
                lotno, status, date_added, squaremeter, rolltype, mainrollnumber,
                jobname, jobno, jobsize
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, 'Slit Roll', ?, ?, ?, ?)
        ");
        
        $squareMeter = ($slit['width'] * $slit['length']) / 1000;
        
        $stmt->bind_param("sssiiiisissssss",
            $newRollNumber,
            $originalRoll['material'],
            $originalRoll['papercompany'],
            $originalRoll['gsm'],
            $slit['width'],
            $slit['length'],
            $originalRoll['weight'],
            $originalRoll['lotno'],
            $slit['status'],
            $squareMeter,
            $input['rollNumber'],
            isset($slit['jobname']) ? $slit['jobname'] : '',
            isset($slit['jobno']) ? $slit['jobno'] : '',
            isset($slit['jobsize']) ? $slit['jobsize'] : ''
        );
        $stmt->execute();
    }
    
    $conn->commit();
    echo json_encode([
        'success' => true,
        'message' => 'Roll slitted successfully'
    ]);
    
} catch(Exception $e) {
    if (isset($conn)) {
        $conn->rollback();
    }
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
