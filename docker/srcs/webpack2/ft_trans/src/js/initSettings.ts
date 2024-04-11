import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { cameraConfig, rendererConfig, controlsConfig } from '../config';

export function setupCamera() {
	const cam = new THREE.PerspectiveCamera(
		cameraConfig.fov,
		cameraConfig.aspect,
		cameraConfig.near,
		cameraConfig.far
	);
	cam.position.copy(cameraConfig.position);
	cam.lookAt(cameraConfig.lookAt);
	return cam;
}

export function setupRenderer() {
	const rend = new THREE.WebGLRenderer({ antialias: rendererConfig.antialias });
	rend.setSize(window.innerWidth, window.innerHeight);
	rend.setPixelRatio(rendererConfig.pixelRatio);
	document.body.appendChild(rend.domElement);
	return rend;
}

export function setupControls(camera: THREE.Camera, renderer: THREE.Renderer) {
	const controls = new OrbitControls(camera, renderer.domElement);
	Object.assign(controls, controlsConfig);
	return controls;
}
