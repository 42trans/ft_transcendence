// verify_2fa.js

import { switchPage } from "/static/spa/js/routing/renderView.js"


function getNextUrl() {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get('next') || '';
}

function verify2FA() {
	const token = document.getElementById('token').value;
	const nextUrl = getNextUrl()

	console.log('verify2fa nextUrl:' + nextUrl)

	fetch('/accounts/api/verify_2fa/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ token: token , next: nextUrl})
	})
		.then(response => response.json())
		.then(data => {
			if (data.error) {
				// Error
				document.getElementById('error-message').textContent = data.error;
				if (data.redirect) {
					// alert('[tmp] varify2fa error: redirectTo:' + data.redirect)
					window.location.href = data.redirect;
				} else {
					// alert('[tmp] varify2fa error' + data.error)
					console.error('Error:', data.error);
				}
			} else if (data.message) {
				// Verified
				console.log(data.message);
				// alert('[tmp] varify2fa success, redirect:' + data.redirect)
				switchPage(data.redirect)  // Redirect on successful verification
			}
		})
		.catch(error => console.error("Error:", error));

	clearForm()
}

export function clearForm() {
	document.getElementById('token').value = '';
}


// グローバルスコープに公開
// window.verify2FA = verify2FA;

export function setupVerify2FaEventListener() {
	console.log("Setup logout event listeners");
	const verify2FaButton = document.querySelector('.hth-btn.verify2FaButton');
	if (verify2FaButton) {
		verify2FaButton.addEventListener('click', (event) => {
			event.preventDefault();
			verify2FA();
		});
	}
}
