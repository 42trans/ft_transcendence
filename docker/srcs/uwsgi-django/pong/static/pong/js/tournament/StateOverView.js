import StateBaseRound from './StateBaseRound.js'
import TournamentEntry from './TournamentEntry.js';

/** トーナメント概要を表示する。Round 0として扱う */
class StateOverView extends StateBaseRound 
{
	constructor(roundManager) 
	{
		super(roundManager);
		this.tournamentEntry	= new TournamentEntry(roundManager.settings, this);
		this.userTournaments	= null;
	}

	enter() 
	{
		console.log("Entering Tournament Overview");
		// console.log('userTour-overview', this.userTournaments);
		// トーナメントの概要を表示するクラスの呼び出し
		this.tournamentEntry.display(this.userTournaments[0]);
	}

	exit() {
	  console.log("Exiting Tournament Overview");
	}
}

export default StateOverView;