import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"


/**
 * メソッドのみのクラス
 * # 呼び出し方:
 * - importする: `import UIHelper from '../UIHelper.js'`;
 * - `UIHelper.`でメソッドを呼び出す:  ex.`UIHelper.getCSRFToken()`;
*/
class UIHelper 
{
	// static displayUserInfo(userProfile, container) 
	// {
	// 	if (!container) 
	// 	{
	// 		console.error(`UIHelper error: UserInfo container not found (${container})`);
	// 		return;
	// 	}

	// 	if (userProfile && userProfile.nickname) 
	// 	{
	// 		const nicknameItem = document.createElement('li');
	// 		nicknameItem.textContent = `${userProfile.nickname}`;
	// 		// nicknameItem.textContent = `Nickname: ${userProfile.nickname}`;
	// 		nicknameItem.id = 'user-info';
	// 		nicknameItem.className = 'mb-2';
	// 		// nicknameItem.style.listStyle = 'none';
	// 		container.appendChild(nicknameItem);
	// 	} else {
	// 		UIHelper.putError('User profile data is incomplete or missing.', container);
	// 	}
	// }

	static handleSuccess(message, href, submitMessage) 
	{
		submitMessage.textContent = message;
		const backHomeButton = document.createElement('button');
		backHomeButton.textContent = 'Back Home';
		backHomeButton.style.display = 'block';
		backHomeButton.onclick = () => switchPage(href);
	}

	static putError(message, container) 
	{
		if (!container) {
			console.error(`hth: UIHelper error: Error message container not found (${container})`);
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

	static getCSRFToken() 
	{
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
