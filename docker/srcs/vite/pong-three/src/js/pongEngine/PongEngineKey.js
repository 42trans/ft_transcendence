class PongEngineKey 
{
	static keys = {/** empty */};
	static isListenerRegistered = false;

	// static listenForEvents() 
	// {
	// 	window.addEventListener('keydown', (event) => 
	// 	{
	// 		const key = event.key.toUpperCase();
	// 		PongEngineKey.keys[key] = true;
	// 	});

	// 	window.addEventListener('keyup', (event) => 
	// 	{
	// 		const key = event.key.toUpperCase();
	// 		PongEngineKey.keys[key] = false;
	// 	});
	// }

	static listenForEvents() 
	{
		if (!PongEngineKey.isListenerRegistered) {
			window.addEventListener('keydown', PongEngineKey.handleKeyDown);
			window.addEventListener('keyup', PongEngineKey.handleKeyUp);
			PongEngineKey.isListenerRegistered = true;
		}
	}

	static removeListeners() 
	{
		if (PongEngineKey.isListenerRegistered) {
			window.removeEventListener('keydown', PongEngineKey.handleKeyDown);
			window.removeEventListener('keyup', PongEngineKey.handleKeyUp);
			PongEngineKey.isListenerRegistered = false;
		}
	}
	
	static handleKeyDown(event) 
	{
		const key = event.key.toUpperCase();
		PongEngineKey.keys[key] = true;
	}

	static handleKeyUp(event) 
	{
		const key = event.key.toUpperCase();
		PongEngineKey.keys[key] = false;
	}
	
	static isDown(key) 
	{
		return PongEngineKey.keys[key.toUpperCase()];
	}
}

// モジュールインポート時にキーイベントのリスニングを開始
PongEngineKey.listenForEvents([/** empty */]);

export default PongEngineKey;