import { WPTextilePlugin } from './wptextileplugin';
declare const document: any;

class Index {
	private wp: WPTextilePlugin;
	
	constructor() {
		this.wp = new WPTextilePlugin();
	}

	async run() {

		// Set listeners
		this.setListeners();

	}

	/*
	*	Set website content
	*/
	setContent(_msg: string) {
		const wptextile_result_area = document.getElementById('wptextile_result_area');
		// Preload
		if (wptextile_result_area) {
			wptextile_result_area.innerHTML = _msg;
		}
	}

	/*
	*	Set website listeners
	*/
	setListeners() {

		// Button Generate New Identity
		const btnNewIdentityId = 'textile_btn_generate_new_identity';
		const btnNewIdentity = document.getElementById(btnNewIdentityId);
		btnNewIdentity.addEventListener('click', () => {
			const msg = 'Create a new identity will override any previous value.' +
			    ' Do you want to proceed?';

			if (confirm(msg)) {
				this.wp.setNewIdentityFormFields('wptextile_userdata_privateidentity');
			}
		}, false);

		// Enable/disable readonly on private identity input 
		const chkNewIdentityId = 'wptextile_userdata_privateidentity_chk';
		const chkNewIdentity = document.getElementById(chkNewIdentityId);
		chkNewIdentity.addEventListener('change', () => {
			const txtPrivateIdentity = document.getElementById('wptextile_userdata_privateidentity');
			txtPrivateIdentity.readOnly = !txtPrivateIdentity.readOnly;
		}, false);

		// File upload listeners 
		const btnFileUploadId = 'textile_btn_upload';
		const btnFileUpload = document.getElementById(btnFileUploadId);
		btnFileUpload.addEventListener('click', () => {
			const txtImageId = 'textile_image';
			let bucketNameForFileUpload = document.getElementById('textile_txt_upload_file_bucketname');
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
		

		
		// Init tab menu listeners 
		this.setTabsMenuListeners('wptextile_tabs_area');

		// EVENTS IN TABS COMPONENTS 
		// Buckets Tab 
		this.setBucketsTabListeners();

	}

	/*
	*	Set tabs menu listeners
	*/
	setTabsMenuListeners(tabsContainerId: string) {
		var container = document.getElementById('wptextile_tabs_area');
		var ulMenu = container.getElementsByClassName('wptextile_tabs_menu')[0];

		// Check if exists tabs container and menu
		if (container && ulMenu) {
			// Add listeners to menu options 
			var menuOptions = ulMenu.getElementsByTagName('a');
			const menuOptionsLength = menuOptions.length;

			for (let j = 0; j < menuOptionsLength; j++) {
				// Add click event handler for each tab menu option
				menuOptions[j].addEventListener('click', function() {
					// Turn off selected main tab option
					const oldTab = ulMenu.querySelector('.main');
					if (oldTab) {
						oldTab.className = '';
						// Hide old main content 
						const oldTabContentClassName = oldTab.dataset.tab;

						if (oldTabContentClassName) {
							// Tabs content main container
							const selectedMainContent = 
								container.getElementsByClassName(
									'wptextile_tab_content ' + oldTabContentClassName
								)[0];
							selectedMainContent.className = selectedMainContent.className + ' hide';
						}
					}


					// Set new main tab option
					const newTab = this;
					newTab.className = 'main';

					const newTabContentClassName = newTab.dataset.tab;
					// Show new tab main content
					const newMainContentContainer = 
						container.getElementsByClassName(
							'wptextile_tab_content ' + newTabContentClassName
						)[0];
					if (newMainContentContainer) {
						newMainContentContainer.className = 'wptextile_tab_content ' + newTabContentClassName;
					}
				}, false);
			}

		}
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
			const txt_bucketname = document.getElementById('textile_txt_get_bucket_content_bname');
			const custom_bucketname = txt_bucketname ? txt_bucketname.value : '';

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
			const txt_threadid = document.getElementById('textile_txt_get_buckets_list_threadid');
			const custom_threadid = txt_threadid ? txt_threadid.value : '';

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
	}


}


// Main 
(
	async () => {
		// Initialize index page 
		const index = new Index();
		await index.run();
	}
)();
