// userProfile.js

import { setupDisable2FAModuleEventListeners } from "./disable_2fa.js"


export function fetchUserProfile() {
	fetch("/accounts/api/user/profile/", {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('access_token')}`
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
				
				`<li>2FA: ✅Enabled</li><li><a href="#" class="disable2FAButton">Disable 2FA</a></li>` :
				`<li>2FA: Disabled</li><li><a href="/enable-2fa/">Enable 2FA</a></li>`}
                `;

			setupDisable2FAModuleEventListeners()  // disable2FAButtonを有効化
			// setUpOnlineStatusWebSocket(data.id);  // OnlieStatusWebSocketに接続
		})
		.catch(error => console.error("Error:", error));
}
