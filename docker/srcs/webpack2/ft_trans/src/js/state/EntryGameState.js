import PongApp from '../PongApp'
import BaseGameState from './BaseGameState'
import MagmaFlare from '../effect/MagmaFlare'
import * as THREE from 'three';
import EffectsSceneConfig from '../config/EffectsSceneConfig';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


class EntryGameState extends BaseGameState {
	constructor (PongApp){
		super(PongApp);
		this.magmaFlare = new MagmaFlare();
	}

	enter() {
		console.log("enter(): EntryGameState");
		this.PongApp.allScenesManager.effectsScene.refreshScene(new EffectsSceneConfig());

		this.magmaFlare.name = "MagmaFlare";
		this.PongApp.allScenesManager.effectsScene.scene.add(this.magmaFlare);
	}

	update() {
	}

	render() {
	}

	exit() {
		console.log("exit(): EntryGameState");
		this.zoomToMagmaFlare();
	}

	// easeInOutQuad イージング関数
	easeInOutQuad(t) {
		return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
	}
	
	zoomToMagmaFlare() {
		const targetPosition = new THREE.Vector3();
		this.magmaFlare.getWorldPosition(targetPosition);
	
		this.camera = this.PongApp.allScenesManager.effectsScene.camera;
		this.controls = this.PongApp.allScenesManager.effectsScene.controls;
	
		this.controls.target.copy(targetPosition);
	
		const startDistance = this.camera.position.distanceTo(targetPosition);
		const zoomInDistance = 3; // ズームイン後の目的の距離
		const zoomOutDistance = 100; // ズームアウト後の目的の距離
		const duration = 2000; // アニメーションの持続時間 (ミリ秒)
		const pauseDuration = 500; // ズームインとズームアウトの間の遅延 (ミリ秒)
	
		let startTime = performance.now();
	
		const updateZoom = () => {
			const now = performance.now();
			const elapsedTime = now - startTime;
			const fraction = elapsedTime / duration;
	
			if (fraction < 1) {
				const easedFraction = this.easeInOutQuad(fraction);
				const currentDistance = THREE.MathUtils.lerp(startDistance, zoomInDistance, easedFraction);
				const direction = new THREE.Vector3().subVectors(targetPosition, this.camera.position).normalize();
				this.camera.position.copy(targetPosition).add(direction.multiplyScalar(-currentDistance));
				this.controls.update();
				requestAnimationFrame(updateZoom);
			} else {
				// ズームイン後の小休止
				setTimeout(() => {
					startTime = performance.now(); // 時間をリセット
					zoomOut(); // ズームアウト処理を開始
				}, pauseDuration);
			}
		};
	
		const zoomOut = () => {
			const now = performance.now();
			const elapsedTime = now - startTime;
			const fraction = elapsedTime / duration;
	
			if (fraction < 1) {
				const easedFraction = this.easeInOutQuad(fraction);
				const currentDistance = THREE.MathUtils.lerp(zoomInDistance, zoomOutDistance, easedFraction);
				const direction = new THREE.Vector3().subVectors(targetPosition, this.camera.position).normalize();
				this.camera.position.copy(targetPosition).add(direction.multiplyScalar(-currentDistance));
				this.controls.update();
				requestAnimationFrame(zoomOut);
			} else {
				const direction = new THREE.Vector3().subVectors(targetPosition, this.camera.position).normalize();
				this.camera.position.copy(targetPosition).add(direction.multiplyScalar(-zoomOutDistance));
				this.controls.update();
			}
		};
	
		updateZoom();
	}

}

export default EntryGameState;
