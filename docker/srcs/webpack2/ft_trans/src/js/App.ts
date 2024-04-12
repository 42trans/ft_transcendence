
/**
 * @file App.ts
 * 
 * メインのクラス。全体（bundle.js）のフローを管理
 * シーンの初期化、アニメーションのループを呼び出す
 */

import * as THREE from 'three';
import SceneConfig from '../SceneConfig';
import SceneSetup from './SceneSetup';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import ControlsGUI from '../ControlsGUI';
// import { loadModel } from './suzumebachiModelLoader';
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
 */
class App {
	private scene: THREE.Scene = new THREE.Scene();
	private sceneSetup: SceneSetup;
	private camera!: THREE.PerspectiveCamera;
	private renderer!: THREE.WebGLRenderer;
	private controls!: OrbitControls;
	private animMgr!: AnimationManager;
	private gui: lil.GUI = new lil.GUI();;
	/**
	 * シーンを設定し、アニメーションループを非同期でスタートする。
	 * 終了までこのコンストラクタが継続。
	 * @description
	 * - 注: コンストラクタの呼び出しは即座に完了するが、ループはアプリケーションのライフサイクルに沿って継続
	 */
	constructor(){
		const sceneConfig = new SceneConfig();
		this.sceneSetup = new SceneSetup(this.scene, sceneConfig);
		// 以下、privateメソッド
		this.setupScene();
		this.setupControlsGUI(); 
		this.startAnimationLoop(); 
	}
	/**　
	 * @description メソッドの実装は SceneSetup.ts
	 */
	private setupScene(){
		this.camera = 	this.sceneSetup.setupCamera();
		this.renderer = this.sceneSetup.setupRenderer();
		this.controls = this.sceneSetup.setupControls(this.camera, this.renderer);
		this.sceneSetup.setupLights();
	}
	/**　
	 * @description メソッドの実装は ControlsGUI.ts
	 */
	private setupControlsGUI() {
		const contorolsGUI = new ControlsGUI(this.scene, this.gui, this.camera);
		contorolsGUI.setupControlsGUI();
	}
	/**　
	 * @description メソッドの実装は AnimationManager.ts
	 */
	private startAnimationLoop() {
		this.animMgr = new AnimationManager(this.renderer, this.scene, this.camera, this.controls);
		const sceneConfig = new SceneConfig();
		const modelsLoader = new ModelsLoader(this.scene, sceneConfig, this.animMgr);
		modelsLoader.loadModels();
		this.animMgr.startAnimationLoop();
	}

	public static main() {
		new App();
	}
}

export default App;