import * as THREE from "three";
import AnimationUtils from "./AnimationUtils";

class ZoomBall  
{
	constructor(camera, cameraControls) 
	{
		this.camera = camera;
		this.controls = cameraControls;
	}

	// ズームプロセスを管理するasyncメソッド
	async zoomToBall(targetPosition, startDistance, zoomInDistance, zoomOutDistance, duration, pauseDuration) 
	{
		// ズームイン
		await this.animateZoom(targetPosition, startDistance, zoomInDistance, duration);
		// ズームインが完了したらpauseDuration時間停止
		await new Promise(resolve => setTimeout(resolve, pauseDuration));
		// ズームアウト
		await this.animateZoom(targetPosition, zoomInDistance, zoomOutDistance, duration);
	}

	/**
	 * await と合わせて、次のフレームを待機するプロミスを返すヘルパー関数。
	 * - 次の画面描画が行われるまでの間、非同期処理の実行を一時停止
	 * - requestAnimationFrame: 画面の描画タイミングに合わせてスクリプト内で指定された関数を実行(Webブラウザの機能)
	 * - Promise: 非同期操作の最終的な結果を表すオブジェクト。
	 */
	waitForNextFrame() 
	{
		// 次のフレームを要求
		// resolve関数が呼び出されることで「解決」する
		return new Promise(resolve => {
			// ブラウザの描画タイミングに合わせてresolve関数を呼び出し
			requestAnimationFrame(resolve)
		});
	}

	/**
	 *  アニメーション処理（async=非同期関数）
	 * 
	 * @param {THREE.Vector3} targetPosition ズーム対象の位置
	 * @param {number} startDistance ズーム開始時の距離
	 * @param {number} endDistance ズーム終了時の距離
	 * @param {number} duration アニメーションの持続時間（ミリ秒）
	 */
	async animateZoom(
		targetPosition, 
		startDistance, 
		endDistance, 
		duration) 
	{
		const startTime = performance.now();
		
		while (true) 
		{
			// アニメーション開始時刻を記録
			const now = performance.now();
			// 経過時間を計算
			const elapsedTime = now - startTime;
			// アニメーションの進行状況を計算
			const fraction = elapsedTime / duration;

			// アニメーション完了判定
			if (fraction >= 1) 
			{
				resolve();
				break;
			}

			// イージング関数を用いて滑らかに変化
			const easedFraction = AnimationUtils.easeInOutQuad(fraction);
			// 現在のズーム距離を計算
			const currentDistance = THREE.MathUtils.lerp(startDistance, endDistance, easedFraction);
			// カメラの向き(方向ベクトル)を計算
			const direction = new THREE.Vector3().subVectors(targetPosition, this.camera.position).normalize();
			// カメラ位置を更新
			this.camera.position.copy(targetPosition).add(direction.multiplyScalar(-currentDistance));

			// カメラコントロールを更新
			this.controls.update();
			// 次のフレーム(プロミスが返される)まで一時停止
			await this.waitForNextFrame();
		}

		// カメラの注視点を更新
		this.controls.target.copy(targetPosition);
		// カメラコントロールを最終更新
		this.controls.update();
	}
}

export default ZoomBall;