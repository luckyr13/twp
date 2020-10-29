import { WPTextilePlugin } from './wptextileplugin';
import { FetchAPI } from './fetch-api';

export class WPTextilePluginTabRawQuery {
	private wp: WPTextilePlugin;
	private fapi: FetchAPI;

	constructor(_wp: WPTextilePlugin) {
		this.wp = _wp;
		this.fapi = new FetchAPI();
	}
	/*
	*	Set listeners for components in Buckets tab
	*/
	setBucketsTabListeners() {
		// Button: "GET BUCKETS"
		const btn_get_buckets = document.getElementById('textile_buckets_btn_get_buckets');
		
		// Click event for buckets button
		if (btn_get_buckets) {
			btn_get_buckets.onclick = () => {
				this.getBuckets(btn_get_buckets);
			};
		}

		// Button Get bucket content
		const btnBucketContentId = 'textile_btn_get_bucket_content';
		const btnBucketContent = document.getElementById(btnBucketContentId);
		btnBucketContent.addEventListener('click', () => {
			const resultsContainer = document.getElementById('wptextile_tab_content_buckets_results_bcont');
			const txt_bucketname: any = document.getElementById('textile_txt_get_bucket_content_bname');
			const custom_bucketname: string = txt_bucketname ? txt_bucketname.value : '';

			if (resultsContainer) {
				resultsContainer.innerText = 'Loading ...';
			}

			this.wp.getBucketsContent(custom_bucketname).then((data: any) => {
				const content: any = data.data;

				const url = content.hasOwnProperty('url') ?
					content.url : '';
				const www = content.hasOwnProperty('www') ?
					content.www : '';
				const ipns = content.hasOwnProperty('ipns') ?
					content.ipns : '';

				const msg = 'Bucket data: <br>' +
					'Url: <a target="_blank" href="' + url + '">' + url + '</a><br>' +
					'WWW: ' + www + '<br>' +
					'IPNS: ' + ipns;

				if (resultsContainer) {
					resultsContainer.innerHTML = msg;
				}
			}).catch((reason) => {
				const content = reason;
				if (resultsContainer) {
					resultsContainer.innerText = 'Error: ' + content;
				}
			});
		}, false);

		


		// File upload listeners 
		this.fileUploadListeners();

	}

	fileUploadListeners() {
		// File upload listeners 
		const btnFileUploadId = 'textile_btn_upload';
		const btnFileUpload: any = document.getElementById(btnFileUploadId);
		btnFileUpload.addEventListener('click', () => {
			const txtImageId = 'textile_image';
			let bucketNameForFileUpload: any = document.getElementById('textile_txt_upload_file_bucketname');
			bucketNameForFileUpload = bucketNameForFileUpload ? bucketNameForFileUpload.value : '';
			
			try {
				const results_container = 
					document.getElementById('wptextile_tab_content_buckets_results_fileupload');
				results_container.innerText = 'Loading ...';
				btnFileUpload.disabled = true;

				this.wp.uploadFile(
					txtImageId, bucketNameForFileUpload
				).then(function(data) {
					results_container.innerText = JSON.stringify(data);
					btnFileUpload.disabled = false;
				}).catch(function(err) {
					results_container.innerText = 'Error: ' + err;
					btnFileUpload.disabled = false;
				});
			} catch (err) {
				alert('File upload error: ' + err);
			}
			

		}, false);
	}

	/*
	*	Get bucket list from IPFS
	*/
	getBuckets(btn_get_buckets) {
		const resultsContainer = document.getElementById('wptextile_tab_content_buckets_results_bucketsAuto');
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
				resultsContainer.innerHTML = 'Loading ...';

				// Get buckets
				this.wp.getBucketsListContent(threadId).then((data: any) => {
					const result = data && data.hasOwnProperty('data') ?
						data.data : {};
					resultsContainer.innerHTML = this.template_buckets_table(result);
					resultsContainer.innerHTML += '<h3>Thread id:<small>' + threadId + '</small></h3>';
					// Listeners 
					const a_bucketKey_viewFiles: any = document.getElementsByClassName('wptextile_buckets_tbl_view_files');
					for (let bk_vf of a_bucketKey_viewFiles) {
						bk_vf.addEventListener('click', () => {
							const bucketKey = bk_vf.dataset.key;

							this.getFilesFromBucket(bucketKey, threadId);
						});
					}

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
	*	HTML template for buckets table
	*/
	template_buckets_table(buckets) {
		let res = `<table class="wp-list-table widefat fixed striped">
		<thead>
			<tr>
				<th>Bucket name</th>
				<th>Bucket key</th>
			</tr>
		</thead>
		<tbody>`;
		buckets = buckets ? buckets : {};

		for (let bucket of buckets) {
			res += `
			<tr>
				<td>${ bucket.name }</td>
				<td>
					<a data-key="${ bucket.key }" 
					  class="wptextile_buckets_tbl_view_files">${ bucket.key }<a>
				</td>
			</tr>
			`;
		}

		res += `<tbody>
		</table>`;

		return res;
	}

	/*
	*	HTML template for files table
	*/
	template_bucketsFiles_table(files, url) {
		let res = `<table class="wp-list-table widefat fixed striped">
		<thead>
			<tr>
				<th>Filename</th>
				<th>Updated at</th>
			</tr>
		</thead>
		<tbody>`;
		files = files ? files : {};

		for (let key in files) {
			const updated_at = files[key].updated_at ?
				files[key].updated_at : '';
			res += `
			<tr>
				<td>
					<a href="${url}/${key}" target="_blank">${key}<a>
				</td>
				<td>${ updated_at }</td>
			</tr>
			`;
		}

		res += `<tbody>
		</table>`;

		return res;
	}

	getFilesFromBucket(bucketKey: string, threadId: string) {
		const url = `https://hub.textile.io/thread/${threadId}/buckets/${bucketKey}`;
		const final_url = `${url}?json=true`;
		const content_result = document.getElementById('wptextile_tab_content_buckets_results_bucketsAuto_files');
		content_result.innerText = 'Loading ...';

		this.fapi.get(final_url).then(async (data) => {
			const res = JSON.parse(await data.text());
			let files = res && res.hasOwnProperty('metadata') ? 
				res.metadata : {};
			let html = `
			<h4>Bucket ${bucketKey}</h4>
			${ this.template_bucketsFiles_table(files, url) }
			<p style="font-size: 12px; font-style: italic">
				View bucket:
				<a href="${url}" target="_blank">${url}<a>
			</p>
			`;
			

			content_result.innerHTML = html;

		}).catch((reason) => {
			alert('Error: ' + reason);
		});
	}


}