import * as THREE from "three";
import AnimationUtils from "./AnimationUtils";
import AllScenesManager from '../manager/AllScenesManager';

/**
 * テーブルのズームアニメーションを実行する
 * 
 * @param zoomInDistance ズームイン後の距離
 * @param zoomOutDistance ズームアウト後の距離
 * @param duration アニメーション時間
 * @param pauseDuration 一時停止時間
 * @param initialPolarAngle: 初期カメラの傾き
 * @param finalPolarAngle: 最終カメラの傾き
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
	}

	/**
	 * テーブルへのズームアウト・インを実行するメソッド
	 * @param {*} params 
	 */
	zoomToTable(params) 
	{
		 // カメラのターゲット位置を設定
		this.controls.target.copy(params.targetPosition);

		 // 最初のズーム処理を開始
		this.zoom(params, () => 
		{
			// 最初のズーム後に一時停止
			setTimeout(() => {
				// 逆方向のズームパラメータを設定
				const reverseParams = 
				{
					...params,
					startDistance: params.zoomInDistance,
					endDistance: params.zoomOutDistance,
					initialPolarAngle: params.finalPolarAngle,
					finalPolarAngle: params.initialPolarAngle
				};
				// 逆方向のズームを実行
				this.zoom(
					reverseParams, 
					this.resetCameraPositionAndOrientation.bind(this, params.targetPosition, params.zoomOutDistance));
			}, params.pauseDuration);
		});
	}

	zoom(params, callback) 
	{
		// ズーム開始時間を記録
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
				const newPos = this.adjustCameraTilt(params.targetPosition, params.startDistance, params.endDistance, params.initialPolarAngle, params.finalPolarAngle, easedFraction);
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

	// カメラの傾きを調整するメソッド
	adjustCameraTilt(targetPosition, startDistance, endDistance, initialPolarAngle, finalPolarAngle, fraction) 
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
