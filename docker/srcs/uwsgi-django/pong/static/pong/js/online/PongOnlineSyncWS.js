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
		console.log("onSocketMessage()", event.data);
		const recvData = JSON.parse(event.data);
		// TODO_ft:負の値が入らないことを確認する
		const transformedData = this.transformRecvData(recvData.data);
		console.log("transformedData to client:", JSON.stringify(transformedData, null, 2));
		this.applyGameState(transformedData);
	}

	applyGameState(transformedData) {
		if (!this.pongOnlineClientApp.gameState) {
			this.pongOnlineClientApp.gameState = {};
			// TODO_ft: main loopの位置がここになってしまった
			// main loop
			this.pongOnlineClientApp.gameLoop();
		}
		this.updateGameState(this.pongOnlineClientApp.gameState, transformedData);
	}

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
	sendClientState(gameState) {
		if (this.socket.readyState === WebSocket.OPEN) {
			// オブジェクトのプロパティを明示的にコピーして新しいオブジェクトを作成
			var ballPosition = this.toCenteredCoords(gameState.ball.position.x, gameState.ball.position.y, this.pongOnlineClientApp.field);
			var paddle1Position = this.toCenteredCoords(gameState.paddle1.position.x, gameState.paddle1.position.y, this.pongOnlineClientApp.field);
			var paddle2Position = this.toCenteredCoords(gameState.paddle2.position.x, gameState.paddle2.position.y, this.pongOnlineClientApp.field);
	
			var gameStateObj = {
				objects: {
					ball: {
						direction: {
							x: gameState.ball.direction.x,
							y: gameState.ball.direction.y
						},
						position: {
							x: ballPosition.x,
							y: ballPosition.y
						},
						radius: gameState.ball.radius,
						speed: gameState.ball.speed
					},
					paddle1: {
						speed: gameState.paddle1.speed,
						dir_y: gameState.paddle1.dir_y,
						width: gameState.paddle1.width,
						height: gameState.paddle1.height,
						position: {
							x: paddle1Position.x,
							y: paddle1Position.y
						}
					},
					paddle2: {
						speed: gameState.paddle2.speed,
						dir_y: gameState.paddle2.dir_y,
						width: gameState.paddle2.width,
						height: gameState.paddle2.height,
						position: {
							x: paddle2Position.x,
							y: paddle2Position.y
						}
					}
				}
			};
	
			console.log("Sending data to server:", JSON.stringify(gameStateObj, null, 2));
			this.socket.send(JSON.stringify(gameStateObj));
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
				x: data.objects.ball.direction.x,
				y: data.objects.ball.direction.y
			},
			position: this.fromCenteredCoords(
				data.objects.ball.position.x, 
				data.objects.ball.position.y, 
				this.pongOnlineClientApp.field),
			radius: data.objects.ball.radius,
			speed: data.objects.ball.speed
		};
	
		const paddle1 = {
			speed: data.objects.paddle1.speed,
			dir_y: data.objects.paddle1.dir_y,
			width: data.objects.paddle1.width,
			height: data.objects.paddle1.height,
			position: this.fromCenteredCoords(data.objects.paddle1.position.x, data.objects.paddle1.position.y, this.pongOnlineClientApp.field),
		};
	
		const paddle2 = {
			speed: data.objects.paddle2.speed,
			dir_y: data.objects.paddle2.dir_y,
			width: data.objects.paddle2.width,
			height: data.objects.paddle2.height,
			position: this.fromCenteredCoords(data.objects.paddle2.position.x, data.objects.paddle2.position.y, this.pongOnlineClientApp.field),
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
		console.log("WebSocket connection established.");
		const initData = JSON.stringify({ action: "initialize" });
		this.socket.send(initData);
		console.log("initData: ", initData);
	}
	
	onSocketClose(event) {
		console.error("WebSocket connection closed:", event.reason, "Code:", event.code);
	}

	onSocketError(event) {
		console.error("WebSocket error:", event);
	}

}

export default PongOnlineSyncWS;

