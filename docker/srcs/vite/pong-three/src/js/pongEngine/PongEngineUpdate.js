// docker/srcs/vite/pong-three/src/js/pongEngine/PongEngineUpdate.js
import PongEngineKey from './PongEngineKey'

const DEBUG_FLOW 		= 0;

/**
 * ゲームの状態更新を担当。ボールやパドルの位置更新などのゲームロジックを実行
 */
class PongEngineUpdate 
{
	constructor(pongEngine, pongEngineData, physics, match)
	{
		this.pongEngine = pongEngine;
		this.physics	= physics;
		this.match		= match;
		this.pongEngineData = pongEngineData;
	
		this.ball		= pongEngineData.objects.ball;
		this.paddle1	= pongEngineData.objects.paddle1;
		this.paddle2	= pongEngineData.objects.paddle2;

		this.field			= pongEngineData.settings.field;
		this.difficulty		= pongEngineData.settings.difficulty;
		this.maxBallSpeed	= pongEngineData.settings.maxBallSpeed;
		this.initBallSpeed	= pongEngineData.settings.initBallSpeed;
	
		this.isResetting = false;
		// this.initMouseControl();
	}

	// initMouseControl() 
	// {
	// 	window.addEventListener('mousemove', this.handleMouseMove.bind(this));
	// }

	// handleMouseMove(event) 
	// {
	// 	const fieldHeight = this.pongEngineData.settings.field.height; // フィールドの高さを取得
	// 	const windowHeight = window.innerHeight; // ウィンドウの高さを取得
	// 	// マウスのY座標をウィンドウの高さに対する比率で取得
	// 	const mouseRatio = event.clientY / windowHeight;
	// 	// フィールド座標に変換（フィールドの中心を0として、マウスの比率に基づいてフィールド内の位置を計算）
	// 	const paddleY = (mouseRatio - 0.5) * fieldHeight;
	// 	// パドルの位置を更新（フィールドの範囲内に収まるようにclamp関数を使用して制限）
	// 	this.pongEngineData.objects.paddle1.position.y = Math.max(Math.min(paddleY, fieldHeight / 2), -fieldHeight / 2);
	// }

	async handleCollisions() 
	{
		const r 	= this.ball.geometry.parameters.radius;
		const ballX	= this.ball.position.x;
		const ballY	= this.ball.position.y;
		
		if (this.isResetting) return; 

		// 非同期で先にdispose()が実行されてしまう
		if (!this.physics) 
		{
			console.warn('hth: this.physics is null: 1');
			return;
		}
		// 左右の壁との衝突を検出
		if (this.physics.isCollidingWithSideWalls(ballX, r, this.field)) 
		{
			const scorer = ballX < 0 ? 2 : 1;
			await this.match.updateScore(scorer);
			await this.resetBall(scorer);
		}

		if (!this.physics) 
		{
			console.warn('hth: this.physics is null: 2');
			return;
		}
		// 上下の壁との衝突を検出
		if (this.physics.isCollidingWithCeilingOrFloor(ballY, r, this.field)) 
		{
			this.ball.dirY = -this.ball.dirY;
		}

		if (!this.physics) 
		{
			console.warn('hth: this.physics is null: 3');
			return;
		}
		// パドルごとの衝突判定とボールの方向や速度の調整
		if (this.physics.isBallCollidingWithPaddle(this.ball, this.paddle1)){
			this.physics.adjustBallDirectionAndSpeed(this.ball, this.paddle1);
		}

		if (!this.physics) 
		{
			console.warn('hth: this.physics is null: 4');
			return;
		}
		if (this.physics.isBallCollidingWithPaddle(this.ball, this.paddle2)){
			this.physics.adjustBallDirectionAndSpeed(this.ball, this.paddle2);
		}
	}

	updateBallPosition() 
	{
		if (this.isResetting) return; 

		if (this.ball)
		{
			this.ball.position.x += this.ball.dirX * this.ball.speed;
			this.ball.position.y += this.ball.dirY * this.ball.speed;
		}
	}

	// パドルのプレイヤー操作を処理する
	handlePaddleMovement() 
	{
		this.updatePaddlePosition(this.paddle1, 'I', 'J');
		this.updatePaddlePosition(this.paddle2, 'E', 'F');
	}

	// 特定のキー入力に基づいてパドルを動かす
	updatePaddlePosition(paddle, keyUp, keyDown) 
	{
		if (!paddle) return;

		if (PongEngineKey.isDown(keyDown) 
			&& paddle.position.y < this.field.height / 2 - paddle.height / 2) 
		{
			paddle.dirY = paddle.speed;
		} 
		else if (PongEngineKey.isDown(keyUp) 
				&& paddle.position.y > -this.field.height / 2 + paddle.height / 2) 
		{
			paddle.dirY = -paddle.speed;
		} 
		else 
		{
			paddle.dirY = 0;
		}
		let nextPositionY = paddle.position.y + paddle.dirY;
		// パドルがフィールドの上端または下端を超えないようにmax,min()で補正する
		// 理由：衝突の直前の最後の一回はspeed分だけ動くのでフィールドからはみ出る場合がある。
		let maxTop			= -this.field.height / 2 + paddle.height / 2;
		let maxBottom		= this.field.height / 2 - paddle.height / 2;
		paddle.position.y	= Math.max(Math.min(nextPositionY, maxBottom), maxTop);
		
	}

	async resetBall(loser) 
	{
		// 1秒停止してボールサーブ
		this.isResetting = true;
		await new Promise(resolve => setTimeout(resolve, 1000));
		this.isResetting = false;

		if (this.ball)
		{
			this.ball.position.set(0, 0, 0); 
			this.ball.dirX = loser === 1 ? -1 : 1;
			this.ball.dirY = Math.random() - 0.5;
			this.ball.speed = this.initBallSpeed;
		}
	}

	async updateGame() 
	{
					if (DEBUG_FLOW){	console.log("updateGame() start");	 };
		if (this.pongEngine && this.pongEngine.isRunning) 
		{ 
			await this.handleCollisions();
			if (this.pongEngine && this.pongEngine.isRunning){
				this.updateBallPosition();
			}
		}
		this.handlePaddleMovement();
					if (DEBUG_FLOW){	console.log("updateGame(): done ");	 };
	}

	dispose()
	{
		this.pongEngine 	= null;
		this.physics		= null;
		this.match			= null;
		this.pongEngineData = null;
		this.ball			= null;
		this.paddle1		= null;
		this.paddle2		= null;
		this.field			= null;
		this.difficulty		= null;
		this.maxBallSpeed	= null;
		this.initBallSpeed	= null;
		this.isResetting	= false;
	}

}

export default PongEngineUpdate;
