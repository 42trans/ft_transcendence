class SceneAggregate {
	constructor(globalAnimationMixer) {
		this.sceneManagers = [];
		this.globalAnimationMixer = globalAnimationMixer;
	}

	addSceneManager(sceneManager) {
		this.sceneManagers.push(sceneManager);
	}

	// 全シーン、全アニメーションの更新
	// すべてのシーンの update メソッドを呼び出し、全体のアニメーション状態を更新。
	updateAllScenes() {
		this.sceneManagers.forEach(sceneManager => {
			sceneManager.update();
		});
		this.globalAnimationMixer.update(); 
	}

	// 全シーンをレンダリング
	renderAllScenes(renderer) {
		renderer.clear();
		this.sceneManagers.forEach((manager, index) => {
			if (index > 0) {
				renderer.render(manager.scene, manager.camera);
			}
		});
	}
}

export default SceneAggregate;