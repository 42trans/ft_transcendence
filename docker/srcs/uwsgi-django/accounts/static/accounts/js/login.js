// docker/srcs/uwsgi-django/accounts/static/accounts/js/login.js

import { connectOnlineStatusWebSocket } from "./online-status.js";

// -----
// 追加:DOMが完全にロードされた後に実行
// document.addEventListener('DOMContentLoaded', function() {
// 	const form = document.getElementById('login-form');
// 	if (form) {
// 		form.addEventListener('submit', loginUser);
// 	}
// });
// -----

export function loginUser(event) {
	console.log('loginUser 1')
	event.preventDefault();

	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;
	const nextUrl = document.getElementById('next').value;

	fetch('/accounts/api/login/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({email: email, password: password})
	})
		.then(response => response.json())
		.then(data => {
			console.log('loginUser 2')
			if (data.error) {
				console.log('loginUser 3')
				// Error
				document.getElementById('message-area').textContent = data.error;
				if (data.redirect) {
					console.log('loginUser 4')
					alert(`Redirecting to ${data.redirect}. Check console logs before proceeding.`);  // debug
					window.location.href = data.redirect;
				} else {
					console.log('loginUser 5')
					console.error('Error:', data.error);
				}
			} else if (data.message) {
				console.log('loginUser 6')
				// Verified
				console.log(data.message);
				connectOnlineStatusWebSocket(data.user_id);
				alert(`Redirecting to ${data.redirect}. Check console logs before proceeding.`);  // debug
				window.location.href = data.redirect;  // Redirect on successful verification
			}
		})
		.catch(error => console.error('Error:', error));
	console.log('loginUser 7')
	clearForm()
}


function clearForm() {
	document.getElementById('email').value = '';
	document.getElementById('password').value = '';
}


export function setupLoginEventListener() {
	console.log("Setup login event listeners");
	const form = document.querySelector('.sign-form');
	if (form) {
		form.addEventListener('submit', (event) => {
			event.preventDefault();
			loginUser(event);
		});
		console.log('Form event listener added');
	} else {
		console.error('Form not found.');
	}
}


// function OAuthLoginUser(data) {
// 	console.log('OAuthLoginUser 1')
//
// 	fetch('/accounts/api/oauth-ft/', {
// 		method: 'GET',
// 		headers: {
// 			'Content-Type': 'application/json'
// 		},
// 		body: JSON.stringify({email: email, password: password})
// 	})
// 		.then(response => response.json())
// 		.then(data => {
// 			console.log('OAuthLoginUser 2')
// 			if (data.error) {
// 				console.log('OAuthLoginUser 3')
// 				// Error
// 				document.getElementById('message-area').textContent = data.error;
// 				if (data.redirect) {
// 					console.log('OAuthLoginUser 4')
// 					alert(`Redirecting to ${data.redirect}. Check console logs before proceeding.`);  // debug
// 					window.location.href = data.redirect;
// 				} else {
// 					console.log('OAuthLoginUser 5')
// 					console.error('Error:', data.error);
// 				}
// 			} else if (data.message) {
// 				console.log('OAuthLoginUser 6')
// 				// Verified
// 				console.log(data.message);
// 				connectOnlineStatusWebSocket(data.user_id);
// 				alert(`Redirecting to ${data.redirect}. Check console logs before proceeding.`);  // debug
// 				window.location.href = data.redirect;  // Redirect on successful verification
// 			}
// 		})
// 		.catch(error => console.error('Error:', error));
// 	console.log('OAuthLoginUser 7')
// }
//
//
// export function setupOAuthLoginEventListener() {
// 	console.log("Setup OAuth login event listeners");
// 	document.querySelectorAll('.oAuthLoginButton').forEach(button => {
// 		button.addEventListener('click', () => {
// 			console.log('oAuthLoginButton clicked');
// 			OAuthLoginUser();
// 		});
// 	});
// }

// export function setupOAuthCallbackListener() {
// 	const params = new URLSearchParams(window.location.search);
// 	if (params.has('message') && params.has('user_id') && params.has('redirect')) {
// 		const data = {
// 			message: params.get('message'),
// 			user_id: params.get('user_id'),
// 			redirect: params.get('redirect')
// 		};
// 		console.log('OAuth callback received:', data);
// 		connectOnlineStatusWebSocket(data.user_id);
// 		alert(`Redirecting to ${data.redirect}. Check console logs before proceeding.`);
// 		window.location.href = data.redirect;
// 	}
// }
