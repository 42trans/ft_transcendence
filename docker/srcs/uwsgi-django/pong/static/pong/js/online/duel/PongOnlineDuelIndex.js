// docker/srcs/uwsgi-django/pong/static/pong/js/online/duel/PongOnlineDuelIndex.js
import PongOnlineDuelClientApp from './PongOnlineDuelClientApp.js';

/** 2D-Pong Duel entry point */
document.addEventListener('DOMContentLoaded', () => 
{
	const roomNameElement = document.getElementById('room-name');
	if (!roomNameElement) {
		console.error("Room name element not found.");
	}	
	const roomName = roomNameElement.textContent;
	PongOnlineDuelClientApp.main(roomName);
});

