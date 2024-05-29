// docker/srcs/uwsgi-django/pong/static/pong/js/online/duel/PongOnlineDuelUtil.js
import PongOnlineRenderer from "../PongOnlineRenderer.js";

class PongOnlineDuelUtil 
{
	/** dev用 再接続チェック用 */
	static devTestCloseButton()
	{
		this.createButton('Test Close WebSocket', 'hth-pong-online-close-ws-btn', () => {
			this.socket.close();
		});
	}

	static createButton(text, id, onClickHandler) 
	{
		const button		= document.createElement('button');
		button.textContent	= text;
		button.id			= id;
		button.classList.add('hth-btn');
		document.getElementById('hth-main').appendChild(button);
		button.addEventListener('click', onClickHandler);
	}

	static removeMessage(elemId = 'hth-pong-duel-waiting-message') {
		const elem = document.getElementById(elemId);
		if (elem) {
			elem.remove();
		}
	}

	// ウインドウのサイズに合わせて動的に描画サイズを変更
	static resizeForAllDevices(ctx, gameState, canvas, gameStateManager) 
	{
		this.ctx		= ctx;
		this.field		= gameState.game_settings.field;
		this.canvas		= canvas
		
		console.log("gameState", gameState);
		console.log("canvas", this.canvas.width);
		console.log("field", this.field.width);
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
		const state = gameStateManager.getFinalState();
		if (state && 
			(state.state.score1 > 0 || state.state.score2 > 0) 
		)
		{
			setTimeout(() => {
				PongOnlineRenderer.render(this.ctx, this.field, state);
			}, 16);
		}
	}

	/** close時: 自動再接続 */
	static attemptReconnect(
		clientApp, 
		isReconnecting, 
		reconnectIntervalMilliSec,
		reconnectAttempts,
		maxReconnectAttempts
	) 
	{
		// 再接続処理中を表すフラグを立てる
		isReconnecting = true;
		// コンストラクタで指定した回数試みる
		if (reconnectAttempts < maxReconnectAttempts) 
		{
			setTimeout(() => 
			{
				clientApp.setupWebSocketConnection();
			}, reconnectIntervalMilliSec);
		} else {
			console.error("Reconnect failed.");
			// 最大試行回数に達したらリセット
			reconnectAttempts = 0;
			isReconnecting = false;
		}
	}
}

export default PongOnlineDuelUtil;

