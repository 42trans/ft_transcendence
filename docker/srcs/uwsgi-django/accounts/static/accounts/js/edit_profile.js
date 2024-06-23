// edit_profile.js

import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"


export function updateNickname(event) {
	event.preventDefault();
	const nickname = document.getElementById('nickname').value;

	fetch('/accounts/api/user/edit-profile/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			nickname: nickname,
		})
	})
		.then(response => {
			if (!response.ok) {
				throw new Error(`status: ${response.status}`);
			}
			return response.json();
		})
		.then(data => {
			if (data.error) {
				document.getElementById('message-area').textContent = data.error;
			} else {
				document.getElementById('message-area').textContent = data.message;
				const redirectTo = routeTable['userProfile'].path;
				switchPage(redirectTo);
			}
		})
		.catch(error => {
			if (error.message.includes("status: 401")) {
				alert("You have been logged out. Please log in again.");
			} else {
				alert("An error occurred. Returning to top page.");
			}
			switchPage(routeTable['top'].path);
		});
}


export function updatePassword(event) {
	event.preventDefault();
	const currentPassword = document.getElementById('current_password').value;
	const newPassword = document.getElementById('new_password').value;

	fetch('/accounts/api/user/edit-profile/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			current_password: currentPassword,
			new_password: newPassword
		})
	})
		.then(response => {
			if (!response.ok) {
				throw new Error(`status: ${response.status}`);
			}
			return response.json();
		})
		.then(data => {
			if (data.error) {
				document.getElementById('message-area').textContent = data.error;
			} else {
				document.getElementById('message-area').textContent = data.message;
				const redirectTo = routeTable['userProfile'].path;
				switchPage(redirectTo);
			}
		})
		.catch(error => {
			if (error.message.includes("status: 401")) {
				alert("You have been logged out. Please log in again.");
			} else {
				alert("An error occurred. Returning to top page.");
			}
			switchPage(routeTable['top'].path);
		});
}


export function setupUpdateNicknameEventListener() {
	const form = document.getElementById('nickname-form');
	if (form) {
		form.addEventListener('submit', (event) => {
			event.preventDefault();
			updateNickname(event);
		});
	}
}


export function setupUpdatePasswordEventListener() {
	const form = document.getElementById('password-form');
	if (form) {
		form.addEventListener('submit', (event) => {
			event.preventDefault();
			updatePassword(event);
		});
	}
}
