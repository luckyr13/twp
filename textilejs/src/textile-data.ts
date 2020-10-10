declare const window: any;

export const TEXTILE_AJAX_OBJ_INTERNAL = 
	window.hasOwnProperty('TEXTILE_AJAX_OBJ') ? 
	window.TEXTILE_AJAX_OBJ : {
		apikey : '',
		apisecret : '',
		privateidentity : '',
		bucketname : '',
		bucketkey : ''
	};