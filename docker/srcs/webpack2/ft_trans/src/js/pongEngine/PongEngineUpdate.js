import PongEngineKey from './PongEngineKey'
// import PongEngineMatch from './PongEngineMatch';
// import PongEnginePhysics from './PongEnginePhysics';

/**
 * ゲームの状態更新を担当。ボールやパドルの位置更新などのゲームロジックを実行
 */
class PongEngineUpdate {
	constructor(data, physics, match){
		this.physics = physics;
		this.match = match;
	
		this.ball		= data.objects.ball;
		this.paddle1	= data.objects.paddle1;
		this.paddle2	= data.objects.paddle2;

		this.field			= data.settings.field;
		this.difficulty		= data.settings.difficulty;
		this.maxBallSpeed	= data.settings.maxBallSpeed;
		this.initBallSpeed	= data.settings.initBallSpeed;
	}

	handleCollisions() {
		const r 	= this.ball.geometry.parameters.radius;
		const ballX	= this.ball.position.x;
		const ballY	= this.ball.position.y;
		
		// 左右の壁との衝突を検出
		if (this.physics.isCollidingWithSideWalls(ballX, r, this.field)) {
			const scorer = ballX < 0 ? 2 : 1;
			this.resetBall(scorer);
			this.match.updateScore(scorer);
		}
		// 上下の壁との衝突を検出
		if (this.physics.isCollidingWithCeilingOrFloor(ballY, r, this.field)) {
			this.ball.dirY = -this.ball.dirY;
		}
		// パドルごとの衝突判定とボールの方向や速度の調整
		if (this.physics.isBallCollidingWithPaddle(this.ball, this.paddle1)){
			this.physics.adjustBallDirectionAndSpeed(this.ball, this.paddle1);
		}
		if (this.physics.isBallCollidingWithPaddle(this.ball, this.paddle2)){
			this.physics.adjustBallDirectionAndSpeed(this.ball, this.paddle2);
		}
	}

	updateBallPosition() {
		this.ball.position.x += this.ball.dirX * this.ball.speed;
		this.ball.position.y += this.ball.dirY * this.ball.speed;
	}

	// パドルのプレイヤー操作を処理する
	handlePaddleMovement() {
		this.updatePaddlePosition(this.paddle1, 'J', 'L');
		this.updatePaddlePosition(this.paddle2, 'F', 'S');
	}

	// 特定のキー入力に基づいてパドルを動かす
	updatePaddlePosition(paddle, keyUp, keyDown) {
		if (PongEngineKey.isDown(keyUp) 
			&& paddle.position.y < this.field.height / 2 - paddle.height / 2
		) {
			paddle.dirY = paddle.speed;
		} else if (PongEngineKey.isDown(keyDown) 
				&& paddle.position.y > -this.field.height / 2 + paddle.height / 2
		) {
			paddle.dirY = -paddle.speed;
		} else {
			paddle.dirY = 0;
		}

		let nextPositionY = paddle.position.y + paddle.dirY;
		// 最後の一回はspeed分だけ動くのではみ出る場合がある。
		// パドルがフィールドの上端または下端を超えないようにmax,min()で補正する
		let maxTop = -this.field.height / 2 + paddle.height / 2;
		let maxBottom = this.field.height / 2 - paddle.height / 2;
		paddle.position.y = Math.max(Math.min(nextPositionY, maxBottom), maxTop);
	}	

	resetBall(loser) {
		this.ball.position.set(0, 0, 0); 
		this.ball.dirX = loser === 1 ? -1 : 1;
		this.ball.dirY = 1.1; // 少し角度をつける
		this.ball.speed = this.initBallSpeed;
	}

	updateGame() {
		console.log(`
			paddle1 \tX: ${this.paddle1.position.x}  \tY: ${this.paddle1.position.y}
			paddle1 \tW: ${this.paddle1.width}  \tH: ${this.paddle1.height}
			DirY \tpaddle1: ${this.paddle1.dirY}  \tpaddle2: ${this.paddle2.dirY}
			field \twidth: ${this.field.width}  \height: ${this.field.height}
		`);	
		this.handleCollisions();
		this.updateBallPosition();
		this.handlePaddleMovement();
	}
}

export default PongEngineUpdate;