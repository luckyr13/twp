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
				const data = {
					action: 'textilepostslist',
					filter: 'all'
				};
				this.post(url, data)
					.then(async (response) => {
						var content = await response.text();
						alert('Data: ' + content);
					})
					.catch((err) => {
						if (typeof err === 'object') {
							alert('Error : ' + JSON.stringify(err) );
							console.log(err);
						} else {
							alert('Error: ' + err);
						}
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
}