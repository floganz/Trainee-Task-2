<?php
$input = json_decode(file_get_contents('php://input'), true);

$mysqli = new mysqli('localhost', 'root', '', 'tt');
if ( $mysqli->connect_error ) {
    die('Connect Error (' . $mysqli->connect_errno . ') ' . $mysqli->connect_error);
}
if( !$mysqli->query('SELECT ID FROM Users WHERE UserID='.$input['userID']) )
{
	$mysqli->query('INSERT INTO Users (ID, FirstName, LastName) VALUES ("'.$input['userID'].'","'.$input['firstName'].'","'.$input['lastName'].'")');
}
$mysqli->query('INSERT INTO Messages (UserID,Date,Text) VALUES ("'.$input['userID'].'", "'.$input['date'].'", "'.$input['mes'].'")');
$CommentID = mysqli_insert_id($mysqli);
$mysqli->query('INSERT INTO TreePath (ancestor, descendant)
    SELECT ancestor, '.$CommentID.' FROM TreePath
    WHERE descendant = '.$input['parentID'].' AND Ancestor!=0
    UNION ALL
    SELECT '.$CommentID.', '.$CommentID.'');
$res = $mysqli->query('SELECT Ancestor FROM TreePath WHERE Descendant='.$CommentID.' AND Ancestor BETWEEN 1 AND '.$input['parentID'].' GROUP BY Ancestor DESC');
$data = $res->fetch_all();
$curDepth = 1;
for( $i = 0; $i < count($data); $i++)
{
	$mysqli->query('UPDATE TreePath SET Depth='.$curDepth.' WHERE Ancestor='.$data[$i][0].' AND Descendant='.$CommentID.'');
	$curDepth++;
}
?>