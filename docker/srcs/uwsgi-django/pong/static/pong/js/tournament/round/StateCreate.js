import StateBaseRound	from './StateBaseRound.js'
import TournamentEntry	from '../components/TournamentEntry.js';
import { tournamentHandleCatchError } from "../TournamentMain.js";

const TEST_TRY1		= 0;

/** トーナメントの最初の初期のページ。Round 0として扱う */
class StateCreate extends StateBaseRound 
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

			this.roundManager.creator.createForm(this.roundManager.userProfile);
		} catch(error) { 
			console.error('hth: StateCreate.enter(): ', error);
			tournamentHandleCatchError(error);
		}
	}

	exit() {
		// console.log("Exiting Tournament entry");
		this.tournamentContainer.innerHTML = ''; 
	}
}

export default StateCreate;