// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/StateFirstRound.js
import StateBaseRound from './StateBaseRound.js'

/**
 * # StateFirstRound
 * - 目的: トーナメントの第一ラウンド固有の動作を管理
*/
class StateFirstRound extends StateBaseRound 
{
	constructor (roundManager)
	{
		// 基底クラスのコンストラクタ呼び出し
		// 定数や共通の変数は基底クラス StateBaseRound に持たせて継承して使用します。
		super(roundManager);
	}

	enter() 
	{
		// console.log("Entering Round 1");
		this.loadAndDisplayMatches(1);
	}

	exit() {
		// console.log("Exiting Round 1");
		this.tournamentContainer.innerHTML = ''; 
	}
}

export default StateFirstRound;
