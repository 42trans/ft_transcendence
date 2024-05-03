import StateBaseRound	from './StateBaseRound.js'
import TournamentEntry	from '../components/TournamentEntry.js';

/** トーナメントの最初の初期のページ。Round 0として扱う */
class StateEntry extends StateBaseRound 
{
	constructor(roundManager) 
	{
		super(roundManager);
		this.tournamentEntry	= new TournamentEntry(roundManager);
		this.roundManager		= roundManager;
	}
	
	enter() 
	{
		this.tournamentContainer.innerHTML = ''; 
		// console.log("Entering Tournament entry");
		// トーナメントの入り口を描画するクラスの呼び出し
		this.tournamentEntry.display(
			this.roundManager.userTournament,
			this.roundManager.userProfile
		);
	}

	exit() {
		// console.log("Exiting Tournament entry");
		this.tournamentContainer.innerHTML = ''; 
	}
}

export default StateEntry;