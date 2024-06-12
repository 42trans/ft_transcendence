// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/tournamentMain.js
import TournamentManager	from './manager/TournamentManager.js';
import UserManager			from './manager/UserManager.js';
import RoundManager			from './manager/RoundManager.js';
import TournamentCreator	from './components/TournamentCreator.js';

// TODO_ft: サブコンテナの名称をcontainerとわかるものに変更・統一 ex. errMsgContainer


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
	} catch(error) {
		console.log("setupTournament: ", error);
	}

}
