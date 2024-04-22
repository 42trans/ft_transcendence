
/**
 * @file シーンの初期値を指定するconfigファイル
 * @note
 * - 開発環境の画面右側のControlsGUIの設定は、ControlsGUI.tsで直接行う方針
 */

import * as THREE from 'three';
import BaseSceneConfig from './BaseSceneConfig.js'

class BackgroundSceneConfig extends BaseSceneConfig 
{
	constructor() 
	{
		super();

		this.cameraConfig = 
		{
			...this.cameraConfig,
			far: 1000,
			position: new THREE.Vector3(8, 6, 10),
		};

		this.controlsConfig = 
		{
			...this.controlsConfig,
			// minPolarAngle: Math.PI / 8,
			// maxPolarAngle: Math.PI / 2,
			// minDistance: 3,
			// maxDistance: 1000,
			// rotateSpeed: 1.0,
			// zoomSpeed: 1.2,
			// autoRotate: true,
			// enableZoom: true,
			// enablePan: true,
			enableRotate: true,
			autoRotateSpeed: 15.0,
			// dampingFactor: 0.25,
		};

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

		this.modelsConfig = [
			// {
			// 	path: '../assets/model_47a_-_loggerhead_sea_turtle/scene.gltf',
			// 	initialPosition: new THREE.Vector3(0, 0, 0),
			// 	initialScale: new THREE.Vector3(0.1, 0.1, 0.1),
			// 	initialRotation: new THREE.Euler(0, 2.8, 0),
			// 	name: 'kame',
			// 	defaultAnimation: 'swim',
			// 	textures: {
			// 		baseColor: 'assets/model_47a_-_loggerhead_sea_turtle/textures/body_diffuse.png',
			// 		normalMap: 'assets/model_47a_-_loggerhead_sea_turtle/textures/body_normal.jpeg',
			// 		specularMap: 'assets/model_47a_-_loggerhead_sea_turtle/textures/body_specularGlossiness.png',

			// 	}
			// },
			{
				path: 'assets/vespa_mandarinia/scene.gltf',
				initialPosition: new THREE.Vector3(-2, -15, -1),
				initialScale: new THREE.Vector3(10, 10, 10),
				initialRotation: new THREE.Euler(0, 1, 0),
				name: 'hachi',
				defaultAnimation: 'fly',
				textures: {
					baseColor: 'assets/vespa_mandarinia/textures/material_baseColor.png',
					normalMap: 'assets/vespa_mandarinia/textures/material_clearcoat_normal.png',
					roughnessMap: 'assets/vespa_mandarinia/textures/material_metallicRoughness.png',
					specularMap: 'assets/vespa_mandarinia/textures/material_specularf0.png',
				}
			},

			{
				path: '../assets/animated_butterfly/scene.gltf',
				initialPosition: new THREE.Vector3(0, 0, -15),
				initialScale: new THREE.Vector3(1, 1, 1),
				// initialRotation: new THREE.Euler(0.8, -2, 1),
				initialRotation: new THREE.Euler(-0.8, 0, 0),

				name: 'tyou',
				// defaultAnimation: 'Hover',
				textures: {
							baseColor: '../assets/animated_butterfly/textures/Wings_baseColor.png',
							// roughnessMap: '../assets/animated_butterfly/textures/mat1_baseColor.png',
							// specularMap: '../assets/animated_butterfly/textures/mat1_baseColor.png',
					// 		normalMap: 'assets/vespa_mandarinia/textures/material_clearcoat_normal.png',
					// 		roughnessMap: 'assets/vespa_mandarinia/textures/material_metallicRoughness.png',
					// 		specularMap: 'assets/vespa_mandarinia/textures/material_specularf0.png',
						}
			},
		];

		this.animationsConfig = [
			// {
			// 	model: 'kame',
			// 	autoplay: true
			// },
			{
				model: 'hachi',
				autoplay: true
			},
			{
				model: 'tyou',
				autoplay: true
			},

		];
	}

}

export default BackgroundSceneConfig;