// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineIndex.js
import PongOnlineClientApp from './PongOnlineClientApp.js';

/**
 * 2D-Pong entry point
 */

// PongOnlineClientApp.main();

let pongOnlineClientApp = null;
let isEventListenerRegistered = false;

async function initPongOnlineClientApp() 
{
	if (pongOnlineClientApp) {
		pongOnlineClientApp.dispose();
		pongOnlineClientApp = null;
	}
	pongOnlineClientApp = new PongOnlineClientApp();
}

async function disposePongOnlineClientApp() 
{
	if (pongOnlineClientApp) 
	{
		pongOnlineClientApp.dispose();
		pongOnlineClientApp = null;
	}
}

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

initPongOnlineClientApp();

if (!window.disposePongOnlineClientApp) {
	window.disposePongOnlineClientApp = disposePongOnlineClientApp;
}
