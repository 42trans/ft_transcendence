// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineTransactionManager.js

class PongOnlineTransactionManager 
{
	constructor(PongOnlineClientApp, gameState, socket) 
	{
		this.isFirstgameState = gameState;
		this.socket = socket;
		this.app = PongOnlineClientApp;

		this.socket.onopen = () => {
			console.log("WebSocket connection established.");
		};
		this.socket.onmessage = (event) => {
			console.log("a4");
			const data = JSON.parse(event.data);
			if (!this.gameState) {
				// this.initializeGameState(data);
				this.app.iinitializeGameState(data);
				this.app.gameLoop();
			} else {
				this.update(this.gameState, data);
			}
			console.log("Received data:", data);
		};
		this.socket.onclose = (event) => {
			console.log("WebSocket connection closed:", event.reason);
		};
		this.socket.onerror = (event) => {
			console.log("WebSocket error:", event);
		};
	}

	update(gameState, data) {
		// ボールのデータを更新
		gameState.ball.position = data.ball.position;
		gameState.ball.direction = data.ball.direction;
		gameState.ball.speed = data.ball.speed;

		// パドルのデータを更新
		gameState.paddle1.position = data.paddle1.position;
		gameState.paddle1.dir_y = data.paddle1.dir_y;

		gameState.paddle2.position = data.paddle2.position;
		gameState.paddle2.dir_y = data.paddle2.dir_y;

		// スコアのデータが含まれている場合、それも更新
		if (data.score) {
			gameState.score1 = data.score.player1;
			gameState.score2 = data.score.player2;
		}

		console.log("Updated gameState:", gameState);
	}

	send(inputData) 
	{
		if (this.socket.readyState === WebSocket.OPEN) {
			console.log("Sending data:", inputData);
			this.socket.send(JSON.stringify(inputData));
		} else {
			console.log("WebSocket is not open. Current state:", this.socket.readyState);
		}
	}
}

export default PongOnlineTransactionManager;


// 送信されるべきデータの形式（仮）
// {
//     "paddle1": {
//         "dir_y": 1
//     }
//     "paddle2": {
//         "dir_y": 1
//     }
// }

// 受信されるべきデータの形式（仮）
// {
//     "ball": {
//         "position": {"x": 200, "y": 150},
//         "direction": {"x": 1, "y": 0.1},
//         "speed": 2
//     },
//     "paddle1": {
//         "position": {"y": 100},
//         "dir_y": 0
//     },
//     "paddle2": {
//         "position": {"y": 200},
//         "dir_y": 0
//     },
//     "score": {
//         "player1": 3,
//         "player2": 2
//     }
// }
