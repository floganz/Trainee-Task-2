<?php
$input = json_decode(file_get_contents('php://input'), true);

$mysqli = new mysqli('localhost', 'root', '', 'tt');
if ( $mysqli->connect_error ) {
    die('Connect Error (' . $mysqli->connect_errno . ') ' . $mysqli->connect_error);
}

$res = $mysqli->query('UPDATE Messages SET Text="'.$input['mes'].'" WHERE CommentID='.$input['commentID']);

echo json_encode($res)
?>