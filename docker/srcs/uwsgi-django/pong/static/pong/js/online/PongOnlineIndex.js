// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineIndex.js
import PongOnlineClientApp from './PongOnlineClientApp.js';
import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"

const DEBUG_FLOW = 0;
const TEST_TRY1	 = 0;
const TEST_TRY2	 = 0;

/**
 * 2D-Pong entry point
 */
let pongOnlineClientApp = null;
let isEventListenerRegistered = false;
// ---------------------------------------
// init
// ---------------------------------------
async function initPongOnlineClientApp() 
{
	try {
					if (DEBUG_FLOW) {	console.log('initPongOnlineClientApp: start');	}
		// urlが FreePlayリンク(view: game2d) かどうかを判定し、早期リターン
		if (!_isGame2dUrl()) {
						if (DEBUG_FLOW) {	console.log('initPongOnlineClientApp(): not game2d url');	}
			return;
		}
		// 重複対策: 削除してから新規作成
		if (pongOnlineClientApp) {
			pongOnlineClientApp.dispose();
			pongOnlineClientApp = null;
		}
		pongOnlineClientApp = new PongOnlineClientApp();
					if (TEST_TRY1) {	throw new Error('TEST_TRY1');	}
	} catch(error) {
		console.error('hth: initPongOnlineClientApp() failed: ', error);
		pongOnlineHandleCatchError(error);
	}
}

function _isGame2dUrl() {
	const currentPath = window.location.pathname;
				if (DEBUG_FLOW) {	console.log('currentPath:', currentPath);	}
	const game2dPath = routeTable['game2d'].path;
	return currentPath === game2dPath;
}

// PongOnlineClientAppインスタンスの作成
initPongOnlineClientApp();
// ---------------------------------------
// switchPageResetState
// ---------------------------------------
async function handleSwitchPageResetState() {
	// 常にinitする。
	await initPongOnlineClientApp();
}

function registerEventListenerSwitchPageResetState() {
	if (!isEventListenerRegistered) {
		window.addEventListener('switchPageResetState', handleSwitchPageResetState);
		isEventListenerRegistered = true;
					if (DEBUG_FLOW) {	console.log('registerEventListenerSwitchPageResetState: done');	}
	}
}
// イベントリスナー削除はしない
// 重複登録対策: flagで管理
registerEventListenerSwitchPageResetState();
// ---------------------------------------
// dispose
// ---------------------------------------
async function disposePongOnlineClientApp() 
{
	try {
		if (pongOnlineClientApp) 
		{
						if (DEBUG_FLOW) {	console.log('disposePongOnlineClientApp: start');	}
			pongOnlineClientApp.dispose();
			pongOnlineClientApp = null;
		}
					if (TEST_TRY2) {	throw new Error('TEST_TRY2');	}
	} catch(error) {
		console.error('hth: disposePongOnlineClientApp() failed: ', error);
		pongOnlineHandleCatchError(error);
	}
}

// このメソッドを呼び出すファイル: static/spa/js/views/pong/Game2D.js
// ここから連鎖的に各クラスのdispose()を呼び出す方針
if (!window.disposePongOnlineClientApp) {
	window.disposePongOnlineClientApp = disposePongOnlineClientApp;
}
// ---------------------------------------
// error
// ---------------------------------------
export async function pongOnlineHandleCatchError(error = null) 
{
	// SPAの状態をリセットしない場合
	// const switchPage = await loadSwitchPage();
	// const redirectTo = routeTable['top'].path;
	// switchPage(redirectTo);

	// ゲームでのエラーは深刻なので、location.hrefでSPAの状態を完全にリセットする
	if (error) {
		alert("エラーが発生しました。トップページに遷移します。 error: " + error);
	} else {
		alert("エラーが発生しました。トップページに遷移します。");
	}
	window.location.href = routeTable['top'].path;
}
