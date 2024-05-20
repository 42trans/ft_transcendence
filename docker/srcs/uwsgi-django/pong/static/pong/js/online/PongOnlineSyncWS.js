// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineSyncWS.js
import PongOnlineClientApp from "./PongOnlineClientApp.js";
import PongOnlinePaddleMover from "./PongOnlinePaddleMover.js";
import PongOnlineRenderer from "./PongOnlineRenderer.js";

/**
 * Websocketのイベントで動くメソッドを担当
 * 
 * ## クライアント側の処理の流れ
 * - Startボタンをクリック: websocket接続処理開始
 * - 最初のonopen: 「受信した合図(action: "initialize")」を送信
 * - 初回のonmessage: main loop 開始
 * - loop内で送信, 送信後に「送信準備可能フラグ」を折る
 * - 次回のonmessage: サーバーから受信した後、「送信準備可能フラグ」を立てる
 * - ※フラグの目的: クライアントからの送信に制限をかける
 */
class PongOnlineSyncWS 
{
	constructor(clientApp, gameStateManager, socketUrl) 
	{
		this.socketUrl			= socketUrl;
		this.gameStateManager	= gameStateManager;
		this.clientApp			= clientApp;
		this.gameLoopStarted	= false;
		// サーバーから受信してから次のリクエストを送信するためのフラグ
		this.readyToSendNext	= true;

		// 再接続用の変数
		// 単位: ミリ秒
		this.reconnectInterval = 3000; 
		this.reconnectAttempts = 0;
		this.maxReconnectAttempts = 5;

		// websocket接続開始のためのスタートボタン
		this.initStartButton();

						// TODO_fr: 本番時削除
						// dev用 websocket接続を閉じるためのボタン
						this.devTestCloseButton();
	}

	initStartButton() 
	{
		const startBtn			= document.createElement('button');
		startBtn.textContent	= 'Start Game';
		startBtn.id				= 'hth-pong-online-start-game-btn'
		startBtn.classList.add('hth-btn');
		document.getElementById('hth-main').appendChild(startBtn);
		startBtn.addEventListener('click', () => {
			// クリックされたら接続を開始
			this.setupWebSocketConnection();
			startBtn.remove();
		});
	}

	/** dev用 再接続チェック用 */
	devTestCloseButton()
	{
		const closeBtn			= document.createElement('button');
		closeBtn.textContent	= 'Test Close WebSocket';
		closeBtn.id				= 'hth-pong-online-close-ws-btn';
		closeBtn.classList.add('hth-btn');
		document.getElementById('hth-main').appendChild(closeBtn);
		closeBtn.addEventListener('click', () => {
			// クリックされたら接続を閉じる
			this.socket.close();
		});
	}

	/** Start buttonをクリックしてからWebsocket接続 */
	setupWebSocketConnection()
	{
		this.socket				= new WebSocket(this.socketUrl);

		// ルーチン
		this.socket.onmessage	= (event) => this.onSocketMessage(event);
		// 初回のみ
		this.socket.onopen		= () => this.onSocketOpen();
		// エラー時
		this.socket.onclose		= (event) => this.onSocketClose(event);
		this.socket.onerror		= (event) => this.onSocketError(event);
	}

	// ------------------------------
	// ルーチン:受信
	// ------------------------------
	// サーバーからメッセージが届いた場合の処理
	onSocketMessage(event) 
	{
		// console.log("onSocketMessage()", event);
		const recvData = JSON.parse(event.data);
		if (recvData && recvData.objects && recvData.state)
		{
			try {
				this.gameStateManager.updateState(recvData);
				// 初回のgameStateに関するjsonを受信してから、loopが起動
				if (!this.gameLoopStarted) {
					this.startGameLoop();
				}
			} catch (error) {
				console.error("Error:", error);
			}
			this.readyToSendNext = true;
		} else {
			console.error("Invalid data:", recvData);
		}
	}

	startGameLoop() {
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
				// パドル情報更新
				PongOnlinePaddleMover.handlePaddleMovement(this.clientApp.field, gameState);
				// ゲーム状態送信
				this.sendClientState(gameState);
				// 2D描画
				PongOnlineRenderer.render(this.clientApp.ctx, this.clientApp.field, gameState);
			}
			// 終了時
			if (!gameState.is_running) 
			{
				// 最終スコアの表示: 終了フラグ受信後に、最後に一度だけ描画する
				PongOnlineRenderer.render(this.clientApp.ctx, this.clientApp.field, this.gameStateManager.getState());
				this.createEndGameButton();
				clearInterval(intervalId);
			}
		}, 1000 / 30);
	}

	// ゲーム終了時に Back to Home ボタンリンクを表示する
	createEndGameButton() {
		const backToHomeBtn			= document.createElement('button');
		backToHomeBtn.id			= 'hth-pong-online-back-to-home-Btn';
		backToHomeBtn.textContent	= 'Back to Home';
		backToHomeBtn.classList.add('hth-btn');
		document.getElementById('hth-main').appendChild(backToHomeBtn);
		backToHomeBtn.addEventListener('click', () => {
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
			// console.log("Sending data to server:", JSON.stringify(gameState, null, 2));
			this.socket.send(JSON.stringify(gameState));
			this.readyToSendNext = false;
		} else {
			console.log("sendClientState() failed:");
		}
	}
	// ------------------------------
	// 非ルーチンなデータ受信時のメソッド
	// ------------------------------
	onSocketOpen() 
	{
		console.log("WebSocket connection established.");
		const initData = JSON.stringify({ action: "initialize" });

		this.socket.send(initData);
		// console.log("initData: ", initData);

		// 接続成功時に再接続試行回数をリセット
		this.reconnectAttempts = 0;
	}
	onSocketClose(event) 
	{
		console.error("WebSocket connection closed:", event.reason, "Code:", event.code);
		this.attemptReconnect();
	}
	
	/** close時: 自動再接続 */
	attemptReconnect() {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			setTimeout(() => {
				this.setupWebSocketConnection();
				this.reconnectAttempts++;
			}, this.reconnectInterval);
		} else {
			console.error("Max reconnect attempts reached.");
			// 最大試行回数に達したらリセット
			this.reconnectAttempts = 0;
		}
	}

	onSocketError(event) {
		console.error("WebSocket error:", event);
	}

}

export default PongOnlineSyncWS;

