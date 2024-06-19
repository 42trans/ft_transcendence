// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/TournamentManager.js
import { config }	from '../ConfigTournament.js';
import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js";
import { tournamentHandleCatchError } from "../TournamentMain.js";

// console.log: 出力=true、本番時はfalseに設定。0,1でも動く
const DEBUG_FLOW		= 0;
const DEBUG_DETAIL		= 0;
const TEST_TRY1 		= 0;
const TEST_TRY2 		= 0;
const TEST_TRY3 		= 0;

/**
 * 処理フロー: 
 * main(): まずログイン状態で分岐
 * _handleLoggedInUser(): 次に、主催トーナメントの開催状態で分岐:トーナメント対戦表 or　作成form を表示 
 */
class TournamentManager 
{
	constructor(userManagement, roundManager, creator) 
	{
		this.API_URLS 				= config.API_URLS;
		this.tournamentContainer	= document.getElementById(config.tournamentContainerId);
		this.userManagement			= userManagement;
		this.roundManager			= roundManager;
		this.tournamentCreator		= creator;
		this.userProfile			= null;
	}


	async main() 
	{
		try {
					if (DEBUG_FLOW){	console.log('main():');	}
					if (TEST_TRY1){	throw new Error('TEST_TRY1');	}

			this.userProfile = await this.userManagement.getUserProfile();
			if (this.userProfile) {
				await this._handleLoggedInUser();
			} else {
				this._handleGuestUser();
			}
		} catch (error) {
			console.error("hth: TournamentManager.main() failed", error);
			// this.tournamentContainer.textContent = "Error loading your information. Try again later.";
			tournamentHandleCatchError(error);
		}
	}


	async _handleLoggedInUser() 
	{
		
		try {
					if (DEBUG_FLOW){	console.log('_handleLoggedInUser(): profile:', this.userProfile);	}
					if (TEST_TRY2){	throw new Error('TEST_TRY2');	}

			const latestTournament = await this._getFilteredUserTournaments();
			// 主催トーナメントの開催状態で分岐
			if (latestTournament) {

						if (DEBUG_DETAIL){	console.log('latestTournament:', latestTournament);	}

				// roundManagerに必要な値を渡す
				this.roundManager.userTournament	= latestTournament;
				this.roundManager.userProfile		= this.userProfile;
				// トーナメント情報の表示
				this.roundManager.changeStateToRound(0);
			} else {
						if (DEBUG_FLOW){	console.log('!latestTournament');	}
				
				// トーナメント新規作成フォームを表示
				this.tournamentCreator.createForm(this.userProfile);
			}
		} catch (error) {
			console.error('hth: _handleLoggedInUser() failed: ', error);
			// this.tournamentContainer.textContent = 'Error loading tournaments.';
			tournamentHandleCatchError(error);
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
					if (TEST_TRY3){	throw new Error('TEST_TRY3');	}

			const response = await fetch(this.API_URLS.ongoingLatestTour);
			// ongoingが見つからない場合は204が返ってくるので、ここではそれ以外のエラーを処理する。現状、APIにはそのような実装はないがハンドリングしておく
			if (!response.ok) {
				throw new Error(`Request failed with status ${response.status}`);
			}
			if (response.ok && response.status === 204) {
						if (DEBUG_FLOW){	console.log('ongoing tournament not found: received 204 No Content');	}
				return null;
			}
			const result = await response.json();
					if (DEBUG_DETAIL){	console.log('Latest tournament:', result);	}
			if (result && result.tournament) {
				// ongoing が見つかった場合
				return result.tournament;
			} else {
						if (DEBUG_FLOW){	console.log('ongoing tournament not found:', result.message);	}
				// 204でreturn済みだが、念の為見つからなかった場合のハンドリング
				return null;
			}
		} catch (error) {
			console.error('hth: _getFilteredUserTournaments() failed:', error);
			// null: createForm()による新規作成画面の表示
			return null;
		}
	}

	/** ゲストユーザーへ表示する内容 */
	_handleGuestUser() {
		// view関数で/login/にリダイレクトされるが、念の為に↓を用意しておく
		document.getElementById('tournament-container').innerHTML = `
			<p>Please log in to manage or create tournaments.</p>
			<p><a href="${routeTable['login'].path}" data-link>Log in</a> or <a href="${routeTable['signup'].path}" data-link>Sign up</a></p>
		`;
	}
}

export default TournamentManager;
