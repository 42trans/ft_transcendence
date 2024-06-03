// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/UserManager.js
import { config }	from '../ConfigTournament.js';

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
				const response = await fetch(config.API_URLS.userProfile, {
					headers: {'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
				});
				if (response.ok) 
				{
					this.userProfile = await response.json();
					return this.userProfile;
				}
			} catch (error) {
				console.error('Failed to fetch user profile:', error);
			}
		}
		return this.userProfile;
	}
}

export default UserManager;
