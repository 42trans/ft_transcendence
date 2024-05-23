// docker/srcs/uwsgi-django/pong/static/pong/js/online/duel/PongOnlineDuelSyncWS.js
import PongOnlinePaddleMover from "../PongOnlinePaddleMover.js";
import PongOnlineRenderer from "../PongOnlineRenderer.js";
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
		this.isReconnecting = false;
		this.reconnectAttempts = 0;
		this.maxReconnectAttempts = 5;
		this.reconnectIntervalMilliSec = 3000;
						// TODO_fr: 本番時削除
						PongOnlineDuelUtil.devTestCloseButton();
	}
	// ------------------------------
	// ルーチン:受信
	// ------------------------------
	// サーバーからメッセージが届いた場合の処理
	onSocketMessage(event) 
	{
		console.log("onSocketMessage()", event);
		const recvData = JSON.parse(event.data);
		if (recvData.type === 'duel.waiting_opponent') {
			console.log("waiting_opponent")
			this.showWaitingMessage();
		} else if (recvData.type === 'duel.ready') {
			console.log("duel.ready")
			PongOnlineDuelUtil.hideWaitingMessage('waiting-message');
			this.initStartButton();
		} else if (recvData && recvData.objects && recvData.state){
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
					console.log("initCanvas()");

					// gameStateに関するjsonを受信してから、loopを起動
					// 受信データからフィールドのサイズを取得してCanvasを初期化
					this.initCanvas(recvData.field);
					window.addEventListener('resize', () => this.resizeForAllDevices());
					this.startGameLoop();
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
		this.canvasId	= "pong-online-canvas-container"
		this.canvas 	= document.getElementById(this.canvasId);
		if (!this.canvas.getContext) {
			return;
		}
		this.ctx		= this.canvas.getContext("2d");
		// TODO_Ft: serverからfieldの値を取得したい
		// this.field		= { width: 400, height: 300, zoomLevel: 1 };
		this.field		= this.gameStateManager.getState().game_settings.field;
		console.log('this.fie: ', this.field);
		PongOnlineDuelUtil.resizeForAllDevices(ctx, this.gameStateManager.getState());
	}


	startGameLoop() 
	{
		this.gameLoopStarted = true;
		this.gameLoop();
	}
	
	// 30~60fpsで更新・描画する
	gameLoop() 
	{
		// 参考:【clearInterval() - Web API | MDN】 <https://developer.mozilla.org/ja/docs/Web/API/clearInterval>
		const intervalId = setInterval(() => 
		{
			const gameState	= this.gameStateManager.getState();

			if (gameState && gameState.is_running) 
			{
				// console.log(this.reconnectGameState);
				// パドル情報更新
				PongOnlinePaddleMover.handlePaddleMovement(this.field, gameState);
				// ゲーム状態送信
				this.sendClientState(gameState);
				// 2D描画
				PongOnlineRenderer.render(this.ctx, this.field, gameState);
			}

			// 終了時
			if (!gameState.is_running) 
			{
				// 最終スコアの表示: 終了フラグ受信後に、最後に一度だけ描画する
				PongOnlineRenderer.render(this.ctx, this.field, this.gameStateManager.getState());

				 // ゲーム終了時に Back to Home ボタンリンクを表示する
				this.createEndGameButton();
				clearInterval(intervalId);
			}
		}, 1000 / 30);
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
			// action: "initialize"のみ
			// const initData = JSON.stringify({ action: "initialize" });
			// console.log("initData: ", initData);
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

