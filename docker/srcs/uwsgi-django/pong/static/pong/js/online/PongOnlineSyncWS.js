// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineSyncWS.js
import PongOnlineClientApp from "./PongOnlineClientApp.js";


class PongOnlineSyncWS 
{
	constructor(app, gameState, socket) 
	{
		this.socket = socket;
		this.app = app;

		this.socket.onopen = () => 
		{
			console.log("WebSocket connection established.");
			const initData = JSON.stringify({ action: "initialize" });
			this.socket.send(initData);	
			console.log("seng initData");
		};
		
		this.socket.onmessage = (event) => 
			{
			console.log("WebSocket onmessage.", event.data);
			const data = JSON.parse(event.data);
			const transformedData = this.transformData(data);
			if (!app.gameState) 
			{
				this.app.gameState = {};
				this.update(app.gameState, transformedData);
				app.gameLoop();
			} else {
				this.update(app.gameState, transformedData);
			}
		};
		
		this.socket.onclose = (event) => {
			console.error("WebSocket connection closed:", event.reason, "Code:", event.code);
		};
		
		this.socket.onerror = (event) => {
			console.error("WebSocket error:", event);
		};
		
	}

	// 座標を中心基準に変換する関数
	toCenteredCoords(x, y, field) {
		return {
			x: x - field.width / 2,
			y: y - field.height / 2
		};
	}

	// 中心基準の座標をキャンバス基準に戻す関数
	fromCenteredCoords(x, y, field) {
		return {
			x: x + field.width / 2,
			y: y + field.height / 2
		};
	}

	transformData(data) {
		return {
			ball: {
				...data.ball,
				position: this.toCenteredCoords(data.ball.position.x, data.ball.position.y, this.app.field)
			},
			paddle1: {
				...data.paddle1,
				position: this.toCenteredCoords(data.paddle1.position.x, data.paddle1.position.y, this.app.field)
			},
			paddle2: {
				...data.paddle2,
				position: this.toCenteredCoords(data.paddle2.position.x, data.paddle2.position.y, this.app.field)
			},
			score1: data.score1,
			score2: data.score2
		};
	}

	/**
	 * type:
		{
			"ball": {
				"direction": {"x": -1, "y": 0.1},
				"position": {"x": -100, "y": 9.999999999999996},
				"radius": 5,
				"speed": 2
			},
			"paddle1": {
				"dirY": 0,
				"dir_y": 0,
				"height": 30,
				"position": {"x": 0, "y": 0},
				"speed": 10,
				"width": 10
			},
			"paddle2": {
				"dirY": 0,
				"dir_y": 0,
				"height": 30,
				"position": {"x": 0, "y": 0},
				"speed": 10,
				"width": 10
			},
			"score1": 0,
			"score2": 0
		}
	*/
	update(gameState, data) 
	{
		gameState.ball = data.ball;
		gameState.paddle1 = data.paddle1;
		gameState.paddle2 = data.paddle2;
		gameState.score1 = data.score1;
		gameState.score2 = data.score2;
	}

	sendClientState(gameUpdate) 
	{
		if (this.socket.readyState === WebSocket.OPEN) 
		{
			const serverBallPos = this.fromCenteredCoords(gameUpdate.ball.position.x, gameUpdate.ball.position.y, this.app.field);
			gameUpdate.ball.position = serverBallPos;

			const serverPaddle1Pos = this.fromCenteredCoords(gameUpdate.paddle1.position.x, gameUpdate.paddle1.position.y, this.app.field);
			gameUpdate.paddle1.position = serverPaddle1Pos;

			const serverPaddle2Pos = this.fromCenteredCoords(gameUpdate.paddle2.position.x, gameUpdate.paddle2.position.y, this.app.field);
			gameUpdate.paddle2.position = serverPaddle2Pos;

			console.log("Sending data:", gameUpdate);
			this.socket.send(JSON.stringify(gameUpdate));
		} else {
			console.log("WebSocket is not open. Current state:", this.socket.readyState);
		}
	}
}

export default PongOnlineSyncWS;

// 送信されるべきデータの形式（仮）
// {
//     "paddle1": {
//         "dir_y": 1
//     }
//     "paddle2": {
//         "dir_y": 1
//     }
//     "ball": {
//         "position": {"x": 200, "y": 150},
//         "direction": {"x": 1, "y": 0.1},
//         "speed": 2
//     },
// }

