
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
import { ControlsGUI } from '../ControlsGUI';
import { loadModel } from './suzumebachiModelLoader';
import AnimationManager from './AnimationManager'
//dev用GUI
import * as lil from 'lil-gui'; 

class App {
	private scene: THREE.Scene = new THREE.Scene();
	private sceneSetup: SceneSetup;
	private camera!: THREE.PerspectiveCamera;
	private renderer!: THREE.WebGLRenderer;
	private controls!: OrbitControls;
	private animationManager!: AnimationManager;
	private gui: lil.GUI = new lil.GUI();;

	constructor(){
		const sceneConfig = new SceneConfig();
		this.sceneSetup = new SceneSetup(this.scene, sceneConfig);
		this.initScene();
		this.setGUI();
		this.setModel();
	}
	
	private initScene(){
		this.camera = 	this.sceneSetup.setupCamera();
		this.renderer = this.sceneSetup.setupRenderer();
		this.controls = this.sceneSetup.setupControls(this.camera, this.renderer);
		this.sceneSetup.setupLights();
	}
	
	private setGUI() {
		const contorolsGUI = new ControlsGUI(this.scene, this.gui, this.camera);
		contorolsGUI.setupControlsGUI();
	}
	
	private setModel() {
		this.animationManager = new AnimationManager(this.renderer, this.scene, this.camera, this.controls);
		loadModel(this.scene, (model, loadedMixer) => {
			// TODO_ft: エラーハンドリング
			this.animationManager.setMixer(loadedMixer);
			this.animationManager.startAnimationLoop();
		});
	}

	public static main() {
		new App();
	}
}

export default App;