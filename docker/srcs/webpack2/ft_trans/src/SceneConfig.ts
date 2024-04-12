
/**
 * @file シーンの初期値を指定するconfigファイル
 * @note
 * - 開発環境の画面右側のControlsGUIの設定は、ControlsGUI.tsで直接行う方針
 */

import * as THREE from 'three';
import { LightConfig } from './js/type';

class SceneConfig {

	cameraConfig = {
		fov: 125,
		aspect: window.innerWidth / window.innerHeight,
		near: 0.1,
		far: 1000,
		position: new THREE.Vector3(0, 0, 10),
		lookAt: new THREE.Vector3(0, 0, 0),
	};

	rendererConfig = {
		antialias: true,
		pixelRatio: window.devicePixelRatio,
	};

	controlsConfig = {
		enableDamping: true,
		dampingFactor: 0.05,
		screenSpacePanning: false,
		maxPolarAngle: Math.PI / 2,
		minDistance: 1,
		maxDistance: 100,
		rotateSpeed: 1.0,
		zoomSpeed: 1.2,
		autoRotate: true,
		autoRotateSpeed: 15.0,
	};

	lightsConfig: LightConfig[] = [
		{
			type: 'AmbientLight',
			color: 0xc50bd5,
			intensity: 1,
			name: 'ambientLight',
		},
		{
			type: 'DirectionalLight',
			color: 0xffffff,
			intensity: 0.1,
			position: new THREE.Vector3(50, 50, -50),
			name: 'directionalLight',
		},
		{
			type: 'HemisphereLight',
			skyColor: 0xffffff,
			groundColor: 0x444444,
			intensity: 1,
			position: new THREE.Vector3(0, 20, 0),
			name: 'hemiLight',
		},
		{
			type: 'PointLight',
			color: 0x050aa3,
			intensity: 1,
			distance: 100,
			decay: 2,
			position: new THREE.Vector3(10, 10, 10),
			name: 'pointLight',
		},
		{
			type: 'SpotLight',
			color: 0x1cb526,
			intensity: 0.1,
			distance: 200,
			angle: Math.PI / 50,
			penumbra: 0.1,
			decay: 0.5,
			position: new THREE.Vector3(10, 10, 10),
			name: 'spotLight',
		},
	];
}

export default SceneConfig;