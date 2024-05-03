// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/ConfigTournament.js

/** 
 * 定数のみのクラス。シングルトン 
 * ## 呼び出し方:
 * - importする: import { config }	from '../ConfigTournament.js';
 * - `config.`で変数を呼び出す: ex. config.tournamentFormId
 * */
class ConfigTournament 
{
	constructor() 
	{
		if (ConfigTournament.instance) {
			return ConfigTournament.instance;
		}
		this.init();
		ConfigTournament.instance = this;
	}

	init() 
	{
		this.tournamentFormId		= 'tournament-form';
		this.userInfoId				= 'user-info';
		this.errorMessageId			= 'error-message';
		this.submitMessageId		= 'submit-message';
		this.backHomeButtonId		= 'back-home';
		this.ongoingTournamentId	= 'ongoing-tournament';
		this.tournamentRoundId		= 'tournament-round';
		this.tournamentContainerId	= 'tournament-container';
		this.API_URLS = {
			userProfile:			'/accounts/api/user/profile/',
			tournamentCreate:		'/pong/api/tournament/create/',
			tournamentDelete:		'/pong/api/tournament/delete/',
			tournamentData:			'/pong/api/tournament/data/',
			ongoingMatchesByRound:	'/pong/api/tournament/user/ongoing/matches/', 
			ongoingTournaments:		'/pong/api/tournament/user/ongoing/all/',
			ongoingLatestTour:		'/pong/api/tournament/user/ongoing/latest/',
			// 使用していない
			ongoingAllMatches:		'/pong/api/tournament/user/ongoing/matches/all/',
			// 
		};
	}
}

export const config = new ConfigTournament();
