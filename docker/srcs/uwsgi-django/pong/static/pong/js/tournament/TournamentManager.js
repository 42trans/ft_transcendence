// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/TournamentManager.js
import TournamentDisplay from './TournamentDisplay.js';
import TournamentCreator from './TournamentCreator.js';
import RoundsManager from './RoundsManager.js';

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
		// fetch: HTTPリクエストを行うためのAPI
		// header に Authorization を含めて GET リクエスト
		fetch('/accounts/api/user/profile/', {
			headers: {
				// Bearer: HTTP認証スキームの一種.JWTトークンを含むAuthorizationヘッダーの値として使用
				// localStorage.getItem: ブラウザのローカルストレージからJWTトークンを取得する
				'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
			}
		})
		// .then()メソッド: Promiseが解決（成功）した場合に実行されるコールバック関数を指定
		// 前の非同期操作（fetch HTTPリクエスト）が成功した後に実行
		.then(response => {
			if (response.ok) 
			{
				console.log('response.ok', response);
				return response.json();
			} else {
				console.log('response.no handleGuestUser', response);
				this.handleGuestUser();
				return null;
			}
		})
		.then(userProfile => {
			console.log('Logged in user:', userProfile);
			this.displayUserInfo(userProfile);
			this.checkForOngoingTournaments();
		})
		.catch(error => {
			console.error(`TournamentManager init() failed`, error);
			document.getElementById('tournament-container').textContent = 'Please log in to manage tournaments.';
		});
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

	/**
	 * 現在進行中のトーナメントを取得して表示
	 */
	checkForOngoingTournaments() 
	{
		fetch('/pong/api/tournament/user/ongoing/')
		// レスポンスデータをJSON形式に変換
		.then(response => response.json())
		.then(tournaments => 
		{
			// 取得したトーナメントデータが配列でない場合、またはトーナメントデータが存在しない場合は、エラー
			if (!tournaments || !Array.isArray(tournaments)) 
			{
				throw new Error('Invalid tournament data');
			}
			// 進行中のトーナメントを示すフラグ（is_finishedがfalse）を持つトーナメントを検索
			const ongoingTournament = tournaments.find(tournament => !tournament.is_finished);
			if (ongoingTournament) 
			{
				this.display.DisplayTournament();
				// トーナメント作成フォームを非表示
				this.tournamentFormContainer.style.display = 'none';
				
				// トーナメントが進行中であることを通知するメッセージ（<h2>要素）
				const message = document.createElement('h2');
				message.classList.add('tournament-message');
				message.textContent = 'Tournament is in progress.';

				// 「Delete Tournament」ボタンを追加
				// const deleteButton = document.createElement('a');
				const deleteButton = document.createElement('button');
				deleteButton.textContent = 'Delete Tournament';
				// ボタンクリックされた場合にトーナメントをdeleteする
				deleteButton.onclick = () => this.deleteTournament(ongoingTournament.id);

				// 選択した要素の子要素の先頭に追加
				document.getElementById('tournament-container').prepend(deleteButton);
				document.getElementById('tournament-container').prepend(message);
			} else {
				this.display.DisplayTournament();
				this.creator.createForm();
			}
		})
		.catch(error => console.error('Error checking tournaments:', error));
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

	
}

export default TournamentManager;
