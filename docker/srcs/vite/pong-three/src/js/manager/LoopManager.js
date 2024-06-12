import RendererManager from "./RendererManager";

const DEBUG_FLOW = 1;
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
		}
		return RenderLoop.instance;
	}

	start() 
	{
		const animate = () => 
		{
						// if (DEBUG_FLOW) {	console.log('requestAnimationFrame');	}
			
			this.requestID = requestAnimationFrame(animate);
				if (DEBUG_FLOW) {	console.log('1 requestAnimationFrame');	}
			this.pong.gameStateManager.update();
				if (DEBUG_FLOW) {	console.log('2 requestAnimationFrame');	}
			this.pong.allScenesManager.updateAllScenes();
				if (DEBUG_FLOW) {	console.log('3 requestAnimationFrame');	}
			this.pong.animationMixersManager.update(); 
				if (DEBUG_FLOW) {	console.log('4 requestAnimationFrame');	}
			this.pong.allScenesManager.renderAllScenes(RendererManager.getRenderer())
				if (DEBUG_FLOW) {	console.log('5 requestAnimationFrame');	}
		};
		animate();
	}

	stop()
	{
		if (this.requestID)
		{
			cancelAnimationFrame(this.requestID);
			this.requestID = null;
		}
	}
}

export default RenderLoop;
