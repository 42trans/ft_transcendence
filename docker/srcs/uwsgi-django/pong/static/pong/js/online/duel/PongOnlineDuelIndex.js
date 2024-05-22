// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineDuelIndex.js
import PongOnlineDuelClientApp from './PongOnlineDuelClientApp.js';

/**
 * 2D-Pong Duel entry point
 */
document.addEventListener('DOMContentLoaded', () => 
{
	const duelTargetNickname = JSON.parse(
		document.getElementById('target_nickname').textContent
	);
	PongOnlineDuelClientApp.main(duelTargetNickname);
});

