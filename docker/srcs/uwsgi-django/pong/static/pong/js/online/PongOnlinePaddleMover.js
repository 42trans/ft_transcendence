// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlinePaddleMover.js
import PongEngineKey from "./PongEngineKey.js";

class PongOnlinePaddleMover 
{
	static 	handlePaddleMovement(field, gameState) 
	{
		if (!gameState || !gameState.objects || !gameState.objects.paddle1) {
			console.error('Invalid gameState:', this.gameState);
			return;
		}
		
		PongOnlinePaddleMover._updatePaddlePosition(field, gameState.objects.paddle1, 'E', 'F');
		PongOnlinePaddleMover._updatePaddlePosition(field, gameState.objects.paddle2, 'I', 'J');
	}
	
	static _updatePaddlePosition(field, paddle, keyUp, keyDown) 
	{
		if (PongEngineKey.isDown(keyDown) 
			&& paddle.position.y < field.height / 2 - paddle.height / 2) 
		{
			paddle.dir_y = paddle.speed;
		} 
		else if (PongEngineKey.isDown(keyUp) 
				&& paddle.position.y > -field.height / 2 + paddle.height / 2) 
		{
			paddle.dir_y = -paddle.speed;
		} 
		else 
		{
			paddle.dir_y = 0;
		}
		let nextPositionY = paddle.position.y + paddle.dir_y;
		// パドルがフィールドの上端または下端を超えないようにmax,min()で補正する
		// 理由：衝突の直前の最後の一回はspeed分だけ動くのでフィールドからはみ出る場合がある。
		let maxTop			= -field.height / 2 + paddle.height / 2;
		let maxBottom		= field.height / 2 - paddle.height / 2;
		paddle.position.y	= Math.max(Math.min(nextPositionY, maxBottom), maxTop);
	}	

}

export default PongOnlinePaddleMover;



	// // 特定のキー入力に基づいてパドルを動かす
	// updatePaddlePosition(paddle, keyUp, keyDown) 
	// {
	// 	if (PongEngineKey.isDown(keyDown) 
	// 		&& paddle.position.y < this.field.height / 2 - paddle.height / 2) 
	// 	{
	// 		paddle.dirY = paddle.speed;
	// 	} 
	// 	else if (PongEngineKey.isDown(keyUp) 
	// 			&& paddle.position.y > -this.field.height / 2 + paddle.height / 2) 
	// 	{
	// 		paddle.dirY = -paddle.speed;
	// 	} 
	// 	else 
	// 	{
	// 		paddle.dirY = 0;
	// 	}
	// 	let nextPositionY = paddle.position.y + paddle.dirY;
	// 	// パドルがフィールドの上端または下端を超えないようにmax,min()で補正する
	// 	// 理由：衝突の直前の最後の一回はspeed分だけ動くのでフィールドからはみ出る場合がある。
	// 	let maxTop = -this.field.height / 2 + paddle.height / 2;
	// 	let maxBottom = this.field.height / 2 - paddle.height / 2;
	// 	paddle.position.y = Math.max(Math.min(nextPositionY, maxBottom), maxTop);
	// }	

