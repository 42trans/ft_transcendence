// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineGameLoopManager.js
import PongOnlinePaddleMover from "./PongOnlinePaddleMover.js";

// console.log: 出力=true、本番時はfalseに設定。0,1でも動く
let DEBUG_FLOW 		= 0;
let DEBUG_DETAIL 	= 0;
let TEST_TRY1 = 0;
let TEST_TRY2 = 0;
let TEST_TRY3 = 0;
/**
 */
class PongOnlineGameLoopManager 
{
	constructor(clientApp, gameStateManager) 
	{		
		this.renderer			= gameStateManager.renderer
		this.clientApp 			= clientApp
		this.gameStateManager	= gameStateManager

		this.animationFrameId	= null; 
	}

	
	startGameLoop(gameFPS) 
	{
				if (DEBUG_FLOW){	console.log("startGameLoop(): begin")	}
		
		// すでにゲームループが起動していれば、先に停止
		if (this.gameStateManager.isGameLoopStarted) {
			this.stopGameLoop();
		}
		
		this.gameStateManager.isGameLoopStarted = true;
		// 目標フレーム時間（ミリ秒）
		this.desiredFrameTimeMs = 1000 / gameFPS;
		this.lastFrameTimeMs	= performance.now(); 

				if (DEBUG_FLOW){	console.log("gameLoop(): begin")	}
		
		const gameLoop = () => 
		{
			try {
				const gameState	= this.gameStateManager.gameState;
				this.field		= this.gameStateManager.gameState.game_settings.field
				this.ctx		= this.gameStateManager.ctx
				this.canvas		= this.gameStateManager.canvas

				
				// ループ終了条件
				if (!this.gameStateManager.isGameLoopStarted) {
					return;
				}
				
				const currentTime = performance.now();
				const elapsed = currentTime - this.lastFrameTimeMs;
				// 目標フレーム時間よりも経過時間が短い場合は、次のフレームを待つ
				if (elapsed >= this.desiredFrameTimeMs) 
				{
					if (!gameState) {
						console.error("hth: gameState is null.");
						return;
					} 
					
					if (gameState.is_running) {
						PongOnlinePaddleMover.handlePaddleMovement(this.field, gameState);
						this.gameStateManager.sendClientState(gameState);
						this.renderer.render(this.ctx, this.field, gameState);
						// 描画した時点の時刻を登録
						this.lastFrameTimeMs = currentTime;
					} else {
						// 終了時
						if (DEBUG_DETAIL) {	console.log("gameLoop(): gameState", gameState);	}
						this.stopGameLoop(gameState);
					}
				}
				// 次のフレームを要求
				this.animationFrameId = requestAnimationFrame(gameLoop);

						if (TEST_TRY1){	throw new Error('TEST_TRY1');	}
			} catch(error) {
				console.error("hth: gameLoop error:", error);
				// this.stopGameLoop();
			}
		};
		// 最初のフレームを要求
		this.animationFrameId = requestAnimationFrame(gameLoop);
	}


	stopGameLoop(gameState) 
	{
				if (DEBUG_FLOW) {	console.log("stopGameLoop(): begin");	}

		try {
			// 最終スコアの描画: 終了フラグ受信後に、最後に一度だけ描画する（静止画像）
			this.renderer.render(this.ctx, this.field, gameState);

					if (TEST_TRY2){	throw new Error('TEST_TRY2');	}
		} catch(error) {
			console.error("hth: stopGameLoop():  renderer.render() failed:", error);
		}

		try {
			// ゲーム終了時に Back to Home ボタンリンクを表示する
			this.createEndGameButton();

					if (TEST_TRY3){	throw new Error('TEST_TRY3');	}
		} catch(error) {
			console.error("hth: stopGameLoop(): createEndGameButton() failed:", error);
		}

		// アニメーションを指定してキャンセル
		// 参考:【window.cancelAnimationFrame() - Web API | MDN】 <https://developer.mozilla.org/ja/docs/Web/API/Window/cancelAnimationFrame>
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
		// loopを止めるフラグ
		this.gameStateManager.isGameLoopStarted = false;

				if (DEBUG_FLOW) {	console.log("stopGameLoop(): end");	}
	}
	

	// ゲーム終了時に Back to Home ボタンリンクを表示する
	createEndGameButton() 
	{
		this.clientApp.createButton('Back to Home', 'hth-pong-online-back-to-home-Btn', () => {
			// TODO_ft:SPA
			window.location.href = '/pong/';
		});
	}

}

export default PongOnlineGameLoopManager;