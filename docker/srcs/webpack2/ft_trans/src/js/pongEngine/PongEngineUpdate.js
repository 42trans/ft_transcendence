import Key from './Key'

class PongEngineUpdate {
	constructor(engine) {
		if (!engine || !engine.objects.ball) {
			throw new Error("Engine is not initialized correctly or ball is missing.");
		}

		this.engine = engine; // Store reference to the main game engine
		this.camera = engine.camera;
		this.ball = engine.objects.ball;
		this.fieldWidth = engine.objects.fieldWidth;
		this.fieldHeight = engine.objects.fieldHeight;
		this.score1 = engine.objects.score1;
		this.score2 = engine.objects.score2;
		// this.resetBall = engine.resetthis.Ball.bind(engine);
		// this.matchScoreCheck = engine.matchScoreCheck.bind(engine);
		this.ballDirX = 1; // 仮の値
		this.ballSpeed = 1; // 仮の値
		this.ballDirY = 1;
		this.paddle1 = engine.objects.paddle1; // Assuming paddle1 is part of engine
		this.paddle2 = engine.objects.paddle2; // Assuming paddle2 is part of engine
		
		this.paddle1DirY = engine.objects.paddle1.dirY;
		this.paddle1Speed = engine.objects.paddle1.speed
		;
		this.paddle2DirY = engine.objects.paddle2.dirY;
		this.paddle2Speed = engine.objects.paddle2.speed;
		
		this.difficulty = engine.difficulty; // Assuming difficulty is defined in engine
	}

	updateGame() {
		console.log(`
			score1: ${this.score1} - ${this.score2} score2:,
			Ball    \tX: ${this.ball.position.x}  \tY: ${this.ball.position.y}
			paddle1 \tX: ${this.paddle1.position.x}  \tY: ${this.paddle1.position.y}
			paddle1 \tW: ${this.paddle1.width}  \tH: ${this.paddle1.height}
			DirY \tpaddle1: ${this.paddle1DirY}  \tpaddle2: ${this.paddle2DirY}
			paddle2 \tX: ${this.paddle2.position.x}  \tY: ${this.paddle2.position.y}
			paddle2 \tW: ${this.paddle2.width}  \tH: ${this.paddle2.height}
		`);
			// paddle1DirY:', ${this.paddle1DirY}
			// Paddle Speed:', ${this.paddle1Speed}
			// Key A: `,Key.isDown('A'),`
			// Key D: `,Key.isDown('D'),`
		
		this.ballPhysics();
		this.paddlePhysics();
		// this.cameraPhysics();
		this.playerPaddleMovement();
		// this.opponentPaddleMovement();
	}



	// パドルのキー操作
	playerPaddleMovement() {
		if (Key.isDown('J')) {
			if (this.paddle1.position.y < this.fieldHeight * 0.45) {
				this.paddle1DirY = this.paddle1Speed * 0.5;
			} else {
				this.paddle1DirY = 0;
				this.paddle1.scale.z += (10 - this.paddle1.scale.z) * 0.2;
			}
		} else if (Key.isDown('L')) {
			if (this.paddle1.position.y > -this.fieldHeight * 0.45) {
				this.paddle1DirY = -this.paddle1Speed * 0.5;
			} else {
				this.paddle1DirY = 0;
				this.paddle1.scale.z += (10 - this.paddle1.scale.z) * 0.2;
			}
		} else {
			this.paddle1DirY = 0;
		}
		this.paddle1.scale.y += (1 - this.paddle1.scale.y) * 0.2;
		this.paddle1.scale.z += (1 - this.paddle1.scale.z) * 0.2;
		this.paddle1.position.y += this.paddle1DirY;

		if (Key.isDown('F')) {
			if (this.paddle2.position.y < this.fieldHeight * 0.45) {
				this.paddle2DirY = this.paddle2Speed * 0.5;
			} else {
				this.paddle2DirY = 0;
				this.paddle2.scale.z += (10 - this.paddle2.scale.z) * 0.2;
			}
		} else if (Key.isDown('S')) {
			if (this.paddle2.position.y > -this.fieldHeight * 0.45) {
				this.paddle2DirY = -this.paddle2Speed * 0.5;
			} else {
				this.paddle2DirY = 0;
				this.paddle2.scale.z += (10 - this.paddle2.scale.z) * 0.2;
			}
		} else {
			this.paddle2DirY = 0;
		}		

		this.paddle2.scale.y += (1 - this.paddle2.scale.y) * 0.2;
		this.paddle2.scale.z += (1 - this.paddle2.scale.z) * 0.2;
		this.paddle2.position.y += this.paddle2DirY;
	}

	
	ballPhysics() {
		if (this.ball.position.x <= -this.fieldWidth / 2) {
			this.score2++;
			// document.getElementById("scores").innerHTML = this.score1 + "-" + this.score2;
			this.resetBall(2);
			this.matchScoreCheck();
		}

		if (this.ball.position.x >= this.fieldWidth / 2) {
			this.score1++;
			// document.getElementById("scores").innerHTML = this.score1 + "-" + this.score2;
			this.resetBall(1);
			this.matchScoreCheck();
		}

		if (this.ball.position.y <= -this.fieldHeight / 2) {
			this.ballDirY = -this.ballDirY;
		}

		if (this.ball.position.y >= this.fieldHeight / 2) {
			this.ballDirY = -this.ballDirY;
		}

		this.ball.position.x += this.ballDirX * this.ballSpeed;
		this.ball.position.y += this.ballDirY * this.ballSpeed;

		if (this.ballDirY > this.ballSpeed * 2) {
			this.ballDirY = this.ballSpeed * 2;
		} else if (this.ballDirY < -this.ballSpeed * 2) {
			this.ballDirY = -this.ballSpeed * 2;
		}
	}

	// 衝突判定　potionに厚みwidthの分だけ衝突位置をずらして計算
	paddlePhysics() {
		if (this.ball.position.x <= this.paddle1.position.x + this.paddle1.width
			&& this.ball.position.x >= this.paddle1.position.x) {
			if (this.ball.position.y <= this.paddle1.position.y + this.paddle1.height / 2
				&& this.ball.position.y >= this.paddle1.position.y - this.paddle1.height / 2) {
				if (this.ballDirX < 0) {
					this.paddle1.scale.y = 15;
					this.ballDirX = -this.ballDirX;
					this.ballDirY -= this.paddle1DirY * 0.7;
				}
			}
		}

		if (this.ball.position.x <= this.paddle2.position.x + this.paddle2.width
			&& this.ball.position.x >= this.paddle2.position.x) {
			if (this.ball.position.y <= this.paddle2.position.y + this.paddle2.height / 2
				&& this.ball.position.y >= this.paddle2.position.y - this.paddle2.height / 2) {
				if (this.ballDirX > 0) {
					this.paddle2.scale.y = 15;
					this.ballDirX = -this.ballDirX;
					this.ballDirY -= this.paddle2DirY * 0.7;
				}
			}
		}
	}


	// opponentPaddleMovement() {
	// 	this.paddle2DirY = (this.ball.position.y - this.paddle2.position.y) * this.difficulty;
	// 	if (Math.abs(this.paddle2DirY) <= this.paddle2Speed) {
	// 		this.paddle2.position.y += this.paddle2DirY;
	// 	} else {
	// 		if (this.paddle2DirY > this.paddle2Speed) {
	// 			this.paddle2.position.y += this.paddle2Speed;
	// 		} else if (this.paddle2DirY < -this.paddle2Speed) {
	// 			this.paddle2.position.y -= this.paddle2Speed;
	// 		}
	// 	}
	// 	this.paddle2.scale.y += (1 - this.paddle2.scale.y) * 0.2;
	// }


	resetBall(loser) {
		this.ball.position.set(0, 0, 0); // position the ball in the center of the table
		this.ballDirX = loser === 1 ? -1 : 1; // if player lost, send ball to opponent, otherwise to player
		this.ballDirY = 1; // set the ball to move +ve in y plane (towards left from the camera)
	}

	matchScoreCheck() {
		if (this.score1 >= this.maxScore || this.score2 >= this.maxScore) {
			this.ballSpeed = 0; // stop the ball
			const winnerText = this.score1 >= this.maxScore ? "Player wins!" : "CPU wins!";
			// document.getElementById("scores").innerHTML = winnerText;
			// document.getElementById("winnerBoard").innerHTML = "Refresh to play again";

			const winningPaddle = this.score1 >= this.maxScore ? this.paddle1 : this.paddle2;
			winningPaddle.position.z = Math.sin(this.bounceTime * 0.1) * 10;
			winningPaddle.scale.z = 2 + Math.abs(Math.sin(this.bounceTime * 0.1)) * 10; 
			winningPaddle.scale.y = 2 + Math.abs(Math.sin(this.bounceTime * 0.05)) * 10;
			this.bounceTime++;
		}
	}

	
	// cameraPhysics() {
	// 	if (!this.engine.scene || !this.camera) {
	// 		console.error("Camera is not available in the scene");
	// 		return; // カメラが利用不可能なので処理をスキップ
	// 	}
	// 	// this.camera.position.x = this.paddle1.position.x - 100;
	// 	this.camera.position.y += (this.paddle1.position.y - this.camera.position.y) * 0.05;
	// 	// this.camera.position.z = this.paddle1.position.z + 100 + 0.04 * (-this.ball.position.x + this.paddle1.position.x);
	// 	this.camera.rotation.x = -0.01 * (this.ball.position.y) * Math.PI / 180;
	// 	this.camera.rotation.y = -60 * Math.PI / 180;
	// 	this.camera.rotation.z = -90 * Math.PI / 180;
	// }

}

export default PongEngineUpdate;