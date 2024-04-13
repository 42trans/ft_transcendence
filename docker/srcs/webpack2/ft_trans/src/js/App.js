// docker/srcs/webpack2/ft_trans/src/js/App.js
/**
 * @file App.js
 * メインのクラス。全体（bundle.js）のフローを管理
 * シーンの初期化、アニメーションのループを呼び出す
 */
import * as THREE from 'three';
import SceneConfig from '../SceneConfig';
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
class App {
	/**
	 * シーンを設定し、アニメーションループを非同期でスタートする。
	 * 終了までこのコンストラクタが継続。
	 * @description
	 * - 注: コンストラクタの呼び出しは即座に完了するが、ループはアプリケーションのライフサイクルに沿って継続
	 */
	constructor(){
		this.scene = new THREE.Scene();
		const sceneConfig = new SceneConfig();
		this.sceneSetup = new SceneSetup(this.scene, sceneConfig);
		// 以下、privateメソッド
		this.setupScene();
		
		// TODO_ft: dev用GUI
		this.gui = new lil.GUI();
		this.setupControlsGUI(); 
		// 

		this.loadModelsAndRunLoop(); 
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
	 * @description メソッドの実装は ControlsGUI.ts
	 */
	setupControlsGUI() {
		const contorolsGUI = new ControlsGUI(this.scene, this.gui, this.camera);
		contorolsGUI.setupControlsGUI();
	}
	/**　
	 * Private method
	 * @description メソッドの実装は AnimationManager.ts
	 */
	loadModelsAndRunLoop() {
		this.animMgr = new AnimationManager(this.renderer, this.scene, this.camera, this.controls);
		const sceneConfig = new SceneConfig();
		const modelsLoader = new ModelsLoader(this.scene, sceneConfig, this.animMgr);
		modelsLoader.loadModels();
		this.animMgr.startAnimationLoop();
	}
	/** Public method*/
	static main() {
		new App();
	}
}

export default App;