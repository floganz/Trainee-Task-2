<?php
$anc = $_GET["anc"];
$depth = $_GET["dp"];

$mysqli = new mysqli('localhost', 'root', '', 'tt');
if ( $mysqli->connect_error ) {
    die('Connect Error (' . $mysqli->connect_errno . ') ' . $mysqli->connect_error);
}

$res = $mysqli->query('SELECT Messages.* FROM Messages INNER JOIN TreePath ON Messages.CommentID=TreePath.Descendant WHERE TreePath.Ancestor='.$anc.' AND TreePath.Depth='.depth.' ORDER BY Messages.Date DESC');
$d = $res->fetch_row();

echo json_encode( $d );
?>