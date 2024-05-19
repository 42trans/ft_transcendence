	// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineClientApp.js
	import PongEngineKey from "./PongEngineKey.js";
	import PongOnlinePaddleMover from "./PongOnlinePaddleMover.js";
	import PongOnlineRenderer from "./PongOnlineRenderer.js";
	import PongOnlineSyncWS from "./PongOnlineSyncWS.js";

	/**
	 * ## Websocket接続テスト:
	 * - brew install websocat
	 * - websocat ws://localhost/ws/pong/online/
	 * 
	 * - 座標変換: 参考:【CanvasRenderingContext2D: setTransform() method - Web APIs | MDN】 <https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform>
	 */
	class PongOnlineClientApp 
	{
		constructor() 
		{
			// console.log('PongOnlineClientApp constructor begin');
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
			this.socket		= new WebSocket('wss://localhost/ws/pong/online/');

			this.syncWS		= new PongOnlineSyncWS(this, this.socket);
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


			// 1,0,0,1,0,0 スケーリングを変更せず、回転もせず、平行移動も加えない
			// 元の状態（リセット状態）に戻す
			this.ctx.setTransform(1, 0, 0, 1, 0, 0);
			// 平行移動 キャンバスの中心を0,0とするための座標変換
			this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
			// 拡大縮小
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
			}, 1000 / 1);
		}

		static main(env) {
			new PongOnlineClientApp(env);
		}
	}

	export default PongOnlineClientApp;
