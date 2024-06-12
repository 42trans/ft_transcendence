// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/tournamentMain.js
import TournamentManager	from './manager/TournamentManager.js';
import UserManager			from './manager/UserManager.js';
import RoundManager			from './manager/RoundManager.js';
import TournamentCreator	from './components/TournamentCreator.js';

// TODO_ft: サブコンテナの名称をcontainerとわかるものに変更・統一 ex. errMsgContainer
// 空文字列のplayerの試合はできない。前回が未終了の試合はできない　ハンドリング

// TODO_ft:エラー処理の統一 リファクタリング案
// APIからのjsonで、キーに'message':を統一して使用
// return JsonResponse({'status': 'error', 'message': 'Invalid player nicknames data.'}, status=400)
// throwはmessageを渡す
// throw new Error(responseData.message);
// UI表示する際は共通のputError()
// UIHelper.putError(error, this.errorMessage);


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
