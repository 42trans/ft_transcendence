// docker/srcs/vite/pong-three/src/js/pongEngine/PongEngineData.js
import PongEngine from "./PongEngine";
import PongEngineInit from "./PongEngineInit";

class PongEngineData 
{
	constructor(pongEngine) 
	{
		this.pongEngine	= pongEngine;
		this.config		= pongEngine.config;
		this.scene		= pongEngine.scene;
		this.objects	= {};
		this.settings	= {};
		this.env		= pongEngine.env;
		this.matchData	= pongEngine.matchData;

		this.state = 
		{
			score1: 0,
			score2: 0,
		};
	}

	updateScore(player, score) 
	{
		if (player === 1) 
		{
			this.state.score1 += score;
		} 
		else if (player === 2) 
		{
			this.state.score2 += score;
		}
	}

	dispose() 
	{
		this.pongEngine	= null; 
		this.config		= null;
		this.scene		= null;
		this.objects	= null;
		this.settings	= null;
		this.env		= null;
		this.matchData	= null;
		this.state		= null; 
	}
	
}

export default PongEngineData;