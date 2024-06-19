import StateBaseRound	from './StateBaseRound.js'
import TournamentEntry	from '../components/TournamentEntry.js';
import { tournamentHandleCatchError } from "../TournamentMain.js";

const TEST_TRY1		= 0;

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
		try {
						if (TEST_TRY1) {	throw new Error('TEST_TRY1');	}
			this.tournamentContainer.innerHTML = ''; 
			// トーナメントの入り口を描画するクラスの呼び出し
			this.tournamentEntry.display(
				this.roundManager.userTournament,
				this.roundManager.userProfile
			);
		} catch(error) { 
			console.error('hth: StateEntry.enter(): ', error);
			tournamentHandleCatchError(error);
		}
	}

	exit() {
		// console.log("Exiting Tournament entry");
		this.tournamentContainer.innerHTML = ''; 
	}
}

export default StateEntry;