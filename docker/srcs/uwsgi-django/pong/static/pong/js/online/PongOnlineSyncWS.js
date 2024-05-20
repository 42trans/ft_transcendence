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

		// websocket接続開始のためのスタートボタン
		this.initStartButton();

		// サーバーから受信してから次のリクエストを送信するためのフラグ
		this.readyToSendNext	= true;

		// 再接続用のフラグ・変数
		this.isReconnecting = false;
		this.reconnectAttempts = 0;
		this.maxReconnectAttempts = 5;
		// 単位: ミリ秒
		this.reconnectInterval = 3000;

						// TODO_fr: 本番時削除
						// dev用 websocket接続を閉じるためのボタン
						this.devTestCloseButton();
						
	}

	createButton(text, id, onClickHandler) 
	{
		const button = document.createElement('button');
		button.textContent = text;
		button.id = id;
		button.classList.add('hth-btn');
		document.getElementById('hth-main').appendChild(button);
		button.addEventListener('click', onClickHandler);
	}

	initStartButton() 
	{
		this.createButton('Start Game', 'hth-pong-online-start-game-btn', () => {
			this.setupWebSocketConnection();
			document.getElementById('hth-pong-online-start-game-btn').remove();
		});
	}

	// // ゲーム終了時に Back to Home ボタンリンクを表示する
	createEndGameButton() 
	{
		this.createButton('Back to Home', 'hth-pong-online-back-to-home-Btn', () => {
			window.location.href = '/pong/';
		});
	}

	/** dev用 再接続チェック用 */
	devTestCloseButton()
	{
		this.createButton('Test Close WebSocket', 'hth-pong-online-close-ws-btn', () => {
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
				// 再接続時の場合、クライアント（.js, ブラウザ）のデータで上書き
				if (this.isReconnecting) {
					// console.log("reconnect--------");
					this.isReconnecting = false;
				} else {
					this.gameStateManager.updateState(recvData);
				}

				// this.gameStateManager.updateState(recvData);
				// 初回のgameStateに関するjsonを受信してから、loopを起動
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

				 // ゲーム終了時に Back to Home ボタンリンクを表示する
				this.createEndGameButton();
				clearInterval(intervalId);
			}
		}, 1000 / 30);
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
		console.log("WebSocket connection established.");
		// 初回 or 再接続時(wsがサーバーによって予期せずcloseされた後) の判定
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
			
			// action: "initialize"のみ
			const initData = JSON.stringify({ action: "initialize" });
			// console.log("initData: ", initData);
			this.socket.send(initData);
		}
	}

	onSocketClose(event) 
	{
		console.error("WebSocket connection closed:", event.reason, "Code:", event.code);
		this.attemptReconnect();
	}
	
	/** close時: 自動再接続 */
	attemptReconnect() 
	{
		// 再接続処理中を表すフラグを立てる
		this.isReconnecting = true;
		// コンストラクタで指定した回数試みる
		if (this.reconnectAttempts < this.maxReconnectAttempts) 
		{
			setTimeout(() => 
			{
				this.setupWebSocketConnection();
				this.reconnectAttempts++;
			}, this.reconnectInterval);
		} else {
			console.error("Reconnect failed.");
			// 最大試行回数に達したらリセット
			this.reconnectAttempts = 0;
			this.isReconnecting = false;
		}
	}

	onSocketError(event) {
		console.error("WebSocket error:", event);
	}

}

export default PongOnlineSyncWS;

