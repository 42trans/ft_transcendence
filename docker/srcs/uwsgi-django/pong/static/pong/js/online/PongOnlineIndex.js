// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineIndex.js
import PongOnlineClientApp from './PongOnlineClientApp.js';
import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"

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
	if (pongOnlineClientApp) {
		pongOnlineClientApp.dispose();
		pongOnlineClientApp = null;
	}
	pongOnlineClientApp = new PongOnlineClientApp();
}
initPongOnlineClientApp();
// ---------------------------------------
// switchPageResetState
// ---------------------------------------
async function handleSwitchPageResetState() {
	await initPongOnlineClientApp();
}

function registerEventListenerSwitchPageResetState() {
	if (isEventListenerRegistered) {
		return;
	}
	window.addEventListener('switchPageResetState', handleSwitchPageResetState);
	isEventListenerRegistered = true;
}

registerEventListenerSwitchPageResetState();
// ---------------------------------------
// dispose
// ---------------------------------------
async function disposePongOnlineClientApp() 
{
	if (pongOnlineClientApp) 
	{
		pongOnlineClientApp.dispose();
		pongOnlineClientApp = null;
	}
}

if (!window.disposePongOnlineClientApp) {
	window.disposePongOnlineClientApp = disposePongOnlineClientApp;
}

// endGameButton.addEventListener('click', () => {
// 	const redirectTo = routeTable['top'].path;
// 	switchPage(redirectTo);
// });

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
