// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/StateSecondRound.js
import StateBaseRound from './StateBaseRound.js'

class StateSecondRound extends StateBaseRound 
{
	constructor (roundManager){
		super(roundManager);
	}

	enter() {
		// console.log("Entering Round 2");
		this.loadAndDisplayMatches(2);
	}

	exit() {
		// console.log("Exiting Round 2");
		this.tournamentContainer.innerHTML = ''; 
	}
}

export default StateSecondRound;
