// disable_2fa.js

export function disable2FA() {
	fetch('/accounts/api/disable_2fa/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('access_token')}`
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
				window.location.href = data.redirect;
			} else {
				throw new Error('No message in response');
			}
		})
		.catch(error => {
			console.error('Disable token failed:', error);
			alert('Disable token failed. Please try again.');
		});
}


export function setupDisable2FAModuleEventListeners() {
	document.querySelectorAll('.disable2FAButton').forEach(button => {
		button.addEventListener('click', () => disable2FA());
	});
}


// window.disable2FA = disable2FA;
