// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineSyncWS.js
import PongOnlineClientApp from "./PongOnlineClientApp.js";

class PongOnlineSyncWS 
{
	// ------------------------------
	// 初期化
	// ------------------------------

	constructor(pongOnlineClientApp, gameState, socket) 
	{
		this.socket = socket;
		this.pongOnlineClientApp = pongOnlineClientApp;
		this.registerSocketEvents();
	}

	registerSocketEvents() {
		// 初回のみ
		this.socket.onopen = () => this.onSocketOpen();
		// ルーチン
		this.socket.onmessage = (event) => this.onSocketMessage(event);
		// エラーハンドリング
		this.socket.onclose = (event) => this.onSocketClose(event);
		this.socket.onerror = (event) => this.onSocketError(event);
	}


	// ------------------------------
	// ルーチン:受信
	// ------------------------------
	onSocketMessage(event) {
		// console.log("WebSocket onmessage.", event.data);
		const data = JSON.parse(event.data);
		// TODO_ft:負の値が入らないことを確認する
		// console.log("transformedData to client:", JSON.stringify(transformedData, null, 2));
		const transformedData = this.transformRecvData(data);
		this.applyGameState(transformedData);
	}

	applyGameState(transformedData) {
		if (!this.pongOnlineClientApp.gameState) {
			this.pongOnlineClientApp.gameState = {};
			// TODO_ft: main loopの位置がここになってしまった
			// main loop
			this.pongOnlineClientApp.gameLoop();
		}
		this.updateGameState(this.app.gameState, transformedData);
	}

	/**
	 * type:
		{
			"ball": {
				"radius": 5,
				"speed": 2.2,
				"position": {"x": 114.59999999999998, "y": 14.53999999999999},
				"direction": {"x": -1, "y": 0.1}
			},
			"paddle1": {
				"speed": 10,
				"dir_y": 0,
				"width": 10,
				"height": 30,
				"position": {"x": -140.0, "y": 0}
			},
			"paddle2": {
				"speed": 10,
				"dir_y": 0,
				"width": 10,
				"height": 30,
				"position": {"x": 140.0, "y": 0}
			},
			"score1": 0,
			"score2": 0
			}
	*/
	updateGameState(gameState, transformedData) 
	{
		gameState.ball = transformedData.ball;
		gameState.paddle1 = transformedData.paddle1;
		gameState.paddle2 = transformedData.paddle2;
		gameState.score1 = transformedData.score1;
		gameState.score2 = transformedData.score2;
	}


	// ------------------------------
	// ルーチン:送信
	// ------------------------------
	sendClientState(gameState) 
	{
		if (this.socket.readyState === WebSocket.OPEN) 
		{
			gameState.ball.position = this.toCenteredCoords(gameState.ball.position.x, gameState.ball.position.y, this.app.field);
			gameState.paddle1.position = this.toCenteredCoords(gameState.paddle1.position.x, gameState.paddle1.position.y, this.app.field);
			gameState.paddle2.position = this.toCenteredCoords(gameState.paddle2.position.x, gameState.paddle2.position.y, this.app.field);
			// console.log("Sending data to server:", JSON.stringify(gameState, null, 2));
			this.socket.send(JSON.stringify(gameState));
		} else {
			console.log("WebSocket is not open:", this.socket.readyState);
		}
	}


	// ------------------------------
	// 座標変換
	// ------------------------------

	// 座標を中心基準に変換する関数: サーバー側は中心が0,0
	toCenteredCoords(x, y, field) {
		return {
			x: x - field.width / 2,
			y: y - field.height / 2
		};
	}

	// 中心基準の座標をキャンバス基準に戻す関数: クライアント側は左上が0,0
	fromCenteredCoords(x, y, field) {
		return {
			x: x + field.width / 2,
			y: y + field.height / 2
		};
	}

	transformRecvData(data) {
		const ball = {
			direction: {
				x: data.ball.direction.x,
				y: data.ball.direction.y
			},
			position: this.fromCenteredCoords(data.ball.position.x, data.ball.position.y, this.app.field),
			radius: data.ball.radius,
			speed: data.ball.speed
		};
	
		const paddle1 = {
			speed: data.paddle1.speed,
			dir_y: data.paddle1.dir_y,
			width: data.paddle1.width,
			height: data.paddle1.height,
			position: this.fromCenteredCoords(data.paddle1.position.x, data.paddle1.position.y, this.app.field),
		};
	
		const paddle2 = {
			speed: data.paddle2.speed,
			dir_y: data.paddle2.dir_y,
			width: data.paddle2.width,
			height: data.paddle2.height,
			position: this.fromCenteredCoords(data.paddle2.position.x, data.paddle2.position.y, this.app.field),
		};
	
		const transformedData = {
			ball: ball,
			paddle1: paddle1,
			paddle2: paddle2,
			score1: data.score1,
			score2: data.score2
		};
	
		return transformedData;
	}

	// ------------------------------
	// 非ルーチンなデータ受信時のメソッド
	// ------------------------------
	onSocketOpen() {
		// console.log("WebSocket connection established.");
		const initData = JSON.stringify({ action: "initialize" });
		this.socket.send(initData);
	}
	
	onSocketClose(event) {
		console.error("WebSocket connection closed:", event.reason, "Code:", event.code);
	}

	onSocketError(event) {
		console.error("WebSocket error:", event);
	}

}

export default PongOnlineSyncWS;

