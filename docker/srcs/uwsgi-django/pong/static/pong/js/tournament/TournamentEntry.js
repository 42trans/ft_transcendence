// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/TournamentEntry.js
import UIHelper from './UIHelper.js';

class TournamentEntry {
	constructor(settings, tmgr) {
		this.tournamentForm				= document.getElementById(settings.tournamentFormId);
		this.userInfoContainer			= document.getElementById(settings.userInfoId);
		this.errorMessage				= document.getElementById(settings.errorMessageId);
		this.submitMessage				= document.getElementById(settings.submitMessageId);
		this.backHomeButton				= document.getElementById(settings.backHomeButtonId);
		this.ongoingTournamentContainer	= document.getElementById(settings.ongoingTournamentId);
		this.tournamentRoundContainer	= document.getElementById(settings.tournamentRoundId);
		this.tournamentContainer		= document.getElementById(settings.tournamentContainerId);
		this.userInfoContainer			= document.getElementById(settings.userInfoId);

		this.csrfToken				= UIHelper.getCSRFToken();
		this.tournamentManager		= tmgr;
	}

	async displayTournament(tournamentId) 
	{
		// console.log("Displaying tournament:", tournamentId);

		try {
			const response = await fetch(`/pong/api/tournament/data/${tournamentId}`, {
				headers: {'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`}
			});
			if (!response.ok) 
			{
				throw new Error('Failed to fetch tournament details');
			}
			const tournament = await response.json();
			return this.createTournamentDetailsElement(tournament);
		} catch (error) {
			console.error('Error loading tournament details:', error);
			const errorElement = document.createElement('div');
			this.errorElement.textContent = 'Error loading tournament details.';
			return errorElement;
		}
	}

	createTournamentDetailsElement(tournament) 
	{
		const detailsContainer = document.createElement('div');
		if (tournament) {
			// console.log("createTournamentDetailsElement() tournament:", tournament);
			const nicknamesList = tournament.player_nicknames.map(nickname => `<li>${nickname}</li>`).join('');
			detailsContainer.innerHTML = `
				<h3>Ongoing Tournament:</h3>
				<p>
					<strong>${tournament.name}</strong>
					on <strong>${new Date(tournament.date).toLocaleString()}</strong>
				</p>
				<ul>${nicknamesList}</ul>
			`;
		} else {
			detailsContainer.textContent = 'No ongoing tournament found.';
		}
		return detailsContainer;
	}
	
	/** 注意: htmlの構造にかかわらず、appendChildの順番で出力される。 */
	async display(ongoingTournament) 
	{
		await this.displayHeader();
		
		const tournamentDetails = await this.displayTournament(ongoingTournament.id);
		this.tournamentContainer.appendChild(tournamentDetails);
		
		await this.addAdditionalInfo(ongoingTournament.id);
	}


	async displayHeader() 
	{
		UIHelper.displayUserInfo(this.tournamentManager.userProfile, this.tournamentContainer);
		// トーナメントが進行中であることを示す見出しを追加
		const header = document.createElement('h2');
		header.textContent = 'Tournament is in progress.';
		this.tournamentContainer.appendChild(header);
	}
	
	async addAdditionalInfo(tournamentId) 
	{
		// トーナメントの詳細情報を表示する段落を追加
		const detailsParagraph = document.createElement('p');
		detailsParagraph.textContent = `Details for tournament ID: ${tournamentId}`;
		this.tournamentContainer.appendChild(detailsParagraph);
		// トーナメントを削除するためのボタンを追加
		const deleteButton = document.createElement('button');
		deleteButton.textContent = 'Delete Tournament';
		deleteButton.onclick = () => this.deleteTournament(tournamentId);
		this.tournamentContainer.appendChild(deleteButton);

	}

	async deleteTournament(tournamentId) {
		console.log(`Deleting tournament ID: ${tournamentId}`);

		try {
			const response = await fetch(`/pong/api/tournament/delete/${tournamentId}/`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
					'X-CSRFToken': this.csrfToken,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({}),
				redirect: 'manual'
			});

			if (!response.ok) 
			{
				UIHelper.putError("No data returned. Please try again later.", errorMessage);
				return;
			}

			const data = await response.json();
			if (data.status === 'success') {
				this.handleSuccess(data, 'Tournament deleted successfully', '/pong/');
			} else {
				UIHelper.putError("No data returned. Please try again later.", errorMessage);
			}
		} catch (error) {
			console.error('Error deleting tournament:', error);
			UIHelper.putError("Failed to delete the tournament. Please try again.",errorMessage);
		}
		
	}

	handleSuccess(data, message, redirectUrl) {
		// 成功処理とリダイレクト
		console.log(message);
		window.location.href = redirectUrl;
		// this.submitMessage.textContent = text;
			// this.backHomeButton.style.display = 'block';
			// this.backHomeButton.onclick = () => window.location.href = redirectUrl;
	}	
}

export default TournamentEntry;
