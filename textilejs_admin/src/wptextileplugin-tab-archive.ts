import { WPTextilePlugin } from './wptextileplugin';
declare const document: any;

export class WPTextilePluginTabArchive {
	private wp: WPTextilePlugin;

	constructor(_wp: WPTextilePlugin) {
		this.wp = _wp;
	}
	
	setTabListeners(url) {
		// "GET POSTS" button
		const btn_get_posts: any = document.getElementById('textile_archive_btn_get_posts');
		if (btn_get_posts) {
			btn_get_posts.onclick = () => {
				const container = document.getElementById('textile_archive_div_results');
				const data = {
					action: 'textilepostslist',
					filter: 'all'
				};
				container.innerText = 'Loading ...';

				this.post(url, data)
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
			};
		}
	}

	post(_url: string, _data: any): Promise<Response> {
		const url = _url.trim();
		const data = _data;
		const qs = new URLSearchParams(data);

		return fetch(url, { 
			method: 'POST',
			body: qs,
			credentials: 'same-origin',
			headers: {
				'Content-type': 'application/x-www-form-urlencoded'
			}
		});
	}

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
		<hr>
		`;

		return html;
	}
}