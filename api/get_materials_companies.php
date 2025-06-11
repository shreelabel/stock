<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    // Get unique materials
    $materialStmt = $conn->prepare("SELECT DISTINCT material FROM rolls WHERE material IS NOT NULL AND material != '' ORDER BY material");
    $materialStmt->execute();
    $materialResult = $materialStmt->get_result();
    $materials = [];
    while ($row = $materialResult->fetch_assoc()) {
        $materials[] = $row['material'];
    }
    
    // Get unique companies
    $companyStmt = $conn->prepare("SELECT DISTINCT papercompany FROM rolls WHERE papercompany IS NOT NULL AND papercompany != '' ORDER BY papercompany");
    $companyStmt->execute();
    $companyResult = $companyStmt->get_result();
    $companies = [];
    while ($row = $companyResult->fetch_assoc()) {
        $companies[] = $row['papercompany'];
    }
    
    // Get unique GSM values
    $gsmStmt = $conn->prepare("SELECT DISTINCT gsm FROM rolls WHERE gsm IS NOT NULL ORDER BY gsm");
    $gsmStmt->execute();
    $gsmResult = $gsmStmt->get_result();
    $gsms = [];
    while ($row = $gsmResult->fetch_assoc()) {
        $gsms[] = $row['gsm'];
    }
    
    // Get unique widths
    $widthStmt = $conn->prepare("SELECT DISTINCT width FROM rolls WHERE width IS NOT NULL ORDER BY width");
    $widthStmt->execute();
    $widthResult = $widthStmt->get_result();
    $widths = [];
    while ($row = $widthResult->fetch_assoc()) {
        $widths[] = $row['width'];
    }
    
    // Get unique lengths
    $lengthStmt = $conn->prepare("SELECT DISTINCT length FROM rolls WHERE length IS NOT NULL ORDER BY length");
    $lengthStmt->execute();
    $lengthResult = $lengthStmt->get_result();
    $lengths = [];
    while ($row = $lengthResult->fetch_assoc()) {
        $lengths[] = $row['length'];
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'materials' => $materials,
            'companies' => $companies,
            'gsms' => $gsms,
            'widths' => $widths,
            'lengths' => $lengths
        ]
    ]);
    
} catch(Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
