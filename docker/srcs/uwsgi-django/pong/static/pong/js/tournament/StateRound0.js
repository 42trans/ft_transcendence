import StateBaseRound from './StateBaseRound'

class StateRound0 extends StateBaseRound 
{
	enter() 
	{
		console.log("Entering Round 0 - Tournament Overview");
		// トーナメントの概要を設定するロジック
		this.manager.displayOverview();
	}

	update() {
	}

	exit() {
	  console.log("Exiting Round 0");
	}
}

export default StateRound0;