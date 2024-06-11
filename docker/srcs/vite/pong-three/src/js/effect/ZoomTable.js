import * as THREE from "three";
import AnimationUtils from "./AnimationUtils";
import AllScenesManager from '../manager/AllScenesManager';

let DEBUG_FLOW 		= 0;
let DEBUG_DETAIL 	= 0;
let TEST_TRY1 		= 0;

/**
 * テーブルのズームアニメーションを実行する
 * 
 * 参考:【OrbitControls – three.js docs】 <https://threejs.org/docs/#examples/en/controls/OrbitControls>
 */
class ZoomTable 
{
	constructor(pongEngine) 
	{
		this.pongEngine = pongEngine;
		const sceneMgr = AllScenesManager.getInstance();
		this.camera = sceneMgr.gameScene.camera;
		this.controls = sceneMgr.gameScene.controls;
		this.initialCameraPosition = null;
	}

	zoomToTable(params) 
	{
					if (DEBUG_DETAIL) 
					{
						console.log('Initial camera position:', this.camera.position);
						console.log('Target position:', params.targetPosition);
					} 

		 // カメラのターゲット位置を設定
		this.controls.target.copy(params.targetPosition);
		// ターゲット（テーブル）とカメラの距離
		this.initialDistance = this.camera.position.distanceTo(params.targetPosition);
		this.currentDistance = this.initialDistance * 2; 

		// 最初のズーム処理を開始
		this.zoom(params, () => 
		{
			// 最初のズーム後に一時停止
			setTimeout(() => {
				// 逆方向のズームパラメータを設定
				const reverseParams = 
				{
					...params,
					// 開始と終了の値を真逆にする
					startDistance: params.zoomInDistance,
					endDistance: params.zoomOutDistance,
					initialPolarAngle: params.finalPolarAngle,
					finalPolarAngle: params.initialPolarAngle
				};
				// 逆方向のズームを実行
				this.zoom(
					reverseParams, 
					// 最後はウィンドウサイズに戻すためinitialDistanceを指定
					this.resetCameraPositionAndOrientation.bind(this, params.targetPosition, this.initialDistance));
			}, params.pauseDuration);
		});
	}

	zoom(params, callback) 
	{
		let startTime = performance.now();
		const updateZoom = () => {
			// 経過時間を計算
			const elapsedTime = performance.now() - startTime;
			// 経過時間の割合を計算
			const fraction = elapsedTime / params.duration;
			if (fraction < 1) 
			{
				// ズーム中の処理
				const easedFraction = AnimationUtils.easeInOutQuad(fraction);
				const newPos = this.updateCameraPositionAndAngle(
					params.targetPosition, 
					params.startDistance, 
					params.endDistance, 
					params.initialPolarAngle, 
					params.finalPolarAngle, 
					easedFraction
				);
				this.camera.position.copy(newPos);
				this.camera.lookAt(params.targetPosition);
				this.controls.update();
				requestAnimationFrame(updateZoom);
			} 
			else 
			{
				// ズーム完了後のコールバックを実行
				callback();
			}
		};
		updateZoom();
	}

	// カメラの位置と角度を更新
	updateCameraPositionAndAngle(
		targetPosition, 
		startDistance, 
		endDistance, 
		initialPolarAngle, 
		finalPolarAngle, 
		fraction)
	{
		// 現在の距離を計算
		const currentDistance = THREE.MathUtils.lerp(startDistance, endDistance, fraction);
		// 現在のポーラ角を計算
		const currentPolarAngle = THREE.MathUtils.lerp(initialPolarAngle, finalPolarAngle, fraction);
		return targetPosition.clone().add
		(
			new THREE.Vector3(
				0, 
				Math.sin(currentPolarAngle), 
				-Math.cos(currentPolarAngle)
			).multiplyScalar(currentDistance)
		);
	}

	// カメラの位置と向きをリセットするメソッド
	resetCameraPositionAndOrientation(targetPosition, zoomOutDistance) 
	{
		// リセット開始時間を記録
		let resetStartTime = performance.now();
		// 初期位置を記録
		const initialPosition = this.camera.position.clone();
		// 最終位置を計算
		const finalPosition = targetPosition.clone().add(new THREE.Vector3(0, 0, zoomOutDistance));
		// リセットの持続時間を設定
		const RESET_DURATION = 1000; 
		const updateReset = () => 
		{
			// 経過時間を計算
			const elapsedTime = performance.now() - resetStartTime;
			// 経過時間の割合を計算
			const fraction = elapsedTime / RESET_DURATION;
			if (fraction < 1) 
			{
				// リセット中の処理
				const easedFraction = AnimationUtils.easeInOutQuad(fraction);
				const newPos = initialPosition.clone().lerp(finalPosition, easedFraction);
				this.camera.position.copy(newPos);
				this.camera.lookAt(targetPosition);
				this.controls.update();
				requestAnimationFrame(updateReset);
			} 
			else 
			{
				this.controls.target.copy(targetPosition);
				this.controls.update();
			}
		};
		updateReset();
	}
}

export default ZoomTable;
