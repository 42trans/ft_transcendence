// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/RoundManager.js
import StateFirstRound from './StateFirstRound.js'
import StateSecondRound from './StateSecondRound.js'
import StateFinalRound from './StateFinalRound.js'
import StateOverView from './StateOverView.js';

/** ラウンドの切り替え */
class RoundManager 
{
	constructor(tournamentManager) 
	{
		this.tournamentManager	= tournamentManager;
		this.settings			= tournamentManager.settings;
		this.userTournaments	= null;

		this.states = {
			0: new StateOverView(this),
			1: new StateFirstRound(this),
			2: new StateSecondRound(this),
			3: new StateFinalRound(this),
		}
		this.currentState	= null;
		this.currentRound	= 0;
	}

	changeStateToRound(roundNumber) 
	{
		const newState = this.states[roundNumber];
		if (newState && this.currentRound !== roundNumber) 
		{
			if (this.currentState) {
				this.currentState.exit();
			}
			this.currentState = newState;
			this.currentState.enter();
			this.currentRound = roundNumber;
		}
	}
}

export default RoundManager;