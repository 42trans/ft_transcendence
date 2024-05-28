// docker/srcs/uwsgi-django/pong/static/pong/js/online/duel/PongOnlineDuelGameLoopHandler.js
import PongOnlineDuelPaddleMover from "./PongOnlineDuelPaddleMover.js";
import PongOnlineDuelRenderer from "./PongOnlineDuelRenderer.js";
import PongOnlineDuelUtil from "./PongOnlineDuelUtil.js";

/**
 */
class PongOnlineDuelGameLoopHandler 
{
	constructor(clientApp, gameStateManager, syncWS) 
	{
		this.clientApp			= clientApp;
		this.gameStateManager	= gameStateManager;
		this.syncWS				= syncWS;
		this.gameLoopStarted	= gameStateManager.gameLoopStarted;
		this.socket				= clientApp.socket
		// フレームIDを保存するためのプロパティ
		this.animationFrameId 	= null; 
	}

	stopGameLoop() {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
		}
		this.gameLoopStarted = false;
	}
	
	// 更新: default 30 fps 
	startGameLoop(gameFPS = 30) {
		if (this.gameLoopStarted) {
			// すでにゲームループが起動していれば、先に停止
			this.stopGameLoop();
		}
		this.gameLoopStarted = true;
		// 目標フレーム時間（ミリ秒）
		const desiredFrameTimeMs = 1000 / gameFPS;
		// 前回のフレーム時間
		let lastFrameTimeMs = 0; 

		const loop = (timestamp) => {
			// ループ終了条件
			if (!this.gameLoopStarted) 
			{ 
				cancelAnimationFrame(this.animationFrameId); 
				// ループを終了
				return;
			}
			const gameState = this.gameStateManager.getState();

			if (gameState && gameState.is_running) {
				// 目標フレーム時間よりも経過時間が短い場合は、次のフレームを待つ
				const elapsedTimeMs = timestamp - lastFrameTimeMs;
				if (elapsedTimeMs < desiredFrameTimeMs) {
					this.animationFrameId = requestAnimationFrame(loop);
					return;
				}
				this.field	= this.gameStateManager.getState().game_settings.field;
				// パドル情報更新
				PongOnlineDuelPaddleMover.handlePaddleMovement(this.field, gameState, this.gameStateManager);
				// ゲーム状態送信
				this.sendClientState(gameState);
				// 2D描画
				PongOnlineDuelRenderer.render(this.syncWS.ctx, this.field, gameState);

				lastFrameTimeMs = timestamp;
			}else if (!gameState.is_running) {
				// 終了時
				console.log("!gameState.is_running()", this.gameStateManager.getFinalState());
				// this.clientApp.socket.close();
				// 最終スコアの表示
				PongOnlineDuelRenderer.render(this.syncWS.ctx, this.field, this.gameStateManager.getFinalState());
				window.addEventListener('resize', () => 
					PongOnlineDuelUtil.resizeForAllDevices(
						this.syncWS.ctx, 
						this.gameStateManager.getFinalState(), 
						this.syncWS.canvas,
						this.gameStateManager
					));
				// ゲーム終了時に Back to Home ボタンリンクを表示する
				this.createEndGameButton();
			} else {
				// 次のフレームを要求
				this.animationFrameId = requestAnimationFrame(loop);
			}
		};

		// 最初のフレームを要求
		this.animationFrameId = requestAnimationFrame(loop);
	}


	// ゲーム終了時に Back to Home ボタンリンクを表示する
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

