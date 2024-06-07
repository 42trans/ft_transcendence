// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/TournamentManager.js
import { config }	from '../ConfigTournament.js';
import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"


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
		console.log('profile:', this.userProfile);
		try {
			const latestTournament = await this._getFilteredUserTournaments();
			// 主催トーナメントの開催状態で分岐
			if (latestTournament) {
				// console.log('latestTournament:', latestTournament);
				// roundManagerに必要な値を渡す
				this.roundManager.userTournament	= latestTournament;
				this.roundManager.userProfile		= this.userProfile;
				// トーナメント情報の表示
				this.roundManager.changeStateToRound(0);
			} else {
				console.log('!latestTournament:', latestTournament);
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
	 * @returns {Promise<Object|null>} 未終了のトーナメントオブジェクトまたはnull
	 * */
	async _getFilteredUserTournaments() 
	{
		if (!this.userProfile) {
			return null;
		}
		try {
			const response = await fetch(this.API_URLS.ongoingLatestTour, {
				headers: {'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
			});

			// ongoingが見つからない場合は204が返ってくるので、ここではそれ以外のエラーを処理する。
			if (!response.ok) 
			{
				// 他のエラーの場合は、何かしらのエラー処理を行う
				throw new Error(`Request failed with status ${response.status}`);
			}
			if (response.status === 204) {
				console.log('No ongoing tournaments found, received 204 No Content');
				return null;
			}
			
			const result = await response.json();
			// console.log('Latest tournament:', result);

			if (result && result.tournament) {
				// ongoing が見つかった場合
				return result.tournament;
			} else {
				// 見つからなかった場合
				console.log('ongoing tournament not found:', result.message);
				return null;
			}
		} catch (error) {
			console.error('Error checking user-owned ongoing tournament:', error);
			return null;
		}
	}

	/** ゲストユーザーへ表示する内容 */
	_handleGuestUser() {
		switchPage(routeTable['login'].path)
		// document.getElementById('tournament-container').innerHTML = `
		// 	<p>Please log in to manage or create tournaments.</p>
		// 	<p><a href="/accounts/login">Log in</a> or <a href="/accounts/signup">Sign up</a></p>
		// `;
	}
}

export default TournamentManager;
