// docker/srcs/uwsgi-django/accounts/static/accounts/js/login.js


export function loginUser(event) {
	console.log('loginUser 1')
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
			console.log('loginUser 2')
			if (data.error) {
				console.log('loginUser 3')
				// Error
				document.getElementById('message-area').textContent = data.error;
				if (data.redirect) {
					console.log('loginUser 4')
					alert(`Redirecting to ${data.redirect}. Check console logs before proceeding.`);  // debug
					window.location.href = data.redirect;
				} else {
					console.log('loginUser 5')
					console.error('Error:', data.error);
				}
			} else if (data.message) {
				console.log('loginUser 6')
				// Verified
				console.log(data.message);
				window.location.href = data.redirect;  // Redirect on successful verification
			}
		})
		.catch(error => console.error('Error:', error));
	console.log('loginUser 7')
	clearForm()
}


function clearForm() {
	document.getElementById('email').value = '';
	document.getElementById('password').value = '';
}


export function setupLoginEventListener() {
	console.log("Setup login event listeners");
	const form = document.querySelector('.sign-form');
	if (form) {
		form.addEventListener('submit', (event) => {
			event.preventDefault();
			loginUser(event);
		});
		console.log('Form event listener added');
	} else {
		console.error('Form not found.');
	}
}
