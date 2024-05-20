// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineSyncWS.js
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
		this.clientApp			= clientApp;
		this.gameStateManager	= gameStateManager;
		this.socketUrl			= socketUrl;
		this.gameLoopStarted	= false;

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


	/** dev用 再接続チェック用 */
	devTestCloseButton()
	{
		this.clientApp.createButton('Test Close WebSocket', 'hth-pong-online-close-ws-btn', () => {
			this.socket.close();
		});
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
					window.addEventListener('resize', () => this.resizeForAllDevices());
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
		this.resizeForAllDevices();
	}

	// ウインドウのサイズに合わせて動的に描画サイズを変更
	resizeForAllDevices() 
	{
		// ブラウザウィンドウの寸法を使用
		this.canvas.width		= window.innerWidth;
		this.canvas.height		= window.innerHeight;
		// 幅と高さの両方に基づいてズームレベルを計算
		let zoomLevelWidth		= this.canvas.width / this.field.width;
		let zoomLevelHeight		= this.canvas.height / this.field.height;
		// 制約が最も厳しい側（小さい方のスケール）を使用
		this.field.zoomLevel	= Math.min(zoomLevelWidth, zoomLevelHeight);
		// debug---
		// console.log(this.canvas.width, zoomLevelWidth);
		// console.log(this.canvas.height, zoomLevelHeight);
		// console.log(this.field.zoomLevel);
		// ---
		// 元の状態（リセット状態）に戻す
		// 1,0,0,1,0,0 スケーリングを変更せず、回転もせず、平行移動も加えない
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		// 平行移動 キャンバスの中心を0,0とするための座標変換
		this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
		// 拡大縮小
		this.ctx.scale(this.field.zoomLevel, this.field.zoomLevel);
		// 終了時の描画状態（スコア表示）を維持する: 状態の更新を強制するために再描画をトリガーする
		const state = this.gameStateManager.getState();
		if (state && 
			(state.state.score1 > 0 || state.state.score2 > 0) &&
			!this.gameStateManager.getIsGameLoopStarted())
		{
			setTimeout(() => {
				PongOnlineRenderer.render(this.ctx, this.field, this.gameStateManager.getState());
			}, 16);
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
		this.clientApp.createButton('Back to Home', 'hth-pong-online-back-to-home-Btn', () => {
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
				this.clientApp.setupWebSocketConnection();
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

