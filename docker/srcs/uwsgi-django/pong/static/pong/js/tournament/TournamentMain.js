// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/tournamentMain.js
import TournamentManager	from './manager/TournamentManager.js';
import UserManager			from './manager/UserManager.js';
import RoundManager			from './manager/RoundManager.js';
import TournamentCreator	from './components/TournamentCreator.js';

// TODO_ft: サブコンテナの名称をcontainerとわかるものに変更・統一 ex. errMsgContainer
// 空文字列のplayerの試合はできない。前回が未終了の試合はできない　ハンドリング

/**
 * - entryの役割
 * - ドキュメントの完全な読み込みと解析が完了した後に実行する
 */
document.addEventListener('DOMContentLoaded', () => 
{
	// インスタンスは一つだけ
	const userManagement 	= new UserManager();
	const roundManager		= new RoundManager();
	const creator 			= new TournamentCreator();
	// 依存性注入
	const tournamentManager = new TournamentManager
	(
		userManagement, 
		roundManager, 
		creator
	);

	tournamentManager.main(0);
});
