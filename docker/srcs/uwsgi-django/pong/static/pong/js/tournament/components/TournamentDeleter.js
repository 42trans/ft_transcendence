// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/TournamentDeleter.js
import UIHelper		from '../UIHelper.js';
import { config }	from '../ConfigTournament.js';
import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"
// import { tournamentHandleCatchError } from "../TournamentMain.js";

const TEST_TRY1 		= 0;
const TEST_TRY2 		= 0;

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
		try {
						if (TEST_TRY1) {	throw new Error('TEST_TRY1');	}
			const response = await fetch(`${this.API_URLS.tournamentDelete}${tournamentId}/`, 
			{
				method: 'POST',
				headers: {
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
						if (TEST_TRY2) {	data.status = 404;	}
			if (data.status === 'success') {
				UIHelper.handleSuccess('Tournament deleted successfully', routeTable["top"].path, this.submitMessage)
				switchPage(routeTable["tournament"].path)

			} else {
				UIHelper.putError("No data returned. Please try again later.", this.errorMessage);
				alert("No data returned. Please try again later.", this.errorMessage);

			}
		} catch (error) {
			UIHelper.putError("Failed to delete the tournament. Please try again.", this.errorMessage);
			alert("Failed to delete the tournament. Please try again.", this.errorMessage);
		}
	}
}

export default TournamentDeleter;
