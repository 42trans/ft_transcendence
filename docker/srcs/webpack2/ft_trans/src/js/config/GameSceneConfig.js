
/**
 * @file シーンの初期値を指定するconfigファイル
 * @note
 * - 開発環境の画面右側のControlsGUIの設定は、ControlsGUI.tsで直接行う方針
 */

import * as THREE from 'three';
import BaseSceneConfig from './BaseSceneConfig.js'

class GameSceneConfig extends BaseSceneConfig
{
	constructor() 
	{
		super();
		
		this.cameraConfig = 
		{
			...this.cameraConfig,
			fov: 50,
			far: 1500,
			position: new THREE.Vector3(0, 0, 520),
			up: new THREE.Vector3(0, 0, 1)  // Z軸が上方向（真下を向いてるので）
		};

		this.controlsConfig = 
		{
			...this.controlsConfig,

			minPolarAngle: 0,  // 0 = カメラが真上から見下ろす
			maxPolarAngle: Math.PI / 4, // Math.PI = カメラが真下を向く角度
			minAzimuthAngle: Math.PI / 1, // 方位角を90度（東）に固定
			maxAzimuthAngle: Math.PI / 1, // 最大角度
			
			minDistance: 300,
			maxDistance: 1000,
			zoomSpeed: 1.2,
			enableZoom: true,
			dampingFactor: 0.25,
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

		this.modelsConfig = [
		];

		this.animationsConfig = [
		];

	}
}

export default GameSceneConfig;