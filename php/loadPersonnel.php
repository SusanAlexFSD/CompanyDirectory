<?php

// THIS PHP FILE LOADS THE PERSONNEL DATA FROM PHPMYADMIN TABLE

// Remove next two lines for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

// Start output buffering to avoid accidental output
ob_start();

$executionStartTime = microtime(true);

include('../config/config.php');

header('Content-Type: application/json; charset=UTF-8');

// Connect to database
$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

// Updated SQL query to include location
$query = '
    SELECT 
        p.id, 
        p.firstName, 
        p.lastName, 
        p.email, 
        d.name AS departmentID, 
        l.name AS locationID 
    FROM 
        personnel p 
    LEFT JOIN 
        department d ON p.departmentID = d.id  -- Assuming personnel has departmentID
    LEFT JOIN 
        location l ON d.locationID = l.id      -- Assuming department has locationID
    ORDER BY 
        p.lastName, p.firstName, d.name, l.name';


$result = $conn->query($query);

if (!$result) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query failed";    
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

$personnel = [];
while ($row = mysqli_fetch_assoc($result)) {
    $personnel[] = $row;
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $personnel;

mysqli_close($conn);

// Flush the output buffer to ensure no extra content is sent
ob_end_clean();

echo json_encode($output);