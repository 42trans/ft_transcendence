import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// 外部からアクセス可能なアニメーションの状態を管理するための変数と関数をエクスポートします
export let mixer: THREE.AnimationMixer | null = null;

export function setMixer(newMixer: THREE.AnimationMixer | null) {
	mixer = newMixer;
}

// アニメーションを管理するクロックインスタンス
const clock = new THREE.Clock();

// アニメーションを実行する関数
export function animate(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, controls: OrbitControls) {
	requestAnimationFrame(() => animate(renderer, scene, camera, controls));
	const delta = clock.getDelta();
	// AnimationMixerが初期化されていれば(nullでなければ)更新
	if (mixer) {
		mixer.update(delta);
	}
	controls.update();
	renderer.render(scene, camera);
}
