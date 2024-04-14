// docker/srcs/webpack2/ft_trans/src/js/App.js
/**
 * @file App.js
 * メインのクラス。全体（bundle.js）のフローを管理
 * シーンの初期化、アニメーションのループを呼び出す
 */
import * as THREE from 'three';
import BackgoundSceneConfig from './config/BackgoundSceneConfig';
import GameSceneConfig from './config/GameSceneConfig';
import SceneSetup from './SceneSetup';
import ControlsGUI from './ControlsGUI';
import ModelsLoader from './ModelsLoader';
import AnimationManager from './AnimationManager'
import { BaseGameState, MainMenuState} from './game/BaseGameState'
import RendererManager from './RendererManager'
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
	constructor() {
		// RendererManagerインスタンスはシングルトン
		this.renderer = RendererManager.getRenderer();
		this.setupBackgroundScene();
		this.setupGameScene();

		this.states = {
			mainMenu: new MainMenuState(this),
			// gameplay: new GameplayState(this),
			// 他の状態も同様に
		};

		this.currentState = this.states.mainMenu;
		this.currentState.enter();
		
		this.startAnimationLoop();
	}

	setupBackgroundScene() {
		const config = new BackgoundSceneConfig();
		this.backgroundScene = new THREE.Scene();
		const sceneSetup = new SceneSetup(this.backgroundScene, config);
		this.backgroundCamera = sceneSetup.setupCamera();
		this.backgroundControls = sceneSetup.setupControls(this.backgroundCamera, this.renderer);
		sceneSetup.setupLights();
		this.backgroundAnimMgr = new AnimationManager(
			this.renderer, 
			this.backgroundScene, 
			this.backgroundCamera, 
			this.backgroundControls
		);
		const modelsLoader = new ModelsLoader(this.backgroundScene, config, this.backgroundAnimMgr);
		modelsLoader.loadModels();
		// TODO_ft: dev用GUI
		this.gui = new lil.GUI();
		const contorolsGUI = new ControlsGUI(this.backgroundScene, this.gui, this.backgroundCamera);
		contorolsGUI.setupControlsGUI();
		// 

	}

	setupGameScene() {
		const config = new GameSceneConfig();
		this.gameScene = new THREE.Scene();
		const sceneSetup = new SceneSetup(this.gameScene, config);
		this.gameCamera = sceneSetup.setupCamera();
		this.gameControls = sceneSetup.setupControls(this.gameCamera, this.renderer);
		sceneSetup.setupLights();
		this.gameAnimMgr = new AnimationManager(
			this.renderer, 
			this.gameScene, 
			this.gameCamera, 
			this.gameControls
		);
		const modelsLoader = new ModelsLoader(this.gameScene, config, this.gameAnimMgr);
		modelsLoader.loadModels();
	}

	changeState(newState) {
		this.currentState.exit();
		this.currentState = this.states[newState];
		this.currentState.enter();
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
	 * - this.render(): シーンとカメラの現在の状態をもとに画面を描画。rendererは全scene共通(インスタンスは一つだけ)
	 * 
	 */
	startAnimationLoop() {
		const animate = () => {
			requestAnimationFrame(animate);
			this.currentState.update();
			this.currentState.render();
		};
		animate();
	}
	
	/** Public method*/
	static main() {
		new RenderManager();
	}
}

export default RenderManager;