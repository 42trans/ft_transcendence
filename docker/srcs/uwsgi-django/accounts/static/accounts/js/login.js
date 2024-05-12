// docker/srcs/uwsgi-django/accounts/static/accounts/js/login.js
// -----
// 追加:DOMが完全にロードされた後に実行
document.addEventListener('DOMContentLoaded', function() {
	const form = document.getElementById('login-form');
	if (form) {
		form.addEventListener('submit', loginUser);
	}
});
// -----
function loginUser(event) {
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
			if (data.error) {
				// Error
				document.getElementById('message-area').textContent = data.error;
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
		.catch(error => console.error('Error:', error));
	clearForm()
}

function clearForm() {
	document.getElementById('email').value = '';
	document.getElementById('password').value = '';
}
