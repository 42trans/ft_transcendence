
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
			far: 10000,
			position: new THREE.Vector3(0, 0, 320),
		};

		/** @type {{ enableDamping: boolean, dampingFactor: number, screenSpacePanning: boolean, maxPolarAngle: number, minDistance: number, maxDistance: number, rotateSpeed: number, zoomSpeed: number, autoRotate: boolean, autoRotateSpeed: number }} */
		this.controlsConfig = {
			...this.controlsConfig,
			enableDamping: true,
			dampingFactor: 0.2,
		};

		/** @type {Array<{type: string, color: number, intensity: number, position?: THREE.Vector3, name: string}>} */
		this.lightsConfig = [
			{
				type: 'PointLight',
				color: 0xF8D898,
				intensity: 2.9,
				distance: 10000,
				position: { x: -1000, y: 0, z: 1000 },
				name: 'pointLight',
			},
			{
				type: 'SpotLight',
				intensity: 1.5,
				position: { x: 0, y: 0, z: 460 },
				castShadow: true,
				// position: new THREE.Vector3(10, 8, -9),
				name: 'spotLight',
			},
		];

		/** @type {Array<{path: string, initialPosition: THREE.Vector3, initialScale: THREE.Vector3, initialRotation: THREE.Euler, name: string, defaultAnimation: string, textures: {baseColor: string, normalMap: string, specularMap: string}}>} */
		this.modelsConfig = [
			{
				path: '../assets/vespa_mandarinia/scene.gltf',
				initialPosition: new THREE.Vector3(40, 40, -50),
				initialScale: new THREE.Vector3(10, 10, 10),
				name: 'suzumebachi',
				defaultAnimation: 'Hover',
			},
		];

		/** @type {Array<{model: string, autoplay: boolean}>} */
		this.animationsConfig = [
			{
				model: 'suzumebachi',
				// autoplay: true
			},
		];

	}
}

export default GameSceneConfig;