	// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineClientApp.js
	import PongEngineKey from "./PongEngineKey.js";
	import PongOnlinePaddleMover from "./PongOnlinePaddleMover.js";
	import PongOnlineRenderer from "./PongOnlineRenderer.js";
	import PongOnlineSyncWS from "./PongOnlineSyncWS.js";

	/**
	 * ## Websocket接続テスト:
	 * - brew install websocat
	 * - websocat ws://localhost/ws/pong/online/
	 */
	class PongOnlineClientApp 
	{
		constructor() 
		{
			this.canvasId	= "pong-online-canvas-container"
			this.canvas 	= document.getElementById(this.canvasId);
			if (!this.canvas.getContext) {
				return;
			}
			this.ctx		= this.canvas.getContext("2d");
			
			// TODO_Ft: serverからfieldの値を取得したい
			this.field		= { width: 400, height: 300, zoomLevel: 1 };
			this.updateCanvasSize();
			window.addEventListener('resize', () => this.updateCanvasSize());

			this.gameState	= null;
			console.log('constructor begin');
			this.socket		= new WebSocket('wss://localhost/ws/pong/online/');

			this.syncWS		= new PongOnlineSyncWS(this ,this.gameState, this.socket, () => {});
			PongEngineKey.listenForEvents();
		}

		
		// 座標変換、ウインドウの幅100%、ズーム調整
		updateCanvasSize() 
		{
			// ブラウザウィンドウの寸法を使用
			this.canvas.width	= window.innerWidth;
			this.canvas.height	= window.innerHeight;

			// 幅と高さの両方に基づいてズームレベルを計算
			let zoomLevelWidth	= this.canvas.width / this.field.width;
			let zoomLevelHeight	= this.canvas.height / this.field.height;
			// 制約が最も厳しい側（小さい方のスケール）を使用
			this.field.zoomLevel = Math.min(zoomLevelWidth, zoomLevelHeight);

			// debug---
			// console.log(this.canvas.width, zoomLevelWidth);
			// console.log(this.canvas.height, zoomLevelHeight);
			// console.log(this.field.zoomLevel);

			// デフォルトの変換をリセット
			this.ctx.setTransform(1, 0, 0, 1, 0, 0);
			// キャンバスの中心を0,0とするための座標変換
			this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
			this.ctx.scale(this.field.zoomLevel, this.field.zoomLevel);
		}

		gameLoop() 
		{
			setInterval(() => 
			{
				// パドル情報更新
				PongOnlinePaddleMover.handlePaddleMovement(this.field, this.gameState);
				// ゲーム状態送信
				this.syncWS.sendClientState(this.gameState);
				// 2D描画
				PongOnlineRenderer.render(this.ctx, this.field, this.gameState);
			// TODO_ft:　dev時負荷落とす
			}, 1000 / 60);
		}

		static main(env) {
			new PongOnlineClientApp(env);
		}
	}

	export default PongOnlineClientApp;
