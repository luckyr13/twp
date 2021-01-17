import { TEXTILE_AJAX_OBJ_INTERNAL } from './textile-data';
import { WPTextilePlugin } from './wptextileplugin';
import { WPTextilePluginTabRawQuery } from './wptextileplugin-tab-raw-query';
import { WPTextilePluginTabArchive } from './wptextileplugin-tab-archive';
import { WPTextilePluginTabFilecoin } from './wptextileplugin-tab-filecoin';

declare const document: any;
declare const window: any;

class Index {
	private wp: WPTextilePlugin;
	private wp_raw_query: WPTextilePluginTabRawQuery;
	private wp_archive: WPTextilePluginTabArchive;
	private wp_filecoin: WPTextilePluginTabFilecoin;
	private ajax_url: string;
	
	constructor() {
		this.wp = new WPTextilePlugin(TEXTILE_AJAX_OBJ_INTERNAL);
		this.wp_raw_query = new WPTextilePluginTabRawQuery(this.wp);
		this.wp_archive = new WPTextilePluginTabArchive(this.wp);
		this.wp_filecoin = new WPTextilePluginTabFilecoin(this.wp);
		this.ajax_url = TEXTILE_AJAX_OBJ_INTERNAL.ajax_url;
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
		
		// Type of keys listeners
		this.typeOfKeysListeners(
			'wptextile_options[wptextile_userdata_typeofapikey]',
			'wptextile_userdata_privateidentity',
			'textile_btn_generate_new_identity',
			'wptextile_userdata_privateidentity_label'
		); 

		// Identity listeners
		this.identityListeners(
			'textile_btn_generate_new_identity',
			'wptextile_userdata_privateidentity_chk',
			'wptextile_userdata_privateidentity'
		);
		// Init tab menu listeners 
		this.setTabsMenuListeners(
			'wptextile_tabs_area',
			'wptextile_tabs_menu',
			'wptextile_tab_content'
		);

		// EVENTS IN TABS COMPONENTS 
		// Archive tab 
		this.wp_archive.setTabListeners(this.ajax_url);

		// Buckets query Tab 
		this.wp_raw_query.setBucketsTabListeners();

		// Filecoin tab
		this.wp_filecoin.setTabListeners();

	}

	/*
	*	Listeners to show/hide elements 
	*	if user choose between Account keys and User group keys
	*/
	typeOfKeysListeners(
		radioNameTypeOfKeys: string,
		privateIdentityId: string,
		btnPrivateIdentityId: string,
		labelPrivateIdentityId: string
	) {
		const radio_options = document.getElementsByName(radioNameTypeOfKeys);
		// Show hide Private identity elements based 
		// on loaded values for Type of Keys
		this.showHidePrivateIdentityElements(
			radioNameTypeOfKeys,
			privateIdentityId,
			btnPrivateIdentityId,
			labelPrivateIdentityId
		); 

		// Add listeners
		if (radio_options) {
			for (let opt of radio_options) {
				opt.addEventListener('change', () => {
					this.showHidePrivateIdentityElements(
						radioNameTypeOfKeys,
						privateIdentityId,
						btnPrivateIdentityId,
						labelPrivateIdentityId
					); 
				});
			}
		}
	}

	/*
	*	Show/hide private identity elements 
	*	based on user selection for Type of keys 
	*/
	showHidePrivateIdentityElements(
			radioNameTypeOfKeys: string,
			privateIdentityId: string,
			btnPrivateIdentityId: string,
			labelPrivateIdentityId: string
		) {
		const radio_options = document.getElementsByName(radioNameTypeOfKeys);
		const private_identity = document.getElementById(privateIdentityId);
		const btn_private_identity = document.getElementById(btnPrivateIdentityId);
		const label_private_identity = document.getElementById(labelPrivateIdentityId);
		
		if (radio_options && 
			private_identity && 
			btn_private_identity && 
			labelPrivateIdentityId) {
			// Get parent of private identity input (2 levels)
			const containerPrivateIdentity = private_identity.parentNode.parentNode;

			for (let opt of radio_options) {
				if (opt.value === 'account_key' && opt.checked) {
					containerPrivateIdentity.style.display = 'none';
					btn_private_identity.style.display = 'none';
					label_private_identity.style.display = 'none';
					private_identity.required = false;
					break;
				} else if (opt.value === 'user_group_key' && opt.checked) {
					containerPrivateIdentity.style.display = '';
					btn_private_identity.style.display = '';
					label_private_identity.style.display = '';
					private_identity.required = true;
					break
				}
			
			}
		} else {
			alert('Missing template elements');
		}
	}

	/*
	*	Listeners for Generate New Identity button
	*	and to Enable/disable identity input
	*/
	identityListeners(
		btnNewIdentityId: string,
		chkNewIdentityId: string, 
		txtPrivateIdentityId: string
		) {
		// Button Generate New Identity
		const btnNewIdentity = document.getElementById(btnNewIdentityId);
		btnNewIdentity.addEventListener('click', () => {
			const msg = 'Create a new identity will override any previous value.' +
			    ' Do you want to proceed?';

			if (confirm(msg)) {
				this.wp.setNewIdentityFormFields('wptextile_userdata_privateidentity');
			}
		}, false);

		// Enable/disable readonly on private identity input 
		const chkNewIdentity = document.getElementById(chkNewIdentityId);
		chkNewIdentity.addEventListener('change', () => {
			const txtPrivateIdentity = document.getElementById(txtPrivateIdentityId);
			txtPrivateIdentity.readOnly = !txtPrivateIdentity.readOnly;
		}, false);
	}

	/*
	*	Set tabs menu listeners
	*/
	setTabsMenuListeners(
		tabsContainerId: string,
		ulMenuClassName: string,
		tabContentClassName: string
		) {
		var container = document.getElementById(tabsContainerId);
		var ulMenu = container.getElementsByClassName(ulMenuClassName)[0];

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
									tabContentClassName + ' ' + oldTabContentClassName
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
							tabContentClassName + ' ' + newTabContentClassName
						)[0];
					if (newMainContentContainer) {
						newMainContentContainer.className = tabContentClassName + ' ' + newTabContentClassName;
					}
				}, false);
			}

		}
	}

	
	


}


// Main 
window.addEventListener('load', async () => {
		// Initialize index page 
		const index = new Index();
		await index.run();
	}
);
