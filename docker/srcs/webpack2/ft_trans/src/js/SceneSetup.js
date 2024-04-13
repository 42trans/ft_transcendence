
/**
 * @file シーンのコンストラクタの実装
 * 
 * 設定ファイル（SceneConfig）の値を読み取って設定する、初期化時のメソッドを提供
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import BaseConfig from './config/BaseConfig'; 

class SceneSetup{
	/**
	 * @param {THREE.Scene} scene
	 * @param {BaseConfig} sceneConfig
	 */
	constructor(scene, sceneConfig) {
		this.scene = scene;
		this.sceneConfig = sceneConfig;
	}
	/**
	 * @returns {THREE.PerspectiveCamera}
	 */
	setupCamera() {
		const config = this.sceneConfig.cameraConfig;
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
	 * @returns {THREE.WebGLRenderer}
	 */
	setupRenderer() {
		const config = this.sceneConfig.rendererConfig;
		const rendererOptions = {
			antialias: config.antialias,
			pixelRatio: config.pixelRatio,
			alpha: config.alpha,
		};
		const rend = new THREE.WebGLRenderer(rendererOptions);
		rend.setSize(window.innerWidth, window.innerHeight);
		
		// 特定のdivにレンダラーを追加 （index.htmlで設定したthreejs-canvas-container）
		const container = document.getElementById('threejs-canvas-container');
		if (container) {
			container.appendChild(rend.domElement);
		} else {
			console.error('three.jsのキャンバスを配置するためのコンテナが見つかりません。');
		}
		// もしもdivでなくbodyに埋め込む場合
		// document.body.appendChild(rend.domElement);
		return rend;
	}

	/**
	 * @param {THREE.Camera} camera
	 * @param {THREE.Renderer} renderer
	 * @returns {OrbitControls}
	 */
	setupControls(camera, renderer) {
		const config = this.sceneConfig.controlsConfig;
		const controls = new OrbitControls(camera, renderer.domElement);
		Object.assign(controls, config);
		return controls;
	}

	setupLights() {
		this.sceneConfig.lightsConfig.forEach((config) => {
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
				this.scene.add(light);
			}
		});
	}
}

export default SceneSetup;