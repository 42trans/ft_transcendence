// docker/srcs/uwsgi-django/accounts/static/accounts/js/history.js
import { routeTable } from "/static/spa/js/routing/routeTable.js";

const DEBUG_FLOW		= 1;
const DEBUG_DETAIL1		= 1;
const DEBUG_DETAIL2		= 1;
const TEST_TRY1 		= 0;
const TEST_TRY2 		= 0;
const TEST_TRY3 		= 0;

class MatchHistory 
{
	static instance = null;

	constructor() 
	{
		this.userId					= window.userId;
		this.itemsPerPage			= 10;
		this.matchHistoryData		= [];
		this.currentPage			= 1;
	}

	// シングルトン
	static getInstance() 
	{
		if (!window.MatchHistory) {
		  window.MatchHistory = new MatchHistory();
		}
		return window.MatchHistory;
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
		const statsList				= document.createElement("ul");
		statsList.classList.add("list-group");
					if (DEBUG_DETAIL1) {	console.log('renderStats() stats: ', stats);	}
		for (const key in stats) {
			const listItem = document.createElement("li");
			listItem.classList.add("list-group-item");
			listItem.innerHTML = `<strong>${key}:</strong> ${stats[key]}`;
			statsList.appendChild(listItem);
						if (DEBUG_DETAIL1) {	console.log('renderStats() listItem: ', listItem);	}
		}
		statsContainer.appendChild(statsList);
					if (DEBUG_FLOW) {	console.log('renderStats(): done');	}
	}
		
	async loadMatchHistory() 
	{
		try 
		{	
						if (DEBUG_FLOW) {	console.log('loadMatchHistory(): start');	}
			const url = `/pong/api/tournament/user/match/history/`;
			// const url = `/pong/api/tournament/user/match/history/?user_id=${this.userId}`;
		
			const response = await fetch(url, {
				headers: { 'Content-Type': 'application/json' }
			});
			if (!response.ok) {
				throw new Error('Failed to fetch game history');
			}
			const data = await response.json();
						if (DEBUG_DETAIL1) {	console.log("API response data:", data);	}
			this.statsData = data.stats || [];
			this.renderStats();
			this.matchHistoryData = data.matches || [];
			this.renderMatchHistory();
						if (DEBUG_DETAIL1) {	console.log('renderStats() matchHistoryData: ', this.matchHistoryData);	}
		} catch (error) {
			console.error("loading game history() failed:", error);
		}
					if (DEBUG_FLOW) {	console.log('loadMatchHistory(): done');	}
	}

	renderMatchHistory() 
	{
					if (DEBUG_FLOW) {	console.log('renderMatchHistory(): start');	}
		const historyContainer		= document.getElementById("match-history-container");
		historyContainer.innerHTML = "";

		const startIndex = (this.currentPage - 1) * this.itemsPerPage;
		const endIndex = startIndex + this.itemsPerPage;
		const currentPageData = this.matchHistoryData.slice(startIndex, endIndex);

		currentPageData.forEach(match => {
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
				
				<div>Opponent: ${opponent}</div>
				<div>Result: ${result}</div>
				<div>Score: ${score}</div>
				<div>Ended at: ${match.ended_at}</div>
				<hr>
			`;
		
			historyContainer.appendChild(listItem);
		  });
		
		  this.renderPagination();
					if (DEBUG_FLOW) {	console.log('renderMatchHistory(): done');	}
	}

	renderPagination() 
	{
					if (DEBUG_FLOW) {	console.log('renderPagination(): start');	}
		const totalPages = Math.ceil(this.matchHistoryData.length / this.itemsPerPage);
		const paginationContainer	= document.getElementById("pagination-container");
		paginationContainer.innerHTML = "";

		for (let i = 1; i <= totalPages; i++) {
			const listItem = document.createElement("li");
			listItem.classList.add("page-item");
			if (i === this.currentPage) listItem.classList.add("active");
			
			const link = document.createElement("a");
			link.classList.add("page-link");
			link.textContent = i;
			link.href = "#";
			link.addEventListener("click", () => {
				this.currentPage = i;
				this.renderMatchHistory();
			});
			listItem.appendChild(link);
			paginationContainer.appendChild(listItem);
		}
					if (DEBUG_FLOW) {	console.log('renderPagination(): done');	}
	}

	dispose() {
					if (DEBUG_FLOW) {	console.log('MatchHistory.dispose(): start');	}
		MatchHistory.instance = null;
					if (DEBUG_FLOW) {	console.log('MatchHistory.dispose(): done');	}
	}
}

// 呼び出し
// MatchHistory.getInstance().loadMatchHistory();



let matchHistory = null;
let isEventListenerRegisteredMatchHistory = false;
// ---------------------------------------
// init
// ---------------------------------------
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
		matchHistory = new MatchHistory();
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

// PongOnlineClientAppインスタンスの作成
initMatchHistory();
// ---------------------------------------
// switchPageResetState
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
			matchHistory.dispose();
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
// error
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

