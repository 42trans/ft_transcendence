// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/main.js
import TournamentManager from './TournamentManager.js';

// ドキュメントの完全な読み込みと解析が完了した時に実行されるイベントリスナー
document.addEventListener('DOMContentLoaded', () => 
{
	const tournamentManager = new TournamentManager();
	tournamentManager.init();
});
