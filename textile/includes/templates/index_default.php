<?php

/*
*   Template for bucket index
*/

$site_name = !empty($site_name) ? $site_name : '';
$bucket_url = !empty($bucket_url) ? $bucket_url : '';

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
		#post_content {
			padding: 40px;
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
		<select id="search_slug">
			<option value="">- POST -</option>
		</select>
	</div>
	<div id="post_content">
	</div>
	<script>
		var BUCKET_URL = "' . $bucket_url . '";
		window.onload = function() {
			get_posts(BUCKET_URL);

		};

		function get_posts(bucket_url) {
			const post_container = document.getElementById("post_content");
			const final_url = `${bucket_url}?json=true`;
			post_container.innerHTML = "Loading ...";
			
			fetch(final_url).then(async (data) => {
				const res = await data.json();
				let files = res && res.hasOwnProperty("metadata") ? 
					res.metadata : {};
				const fileList = Object.keys(files);
				// Populate posts object
				const posts = get_posts_asArray(fileList);
				// Load years in select field 
				const search_year = document.getElementById("search_year");
				load_years(posts, search_year);

				// Listener Year
				document.getElementById("search_year").onchange = (event) => {
					const year = event.target.value;
					const search_month = document.getElementById("search_month");
					load_months(posts, search_month, year);

					// Listener Month
					document.getElementById("search_month").onchange = (event) => {
						const month = event.target.value;
						const search_day = document.getElementById("search_day");
						load_days(posts, search_day, year, month);

						// Listener Slug
						document.getElementById("search_day").onchange = (event) => {
							const day = event.target.value;
							const search_slug = document.getElementById("search_slug");
							load_slugs(posts, search_slug, year, month, day);

							// Load page
							document.getElementById("search_slug").onchange = (event) => {
								const slug = event.target.value;
								const url = `${BUCKET_URL}/${year}/${month}/${day}/${slug}/index.html`;
								const post_container = document.getElementById("post_content");
								load_page(post_container, url);
								
							}

						}

					}
				}

				post_container.innerHTML = "PLEASE SELECT A POST";

			}).catch((reason) => {
				alert("Error: " + reason);
			});
		}

		function get_posts_asArray(filesList) {
			const posts = {};
			const hasOwnProperty = Object.prototype.hasOwnProperty;

			for (let f of filesList) {
				// If is an index file 
				if (f.indexOf("index.html") >= 0) {
					const path = f.split("/");
					// Must have exactly 5 elements
					if (path.length !== 5) {
						continue;
					}
					// Get date 
					const year = path[0];
					const month = path[1];
					const day = path[2];
					const slug = path[3];

					if (!hasOwnProperty.call(posts, year)) {
						posts[year] = {};
					}
					if (!hasOwnProperty.call(posts[year], month)) {
						posts[year][month] = {};
					}
					if (!hasOwnProperty.call(posts[year][month], day)) {
						posts[year][month][day] = {};
					}
					if (!hasOwnProperty.call(posts[year][month][day], slug)) {
						posts[year][month][day][slug] = "index.html";
					}
				}
			}

			return posts;
		}

		function load_years(posts, container) {
			const years = Object.keys(posts);
			container.innerHTML = `<option value="">- YEAR -</option>`;
			for (const year of years) {
				container.innerHTML += `<option value="${year}">${year}</option>`;
			}
		}

		function load_months(posts, container, year) {
			const months = Object.keys(posts[year]);
			container.innerHTML = `<option value="">- MONTH -</option>`;
			for (const month of months) {
				container.innerHTML += `<option value="${month}">${month}</option>`;
			}
		}

		function load_days(posts, container, year, month) {
			const days = Object.keys(posts[year][month]);
			container.innerHTML = `<option value="">- DAY -</option>`;
			for (const day of days) {
				container.innerHTML += `<option value="${day}">${day}</option>`;
			}
		}

		function load_slugs(posts, container, year, month, day) {
			const slugs = Object.keys(posts[year][month][day]);
			container.innerHTML = `<option value="">- SLUG -</option>`;
			for (const slug of slugs) {
				container.innerHTML += `<option value="${slug}">${slug}</option>`;
			}
		}

		function load_page(post_container, url) {
			post_container.innerHTML = "Loading ...";
			fetch(url).then(async (data) => {
				post_container.innerHTML = await data.text();
			}).catch((reason) => {
				post_container.innerHTML = "Error: " + reason;
			});
		}

	</script>
</body>
</html>
';
