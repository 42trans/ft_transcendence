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
			const data = await response.json();
			// マッチデータの配列を取得
			// {
			// 	"matches": [
			// 		{
			// 			"id": "試合ID",
			// 			"tournament_id": "トーナメントID",
			// 			"round_number": "ラウンド番号",
			// 			"match_number": "試合番号",
			// 			"player1": "プレイヤー1の名前",
			// 			"player2": "プレイヤー2の名前",
			// 			"player1_score": "プレイヤー1のスコア",
			// 			"player2_score": "プレイヤー2のスコア",
			// 			"is_finished": "試合が完了しているかどうか",
			// 			"date": "試合日時（ISO 8601形式）",
			// 			"tournament_name": "トーナメントの名前"
			// 		},
			// 		...
			// 	]
			// }
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
		this.matches.forEach(match => {
			const matchElement = document.createElement('div');
			matchElement.className = 'match';

			 // プレイヤー名が未確定の場合の処理
			 const player1 = match.player1 || "Winner";
			 const player2 = match.player2 || "Winner";

			let matchDetails = `
				<h4>Match #${match.match_number}: ${player1} vs ${player2}</h4>
			`;

			console.log(match);
			// 試合終了している場合はスコア表示
			if (match.is_finished) {
				matchDetails += `<p>Score: ${match.player1_score} - ${match.player2_score}, Winner: ${match.winner}</p>`;
			} else {
				// Pong gameへのリンク
				matchDetails += `<a href="/pong/play/${match.id}">Play</a>`;
			}
			console.log(match);

			// console.log(matchDetails);
			matchElement.innerHTML = matchDetails;
			this.tournamentContainer.appendChild(matchElement);
		});
		this.addNavigationLinks(roundNumber);
	}

	// ナビゲーションリンクの追加とイベントハンドラの設定
	addNavigationLinks(roundNumber) 
	{
		const container = document.createElement('div');
		container.id = 'round-navigation';
		container.innerHTML = `
			<button id="prev-round">prev</button>
			<button id="next-round">next</button>
		`;
		this.tournamentContainer.appendChild(container);

		document.getElementById('prev-round').addEventListener('click', () => {
			const newRound = Math.max(0, roundNumber - 1);
			this.roundManager.changeStateToRound(newRound);
		});
		document.getElementById('next-round').addEventListener('click', () => {
			const newRound = Math.min(3, roundNumber + 1);
			this.roundManager.changeStateToRound(newRound);
		});
	}
}

export default StateBaseRound;