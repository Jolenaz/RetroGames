<?php
// Init Vars
$retour = true;
if (!isset($_GET['score'])) {
	$retour = false;
} else {
 $score = htmlentities($_GET['score']);
	//echo "score: ".$score."<br>";
}
if (!isset($_GET['jeu'])) {
	$retour = false;
} else {
 $jeu = htmlentities($_GET['jeu']);
	//echo "jeu: ".$jeu."<br>";
}
if (!isset($_GET['id'])) {
	$retour = false;
} else {
 $id = htmlentities($_GET['id']);
	//echo "id: ".$id."<br>";
}
if ($score == 0 || $score == null ) {
	// DO SOMETHING
}
if ($jeu != 1 || $jeu != 2 || $jeu != 3 ) {
	// DO SOMETHING
}
if ($id == 0 || $id == null ) {
	// DO SOMETHING
}

switch ($jeu) {
	case 1:
				$title = "t1";
				$description = "d1";
				$image = "i1";
				$url = "1&".$id;
	break;
	case 2:
				$title = "t2";
				$description = "d2";
				$image = "i2";
				$url = "2&".$id;
	break;
	case 3 :
				$title = "t3";
				$description = "d3";
				$image = "i3";
				$url = "3&".$id;
	break;
	default :
		$retour = false;
	break;
}

if (!isset($retour) || $retour === false) {
	echo "1";
	?>
	<script>
		window.location = "/recyclercestjouer";
	</script>
	<?php
} else {
	?>
	<!DOCTYPE html>
	<html lang="fr-FR" prefix="og: http://ogp.me/ns#">
		<head>
			<meta property="og:locale" content="fr_FR" />
			<meta property="og:type" content="website" />
			<meta property="og:title" content="Recycler c'est jouer | Corepile" />
			<meta property="og:url" content="<?php echo $url; ?>" />
			<meta property="og:site_name" content="Je recycle mes piles" />
			<meta property="og:image" content="<?php echo $image; ?>" />
			<meta property="og:image:url" content="<?php echo $image; ?>" />
			<meta property="og:image:secure_url" content="<?php echo $image; ?>" />
			<meta property="og:image:width" content="1600" />
			<meta property="og:image:height" content="1200" />
			<meta property="og:image:type" content="image/png" />
			<meta property="og:description" content="<?php echo $description; ?>" />

			<meta charset="utf-8">
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">

			<title>Je recycle mes piles | Recycler c'est jouer</title>
			<base href='https://jerecyclemespiles.com' />
			<meta name="description" content="<?php echo $description; ?>"/>

		</head>
		<body>
			<img src='<?php echo $image; ?>' />
			<script>
				window.location = "/recyclercestjouer";
			</script>
		</body>
	</html>
	<?php
}
