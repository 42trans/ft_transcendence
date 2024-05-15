	// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineClientApp.js
	import PongEngineKey from "./PongEngineKey.js";
	import PongOnlinePaddleMover from "./PongOnlinePaddleMover.js";
	import PongOnlineRenderer from "./PongOnlineRenderer.js";
	import PongOnlineTransactionManager from "./PongOnlineTransactionManager.js";

	class PongOnlineClientApp 
	{
		constructor() 
		{
			this.canvasId = "pong-online-canvas-container"
			this.canvas = document.getElementById(this.canvasId);
			if (!this.canvas.getContext) {
				return;
			}
			this.ctx = this.canvas.getContext("2d");
			this.field = { width: 400, height: 300 };
			this.ctx.fillRect(0, 0, this.field.width, this.field.height);

			this.gameState = null;
			this.socket = new WebSocket('wss://localhost/ws/pong/online/');
			console.log(this.socket);
			this.transactionManager = new PongOnlineTransactionManager(this ,this.gameState, this.socket, () => {});
			
			this.socket.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if (!this.gameState) {
					// console.log("class PongOnlineTransactionManager", this.gameState);
					this.iinitializeGameState(data);
					this.gameLoop();
				} else {
					this.transactionManager.update(this.gameState, data);
				}
				// console.log("Received data:", data);
			};
			PongEngineKey.listenForEvents();
		}
		
		
		iinitializeGameState(data) 
		{
			// サーバーからの初期データに基づいて gameState を設定
			console.log("initializeGameState:", data);
			this.gameState = {
				paddle1: data.paddle1,
				paddle2: data.paddle2,
				ball: data.ball,
				score: data.score
			};

		}

		gameLoop() 
		{
			setInterval(() => {
				PongOnlinePaddleMover.handlePaddleMovement(this.field, this.gameState);
				this.transactionManager.send(this.gameState);
				PongOnlineRenderer.render(this.ctx, this.field, this.gameState);
			// 約60fpsで更新
			}, 1000 / 60);
		}

		static main(env) 
		{
			new PongOnlineClientApp(env);
		}
	}

	export default PongOnlineClientApp;
