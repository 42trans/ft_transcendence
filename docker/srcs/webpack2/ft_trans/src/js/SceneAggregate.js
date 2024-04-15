class SceneAggregate {
	constructor() {
		this.sceneManagers = [];
	}

	addSceneManager(sceneManager) {
		this.sceneManagers.push(sceneManager);
	}

	updateAllScenes() {
		this.sceneManagers.forEach(manager => manager.update());
	}

	renderAllScenes(renderer) {
		this.sceneManagers.forEach(manager => {
			renderer.render(manager.scene, manager.camera);
		});
	}
}

export default SceneAggregate;