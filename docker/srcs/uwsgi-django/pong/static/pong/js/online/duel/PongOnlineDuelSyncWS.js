// docker/srcs/uwsgi-django/pong/static/pong/js/online/duel/PongOnlineDuelSyncWS.js
import PongOnlineDuelPaddleMover from "./PongOnlineDuelPaddleMover.js";
import PongOnlineDuelRenderer from "./PongOnlineDuelRenderer.js";
import PongOnlineDuelUtil from "./PongOnlineDuelUtil.js";

class PongOnlineDuelSyncWS 
{
	constructor(clientApp, gameStateManager, socketUrl) 
	{
		this.clientApp			= clientApp;
		this.gameStateManager	= gameStateManager;
		this.socketUrl			= socketUrl;
		this.gameLoopStarted	= false;
		
		this.readyToSendNext	= true;

		this.isReconnecting				= false;
		this.reconnectAttempts			= 0;
		this.maxReconnectAttempts		= 5;
		this.reconnectIntervalMilliSec	= 3000;
		this.gameFPS					= 30;
						// TODO_fr: 本番時削除
						PongOnlineDuelUtil.devTestCloseButton();
	}
	// ------------------------------
	// ルーチン:受信
	// ------------------------------
	// サーバーからメッセージが届いた場合の処理
	onSocketMessage(event) 
	{
		// console.log("onSocketMessage()", event);
		const recvEvent = JSON.parse(event.data);
		const recvData = recvEvent.data;
		// console.log("onSocketMessage()", recvEvent);
		// console.log("onSocketMessage()", recvData);

		if (recvEvent.type === 'duel.waiting_opponent') {
			// console.log("waiting_opponent")
			this.showWaitingMessage();
		} else if (recvEvent.type === 'duel.both_players_entered_room') {
			console.log("duel.both_players_entered_room")
			console.log("recvData.paddle", recvData.paddle)
			PongOnlineDuelUtil.removeMessage();
			this.gameStateManager.setPaddleOwnership(recvData.paddle);
			this.initStartButton();
		} else if (recvEvent.type === 'game_end') {
			console.log("game end 1");
			// 終了時のデータを保存（最終描画用）
			this.gameStateManager.finalGameState = { ...this.gameStateManager.getState() };
			// ゲーム状態を初期化
			this.gameStateManager.resetState();
			this.clientApp.socket.close();
			// PongOnlineDuelUtil.attemptReconnect();
			console.log("game end 2");
		} else if (recvEvent.type === 'game_state'){
			console.log("recvData", recvData)
			try {
				// 再接続の場合: 何もしない
				if (this.isReconnecting) 
				{
					// console.log("reconnect--------");
					// クライアント（.js, ブラウザ）のデータで上書きするのでここでは更新しない
					this.isReconnecting = false;
				} else {
					// ルーチン: 受信データで更新
					this.gameStateManager.updateState(recvData);
				}
				
				// 初回の場合: ループ開始前　
				if (!this.gameLoopStarted) 
				{
					// gameStateに関するjsonを受信してから、loopを起動
					// 受信データからフィールドのサイズを取得してCanvasを初期化
					this.initCanvas(recvData.field);
					window.addEventListener('resize', () => 
						PongOnlineDuelUtil.resizeForAllDevices(
							this.ctx, 
							this.gameStateManager.getState(), 
							this.canvas,
							this.gameStateManager
						));
					this.startGameLoop(this.gameFPS);
				}
			} catch (error) {
				console.error("Error:", error);
			}
		} else {
			console.error("Invalid data:", recvData);
		}
		this.readyToSendNext = true;
	}


	// ゲーム開始OKを意味するスタートボタン
	initStartButton() 
	{
		PongOnlineDuelUtil.createButton('Start Game', 'hth-pong-online-start-game-btn', () => {
			const startMsg = JSON.stringify({ action: "start" });
			// console.log("send: action: start: ", startMsg);
			this.socket.send(startMsg);
			document.getElementById('hth-pong-online-start-game-btn').remove();
		});
	}

	showWaitingMessage() {
		const waitingMessage = document.createElement('div');
		waitingMessage.id = 'hth-pong-duel-waiting-message';
		waitingMessage.classList.add('.hth-transparent-black-bg-color',  'slideup-text');
		waitingMessage.textContent = 'Incoming hotshot! Better get your game face on...';
		document.getElementById('hth-main').appendChild(waitingMessage);
	}
	
	initCanvas()
	{
		// console.log("initCanvas()");
		this.canvasId	= "pong-online-duel-canvas-container"
		this.canvas 	= document.getElementById(this.canvasId);
		if (!this.canvas.getContext) {
			return;
		}
		this.ctx		= this.canvas.getContext("2d");
		this.field		= this.gameStateManager.getState().game_settings.field;
		console.log('this.field: ', this.field);
		PongOnlineDuelUtil.resizeForAllDevices(this.ctx, this.gameStateManager.getState(), this.canvas, this.gameStateManager);
	}
	
	// 更新: default 30 fps 
	startGameLoop(fps = 30) {
		this.gameLoopStarted = true;

		// 目標フレーム時間（ミリ秒）
		const desiredFrameTimeMs = 1000 / fps;
		// 前回のフレーム時間
		let lastFrameTimeMs = 0; 

		const loop = (timestamp) => {
			const gameState = this.gameStateManager.getState();

			if (gameState && gameState.is_running) {
				const elapsedTimeMs = timestamp - lastFrameTimeMs;

				// 目標フレーム時間よりも経過時間が短い場合は、次のフレームを待つ
				if (elapsedTimeMs < desiredFrameTimeMs) {
					requestAnimationFrame(loop);
					return;
				}

				// パドル情報更新
				PongOnlineDuelPaddleMover.handlePaddleMovement(this.field, gameState, this.gameStateManager);
				// ゲーム状態送信
				this.sendClientState(gameState);
				// 2D描画
				PongOnlineDuelRenderer.render(this.ctx, this.field, gameState);

				lastFrameTimeMs = timestamp;
			}

			// 終了時
			if (!gameState.is_running) {
				// 最終スコアの表示
				PongOnlineDuelRenderer.render(this.ctx, this.field, this.gameStateManager.getFinalState());
				window.addEventListener('resize', () => 
					PongOnlineDuelUtil.resizeForAllDevices(
						this.ctx, 
						this.gameStateManager.getFinalState(), 
						this.canvas,
						this.gameStateManager
					));
				// ゲーム終了時に Back to Home ボタンリンクを表示する
				this.createEndGameButton();
			} else {
				// 次のフレームを要求
				requestAnimationFrame(loop);
			}
		};

		// 最初のフレームを要求
		requestAnimationFrame(loop);
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
			this.readyToSendNext === true) 
		{
			// 更新時:

			const dataToSend = JSON.stringify
			({
				action: "update", 
				...gameState
			});
	
			// console.log("Sending data to server:", JSON.stringify(dataToSend, null, 2));
			this.socket.send(dataToSend);
			this.readyToSendNext = false;
		} else {
			// 遅延もあるのでエラー出力ではない
			console.log("sendClientState() failed:");
		}
	}
	// ------------------------------
	// 非ルーチンなデータ受信時のメソッド
	// ------------------------------
	onSocketOpen() 
	{
		if (this.isReconnecting)
		{
			// 再接続時の処理
			console.log("WebSocket connection re-established.");
			const initData = JSON.stringify
			({
				action: "reconnect",
				...this.gameStateManager.getState() 
			});
			// console.log("Sending data to server:", JSON.stringify(dataToSend, null, 2));
			this.socket.send(initData);
			// 接続成功時に再接続試行回数をリセット
			this.reconnectAttempts = 0;
		} else {
			// 初回の接続時:
			console.log("WebSocket connection established.");
			// const initData = JSON.stringify({ action: "initialize" });
			// this.socket.send(initData);
		}
	}

	onSocketClose(event) {
		console.error("WebSocket connection closed:", event.reason, "Code:", event.code);
		PongOnlineDuelUtil.attemptReconnect();
	}
	
	onSocketError(event) {
		console.error("WebSocket error:", event);
	}

}

export default PongOnlineDuelSyncWS;

