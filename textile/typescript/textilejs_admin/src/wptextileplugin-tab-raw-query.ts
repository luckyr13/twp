import { WPTextilePlugin } from './wptextileplugin';
import { FetchAPI } from './fetch-api';
import { LOADER1, LOADER2 } from './loader';

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
				this.getBuckets(
					'textile_buckets_btn_get_buckets',
					'wptextile_tab_content_buckets_results_bucketsAuto'
				);
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
				resultsContainer.innerHTML = LOADER2;
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
					'WWW: <a target="_blank" href="' + www + '">' + www + '</a><br>' +
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
		this.fileUploadListeners(
			'textile_bucket_txt_upload_file_bucketname',
			'textile_bucket_btn_upload',
			'wptextile_tab_content_buckets_results_fileupload',
			'textile_bucket_fup_single_file'
		);

	}

	fileUploadListeners(
		bucketNameForFileUploadId: string,
		btnFileUploadId: string,
		resultsContainerId: string,
		txtFileUploadId: string

	) {
		// File upload listeners 
		const btnFileUpload: any = document.getElementById(btnFileUploadId);
		btnFileUpload.addEventListener('click', () => {
			let bucketNameForFileUpload: any = document.getElementById(bucketNameForFileUploadId);
			const bucketNameForFileUploadValue = bucketNameForFileUpload ? bucketNameForFileUpload.value : '';
			
			try {
				const results_container = 
					document.getElementById(resultsContainerId);
				results_container.innerHTML = LOADER2;
				btnFileUpload.disabled = true;
				bucketNameForFileUpload.disabled = true;

				this.wp.uploadFile(
					txtFileUploadId, bucketNameForFileUploadValue
				).then(function(data) {
					results_container.innerText = JSON.stringify(data);
					btnFileUpload.disabled = false;
					bucketNameForFileUpload.disabled = false;
				}).catch(function(err) {
					results_container.innerText = 'Error: ' + err;
					btnFileUpload.disabled = false;
					bucketNameForFileUpload.disabled = false;
				});
			} catch (err) {
				alert('File upload error: ' + err);
			}
			

		}, false);
	}

	/*
	*	Get bucket list from IPFS
	*/
	getBuckets(btnGetBucketsId: string, resultsContainerId: string) {
		const btn_get_buckets: any = document.getElementById(btnGetBucketsId);
		const resultsContainer = document.getElementById(resultsContainerId);
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
					resultsContainer.innerHTML += '<h3>Thread id:<small>' + threadId + '</small></h3>';
					// Listeners 
					const a_bucketKey_viewFiles: any = document.getElementsByClassName('wptextile_buckets_tbl_view_files');
					for (let bk_vf of a_bucketKey_viewFiles) {
						bk_vf.addEventListener('click', () => {
							const bucketKey = bk_vf.dataset.key;

							this.getFilesFromBucket(bucketKey, threadId);
						});
					}

					const a_bucketKey_removeBucket: any = document.getElementsByClassName('wptextile_buckets_tbl_remove');
					for (let bk_db of a_bucketKey_removeBucket) {
						bk_db.addEventListener('click', () => {
							const bucketKey = bk_db.dataset.key;
							const bucketName = bk_db.dataset.bucketName;
							this.removeBucket(bucketKey, bucketName, threadId);
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
				<th>Actions</th>
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
				<td>
					<a data-key="${ bucket.key }" data-bucket-name="${ bucket.name }" 
					  class="wptextile_buckets_tbl_view_files">View<a>
					&nbsp;
					<a data-key="${ bucket.key }" data-bucket-name="${ bucket.name }" 
					  class="wptextile_buckets_tbl_remove">Remove<a>
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
	template_bucketsFiles_table(files, url, bucketKey) {
		let res = `<table class="wp-list-table widefat fixed striped">
		<thead>
			<tr>
				<th>Filename</th>
				<th>Updated at</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>`;
		files = files ? files : {};

		for (let fileName in files) {
			const updated_at = files[fileName].updated_at ?
				files[fileName].updated_at : '';
			res += `
			<tr>
				<td>
					<a href="${url}/${fileName}" target="_blank">${fileName}<a>
				</td>
				<td>${ updated_at }</td>
				<td>
					<a href="${url}/${fileName}" style="color: #2935FF" target="_blank">View<a>
					&nbsp;
					<a data-file-name="${ fileName }" data-key="${ bucketKey }" 
					  class="wptextile_buckets_tbl_remove_file">Delete<a>
				</td>
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
		content_result.innerHTML = LOADER2;

		this.fapi.get(final_url).then(async (data) => {
			const res = await data.json();
			let files = res && res.hasOwnProperty('metadata') ? 
				res.metadata : {};
			let html = `
			<h4>Bucket ${bucketKey}</h4>
			${ this.template_bucketsFiles_table(files, url, bucketKey) }
			<p style="font-size: 12px; font-style: italic">
				View bucket:
				<a href="${url}" target="_blank">${url}<a>
			</p>
			`;
			

			content_result.innerHTML = html;

			const a_bucketKey_removeFile: any = document.getElementsByClassName('wptextile_buckets_tbl_remove_file');
			for (let bk_db of a_bucketKey_removeFile) {
				bk_db.addEventListener('click', () => {
					const bucketKey = bk_db.dataset.key;
					const fileName = bk_db.dataset.fileName;
					this.removeFile(bucketKey, fileName, threadId);
				});
			}

		}).catch((reason) => {
			alert('Error: ' + reason);
		});
	}

	removeBucket(bucketKey: string, bucketName: string, threadId: string) {
		if (confirm(`You are about to remove the bucket "${bucketName}".\nThis process is irreversible. Are you sure you want to proceed?`)) {
			document.getElementById('wptextile_tab_content_buckets_results_bucketsAuto').innerHTML = LOADER2;

			this.wp.remove(bucketKey, threadId).then((data) => {
				this.getBuckets(
					'textile_buckets_btn_get_buckets',
					'wptextile_tab_content_buckets_results_bucketsAuto'
				);
			}).catch((reason) => {
				alert('Error: ' + reason);
			});

		}
		
	}

	removeFile(bucketKey: string, fileName: string, threadId: string) {
		if (confirm(`You are about to remove the file "${fileName}".\nThis process is irreversible. Are you sure you want to proceed?`)) {
			document.getElementById('wptextile_tab_content_buckets_results_bucketsAuto_files').innerText = 'Loading ...';

			this.wp.removeFile(bucketKey, fileName, threadId).then((data) => {
				this.getFilesFromBucket(bucketKey, threadId);
			}).catch((reason) => {
				alert('Error: ' + reason);
			});

		}
		
	}

}