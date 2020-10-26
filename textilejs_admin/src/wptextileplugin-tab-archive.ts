import { WPTextilePlugin } from './wptextileplugin';
import { FetchAPI } from './fetch-api';
declare const document: any;

export class WPTextilePluginTabArchive {
	private wp: WPTextilePlugin;
	private fapi: FetchAPI;

	constructor(_wp: WPTextilePlugin) {
		this.wp = _wp;
		this.fapi = new FetchAPI();
	}
	
	/*
	*	Set listeners for components in Archive tab
	*/
	setTabListeners(url) {
		// Button: "GET BUCKETS"
		const btn_get_buckets: HTMLElement = document.getElementById('textile_archive_btn_get_buckets');
		// Button "ACTIVATE POSTS"
		const btn_activate_posts: any = document.getElementById('textile_archive_btn_activate_posts');
		// Button: "GET POSTS"
		const btn_get_posts: HTMLElement = document.getElementById('textile_archive_btn_get_posts');
		

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
	}

	/*
	*	Get posts list from wordpress
	*/
	getPosts(url) {
		const container = document.getElementById('textile_archive_div_results');
		const data = {
			action: 'textilepostslist',
			filter: 'all'
		};
		container.innerText = 'Loading ...';

		this.fapi.post(url, data)
			.then(async (response) => {
				const content = JSON.parse(await response.text());
				let html = '';

				for (let post of content) {
					html += this.template_post_detail(post);
				} 
				container.innerHTML = html;
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
		<h2>POST ID: ${post_id} / <small>Last update: ${post_modified_gmt}</small></h2>
		<div class="wptextile_archive_post_detail">
			<h2>${post_title}</h2>
			<div class="post_detail_html">${post_content}</div>
		</div>
		<div class="wptextile_archive_post_detail_footer">
			MENU
		</div>
		<hr>
		`;

		return html;
	}

	/*
	*	Get bucket list from IPFS
	*/
	getBuckets(btn_get_buckets) {
		const resultsContainer = document.getElementById('wptextile_archive_section_bucket_settings_bucklist');
		if (resultsContainer) {
			resultsContainer.innerText = 'Loading ...';
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
				resultsContainer.innerHTML = '<h3>Thread id: <small>' + threadId + '</small></h3>';
				resultsContainer.innerHTML += 'Loading ...';

				// Get buckets
				this.wp.getBucketsListContent(threadId).then((data) => {
					const result = JSON.stringify(data);
					resultsContainer.innerHTML = '<h3>Thread id:<small>' + threadId + '</small></h3>';
					resultsContainer.innerHTML += '<h3>Buckets:<h3>';
					resultsContainer.innerHTML += result;

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

					const msg = 
					`
					<h3>Bucket Info: </h3>
					Url: <a target="_blank" href="${url}">${url}</a><br>
					WWW: <a target="_blank" href="${www}">${www}</a><br>
					IPNS: <a target="_blank" href="${ipns}">${ipns}</a><br>
					`;

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

}