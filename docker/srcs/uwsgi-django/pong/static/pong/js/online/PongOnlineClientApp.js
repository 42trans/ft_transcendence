// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineClientApp.js
import PongEngineKey from "./PongEngineKey.js";
import PongOnlineRenderer from "./PongOnlineRenderer.js";
import PongOnlineSyncWS from "./PongOnlineSyncWS.js";
import PongOnlineGameStateManager from "./PongOnlineGameStateManager.js"

/**
 * 2D-Pong Onlineのメインクラス
 * - 描画対象、通信対象の設定、描画サイズ(ズーム)を担当 
 * 
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
		// websocketが先
		this.initWebSocket();
		this.initCanvas();
		window.addEventListener('resize', () => this.resizeForAllDevices());
	}


	initWebSocket()
	{
		this.socketUrl				= 'wss://localhost/ws/pong/online/';
		this.gameStateManager		= new PongOnlineGameStateManager();
		this.syncWS					= new PongOnlineSyncWS(this, this.gameStateManager, this.socketUrl);
		PongEngineKey.listenForEvents();
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
		this.field		= { width: 400, height: 300, zoomLevel: 1 };
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


	static main(env) {
		new PongOnlineClientApp(env);
	}
}

export default PongOnlineClientApp;
