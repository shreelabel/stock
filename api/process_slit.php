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

    // Validate required fields
    $original_roll_id = $input['original_roll_id'] ?? null;
    $slits = $input['slits'] ?? [];

    if (!$original_roll_id || empty($slits)) {
        echo json_encode(['success' => false, 'message' => 'Original roll ID and slit data are required']);
        exit;
    }

    // Get original roll data
    $original_sql = "SELECT * FROM rolls WHERE id = ?";
    $original_stmt = $conn->prepare($original_sql);
    $original_stmt->bind_param("i", $original_roll_id);
    $original_stmt->execute();
    $original_result = $original_stmt->get_result();
    
    if ($original_result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Original roll not found']);
        exit;
    }
    
    $original_roll = $original_result->fetch_assoc();
    
    // Check if roll is still in stock
    if ($original_roll['status'] !== 'Stock') {
        echo json_encode(['success' => false, 'message' => 'Roll is not in stock and cannot be slit']);
        exit;
    }

    // Start transaction
    $conn->autocommit(false);
    
    try {        $slit_roll_ids = [];
        
        // Process each slit
        foreach ($slits as $index => $slit) {
            $width = $slit['width'] ?? null;
            $length = $slit['length'] ?? null;
            $suffix = $slit['suffix'] ?? null;
            $status = $slit['status'] ?? 'Printing'; // Default to Printing if not specified
            
            // Use individual slit job details if provided, otherwise fall back to original roll
            $jobname = !empty($slit['jobName']) ? $slit['jobName'] : $original_roll['jobname'];
            $jobno = !empty($slit['jobNo']) ? $slit['jobNo'] : $original_roll['jobno'];
            $jobsize = !empty($slit['jobSize']) ? $slit['jobSize'] : $original_roll['jobsize'];
            
            if (!$width || !$length || !$suffix) {
                throw new Exception('Invalid slit data: width, length, and suffix are required');
            }
            
            // Generate new roll number with suffix
            $new_roll_number = $original_roll['rollnumber'] . '-' . $suffix;
            
            // Check if new roll number already exists
            $check_sql = "SELECT id FROM rolls WHERE rollnumber = ?";
            $check_stmt = $conn->prepare($check_sql);
            $check_stmt->bind_param("s", $new_roll_number);
            $check_stmt->execute();
            $check_result = $check_stmt->get_result();
            
            if ($check_result->num_rows > 0) {
                throw new Exception("Roll number {$new_roll_number} already exists");
            }
            
            // Calculate weight based on proportion
            $width_ratio = $width / $original_roll['width'];
            $length_ratio = $length / $original_roll['length'];
            $new_weight = round($original_roll['weight'] * $width_ratio * $length_ratio, 2);
            
            // Insert new slit roll
            $insert_sql = "INSERT INTO rolls (
                rollnumber, material, papercompany, gsm, width, length, weight, 
                lotno, jobname, jobno, jobsize, status, rolltype, date_added
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Slit Roll', NOW())";
            
            $insert_stmt = $conn->prepare($insert_sql);            $insert_stmt->bind_param("ssssdddsssss", 
                $new_roll_number,
                $original_roll['material'],
                $original_roll['papercompany'],
                $original_roll['gsm'],
                $width,
                $length,
                $new_weight,
                $original_roll['lotno'],
                $jobname,
                $jobno,
                $jobsize,
                $status
            );
            
            if (!$insert_stmt->execute()) {
                throw new Exception("Failed to create slit roll: " . $insert_stmt->error);
            }
            
            $slit_roll_ids[] = $conn->insert_id;        }
        
        // Calculate total used width to determine if we need a remaining roll
        $total_used_width = 0;
        foreach ($slits as $slit) {
            $total_used_width += $slit['width'];
        }
        
        $remaining_width = $original_roll['width'] - $total_used_width;
        
        // Create remaining roll if there's leftover material (width > 5mm to avoid tiny remainders)
        if ($remaining_width > 5) {
            // Find the next available suffix
            $used_suffixes = [];
            foreach ($slits as $slit) {
                $used_suffixes[] = $slit['suffix'];
            }
            
            // Find next available letter suffix
            $next_suffix = 'A';
            while (in_array($next_suffix, $used_suffixes)) {
                $next_suffix = chr(ord($next_suffix) + 1);
            }
            
            $remaining_roll_number = $original_roll['rollnumber'] . '-' . $next_suffix;
            
            // Calculate weight for remaining part
            $remaining_width_ratio = $remaining_width / $original_roll['width'];
            $remaining_weight = round($original_roll['weight'] * $remaining_width_ratio, 2);
              // Insert remaining roll as Stock
            $remaining_insert_sql = "INSERT INTO rolls (
                rollnumber, material, papercompany, gsm, width, length, weight, 
                lotno, jobname, jobno, jobsize, status, rolltype, date_added
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            
            $remaining_stmt = $conn->prepare($remaining_insert_sql);
            $remaining_stmt->bind_param("ssssdddssssss", 
                $remaining_roll_number,
                $original_roll['material'],
                $original_roll['papercompany'],
                $original_roll['gsm'],
                $remaining_width,
                $original_roll['length'],
                $remaining_weight,
                $original_roll['lotno'],
                $original_roll['jobname'],
                $original_roll['jobno'],
                $original_roll['jobsize'],
                'Stock',
                'Slit Roll'
            );
            
            if (!$remaining_stmt->execute()) {
                throw new Exception("Failed to create remaining roll: " . $remaining_stmt->error);
            }
            
            $slit_roll_ids[] = $conn->insert_id;
        }
          // Determine what status to set for the original roll
        // If it's a slitted roll (contains "-"), set to USED
        // If it's a main roll (no "-"), set to Original
        $newStatus = 'Original'; // Default for main rolls
        if (strpos($original_roll['rollnumber'], '-') !== false) {
            // This is a previously slitted roll, set to USED
            $newStatus = 'USED';
        }
        
        // Update original roll status
        $update_sql = "UPDATE rolls SET status = ? WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param("si", $newStatus, $original_roll_id);
        
        if (!$update_stmt->execute()) {
            throw new Exception("Failed to update original roll status: " . $update_stmt->error);
        }
        
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true, 
            'message' => 'Slit operation completed successfully',
            'slit_roll_ids' => $slit_roll_ids,
            'original_roll_id' => $original_roll_id
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction
        $conn->rollback();
        throw $e;
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    if (isset($conn)) {
        $conn->autocommit(true);
        $conn->close();
    }
}
?>