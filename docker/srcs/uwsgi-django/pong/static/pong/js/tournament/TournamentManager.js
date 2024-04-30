// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/TournamentManager.js
import TournamentDisplay from './TournamentDisplay.js';
import TournamentCreator from './TournamentCreator.js';
// import RoundsManager from './RoundsManager.js';

class TournamentManager 
{
	constructor(settings) 
	{
		this.display = new TournamentDisplay(
			settings.tournamentDetailsId, 
			settings.ongoingTournamentId);
		this.creator = new TournamentCreator(
			settings.tournamentFormId, 
			settings.errorMessageId, 
			settings.submitMessageId, 
			settings.backHomeButtonId);
		// this.roundsMgr = new RoundsManager(
		// 	settings.tournamentRoundId);
		
		// 情報を表示するコンテナのIDを設定から取得
		this.tournamentFormContainer = document.getElementById(settings.tournamentFormId);
		this.userInfoContainer = document.getElementById(settings.userInfoId);
	}

	init() 
	{
		this.getUserProfile()
			.then(userProfile => 
				{
					if (userProfile) 
					{
						// ログインユーザーのニックネームを表示
						this.displayUserInfo(userProfile);
						// トーナメント対戦表 or 作成form を表示
						this.handleTournamentDisplay();
					} else {
						// ゲストユーザーへの表示
						this.handleGuestUser();
					}
				})
			.catch(error => 
				{
					console.error(`TournamentManager init() failed: ${error.message}`);
					document.getElementById('tournament-container').textContent = 'Please log in to manage tournaments.';
				});
	}

	/**トーナメント対戦表 or　作成form を表示 */
	handleTournamentDisplay() 
	{
		this.hasOngoingTournaments()
			.then(hasOngoing => 
				{
					const ongoingTournament = hasOngoing.find(tournament => !tournament.is_finished);
					// 現在進行中のトーナメントがある場合
					if (ongoingTournament) {
						this.displayTournamentDetails(ongoingTournament);
					} else {
						this.display.DisplayTournament();
						this.creator.createForm();
					}
				})
			.catch(error => 
				{
					console.error('Error checking tournaments:', error);
					document.getElementById('tournament-container').textContent = 'Error loading tournaments.';
				});
	}

	// user profileを取得
	getUserProfile() 
	{
		// fetch: HTTPリクエストを行うためのAPI
		// header に Authorization を含めて GET リクエスト
		return fetch('/accounts/api/user/profile/', 
		{
			// Bearer: HTTP認証スキームの一種.JWTトークンを含むAuthorizationヘッダーの値として使用
			// localStorage.getItem: ブラウザのローカルストレージからJWTトークンを取得する
			headers: {'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`}
		})
		.then(response => 
			{
				if (response.ok) {
					return response.json();
				} else {
					return null;
				}
			});
	}
	
	// 未終了トーナメントが存在するかどうかのみを確認
	hasOngoingTournaments() 
	{
		return fetch('/pong/api/tournament/user/ongoing/', 
		{
			headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
		})
		.then(response => response.json())
		.catch(error => 
			{
				console.error('hasOngoingTournaments() failed:', error);
				return false;  // エラーが発生した場合は、安全を期してfalseを返す
			});
	}
	
	// トーナメントの表示ロジックを専用のメソッドに分離
	displayTournamentDetails(ongoingTournament) 
	{
		this.display.DisplayTournament();

		// トーナメント作成フォームを非表示
		this.tournamentFormContainer.style.display = 'none';
		
		// トーナメントが進行中であることを通知するメッセージ（<h2>要素）
		const message = document.createElement('h2');
		message.classList.add('tournament-message');
		message.textContent = 'Tournament is in progress.';
		
		// 「Delete Tournament」ボタンを追加
		const deleteButton = document.createElement('button');
		deleteButton.textContent = 'Delete Tournament';
		deleteButton.onclick = () => this.deleteTournament(ongoingTournament.id);

		// 選択した要素の子要素の先頭に追加
		document.getElementById('tournament-container').prepend(deleteButton);
		document.getElementById('tournament-container').prepend(message);
	}

	
	deleteTournament(tournamentId) 
	{
		// console.log('CSRF Token:', csrfToken);  
		// console.log('tournament ID:', tournamentId);

		// CSRFトークンを取得
		const csrfToken = this.getCSRFToken(); 
		fetch(`/pong/api/tournament/delete/${tournamentId}/`, 
		{
			method: 'POST',  // 確実に POST を使用するように指定
			headers: 
			{
				'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
				'X-CSRFToken': csrfToken,
				'Content-Type': 'application/json' 
			},
			body: JSON.stringify({}), 
			// リダイレクトを手動で制御
			redirect: 'manual'
		})
		.then(response => 
			{
				// console.log('Response:', response); 
				if (!response.ok) 
				{
					throw new Error('Failed to delete tournament');
				}
				return response.json();
			})
		.then(data => 
			{
				// console.log('Response data:', data);
				if (data.status === 'success') 
				{
					this.creator.handleSuccess(
						data,
						'Tournament deleted successfully',
						'/pong/')
					// console.log('Tournament deleted successfully');
				} else {
					console.error('Failed to delete tournament:', data.message);
				}
			})
		.catch(error => console.error('Error deleting tournament:', error));
	}
	
	getCSRFToken() 
	{
		return document.querySelector('[name=csrfmiddlewaretoken]').value;
	}

	/** ゲストユーザーへ表示する内容 */
	handleGuestUser() 
	{
		document.getElementById('tournament-container').innerHTML = `
			<p>Please log in to manage or create tournaments.</p>
			<p><a href="/accounts/login">Log in</a> or <a href="/accounts/signup">Sign up</a></p>
		`;
	}

	/**
	 * ユーザーのニックネームを取り出し、それをHTMLのリストアイテムとして表示
	 * @param {*} userProfile 
	 */
	displayUserInfo(userProfile) 
	{
		// console.log('Logged in user:', userProfile);
		if (userProfile && userProfile.nickname) 
		{
			const nicknameItem = document.createElement('li');
			// ブラウザに表示する文字列を作成
			nicknameItem.textContent = `Nickname: ${userProfile.nickname}`;
			// htmlにあらかじめ用意した場所(userInfoContainer)に子要素としてついぁ
			this.userInfoContainer.appendChild(nicknameItem);
		} else {
			console.error('displayUserInfo() failed');
		}
	}
	
}

export default TournamentManager;
