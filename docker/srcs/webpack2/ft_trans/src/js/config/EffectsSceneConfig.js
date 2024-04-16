
/**
 * @file シーンの初期値を指定するconfigファイル
 * @note
 * - 開発環境の画面右側のControlsGUIの設定は、ControlsGUI.tsで直接行う方針
 */

import * as THREE from 'three';
import BaseSceneConfig from './BaseSceneConfig.js'

class EffectsSceneConfig extends BaseSceneConfig{

	constructor() {
		super();
		
		/** @type {{ fov: number, aspect: number, near: number, far: number, position: THREE.Vector3, lookAt: THREE.Vector3 }} */
		this.cameraConfig = {
			...this.cameraConfig,
			position: new THREE.Vector3(8, 6, 10),
		};

		/** @type {{ enableDamping: boolean, dampingFactor: number, screenSpacePanning: boolean, maxPolarAngle: number, minDistance: number, maxDistance: number, rotateSpeed: number, zoomSpeed: number, autoRotate: boolean, autoRotateSpeed: number }} */
		this.controlsConfig = {
			...this.controlsConfig,
			minPolarAngle: Math.PI / 8,
			maxPolarAngle: Math.PI / 2,
			minDistance: 3,
			maxDistance: 100,
			rotateSpeed: 1.0,
			zoomSpeed: 1.2,
			autoRotate: true,
			enableZoom: true,
			enablePan: true,
			enableRotate: true,
			autoRotateSpeed: 15.0,
			dampingFactor: 0.25,
		};

		/** @type {Array<{type: string, color: number, intensity: number, position?: THREE.Vector3, name: string}>} */
		this.lightsConfig = [
			// {
			// 	type: 'AmbientLight',
			// 	color: 0x999999,
			// 	intensity: 0.31,
			// 	name: 'ambientLight',
			// },
			// {
			// 	type: 'DirectionalLight',
			// 	color: 0xffffff,
			// 	intensity: 1,
			// 	position: new THREE.Vector3(50, 50, -50),
			// 	name: 'directionalLight',
			// },
		];

		/** @type {Array<{path: string, initialPosition: THREE.Vector3, initialScale: THREE.Vector3, initialRotation: THREE.Euler, name: string, defaultAnimation: string, textures: {baseColor: string, normalMap: string, specularMap: string}}>} */
		this.modelsConfig = [
			// {
			// 	path: '../assets/vespa_mandarinia/scene.gltf',
			// 	initialPosition: new THREE.Vector3(0, 2, 0),
			// 	initialScale: new THREE.Vector3(1.1, 1.1, 1.1),
			// 	name: 'suzumebachi',
			// 	defaultAnimation: 'Hover',
			// },
		];

		/** @type {Array<{model: string, autoplay: boolean}>} */
		this.animationsConfig = [
			// {
			// 	model: 'suzumebachi',
			// 	autoplay: true
			// },
		];
	}

}

export default EffectsSceneConfig;