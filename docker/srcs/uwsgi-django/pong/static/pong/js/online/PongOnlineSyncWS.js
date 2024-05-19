// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineSyncWS.js
import PongOnlineClientApp from "./PongOnlineClientApp.js";

class PongOnlineSyncWS 
{
	// ------------------------------
	// 初期化
	// ------------------------------
	constructor(pongOnlineClientApp, socket) 
	{
		this.socket = socket;
		this.pongOnlineClientApp = pongOnlineClientApp;
		this.gameLoopStarted = false;
		this.webSocketEvents();
	}

	webSocketEvents() 
	{
		// ルーチン: 受信
		this.socket.onmessage = (event) => this.onSocketMessage(event);

		// 初回のみ
		this.socket.onopen = () => this.onSocketOpen();
		// エラーハンドリング
		this.socket.onclose = (event) => this.onSocketClose(event);
		this.socket.onerror = (event) => this.onSocketError(event);
	}
	// ------------------------------
	// ルーチン:受信
	// ------------------------------
	onSocketMessage(event) 
	{
		// console.log("onSocketMessage()", event);
		const recvData = JSON.parse(event.data);
		if (!recvData || !recvData.objects || !recvData.state) {
			console.error("Invalid data:", recvData);
			return;
		}
		
		try {
			this.pongOnlineClientApp.gameState = recvData;
			// console.log("data client:", JSON.stringify(this.pongOnlineClientApp.gameState, null, 2));
			if (!this.gameLoopStarted) 
			{
				this.pongOnlineClientApp.gameLoop();
				this.gameLoopStarted = true;
			}
		} catch (error) {
			console.error("Error:", error);
		}
	}
	// ------------------------------
	// ルーチン:送信　※loopで呼び出し
	// ------------------------------
	sendClientState(gameState) 
	{
		if (this.socket.readyState === WebSocket.OPEN) 
		{
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
		console.log("WebSocket connection established.");
		const initData = JSON.stringify({ action: "initialize" });
		this.socket.send(initData);
		console.log("initData: ", initData);
	}
	
	onSocketClose(event) 
	{
		console.error("WebSocket connection closed:", event.reason, "Code:", event.code);
	}

	onSocketError(event) 
	{
		console.error("WebSocket error:", event);
	}

}

export default PongOnlineSyncWS;

