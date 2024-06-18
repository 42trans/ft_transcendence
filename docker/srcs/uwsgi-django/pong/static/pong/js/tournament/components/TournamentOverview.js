// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/components/TournamentOverview.js
import { config }	from '../ConfigTournament.js';
// import { tournamentHandleCatchError } from "../TournamentMain.js";

const TEST_TRY1 		= 0;
const TEST_TRY2 		= 0;
const TEST_TRY3 		= 0;

/**
 * - ゲストも利用可能なAPIを用いている
 */
class TournamentOverview 
{
	constructor() { /** empty */ }

	/**
	 * トーナメントIDを受け取り、トーナメントの詳細を取得後、それを表示するHTMLエレメントを生成。
	 * createElementのみを行い、appendChildは呼び出し元で行う。
	 * @param {number} tournamentId トーナメントのID
	 * @returns {Promise<HTMLElement>} トーナメントの詳細情報を表示するHTMLエレメント
	 */
	async generateOverview(tournamentId) 
	{
					if (TEST_TRY1) {	throw new Error('TEST_TRY1');	}

		const tournament = await this.fetchTournamentDetails(tournamentId);
		if (tournament) 
		{
			const overviewElement = this.createOverviewElement(tournament);
			return overviewElement;
		} else {
			return this.createErrorElement("Failed to load tournament details.");
		}
	}

	/**
	 * トーナメントIDに基づいてトーナメントの詳細情報を取得。
	 * @param {number} tournamentId トーナメントのID
	 * @returns {Promise<object|null>} トーナメントの詳細情報またはエラー時にはnull
	 */
	async fetchTournamentDetails(tournamentId) 
	{
		try {
						if (TEST_TRY2) {	throw new Error('TEST_TRY2');	}
			const url = `${config.API_URLS.tournamentData}${tournamentId}/`;
			const response = await fetch(url,
			{
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (!response.ok)
			{
				throw new Error('Failed to fetch tournament details');
			}

			const jsonData = await response.json();
			return jsonData
		} catch (error) {
			console.error('hth: Failed to load tournament details:', error);
			return null;
		}
	}

	/** 表示するエレメントを生成 */
	createOverviewElement(tournament) 
	{
					if (TEST_TRY3) {	throw new Error('TEST_TRY3');	}

		const detailsContainer = document.createElement('div');
		// # トーナメント参加者のニックネームをHTML でのリスト表示が可能な形にする
		// - tournament.player_nicknames 配列に含まれる各ニックネームに対して、map 関数が <li> タグを追加
		// - 各ニックネームが <li>ニックネーム</li> の形式に変換。
		// - map によって変換された結果は新しい配列として返される。
		// - join('') メソッドを使用して、この配列のすべての要素を連結し、単一の文字列にする。
		const nicknamesList = tournament.player_nicknames.map(nickname => `<li>${nickname}</li>`).join('');
		detailsContainer.innerHTML = `
			<h3>Ongoing Tournament:</h3>
			<p>
				<strong>${tournament.name}</strong>
				on <strong>${new Date(tournament.date).toLocaleString()}</strong>
			</p>
			<ul>${nicknamesList}</ul>
		`;
		return detailsContainer;
	}

	/** エラー発生時の表示エレメントを生成 */
	createErrorElement(message) 
	{
		const errorContainer = document.createElement('div');
		errorContainer.textContent = message;
		return errorContainer;
	}
}

export default TournamentOverview;
