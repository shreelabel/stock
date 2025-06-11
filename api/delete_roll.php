<?php
header('Content-Type: application/json');
require_once 'config.php';

// Handle both web requests and CLI execution
$request_method = $_SERVER['REQUEST_METHOD'] ?? 'POST';
if ($request_method !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['rollNumber'])) {
    echo json_encode(['success' => false, 'message' => 'Roll number is required']);
    exit;
}

try {
    // Check if this is the protected sample roll
    if ($input['rollNumber'] === '123456') {
        echo json_encode(['success' => false, 'message' => 'Cannot delete protected sample roll 123456']);
        exit;
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    // Get the roll to be deleted
    $stmt = $conn->prepare("SELECT * FROM rolls WHERE rollnumber = ?");
    $stmt->bind_param("s", $input['rollNumber']);
    $stmt->execute();
    $result = $stmt->get_result();
    $roll = $result->fetch_assoc();
    
    if (!$roll) {
        echo json_encode(['success' => false, 'message' => 'Roll not found']);
        exit;
    }
    
    // If this is a main roll, delete all related child rolls
    if ($roll['rolltype'] === 'Main Roll') {
        $stmt = $conn->prepare("DELETE FROM rolls WHERE mainrollnumber = ?");
        $stmt->bind_param("s", $roll['rollnumber']);
        $stmt->execute();
    } else {
        // If this is a child roll, just delete this specific roll
        $stmt = $conn->prepare("DELETE FROM rolls WHERE rollnumber = ?");
        $stmt->bind_param("s", $input['rollNumber']);
        $stmt->execute();
    }
    
    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Roll deleted successfully']);
    
} catch(Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
