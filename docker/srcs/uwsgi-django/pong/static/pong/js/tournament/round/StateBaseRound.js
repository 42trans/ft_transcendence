// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/StateBaseRound.js
import { config }	from '../ConfigTournament.js';

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
		this.tournamentForm				= document.getElementById(config.tournamentFormId);
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
			const response = await fetch(`${this.API_URLS.ongoingMatchesByRound}${roundNumber}`);
			if (!response.ok) {
				throw new Error('Server responded with an error: ' + response.status);
			}
			const data = await response.json();
			this.matches = data.matches; 
			this.displayMatches(roundNumber);
		} catch (error) {
			console.error('Failed to load matches:', error);
			this.tournamentContainer.innerHTML = 'Failed to load matches.';
		}
	}

	displayMatches(roundNumber) 
	{
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
				<h4>Match #${match.match_number}: ${player1} vs ${player2}</h4>
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
				matchDetails += `<p>Score: ${match.player1_score} - ${match.player2_score}</p>`;
				matchDetails += `<p>Winner: ${match.winner}</p>`;
				matchDetails += `<p>Ended at: ${formattedEndedAt}</p>`;
			} else {
				if (match.can_start) {
					// Pong gameへのリンク APIにmatch.idを渡す。
					matchDetails += `<a class='hth-btn mt-2 mb-3' href="/pong/play/${match.id}">Start Match</a>`;
				} else {
					matchDetails += `<p>On Hold</p>`;
				}
			}
			// console.log(matchDetails);
			matchElement.innerHTML = matchDetails;
			this.tournamentContainer.appendChild(matchElement);
		});
		const prevNavi = this.addPrevNavigationLinks(roundNumber, 'prev-round', 'hth-btn my-5 me-5', 'prev');
		const nextNavi = this.addNextNavigationLinks(roundNumber, 'next-round', 'hth-btn my-5', 'next');
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
		return naviButton;
	}
}

export default StateBaseRound;