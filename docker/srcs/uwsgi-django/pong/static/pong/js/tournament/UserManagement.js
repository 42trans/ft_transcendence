// UserManagement.js
class UserManagement 
{
	constructor(settings) 
	{
		this.API_URLS = settings.API_URLS;
		this.userProfile = null;
	}

	async getUserProfile() 
	{
		if (!this.userProfile) 
		{
			try {
				const response = await fetch(this.API_URLS.userProfile, {
					headers: {'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`}
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

export default UserManagement;
