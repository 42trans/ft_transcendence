// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/UserManager.js
import { config }	from '../ConfigTournament.js';

let DEBUG_FLOW		= 0;
let DEBUG_DETAIL	= 0;
let TEST_TRY1 		= 0;

class UserManager 
{
	constructor() {
		this.userProfile = null;
	}

	async getUserProfile() 
	{
		if (!this.userProfile) 
		{
			try {
				let response = await fetch(config.API_URLS.userProfile);

						if (TEST_TRY1){	
							response = {
								ok: false,
								status: 401,
								json: async () => ({ message: 'Unauthorized' })  // 必要なレスポンスボディ
							};
						}

				if (response.status === 401) {
					const error = new Error('Unauthorized');
					// カスタムプロパティとしてエラーコードを追加してcatchで識別
					error.code = 401; 
					throw error;
				} else if (!response.ok) {
					throw new Error(`hth: Request failed with status ${response.status}`);
				}

				this.userProfile = await response.json();
				return this.userProfile;
			} catch (error) {
				if (error.code === 401) {
					console.error('hth: Authentication failed');
					// 401 Unauthorized エラーの場合UIに表示
					alert('Your session has expired. Please log in again.');
				} else {
					console.error('hth: Failed to fetch user profile:', error);
				}
			}
		}
		return this.userProfile;
	}

}

export default UserManager;
