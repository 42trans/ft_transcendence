/**
 * @file シーンの初期値を指定するconfigファイル
 * @note
 * - 開発環境の画面右側のControlsGUIの設定は、ControlsGUI.tsで直接行う方針
 */

import * as THREE from 'three';
import BaseSceneConfig from './BaseSceneConfig.js'

class EffectsSceneConfig extends BaseSceneConfig
{
	constructor() 
	{
		super();
		if (import.meta.env.MODE === 'development') {
			this.gltfURL = 'assets/animated_butterfly/scene.gltf';
			this.gltfPng = 'assets/animated_butterfly/textures/Wings_baseColor.png';
		} else {
			const baseURL = new URL('.', import.meta.url).href;
			this.gltfURL = new URL('../../gltf/animated_butterfly/scene.gltf', baseURL).href;
			this.gltfPng = new URL('../../gltf/animated_butterfly/Wings_baseColor.png', baseURL).href;
		}
			
		this.cameraConfig = 
		{
			...this.cameraConfig,
			position: new THREE.Vector3(8, 6, 10),
		};

		this.controlsConfig = 
		{
			...this.controlsConfig,
			minPolarAngle: Math.PI / 8,
			maxPolarAngle: Math.PI / 2,
			minDistance: 3,
			maxDistance: 1000,
			// rotateSpeed: 1.0,
			// zoomSpeed: 1.2,
			autoRotate: true,
			// enableZoom: true,
			// enablePan: true,
			enableRotate: true,
			autoRotateSpeed: 15.0,
			dampingFactor: 0.25,
		};

		/** @type {Array<{type: string, color: number, intensity: number, position?: THREE.Vector3, name: string}>} */
		this.lightsConfig = [
			{
				type: 'AmbientLight',
				color: 0x999999,
				intensity: 0.91,
				name: 'ambientLight',
			},
			{
				type: 'DirectionalLight',
				color: 0xffffff,
				intensity: 1,
				position: new THREE.Vector3(50, 50, -50),
				name: 'directionalLight',
			},
		];

		/** @type {Array<{path: string, initialPosition: THREE.Vector3, initialScale: THREE.Vector3, initialRotation: THREE.Euler, name: string, defaultAnimation: string, textures: {baseColor: string, normalMap: string, specularMap: string}}>} */
		this.modelsConfig = [
			{
				path: this.gltfURL,
				initialPosition: new THREE.Vector3(0, 1.3, -1.6),
				initialScale: new THREE.Vector3(1, 1, 1),
				initialRotation: new THREE.Euler(-0.8, 0, 0),
				name: 'tyou',
				// defaultAnimation: 'Hover',
				textures: 
				{
					baseColor: this.giltPng,
				}
			},		
		];

		/** @type {Array<{model: string, autoplay: boolean}>} */
		this.animationsConfig = [

			{
				model: 'tyou',
				autoplay: true
			},
		];
	}

}

export default EffectsSceneConfig;