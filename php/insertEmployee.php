<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);
include('../config/config.php');

header('Content-Type: application/json; charset=UTF-8');

// Check for required fields
if (!isset($_POST['firstName'], $_POST['lastName'], $_POST['email'], $_POST['departmentID'])) {
    echo json_encode(['status' => ['code' => 400, 'description' => 'Missing required fields.']]);
    exit;
}

// Get input values safely
$firstName = $_POST['firstName'];
$lastName = $_POST['lastName'];
$email = $_POST['email'];
$departmentId = $_POST['departmentID'];

// Step 1: Fetch locationID from the department table based on departmentID
$locationIdQuery = "SELECT locationID FROM department WHERE id = locationID";
$stmtLocation = $conn->prepare($locationIdQuery);
$stmtLocation->bind_param("s", $departmentId);
$stmtLocation->execute();
$stmtLocation->bind_result($locationId);
$stmtLocation->fetch();
$stmtLocation->close();

if (!$locationId) {
    echo json_encode(['status' => ['code' => 404, 'description' => 'Location not found for department.']]);
    exit;
}

// Step 2: Insert data into personnel table with locationID obtained from department
$sql = "INSERT INTO personnel (firstName, lastName, email, departmentID, locationID) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(['status' => ['code' => 500, 'description' => 'SQL prepare failed: ' . $conn->error]]);
    exit;
}

// Bind parameters correctly
$stmt->bind_param("sssss", $firstName, $lastName, $email, $departmentId, $locationId);

$response = [];
if ($stmt->execute()) {
    $response['status'] = ['code' => 200, 'description' => 'Employee added successfully.'];
} else {
    $response['status'] = ['code' => 500, 'description' => 'Error adding employee: ' . $stmt->error];
}

// Clean up
$stmt->close();
$conn->close();

// Output JSON response
echo json_encode($response);
