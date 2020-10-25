import { TextileAjaxObjInternal } from './interfaces/textile-ajax-obj';
declare const window: any;

export const TEXTILE_AJAX_OBJ_INTERNAL: TextileAjaxObjInternal = 
	window.hasOwnProperty('TEXTILE_AJAX_OBJ') ? 
	window.TEXTILE_AJAX_OBJ : {
		apikey : '',
		apisecret : '',
		privateidentity : '',
		ajax_url: ''
	};
