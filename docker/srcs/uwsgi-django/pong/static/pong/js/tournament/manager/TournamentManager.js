// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/TournamentManager.js
import { config }	from '../ConfigTournament.js';

class TournamentManager 
{
	constructor(userManagement, roundManager, creator) 
	{
		this.API_URLS 				= config.API_URLS;
		this.tournamentContainer	= document.getElementById(config.tournamentContainerId);
		// 依存性注入
		this.userManagement		= userManagement;
		this.roundManager		= roundManager;
		this.tournamentCreator	= creator;
		// 
		this.userProfile	= null;
	}

	/**
	 * 処理フロー: まずログイン状態で分岐
	 */
	async main() 
	{
		try {
			this.userProfile = await this.userManagement.getUserProfile();
			if (this.userProfile) {
				await this._handleLoggedInUser();
			} else {
				this._handleGuestUser();
			}
		} catch (error) {
			console.error(`TournamentManager init() failed`);
			this.tournamentContainer.textContent = "Error loading your information. Try again later.";
		}
	}

	/** 
	 * 処理フロー： 次に、主催トーナメントの開催状態で分岐:トーナメント対戦表 or　作成form を表示 
	 * */
	async _handleLoggedInUser() 
	{
		// console.log('profile:', this.userProfile);
		try {
			const userTournaments = await this._getFilteredUserTournaments();
			// 主催トーナメントの開催状態で分岐
			if (userTournaments.length > 0) {
				// 必要な値を渡す
				this.roundManager.userTournaments	= userTournaments;
				this.roundManager.userProfile		= this.userProfile;
				// トーナメント情報の表示
				this.roundManager.changeStateToRound(0);
			} else {
				// トーナメント新規作成フォームを表示
				this.tournamentCreator.createForm(this.userProfile);
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
	async _getFilteredUserTournaments() 
	{
		// const userProfile = await this.getUserProfile();
		if (!this.userProfile) {
			return [];
		}
		try {
			const response = await fetch(this.API_URLS.ongoingTournaments, {
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
	_handleGuestUser() {
		document.getElementById('tournament-container').innerHTML = `
			<p>Please log in to manage or create tournaments.</p>
			<p><a href="/accounts/login">Log in</a> or <a href="/accounts/signup">Sign up</a></p>
		`;
	}
}

export default TournamentManager;
