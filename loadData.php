<?php
$anc = $_GET["anc"];

$mysqli = new mysqli('localhost', 'root', '', 'tt');
if ( $mysqli->connect_error ) {
    die('Connect Error (' . $mysqli->connect_errno . ') ' . $mysqli->connect_error);
}

$res=$mysqli->query('SELECT Messages.*, Users.FirstName, Users.LastName FROM Messages INNER JOIN TreePath ON Messages.CommentID=TreePath.Descendant INNER JOIN Users ON Users.ID=Messages.userID WHERE TreePath.Ancestor='.$anc.' AND TreePath.Descendant!='.$anc.' AND TreePath.Depth=1 AND Users.ID=Messages.userID ORDER BY Messages.Date DESC');
$d = $res->fetch_all();
for( $i = 0; $i < count($d); $i++ )
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