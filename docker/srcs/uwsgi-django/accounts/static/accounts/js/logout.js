// logout.js

import { disconnectOnlineStatusWebSocket } from "./online-status.js";
import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"
import { updateHeader } from "/static/spa/js/views/updateHeader.js"

const DEBUG = 0;

function handleLogout() {
	fetch('/accounts/api/logout/', {
	method: 'GET',
	headers: {
		'Content-Type': 'application/json'
	}
	}).then(response => {
	if (!response.ok) {
		throw new Error('Network response was not ok');
	}
	return response.json();
	})
	.then(data => {
		if (data.message) {
			alert(data.message);
			if (DEBUG) { console.log("redirect to " + data.redirect); }
			disconnectOnlineStatusWebSocket(data.user_id)

			// alert(`Redirecting to ${data.redirect}. Check console logs before proceeding.`);  // debug
			switchPage(data.redirect);
			updateHeader();
		} else {
			throw new Error('No message in response');
		}
	})
	.catch(error => {
		console.error('hth: Logout failed:', error);
		alert('Logout failed. Please try again.');
	});
}


export function setupLogoutEventListener() {
	if (DEBUG) { console.log("Setup logout event listeners"); }
	const button = document.querySelector('.logoutButton');
	if (button) {
		button.addEventListener('click', function(event) {
			event.preventDefault();
			handleLogout();
		});
	}
}

// header
document.addEventListener('DOMContentLoaded', function() {
	const button = document.querySelector('header .logoutButton');
	if (button) {
		button.addEventListener('click', function(event) {
			if (event.target.classList.contains('logoutButton')) {
				event.preventDefault();
				handleLogout();
			}
		});
	}
});
