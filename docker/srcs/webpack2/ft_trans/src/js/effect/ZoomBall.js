import * as THREE from "three";
import AnimationUtils from "./AnimationUtils";

/**
 * # JavaScriptの非同期処理の概要
 * - ブラウザはシングルスレッドで動作(一度に一つのタスク)
 *   - 重い処理がUIの反応を阻害する可能性
 *   - 非同期処理で長時間実行されるスクリプトがUIの反応を停止させることなくバックグラウンドで実行
 * - Promise: 将来のある時点で値を返すか、なんらかの理由で失敗するかもしれない操作の結果を表します。
 *   - 3つの状態：pending（未解決）、fulfilled（解決）、rejected（拒否）。
 *   - resolve関数: Promiseを成功とマーク。reject関数はPromiseを失敗とマーク。
 * - async: 関数の前につけると、その関数は常にPromiseを返す。
 * - await: async関数内で使用され、Promiseが解決されるまで関数の実行を一時停止。Promiseが解決されると、関数はPromiseの結果とともに再開されます。
 */

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
		await this.delay(pauseDuration);
		// ズームアウト
		await this.animateZoom(targetPosition, zoomInDistance, zoomOutDistance, duration);
	}

	delay(pauseDuration) 
	{
		return new Promise((resolve) => 
		{
			setTimeout(() => 
			{
				// 指定した時間経過後にPromiseを解決する
				resolve();  
			}, pauseDuration);
		});
	}

	/**
	 * await と合わせて、次のフレームを待機するプロミスを返すヘルパー関数。
	 * - 次の画面描画が行われるまでの間、非同期処理の実行を一時停止
	 * - requestAnimationFrame: 画面の描画タイミングに合わせてスクリプト内で指定された関数を実行(Webブラウザの機能)
	 * - Promise: 非同期操作の最終的な結果を表すオブジェクト。
	 */
	waitForNextFrame() 
	{
		return new Promise(resolve => 
		{
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
		return new Promise(async (resolve, reject) => 
		{
			const startTime = performance.now();
			try {
				await this.performZoom(targetPosition, startDistance, endDistance, duration);
				resolve();
			} catch {
				reject(error);
			}
		});
	}

	async performZoom(targetPosition, startDistance, endDistance, duration) 
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
				// カメラの注視点を更新
				this.controls.target.copy(targetPosition);
				// カメラコントロールを最終更新
				this.controls.update();
				// 最後にPromiseを解決
				// resolve();
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
	}

}

export default ZoomBall;