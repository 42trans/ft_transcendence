import BackgroundSceneConfig from '../config/BackgroundSceneConfig';
import GameSceneConfig from '../config/GameSceneConfig';
import EffectsSceneConfig from '../config/EffectsSceneConfig';
import RendererManager from './RendererManager'
import SceneUnit from '../SceneUnit';

/**
 * - シングルトン
 *   - コンストラクタが呼び出されたときに既にインスタンスが存在するかどうかをチェック
 *   - インスタンスが存在する場合は新しいインスタンスを作成せずに既存のインスタンスを返す
 *   - getInstance 静的メソッド: インスタンスを取得するための唯一の手段として提供
 */
class AllScenesManager 
{
	static instance = null;
	constructor(animationMixersManager) 
	{
		if (!AllScenesManager.instance) 
		{
			this.sceneUnits = [];
			this.animationMixersManager = animationMixersManager;
			window.addEventListener('resize', this.onWindowResize.bind(this), false);
			AllScenesManager.instance = this;
		}
		return AllScenesManager.instance;
	}
	
	static getInstance(animationMixersManager) 
	{
		if (!AllScenesManager.instance) 
		{
			AllScenesManager.instance = new AllScenesManager(animationMixersManager)
		}
		return AllScenesManager.instance;
	}

	disableAllControls() {
		this.sceneUnits.forEach(sceneUnit => {
			if (sceneUnit.controls) {
				sceneUnit.controls.dispose(); // イベントリスナーを削除
				sceneUnit.controls = null; // 参照を削除
			}
		});
		console.log('全てのOrbitControlsが無効化されました。');
	}

	setupScenes() 
	{
		this.backgroundScene = new SceneUnit(new BackgroundSceneConfig(), RendererManager.getRenderer(), 'background', this.animationMixersManager);
		this.addSceneUnit(this.backgroundScene);
		this.gameScene = new SceneUnit(new GameSceneConfig(), RendererManager.getRenderer(), 'game', this.animationMixersManager);
		this.addSceneUnit(this.gameScene);
		this.effectsScene = new SceneUnit(new EffectsSceneConfig(), RendererManager.getRenderer(), 'effects', this.animationMixersManager);
		this.addSceneUnit(this.effectsScene);
	}

	addSceneUnit(sceneUnit) 
	{
		this.sceneUnits.push(sceneUnit);
	}

	// 全シーン、全アニメーションの更新
	// すべてのシーンの update メソッドを呼び出し、全体のアニメーション状態を更新。
	updateAllScenes() 
	{
		this.sceneUnits.forEach(sceneUnit => 
		{
			sceneUnit.update();
		});
	}

	// 全シーンをレンダリング
	renderAllScenes(renderer) 
	{
		this.sceneUnits.forEach(manager => 
		{
			renderer.clearDepth();
			renderer.render(manager.scene, manager.camera);
		});
	}
	
	// リサイズイベントハンドラ
	onWindowResize() 
	{
		this.sceneUnits.forEach(sceneUnit => 
		{
			const camera = sceneUnit.camera;
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		});
		RendererManager.getRenderer().setSize(window.innerWidth, window.innerHeight);
		console.log('リサイズ: 全シーンのサイズが更新されました。');
	}
}

export default AllScenesManager;