// logout.js

import { disconnectOnlineStatusWebSocket } from "./online-status.js";


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
			console.log("redirect to " + data.redirect);
			disconnectOnlineStatusWebSocket(data.user_id)

			// alert(`Redirecting to ${data.redirect}. Check console logs before proceeding.`);  // debug
			window.location.href = data.redirect;
		} else {
			throw new Error('No message in response');
		}
	})
	.catch(error => {
		console.error('Logout failed:', error);
		alert('Logout failed. Please try again.');
	});
}


// header
document.addEventListener('DOMContentLoaded', function() {
	const header = document.querySelector('header');
	if (header) {
		header.addEventListener('click', function(event) {
			if (event.target.classList.contains('logoutButton')) {
				event.preventDefault();
				handleLogout();
			}
		});
	}
});
