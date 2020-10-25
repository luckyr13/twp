import { WPTextilePlugin } from './wptextileplugin';

export class WPTextilePluginTabRawQuery {
	private wp: WPTextilePlugin;

	constructor(_wp: WPTextilePlugin) {
		this.wp = _wp;
	}
	/*
	*	Set listeners for components in Buckets tab
	*/
	setBucketsTabListeners() {
		// Button Get threads list
		const btnThreadsListId = 'textile_btn_get_threads_list';
		const btnThreadsList = document.getElementById(btnThreadsListId);
		btnThreadsList.addEventListener('click', () => {
			const resultsContainer = document.getElementById('wptextile_tab_content_buckets_results');
			if (resultsContainer) {
				resultsContainer.innerText = 'Loading ...';
			}
			this.wp.getThreadsListContent().then((data: any) => {
				const content: any = data;
				
				const msg = JSON.stringify(content);
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

		// Button Get buckets list
		const btnBucketsListId = 'textile_btn_get_buckets_list';
		const btnBucketsList = document.getElementById(btnBucketsListId);
		btnBucketsList.addEventListener('click', () => {
			const resultsContainer = document.getElementById('wptextile_tab_content_buckets_results');
			const txt_threadid: any = document.getElementById('textile_txt_get_buckets_list_threadid');
			const custom_threadid: string = txt_threadid ? txt_threadid.value : '';

			if (resultsContainer && custom_threadid == '') {
				resultsContainer.innerText = 'Please specify a Thread Id';
				return;
			} else if (resultsContainer) {
				resultsContainer.innerText = 'Loading ...';
			}
			this.wp.getBucketsListContent(custom_threadid).then((data: any) => {
				const content: any = data;

				const msg = JSON.stringify(content);

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
}