class AllScenesManager {
	constructor(AnimationMixersManager) {
		this.SceneUnits = [];
		this.AnimationMixersManager = AnimationMixersManager;
	}

	addSceneUnit(SceneUnit) {
		this.SceneUnits.push(SceneUnit);
	}

	// 全シーン、全アニメーションの更新
	// すべてのシーンの update メソッドを呼び出し、全体のアニメーション状態を更新。
	updateAllScenes() {
		this.SceneUnits.forEach(SceneUnit => {
			SceneUnit.update();
		});
		this.AnimationMixersManager.update(); 
	}

	// 全シーンをレンダリング
	renderAllScenes(renderer) {
		// renderer.clear();
		this.SceneUnits.forEach((manager, index) => {
			// if (index > 0) {
				renderer.clearDepth();
				renderer.render(manager.scene, manager.camera);
			}
		// }
	);
	}
}

export default AllScenesManager;