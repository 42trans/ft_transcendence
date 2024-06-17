// docker/srcs/uwsgi-django/accounts/static/accounts/js/login.js

import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"
import { updateHeader } from "/static/spa/js/views/updateHeader.js"

const DEBUG = 0;

export function loginUser() {
	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;

	fetch('/accounts/api/login/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({email: email, password: password})
	})
		.then(response => response.json())
		.then(data => {
			if (data.error) {
				// Error
				document.getElementById('message-area').textContent = data.error;
				if (data.redirect) {
                    // alert('[tmp] login failure')
					switchPage(data.redirect)
				} else {
					// alert('[tmp] error: ' + data.error)
					throw new Error(data.error);
				}
			} else if (data.message) {
				// Verified
				if (DEBUG) { console.log(data.message); }
				const nextUrl = data.redirect;
				if (DEBUG) { console.log('login: nextUrl:' + nextUrl); }
				switchPage(nextUrl)  // Redirect on successful verification
                updateHeader();
			}
		})
		.catch(error => console.error('hth: Error:', error));
	clearForm()
}


function clearForm() {
	document.getElementById('email').value = '';
	document.getElementById('password').value = '';
}


let loginFormSubmitHandler = null;

export function setupLoginEventListener() {
	if (DEBUG) { console.log("[Setup login event listeners]"); }

	const form = document.querySelector('.hth-sign-form');
	if (form && !loginFormSubmitHandler) {
		loginFormSubmitHandler = (event) => {
			event.preventDefault();
			loginUser();
		};
		form.addEventListener('submit', loginFormSubmitHandler);
		form.classList.add('listener-added');

		if (DEBUG) { console.log(' Login event listener added'); }
	}
}

export function removeLoginEventListener() {
	if (DEBUG) { console.log("[Cleanup login event listener]"); }

	const form = document.querySelector('.hth-sign-form');
	if (form && loginFormSubmitHandler) {
		form.removeEventListener('submit', loginFormSubmitHandler);
		form.classList.remove('listener-added');
		loginFormSubmitHandler = null;

		if (DEBUG) { console.log(' Login event listener removed'); }
	}
}
