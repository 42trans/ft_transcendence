// docker/srcs/uwsgi-django/pong/static/pong/js/online/duel/PongOnlineDuelSyncWS.js
import PongOnlineDuelPaddleMover from "./PongOnlineDuelPaddleMover.js";
import PongOnlineDuelRenderer from "./PongOnlineDuelRenderer.js";
import PongOnlineDuelUtil from "./PongOnlineDuelUtil.js";

/**
 * WebSocketの接続、メッセージ送受信、再接続処理
 */
class PongOnlineDuelSyncWS 
{
	constructor(clientApp, gameStateManager, socketUrl) 
	{
		
		this.clientApp			= clientApp;
		this.gameStateManager	= gameStateManager;
		this.socketUrl			= socketUrl;
		this.socket				= clientApp.socket
		this.gameLoopStarted	= false;
		
		this.readyToSendNext	= true;

		this.isReconnecting				= false;
		this.reconnectAttempts			= 0;
		this.maxReconnectAttempts		= 5;
		this.reconnectIntervalMilliSec	= 3000;
		this.gameFPS					= 1;
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
		// console.log("onSocketMessage()", recvData);

		if (recvEvent.type === 'duel.waiting_opponent') {
			// console.log("waiting_opponent")
			this.showWaitingMessage();
		} else if (recvEvent.type === 'duel.both_players_entered_room') {
			console.log("duel.both_players_entered_room")
			console.log("recvData.paddle:", recvData.paddle)
			PongOnlineDuelUtil.removeMessage();
			this.gameStateManager.setPaddleOwnership(recvData.paddle);
			this.initStartButton();
		} else if (recvEvent.type === 'game_end') {
			console.log("end_game_state:", recvData.end_game_state)
			// 終了時のデータを保存（最終描画用）
			this.gameStateManager.updateState(recvData.end_game_state);
			this.gameStateManager.finalGameState = { ...this.gameStateManager.getState() };
			// ゲーム状態を初期化
			this.gameStateManager.resetState();
			this.clientApp.socket.close();
		} else if (recvEvent.type === 'game_state'){
			// console.log("recvData", recvData)
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
					this.clientApp.gameLoop.startGameLoop(this.gameFPS);
				}
			} catch (error) {
				console.error("Error:", error);
			}
		} else {
			// console.error("Invalid data:", recvData);
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
		// console.log('this.field: ', this.field);
		PongOnlineDuelUtil.resizeForAllDevices(this.ctx, this.gameStateManager.getState(), this.canvas, this.gameStateManager);
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
		}
	}

	onSocketClose(event) {
		console.error("WebSocket connection closed:", event.reason, "Code:", event.code);
		// PongOnlineDuelUtil.attemptReconnect();
	}
	
	onSocketError(event) {
		console.error("WebSocket error:", event);
	}

}

export default PongOnlineDuelSyncWS;

