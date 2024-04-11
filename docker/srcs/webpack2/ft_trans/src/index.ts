// docker/srcs/webpack2/ft_trans/src/index.ts
import * as THREE from 'three';
import * as lil from 'lil-gui';
import { setupControls, setupCamera, setupRenderer } from './js/initSettings';
import { setupLights } from './js/lights';
// import { setupContorolsGUI } from './guiSettings';
import { ControlsGUI } from './ControlsGUI';
import { loadModel } from './js/suzumebachiModelLoader';
import { setMixer, animate } from './js/animation';
// ---------------------------
// rendererとは？: mlxポインター的なものじゃないかと
// ---------------------------
const scene = new THREE.Scene();
const camera = setupCamera();
const renderer = setupRenderer();
const controls = setupControls(camera, renderer);
setupLights(scene);
// ---------------------------
// 右上のControls GUI 開発環境用
// ---------------------------
const gui = new lil.GUI();
const contorolsGUI = new ControlsGUI(scene, gui, camera);
contorolsGUI.setupControlsGUI()
// ---------------------------
// animation.ts
// ---------------------------
loadModel(scene, (model, loadedMixer) => {
	// TODO_ft: エラーハンドリング
	setMixer(loadedMixer);
	animate(renderer, scene, camera, controls);
});