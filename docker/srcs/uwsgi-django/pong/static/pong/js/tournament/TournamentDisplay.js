class TournamentDisplay 
{
	constructor(tournamentDetailsId, ongoingTournamentId) 
	{
		this.tournamentDetails = document.getElementById(tournamentDetailsId);
		this.latestTournamentDisplay = document.getElementById(ongoingTournamentId);
	}

	DisplayTournament() 
	{
		fetch('/pong/api/tournament/data/')
		.then(response => response.json())
		.then(data => 
		{
			const latestTournament = data.data.sort((a, b) => new Date(b.fields.date) - new Date(a.fields.date))[0];
			if (latestTournament) 
			{
				const nicknames = JSON.parse(latestTournament.fields.player_nicknames).join('<li>');
				const tournamentDetailsHTML = `
					<h3>Ongoing tournament:</h3>
					<p>
						<strong>${latestTournament.fields.name}</strong>
						on <strong>${new Date(latestTournament.fields.date).toLocaleString()}</strong>
					</p>
					<ul>
						<li>${nicknames}
					</ul>
				`;
				this.latestTournamentDisplay.innerHTML = tournamentDetailsHTML;
			} else {
				this.latestTournamentDisplay.textContent = 'No tournaments found.';
			}
		})
		.catch(error => console.error('Error loading tournament data:', error));
	}
}

export default TournamentDisplay;
