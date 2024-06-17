// docker/srcs/vite/pong-three/src/js/pongEngine/PongEngineKey.js
class PongEngineKey 
{
	static keys = {/** empty */};
	static isListenerRegistered = false;

	static registerListenersKeyUpDown() 
	{
		if (!PongEngineKey.isListenerRegistered) {
			window.addEventListener('keydown', PongEngineKey.handleKeyDown);
			window.addEventListener('keyup', PongEngineKey.handleKeyUp);
			PongEngineKey.isListenerRegistered = true;
		}
	}

	static unregisterListenersKeyUpDown() 
	{
		if (PongEngineKey.isListenerRegistered) {
			window.removeEventListener('keydown', PongEngineKey.handleKeyDown);
			window.removeEventListener('keyup', PongEngineKey.handleKeyUp);
			PongEngineKey.isListenerRegistered = false;
			PongEngineKey.keys = {/** empty */};
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

// 重複するため、init,destroyで明示的に呼び出すよう修正
// PongEngineKey.registerListenersKeyUpDown();

export default PongEngineKey;