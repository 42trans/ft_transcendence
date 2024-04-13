
/**
 * @file dev時に右上に表示するコントローラーの設定
 * 
 */

import * as THREE from 'three';
import * as lil from 'lil-gui';

/**
 * @class ControlsGUI
 * @description dev時に右上に表示するコントローラーの設定
 */
class ControlsGUI {
	/**
	 * @param {THREE.Scene} scene - THREE.Sceneのインスタンス
	 * @param {lil.GUI} gui - lil.GUIのインスタンス
	 * @param {THREE.PerspectiveCamera} camera - THREE.PerspectiveCameraのインスタンス
	 */
	constructor(
		scene,
		gui,
		camera
	) {
		this.scene = scene;
		this.gui = gui;
		this.camera = camera;
	}

	setupControlsGUI() {
		this.setupCameraGUI();
		this.setupLightGUI();
	}

	/** Private method */
	setupCameraGUI() {
		const cameraFolder = this.gui.addFolder('Camera Position');
		cameraFolder.add(this.camera.position, 'x', -100, 100, 0.01).name('Position X');
		cameraFolder.add(this.camera.position, 'y', -100, 100, 0.01).name('Position Y');
		cameraFolder.add(this.camera.position, 'z', -100, 100, 0.01).name('Position Z');
		cameraFolder.close();
	}

	/** Private method */
	setupLightGUI() {
		this.scene.children.forEach((child) => {
			if (child instanceof THREE.Light) {
				const folder = this.gui.addFolder(child.name);
				// Light settings based on type
				folder.add(child, 'intensity', 0, 2, 0.01);
				folder.addColor(child, 'color');
				if ('position' in child) {
					folder.add(child.position, 'x', -50, 50, 0.01);
					folder.add(child.position, 'y', -50, 50, 0.01);
					folder.add(child.position, 'z', -50, 50, 0.01);
				}
				if (child instanceof THREE.PointLight) {
					folder.add(child, 'distance', 0, 500, 1);
					folder.add(child, 'decay', 0, 4, 0.01);
				}
				if (child instanceof THREE.SpotLight) {
					folder.add(child, 'distance', 0, 500, 1);
					folder.add(child, 'decay', 0, 4, 0.01);
					folder.add(child, 'angle', 0, Math.PI, 0.01);
					folder.add(child, 'penumbra', 0, 1, 0.01);
				}
				folder.close();
			}
		});
	}
}

export default ControlsGUI;