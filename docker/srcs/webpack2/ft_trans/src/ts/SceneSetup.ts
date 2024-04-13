
/**
 * @file シーンのコンストラクタの実装
 * 
 * 設定ファイル（SceneConfig）の値を読み取って設定する、初期化時のメソッドを提供
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import SceneConfig from '../SceneConfig';

import { HemisphereLightConfig, SpotLightConfig } from '../js/type';

class SceneSetup{
	scene: THREE.Scene;
	sceneConfig: SceneConfig;

	constructor(scene: THREE.Scene, sceneConfig: SceneConfig) {
		this.scene = scene;
		this.sceneConfig = sceneConfig;
	}

	setupCamera(): THREE.PerspectiveCamera {
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

	setupRenderer(): THREE.WebGLRenderer {
		const config = this.sceneConfig.rendererConfig;
		const rend = new THREE.WebGLRenderer({ antialias: config.antialias });
		rend.setSize(window.innerWidth, window.innerHeight);
		rend.setPixelRatio(config.pixelRatio);
		
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

	setupControls(camera: THREE.Camera, renderer: THREE.Renderer): OrbitControls {
		const config = this.sceneConfig.controlsConfig;
		const controls = new OrbitControls(camera, renderer.domElement);
		Object.assign(controls, config);
		return controls;
	}

	setupLights() {
		this.sceneConfig.lightsConfig.forEach((config) => {
			let light: THREE.Light | null = null;

			switch (config.type) {
				case 'AmbientLight':
					light = new THREE.AmbientLight(config.color, config.intensity);
					break;
				case 'DirectionalLight':
					light = new THREE.DirectionalLight(config.color, config.intensity);
					if (config.position) light.position.set(config.position.x, config.position.y, config.position.z);
					break;
				case 'HemisphereLight':
					const hemiConfig = config as HemisphereLightConfig;
					light = new THREE.HemisphereLight(hemiConfig.skyColor, hemiConfig.groundColor, hemiConfig.intensity);
					if (hemiConfig.position) light.position.set(hemiConfig.position.x, hemiConfig.position.y, hemiConfig.position.z);
					break;
				case 'PointLight':
					light = new THREE.PointLight(config.color, config.intensity, config.distance, config.decay);
					if (config.position) light.position.set(config.position.x, config.position.y, config.position.z);
					break;
				case 'SpotLight':
					const spotConfig = config as SpotLightConfig;
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