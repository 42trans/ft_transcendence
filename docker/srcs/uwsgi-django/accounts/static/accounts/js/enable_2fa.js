// enable_2fa.js

import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"

const DEBUG = 0;

export function fetchEnable2FA() {
	fetch('/accounts/api/enable_2fa/', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then(response => response.json())
		.then(data => {
			if (data.error) {
				document.getElementById('error-message').textContent = "Error retrieving 2FA setup: " + data.error;
			} else if (data.redirect) {
				console.log(data.message);
				switchPage(data.redirect)
			}
			else {
				const qrCodeHtml = `
					<p>Scan this QR Code with your authenticator app:</p>
					<p><img src="data:image/png;base64,${data.qr_code_data}" alt="2FA QR Code"></p>
					<p>Or enter this setup key: </p>
					<p class="pb-1">${data.setup_key}</p>
				`;
				document.getElementById('qrCodeContainer').innerHTML = qrCodeHtml;
			}
		})
		.catch(error => {
			document.getElementById('error-message').textContent = "Network error or server is down.";
			console.error("Fetch error:", error);
		});
}


function enable2FaVerifyToken() {
	const token = document.getElementById('token').value;

	fetch('/accounts/api/enable_2fa/', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	},
	body: JSON.stringify({ token: token })
	})
		.then(response => response.json())
		.then(data => {
		if (data.error) {
			document.getElementById('error-message').textContent = "Verification failed: " + data.error;
		} else if (data.redirect) {
			console.log(data.message);
			switchPage(data.redirect)
		} else if (data.success) {
			console.log(data.message);
			alert(data.message);
			switchPage(data.redirect)
		}
		})
		.catch(error => {
		document.getElementById('error-message').textContent = "Network error or server is down.";
		console.error("Fetch error:", error);
		});
}


let verifyTokenButtonHandler = null;

export function setupVerifyTokenEventListener() {
	if (DEBUG) { console.log("[Setup verify-token event listeners]"); }

	const button = document.querySelector('.hth-btn.verifyTokenButton');
	if (button && !verifyTokenButtonHandler) {
		verifyTokenButtonHandler = (event) => {
			event.preventDefault();
			enable2FaVerifyToken();
		};
		button.addEventListener('click', verifyTokenButtonHandler);
		button.classList.add('listener-added');

		if (DEBUG) { console.log(' Verify-token event listener added'); }
	}
}

export function removeVerifyTokenEventListener() {
	if (DEBUG) { console.log("[Cleanup verify-token event listener]"); }

	const button = document.querySelector('.hth-btn.verifyTokenButton');
	if (button && verifyTokenButtonHandler) {
		button.removeEventListener('click', verifyTokenButtonHandler);
		button.classList.remove('listener-added');
		verifyTokenButtonHandler = null;

		if (DEBUG) { console.log(' Verify-token event listener removed'); }
	}
}
