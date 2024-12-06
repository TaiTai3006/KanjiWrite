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
}

function getRealIPAddress(){
    if(!empty($_SERVER['HTTP_CLIENT_IP'])){
        //check ip from share internet
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    }else if(!empty($_SERVER['HTTP_X_FORWARDED_FOR'])){
        //to check ip is pass from proxy
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    }else{
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return $ip;
}

$ip = getRealIPAddress();  
echo $ip;


// Chuẩn bị câu lệnh SQL
// $sql = "INSERT INTO user (ip) VALUES (?)";

// // Sử dụng prepared statement để bảo mật
// $stmt = $conn->prepare($sql);
// $stmt->bind_param("s", $ip);

// // Thực thi câu lệnh và kiểm tra kết quả
// if ($stmt->execute()) {
//     echo "Thêm dữ liệu thành công!";
// } else {
//     echo "Lỗi: " . $stmt->error;
// }

// // Đóng kết nối
// $stmt->close();
// $conn->close();
?>

</body>
</html>