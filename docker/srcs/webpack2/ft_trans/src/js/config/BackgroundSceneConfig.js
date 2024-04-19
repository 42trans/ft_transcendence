
/**
 * @file シーンの初期値を指定するconfigファイル
 * @note
 * - 開発環境の画面右側のControlsGUIの設定は、ControlsGUI.tsで直接行う方針
 */

import * as THREE from 'three';
import BaseSceneConfig from './BaseSceneConfig.js'

class BackgroundSceneConfig extends BaseSceneConfig {

	constructor() {
		super();

		/** @type {{ fov: number, aspect: number, near: number, far: number, position: THREE.Vector3, lookAt: THREE.Vector3 }} */
		this.cameraConfig = {
			...this.cameraConfig,
			far: 1000,
			position: new THREE.Vector3(0, 0, 10),
		};

		/** @type {{ enableDamping: boolean, dampingFactor: number, screenSpacePanning: boolean, maxPolarAngle: number, minDistance: number, maxDistance: number, rotateSpeed: number, zoomSpeed: number, autoRotate: boolean, autoRotateSpeed: number }} */
		this.controlsConfig = {
			...this.controlsConfig,
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
				color: 0xa41832,
				intensity: 1,
				position: new THREE.Vector3(50, 50, -50),
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
				color: new THREE.Color(5, 30, 1),
				intensity: 0.05,
				distance: 200,
				decay: 0,
				position: new THREE.Vector3(-2, -5, 3),
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
			// 	path: 'assets/vespa_mandarinia/scene.gltf',
			// 	initialPosition: new THREE.Vector3(0, 2, 0),
			// 	initialScale: new THREE.Vector3(1, 1, 1),
			// 	name: 'suzumebachi',
			// 	defaultAnimation: 'Hover',
			// },
			// {
			// 	path: 'assets/vespa_mandarinia/scene.gltf',
			// 	initialPosition: new THREE.Vector3(1, 2, 1),
			// 	initialScale: new THREE.Vector3(1, 1, 1),
			// 	name: 'suzumebachi2',
			// 	defaultAnimation: 'idle',
			// },
			// {
			// 	path: 'assets/vespa_mandarinia/scene.gltf',
			// 	initialPosition: new THREE.Vector3(1, 3, 0),
			// 	initialScale: new THREE.Vector3(1, 1, 1),
			// 	initialRotation: new THREE.Euler(0, 1, 0),
			// 	name: 'vespa_mandarinia',
			// 	defaultAnimation: 'fly',
			// 	textures: {
			// 		baseColor: 'assets/vespa_mandarinia/textures/material_baseColor.png',
			// 		normalMap: 'assets/vespa_mandarinia/textures/material_clearcoat_normal.png',
			// 		roughnessMap: 'assets/vespa_mandarinia/textures/material_metallicRoughness.png',
			// 		specularMap: 'assets/vespa_mandarinia/textures/material_specularf0.png',
			// 	}
			// },
			{
				path: '../assets/model_47a_-_loggerhead_sea_turtle/scene.gltf',
				initialPosition: new THREE.Vector3(0, 0, 0),
				initialScale: new THREE.Vector3(0.1, 0.1, 0.1),
				initialRotation: new THREE.Euler(0, 2.8, 0),
				name: 'kame',
				defaultAnimation: 'swim',
				textures: {
					baseColor: 'assets/model_47a_-_loggerhead_sea_turtle/textures/body_diffuse.png',
					normalMap: 'assets/model_47a_-_loggerhead_sea_turtle/textures/body_normal.jpeg',
					// roughnessMap: 'assets/model_47a_-_loggerhead_sea_turtle/textures/body_specularGlossiness.png',
					specularMap: 'assets/model_47a_-_loggerhead_sea_turtle/textures/body_specularGlossiness.png',

				}
			},
		];

		/** @type {Array<{model: string, autoplay: boolean}>} */
		this.animationsConfig = [
			// {
			// 	model: 'suzumebachi',
			// 	autoplay: true
			// },
			// {
			// 	model: 'suzumebachi2',
			// 	autoplay: true
			// },
			// {
			// 	model: 'suzumebachi3',
			// 	autoplay: true
			// },
			{
				model: 'kame',
				autoplay: true
			},
		];
	}

}

export default BackgroundSceneConfig;