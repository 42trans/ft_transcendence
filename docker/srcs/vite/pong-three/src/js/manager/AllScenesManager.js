import BackgroundSceneConfig from '../config/BackgroundSceneConfig';
import GameSceneConfig from '../config/GameSceneConfig';
import EffectsSceneConfig from '../config/EffectsSceneConfig';
import RendererManager from './RendererManager'
import SceneUnit from '../SceneUnit';
import * as THREE from 'three';

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
		// console.log('全てのOrbitControlsが無効化されました。');
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
	onWindowResize() {
		const newWidth = window.innerWidth;
		const newHeight = window.innerHeight;
		RendererManager.getRenderer().setSize(newWidth, newHeight);

		this.sceneUnits.forEach(sceneUnit => {
			if (sceneUnit.camera) {
				sceneUnit.camera.aspect = newWidth / newHeight;
				sceneUnit.camera.updateProjectionMatrix();
			}
			this.adjustCameraForScene(sceneUnit);
		});
		// console.log('リサイズ: 全シーンのサイズが更新されました。');
	}


	adjustCameraForScene(sceneUnit) {
		const table = sceneUnit.scene.getObjectByName('table');
		if (!table) {
			console.warn('Table object not found in the scene:', sceneUnit.type);
			return;
		}
	
		const tableSize = new THREE.Box3().setFromObject(table).getSize(new THREE.Vector3());
		const distance = this.calculateCameraDistance(tableSize, sceneUnit.camera);
		sceneUnit.camera.position.z = distance;
		sceneUnit.camera.updateProjectionMatrix();
	}
	
	calculateCameraDistance(tableSize, camera) {
		const fovRad = THREE.MathUtils.degToRad(camera.fov);  // 垂直fovをラジアンに変換
		const halfFovHeight = Math.tan(fovRad / 2);  // 垂直方向の半分の視野角のタンジェント
		const halfFovWidth = halfFovHeight * camera.aspect;  // 水平方向の半分の視野角のタンジェント
	
		// カメラからテーブルまでの必要距離を計算
		const distanceHeight = tableSize.y / (2 * halfFovHeight);  // 垂直方向
		const distanceWidth = tableSize.x / (2 * halfFovWidth);  // 水平方向
	
		return Math.max(distanceHeight, distanceWidth, camera.near + 1);
	}
	

}

export default AllScenesManager;



	// リサイズイベントハンドラ
	// onWindowResize() 
	// {
	// 	this.sceneUnits.forEach(sceneUnit => 
	// 	{
	// 		// const camera = sceneUnit.camera;
	// 		// camera.aspect = window.innerWidth / window.innerHeight;
	// 		// camera.updateProjectionMatrix();
	// 	});
	// 	RendererManager.getRenderer().setSize(window.innerWidth, window.innerHeight);
	// 	console.log('リサイズ: 全シーンのサイズが更新されました。');
	// }
