
/**
 * @file シーンのコンストラクタの実装
 * 
 * 設定ファイル（SceneConfig）の値を読み取って設定する、初期化時のメソッドを提供
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GLTFModelsLoader from './GLTFModelsLoader';

class SceneUnit
{
	/**
	* @param {THREE.WebGLRenderer} renderer - 計算された画像（3Dを2Dに投影）を画面に出力・描画するインスタンス。
	* @param {THREE.Scene} scene - 描画操作が行われる空間・ワールド。
	*/
	constructor(
		sceneConfig, 
		renderer, 
		type, 
		animationMixersManager) 
	{
		this.sceneConfig = sceneConfig;
		this.renderer = renderer;
		this.scene = new THREE.Scene();
		this.animationMixersManager = animationMixersManager;
		this.modelsLoaded = false;
		this.initializeScene();
		// シーンのタイプ（'game', 'effects', 'background'）
		this.type = type; 
		
	}


	update() 
	{
		// 例えば、シーン内のすべての子オブジェクトに対して update メソッドがあれば呼び出す
		this.scene.traverse((object) => 
		{
			if (object.update instanceof Function) 
			{
				object.update();
			}
		});
		if (this.controls) 
		{
			this.controls.update();
		}
	}

	clearScene() 
	{
		while (this.scene.children.length > 0) 
		{
			const object = this.scene.children.pop();
			// console.log(`Removing object: `, object);

			// ミキサーの削除とアニメーションの停止
			const mixer = this.animationMixersManager.mixersMap.get(object.uuid);
			if (mixer) 
			{
				mixer.stopAllAction(); // すべてのアニメーションアクションを停止
				this.animationMixersManager.removeMixer(object); // ミキサーを削除
			}
			
			if (object instanceof THREE.Mesh) 
			{
				if (object.geometry) 
				{
					object.geometry.dispose();
				}
				if (object.material) 
				{
					if (Array.isArray(object.material)) 
					{
						object.material.forEach(material => material.dispose());
					} 
					else 
					{
						object.material.dispose();
					}
				}
			}
			if (object.dispose) 
			{
				object.dispose();
			}
			this.scene.remove(object);
		}
	}
	
	/**
	 * Private method
	 * インスタンスの作成を担当
	 */
	initializeScene() 
	{
		this.camera = this.setupCamera(this.sceneConfig.cameraConfig);
		this.controls = this.setupControls(this.camera, this.renderer, this.sceneConfig.controlsConfig);
		this.lights = [];
		this.gLTFModelsLoader = new GLTFModelsLoader(this.scene, this.sceneConfig, this.animationMixersManager);
	}

	/**
	 * Public mehod
	 * 既存インスタンスの値のみを変更
	 */
	refreshScene(newConfig) 
	{
		if (!newConfig || !newConfig.cameraConfig) 
		{
			console.error("Invalid or incomplete configuration provided:", newConfig);
			return;
		}

		// console.log("リフレッシュ時のconfigファイル:", newConfig);
		this.clearScene();
		this.sceneConfig = newConfig;
		this.camera = this.setupCamera(this.sceneConfig.cameraConfig);
		this.controls = this.setupControls(this.camera, this.renderer, this.sceneConfig.controlsConfig);
		this.lights.forEach(light => 
		{
			this.scene.remove(light);
		});
		this.lights = [];
		this.setupLights(this.sceneConfig.lightsConfig);
		this.gLTFModelsLoader.loadModels(this);

		if (this.controlsEnabled !== undefined) {
			this.controls.enabled = this.controlsEnabled;
		}
	}
	
	/**
	 * @returns {THREE.PerspectiveCamera}
	 */
	setupCamera(cameraConfig) 
	{
		if (!cameraConfig) 
		{
			console.error("No camera configuration provided");
			return;
		}
		const config = cameraConfig;
		const cam = new THREE.PerspectiveCamera(
			config.fov,
			config.aspect,
			config.near,
			config.far
		);
		cam.position.copy(config.position);
		cam.lookAt(config.lookAt);
		cam.up.copy(config.up)
		return cam;
	}

	/**
	 * @param {THREE.Camera} camera
	 * @param {THREE.Renderer} renderer
	 * @returns {OrbitControls}
	 */
	setupControls(camera, renderer, controlsConfig) 
	{
		if (!controlsConfig) 
		{
			console.error("No controlsConfig provided");
			return;
		}
		const config = controlsConfig;
		const controls = new OrbitControls(camera, renderer.domElement);
		Object.assign(controls, config);
		return controls;
	}

	setupLights(lightsConfig) 
	{
		if (!lightsConfig || lightsConfig.length === 0) 
		{
			// console.log("No lights configuration provided.");
			return;
		}
		lightsConfig.forEach((config) => 
		{
			/** @type {THREE.Light} */
			let light = null;

			switch (config.type) 
			{
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

			if (light) 
			{
				light.name = config.name;
				this.lights.push(light);
				this.scene.add(light);
			}
		});
	}
}

export default SceneUnit;