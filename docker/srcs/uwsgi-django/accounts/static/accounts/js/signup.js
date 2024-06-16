import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"
import { updateHeader } from "/static/spa/js/views/updateHeader.js"


const DEBUG = 0;
const DEBUG_LOG = 0;


function signupUser() {
	// event.preventDefault();
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
				if (DEBUG_LOG) { console.log('signup error: next: ' + data.redirect); };
				switchPage(data.redirect);
			} else {
				console.error('Error:', data.error);
			}
		} else if (data.message) {
			// Verified
			if (DEBUG_LOG) { console.log(data.message); };
			switchPage(data.redirect);  // Redirect on successful verification
			updateHeader();
		}
	})
	.catch(error => console.error('Error:', error));
	if (DEBUG_LOG) { console.log('signup 3'); };
}


let signupFormSubmitHandler = null;

export function setupSignupEventListener() {
	if (DEBUG) { console.log("[Setup signup event listeners]"); }
	const form = document.getElementById('signup-form-container')
	if (form && !signupFormSubmitHandler) {
		signupFormSubmitHandler = (event) => {
			if (DEBUG_LOG) { console.log("signup submit"); }
			event.preventDefault();
			signupUser();
		};
		form.addEventListener('submit', signupFormSubmitHandler);
		form.classList.add('listener-added');

		if (DEBUG) { console.log(' Signup event listener added'); }
	}
}

export function removeSignupEventListener() {
	if (DEBUG) { console.log("[Cleanup signup event listener]"); }

	const form = document.querySelector('.hth-sign-form');
	if (form && signupFormSubmitHandler) {
		form.removeEventListener('submit', signupFormSubmitHandler);
		form.classList.remove('listener-added');
		signupFormSubmitHandler = null;

		if (DEBUG) { console.log(' Signup event listener removed'); }
	}
}
