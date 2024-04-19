
/**
 * @file シーンの初期値を指定するconfigファイル
 * @note
 * - 開発環境の画面右側のControlsGUIの設定は、ControlsGUI.tsで直接行う方針
 */

import * as THREE from 'three';
import BaseSceneConfig from './BaseSceneConfig.js'

class GameSceneConfig extends BaseSceneConfig{

	constructor() {
		super();
		
		/** @type {{ fov: number, aspect: number, near: number, far: number, position: THREE.Vector3, lookAt: THREE.Vector3 }} */
		this.cameraConfig = {
			...this.cameraConfig,
			fov: 50,
			far: 1500,
			position: new THREE.Vector3(0, 0, 520),
			up: new THREE.Vector3(0, 0, 1)  // Z軸が上方向（真下を向いてるので）
		};

		/** @type {{ enableDamping: boolean, dampingFactor: number, screenSpacePanning: boolean, maxPolarAngle: number, minDistance: number, maxDistance: number, rotateSpeed: number, zoomSpeed: number, autoRotate: boolean, autoRotateSpeed: number }} */
		this.controlsConfig = {
			...this.controlsConfig,

			minPolarAngle: 0,  // 0 = カメラが真上から見下ろす
			maxPolarAngle: Math.PI / 4, // Math.PI = カメラが真下を向く角度
			minAzimuthAngle: Math.PI / 1, // 方位角を90度（東）に固定
			maxAzimuthAngle: Math.PI / 1, // 最大角度
			
			minDistance: 300,
			maxDistance: 1000,
			// rotateSpeed: 1.0,
			zoomSpeed: 1.2,
			// autoRotate: false,
			enableZoom: true,
			enablePan: true,
			enableRotate: true,
			// autoRotateSpeed: 1.0,
			dampingFactor: 0.25,
		};

		/** @type {Array<{type: string, color: number, intensity: number, position?: THREE.Vector3, name: string}>} */
		this.lightsConfig = [
			{
				type: 'AmbientLight',
				color: 0x999999,
				intensity: 0.31,
				name: 'ambientLight',
			},
			{
				type: 'DirectionalLight',
				// color: 0xa41832,
				color: this.rgbToHex(20, 200, 5),
				intensity: 1,
				position: new THREE.Vector3(-50, 50, -50),
				name: 'directionalLight',
			},
			{
				type: 'HemisphereLight',
				skyColor: 0xffffff,
				groundColor: 0x444444,
				intensity: 0.1,
				position: new THREE.Vector3(50, 50, -50),
				name: 'hemiLight',
			},
			{
				type: 'PointLight',
				color: new THREE.Color(200, 100, 100),
				// color: 0x4b27ce,
				intensity: 0.5,
				distance: 300,
				decay: 1,
				position: new THREE.Vector3(0, 0, 50),
				name: 'pointLight',
			},
			{
				type: 'SpotLight',
				color: 0x1cb526,
				intensity: 1.5,
				distance: 200,
				angle: Math.PI / 200,
				penumbra: 0.1,
				decay: 0.5,
				position: new THREE.Vector3(10, 8, -9),
				name: 'spotLight',
			},
		];

		/** @type {Array<{path: string, initialPosition: THREE.Vector3, initialScale: THREE.Vector3, initialRotation: THREE.Euler, name: string, defaultAnimation: string, textures: {baseColor: string, normalMap: string, specularMap: string}}>} */
		this.modelsConfig = [
			// {
			// 	path: '../assets/vespa_mandarinia/scene.gltf',
			// 	initialPosition: new THREE.Vector3(40, 40, -50),
			// 	initialScale: new THREE.Vector3(10, 10, 10),
			// 	name: 'suzumebachi',
			// 	defaultAnimation: 'Hover',
			// },
		];

		/** @type {Array<{model: string, autoplay: boolean}>} */
		this.animationsConfig = [
			// {
			// 	model: 'suzumebachi',
			// 	// autoplay: true
			// },
		];

	}

	rgbToHex(r, g, b) {
		return (r << 16) + (g << 8) + b;
	}
}

export default GameSceneConfig;