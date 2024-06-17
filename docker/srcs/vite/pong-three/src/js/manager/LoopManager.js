import RendererManager from "./RendererManager";
import { handleCatchError } from '../../index.js';

const DEBUG_FLOW	= 0;
const DEBUG_DETAIL	= 0;
const TEST_TRY1		= 0;
const TEST_TRY2		= 0;
const TEST_TRY3		= 0;

/**
 * ブラウザのフレーム更新タイミングに合わせて自身を再帰的に呼び出し、連続したアニメーションフレームを生成
 * 次の画面描画タイミングで呼び出される。ループは非同期, ブロッキングしない
 * @description
 * - シングルトン
 * - requestAnimationFrame(animate): ブラウザに animate 関数を次の描画フレームで実行するように要求
 *   - 非同期関数であり、実行がスケジュールされた後、即座に制御が戻る。ブロックされず次の行に進む。
 *   - animate(): 状態の更新 (`this.update()`) とシーンの描画 (`this.render()`) を行った後、自身を再帰的にスケジュールする。キューに格納
 * - update(): アニメーションミキサーの進行、カメラコントロールの更新（例えば、ユーザーのインタラクションに応じた視点変更）など
 * - render(): シーンとカメラの現在の状態をもとに画面を描画。rendererは全scene共通(インスタンスは一つだけ)
 */
class RenderLoop 
{
	static instance = null;

	constructor(pong) 
	{
		if (!RenderLoop.instance) {
			this.pong = pong;
			RenderLoop.instance = this;
		}
		return RenderLoop.instance;
	}

	static getInstance(pong) 
	{
		if (!RenderLoop.instance) 
		{
			RenderLoop.instance = new RenderLoop(pong);
		} else {
			RenderLoop.instance.pong = pong;
		}
		return RenderLoop.instance;
	}

	loopStart() 
	{
		const animate = () => 
		{
			try {
				this.requestID = requestAnimationFrame(animate);
				if (DEBUG_FLOW) {	console.log('1 requestAnimationFrame');	}
				
				if (this.pong && this.pong.gameStateManager) {
					this.pong.gameStateManager.update();
					if (DEBUG_FLOW) {	console.log('2 requestAnimationFrame');	}
				}
				
				if (this.pong && this.pong.allScenesManager) {
					this.pong.allScenesManager.updateAllScenes();
					if (DEBUG_FLOW) {	console.log('3 requestAnimationFrame');	}
				}
				
				if (this.pong && this.pong.animationMixersManager) {
					this.pong.animationMixersManager.update(); 
					if (DEBUG_FLOW) {	console.log('4 requestAnimationFrame');	}
				}
				
				if (this.pong && this.pong.allScenesManager) {
					this.pong.allScenesManager.renderAllScenes(RendererManager.getRenderer());
					if (DEBUG_FLOW) {	console.log('5 requestAnimationFrame');	}
				}
							if (TEST_TRY1){	throw new Error('TEST_TRY1');	}
			} catch (error) {
				console.error('hth: RenderLoop.loopStart() failed', error);
				handleCatchError(error);
			}
		};
		animate();
	}

	/**
	 * this.requestID: requestAnimationFrame を呼び出したときに返されたIDが格納
	 * requestAnimationFrame: ブラウザの再描画タイミングに合わせて関数を実行するためのAPI
	 */
	loopStop()
	{
		try {
			if (this.requestID)
			{
				// 指定されたIDのアニメーションフレームリクエストをキャンセル
				cancelAnimationFrame(this.requestID);
				this.requestID = null;
			}
						if (TEST_TRY2){	throw new Error('TEST_TRY2');	}
		} catch (error) {
			console.error('hth: loopStop() failed', error);
			// この場合、ゲームが異常状態で継続する可能性があるのでリセットする
			handleCatchError(error);
		}

	}

	dispose() 
	{
		try {
			this.loopStop();
			this.pong = null;
			RenderLoop.instance = null;
						if (TEST_TRY3){	throw new Error('TEST_TRY3');	}
		} catch (error) {
			console.error('hth: dispose() failed', error);
			handleCatchError(error);
		}
	}
}

export default RenderLoop;
