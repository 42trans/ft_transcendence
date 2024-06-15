// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineIndex.js
import PongOnlineClientApp from './PongOnlineClientApp.js';

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
