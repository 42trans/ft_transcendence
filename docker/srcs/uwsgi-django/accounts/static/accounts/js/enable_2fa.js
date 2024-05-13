document.addEventListener("DOMContentLoaded", function() {
	fetch('/accounts/api/enable_2fa/', {
	method: 'GET',
	headers: {
		'Content-Type': 'application/json',
	}
	})
		.then(response => response.json())
		.then(data => {
		if (data.error) {
			document.getElementById('error-message').textContent = "Error retrieving 2FA setup: " + data.error;
		} else if (data.redirect) {
			console.log(data.message);
			window.location.href = data.redirect;
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
});

function verifyToken() {
	const token = document.getElementById('token').value;
	fetch('/accounts/api/enable_2fa/', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
	},
	body: JSON.stringify({ token: token })
	})
		.then(response => response.json())
		.then(data => {
		if (data.error) {
			document.getElementById('error-message').textContent = "Verification failed: " + data.error;
		} else if (data.redirect) {
			console.log(data.message);
			window.location.href = data.redirect;
		} else if (data.success) {
			console.log(data.message);
			alert(data.message);
			window.location.href = data.redirect;
		}
		})
		.catch(error => {
		document.getElementById('error-message').textContent = "Network error or server is down.";
		console.error("Fetch error:", error);
		});
}
