// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/RoundManager.js
import StateFirstRound	from '../round/StateFirstRound.js'
import StateSecondRound from '../round/StateSecondRound.js'
import StateFinalRound	from '../round/StateFinalRound.js'
import StateEntry		from '../round/StateEntry.js';
import StatePongIndex	from '../round/StatePongIndex.js';
import { config }		from '../ConfigTournament.js';

/** ラウンドの切り替え */
class RoundManager 
{
	constructor() 
	{
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
			11: new StatePongIndex(this),
		}
	}

	changeStateToRound(roundNumber) 
	{
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
	}
}

export default RoundManager;