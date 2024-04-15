/**
 * - シングルトン
 *   - コンストラクタが呼び出されたときに既にインスタンスが存在するかどうかをチェック
 *   - インスタンスが存在する場合は新しいインスタンスを作成せずに既存のインスタンスを返す
 *   - getInstance 静的メソッド: インスタンスを取得するための唯一の手段として提供
 */
class AllScenesManager {
	static instance = null;
	constructor(animationMixersManager) {
		if (!AllScenesManager.instance) {
			this.sceneUnits = [];
			this.animationMixersManager = animationMixersManager;
			AllScenesManager.instance = this;
		}
		return AllScenesManager.instance;
	}
	
	static getInstance(animationMixersManager) {
		if (!AllScenesManager.instance) {
			AllScenesManager.instance = new AllScenesManager(animationMixersManager)
		}
		return AllScenesManager.instance;
	}

	addSceneUnit(sceneUnit) {
		this.sceneUnits.push(sceneUnit);
	}

	// 全シーン、全アニメーションの更新
	// すべてのシーンの update メソッドを呼び出し、全体のアニメーション状態を更新。
	updateAllScenes() {
		this.sceneUnits.forEach(sceneUnit => {
			sceneUnit.update();
		});
		this.animationMixersManager.update(); 
	}

	// 全シーンをレンダリング
	renderAllScenes(renderer) {
		this.sceneUnits.forEach(manager => {
			renderer.clearDepth();
			renderer.render(manager.scene, manager.camera);
		});
	}
}

export default AllScenesManager;