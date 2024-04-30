// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/TournamentManager.js
import TournamentDisplay from './TournamentDisplay.js';
import TournamentCreator from './TournamentCreator.js';
// import RoundsManager from './RoundsManager.js';

class TournamentManager 
{
	constructor(settings) 
	{
		this.API_URLS = {
			userProfile:		'/accounts/api/user/profile/',
			ongoingTournaments:	'/pong/api/tournament/user/ongoing/'
		};

		this.display = new TournamentDisplay(
			settings.tournamentDetailsId, 
			settings.ongoingTournamentId);

		this.creator = new TournamentCreator(
			settings.tournamentFormId, 
			settings.errorMessageId, 
			settings.submitMessageId, 
			settings.backHomeButtonId);

		// this.roundsMgr = new RoundsManager(settings.tournamentRoundId);

		// 情報を表示するコンテナのIDを設定から取得
		this.tournamentFormContainer	= document.getElementById(settings.tournamentFormId);
		this.userInfoContainer			= document.getElementById(settings.userInfoId);
		this.tournamentContainer		= document.getElementById(settings.tournamentContainerId);
		
		this.userProfile	= null;
		this.csrfToken		= null;

	}

	/**
	 * 処理フロー: まずログイン状態で分岐し、次に未終了の主催トーナメントの有無で分岐
	 */
	async init() 
	{
		try {
			const userProfile = await this.getUserProfile();
			// ログイン状態で分岐
			if (userProfile) {
				this.handleLoggedInUser(userProfile);
			} else {
				this.handleGuestUser();
			}
		} catch (error) {
			console.error(`TournamentManager init() failed`);
			this.tournamentContainer.textContent = "Error loading your information. Try again later.";
		}
	}

	// APIからユーザー情報を取得
	async getUserProfile() 
	{
		if (!this.userProfile) 
		{
			const response = await fetch(this.API_URLS.userProfile, {
				headers: {'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`}
			});
			if (response.ok) {
				this.userProfile = await response.json();
			} else {
				return null;
			}
		}
		return this.userProfile;
	}

	// ログインしている場合の処理
	async handleLoggedInUser(userProfile) 
	{
		// console.log('profile:', userProfile);

		// ニックネームを表示
		this.displayUserInfo(userProfile);
		// 主催トーナメントの開催状態で分岐:トーナメント対戦表 or　作成form を表示
		await this.handleTournamentDisplay();
	}

	/** 主催トーナメントの開催状態で分岐:トーナメント対戦表 or　作成form を表示 */
	async handleTournamentDisplay() 
	{
		try {
			const ongoingTournaments = await this.getFilteredUserTournaments();
			// 主催トーナメントの開催状態で分岐
			if (ongoingTournaments.length > 0) {
				// トーナメント情報を表示
				this.displayTournamentDetails(ongoingTournaments[0]);
			} else {
				// トーナメント新規作成フォームを表示
				this.creator.createForm(this.userProfile);
			}
		} catch (error) {
			console.error('Error checking tournaments:', error);
			this.tournamentContainer.textContent = 'Error loading tournaments.';
		}
	}

	/**
	 * ユーザーが主催する"未終了"のトーナメントのリストを取得
	 * @returns {Promise<Array>} 未終了のトーナメントの配列
	 */
	async getFilteredUserTournaments() 
	{
		const userProfile = await this.getUserProfile();
		if (!userProfile) {
			return [];
		}
		try {
			const response = await fetch('/pong/api/tournament/user/ongoing/', {
				headers: {'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`}
			});
			const tournaments = await response.json();
			// console.log('tournaments:', tournaments);
			return tournaments.filter(tournament => !tournament.is_finished && tournament.organizer === userProfile.id);
		} catch (error) {
			console.error('Error checking user-owned ongoing tournaments:', error);
			return [];
		}
	}

	// トーナメント情報を表示
	displayTournamentDetails(ongoingTournament) 
	{
		this.display.DisplayTournament();
		// トーナメント作成フォームを非表示
		this.tournamentFormContainer.style.display = 'none';
		// 「トーナメント進行中」を表示（<h2>要素）
		const message = document.createElement('h2');
		message.classList.add('tournament-message');
		message.textContent = 'Tournament is in progress.';
		// 「Delete Tournament」ボタンを追加
		const deleteButton = document.createElement('button');
		deleteButton.textContent = 'Delete Tournament';
		deleteButton.onclick = () => this.deleteTournament(ongoingTournament.id);
		// 選択した要素の子要素の先頭に追加
		this.tournamentContainer.prepend(deleteButton);
		this.tournamentContainer.prepend(message);
	}

	// トーナメントの削除
	async deleteTournament(tournamentId) 
	{
		// console.log('CSRF Token:', csrfToken);  
		// console.log('tournament ID:', tournamentId);

		const csrfToken = this.getCSRFToken();
		try {
			const response = await fetch(`/pong/api/tournament/delete/${tournamentId}/`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
					'X-CSRFToken': csrfToken,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({}),
				redirect: 'manual'
			});
			const data = await response.json();
			if (data.status === 'success') {
				this.creator.handleSuccess(data, 'Tournament deleted successfully', '/pong/');
			} else {
				throw new Error(`deleteTournament() failed: ${data.message}`);
			}
		} catch (error) {
			console.error('Error deleting tournament:', error);
		}
	}

	getCSRFToken() 
	{
		if (!this.csrfToken) {
			this.csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
		}
		return this.csrfToken;
	}

	/** ユーザーのニックネームを表示 */
	displayUserInfo(userProfile) 
	{
		if (userProfile && userProfile.nickname) {
			const nicknameItem = document.createElement('li');
			nicknameItem.textContent = `Nickname: ${userProfile.nickname}`;
			// htmlにあらかじめ用意した場所(userInfoContainer)に子要素として追加
			this.userInfoContainer.appendChild(nicknameItem);
		} else {
			console.error('displayUserInfo() failed');
		}
	}
	
	/** ゲストユーザーへ表示する内容 */
	handleGuestUser() {
		document.getElementById('tournament-container').innerHTML = `
			<p>Please log in to manage or create tournaments.</p>
			<p><a href="/accounts/login">Log in</a> or <a href="/accounts/signup">Sign up</a></p>
		`;
	}
}

export default TournamentManager;
