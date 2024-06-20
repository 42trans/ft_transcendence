// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/TournamentEntry.js
import UIHelper				from '../UIHelper.js';
import { config }			from '../ConfigTournament.js';
import TournamentDeleter	from './TournamentDeleter.js';
import TournamentOverview	from './TournamentOverview.js';
import { tournamentHandleCatchError } from "../TournamentMain.js";

const DEBUG_FLOW		= 0;
const DEBUG_DETAIL		= 0;
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
		this.creator				= roundManager.creator;
		this.csrfToken				= UIHelper.getCSRFToken();

		this.userInfoContainer		= document.getElementById(config.userInfoId);		
		this.tournamentContainer	= document.getElementById(config.tournamentContainerId);
		this.errorMessage			= document.getElementById(config.errorMessageId);
		this.submitMessage			= document.getElementById(config.submitMessageId);
		
		this.tournamentDeleter		= new TournamentDeleter();
		this.tournamentOverview		= new TournamentOverview();
	}



	addCreateButton(userProfile) {
		const creaetButton = document.createElement('button');
		creaetButton.id = 'tournament-create-button';
		creaetButton.className = 'slideup-text hth-btn my-3';
		creaetButton.textContent = 'Create Tournament';					
		creaetButton.onclick = () => {
						if (DEBUG_DETAIL) {	console.log('creaetButton.onclick: start', this.creator);	}
			this.roundManager.changeStateToRound(5);
		}
		return creaetButton;
	}
	

	/** 注意: appendChildの順番は上から順番で追加される。 */
	async display(ongoingTournament, userProfile) 
	{
		try 
		{
						if (DEBUG_FLOW) {	console.log('display(): start');	}
						if (TEST_TRY1) {	throw new Error('TEST_TRY1');	}
			this.tournamentContainer.innerHTML = ''; 
						if (DEBUG_DETAIL) {	console.log('display(): userProfile:', userProfile);	}
			// 見出し要素を作成
			const header = await this.addDisplayHeader(ongoingTournament, userProfile);
			this.tournamentContainer.appendChild(header);

			// overviewクラスで概要（名称、日付、参加者nickname）を作成
			if (ongoingTournament)
			{
							if (DEBUG_FLOW) {	console.log('display(): 2');	}
				const overview = await this.tournamentOverview.generateOverview(ongoingTournament.id);
				const naviButton = this.addNavigationLinks();
				const deleteButton = this.addDeleteButton(ongoingTournament.id);	
				this.tournamentContainer.appendChild(overview);
				this.tournamentContainer.appendChild(naviButton);
				this.tournamentContainer.appendChild(deleteButton);
			} else {
				// トーナメント新規作成ボタン
				const creaeteButton = this.addCreateButton(this.roundManager.userProfile);
				this.tournamentContainer.appendChild(creaeteButton);
			}
		} catch(error) { 
			tournamentHandleCatchError(error);
		}
	}

	/** トーナメントが進行中であることを示す見出しを作成 */
	async addDisplayHeader(ongoingTournament, userProfile) 
	{
					if (TEST_TRY2) {	throw new Error('TEST_TRY2');	}

		// UIHelper.displayUserInfo(userProfile, this.tournamentContainer);
		const header = document.createElement('h2');
		header.id = 'overview-header';
		header.className = 'slideup-text';
		if (ongoingTournament){
			header.textContent = `Tournament is in progress.`;
		} else {
			header.textContent = `Welcome back! ${userProfile.nickname}! `;
		}
		return header;
	}

	/** ナビゲーションリンクの作成とイベントハンドラの設定 */
	addNavigationLinks() 
	{
		const naviButton = document.createElement('button');
		naviButton.id = 'round-navigation';
		naviButton.className = 'slideup-text hth-btn my-3';
		naviButton.textContent = 'Round';
		naviButton.onclick = () => this.roundManager.changeStateToRound(1);
					if (TEST_TRY3) {	throw new Error('TEST_TRY3');	}
		return naviButton;
	}


	// 削除ボタンの作成ととイベントハンドラの設定
	addDeleteButton(tournamentId) {
		const deleteButton = document.createElement('button');
		deleteButton.id = 'delete-button';
		deleteButton.className = 'slideup-text hth-btn my-3 mx-5';
		deleteButton.textContent = 'Delete Tournament';
		deleteButton.onclick = async () => 
		{
			if (confirm('Delete this tournament?')) {
				await this.tournamentDeleter.deleteTournament(tournamentId);
			}
		}
		return deleteButton;
	}
}

export default TournamentEntry;
