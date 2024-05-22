// userProfile.js

import { disable2FA } from "./disable_2fa.js"


export function fetchUserProfile() {
	fetch("/accounts/api/user/profile/", {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('access')}`
		}
	})
		.then(response => response.json())
		.then(data => {
			const userInfo = document.getElementById("user-info");
			userInfo.innerHTML = `
                <li>Email: ${data.email}</li>
                <li>Nickname: ${data.nickname}</li>
                ${data.has_usable_password ? '<li>Password: ******</li>' : ''}
                <li><a href="/edit-profile/">Edit Profile</a></li>
                <hr>
                <li>Avatar: <img src="${data.avatar_url}" alt="User Avatar" class="avatar">
                <a href="/change-avatar/">Edit Avatar</a></li>
                <hr>
                ${data.enable_2fa ?
				
				`<li>2FA: ✅Enabled  <a href="#" class="disable2FAButton">Disable2FA</a></li>` :
				`<li>2FA: Disabled  <a href="/enable-2fa/">Enable2FA</a></li>`}
                `;

			setupDisable2FAEventListener()  // disable2FAButtonを有効化
			// setUpOnlineStatusWebSocket(data.id);  // OnlieStatusWebSocketに接続
		})
		.catch(error => console.error("Error:", error));
}


export function setupDisable2FAEventListener() {
	console.log("removeDisable2FAEventListener");
	document.querySelectorAll('.disable2FAButton').forEach(button => {
		button.replaceWith(button.cloneNode(true));
	});


	console.log("setupDisable2FAEventListener 1");
	document.querySelectorAll('.disable2FAButton').forEach(button => {
		console.log("setupDisable2FAEventListener 2");
		button.addEventListener('click', (event) => {
			event.preventDefault();
			console.log('disable2FAButton clicked');
			disable2FA()
		});
	});
	console.log("setupDisable2FAEventListener 3");
}
