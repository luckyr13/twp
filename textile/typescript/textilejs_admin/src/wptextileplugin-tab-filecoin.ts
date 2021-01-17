import { WPTextilePlugin } from './wptextileplugin';
import { FetchAPI } from './fetch-api';
import { LOADER1, LOADER2 } from './loader';

export class WPTextilePluginTabFilecoin {
	private wp: WPTextilePlugin;
	private fapi: FetchAPI;

	constructor(_wp: WPTextilePlugin) {
		this.wp = _wp;
		this.fapi = new FetchAPI();
	}
	/*
	*	Set listeners for components in Filecoin tab
	*/
	setTabListeners() {
		// Button: "GET BUCKETS"
		const btn_get_buckets = document.getElementById('textile_filecoin_btn_get_buckets');
		
		// Click event for buckets button
		if (btn_get_buckets) {
			btn_get_buckets.onclick = () => {
				this.getBuckets(
					'textile_filecoin_btn_get_buckets',
					'wptextile_tab_content_filecoin_results_bucketsAuto'
				);
			};
		}

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
					const a_bucketKey_viewFiles: any = document.getElementsByClassName('wptextile_filecoin_tbl_view_archives');
					for (let bk_vf of a_bucketKey_viewFiles) {
						bk_vf.addEventListener('click', async () => {
							const bucketKey = bk_vf.dataset.key;
							const bucketName = bk_vf.dataset.bucketName;

							await this.getArchivesFromBucket(bucketKey, threadId, bucketName);
						});
					}

					const a_bucketKey_archive: any = document.getElementsByClassName('wptextile_filecoin_tbl_archive');
					for (let bk_db of a_bucketKey_archive) {
						bk_db.addEventListener('click', async () => {
							const bucketKey = bk_db.dataset.key;
							const bucketName = bk_db.dataset.bucketName;

							await this.archiveBucket(bucketKey, threadId, bucketName);

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
					  class="wptextile_filecoin_tbl_view_archives">${ bucket.key }<a>
				</td>
				<td>
					<a data-key="${ bucket.key }" data-bucket-name="${ bucket.name }" 
					  class="wptextile_filecoin_tbl_view_archives">View<a>
					&nbsp;
					<a data-key="${ bucket.key }" data-bucket-name="${ bucket.name }" 
					  class="wptextile_filecoin_tbl_archive">Archive<a>
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
	template_bucketsArchives_table(history, bucketKey) {
		let res = JSON.stringify(history);
		return res;
	}

	async getArchivesFromBucket(bucketKey: string, threadId: string, bucketName: string) {
		const content_result = document.getElementById('wptextile_tab_content_filecoin_results_bucketsAuto_archive');
		content_result.innerHTML = LOADER2;
		try {
			const archives = await this.wp.getBucketArchives(bucketName);
			content_result.innerHTML = this.template_bucketsArchives_table(archives, bucketKey);
		} catch (err) {
			content_result.innerHTML = err;
		}
	}

	async archiveBucket(bucketKey: string, threadId: string, bucketName: string) {
		const content_result = document.getElementById('wptextile_tab_content_filecoin_results_bucketsAuto_archive');
		if (confirm(`Warning! Archives are Filecoin Mainnet. Use with caution.\nAre you sure you want to proceed?`)) {
			content_result.innerHTML = LOADER2;
			try {
				await this.wp.filecoinArchive(bucketName);
				
				await this.getArchivesFromBucket(bucketKey, threadId, bucketName);
			} catch (err) {
				content_result.innerHTML = err;
			}

		}
		
	}

}