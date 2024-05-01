// class TournamentDisplay 
// {
// 	constructor(settings) 
// 	{
// 		this.tournamentForm				= document.getElementById(settings.tournamentFormId);
// 		this.userInfoContainer			= document.getElementById(settings.userInfoId);
// 		this.errorMessage				= document.getElementById(settings.errorMessageId);
// 		this.submitMessage				= document.getElementById(settings.submitMessageId);
// 		this.backHomeButton				= document.getElementById(settings.backHomeButtonId);
// 		this.ongoingTournamentContainer	= document.getElementById(settings.ongoingTournamentId);
// 		this.tournamentRoundContainer	= document.getElementById(settings.tournamentRoundId);
// 		this.tournamentContainer		= document.getElementById(settings.tournamentContainerId);
// 		this.userInfoContainer			= document.getElementById(settings.userInfoId);
// 	}

// 	async displayTournament(tournamentId) {
// 		console.log("Displaying tournament:", tournamentId);  // トーナメントIDをログ
        
// 		try {
// 			const response = await fetch(`/pong/api/tournament/data/${tournamentId}`, {
// 				headers: {'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`}
// 			});
// 			if (!response.ok) {
// 				throw new Error('Failed to fetch tournament details');
// 			}
// 			const tournament = await response.json();
// 			this.updateTournamentDisplay(tournament);
// 		} catch (error) {
// 			console.error('Error loading tournament details:', error);
// 			this.ongoingTournamentContainer.textContent = 'Error loading tournament details.';
// 		}
// 	}

// 	updateTournamentDisplay(tournament) {
// 		if (tournament) {
// 			console.log("Updating display with:", tournament);  // 取得したトーナメントデータをログ
            

// 			const nicknamesList = tournament.player_nicknames.map(nickname => `<li>${nickname}</li>`).join('');
// 			const tournamentDetailsHTML = `
// 				<h3>Ongoing Tournament:</h3>
// 				<p>
// 					<strong>${tournament.name}</strong>
// 					on <strong>${new Date(tournament.date).toLocaleString()}</strong>
// 				</p>
// 				<ul>${nicknamesList}</ul>
// 			`;
// 			this.ongoingTournamentContainer.innerHTML = tournamentDetailsHTML;
// 			console.log(this.ongoingTournamentContainer.innerHTML);
// 		} else {
// 			this.ongoingTournamentContainer.textContent = 'No ongoing tournament found.';
// 		}
// 	}
	
// }

// export default TournamentDisplay;
