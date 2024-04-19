/**
 * 物理演算に関する処理を担当。壁やパドルとの衝突判定、ボールの方向や速度の調整を行う。
 */
class PongEnginePhysics {
	constructor(pongEngineData) {
		this.field = pongEngineData.settings.field;
		this.maxBallSpeed = pongEngineData.settings.maxBallSpeed;
	}

	// 左右の壁との衝突しているか？
	isCollidingWithSideWalls(ballX, r, field) {
		return	ballX - r <= -field.width / 2 || 
				ballX + r >= field.width / 2
	}

	isCollidingWithCeilingOrFloor(ballY, r, field) {
		return	ballY - r <= -field.height / 2 || 
				ballY + r >= field.height / 2
	}

	isBallCollidingWithPaddle(ball, paddle) {
		const r			= ball.geometry.parameters.radius;
		const ballX		= ball.position.x;
		const ballY		= ball.position.y;
		const paddleX	= paddle.position.x;
		const paddleY	= paddle.position.y;

		return	ballX + r >= paddleX - paddle.width / 2 &&
				ballX - r <= paddleX + paddle.width / 2 &&	
				ballY + r >= paddleY - paddle.height / 2 &&	
				ballY - r <= paddleY + paddle.height / 2
	}

	adjustBallDirectionAndSpeed(ball, paddle) {
		const ballX = ball.position.x;
		const paddleX = paddle.position.x;

		// ボールがパドルに向かって進んでいるかどうか（X方向の判定）
		if (  (ball.dirX < 0 && ballX > paddleX) 
			||(ball.dirX > 0 && ballX < paddleX)
		) {
			ball.dirX	= -ball.dirX;  // ボールの水平方向を反転
			ball.dirY	+= paddle.dirY * 0.05;  // パドルの移動方向がボールに影響
			ball.speed	= Math.min(ball.speed * 1.1, this.maxBallSpeed);  // 速度を最大速度を超えないように10%増加
		}
	}
}

export default PongEnginePhysics;
