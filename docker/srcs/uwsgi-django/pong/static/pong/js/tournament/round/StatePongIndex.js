import StateBaseRound	from './StateBaseRound.js'
import PongIndex	from '../components/PongIndex.js';

/** トーナメントの最初の初期のページ。Round 0として扱う */
class StatePongIndex extends StateBaseRound 
{
	constructor(roundManager) 
	{
		super(roundManager);
		this.pongIndex		= new PongIndex(roundManager);
		this.roundManager	= roundManager;
	}
	
	enter() 
	{
		this.tournamentContainer.innerHTML = ''; 
		// console.log("Entering Tournament entry");
		// トーナメントの入り口を描画するクラスの呼び出し
		this.pongIndex.display(
			this.roundManager.userTournament,
			this.roundManager.userProfile
		);
	}

	exit() {
		// console.log("Exiting Tournament entry");
		this.tournamentContainer.innerHTML = ''; 
	}
}

export default StatePongIndex;