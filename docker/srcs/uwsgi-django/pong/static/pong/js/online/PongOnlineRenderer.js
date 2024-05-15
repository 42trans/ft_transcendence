// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineRenderer.js

class PongOnlineRenderer 
{
	static render(ctx, field, gameState) 
	{
		PongOnlineRenderer.clearField(ctx, field);
		PongOnlineRenderer.drawPaddle(ctx, gameState.paddle1);
		PongOnlineRenderer.drawPaddle(ctx, gameState.paddle2);
		PongOnlineRenderer.drawBall(ctx, gameState.ball);
	}

	static drawPaddle(ctx, paddle) 
	{
		ctx.fillStyle = 'white';
		ctx.fillRect(
			paddle.position.x - paddle.width / 2,
			paddle.position.y - paddle.height / 2,
			paddle.width,
			paddle.height
		);
	}

	static drawBall(ctx, ball) 
	{
		ctx.beginPath();
		ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, 2 * Math.PI, false);
		ctx.fillStyle = 'white';
		ctx.fill();
	}

	static clearField(ctx, field) 
	{
		ctx.clearRect(0, 0, field.width, field.height);
	}

}

export default PongOnlineRenderer;



