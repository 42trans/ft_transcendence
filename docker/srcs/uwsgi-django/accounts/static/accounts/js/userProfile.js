// userProfile.js

import { disable2FA } from "./disable_2fa.js"
import { createActionButton } from "./friend.js"
import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { isUserEnable2FA } from "/static/spa/js/utility/isUser.js"
import { switchPage } from "/static/spa/js/routing/renderView.js"

const DEBUG = 0;

function drawUserProfile(data) {
	const userInfo = document.getElementById("user-info");
	userInfo.innerHTML = '';

	const emailItem = document.createElement('li');
	emailItem.textContent = `Email: ${data.email}`;
	emailItem.classList.add("slideup-text");
	userInfo.appendChild(emailItem);

	const nicknameItem = document.createElement('li');
	nicknameItem.textContent = `Nickname: ${data.nickname}`;
	nicknameItem.classList.add("slideup-text");
	userInfo.appendChild(nicknameItem);

	if (data.has_usable_password) {
		const passwordItem = document.createElement('li');
		passwordItem.textContent = 'Password: ******';
		userInfo.appendChild(passwordItem);
	}

	const editProfileItem = document.createElement('li');
	const editProfileLink = document.createElement('a');
	editProfileLink.href = routeTable['editProfile'].path;
	editProfileLink.setAttribute('data-link', '');
	editProfileLink.textContent = 'Edit Profile';
	editProfileItem.appendChild(editProfileLink);
	editProfileItem.classList.add("slideup-text");
	userInfo.appendChild(editProfileItem);

	userInfo.appendChild(document.createElement('hr'));

	const avatarItem = document.createElement('li');
	avatarItem.innerHTML = `Avatar: <img src="${data.avatar_url}" alt="User Avatar" class="avatar">`;
	const changeAvatarLink = document.createElement('a');
	changeAvatarLink.href = routeTable['changeAvatar'].path;
	changeAvatarLink.setAttribute('data-link', '');
	changeAvatarLink.textContent = 'Edit Avatar';
	avatarItem.appendChild(changeAvatarLink);
	avatarItem.classList.add("slideup-text");
	userInfo.appendChild(avatarItem);

	userInfo.appendChild(document.createElement('hr'));

	const twoFAItem = document.createElement('li');
	twoFAItem.id = '2fa-status';
	if (data.enable_2fa) {
		twoFAItem.textContent = '2FA: ✅Enabled ';
		const disable2FAButton = createActionButton('Disable2FA', disable2FA);
		twoFAItem.classList.add("slideup-text");
		twoFAItem.appendChild(disable2FAButton);
	} else {
		twoFAItem.textContent = '2FA: Disabled ';
		const enable2FALink = document.createElement('a');
		enable2FALink.href = routeTable['enable2fa'].path;
		enable2FALink.setAttribute('data-link', '');
		enable2FALink.textContent = 'Enable2FA';
		twoFAItem.classList.add("slideup-text");
		twoFAItem.appendChild(enable2FALink);
	}
	userInfo.appendChild(twoFAItem);
}


export function fetchUserProfile() {
	fetch("/accounts/api/user/profile/", {
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then(response => response.json())
		.then(data => {
			drawUserProfile(data);
			const gameHistoryButton = document.getElementById('game-history-button');
			gameHistoryButton.addEventListener('click', () => {
				const redirectTo = routeTable['gameHistory'].path;
				switchPage(redirectTo);
			});
		})
		.catch(error => console.error("hth: Error:", error));
}
