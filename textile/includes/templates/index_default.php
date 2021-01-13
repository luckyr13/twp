<?php

/*
*   Template for bucket index
*/

$site_name = !empty($site_name) ? $site_name : '';

$TEMPLATE_INDEX = '
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>'.$site_name.'</title>
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}
		#top_bar {
			height: 50px;
			background-color: #000;
			color: #FFF;
			padding: 10px
		}
	</style>
	
</head>
<body>
	<div id="top_bar">
		<div class="col-6">
			<h1>'.$site_name.'</h1>
		</div>
		<div class="col-6">
		</div>
	</div>
	<div id="search_bar">
		<select id="search_year">
			<option value="">- YEAR -</option>
		</select>
		<select id="search_month">
			<option value="">- MONTH -</option>
		</select>
		<select id="search_day">
			<option value="">- DAY -</option>
		</select>
		<select id="search_post">
			<option value="">- POST -</option>
		</select>
	</div>
	<div id="post_content">
	</div>
	<script>
		window.onload = function() {
			get_posts();
		};

		function get_posts() {
			const post_container = document.getElementById("post_content");
			post_container.innerHTML = "Loading ...";
		}
	</script>
</body>
</html>
';
