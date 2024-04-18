class Key {
	static keys = {};

	static listenForEvents(keys) {
		window.addEventListener('keydown', (event) => {
			const key = event.key.toUpperCase();
			Key.keys[key] = true;
		});

		window.addEventListener('keyup', (event) => {
			const key = event.key.toUpperCase();
			Key.keys[key] = false;
		});

		// Initialize all keys to false
		keys.forEach(key => {
			Key.keys[key.toUpperCase()] = false;
		});
	}

	static isDown(key) {
		return Key.keys[key.toUpperCase()];
	}
}

// Start listening for key events
Key.listenForEvents(['A', 'D']);

export default Key;