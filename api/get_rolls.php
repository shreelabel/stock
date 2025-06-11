<?php
require_once 'config.php';

// Get all rolls
try {
    $sql = "SELECT * FROM rolls ORDER BY date_added DESC";
    $result = $conn->query($sql);
    
    $rolls = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $rolls[] = $row;
        }
    }
    
    sendResponse(true, 'Rolls retrieved successfully', ['rolls' => $rolls]);
    
} catch (Exception $e) {
    error_log("Error getting rolls: " . $e->getMessage());
    sendResponse(false, 'Error retrieving rolls: ' . $e->getMessage());
}

$conn->close();
?>
