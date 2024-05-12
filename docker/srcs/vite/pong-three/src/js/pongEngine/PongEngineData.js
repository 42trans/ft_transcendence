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
		// console.log('env data',this.env);
		// console.log('match data',this.matchData);

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
}

export default PongEngineData;