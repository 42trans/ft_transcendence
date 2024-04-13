// docker/srcs/webpack2/ft_trans/src/js/App.js
/**
 * @file App.js
 * メインのクラス。全体（bundle.js）のフローを管理
 * シーンの初期化、アニメーションのループを呼び出す
 */
import * as THREE from 'three';
import BackgoundSceneConfig from './config/BackgoundSceneConfig';
import SceneSetup from './SceneSetup';
import ControlsGUI from './ControlsGUI';
import ModelsLoader from './ModelsLoader';
import AnimationManager from './AnimationManager'
//dev用GUI
import * as lil from 'lil-gui'; 
/**
 * @param scene - 描画操作が行われる空間・ワールド。THREE.Sceneのインスタンス
 * @param sceneSetup - シーンを設定するメソッドを持つクラス。setupScene()で使用
 * @param camera - カメラ。THREE.PerspectiveCameraのインスタンス
 * @param renderer - 計算された画像（3Dを2Dに投影）を画面に出力・描画する。THREE.WebGLRendererのインスタンス
 * @param controls - カメラの操作。OrbitControlsのインスタンス。
 * @param {lil.GU} - 開発時コントローラーGUI
 */
class RenderManager {
	/**
	 * シーンを設定し、アニメーションレンダリングループを非同期でスタートする。
	 * 終了までこのコンストラクタが継続。
	 * @description
	 * - 注: コンストラクタの呼び出しは即座に完了するが、ループはアプリケーションのライフサイクルに沿って継続
	 */
	constructor(){
		this.backgroundSceneConfig = new BackgoundSceneConfig();
		this.backgroundAnimMgr = new AnimationManager();
		this.buildScene(
			this.backgroundSceneConfig,
			this.backgroundAnimMgr
		);
		
		// this.gameSceneConfig = new GameSceneConfig();
		// this.gameAnimMgr = new AnimationManager();
		// this.buildScene(
		// 	this.gameSceneConfig, 
		// 	this.backgroundAnimMgr
		// );
	}

	buildScene(sceneConfig, animMgr) {
		this.scene = new THREE.Scene();
		this.sceneSetup = new SceneSetup(this.scene, sceneConfig);
		
		this.setupScene();

		const modelsLoader = new ModelsLoader(this.scene, sceneConfig, animMgr);
		modelsLoader.loadModels();
		
		// TODO_ft: dev用GUI
		this.gui = new lil.GUI();
		const contorolsGUI = new ControlsGUI(this.scene, this.gui, this.camera);
		contorolsGUI.setupControlsGUI();
		// 
		this.startAnimationLoop();
	}
	/**　
	 * Private method
	 * @description メソッドの実装は SceneSetup.ts
	 */
	setupScene(){
		/** @type {THREE.PerspectiveCamera} */
		this.camera = 	this.sceneSetup.setupCamera();
		/** @type {THREE.WebGLRenderer} */
		this.renderer = this.sceneSetup.setupRenderer();
		/** @type {OrbitControls} */
		this.controls = this.sceneSetup.setupControls(this.camera, this.renderer);
		this.sceneSetup.setupLights();
	}

	/**
	 * Private method
	 * ブラウザのフレーム更新タイミングに合わせて自身を再帰的に呼び出し、連続したアニメーションフレームを生成
	 * @description
	 * ## 動作
	 * - ブラウザのフレーム更新タイミングに合わせて自身を再帰的に呼び出す
	 *   - 次の画面描画タイミングで呼び出される
	 *   - ループは非同期, ブロッキングしない
	 * - 連続したアニメーションフレームを生成
	 * 
	 * ## 関数
	 * - requestAnimationFrame(animate): ブラウザに animate 関数を次の描画フレームで実行するように要求
	 *   - 非同期関数であり、実行がスケジュールされた後、即座に制御が戻る。ブロックされず次の行に進む。
	 *   - animate(): 状態の更新 (`this.update()`) とシーンの描画 (`this.render()`) を行った後、自身を再帰的にスケジュールする。
	 *   - キューに格納
	 * - this.update(): アニメーションミキサーの進行、カメラコントロールの更新（例えば、ユーザーのインタラクションに応じた視点変更）など
	 * - this.render(): シーンとカメラの現在の状態をもとに画面を描画
	 * 
	 */
	startAnimationLoop() {
		const animate = () => {
			// 次のフレームでanimateを再び呼び出す
			// 非同期。ブロックされない。requestAnimationFrame()の終了を待たずに進む
			requestAnimationFrame(animate);
			// 状態を更新
			this.backgroundAnimMgr.update();
			// this.gameAnimMgr.update();

			// シーンを描画
			this.renderer.clear();
			this.renderer.render(this.scene, this.camera);
			// this.renderer.clearDepth();
			// this.renderer.render(this.gameScene, this.gameCamera);
		}
		// 初回の呼び出し
		animate();
	}
	/** Public method*/
	static main() {
		new RenderManager();
	}
}

export default RenderManager;