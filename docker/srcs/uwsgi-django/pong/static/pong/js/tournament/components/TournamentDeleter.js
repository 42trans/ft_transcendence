// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/TournamentDeleter.js
import UIHelper		from '../UIHelper.js';
import { config }	from '../ConfigTournament.js';

class TournamentDeleter 
{
	constructor() 
	{
		this.API_URLS = config.API_URLS;
		this.errorMessage = document.getElementById(config.errorMessageId);
		this.submitMessage = document.getElementById(config.submitMessageId);
	}

	async deleteTournament(tournamentId) 
	{
		console.log(`Deleting tournament ID: ${tournamentId}`);

		try {
			const response = await fetch(`${this.API_URLS.tournamentDelete}${tournamentId}/`, 
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
					'X-CSRFToken': UIHelper.getCSRFToken(),
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({}),
				redirect: 'manual'
			});

			if (!response.ok) 
			{
				UIHelper.putError("No data returned. Please try again later.", this.errorMessage);
				return;
			}

			const data = await response.json();
			if (data.status === 'success') {
				UIHelper.handleSuccess('Tournament deleted successfully', '/pong/', this.submitMessage)
			} else {
				UIHelper.putError("No data returned. Please try again later.", this.errorMessage);
			}
		} catch (error) {
			console.error('Error deleting tournament:', error);
			UIHelper.putError("Failed to delete the tournament. Please try again.", this.errorMessage);
		}
	}
}

export default TournamentDeleter;
