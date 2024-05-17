// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlinePaddleMover.js
import PongEngineKey from "./PongEngineKey.js";

class PongOnlinePaddleMover 
{
	static 	handlePaddleMovement(field, gameState) 
	{
		PongOnlinePaddleMover._updatePaddlePosition(field, gameState.paddle1, 'E', 'F');
		PongOnlinePaddleMover._updatePaddlePosition(field, gameState.paddle2, 'I', 'J');
	}
	
	/**
	 * 座標は左上が0,0 ※サーバーは中央が0,0
	 */
	static _updatePaddlePosition(field, paddle, keyUp, keyDown) 
	{
		// console.log("HM field H:", field.height);
		if (PongEngineKey.isDown(keyDown) 
			&& paddle.position.y < field.height - paddle.height / 2) 
		{
			paddle.dirY = paddle.speed;
		} 
		else if (PongEngineKey.isDown(keyUp) 
				&& paddle.position.y > 0 + paddle.height / 2) 
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
		let minTop = 0  + paddle.height / 2;
		let maxBottom = field.height  - paddle.height / 2;
		paddle.position.y = Math.max(Math.min(nextPositionY, maxBottom), minTop);

		// サーバーに送信されるパドル情報
		// console.log(`Updated paddle position: ${paddle.position.y}, Direction: ${paddle.dirY}`);
	}	

}

export default PongOnlinePaddleMover;



