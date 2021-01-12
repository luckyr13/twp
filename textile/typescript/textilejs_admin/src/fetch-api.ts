export class FetchAPI {
	/*
	*	 Post request
	*/
	post(_url: string, _data: any): Promise<Response> {
		const url = _url.trim();
		const data = _data;
		const qs = new URLSearchParams(data);

		return fetch(url, { 
			method: 'POST',
			body: qs,
			credentials: 'same-origin',
			headers: {
				'Content-type': 'application/x-www-form-urlencoded'
			}
		});
	}

	/*
	*	 Post request
	*/
	get(_url: string): Promise<Response> {
		const url = _url.trim();

		return fetch(url, { 
			method: 'GET'
		});
	}

}