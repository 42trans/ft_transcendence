class PongEngineKey {
	static keys = {};

	static listenForEvents(keys) {
		window.addEventListener('keydown', (event) => {
			const key = event.key.toUpperCase();
			PongEngineKey.keys[key] = true;
		});

		window.addEventListener('keyup', (event) => {
			const key = event.key.toUpperCase();
			PongEngineKey.keys[key] = false;
		});
	}

	static isDown(key) {
		return PongEngineKey.keys[key.toUpperCase()];
	}
}

// キーイベントのリスニングを開始
PongEngineKey.listenForEvents([]);

export default PongEngineKey;