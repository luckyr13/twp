import { PrivateKey, Client, Identity, 
	Buckets, KeyInfo, PushPathResult, UserAuth, PublicKey, Users,
	createUserAuth, APISig, createAPISig, ThreadID   } from '@textile/hub';
import { TextileAjaxObjInternal } from './interfaces/textile-ajax-obj';
import { TEXTILE_AJAX_OBJ_INTERNAL } from './textile-data';
import { FetchAPI } from './fetch-api';
import { Buffer } from 'buffer';
declare const window: any;
declare const document: any;

export class WPTextilePlugin {
	private _apikey: string;
	private _apisecret: string;
	private _privateidentity: string;
	private _keyinfo: any;
	private _fapi: FetchAPI;

	// GETTERS
	public get apikey() {
		return this._apikey;
	}

	public get apisecret() {
		return this._apisecret;
	}

	public get privateidentity() {
		return this._privateidentity;
	}

	public get keyinfo() {
		return this._keyinfo;
	}

	/*
	* Set initial data from external object
	* This data includes Textile credentials
	*/
	constructor(data: TextileAjaxObjInternal) {
		// Feed the plugin with Wordpress data
		this._apikey = data.hasOwnProperty('apikey') ? data.apikey : '';
		this._apisecret = data.hasOwnProperty('apisecret') ? data.apisecret : '';
		this._privateidentity = data.hasOwnProperty('privateidentity') ? data.privateidentity : '';
		this._keyinfo = { key: this._apikey, secret: this._apisecret };
		this._fapi = new FetchAPI();
	}

	/*
	* Generate new random identity (key pair) for user
	*/
	async generateNewIdentity(): Promise<PrivateKey> {
	  const identity = await PrivateKey.fromRandom();
	  return identity;
	}

	setIdentity(cachedIdentity: string | PrivateKey) {
	  /** Restore any cached user identity first */
	  const cached = cachedIdentity;
	  if (cached !== null && cached !== '') {
	  	if (cached instanceof PrivateKey) {
	  		this._privateidentity = cached.toString();
	  	} else if (typeof(cached) === 'string') {
	  		this._privateidentity = cached;
	  	} else {
	  		throw 'Invalid identity';
	  	}
	  }
	}

	getIdentity(): PrivateKey {
		let identity: PrivateKey;

		try {
			identity = PrivateKey.fromString(this.privateidentity);
		} catch (err) {
			// identity = PrivateKey.fromRandom();
			identity = null;
		}

		return identity
	}

	/*
	* Generates new credentials in the form field
	*/
	async setNewIdentityFormFields(inputId: string) {
		const identity = await this.generateNewIdentity();
		const identity_s = identity.toString();

		if (document.getElementById(inputId)) {
			document.getElementById(inputId).value = identity_s;
			// Set internal property privateidentity as well
			this.setIdentity(identity);
		} else {
			throw 'Error creating new identity: Input field: ' + inputId;
		}
	}

	/*
	* Get the list of buckets (helper function)
	*/
	async getBucketsList_helper(buckets: Buckets) {
	    const roots = await buckets.list();
	    return roots;
	}

	/*
	* Get content from bucket
	*/
	async getBucketsContent(main_bucketname: string) {
		let error = '';
		let result = {};
		const keyinfo = this.keyinfo;
		const identity = this.getIdentity();
		try {
			var bucketData = null;
			var buckets = null;
			var bucketKey = null;
			
			bucketData = await this.setupBucketEnvironment(keyinfo, identity, main_bucketname);
			buckets = bucketData.hasOwnProperty('buckets') ? bucketData.buckets : null;
			bucketKey = bucketData.hasOwnProperty('bucketKey') ? bucketData.bucketKey : null;
			
			if (buckets && bucketKey) {
				
				const files_links = await this.getLinks(buckets, bucketKey);
				result['data'] = files_links;
			}
		} catch (err) {
			result['error'] = 'WPTextilePlugin Error:' + JSON.stringify(err);
		}
		return result;
	}

	/*
	* Get list of buckets
	*/
	async getBucketsListContent(threadId: string) {
		let error = '';
		let result = {};
		const keyinfo = this.keyinfo;
		const identity = this.getIdentity();
		
		try {
			var buckets = await this.setupBucketEnvironmentWithThread(keyinfo, identity, threadId);
			if (buckets) {
				
				const data = await this.getBucketsList_helper(buckets);
				result['data'] = data;
			}
		} catch (err) {
			result['error'] = 'WPTextilePlugin Error:' + JSON.stringify(err);
		}
		return result;
	}

	/*
	* Get list of buckets
	*/
	async getThreadsListContent() {
		let error = '';
		let result = {};
		
		
		try {
			const keyinfo = this.keyinfo;
			const identity = this.getIdentity();

			const data = await this.getThreads(keyinfo, identity);
			const dataLength = data.length;
			const finalData = [];

			if (dataLength && dataLength > 0) {
				for (let k = 0; k < dataLength; k++) {
					finalData.push({
						// id: ThreadID.fromBytes(data[k]['id']['buf']).toString(),
						id: data[k]['id'],
						name: data[k]['name'] 
					});
				}
			}
			result['data'] = finalData;
		} catch (err) {
			result['error'] = 'WPTextilePlugin Error:' + err;
		}
		return result;
	}
	

	/**
	 * loginWithChallenge uses websocket to initiate and respond to
	 * a challenge for the user based on their keypair.
	 * 
	 * Read more about setting up user verification here:
	 * https://docs.textile.io/tutorials/hub/web-app/
	 */
	async loginWithChallenge(id: Identity, key: KeyInfo) {
       	
	    /** Get public key string */
	    const publicKey = id.public.toString();
		console.log('publicKey aa: ', publicKey);

		/**
	   * Init new Hub API Client with the user group API keys
	   */
	  const client = await Client.withKeyInfo(key)
	  let token = null;

	  /** 
	   * Request a token from the Hub based on the user public key */
	   try {

   		token = await client.getTokenChallenge(
		    publicKey,
		    /** The callback passes the challenge back to the client */
		    (challenge: Buffer) => {
		    return new Promise((resolve, reject) => {
		      // Send the challenge back to the client and 
		      // resolve(Buffer.from(sig))
		      // resolve()
		      alert('aa')
		      console.log('challenge', challenge);
		      //return challenge
		    })
		  })
   		console.log('tok')

	  console.log('tokens ', token);

	   } catch (err) {
	   		console.log('error ', err);
	   }
	  

	}


	async authorize_withUser(key: KeyInfo, identity: Identity, user: UserAuth) {
	  const client = await Client.withUserAuth(user)
	  await client.getToken(identity)
	  return client
	}

	async authorize_insecure(key: KeyInfo, identity: Identity) {
	  const client = await Client.withKeyInfo(key)
	  await client.getToken(identity)
	  return client
	}

	

	async getPublicKey(privateKey: string): Promise<PublicKey> {
	  /** Restore any cached user identity first */
	  const cached = privateKey;
	  if (cached !== null && cached !== '') {
	    /** Convert the cached identity string to a PrivateKey and return */
	    return PublicKey.fromString(cached)
	  }

	  return null;
	}

	async sign(identity: PrivateKey, msg: string) {
	   const challenge = Buffer.from(msg);
	   const credentials = identity.sign(challenge);
	   return credentials
	}

	async setupBucketEnvironment(
		key: KeyInfo, identity: Identity, bucketName: string
	) {
	  // Use the insecure key to set up the buckets client
	  // const buckets = await Buckets.withKeyInfo(key)
	  // await buckets.getToken(identity)

	  const user = await this.magicUserAuthWithBucketsToken(key, identity);
	  const buckets = await Buckets.withUserAuth(user);
	
	  // Authorize the user and your insecure keys with getToken
	  const result = await buckets.getOrCreate(bucketName)
	  if (!result.root) {
	    throw new Error('Failed to open bucket')
	  }

	  return {
	      buckets: buckets, 
	      bucketKey: result.root.key,
	  }
	}

	async setupBucketEnvironmentWithThread(
		key: KeyInfo, identity: Identity, threadId: string
	) {
	  // Use the insecure key to set up the buckets client
	  // const buckets = await Buckets.withKeyInfo(key)
	  // await buckets.getToken(identity)

	  const user = await this.magicUserAuthWithBucketsToken(key, identity);
	  let buckets = await Buckets.withUserAuth(user);
	  buckets.withThread(threadId);

	  return buckets;
	}

	async addIndexJSONFile(buckets: Buckets, bucketKey: string, identity: Identity) {
	  // Create a json model for the index
	  const index = {
	    author: identity.public.toString(),
	    date: (new Date()).getTime(),
	    paths: [],
	  }
	  // Store the index in the Bucket (or in the Thread later)
	  const buf = Buffer.from(JSON.stringify(index, null, 2))
	  const path = `index.json`
	  await buckets.pushPath(bucketKey, path, buf)
	}

	async addIndexHTMLFile(buckets: Buckets, bucketKey: string, html: string) {
	  // Store the index.html in the root of the bucket
	  const buf = Buffer.from(html)
	  const path = `index.html`
	  await buckets.pushPath(bucketKey, path, buf)
	}

	async addHTMLFile(
		buckets: Buckets,
		bucketKey: string,
		html: string,
		path: string
	) {
	  // Store the html file in the root of the bucket
	  const final_html = String.prototype.trim.call(html);
	  const buf = Buffer.from(final_html).buffer;
	  return await buckets.pushPath(bucketKey, path, buf);
	}

	async insertFile(
		buckets: Buckets, 
		bucketKey: string, 
		file: File, path: string
	): Promise<PushPathResult> {
	  return new Promise((resolve, reject) => {
	    const reader = new FileReader()
	    reader.onabort = () => reject('file reading was aborted')
	    reader.onerror = () => reject('file reading has failed')
	    reader.onload = () => {
	      const binaryStr = reader.result
	      // Finally, push the full file to the bucket
	      buckets.pushPath(bucketKey, path, binaryStr).then((raw) => {
	        resolve(raw)
	      }).catch((err) => {
	      	throw err;
	      })
	    }
	    reader.readAsArrayBuffer(file)
	  })
	}

	// This method requires that you run "getOrCreate" or have specified "withThread"
	async getLinks(buckets: Buckets, bucketKey: string) {
	  const links = await buckets.links(bucketKey);
	  return links;
	}

	async getThreads(
		//auth: UserAuth
		key: KeyInfo,
		identity: Identity
	) {
		// Generate a new UserAuth
		const user = await this.magicUserAuthWithUsersToken(key, identity);
		const api = Users.withUserAuth(user)
		const list = await api.listThreads()
		return list
	}

	async magicUserAuth(key: KeyInfo) {
		// Create an expiration and create a signature. 60s or less is recommended.
		const expiration = new Date(Date.now() + 60 * 1000);
		
		const userAuth: UserAuth = await createUserAuth(
			key.key, key.secret, expiration
		)
	
		return userAuth;

	}

	/*
	*	Get token for user if needed
	*/
	async magicUserAuthWithUsersToken(key: KeyInfo, identity: Identity) {
		if (!identity) {
			return this.magicUserAuth(key);
		}
		// Create an expiration and create a signature. 60s or less is recommended.
		const expiration = new Date(Date.now() + 60 * 1000);

		const api = await Users.withKeyInfo(key);
		const token = await api.getToken(identity);
		
		const userAuth: UserAuth = await createUserAuth(
			key.key, key.secret, expiration, token
		)
	
		return userAuth;

	}

	async magicUserAuthWithBucketsToken(key: KeyInfo, identity: Identity) {
		if (!identity) {
			return this.magicUserAuth(key);
		}

		// Create an expiration and create a signature. 60s or less is recommended.
		const expiration = new Date(Date.now() + 60 * 1000);

		const api = await Buckets.withKeyInfo(key);
		const token = await api.getToken(identity);
		
		const userAuth: UserAuth = await createUserAuth(
			key.key, key.secret, expiration, token
		)
	
		return userAuth;

	}


	async uploadFile(
		inputId: string,
		bucketNameForFileUpload: string
	) {
		const txtSelectedFile = document.getElementById(inputId);
		const selectedFile = txtSelectedFile.files[0];
		var bucketData = null;
		var buckets = null;
		var bucketKey = null;
		const keyinfo = this.keyinfo;
		const identity = this.getIdentity();
		let result = null;
		txtSelectedFile.disabled = true;

		const bucketPathArr = bucketNameForFileUpload.split('/');
		const bucketName = bucketPathArr[0];
		let proposedPath = bucketPathArr.slice(1, bucketPathArr.length).join('/');
		if (proposedPath && proposedPath[0] !== '/') {
			proposedPath = `/${proposedPath}`;
		}
		if (proposedPath && 
			proposedPath.length && 
			proposedPath[proposedPath.length - 1] !== '/') {
			proposedPath = `${proposedPath}/`;
		}

	
		bucketData = await this.setupBucketEnvironment(
			keyinfo, identity, bucketName
		);

		buckets = bucketData.hasOwnProperty('buckets') ? bucketData.buckets : null;
		bucketKey = bucketData.hasOwnProperty('bucketKey') ? bucketData.bucketKey : null;
		
		if (selectedFile) {
			const file_name = selectedFile.name;

		    try {
			    result = await this.insertFile(
			    	buckets,
			    	bucketKey,
			    	selectedFile,
			    	proposedPath + file_name
			    );
			    txtSelectedFile.disabled = false;
		    } catch (err) {
		    	txtSelectedFile.disabled = false;
		    	throw 'Error on file upload: ' + err;
		    }
		} else {
	    	txtSelectedFile.disabled = false;
			throw 'Please select a file!';
		}
		
		return result;
	}

	async uploadHTMLFile(
		bucketNameForFileUpload: string,
		html: string,
		path: string
	) {
		
		var bucketData = null;
		var buckets = null;
		var bucketKey = null;
		const keyinfo = this.keyinfo;
		const identity = this.getIdentity();
		let result = null;
		
		bucketData = await this.setupBucketEnvironment(
			keyinfo, identity, bucketNameForFileUpload
		);

		buckets = bucketData.hasOwnProperty('buckets') ? bucketData.buckets : null;
		bucketKey = bucketData.hasOwnProperty('bucketKey') ? bucketData.bucketKey : null;
		
    try {
	    result = await this.addHTMLFile(
	    	buckets, bucketKey, html, path
	    );
    } catch (err) {
    	console.error('Error on file upload: ' + err);
    }
		
		return result;
	}

	/*
	*	Remove a bucket and its content
	*/
	async remove(key: string, threadId: string): Promise<boolean> {
		let error = '';
		let result = {};
		const keyinfo = this.keyinfo;
		const identity = this.getIdentity();
		let success = false;

		try {
			var buckets = await this.setupBucketEnvironmentWithThread(keyinfo, identity, threadId);
			if (buckets) {
				await buckets.remove(key);
				success = true;
			}
		} catch (err) {
			throw 'WPTextilePlugin Error:' + JSON.stringify(err);
		}

		return success;
	}

	/*
	*	Remove a file
	*/
	async removeFile(key: string, fileName: string, threadId: string): Promise<boolean> {
		let error = '';
		let result = {};
		const keyinfo = this.keyinfo;
		const identity = this.getIdentity();
		let success = false;

		try {
			var buckets = await this.setupBucketEnvironmentWithThread(keyinfo, identity, threadId);
			if (buckets) {
				await buckets.removePath(key, fileName);
				success = true;
			}
		} catch (err) {
			throw 'WPTextilePlugin Error:' + JSON.stringify(err);
		}

		return success;
	}


	/*
	*	GET file from Server
	*  and upload it to IPFS bucket
	*/
	async uploadFileFromHTTPServer(
		file_url: string,
		bucket_name: string,
		path: string,
		filename: string
	) {
		var bucketData = null;
		var buckets = null;
		var bucketKey = null;
		const keyinfo = this.keyinfo;
		const identity = this.getIdentity();
		let result = null;

		bucketData = await this.setupBucketEnvironment(
			keyinfo, identity, bucket_name
		);

		buckets = bucketData.hasOwnProperty('buckets') ? bucketData.buckets : null;
		bucketKey = bucketData.hasOwnProperty('bucketKey') ? bucketData.bucketKey : null;
		
    try {
    	const fup_res = await this._fapi.get(file_url);
    	const fileBlob = await fup_res.blob();
    	var file = new File([fileBlob], filename);
    	
	    result = await this.insertFile(
	    	buckets,
	    	bucketKey,
	    	file,
	    	path + filename
	    );
	  } catch (err) {
    	throw 'Error on super file upload: ' + err;
    }
		
		return result;
	}

	/*
	* Get bucket's archives
	*/
	async getBucketArchives(main_bucketname: string) {
		let error = '';
		let result = {};
		const keyinfo = this.keyinfo;
		const identity = this.getIdentity();
		try {
			var bucketData = null;
			var buckets = null;
			var bucketKey = null;
			
			bucketData = await this.setupBucketEnvironment(keyinfo, identity, main_bucketname);
			buckets = bucketData.hasOwnProperty('buckets') ? bucketData.buckets : null;
			bucketKey = bucketData.hasOwnProperty('bucketKey') ? bucketData.bucketKey : null;
			
			if (buckets && bucketKey) {
				
				const { current, history } = await buckets.archives(bucketKey);
				result['data'] = { current: current, history: history };
			}
		} catch (err) {
			result['error'] = 'WPTextilePlugin Error:' + JSON.stringify(err);
		}
		return result;
	}

	/*
	* Archive bucket in Filecoin
	*/
	async filecoinArchive(main_bucketname: string) {
		let error = '';
		let result = {};
		const keyinfo = this.keyinfo;
		const identity = this.getIdentity();
		try {
			var bucketData = null;
			var buckets = null;
			var bucketKey = null;
			
			bucketData = await this.setupBucketEnvironment(keyinfo, identity, main_bucketname);
			buckets = bucketData.hasOwnProperty('buckets') ? bucketData.buckets : null;
			bucketKey = bucketData.hasOwnProperty('bucketKey') ? bucketData.bucketKey : null;
			
			if (buckets && bucketKey) {
				console.log('Archiving bucket ...');
				await buckets.archive(bucketKey);
				await this.logArchiveChanges(buckets, bucketKey);
			}
		} catch (err) {
			result['error'] = 'WPTextilePlugin Error:' + JSON.stringify(err);
		}
		return result;
	}

	/*
	* Watch archive bucket in Filecoin
	*/
	async logArchiveChanges(buckets: Buckets, key: string) {
	   const log = (reply?: {id?: string, msg: string}, err?: Error | undefined) => {
	       if (err || !reply) return console.log(err)
	       console.log('Archive status: ', reply.id, reply.msg)
	   }
	   console.log('Archive watch ...');
	   await buckets.archiveWatch(key, log);
	}


}