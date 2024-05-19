// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineSyncWS.js
import PongOnlineClientApp from "./PongOnlineClientApp.js";
import PongOnlinePaddleMover from "./PongOnlinePaddleMover.js";
import PongOnlineRenderer from "./PongOnlineRenderer.js";

/**
 * Websocketのイベントで動くメソッドを担当
 */
class PongOnlineSyncWS 
{
	constructor(pongOnlineClientApp, gameStateManager, socket) 
	{
		this.socket					= socket;
		this.gameStateManager		= gameStateManager;
		this.pongOnlineClientApp	= pongOnlineClientApp;
		this.gameLoopStarted		= false;
		this.webSocketEvents();
	}

	// サーバーからの通信によって処理を行う
	webSocketEvents() 
	{
		this.socket.onmessage	= (event) => this.onSocketMessage(event);
		this.socket.onopen		= () => this.onSocketOpen();
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
			try 
			{
				this.gameStateManager.updateState(recvData);
				if (!this.gameLoopStarted) 
				{
					this.gameLoop();
					this.gameLoopStarted = true;
				}

			} catch (error) {
				console.error("Error:", error);
			}
			
		} else {
			console.error("Invalid data:", recvData);
		}
	}

	// 30fpsで更新・描画する
	gameLoop() 
	{
		// 参考:【clearInterval() - Web API | MDN】 <https://developer.mozilla.org/ja/docs/Web/API/clearInterval>
		const intervalId = setInterval(() => 
		{
			if (this.gameStateManager.getState() && this.gameStateManager.getState().is_running) {
				// パドル情報更新
				PongOnlinePaddleMover.handlePaddleMovement(this.pongOnlineClientApp.field, this.gameStateManager.getState());
				// ゲーム状態送信
				this.sendClientState(this.gameStateManager.getState());
				// 2D描画
				PongOnlineRenderer.render(this.pongOnlineClientApp.ctx, this.pongOnlineClientApp.field, this.gameStateManager.getState());
			}
			// 終了時
			if (!this.gameStateManager.getState().is_running) 
			{
				// 最終スコアの表示: 終了フラグ受信後に、最後に一度だけ描画する
				PongOnlineRenderer.render(this.pongOnlineClientApp.ctx, this.pongOnlineClientApp.field, this.gameStateManager.getState());
				this.createEndGameButton();
				clearInterval(intervalId);
			}
		}, 1000 / 30);
	}

	// ゲーム終了時に Back to Home ボタンリンクを表示する
	createEndGameButton() {
		const backToHomeBtn = document.createElement('button');
		backToHomeBtn.id = 'hth-pong-online-back-to-home-Btn';
		backToHomeBtn.classList.add('hth-btn');
		backToHomeBtn.textContent = 'Back to Home';
		backToHomeBtn.addEventListener('click', () => {
			window.location.href = '/pong/';
		});
		document.getElementById('hth-main').appendChild(backToHomeBtn);
	}
	// ------------------------------
	// ルーチン:送信　※gameLoop() から呼ばれる
	// ------------------------------
	sendClientState(gameState) 
	{
		if (this.socket.readyState === WebSocket.OPEN) {
			// console.log("Sending data to server:", JSON.stringify(gameState, null, 2));
			this.socket.send(JSON.stringify(gameState));
		} else {
			console.error("WebSocket is not open:", this.socket.readyState);
		}
	}
	// ------------------------------
	// 非ルーチンなデータ受信時のメソッド
	// ------------------------------
	onSocketOpen() 
	{
		// console.log("WebSocket connection established.");
		const initData = JSON.stringify({ action: "initialize" });
		this.socket.send(initData);
		// console.log("initData: ", initData);
	}
	
	onSocketClose(event) {
		console.error("WebSocket connection closed:", event.reason, "Code:", event.code);
	}

	onSocketError(event) {
		console.error("WebSocket error:", event);
	}

}

export default PongOnlineSyncWS;

