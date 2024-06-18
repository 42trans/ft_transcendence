// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/TournamentEntry.js
import UIHelper				from '../UIHelper.js';
import { config }			from '../ConfigTournament.js';
import TournamentDeleter	from './TournamentDeleter.js';
import TournamentOverview	from './TournamentOverview.js';
import { tournamentHandleCatchError } from "../TournamentMain.js";

const TEST_TRY1 		= 0;
const TEST_TRY2 		= 0;
const TEST_TRY3 		= 0;

/** 
 * トーナメントの入り口のページを構築 
 * - display()で、各部品を集めて表示する。内容は実装に応じて変更予定。
 * - 後々の変更に対応するため、部品化・クラス化しておく。
 * */
class TournamentEntry 
{
	constructor(roundManager) 
	{
		this.roundManager			= roundManager;
		this.csrfToken				= UIHelper.getCSRFToken();

		this.userInfoContainer		= document.getElementById(config.userInfoId);
		this.tournamentContainer	= document.getElementById(config.tournamentContainerId);
		this.errorMessage			= document.getElementById(config.errorMessageId);
		this.submitMessage			= document.getElementById(config.submitMessageId);
		
		this.tournamentDeleter		= new TournamentDeleter();
		this.tournamentOverview		= new TournamentOverview();
	}

	/** 注意: appendChildの順番は上から順番で追加される。 */
	async display(ongoingTournament, userProfile) 
	{
		try {
						if (TEST_TRY1) {	throw new Error('TEST_TRY1');	}

			this.tournamentContainer.innerHTML = ''; 
			// 見出し要素を作成
			const header = await this.addDisplayHeader(userProfile);
			// overviewクラスで概要（名称、日付、参加者nickname）を作成
			const overview = await this.tournamentOverview.generateOverview(ongoingTournament.id);
			// ナビを作成
			const naviButton = this.addNavigationLinks();

			// 現時点では不要なので非表示
			// トーナメントid要素を作成
			// const tourId = this.addAddTournamentId(ongoingTournament.id);

			// 削除ボタンを作成
			const deleteButton = this.addDeleteButton(ongoingTournament.id);

			// 作成した<div>要素をhtmlに追加
			this.tournamentContainer.appendChild(header);
			this.tournamentContainer.appendChild(naviButton);
			this.tournamentContainer.appendChild(overview);
			this.tournamentContainer.appendChild(deleteButton);
			
			// this.tournamentContainer.appendChild(tourId);
		} catch(error) { 
			tournamentHandleCatchError(error);
		}
	}

	/** トーナメントが進行中であることを示す見出しを作成 */
	async addDisplayHeader(userProfile) 
	{
					if (TEST_TRY2) {	throw new Error('TEST_TRY2');	}

		UIHelper.displayUserInfo(userProfile, this.tournamentContainer);
		const header = document.createElement('h2');
		header.id = 'overview-header';
		header.textContent = 'Tournament is in progress.';
		return header;
	}

	/** ナビゲーションリンクの作成とイベントハンドラの設定 */
	addNavigationLinks() 
	{
		const naviButton = document.createElement('button');
		naviButton.id = 'round-navigation';
		naviButton.className = 'hth-btn my-3';
		naviButton.textContent = 'Round';
		naviButton.onclick = () => this.roundManager.changeStateToRound(1);
					if (TEST_TRY3) {	throw new Error('TEST_TRY3');	}
		return naviButton;
	}

	// 削除ボタンの作成ととイベントハンドラの設定
	addDeleteButton(tournamentId) {
		const deleteButton = document.createElement('button');
		deleteButton.id = 'delete-button';
		deleteButton.className = 'hth-btn my-3';
		deleteButton.textContent = 'Delete Tournament';
		deleteButton.onclick = async () => {
			if (confirm('Delete this tournament?')) {
				await this.tournamentDeleter.deleteTournament(tournamentId);
			}
		}
		return deleteButton;
	}

	// トーナメントIDを作成
	// addAddTournamentId(tournamentId) 
	// {
	// 	const tourId = document.createElement('p');
	// 	tourId.id = 'tourId';
	// 	tourId.textContent = `tournament ID: ${tournamentId}`;
	// 	return tourId;
	// }

}

export default TournamentEntry;
