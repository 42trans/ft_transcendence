// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/StateFirstRound.js
import StateBaseRound from './StateBaseRound.js'

/**
 * # StateFirstRound
 * - 目的: トーナメントの第一ラウンド固有の動作を管理します。
 * - 役割: 第一ラウンドのマッチデータをロードし、表示します。未終了のマッチにはプレイリンクを提供し、終了しているマッチはスコアのみ表示します。
 */
class StateFirstRound extends StateBaseRound 
{
	constructor (roundManager)
	{
		// 基底クラスのコンストラクタ呼び出し
		super(roundManager);
		// 下記のような定数や共通の変数は基底クラスに持たせて継承して使用します。
		// this.settings			= roundManager.settings;
		// this.API_URL				= roundManager.settings.API_URLS;
		// this.tournamentContainer	= document.getElementById(this.settings.tournamentContainerId);
	}

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
			this.displayMatches();
		} catch (error) {
			console.error('Failed to load matches:', error);
			this.tournamentContainer.innerHTML = 'Failed to load matches.';
		}
	}

	displayMatches() 
	{
		this.tournamentContainer.innerHTML = ''; 
		this.matches.forEach(match => {
			const matchElement = document.createElement('div');
			matchElement.className = 'match';

			 // プレイヤー名が未確定の場合の処理
			 const player1 = match.player1 || "TBD";
			 const player2 = match.player2 || "TBD";

			let matchDetails = `
				<h4>Match #${match.match_number}: ${player1} vs ${player2}</h4>
			`;

			// winnerが存在する = 試合終了
			if (match.winner) {
				matchDetails += `<p>Score: ${match.player1_score} to ${match.player2_score}</p>`;
			} else {
				// Pong gameへのリンク
				matchDetails += `<a href="/play/${match.id}">Play</a>`;
			}

			// console.log(matchDetails);
			matchElement.innerHTML = matchDetails;
			this.tournamentContainer.appendChild(matchElement);
		});
	}

	enter() {
		console.log("Entering Round 1");
		// 一回戦を表示
		this.loadAndDisplayMatches(1);
	}

	update() {
		
	}

	exit() {
		console.log("Exiting Round 1");
	}
}

export default StateFirstRound;
