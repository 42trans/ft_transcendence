
/**
 * @file シーンのコンストラクタの実装
 * 
 * 設定ファイル（SceneConfig）の値を読み取って設定する、初期化時のメソッドを提供
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import ModelsLoader from './ModelsLoader';
import AnimationManager from './AnimationManager'

class SceneManager{
	/**
	* @param {THREE.WebGLRenderer} renderer - 計算された画像（3Dを2Dに投影）を画面に出力・描画するインスタンス。
	* @param {THREE.Scene} scene - 描画操作が行われる空間・ワールド。
	* @param {THREE.PerspectiveCamera} camera - カメラ。
	*/
	constructor(sceneConfig, renderer) {
		this.sceneConfig = sceneConfig;
		this.renderer = renderer;
		this.scene = new THREE.Scene();
		this.initializeScene();
	}

	clearScene() {
		while (this.scene.children.length > 0) {
			const object = this.scene.children.pop();
			if (object instanceof THREE.Mesh) {
				if (object.geometry) {
					object.geometry.dispose();
				}
				if (object.material) {
					if (Array.isArray(object.material)) {
						object.material.forEach(material => material.dispose());
					} else {
						object.material.dispose();
					}
				}
			}
			if (object.dispose) {
				object.dispose();
			}
			this.scene.remove(object);
		}
	}
	
	initializeScene() {
		this.clearScene();
		this.camera = this.setupCamera(this.sceneConfig.cameraConfig);
		this.controls = this.setupControls(this.camera, this.renderer, this.sceneConfig.controlsConfig);
		this.lights = [];
		this.setupLights(this.sceneConfig.lightsConfig);
		this.animMgr = new AnimationManager(this.controls);
		this.modelsLoader = new ModelsLoader(this.scene, this.sceneConfig, this.animMgr);
	}

	refreshScene() {
		this.clearScene();
		// カメラの位置や向きをリセット
		const { position, lookAt } = this.sceneConfig.cameraConfig;
		this.camera.position.copy(position);
		this.camera.lookAt(lookAt);

		// ライトをリフレッシュ
		this.lights.forEach(light => {
			this.scene.remove(light);
		});
		this.setupLights(this.sceneConfig.lightsConfig);

		// シーン内の特定のオブジェクトをリセットまたは更新
		this.modelsLoader.loadModels(); 
	}
	
	/**
	 * @returns {THREE.PerspectiveCamera}
	 */
	setupCamera(cameraConfig) {
		const config = cameraConfig;
		const cam = new THREE.PerspectiveCamera(
			config.fov,
			config.aspect,
			config.near,
			config.far
		);
		cam.position.copy(config.position);
		cam.lookAt(config.lookAt);
		return cam;
	}

	/**
	 * @param {THREE.Camera} camera
	 * @param {THREE.Renderer} renderer
	 * @returns {OrbitControls}
	 */
	setupControls(camera, renderer, controlsConfig) {
		const config = controlsConfig;
		const controls = new OrbitControls(camera, renderer.domElement);
		Object.assign(controls, config);
		return controls;
	}

	setupLights(lightsConfig) {
		lightsConfig.forEach((config) => {
			/** @type {THREE.Light} */
			let light = null;

			switch (config.type) {
				case 'AmbientLight':
					light = new THREE.AmbientLight(config.color, config.intensity);
					break;
				case 'DirectionalLight':
					light = new THREE.DirectionalLight(config.color, config.intensity);
					if (config.position) light.position.set(config.position.x, config.position.y, config.position.z);
					break;
				case 'HemisphereLight':
					/** @type {HemisphereLightConfig} */
					const hemiConfig = config;
					light = new THREE.HemisphereLight(hemiConfig.skyColor, hemiConfig.groundColor, hemiConfig.intensity);
					if (hemiConfig.position) light.position.set(hemiConfig.position.x, hemiConfig.position.y, hemiConfig.position.z);
					break;
				case 'PointLight':
					light = new THREE.PointLight(config.color, config.intensity, config.distance, config.decay);
					if (config.position) light.position.set(config.position.x, config.position.y, config.position.z);
					break;
				case 'SpotLight':
					/** @type {SpotLightConfig} */
					const spotConfig = config;
					light = new THREE.SpotLight(spotConfig.color, spotConfig.intensity, spotConfig.distance, spotConfig.angle, spotConfig.penumbra, spotConfig.decay);
					if (spotConfig.position) light.position.set(spotConfig.position.x, spotConfig.position.y, spotConfig.position.z);
					break;
			}

			if (light) {
				light.name = config.name;
				this.lights.push(light);
				this.scene.add(light);
			}
		});
	}
}

export default SceneManager;