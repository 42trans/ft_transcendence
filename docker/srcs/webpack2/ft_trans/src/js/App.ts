
/**
 * @file App.ts
 * 
 * メインのクラス
 * シーンの初期化、アニメーションのループを呼び出す
 */

import * as THREE from 'three';
import SceneConfig from '../SceneConfig';
import SceneSetup from './SceneSetup';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ControlsGUI } from '../ControlsGUI';
import { loadModel } from './suzumebachiModelLoader';
import { setMixer, animate } from './animation';
//dev用GUI
import * as lil from 'lil-gui'; 

class App {
	private scene: THREE.Scene = new THREE.Scene();
	private sceneSetup: SceneSetup;
	private camera!: THREE.PerspectiveCamera;
	private renderer!: THREE.WebGLRenderer;
	private controls!: OrbitControls;
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
		loadModel(this.scene, (model, loadedMixer) => {
			// TODO_ft: エラーハンドリング
			setMixer(loadedMixer);
			animate(this.renderer, this.scene, this.camera, this.controls);
		});
	}

	public static main() {
		new App();
	}
}

export default App;