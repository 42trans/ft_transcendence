// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongEngineKey.js
class PongEngineKey 
{
	static keys = {/** empty */};

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

	static isDown(key) 
	{
		return PongEngineKey.keys[key.toUpperCase()];
	}
}

export default PongEngineKey;