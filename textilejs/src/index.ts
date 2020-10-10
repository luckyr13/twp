import { WPTextilePlugin } from './wptextileplugin';
declare const document: any;

class Index {
	private wp: WPTextilePlugin;
	
	constructor() {
		this.wp = new WPTextilePlugin();
	}

	async run() {
		// Loading msg
		this.setContent('index loaded succesfully');

		// Set listeners
		this.setListeners.bind(this);
		this.setListeners();

		// Success message
		this.setContent('Welcome!');
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
		var wp = this.wp;
		btnNewIdentity.addEventListener('click', function() {
			const msg = 'Create a new identity will override any previous value.' +
			    ' Do you want to proceed?';

			if (confirm(msg)) {
				wp.setNewIdentityFormFields('privateidentity');
			}
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
