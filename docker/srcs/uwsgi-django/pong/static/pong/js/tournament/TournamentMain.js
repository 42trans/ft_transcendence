// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/tournamentMain.js
import TournamentManager from './TournamentManager.js';

// htmlに挿入する場所の指定
const settings = {
	tournamentFormId: 		'tournament-form',
	userInfoId: 			'user-info',
	errorMessageId: 		'error-message',
	submitMessageId: 		'submit-message',
	backHomeButtonId: 		'back-home',
	ongoingTournamentId: 	'ongoing-tournament',
	tournamentRoundId: 		'tournament-round',
	tournamentContainerId:	'tournament-container',
	API_URLS: {
		userProfile: '/accounts/api/user/profile/',
		ongoingTournaments: '/pong/api/tournament/user/ongoing/'
	}
};

// ドキュメントの完全な読み込みと解析が完了した時に実行されるイベントリスナー
document.addEventListener('DOMContentLoaded', () => 
{
	const tournamentManager = new TournamentManager(settings);
	tournamentManager.main();
});
