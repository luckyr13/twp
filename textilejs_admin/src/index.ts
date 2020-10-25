import { TEXTILE_AJAX_OBJ_INTERNAL } from './textile-data';
import { WPTextilePlugin } from './wptextileplugin';
import { WPTextilePluginTabRawQuery } from './wptextileplugin-tab-raw-query';
import { WPTextilePluginTabArchive } from './wptextileplugin-tab-archive';

declare const document: any;

class Index {
	private wp: WPTextilePlugin;
	private wp_raw_query: WPTextilePluginTabRawQuery;
	private wp_archive: WPTextilePluginTabArchive;
	private ajax_url: string;
	
	constructor() {
		this.wp = new WPTextilePlugin(TEXTILE_AJAX_OBJ_INTERNAL);
		this.wp_raw_query = new WPTextilePluginTabRawQuery(this.wp);
		this.wp_archive = new WPTextilePluginTabArchive(this.wp);
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
		// Identity listeners
		this.identityListeners();
		// Init tab menu listeners 
		this.setTabsMenuListeners('wptextile_tabs_area');

		// EVENTS IN TABS COMPONENTS 
		// Archive tab 
		this.wp_archive.setTabListeners(this.ajax_url);

		// Buckets query Tab 
		this.wp_raw_query.setBucketsTabListeners();

	}

	/*
	*	Listeners for Generate New Identity button
	*	and to Enable/disable identity input
	*/
	identityListeners() {
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

	
	


}


// Main 
(
	async () => {
		// Initialize index page 
		const index = new Index();
		await index.run();
	}
)();
