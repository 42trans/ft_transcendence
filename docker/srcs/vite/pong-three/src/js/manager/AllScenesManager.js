import BackgroundSceneConfig from '../config/BackgroundSceneConfig';
import GameSceneConfig from '../config/GameSceneConfig';
import EffectsSceneConfig from '../config/EffectsSceneConfig';
import RendererManager from './RendererManager'
import SceneUnit from '../SceneUnit';
import * as THREE from 'three';
import { handleCatchError } from '../../index.js';

const DEBUG_FLOW 		= 0;
const DEBUG_DETAIL		= 0;
const TEST_TRY1 		= 0;
const TEST_TRY2 		= 0;
const TEST_TRY3 		= 0;
const TEST_TRY4			= 0;
const TEST_TRY5			= 0;
const TEST_TRY6			= 0;
const TEST_TRY7			= 0;
const TEST_TRY8			= 0;
const TEST_TRY9			= 0;

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

	/** コントロールの無効化 */
	// disableAllControls() 
	// {
	// 	this.sceneUnits.forEach(sceneUnit => {
	// 		if (sceneUnit.controls) {
	// 			sceneUnit.controls.dispose();
	// 			sceneUnit.controls = null;
	// 		}
	// 	});
	// 				if (DEBUG_FLOW) {	 console.log('disableAllControls(): done');	}
	// 				if (TEST_TRY1) {	throw new Error('TEST_TRY1');	}
	// }

	async setupScenes() 
	{
		try {
			this.backgroundScene = new SceneUnit(new BackgroundSceneConfig(), RendererManager.getRenderer(), 'background', this.animationMixersManager);
			this.addSceneUnit(this.backgroundScene);
			this.gameScene = new SceneUnit(new GameSceneConfig(), RendererManager.getRenderer(), 'game', this.animationMixersManager);
			this.addSceneUnit(this.gameScene);
			this.effectsScene = new SceneUnit(new EffectsSceneConfig(), RendererManager.getRenderer(), 'effects', this.animationMixersManager);
			this.addSceneUnit(this.effectsScene);
						if (DEBUG_FLOW) {	 console.log('setupScenes()');	}
						if (TEST_TRY2) {	throw new Error('TEST_TRY2');	}
			return Promise.resolve();
		} catch (error) {
			console.error('hth: setupScenes() failed', error);
			// エラーを上位に伝播させ、pongAppでcatchしてSPAリセット
			handleCatchError(error);
		}
	}

	/** シーンユニットを追加 */
	addSceneUnit(sceneUnit) 
	{
					if (TEST_TRY3) {	throw new Error('TEST_TRY3');	}
		this.sceneUnits.push(sceneUnit);
	}

	// 全シーン、全アニメーションの更新
	// すべてのシーンの update メソッドを呼び出し、全体のアニメーション状態を更新。
	updateAllScenes() 
	{
		this.sceneUnits.forEach(sceneUnit => 
		{
					if (TEST_TRY4) {	throw new Error('TEST_TRY4');	}
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
					if (TEST_TRY5) {	throw new Error('TEST_TRY5');	}
		});
	}

	getGameSceneCamera() {
		return this.gameScene.camera;
	}

	/** 描画サイズをウインドウに合わせる */
	handleResize() 
	{
		try {
						if (TEST_TRY6) {	throw new Error('TEST_TRY6');	}
			const newWidth = window.innerWidth;
			const newHeight = window.innerHeight;
			RendererManager.getRenderer().setSize(newWidth, newHeight);
			this.sceneUnits.forEach(sceneUnit => {
				if (sceneUnit.camera) {
					sceneUnit.camera.aspect = newWidth / newHeight;
					sceneUnit.camera.updateProjectionMatrix();
					// gameSheneだけ特別な処理
					this._adjustCameraForGameScene(sceneUnit);
				}
			});
		} catch (error) {
			console.error('hth: handleResize() failed', error);
			handleCatchError(error);
		}
	}

	/** gameScene は、テーブルのサイズを基準に調整する */
	_adjustCameraForGameScene(sceneUnit) 
	{
		try {
			if (sceneUnit !== this.gameScene) {
				return;
			}
			const table = sceneUnit.scene.getObjectByName('table');
			if (!table){
				if (DEBUG_DETAIL){
					// game scene登録前はtableが存在しない
					console.log('hth: table is not found');
				}
				return;
			}
			const tableSize = new THREE.Box3().setFromObject(table).getSize(new THREE.Vector3());
			const distance = this._calculateCameraDistance(tableSize, sceneUnit.camera);
			sceneUnit.camera.position.z = distance;
			sceneUnit.camera.updateProjectionMatrix();
						if (TEST_TRY7) {	throw new Error('TEST_TRY7');	}
		} catch (error) {
			console.error('hth: _adjustCameraForGameScene() failed', error);
			handleCatchError(error);
		}
	}
	
	_calculateCameraDistance(tableSize, camera) 
	{
		// 垂直fovをラジアンに変換
		const fovRad = THREE.MathUtils.degToRad(camera.fov);
		// 垂直方向の半分の視野角のタンジェント
		const halfFovHeight = Math.tan(fovRad / 2);
		// 水平方向の半分の視野角のタンジェント
		const halfFovWidth = halfFovHeight * camera.aspect;
		// カメラからテーブルまでの必要距離を計算
		const distanceHeight = tableSize.y / (2 * halfFovHeight);
		const distanceWidth = tableSize.x / (2 * halfFovWidth);
					if (TEST_TRY8) {	throw new Error('TEST_TRY8');	}
		return Math.max(distanceHeight, distanceWidth, camera.near + 1);
	}
	
	dispose() 
	{
		try {
			// 各 SceneUnit の dispose メソッドを呼び出す
			this.sceneUnits.forEach(sceneUnit => {
				// sceneUnit が存在し、dispose メソッドを持っているか確認
				if (sceneUnit && sceneUnit.dispose) { 
					sceneUnit.dispose();
				}
			});
			this.sceneUnits = [];
					if (DEBUG_FLOW) {	 console.log('AllSceneManager.dispose(): done', this.sceneUnits);	}
					if (TEST_TRY9) {	throw new Error('TEST_TRY9');	}
		} catch (error) {
			console.error('hth: dispose() failed', error);
			handleCatchError(error);
		}
	}

}

export default AllScenesManager;


