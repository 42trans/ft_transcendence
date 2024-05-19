// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineRenderer.js

/**
 * <canvas>への描画（ピクセルに色を出力）を担当する
 * 
 * 参考:【テキストの描画 - Web API | MDN】 <https://developer.mozilla.org/ja/docs/Web/API/Canvas_API/Tutorial/Drawing_text>
 */
class PongOnlineRenderer 
{
	static render(ctx, field, gameState) 
	{
		PongOnlineRenderer.clearField(ctx, field);
		PongOnlineRenderer.drawPaddle(ctx, gameState.objects.paddle1);
		PongOnlineRenderer.drawPaddle(ctx, gameState.objects.paddle2);
		PongOnlineRenderer.drawBall(ctx, gameState.objects.ball);
		PongOnlineRenderer.drawScore(ctx, field, gameState.state);
		// console.log("--------------")
		// console.log("field: ",field)
		// console.log("p1 x: ",gameState.objects.paddle1.position.x)
		// console.log("p2 x: ",gameState.objects.paddle2.position.x)
		// console.log("ball x: ",gameState.objects.ball.position.x)
		// console.log("ball y: ",gameState.objects.ball.position.y)
		// console.log("--------------")
	}

	static drawScore(ctx, field, state)
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

	static drawPaddle(ctx, paddle) 
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

	static drawBall(ctx, ball) 
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

	static clearField(ctx, field) 
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

