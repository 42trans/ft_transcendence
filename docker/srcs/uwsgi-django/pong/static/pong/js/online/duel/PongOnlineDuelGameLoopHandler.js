// docker/srcs/uwsgi-django/pong/static/pong/js/online/duel/PongOnlineDuelGameLoopHandler.js
import PongOnlineDuelPaddleMover from "./PongOnlineDuelPaddleMover.js";
import PongOnlineDuelRenderer from "./PongOnlineDuelRenderer.js";
import PongOnlineDuelUtil from "./PongOnlineDuelUtil.js";

class PongOnlineDuelGameLoopHandler 
{
	constructor(clientApp, gameStateManager, syncWS) 
	{
		this.clientApp			= clientApp;
		this.gameStateManager	= gameStateManager;
		this.syncWS				= syncWS;
		this.socket				= clientApp.socket
		this.animationFrameId 	= null; 
	}

	stopGameLoop() 
	{
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
		}
		this.gameStateManager.gameLoopStarted = false;
	}
	
	// 更新: default 30 fps 
	startGameLoop(gameFPS = 30) 
	{
		// すでにゲームループが起動していれば、先に停止
		if (this.gameStateManager.gameLoopStarted) {
			this.stopGameLoop();
		}

		// 変数宣言
		this.gameStateManager.gameLoopStarted = true;
		// 目標フレーム時間（ミリ秒）
		const desiredFrameTimeMs = 1000 / gameFPS;
		let lastFrameTimeMs = 0; 

		// ------------------------------------------------
		// ここから繰り返し処理
		// ------------------------------------------------
		const gameLoop = (timestamp) => 
		{
			// ループ終了条件
			if (!this.gameStateManager.gameLoopStarted) 
			{ 
				cancelAnimationFrame(this.animationFrameId); 
				return;
			}
			
			// ルーチン：更新
			const gameState = this.gameStateManager.getState();
			if (gameState && gameState.is_running) 
			{
				this.updateRunningGame(timestamp, gameState, desiredFrameTimeMs, lastFrameTimeMs);
			}else if (gameState && !gameState.is_running) {
				// 終了時
				console.log("!gameState.is_running()", this.gameStateManager.getFinalState());
				this.handleLoopGameEnd(gameState);
			} else {
				// gameStateがnullの場合のエラー処理
				console.error("gameState is null. Unexpected error.");
			}

			// 次のフレームを要求
			this.animationFrameId = requestAnimationFrame(gameLoop);	
		};
		// ------------------------------------------------
		// ここまで処理して、最初に戻る
		// ------------------------------------------------

		// 最初のフレームを要求
		this.animationFrameId = requestAnimationFrame(gameLoop);
	}

	updateRunningGame(timestamp, gameState, desiredFrameTimeMs, lastFrameTimeMs) 
	{
		// 目標フレーム時間よりも経過時間が短い場合は、次のフレームを待つ
		const timeSinceLastFrameMs = timestamp - lastFrameTimeMs;
		if (timeSinceLastFrameMs < desiredFrameTimeMs) {
			// 次のフレームを待つ
			return;
		}

		this.field	= gameState.game_settings.field;
		// パドル操作
		PongOnlineDuelPaddleMover.handlePaddleMovement(this.field, gameState, this.gameStateManager);
		// サーバーに送信
		this.sendClientState(gameState);
		// ブラウザに描画
		PongOnlineDuelRenderer.render(this.gameStateManager.ctx, this.field, gameState);
		// 描画した時点の時刻を登録
		lastFrameTimeMs = timestamp;
	}

	handleLoopGameEnd(gameState)
	{
		// 最終スコアの描画
		PongOnlineDuelRenderer.render(this.gameStateManager.ctx, this.field, gameState);
		// ゲーム終了時に Back to Home ボタンリンクを表示する
		this.createEndGameButton();
		this.stopGameLoop();
		this.clientApp.socket.close();
	}

	/**  ゲーム終了時に Back to Home ボタンリンクを表示する */
	createEndGameButton() 
	{
		PongOnlineDuelUtil.createButton('Back to Home', 'hth-pong-online-back-to-home-Btn', () => {
			window.location.href = '/pong/';
		});
	}
	// ------------------------------
	// ルーチン:送信　※gameLoop() から呼ばれる
	// ------------------------------
	sendClientState(gameState) 
	{
		if (this.socket.readyState === WebSocket.OPEN &&
			this.syncWS.readyToSendNext === true) 
		{
			// 更新処理:
			const dataToSend = JSON.stringify
			({
				action: "update", 
				...gameState
			});
			// console.log("Sending data to server:", JSON.stringify(dataToSend, null, 2));
			this.socket.send(dataToSend);
			this.syncWS.readyToSendNext = false;
		} else {
			// 遅延もあるのでエラー出力ではない
			// console.log("sendClientState() failed:");
		}
	}

}

export default PongOnlineDuelGameLoopHandler;

