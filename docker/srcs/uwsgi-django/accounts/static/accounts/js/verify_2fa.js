// verify_2fa.js

function verify2FA() {
	const token = document.getElementById('token').value;
	fetch('/accounts/api/verify_2fa/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ token: token })
	})
		.then(response => response.json())
		.then(data => {
			if (data.error) {
				// Error
				document.getElementById('error-message').textContent = data.error;
				if (data.redirect) {
					window.location.href = data.redirect;
				} else {
					console.error('Error:', data.error);
				}
			} else if (data.message) {
				// Verified
				console.log(data.message);
				window.location.href = data.redirect;  // Redirect on successful verification
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
