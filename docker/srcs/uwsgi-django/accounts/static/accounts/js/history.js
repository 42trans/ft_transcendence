// docker/srcs/uwsgi-django/accounts/static/accounts/js/history.js
import { routeTable } from "/static/spa/js/routing/routeTable.js";

const DEBUG_FLOW		= 0;
const DEBUG_DETAIL1		= 0;
const DEBUG_DETAIL2		= 0;
const TEST_TRY1 		= 0;
const TEST_TRY2 		= 0;
const TEST_TRY_MATCH1	= 0;
const TEST_TRY_MATCH2	= 0;
const TEST_TRY_MATCH3	= 0;
const TEST_TRY_MATCH4	= 0;
const TEST_TRY_MATCH5	= 0;
const TEST_TRY_MATCH6	= 0;

class MatchHistory 
{
	static instance = null;

	constructor() 
	{
		this.userId					= window.userId;
		// 1ページに表示する試合データ数
		this.itemsPerPage			= 5;
		this.matchHistoryData		= [];
		this.currentPage			= 1;
	}

	// シングルトン
	static getInstance() 
	{
		if (!window.MatchHistory) {
			window.MatchHistory = new MatchHistory();
						if (TEST_TRY_MATCH1) {	throw new Error('TEST_TRY_MATCH1');	}
		}
		return window.MatchHistory;
	}
	
		
	async loadMatchHistory() 
	{
		try 
		{	
						if (DEBUG_FLOW) {	console.log('loadMatchHistory(): start');	}
			const url		= `/pong/api/tournament/user/match/history/`;		
			const response	= await fetch(url, {
				headers: { 'Content-Type': 'application/json' }
			});
			if (!response.ok) {
				throw new Error('hth: Failed to fetch game history');
			}

			const data = await response.json();
						if (DEBUG_DETAIL1) {	console.log("API response data:", data);	}
			this.statsData = data.stats || [];
			this.renderStats();
			this.matchHistoryData = data.matches || [];
			this.renderMatchHistory();
						if (DEBUG_DETAIL1) {	console.log('renderStats() matchHistoryData: ', this.matchHistoryData);	}
						if (TEST_TRY_MATCH2) {	throw new Error('TEST_TRY_MATCH2');	}
		} catch (error) {
			console.error("hth: loading game history() failed:", error);
			matchHistoryHandleCatchError(error);
		}
					if (DEBUG_FLOW) {	console.log('loadMatchHistory(): done');	}
	}

	formatValue(value) {
		if (Number.isInteger(value)) {
			return value;
		} else {
			return value.toFixed(3);
		}
	}

	renderStats() 
	{
					if (DEBUG_FLOW) {	console.log('renderStats(): start');	}
		const statsContainer		= document.getElementById("match-history-stats-container");
		statsContainer.innerHTML	= "";
		const stats					= this.statsData;
		if (!stats) {
			console.warn("Stats data not available");
			return;
		}
					if (DEBUG_DETAIL1) {	console.log('renderStats() stats: ', stats);	}
		
		const statsLabels = {
			total_matches: "Total Matches",
			wins: "Wins",
			losses: "Losses",
			win_rate: "Win Rate",
			avg_points_scored: "Avg. Points Scored",
			avg_points_lost: "Avg. Points Lost"
		};

		const statsRow = document.createElement("div");
		statsRow.classList.add("row");
		for (const key in stats) {
			const statsCol = document.createElement("div");
			statsCol.classList.add("col-sm-4", "mb-3");

			const statsCard = document.createElement("div");
			statsCard.classList.add("card");

			const statsCardBody = document.createElement("div");
			statsCardBody.classList.add("card-body");

			const statsCardTitle = document.createElement("h5");
			statsCardTitle.classList.add("card-title");
			statsCardTitle.textContent = statsLabels[key] || key;

			const statsCardText = document.createElement("p");
			statsCardText.classList.add("card-text");
			statsCardText.textContent = this.formatValue(stats[key]);
			// statsCardText.textContent = stats[key];

			statsCardBody.appendChild(statsCardTitle);
			statsCardBody.appendChild(statsCardText);
			statsCard.appendChild(statsCardBody);
			statsCol.appendChild(statsCard);
			statsRow.appendChild(statsCol);
						if (DEBUG_DETAIL2) {	console.log('renderStats() statsCard: ', statsCard);	}
		}
		statsContainer.appendChild(statsRow);
					if (DEBUG_FLOW) {	console.log('renderStats(): done');	}
					if (TEST_TRY_MATCH3) {	throw new Error('TEST_TRY_MATCH3');	}
	}


	renderMatchHistory() 
	{
					if (DEBUG_FLOW) {	console.log('renderMatchHistory(): start');	}
		const historyContainer		= document.getElementById("match-history-container");
		historyContainer.innerHTML	= "";
		const startIndex			= (this.currentPage - 1) * this.itemsPerPage;
		const endIndex				= startIndex + this.itemsPerPage;
		const currentPageData		= this.matchHistoryData.slice(startIndex, endIndex);

		currentPageData.forEach(match => 
		{
			const listItem = document.createElement("li");
			listItem.classList.add("list-group-item");
			let opponent = match.player1;
			if (opponent === 'You') {
				opponent = match.player2;
			}
		
			let result = 'Lost';
			if (match.winner === 'You') {
				result = 'Won';
			}
		
			const score = `${match.player1_score} - ${match.player2_score}`;
		
			listItem.innerHTML = `
				<h4 class="match-stats-opponent">Opponent: ${opponent}</h4>
				<h5 class="match-stats-result">Result: ${result}</h5>
				<div class="match-stats-score">Score: ${score}</div>
				<div class="match-stats-ended">Ended at: ${match.ended_at}</div>
				<hr>
			`;
		
			historyContainer.appendChild(listItem);
		  });
		
		  this.renderPagination();
					if (DEBUG_FLOW) {	console.log('renderMatchHistory(): done');	}
					if (TEST_TRY_MATCH4) {	throw new Error('TEST_TRY_MATCH4');	}
	}

	renderPagination() 
	{
					if (DEBUG_FLOW) {	console.log('renderPagination(): start');	}
		const totalPages				= Math.ceil(this.matchHistoryData.length / this.itemsPerPage);
		const paginationContainer		= document.getElementById("pagination-container");
		paginationContainer.innerHTML	= "";

		for (let i = 1; i <= totalPages; i++) 
		{
			const listItem = document.createElement("li");
			// Bootstrapのクラス
			listItem.classList.add("page-item");
			if (i === this.currentPage) {
				listItem.classList.add("active");
			}
			
			const link = document.createElement("a");
			// Bootstrapのクラス
			link.classList.add("page-link");
			link.textContent = i;
			link.href = `?page=${i}`; 
			link.setAttribute("data-link", ""); 

			link.addEventListener("click", () => 
			{
				this.currentPage = i;
				this.renderMatchHistory();
			});

			listItem.appendChild(link);
			paginationContainer.appendChild(listItem);
		}
					if (DEBUG_FLOW) {	console.log('renderPagination(): done');	}
					if (TEST_TRY_MATCH5) {	throw new Error('TEST_TRY_MATCH5');	}
	}

	async dispose() 
	{
		try {
						if (DEBUG_FLOW) {	console.log('MatchHistory.dispose(): start');	}
			MatchHistory.instance = null;
						if (TEST_TRY_MATCH6) {	throw new Error('TEST_TRY_MATCH6');	}
		} catch(error) {
			console.error('hth: MatchHistory dispose() failed: ', error);
			matchHistoryHandleCatchError(error);
		}
	}
}

// ---------------------------------------
// init
// ---------------------------------------
let matchHistory = null;
let isEventListenerRegisteredMatchHistory = false;
async function initMatchHistory() 
{
	try {
					if (DEBUG_FLOW) {	console.log('initMatchHistory: start');	}
		// urlが FreePlayリンク(view: gameHistory) かどうかを判定し、早期リターン
		if (!_isGameHistoryPath()) {
						if (DEBUG_FLOW) {	console.log('initMatchHistory(): not gameHistory url');	}
			return;
		}
		// 重複対策: 削除してから新規作成
		if (matchHistory) {
			matchHistory.dispose();
			matchHistory = null;
		}
		// シングルトンインスタンスを取得
		matchHistory = MatchHistory.getInstance();
		// matchHistory = new MatchHistory();
		matchHistory.loadMatchHistory();
					if (TEST_TRY1) {	throw new Error('TEST_TRY1');	}
	} catch(error) {
		console.error('hth: initMatchHistory() failed: ', error);
		matchHistoryHandleCatchError(error);
	}
}

function _isGameHistoryPath() {
	const currentPath = window.location.pathname;
				if (DEBUG_FLOW) {	console.log('currentPath:', currentPath);	}
	const game2dPath = routeTable['gameHistory'].path;
	return currentPath === game2dPath;
}

// インスタンスの作成
initMatchHistory();
// ---------------------------------------
// listener: switchPageResetState
// ---------------------------------------
async function handleSwitchPageResetStateMatchHistory() {
	// 常にinitする。
	await initMatchHistory();
}

function registerEventListenerSwitchPageResetStateMatchHistory() {
	if (!isEventListenerRegisteredMatchHistory) {
		window.addEventListener('switchPageResetState', handleSwitchPageResetStateMatchHistory);
		isEventListenerRegisteredMatchHistory = true;
					if (DEBUG_FLOW) {	console.log('registerEventListenerSwitchPageResetStateMatchHistory: done');	}
	}
}
// イベントリスナー削除はしない
// 重複登録対策: flagで管理
registerEventListenerSwitchPageResetStateMatchHistory();
// ---------------------------------------
// dispose
// ---------------------------------------
async function disposeMatchHistory() 
{
	try {
		if (matchHistory) 
		{
						if (DEBUG_FLOW) {	console.log('disposeMatchHistory: start');	}
			await matchHistory.dispose();
			matchHistory = null;
		}
					if (TEST_TRY2) {	throw new Error('TEST_TRY2');	}
	} catch(error) {
		console.error('hth: disposeMatchHistory() failed: ', error);
		matchHistoryHandleCatchError(error);
	}
}

if (!window.disposeMatchHistory) {
	window.disposeMatchHistory = disposeMatchHistory;
}
// ---------------------------------------
// error handling
// ---------------------------------------
export function matchHistoryHandleCatchError(error = null) 
{
	// ゲームでのエラーは深刻なので、location.hrefでSPAの状態を完全にリセットする
	if (error) {
		alert("エラーが発生しました。トップページに遷移します。 error: " + error);
	} else {
		alert("エラーが発生しました。トップページに遷移します。");
	}
	window.location.href = routeTable['top'].path;
}

