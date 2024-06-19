// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/tournamentMain.js
import TournamentManager	from './manager/TournamentManager.js';
import UserManager			from './manager/UserManager.js';
import RoundManager			from './manager/RoundManager.js';
import TournamentCreator	from './components/TournamentCreator.js';
import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"

const DEBUG_FLOW	= 0;
const DEBUG_DETAIL	= 0;
const TEST_TRY1		= 0;

export function setupTournament() {
	try {
		// インスタンスは一つだけ
		const userManagement = new UserManager();
		const roundManager = new RoundManager();
		const creator = new TournamentCreator();

		// 依存性注入
		const tournamentManager = new TournamentManager(userManagement, roundManager, creator);

		// main関数を呼び出す
		tournamentManager.main();
				if (TEST_TRY1) {	throw new Error('TEST_TRY1');	}
	} catch(error) {
		console.error("hth: setupTournament: ", error);
		tournamentHandleCatchError(error);
	}
}

// ---------------------------------------
// error
// ---------------------------------------
export function tournamentHandleCatchError(error = null) 
{
	// location.hrefでSPAの状態を完全にリセットする
	if (error) {
		alert("エラーが発生しました。トップページに遷移します。 error: " + error);
	} else {
		alert("エラーが発生しました。トップページに遷移します。");
	}
	window.location.href = routeTable['top'].path;
}
