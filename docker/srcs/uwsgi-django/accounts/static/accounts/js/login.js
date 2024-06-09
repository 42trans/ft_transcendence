// docker/srcs/uwsgi-django/accounts/static/accounts/js/login.js

import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"


// ブラウザURLがloginでない（=リダイレクトでloginへ遷移した）場合は、元のURLに戻す
function getNextUrl(redirectTo) {
	const currentBrowserUrl = window.location.pathname;

	// ブラウザURLが/login/であれば、login APIのredirect先に遷移
	if (currentBrowserUrl === routeTable['login'].path) {
		return redirectTo;
	}

	// ブラウザURLが/login/でなく、LoginAPIのredirect先がvarify2faの場合は
	// query parameterで遷移先を保持
	if (redirectTo === routeTable['veryfy2fa'].path) {
		return `${redirectTo}?next=${encodeURIComponent(currentBrowserUrl)}`;
		// return `${redirectTo}?next=aaa`;
	}
	return currentBrowserUrl;
}

export function loginUser(event) {
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
					// alert(`Redirecting to ${data.redirect}. Check console logs before proceeding.`);  // debug
					// alert('[tmp] login failure')
					window.location.href = data.redirect;
					// switchPage(data.redirect)
				} else {
					// alert('[tmp] error: ' + data.error)
					console.error('Error:', data.error);
				}
			} else if (data.message) {
				// Verified
				console.log(data.message);
				const nextUrl = getNextUrl(data.redirect);
				console.log('login: next=' + nextUrl)
				// alert('[tmp] login success, next:' + nextUrl)
				// window.location.href = nextUrl
				switchPage(nextUrl)  // Redirect on successful verification
			}
		})
		.catch(error => console.error('Error:', error));
	clearForm()
}


function clearForm() {
	document.getElementById('email').value = '';
	document.getElementById('password').value = '';
}


export function setupLoginEventListener() {
	console.log("Setup login event listeners");
	const form = document.querySelector('.hth-sign-form');
	if (form) {
		// Check if the event listener has already been added
		if (form.classList.contains('listener-added')) {
			console.log('Form event listener already exists');
		} else {
			form.addEventListener('submit', (event) => {
				event.preventDefault();
				loginUser(event);
			});
			form.classList.add('listener-added');
			console.log('Form event listener added');
		}
	}
}
