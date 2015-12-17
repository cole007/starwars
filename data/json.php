<?php

	function toAscii($str) {

	    $before = array(
	        'àáâãäåòóôõöøèéêëðçìíîïùúûüñšž',
	        '/[^a-z0-9\s]/',
	        array('/\s/', '/--+/', '/---+/')
	    );
	 
	    $after = array(
	        'aaaaaaooooooeeeeeciiiiuuuunsz',
	        '',
	        '-'
	    );

	    $str = strtolower($str);
	    $str = strtr($str, $before[0], $after[0]);
	    $str = preg_replace($before[1], $after[1], $str);
	    $str = trim($str);
	    $str = preg_replace($before[2], $after[2], $str);
	 
	    return $str;
	}

	$db = array(
		'server' => 'localhost',
		'user' => 'root',
		'password' => 'monkey00',
		'database' => 'swapi'
	);
	// $nodes = [];
	// $links = [];
	// $people = [];
	$link = mysqli_connect($db['server'], $db['user'], $db['password'], $db['database']);

	// $q = "SELECT * FROM craft_entryversions WHERE id NOT IN (SELECT id FROM (SELECT max(id) AS id, entryId FROM craft_entryversions GROUP BY entryId) X) AND locale = '".$locale."'";
	$q = "SELECT * FROM data WHERE name <> ''";
	$r = $link->query($q);
	
	foreach($r AS $row){
		$people[$row['id']] = toAscii($row['name']);
		// if ($row['killer'] > 0 AND $row['film'] != NULL) {
			// $node['match'] = 
			$death['match'] = 1;
			$death['name'] = htmlspecialchars($row['name']);
			$death['artist'] = $row['film'];
			$death['id'] = toAscii($row['name']);			
			$count = "SELECT * FROM `deaths` WHERE `killer` = '".$row['id']."'";
			$countR = $link->query($count);
			// print_r($countR);
			// exit;
			$death['playcount'] = $countR->num_rows;			
			$death['affinity'] = (int)$row['affinity'];			
			$death['group'] = (int)$row['film'];		
			$death['value'] = $row['episodes'];
				
			// $node['id'] = 
			$deaths[] = $death;
		// }
		// match": 1.0,
//    "name": "Diamonds On The Soles Of Her Shoes",
//    "artist": "Paul Simon",
//    "id": "diamonds_on_the_soles_of_her_shoes_paul_simon",
//    "playcount": 661020
	}
	
	$q = "SELECT * FROM deaths";
	$r = $link->query($q);
	
	// print_r(array_keys($people));
	foreach($r AS $row){
		// echo $row['killer'];
		// echo $row['character'];
		$killer['source'] = array_search($row['killer'], array_keys($people));
		$killer['target'] = array_search($row['character'], array_keys($people));
		$killer['value'] = (int)$row['film'];
		$killers[] = $killer;
		// echo $people[$row['killer']];
		// echo $people[$row['character']];
	}

	$json['nodes'] = $deaths;
	$json['links'] = $killers;


	// print_r($deaths);
	// echo '<hr />';
	// print json_encode($deaths);
	// echo '<hr />';
	// print_r($killers);
	// echo '<hr />';
	// print json_encode($killers);
	print json_encode($json);

	// $output = [];
	// $output = '{ "nodes": [' . json_encode($nodes) . '],';
	// $output .= '"links"" [' . json_encode($nodes) . ']}';
	// $output['nodes'] = json_encode($nodes);
	// $output['links'] = json_encode($links);
	
	// print_r($nodes);
	// print_r($output);
	// print json_encode($output);