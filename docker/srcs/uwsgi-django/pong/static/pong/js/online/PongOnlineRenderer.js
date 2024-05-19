// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineRenderer.js

class PongOnlineRenderer 
{
	static render(ctx, field, gameState) 
	{
		PongOnlineRenderer.clearField(ctx, field);
		PongOnlineRenderer.drawPaddle(ctx, gameState.objects.paddle1);
		PongOnlineRenderer.drawPaddle(ctx, gameState.objects.paddle2);
		PongOnlineRenderer.drawBall(ctx, gameState.objects.ball);
		// console.log("--------------")
		// console.log("field: ",field)
		// console.log("p1 x: ",gameState.objects.paddle1.position.x)
		// console.log("p2 x: ",gameState.objects.paddle2.position.x)
		// console.log("ball x: ",gameState.objects.ball.position.x)
		// console.log("ball y: ",gameState.objects.ball.position.y)
		// console.log("--------------")
	}

	static drawPaddle(ctx, paddle) 
	{
		ctx.fillStyle = 'white';
		ctx.fillRect
		(
			paddle.position.x - paddle.width / 2,
			paddle.position.y - paddle.height / 2,
			paddle.width,
			paddle.height
		);
	}

	static drawBall(ctx, ball) 
	{
		ctx.beginPath();
		ctx.arc
		(
			ball.position.x, 
			ball.position.y, 
			ball.radius, 
			0, 
			2 * Math.PI, false
		);
		ctx.fillStyle = 'white';
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

