<?php
header('Content-Type: application/json');
// Enable debugging temporarily
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

require_once 'config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
            exit;
        }

        // Validate required fields
        if (!isset($input['id']) || !isset($input['rollNumber'])) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields: id or rollNumber']);
            exit;
        }

        // Check if this is the protected sample roll
        if ($input['rollNumber'] === '123456') {
            echo json_encode(['success' => false, 'message' => 'Cannot edit protected sample roll 123456']);
            exit;
        }

        error_log("=== SIMPLE UPDATE DEBUG ===");
        error_log("ID: " . $input['id']);
        error_log("Data: " . json_encode($input));

        // Simple update without slitting for now
        $stmt = $conn->prepare("
            UPDATE rolls 
            SET rollnumber = ?, material = ?, papercompany = ?, gsm = ?, 
                width = ?, length = ?, weight = ?, lotno = ?, status = ?, 
                jobname = ?, jobno = ?, jobsize = ?
            WHERE id = ?
        ");
        
        if (!$stmt) {
            error_log("Prepare failed: " . $conn->error);
            echo json_encode(['success' => false, 'message' => 'Database prepare error: ' . $conn->error]);
            exit;
        }
        
        // All as strings to avoid type issues
        $stmt->bind_param("ssssssssssssi",
            $input['rollNumber'],
            $input['material'],
            $input['paperCompany'],
            $input['gsm'],
            $input['width'], 
            $input['length'],
            $input['weight'],
            $input['lotNo'],
            $input['status'],
            $input['jobName'],
            $input['jobNo'], 
            $input['jobSize'],
            $input['id']
        );
        
        if ($stmt->execute()) {
            error_log("Update successful for ID: " . $input['id']);
            echo json_encode(['success' => true, 'message' => 'Roll updated successfully']);
        } else {
            error_log("Execute failed: " . $stmt->error);
            echo json_encode(['success' => false, 'message' => 'Database execute error: ' . $stmt->error]);
        }
        
        $stmt->close();
        
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    }
    
} catch (Exception $e) {
    error_log("Exception in update_roll: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
} catch (Error $e) {
    error_log("Error in update_roll: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

$conn->close();
?>
