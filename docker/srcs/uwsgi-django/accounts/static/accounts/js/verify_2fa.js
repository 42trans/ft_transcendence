// verify_2fa.js
import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"
import { updateHeader } from "/static/spa/js/views/updateHeader.js"

const DEBUG = 0;

function verify2FA() {
	const token = document.getElementById('token').value;

	fetch('/accounts/api/verify_2fa/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ token: token})
	})
		.then(response => response.json())
		.then(data => {
			if (data.error) {
				// Error
				document.getElementById('error-message').textContent = data.error;
				if (data.redirect) {
					// alert('[tmp] varify2fa error: redirectTo:' + data.redirect)
					switchPage(data.redirect);
				} else {
					// alert('[tmp] varify2fa error' + data.error)
					throw new Error(data.error);
				}
			} else if (data.message) {
				// Verified
				// console.log(data.message);
				// alert('[tmp] varify2fa success, redirect:' + data.redirect)
				switchPage(data.redirect)  // Redirect on successful verification
                updateHeader();
			}
		})
		.catch(error => console.error("hth: Error:", error));

	clearForm()
}

export function clearForm() {
	document.getElementById('token').value = '';
}



let verify2FaButtonHandler = null;

export function setupVerify2FaEventListener() {
	if (DEBUG) { console.log("[Setup verify2fa event listeners]"); }

	const button = document.querySelector('.hth-btn.verify2FaButton');
	if (button && !verify2FaButtonHandler) {
		verify2FaButtonHandler = (event) => {
			event.preventDefault();
			verify2FA();
		};
		button.addEventListener('click', verify2FaButtonHandler);
		button.classList.add('listener-added');

		if (DEBUG) { console.log(' Verify2fa event listener added'); }
	}
}

export function removeVerify2FaEventListener() {
	if (DEBUG) { console.log("[Cleanup verify2fa event listener]"); }

	const button = document.querySelector('.hth-btn.verify2FaButton');
	if (button && verify2FaButtonHandler) {
		button.removeEventListener('click', verify2FaButtonHandler);
		button.classList.remove('listener-added');
		verify2FaButtonHandler = null;

		if (DEBUG) { console.log(' Verify2fa event listener removed'); }
	}
}
