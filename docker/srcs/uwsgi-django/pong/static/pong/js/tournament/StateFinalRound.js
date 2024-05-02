// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/StateFinalRound.js
import StateBaseRound from './StateBaseRound.js'

class StateFinalRound extends StateBaseRound 
{
	constructor (roundManager){
		super(roundManager);
	}

	enter() {
		// console.log("Entering Round 3");
		this.loadAndDisplayMatches(3);
	}

	exit() {
		// console.log("Exiting Round 3");
	}
}

export default StateFinalRound;
