// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/RoundManager.js
import StateFirstRound	from '../round/StateFirstRound.js'
import StateSecondRound from '../round/StateSecondRound.js'
import StateFinalRound	from '../round/StateFinalRound.js'
import StateEntry		from '../round/StateEntry.js';
import { config }		from '../ConfigTournament.js';
import { tournamentHandleCatchError } from "../TournamentMain.js";
import StateCreate from '../round/StateCreate.js';

const DEBUG_FLOW		= 0;
const TEST_TRY1 		= 0;

/** ラウンドの切り替え */
class RoundManager 
{
	constructor(creator) 
	{
		this.creator			= creator;
		this.API_URLS			= config.API_URLS;
		this.userTournament		= null;
		this.userProfile		= null;
		this.currentState		= null;
		// 開始時が0のため,0以外の仮の値
		this.currentRound		= 999;

		// 番号(roundNumber)で切り替える
		this.states = {
			0: new StateEntry(this),
			1: new StateFirstRound(this),
			2: new StateSecondRound(this),
			3: new StateFinalRound(this),
			5: new StateCreate(this),
		}
	}

	changeStateToRound(roundNumber) 
	{
		try {
						if (DEBUG_FLOW){	console.log('changeStateToRound(): start');	}
			const newState = this.states[roundNumber];
			if (!newState || this.currentRound === roundNumber) {
				return;
			} else {
				this.currentRound = roundNumber;
				if (this.currentState) {
					this.currentState.exit();
				}
				// console.log('currentRound', this.currentRound);
				this.currentState = newState;
				this.currentState.enter();
			}
						if (TEST_TRY1){	throw new Error('TEST_TRY1');	}
		} catch(error) {
			console.error("hth: changeStateToRound() failed: ", error);
			// トーナメントページが一切表示できないのでtopにリダイレクトする
			tournamentHandleCatchError(error);
		}
	}
}

export default RoundManager;