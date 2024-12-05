<!DOCTYPE html>
<html>
<body>

<h1>My first PHP page</h1>

<?php
$servername = "bbmsmxl3saczx0opirod-mysql.services.clever-cloud.com";
$username = "uqt2kmsjk0qb0npa";
$password = "XzyNQrEYbWS9ZOHiMIRn";
$dbname = "bbmsmxl3saczx0opirod";

// Kết nối MySQL
$conn = new mysqli($servername, $username, $password, $dbname);

// Kiểm tra kết nối
if ($conn->connect_error) {
    die("Kết nối thất bại: " . $conn->connect_error);
}else{
    echo "Kết nối thành công";
}
?>

</body>
</html>