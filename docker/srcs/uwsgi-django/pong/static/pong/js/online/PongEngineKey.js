// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongEngineKey.js
class PongEngineKey 
{
	static keys = {/** empty */};
	static isListenerRegistered = false;

	static listenForEvents() 
	{
		window.addEventListener('keydown', (event) => 
		{
			const key = event.key.toUpperCase();
			PongEngineKey.keys[key] = true;
			// console.log(`Key down: ${key}`);
		});

		window.addEventListener('keyup', (event) => 
		{
			const key = event.key.toUpperCase();
			PongEngineKey.keys[key] = false;
			// console.log(`Key down: ${key}`);
		});
	}

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
	static isDown(key) 
	{
		return PongEngineKey.keys[key.toUpperCase()];
	}
}

export default PongEngineKey;