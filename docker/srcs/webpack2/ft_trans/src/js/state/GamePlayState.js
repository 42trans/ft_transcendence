import PongApp from '../PongApp'
import BackgroundSceneConfig from '../config/BackgroundSceneConfig';
import GameSceneConfig from '../config/GameSceneConfig';
// import GameStateManager from './states/GameStateManager';
import BaseGameState from './BaseGameState'
import SceneUnit from '../SceneUnit';
import PongEngine from '../pongEngine/PongEngine';
import MagmaFlare from '../effect/MagmaFlare'
import AllScenesManager from '../manager/AllScenesManager';
import * as THREE from "three";

class GameplayState extends BaseGameState {
	constructor (PongApp){
		super(PongApp);
		this.scenesMgr = AllScenesManager.getInstance();
	}
	enter() {
		console.log("Entering GamePlay state");
		// this.scenesMgr.backgroundScene.refreshScene(new BackgroundSceneConfig());
		this.scenesMgr.gameScene.refreshScene(new GameSceneConfig());

		this.pongEngine = new PongEngine(
			this.PongApp
		);

		this.zoomToTable();	

		setTimeout( () => {
			// this.scenesMgr.effectsScene.clearScene();
		}, 4500);
	}

	update() {
				// this.pongEngineUpdate = new PongEngineUpdate(this.scene, this.renderer);

	}

	render() {
	}

	exit() {
		console.log("Exiting GamePlay state");
		this.PongApp.allScenesManager.backgroundScene.clearScene();
		this.PongApp.allScenesManager.gameScene.clearScene();


	}

	// 参考:【OrbitControls – three.js docs】 <https://threejs.org/docs/#examples/en/controls/OrbitControls>
	zoomToTable() {
		const targetPosition = new THREE.Vector3();
		this.pongEngine.data.objects.plane.getWorldPosition(targetPosition); 

		this.camera = this.PongApp.allScenesManager.gameScene.camera;
		this.controls = this.PongApp.allScenesManager.gameScene.controls;

		this.controls.target.copy(targetPosition);
	
		const startDistance = this.camera.position.distanceTo(targetPosition);
		const zoomInDistance = 1000; // ズームイン後の目的の距離
		const zoomOutDistance = 420; // ズームアウト後の目的の距離
		const duration = 1500; // アニメーションの持続時間 (ミリ秒)
		const pauseDuration = 100; // ズームインとズームアウトの間の遅延 (ミリ秒)

		const initialPolarAngle = Math.PI / 4; // 初期角度
		const finalPolarAngle = 0; // 初期角度

		let startTime = performance.now();
	
		const updateZoom = () => {
			const now = performance.now();
			const elapsedTime = now - startTime;
			const fraction = elapsedTime / duration;
	
			if (fraction < 1) {
				const easedFraction = this.easeInOutQuad(fraction);
				const currentDistance = THREE.MathUtils.lerp(startDistance, zoomInDistance, easedFraction);
				const currentPolarAngle = THREE.MathUtils.lerp(initialPolarAngle, finalPolarAngle, easedFraction);

				const newPos = targetPosition.clone().add(new THREE.Vector3(0, Math.sin(currentPolarAngle), -Math.cos(currentPolarAngle)).multiplyScalar(currentDistance));

				this.camera.position.copy(newPos);
				this.camera.lookAt(targetPosition);
				
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
	
		const resetCameraPositionAndOrientation = () => {
			const resetDuration = 1000; // カメラリセットの持続時間 (ミリ秒)
			let resetStartTime = performance.now();
		
			const initialPosition = this.camera.position.clone();
			const finalPosition = targetPosition.clone().add(new THREE.Vector3(0, 0, zoomOutDistance));
			const initialLookAt = this.camera.getWorldDirection(new THREE.Vector3()).add(this.camera.position);
			
			const updateReset = () => {
				const now = performance.now();
				const elapsedTime = now - resetStartTime;
				const fraction = elapsedTime / resetDuration;
		
				if (fraction < 1) {
					const easedFraction = this.easeInOutQuad(fraction);
		
					// カメラ位置の更新
					const newPos = initialPosition.clone().lerp(finalPosition, easedFraction);
					this.camera.position.copy(newPos);
		
					// カメラの向きの更新
					const newLookAt = initialLookAt.clone().lerp(targetPosition, easedFraction);
					this.camera.lookAt(newLookAt);
		
					this.controls.update();
					requestAnimationFrame(updateReset);
				} else {
					// 最終的なカメラ位置と向きを確定
					this.camera.position.copy(finalPosition);
					this.camera.lookAt(targetPosition);
					this.controls.update();
				}
			};
		
			updateReset();
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
				resetCameraPositionAndOrientation();
			}
		};
	
		updateZoom();
	}

	// easeInOutQuad イージング関数
	easeInOutQuad(t) {
		return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
	}
}

export default GameplayState;
