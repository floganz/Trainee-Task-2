<?php
$offset = $_GET["offset"];
$mysqli = new mysqli('localhost', 'root', '', 'tt');
if ( $mysqli->connect_error ) {
    die('Connect Error (' . $mysqli->connect_errno . ') ' . $mysqli->connect_error);
}

$res = $mysqli->query('SELECT Messages.*, Users.FirstName, Users.LastName FROM Messages INNER JOIN TreePath ON Messages.CommentID=TreePath.Descendant INNER JOIN Users ON Users.ID=Messages.userID WHERE TreePath.Ancestor=0 AND TreePath.Depth=0 AND Users.ID=Messages.userID ORDER BY Messages.Date DESC LIMIT 10 OFFSET '.$offset);
$d = $res->fetch_all();
for( $i = count($d) - 1; $i >= 0; $i-- )
{
	$z = NULL;
	$z = $mysqli->query('SELECT Count(*) FROM TreePath WHERE Ancestor='.$d[$i][0]);
	$count = $z->fetch_row();
	if( $count[0] == 1 )
		$d[$i][] = false;
	else
		$d[$i][] = true;
}
echo json_encode( $d );
?>