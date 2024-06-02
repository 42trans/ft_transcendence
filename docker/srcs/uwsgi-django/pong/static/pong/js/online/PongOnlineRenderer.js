// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineRenderer.js

// console.log: 出力=true、本番時はfalseに設定。0,1でも動く
let DEBUG_FLOW = 1;
let DEBUG_DETAIL = 0;
let DEBUG_DETAIL2 = 1;

/**
 * <canvas>への描画（ピクセルに色を出力）を担当する
 * 
 * 参考:【テキストの描画 - Web API | MDN】 <https://developer.mozilla.org/ja/docs/Web/API/Canvas_API/Tutorial/Drawing_text>
 */
class PongOnlineRenderer 
{
	constructor(gameStateManager) {
		this.gameStateManager	= gameStateManager;
	}


	initRenderer() 
	{
		this.field				= this.gameStateManager.field;
		this.ctx				= this.gameStateManager.ctx;
		this.canvas				= this.gameStateManager.canvas;
		this.gameState			= this.gameStateManager.gameState;
	}


	render(ctx, field, gameState) 
	{		
		this._clearField(ctx, field);
		this._drawPaddle(ctx, gameState.objects.paddle1);
		this._drawPaddle(ctx, gameState.objects.paddle2);
		this._drawBall(ctx, gameState.objects.ball);
		this._drawScore(ctx, field, gameState.state);
		if (DEBUG_DETAIL)
		{
			console.log("--------------")
			console.log("field: ",field)
			console.log("p1 x: ",gameState.objects.paddle1.position.x)
			console.log("p2 x: ",gameState.objects.paddle2.position.x)
			console.log("ball x: ",gameState.objects.ball.position.x)
			console.log("ball y: ",gameState.objects.ball.position.y)
			console.log("--------------")
		}
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

		if (DEBUG_DETAIL)
		{
			console.log(this.canvas.width, zoomLevelWidth);
			console.log(this.canvas.height, zoomLevelHeight);
			console.log(this.field.zoomLevel);
		}

		// 元の状態（リセット状態）に戻す
		// 1,0,0,1,0,0 スケーリングを変更せず、回転もせず、平行移動も加えない
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		// 平行移動 キャンバスの中心を0,0とするための座標変換
		this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
		// 拡大縮小
		this.ctx.scale(this.field.zoomLevel, this.field.zoomLevel);
		// 終了時の描画状態（スコア表示）を維持する: 状態の更新を強制するために再描画をトリガーする
		const gameState = this.gameStateManager.gameState;
		if (DEBUG_DETAIL2){	console.log("agter loop: render: gameState.is_running", gameState.is_running)	}
		if (gameState && 
			!gameState.is_running && 
			// !this.gameStateManager.isGameLoopStarted &&
			(gameState.state.score1 > 0 || gameState.state.score2 > 0) )
		{
			if (DEBUG_DETAIL2){	console.log("agter loop: render ")	}
			setTimeout(() => {
				this.render(this.ctx, this.field, gameState);
			}, 16);
		}
	}


	_drawScore(ctx, field, state)
	{
		// ctx: Canvas 2D コンテキストオブジェクト
		ctx.font = '40px Arial';
		ctx.fillStyle = 'white';
		// 指定したx座標がテキストの中央
		ctx.textAlign = 'center';
		let scoreText = `${state.score1} - ${state.score2}`;
		// 第1引数:描画テキスト、第2,第3引数:x,y座標
		ctx.fillText(
			scoreText, 
			0, 
			-field.height / 2 + 30);
	}


	_drawPaddle(ctx, paddle) 
	{
		ctx.fillStyle = 'white';
		ctx.fillRect
		(
			// パドルの厚みを差し引いた場所（左上）から描き始める
			paddle.position.x - paddle.width / 2,
			paddle.position.y - paddle.height / 2,
			paddle.width,
			paddle.height
		);
	}


	_drawBall(ctx, ball) 
	{
		// ctx.beginPath(): 新しいパスを開始
		ctx.beginPath();
		// ctx.arc(): 円
		ctx.arc
		(
			ball.position.x, 
			ball.position.y, 
			ball.radius, 
			// 開始角度、終了角度、描画方向
			0, 
			2 * Math.PI, 
			false
		);
		// ctx.fillStyle: 図形の塗りつぶし色
		ctx.fillStyle = 'white';
		// ctx.fill(): 塗りつぶし
		ctx.fill();
	}


	_clearField(ctx, field) 
	{
		ctx.clearRect
		(
			-field.width / 2, 
			-field.height / 2, 
			field.width, 
			field.height
		);
		
		// 背景色設定
		ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
		ctx.fillRect
		(
			-field.width / 2, 
			-field.height / 2, 
			field.width, 
			field.height
		);
	}

}

export default PongOnlineRenderer;

