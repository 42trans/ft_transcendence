// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongEngineKey.js

const DEBUG_FLOW 		= 0;
const DEBUG_DETAIL		= 0;
const TEST_TRY1			= 0;

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
						if (DEBUG_FLOW) {	console.log('PongEngineKey: registerListenersKeyUpDown done');	};
		}
	}

	static unregistersListenersKyeUpDown() 
	{
		if (PongEngineKey.isListenerRegistered) {
			window.removeEventListener('keydown', PongEngineKey.handleKeyDown);
			window.removeEventListener('keyup', PongEngineKey.handleKeyUp);
			PongEngineKey.isListenerRegistered = false;
			PongEngineKey.keys = {/** empty */};
						if (DEBUG_FLOW) {	console.log('PongEngineKey: unregisterListenersKyeUpDown done');	}
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

export default PongEngineKey;