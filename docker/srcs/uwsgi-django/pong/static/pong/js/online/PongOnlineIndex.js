// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineIndex.js
import PongOnlineClientApp from './PongOnlineClientApp.js';

/**
 * 2D-Pong entry point
 */
// TODO_ft:SPA対応
document.addEventListener('DOMContentLoaded', () => 
{
	PongOnlineClientApp.main();
});