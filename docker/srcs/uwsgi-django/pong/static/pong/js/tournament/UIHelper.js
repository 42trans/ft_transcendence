class UIHelper 
{
	static displayUserInfo(userProfile, container) 
	{
		if (!container) {
			console.error(`UIHelper error: UserInfo container not found (${userInfoContainerId})`);
			return;
		}

		if (userProfile && userProfile.nickname) {
			const nicknameItem = document.createElement('li');
			nicknameItem.textContent = `Nickname: ${userProfile.nickname}`;
			container.appendChild(nicknameItem);
		} else {
			UIHelper.putError('User profile data is incomplete or missing.', userInfoContainerId);
		}
	}

	static putError(message, container) 
	{
		if (!container) {
			console.error(`UIHelper error: Error message container not found (${container})`);
			return;
		}
		container.textContent = message;
	}

	static clearContainer(container) 
	{
		if (container) {
			container.innerHTML = '';
		}
	}

	static getCSRFToken() {
		const tokenElement = document.querySelector('[name=csrfmiddlewaretoken]');
		if (!tokenElement) {
			console.error('CSRF token element not found');
			return null;
		}
		return tokenElement.value;
	}
	
	
	static clearError(container) 
	{
		if (container) {
			container.textContent = '';
		}
	}
}

export default UIHelper;
