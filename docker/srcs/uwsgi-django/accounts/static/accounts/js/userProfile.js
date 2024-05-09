document.addEventListener("DOMContentLoaded", function() {
	fetch("/accounts/api/user/profile/")
		.then(response => response.json())
		.then(data => {
			const userInfo = document.getElementById("user-info");
			userInfo.innerHTML = `
				<li>Email: ${data.email}</li>
				<li>Nickname: ${data.nickname}</li>
				${data.has_usable_password ? '<li>Password: ******</li>' : ''}
				<li><a href="/accounts/edit/">Edit Profile</a></li>
				<br>
				${data.enable_2fa ?
						`<li>2FA: ✅Enabled</li><li><a href="/accounts/verify/disable_2fa/">Disable 2FA</a></li>` :
						`<li>2FA: Disabled</li><li><a href="/accounts/verify/enable_2fa/">Enable 2FA</a></li>`}
				<br>
				<button class="hth-btn" onclick="handleLogout()">Logout</button>
			`;
		})
		.catch(error => console.error("Error:", error));
});