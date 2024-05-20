// verify_2fa.js

export function verifyToken() {
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
window.verifyToken = verifyToken;
