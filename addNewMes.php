<?php
$input = json_decode(file_get_contents('php://input'), true);

$mysqli = new mysqli('localhost', 'root', '', 'tt');
if ($mysqli->connect_error) {
    die('Connect Error (' . $mysqli->connect_errno . ') ' . $mysqli->connect_error);
}
$mysqli->query('INSERT INTO Messages (UserID,Date,Text) VALUES ("'.$input['userID'].'", "'.$input['date'].'", "'.$input['mes'].'")');
$CommentID = mysqli_insert_id($mysqli);

if( !$mysqli->query('SELECT ID FROM Users WHERE UserID='.$input['userID']) )
{
	$mysqli->query('INSERT INTO Users (ID, FirstName, LastName) VALUES ("'.$input['userID'].'","'.$input['firstName'].'","'.$input['lastName'].'")');
}
$mysqli->query('INSERT INTO TreePath (ancestor, descendant,depth) VALUES ("'.$CommentID.'","'.$CommentID.'","0")');
$mysqli->query('INSERT INTO TreePath (ancestor, descendant,depth) VALUES ("0","'.$CommentID.'","0")');

$res = $mysqli->query('SELECT Messages.*, Users.FirstName, Users.LastName FROM Messages INNER JOIN TreePath ON Messages.CommentID=TreePath.Descendant INNER JOIN Users ON Users.ID=Messages.userID WHERE TreePath.Ancestor=0 AND TreePath.Depth=0 AND Users.ID=Messages.userID AND Messages.CommentID='.$CommentID.' ORDER BY Messages.Date ASC');
$d=  $res->fetch_all();
for( $i = 0; $i < count($d); $i++ )
{
	$z = NULL;
	$z = $mysqli->query('SELECT Count(*) FROM TreePath WHERE Ancestor='.$d[$i][0]);
	$count = $z->fetch_row();
	if($count[0]==1)
		$d[$i][]=false;
	else
		$d[$i][]=true;
}
echo json_encode($d);
?>