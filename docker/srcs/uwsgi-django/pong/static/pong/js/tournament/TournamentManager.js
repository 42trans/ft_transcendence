// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/TournamentManager.js
import TournamentCreator from './TournamentCreator.js';
import UserManagement from './UserManagement.js';
// import UIHelper from './UIHelper.js';
import RoundManager from './RoundManager.js';

class TournamentManager 
{
	constructor(settings) 
	{
		this.userProfile		= null;
		this.csrfToken			= null;
		this.settings			= settings;
		this.API_URLS 			= settings.API_URLS;
		this.userManagement 	= new UserManagement(settings);
		this.roundManager		= new RoundManager(this);
		this.creator 			= new TournamentCreator(settings);

		// 情報を表示するコンテナのIDを設定から取得
		this.tournamentForm				= document.getElementById(settings.tournamentFormId);
		this.userInfoContainer			= document.getElementById(settings.userInfoId);
		this.errorMessage				= document.getElementById(settings.errorMessageId);
		this.submitMessage				= document.getElementById(settings.submitMessageId);
		this.backHomeButton				= document.getElementById(settings.backHomeButtonId);
		this.ongoingTournamentContainer	= document.getElementById(settings.ongoingTournamentId);
		this.tournamentRoundContainer	= document.getElementById(settings.tournamentRoundId);
		this.tournamentContainer		= document.getElementById(settings.tournamentContainerId);
	}

	/**
	 * 処理フロー: まずログイン状態で分岐
	 */
	async main() 
	{
		try {
			this.userProfile = await this.userManagement.getUserProfile();
			if (this.userProfile) {
				await this.handleLoggedInUser();
			} else {
				this.handleGuestUser();
			}
		} catch (error) {
			console.error(`TournamentManager init() failed`);
			this.tournamentContainer.textContent = "Error loading your information. Try again later.";
		}
	}

	/** 
	 * 処理フロー： 次に、主催トーナメントの開催状態で分岐:トーナメント対戦表 or　作成form を表示 
	 * */
	async handleLoggedInUser() 
	{
		// console.log('profile:', this.userProfile);
		try {
			const userTournaments = await this.getFilteredUserTournaments();
			// 主催トーナメントの開催状態で分岐
			if (userTournaments.length > 0) {
				// 0の場合(over view)だけ特殊
				this.roundManager.states[0].userTournaments = userTournaments;
				// トーナメント情報の表示
				this.roundManager.changeStateToRound(1);
			} else {
				// トーナメント新規作成フォームを表示
				this.creator.createForm(this.userProfile);
			}
		} catch (error) {
			console.error('Error checking tournaments:', error);
			this.tournamentContainer.textContent = 'Error loading tournaments.';
		}
	}

	/**
	 * ユーザーが主催する"未終了"のトーナメントのリストを取得
	 * @returns {Promise<Array>} 未終了のトーナメントの配列
	 */
	async getFilteredUserTournaments() 
	{
		// const userProfile = await this.getUserProfile();
		if (!this.userProfile) {
			return [];
		}
		try {
			const response = await fetch(this.API_URLS.ongoingTournaments, {
			// const response = await fetch('/pong/api/tournament/user/ongoing/', {
				headers: {'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`}
			});
			const tournaments = await response.json();
			console.log('tournaments:', tournaments);
			return tournaments.filter(tournament => !tournament.is_finished && tournament.organizer === this.userProfile.id);
		} catch (error) {
			console.error('Error checking user-owned ongoing tournaments:', error);
			return [];
		}
	}

	/** ゲストユーザーへ表示する内容 */
	handleGuestUser() {
		document.getElementById('tournament-container').innerHTML = `
			<p>Please log in to manage or create tournaments.</p>
			<p><a href="/accounts/login">Log in</a> or <a href="/accounts/signup">Sign up</a></p>
		`;
	}
}

export default TournamentManager;
