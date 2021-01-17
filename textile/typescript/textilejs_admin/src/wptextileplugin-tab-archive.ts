import { WPTextilePlugin } from './wptextileplugin';
import { FetchAPI } from './fetch-api';
import { LOADER1, LOADER2 } from './loader';
declare const document: any;

export class WPTextilePluginTabArchive {
	private wp: WPTextilePlugin;
	private fapi: FetchAPI;
	private bucketURL;
	private bucketWWW;
	private bucketIPNS;
	private ajax_url;

	constructor(_wp: WPTextilePlugin) {
		this.wp = _wp;
		this.fapi = new FetchAPI();
	}
	
	/*
	*	Set listeners for components in Archive tab
	*/
	setTabListeners(url) {
		// Button: "GET BUCKETS"
		const btn_get_buckets = document.getElementById('textile_archive_btn_get_buckets');
		// Button "ACTIVATE POSTS"
		const btn_activate_posts = document.getElementById('textile_archive_btn_activate_posts');
		// Button: "GET POSTS"
		const btn_get_posts = document.getElementById('textile_archive_btn_get_posts');
		// Button "RESET FORM"
		const btn_reset = document.getElementById('textile_archive_btn_reset');
		// Button "CREATE INDEX"
		const btn_create_index = document.getElementById('textile_archive_btn_generate_index');

		// Save ajax url 
		this.ajax_url = url;

		// Click event for buckets button
		if (btn_get_buckets) {
			btn_get_buckets.onclick = () => {
				this.getBuckets(btn_get_buckets);
			};
		}

		// Click for Activate posts
		if (btn_activate_posts) {
			btn_activate_posts.onclick = () => {
				try {
					// Disable button 
					btn_activate_posts.disabled = true;
					this.activateSectionPosts(btn_activate_posts);
				} catch(err) {
					btn_activate_posts.disabled = false;
					alert('Error: ' + err);
				}
			};
		}

		// Click event for posts button
		if (btn_get_posts) {
			btn_get_posts.onclick = () => {
				this.getPosts(url);
			};
		}

		// Click event to reset the form 
		if (btn_reset) {
			btn_reset.onclick = () => {
				this.reset();
				
			}
		}

		// Click event to Create Index file 
		// (create index and upload it to bucket)
		if (btn_create_index) {
			btn_create_index.onclick = () => {
				this.createIndexForBucket(url);
			}
		}

		// Init filter dates
		// Set From and To values to current date
		this.initFilterDates();
	}

	/*
	*	RESET FORM
	*/
	reset() {
		const txt_bucket_name = document.getElementById('textile_archive_txt_bucket_name');
		const div_create_index_res = document.getElementById('wptextile_archive_section_bucket_create_index_res');
		const div_create_posts_res = document.getElementById('textile_archive_div_results');
		const div_get_buckets = document.getElementById('wptextile_archive_section_bucket_settings_bucklist');
		const btn_activate_posts = document.getElementById('textile_archive_btn_activate_posts');
		const empty_res = '<div class="wptextile_content_no_results_text">Results</div>';
		const step2And3Container = document.getElementById('wptextile_archive_section_post_list');
		const div_bucketInfo = document.getElementById('textile_archive_div_bucket_gen_info');

		txt_bucket_name.value = '';
		txt_bucket_name.disabled = false;
		btn_activate_posts.disabled = false;
		div_bucketInfo.innerText = '';
		div_create_index_res.innerHTML = empty_res;
		div_create_posts_res.innerHTML = empty_res;
		div_get_buckets.innerHTML = empty_res;
		step2And3Container.className = 'hide';
		this.initFilterDates();
						
	}

	/*
	*	From and To dates as current date
	*/
	initFilterDates() {
		const txt_from = document.getElementById('textile_archive_txt_date_from');
		const txt_to = document.getElementById('textile_archive_txt_date_to');
		const today = new Date();
		const dateBefore = new Date();
		dateBefore.setMonth(dateBefore.getMonth() - 3);
		var todayFinal = today.toISOString().slice(0, -14);
		var dateBeforeFinal = dateBefore.toISOString().slice(0, -14);
		txt_from.value = dateBeforeFinal;
		txt_to.value = todayFinal;
	}

	/*
	*	Get posts list from wordpress
	*/
	getPosts(url) {
		const container = document.getElementById('textile_archive_div_results');
		const bucket_name = document.getElementById('textile_archive_txt_bucket_name').value;
		const txt_from = document.getElementById('textile_archive_txt_date_from');
		const txt_to = document.getElementById('textile_archive_txt_date_to');

		const data = {
			action: 'textilepostslist',
			from: txt_from.value,
			to: txt_to.value
		};
		container.innerHTML = LOADER2;

		this.fapi.post(url, data)
			.then(async (response) => {
				const content = await response.json();
				let html = '';

				// Check for errors 
				if (content === 0 || (content && content.error)) {
					container.innerText = content ? content.error : 'Wordpress error :)';
					return false;
				}

				// Count number of posts, return if zero
				if (!content || !content.length) {
					container.innerText = 'No results found.';
					return false;
				}

				for (let post of content) {
					html += this.template_post_detail(post);
				} 
				container.innerHTML = html;

				// Add listeners for shallow upload
				const btnsUpload = document.getElementsByClassName('wptextile_archive_post_detail_btn_upload');
				for (let tmp_btnUpload of btnsUpload) {
					tmp_btnUpload.addEventListener('click', async () => {
						this.uploadPostToBucket_helper(
							tmp_btnUpload,
							bucket_name
						);
					});
				}

				// Add listener for deep upload 
				const btnsDeepUpload = document.getElementsByClassName('wptextile_archive_post_detail_btn_upload_deep');
				for (let tmp_btnDeepUpload of btnsDeepUpload) {
					tmp_btnDeepUpload.addEventListener('click', async () => {
						this.deepUploadPostToBucket_helper(tmp_btnDeepUpload, bucket_name);
					});
				}
	
			})
			.catch((err) => {
				let error_msg = '';
				if (typeof err === 'object') {
					error_msg = 'Error : ' + JSON.stringify(err);
				} else {
					error_msg =  'Error: ' + err;
				}

				container.innerText = error_msg;
			});
	}

	/*
	*	HTML template for each post
	*/
	template_post_detail(post) {
		const post_id = post.hasOwnProperty('id') ?
			post['id'] : '';
		const post_title = post.hasOwnProperty('post_title') ?
			post['post_title'] : '';
		const post_name = post.hasOwnProperty('post_name') ?
			post['post_name'] : '';
		const post_content = post.hasOwnProperty('post_content') ?
			post['post_content'] : '';

		const post_date_gmt = post.hasOwnProperty('post_date_gmt') ?
			post['post_date_gmt'] : '';
		const post_modified_gmt = post.hasOwnProperty('post_modified_gmt') ?
			post['post_modified_gmt'] : '';

		let html = '';

		html += `
		<h2>POST ID: ${post_id} (${post_name}) / <small>Last update: ${post_modified_gmt}</small></h2>
		<h3>POST DATE: ${post_date_gmt}</h3>
		<div class="wptextile_archive_post_detail">
			<h2>${post_title}</h2>
			<div id="wptextile_post_detail_html_${post_id}" 
				class="post_detail_html">
				${post_content}
			</div>
		</div>
		<div class="wptextile_archive_post_detail_footer">
			<input type="button" 
				class="button button-primary wptextile_archive_post_detail_btn_upload" 
				data-id="${post_id}"
				data-slug="${post_name}"
				data-date="${post_date_gmt}"
				value="SHALLOW UPLOAD" />
				&nbsp;
				<input type="button" style="background-color: purple; color: #FFF"
				class="button button-primary wptextile_archive_post_detail_btn_upload_deep" 
				data-id="${post_id}"
				data-slug="${post_name}"
				data-date="${post_date_gmt}"
				value="DEEP UPLOAD" />
		</div>
		<div id="wptextile_archive_post_detail_deepupl_loader_${post_id}" 
				class="wptextile_archive_post_detail_deepupl_loader_s">
		</div>
		<div class="wptextile_archive_post_detail_footer_results" id="wptextile_archive_post_detail_deepupl_ls_${post_id}">
			Results
		</div>
		<hr>
		`;

		return html;
	}

	/*
	*	HTML template for buckets table
	*/
	template_buckets_table_listeners() {
		const bucketButtons = document.getElementsByClassName('btn-tbl-setBucketName');
		for (let i = 0, max = bucketButtons.length; i < max; i++) {
			bucketButtons[i].onclick = (data) => {
				const button = data.target;
				const bucketName = button.dataset.bucketName;
				this.setTxtBucketName(bucketName);
			};
		}
	}

	/*
	*	HTML template for buckets table
	*/
	template_buckets_table(buckets) {
		let res = `<table class="wp-list-table widefat fixed">
		<thead>
			<tr>
				<th>Bucket name</th>
				<th>Bucket key</th>
				<th style="text-align: center">Actions</th>
			</tr>
		</thead>
		<tbody>`;
		buckets = buckets ? buckets : {};

		for (let bucket of buckets) {
			res += `
			<tr>
				<td>${ bucket.name }</td>
				<td>${ bucket.key }</td>
				<td style="text-align: center">
					<button 
						data-bucket-name="${ bucket.name }"
						data-bucket-key="${ bucket.key }"
						type="button" 
						class="button button-primary btn-tbl-setBucketName"
						>Select</button>
				</td>
			</tr>
			`;
		}

		res += `<tbody>
		</table>`;

		return res;
	}

	/*
	*	Set bucket's name input field value
	*/
	setTxtBucketName(_name: string) {
		const txt_bucket_name = document.getElementById('textile_archive_txt_bucket_name');
		const name = String.prototype.trim.call(_name);
		let isNextStepButtonDisabled = document.getElementById(
			'textile_archive_btn_activate_posts'
		);
		isNextStepButtonDisabled = isNextStepButtonDisabled ?
			isNextStepButtonDisabled.disabled : false;

		if (txt_bucket_name && !isNextStepButtonDisabled) {
			txt_bucket_name.value = name;
		} else if (!txt_bucket_name) {
			console.error('textile_archive_txt_bucket_name not found');
		}
	}

	/*
	*	Get bucket list from IPFS
	*/
	getBuckets(btn_get_buckets) {
		const resultsContainer = document.getElementById('wptextile_archive_section_bucket_settings_bucklist');
		if (resultsContainer) {
			resultsContainer.innerHTML = LOADER2;
			btn_get_buckets.disabled = true;
		} else {
			alert('Missing template elements');
			return;
		}

		// 1. Get threads and find "buckets" thread
		this.wp.getThreadsListContent().then((data: any) => {
			const content: any = data;
			const threads = content.hasOwnProperty('data') ? 
				content.data : {};
			let threadId: string = '';

			// Find "buckets" thread and get id
			for (let thread of threads) {
				// If thread "buckets"
				if (thread.hasOwnProperty('name') && 
					thread.name === 'buckets') {
					threadId = thread.id;
					// Break loop
					break;
				}
			}

			return threadId;
		}).then((data) => {
			// On success, get buckets list 
			const threadId = data ? data : '';

			if (threadId !== '') {
				// Message to display
				resultsContainer.innerHTML = LOADER2;

				// Get buckets
				this.wp.getBucketsListContent(threadId).then((data: any) => {
					const result = data && data.hasOwnProperty('data') ?
						data.data : {};
					resultsContainer.innerHTML = this.template_buckets_table(result);
					// Set listeners 
					window.setTimeout(() => {
						this.template_buckets_table_listeners();
					}, 600);
					
					resultsContainer.innerHTML += '<h3>Thread id: <small>' + threadId + '</small></h3>';
				
					btn_get_buckets.disabled = false;
				}).catch((reason) => {
					// Error message
					resultsContainer.innerText = 'Error: ' + reason;
					btn_get_buckets.disabled = false;
				});
			} else {
				// Error message
				btn_get_buckets.disabled = false;
				resultsContainer.innerText = 'Error: Could not get threads data';
			}

			
		}).catch((reason) => {
			// Error message
			btn_get_buckets.disabled = false;
			resultsContainer.innerText = 'Error: ' + reason;
			
		});
	}

	/*
	*	Activate (display) "Posts list" section 
	*/
	activateSectionPosts(btn_activate_posts): void {
		
		const div_bucket_info = document.getElementById('textile_archive_div_bucket_gen_info');
		// 1. Validate that "buckets name" input has a value
		const txt_bucket_name = document.getElementById('textile_archive_txt_bucket_name');
		if (!txt_bucket_name || !div_bucket_info) {
			throw 'Missing template elements';
		}

		// Disable input
		txt_bucket_name.disabled = true;

		// Get bucket name
		const bucket_name = txt_bucket_name.value;
		if (bucket_name === '') {
			txt_bucket_name.disabled = false;
			throw 'Please provide a bucket name';
		}
		// 3. Show posts list
		this.showSectionPostsList(bucket_name).then((data) => {
			// Enable form elements
			// btn_activate_posts.disabled = false;
			// txt_bucket_name.disabled = false;
			div_bucket_info.innerHTML = data; 

		}).catch((reason) => {
			// Enable form elements
			txt_bucket_name.disabled = false;

			alert('Error: ' + reason);

		});

		
	}

	showSectionPostsList(bucket_name): Promise<any> {
		return new Promise((resolve, reject) => {
			try {
				this.wp.getBucketsContent(bucket_name).then((data: any) => {
					const content: any = data.data;
					if (!content) {
						throw 'Could not get bucket info';
					}

					const url = content.hasOwnProperty('url') ?
						content.url : '';
					const www = content.hasOwnProperty('www') ?
						content.www : '';
					const ipns = content.hasOwnProperty('ipns') ?
						content.ipns : '';

					// SAVE BUCKET GLOBAL PROPERTIES 
					this.bucketURL = url;
					this.bucketWWW = www;
					this.bucketIPNS = ipns;

					const msg = 
					`<table class="wp-list-table widefat fixed">
						<thead><tr><th colspan="2">Bucket Info</th></tr></thead> 
						<tbody>
							<tr>
								<td>Url</td>
								<td><a target="_blank" href="${url}">${url}</a></td>
							</tr>
							<tr>
								<td>WWW</td>
								<td><a target="_blank" href="${www}">${www}</a></td>
							</tr>
							<tr>
								<td>IPNS</td>
								<td><a target="_blank" href="${ipns}">${ipns}</a></td>
							</tr>
						</tbody>
					</table>`;

					const section_post_list = document.getElementById('wptextile_archive_section_post_list');
					if (!section_post_list) {
						throw 'Missing template elements';
					}
					// Show posts section
					section_post_list.className = '';

					resolve(msg);
				}).catch((reason) => {
					reject(reason);
				});

			} catch(err) {
				reject(err);
			}
		});
	}

	private async uploadPostToBucket_helper(
		tmp_btnUpload, bucket_name
	) {
		const dataset = tmp_btnUpload.dataset ?
			tmp_btnUpload.dataset : {};
		const post_id = dataset.hasOwnProperty('id') ?
			dataset.id : '';
		const post_slug = dataset.hasOwnProperty('slug') ?
			dataset.slug : '';
		const post_date = dataset.hasOwnProperty('date') ?
			dataset.date : '';
		const div_post_id = `wptextile_post_detail_html_${post_id}`;
		const post_html = document.getElementById(div_post_id) ?
			document.getElementById(div_post_id).innerHTML :
			'';
		const div_post_resquery = document.getElementById(
			`wptextile_archive_post_detail_deepupl_ls_${post_id}`
		);
		// Disable button
		tmp_btnUpload.disabled = true;
		// Loading msg
		div_post_resquery.innerHTML = LOADER1;
		 
		try {
			const pdate = this.dateFormat(post_date);

			// Si error
			if (!pdate) {
				throw 'Invalid date!!!';
			}

			const destination_path = `${pdate}/${post_slug}/index.html`;
			const up_res = await this.uploadPostToBucket(
				post_html, bucket_name, destination_path
			);
			if (up_res['success']) {
				const tmp_path = `${this.bucketWWW}/${destination_path}`;
				div_post_resquery.innerText = 'All right! File uploaded successfully!';
				div_post_resquery.innerHTML = `
					<div style="text-align: center">
						Preview:
						<a style="color: #FFFFFF" href="${tmp_path}" target="_blank">${tmp_path}</a>
					</div>
				`;
			} else {
				div_post_resquery.innerText = `Error: ${up_res['error']}`;
			}

		} catch (err) {
			div_post_resquery.innerHTML = 'Err: ' + err;;
		}

		// Enable button
		tmp_btnUpload.disabled = false;
	}

	async uploadPostToBucket(
			post_html,
			bucket_name,
			path
		) {
		const res = {
			success: false,
			error: ''
		};

		try {
			// Returns IPFS root
			const upl_res = await this.wp.uploadHTMLFile(
				bucket_name,
				post_html,
				path
			);
			res['success'] = true;
		} catch (err) {
			res['error'] = err;
		}

		return res;
		
	}

	async deepUploadPostToBucket_helper(tmp_btnDeepUpload, bucket_name) {
		const dataset = tmp_btnDeepUpload.dataset ?
			tmp_btnDeepUpload.dataset : {};
		const post_id = dataset.hasOwnProperty('id') ?
			dataset.id : '';
		const post_slug = dataset.hasOwnProperty('slug') ?
			dataset.slug : '';
		const post_date = dataset.hasOwnProperty('date') ?
			dataset.date : '';
		const div_post_id = 'wptextile_post_detail_html_' + post_id;
		const post_html = document.getElementById(div_post_id) ?
			document.getElementById(div_post_id).innerHTML :
			'';
		const div_post_resquery = document.getElementById(
			`wptextile_archive_post_detail_deepupl_ls_${post_id}`
		);
		// Disable button
		tmp_btnDeepUpload.disabled = true;
		 
		try {
			await this.deepUploadPostToBucket(
				post_id, post_slug, post_html,
				post_date, bucket_name, div_post_id,
				div_post_resquery
			);
		} catch (err) {
			div_post_resquery.innerHTML = 'Err: ' + err;
		}

		// Enable button
		tmp_btnDeepUpload.disabled = false;
	}

	async deepUploadPostToBucket(
			post_id,
			post_slug,
			post_html,
			post_date,
			bucket_name,
			div_post_id,
			div_post_resquery
		) {
		const pdate = this.dateFormat(post_date);
		const path_assets = `${pdate}/${post_slug}/assets/`;
		const path_index = `${pdate}/${post_slug}/`;
		// Si error
		if (!pdate) {
			throw 'Wrong date format';
		}

		// Loader 
		const loading = document.getElementById(
			`wptextile_archive_post_detail_deepupl_loader_${post_id}`
		);
		loading.innerHTML = LOADER1;

		try {
			// Get DOM object from current post HTML
			const assets = this.enumerateFiles(div_post_id);
			// Upload files to bucket
			const uploaded_files = await this.uploadFiles(
				div_post_resquery,
				assets,
				bucket_name,
				path_assets
			);

			// Upload post index 
			await this.deepCp_uploadPostIndex(
				div_post_resquery,
				div_post_id,
				uploaded_files,
				bucket_name,
				path_index
			);
			

			loading.innerHTML = '';

		} catch (err) {
			loading.innerHTML = err;
			// throw err;
		}
		
	}

	private async deepCp_uploadPostIndex(
		div_post_resquery,
		div_post_id,
		allFiles,
		bucket_name,
		path
	) {
		const div_post = document.getElementById(div_post_id);
		const file_url = '';
		const filename = 'index.html';
		// Save a copy of original HTML post
		const copy = div_post.innerHTML;

		div_post_resquery.innerHTML += `
		<div style="text-align: center">
				- Uploading index file ${filename} to bucket ...
		</div>`;
		div_post_resquery.innerHTML += '<br>';

		// Update original post content directly (assets only)
		// change src with bucket urls
		for (const f of allFiles) {
			const dom_element = f.DOM;
			dom_element.src = f.bucket_url;
		}

		try {
			// Upload post to bucket
			await this.uploadPostToBucket(
					div_post.innerHTML,
					bucket_name,
					path + filename
			);

			const tmp_path = `${this.bucketWWW}/${path + filename}`;
			div_post_resquery.innerHTML += `
				<div style="text-align: center">
					Preview:
					<a style="color: #FFFFFF" href="${tmp_path}" target="_blank">${tmp_path}</a>
				</div>
			`;

			// Restore original post content on UI
			div_post.innerHTML = copy;

		} catch (err) {
			throw err;
		}

	}

	private dateFormat(post_date: string) {
		let fdate = post_date.substr(0, 10);
		if (fdate.length != 10) {
			fdate = '';
		} else {
			fdate = fdate.replace(/-/g, '/');
		}

		return fdate;
	}

	private enumerateFiles(div_id) {
		const files = {
			images: [],
			videos: []
		};
		const container = document.getElementById(div_id);
		const images = container.getElementsByTagName('img');
		const videos = container.getElementsByTagName('video');

		for (const img of images) {
			files.images.push({
				DOM: img,
				src: img.src
			});
		}
		for (const video of videos) {
			files.videos.push({
				DOM: video,
				src: video.src
			});
		}
		return files;
	}

	private async uploadFiles(
		div_post_resquery,
		files,
		bucket_name,
		path
	) {
		const allFiles = [].concat(files.images).concat(files.videos);
		const numFiles = allFiles.length;

		for (let i = 0; i < numFiles; i++) {
			const file_url = allFiles[i].src;

			div_post_resquery.innerHTML += `
			<div style="text-align: center">
					- Uploading ${file_url} ...
			</div>`;
			div_post_resquery.innerHTML += '<br>';
			try {
				const filename = file_url.split('/').slice(-1)[0];
				const upl_res = await this.wp.uploadFileFromHTTPServer(
					file_url, bucket_name, path, filename
				);
				const tmp_path = `${this.bucketWWW}/${path + filename}`;
				div_post_resquery.innerHTML += `
					<div style="text-align: center">
						Preview:
						<a style="color: #FFFFFF" href="${tmp_path}" target="_blank">${tmp_path}</a>
					</div>
				`;

				// Save bucket url in files array 
				allFiles[i].bucket_url = tmp_path;


			} catch (err) {
				div_post_resquery.innerText += 'Error: ' + err;
				div_post_resquery.innerHTML += `
				<div style="text-align: center">
						!!! Error: ${err} ...
				</div>`;
				div_post_resquery.innerHTML += '<br>';
			}
		}

		return allFiles;
		
	}

	/*
	*	Create index file
	*/
	private createIndexForBucket(url) {
		const site_name = document.getElementById('textile_archive_txt_site_name').value;
		const data = {
			action: 'textileindextemplate',
			template: 'default',
			site_name: site_name,
			bucket_url: this.bucketURL
		};
		const container_res = document.getElementById(
			'wptextile_archive_section_bucket_create_index_res'
		);
		const bucket_name = document.getElementById(
			'textile_archive_txt_bucket_name'
		).value;

		container_res.innerHTML = LOADER2;

		this.fapi.post(url, data)
			.then(async (response) => {
				const content = await response.text();
				const tmp_path = `${this.bucketWWW}/index.html`;

				// Check for errors 
				if (!content) {
					container_res.innerText = 'No template found';
					return false;
				}

				// Upload index to bucket
				await this.uploadPostToBucket(
						content,
						bucket_name,
						'index.html'
				);
				container_res.innerHTML = 'Index file successfully created!';
				container_res.innerHTML += `
					<div style="text-align: center">
						Preview:
						<a href="${tmp_path}" target="_blank">${tmp_path}</a>
					</div>
				`;

			})
			.catch((err) => {
				let error_msg = '';
				if (typeof err === 'object') {
					error_msg = 'Error : ' + JSON.stringify(err);
				} else {
					error_msg =  'Error: ' + err;
				}

				container_res.innerText = error_msg;
			});
	}

}