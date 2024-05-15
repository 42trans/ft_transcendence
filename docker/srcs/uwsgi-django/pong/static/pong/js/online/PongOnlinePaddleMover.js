// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlinePaddleMover.js
import PongEngineKey from "./PongEngineKey.js";

class PongOnlinePaddleMover 
{
	static 	handlePaddleMovement(field, gameState) 
	{
		// console.log("HM gameState:", gameState);

		PongOnlinePaddleMover._updatePaddlePosition(field, gameState.paddle1, 'J', 'L');
		PongOnlinePaddleMover._updatePaddlePosition(field, gameState.paddle2, 'F', 'S');
	}
	
	static _updatePaddlePosition(field, paddle, keyUp, keyDown) 
	{
		// console.log("HM paddle H:", paddle.height);
		// console.log("HM field H:", field.height);
		if (PongEngineKey.isDown(keyDown) 
			&& paddle.position.y < field.height / 2 - paddle.height / 2) 
		{
			paddle.dirY = paddle.speed;
		} 
		else if (PongEngineKey.isDown(keyUp) 
				&& paddle.position.y > -field.height / 2 + paddle.height / 2) 
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
		let maxTop = -field.height / 2 + paddle.height / 2;
		let maxBottom = field.height / 2 - paddle.height / 2;
		paddle.position.y = Math.max(Math.min(nextPositionY, maxBottom), maxTop);
	}	

}

export default PongOnlinePaddleMover;



