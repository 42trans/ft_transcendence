// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/StateBaseRound.js
import { config }	from '../ConfigTournament.js';
import { tournamentHandleCatchError } from "../TournamentMain.js";

const TEST_TRY1		= 0;
const TEST_TRY2		= 0;

/**
 * # StateBaseRound
 * - 目的: 各ラウンド共通のメソッドの実装、必要なメソッド（enter, exit, update）の強制
 * - 役割: 各ラウンドの共通の動作を定義。
 */
class StateBaseRound 
{
	constructor(roundManager) 
	{
		// インスタンス作成の禁止
		if (new.target === StateBaseRound) {
			throw new Error("StateBaseRound cannot be instantiated directly.");
		}
		// 子クラスでもthis.で使用可能にするために一括設定
		this.roundManager		= roundManager;
		this.API_URLS			= config.API_URLS;
		// 情報を表示するコンテナのIDを設定から取得
		this.userInfoContainer			= document.getElementById(config.userInfoId);
		this.errorMessage				= document.getElementById(config.errorMessageId);
		this.submitMessage				= document.getElementById(config.submitMessageId);
		this.backHomeButton				= document.getElementById(config.backHomeButtonId);
		this.ongoingTournamentContainer	= document.getElementById(config.ongoingTournamentId);
		this.tournamentRoundContainer	= document.getElementById(config.tournamentRoundId);
		this.tournamentContainer		= document.getElementById(config.tournamentContainerId);
	}
	
	enter()	{	console.error("method should be overridden.");	}
	exit()	{	console.error("method should be overridden.");	}

	async loadAndDisplayMatches(roundNumber) 
	{
		try {
						if (TEST_TRY1) {	throw new Error('TEST_TRY1');	}

			const response = await fetch(`${this.API_URLS.ongoingMatchesByRound}${roundNumber}/`);
			if (!response.ok) {
				throw new Error('Server responded with an error: ' + response.status);
			}
			const data = await response.json();
			this.matches = data.matches; 
			this._displayMatches(roundNumber);
		} catch (error) {
			console.error('hth: loadAndDisplayMatches() failed:', error);
			tournamentHandleCatchError(error);
			// this.tournamentContainer.innerHTML = 'Failed to load matches.';
		}
	}

	_displayMatches(roundNumber) 
	{
					if (TEST_TRY2) {	throw new Error('TEST_TRY2');	}

		this.tournamentContainer.innerHTML = ''; 
		// matchesが空の配列であるか、null/undefinedである場合は早期リターン
		if (!this.matches || this.matches.length === 0) {
			this.tournamentContainer.innerHTML = '<p>No matches available.</p>';
			return; // 早期リターン
		}
	
		this.matches.forEach(match => {
			const matchElement = document.createElement('div');
			matchElement.className = 'match';

			 // プレイヤー名が未確定の場合の処理
			 const player1 = match.player1 || "Winner";
			 const player2 = match.player2 || "Winner";

			let matchDetails = `
				<div class="round-result-score hth-transparent-black-bg-color mb-2">
				<h4 class="slideup-text round-match-title px-3 pt-3 mb-2">Match #${match.match_number}: ${player1} vs ${player2}</h4>
			`;

			// 試合終了している場合はスコア表示
			if (match.is_finished && match.ended_at) {
				const endedAt = new Date(match.ended_at); // ISO 8601形式の日時をDateオブジェクトに変換
				// ユーザーのロケールを自動で使用し、秒以降を除外
				const formattedEndedAt = endedAt.toLocaleString(undefined, {
					year: 'numeric', // 年
					month: '2-digit', // 月
					day: '2-digit', // 日
					hour: '2-digit', // 時
					minute: '2-digit' // 分
				});
				
				matchDetails += `<p class="slideup-text round-result-score text-white px-4  mb-0">Score: ${match.player1_score} - ${match.player2_score}</p>`;
				matchDetails += `<p class="slideup-text round-result-winner text-white px-4 mb-0">Winner: ${match.winner}</p>`;
				matchDetails += `<p class="slideup-text round-result-endedat text-white px-4 pb-2">Ended at: ${formattedEndedAt}</p>`;
				
			} else {
				if (match.can_start) {
					// Pong gameへのリンク APIにmatch.idを渡す。
					matchDetails += `<a class="slideup-text hth-btn px-3 mx-4 mt-2 mb-3" href="/app/game/match/${match.id}/" data-link>Start Match</a>`;
				} else {
					matchDetails += `<p class="slideup-text px-4 pb-2" >On Hold</p>`;
				}
			}
			matchDetails += '</div>'
			// console.log(matchDetails);
			matchElement.innerHTML = matchDetails;
			this.tournamentContainer.appendChild(matchElement);
		});
		const prevNavi = this.addPrevNavigationLinks(roundNumber, 'prev-round', 'slideup-text hth-btn my-5 me-5', 'prev');
		const nextNavi = this.addNextNavigationLinks(roundNumber, 'next-round', 'slideup-text hth-btn my-5', 'next');
		this.tournamentContainer.appendChild(prevNavi);
		this.tournamentContainer.appendChild(nextNavi);
	}

	addPrevNavigationLinks(roundNumber, id, className, textContents) 
	{
		const naviButton = document.createElement('button');
		naviButton.id = id;
		naviButton.className = className;
		naviButton.textContent = textContents;
		naviButton.onclick = () => {
			const newRound = Math.max(0, roundNumber - 1);
			this.roundManager.changeStateToRound(newRound);
		};
		return naviButton;
	}

	addNextNavigationLinks(roundNumber, id, className, textContents) 
	{
		const naviButton = document.createElement('button');
		naviButton.id = id;
		naviButton.className = className;
		naviButton.textContent = textContents;
		naviButton.onclick = () => {
			const newRound = Math.min(3, roundNumber + 1);
			this.roundManager.changeStateToRound(newRound);
		};
		// roundNumber が"3"の場合、 next ボタンを非表示
		if (roundNumber === 3) {
			naviButton.style.display = 'none';
		}
		return naviButton;
	}
}

export default StateBaseRound;
