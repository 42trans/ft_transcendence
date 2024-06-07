import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"


// -----
// 追加:DOMが完全にロードされた後に実行
document.addEventListener('DOMContentLoaded', function() {
	const form = document.getElementById('signup-form');
	if (form) {
		form.addEventListener('submit', signupUser);
	}
});
// -----
function signupUser(event) {
	event.preventDefault();
	const email = document.getElementById('email').value;
	const nickname = document.getElementById('nickname').value;
	const password1 = document.getElementById('password1').value;
	const password2 = document.getElementById('password2').value;

	fetch('/accounts/api/signup/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({email: email, nickname: nickname, password1: password1, password2: password2})
	})
	.then(response => response.json())
	.then(data => {
		if (data.error) {
			// Error
			document.getElementById('message-area').textContent = data.error;
			if (data.redirect) {
				window.location.href = data.redirect;
				// switchPage(data.redirect)
			} else {
				console.error('Error:', data.error);
			}
		} else if (data.message) {
			// Verified
			console.log(data.message);
			window.location.href = data.redirect;
			// switchPage(data.redirect)  // Redirect on successful verification
		}
	})
	.catch(error => console.error('Error:', error));
}
