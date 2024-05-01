// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/TournamentCreator.js
import UIHelper from './UIHelper.js';

class TournamentCreator 
{
	constructor(settings) 
	{
		this.tournamentForm				= document.getElementById(settings.tournamentFormId);
		this.userInfoContainer			= document.getElementById(settings.userInfoId);
		this.errorMessage				= document.getElementById(settings.errorMessageId);
		this.submitMessage				= document.getElementById(settings.submitMessageId);
		this.backHomeButton				= document.getElementById(settings.backHomeButtonId);
		this.ongoingTournamentContainer	= document.getElementById(settings.ongoingTournamentId);
		this.tournamentRoundContainer	= document.getElementById(settings.tournamentRoundId);
		this.tournamentContainer		= document.getElementById(settings.tournamentContainerId);
	}

	// TODO_ft:msg or utilクラス
	handleSuccess(data, text, href) 
	{
		if (data.status === 'success') 
		{
			this.submitMessage.textContent = text;
			this.backHomeButton.style.display = 'block';
			this.backHomeButton.onclick = () => window.location.href = href;
		} else {
			this.errorMessage.textContent = 'Error registering tournament. Please try again.';
		}
	}

	putError(error) 
	{
		this.errorMessage.textContent = 'Error processing your request. Please try again.';
	}

	// ---------


	/** Public method: トーナメントの新規作成用フォームを作成 */
	createForm(userProfile) 
	{
		UIHelper.displayUserInfo(userProfile, this.userInfoContainer);

		this.userProfileId = userProfile.id;
		// CSRFトークンを取得
		const csrfToken		= document.querySelector('[name=csrfmiddlewaretoken]').value;
		// フォーム要素を作成し、プロパティを設定
		this.form			= document.createElement('form');
		this.form.id		= this.tournamentForm;
		// this.form.id		= 'tournamentForm';
		this.form.method	= 'post';
		this.form.action	= '/pong/api/tournament/create/';
		// フォームのHTML内容を生成して設定
		this.form.innerHTML	= this._generateFormHTML(csrfToken);
		// .htmlにフォームを追加
		this.tournamentForm.appendChild(this.form);
		// 分の単位までで現在の日時を設定
		this.form.elements['date'].value = this._getDateTimeUpToMinutes();
		// ボタンクリックでhandleSubmit()を呼び出す
		this.form.addEventListener('submit', e => this._saveTournament(e));
	}

	/** form内容html*/
	_generateFormHTML(csrfToken) {
		return `
			<h2 class="slideup-text">Create Tournament</h2>
			<input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
			<input type="text" id="name" name="name" placeholder="Tournament Name" value="My Tournament">
			<input type="datetime-local" id="date" name="date" readonly>
			<input type="text" name="nickname" placeholder="Nickname 1" value="Nickname1">
			<input type="text" name="nickname" placeholder="Nickname 2" value="Nickname2">
			<input type="text" name="nickname" placeholder="Nickname 3" value="Nickname3">
			<input type="text" name="nickname" placeholder="Nickname 4" value="Nickname4">
			<input type="text" name="nickname" placeholder="Nickname 5" value="Nickname5">
			<input type="text" name="nickname" placeholder="Nickname 6" value="Nickname6">
			<input type="text" name="nickname" placeholder="Nickname 7" value="Nickname7">
			<input type="text" name="nickname" placeholder="Nickname 8" value="Nickname8">
			<button type="submit">Submit</button>
		`;
	}

	/** 現在の日時を 'YYYY-MM-DDTHH:MM' 形式で取得 */
	_getDateTimeUpToMinutes() 
	{
		const now	= new Date().toISOString();
		// YYYY-MM-DDTHH:MM = 16文字
		return	now.substring(0, 16);
	}

	/** トーナメントを保存する */
	_saveTournament(event) 
	{
		// イベントのデフォルトの動作をキャンセル: フォームの送信によるページの再読み込みをキャンセルする
		event.preventDefault();
		// フォームに関連するメッセージをクリア
		this._clearMessages();

		// 進行中のトーナメントの判定を行い、なければ作成する。二重登録防止
		this._checkOngoingTournaments().then(isOngoing => 
			{
				if (isOngoing) 
				{
					this.errorMessage.textContent = 'There is an ongoing tournament. You cannot create a new one.';
					return; 
				} else {
					// トーナメント作成処理を続行
					this._processFormSubmission();
				}
			})
			.catch(error => {
				console.error('Error checking ongoing tournaments:', error);
				this.errorMessage.textContent = 'Error checking tournament status. Please try again.';
			});
	}
	
	_clearMessages() 
	{
		this.errorMessage.textContent	= '';
		this.submitMessage.textContent	= '';
	}
	
	// 進行中のトーナメントを確認する関数
	_checkOngoingTournaments() {
		return fetch('/pong/api/tournament/user/ongoing/').then(response => 
				{
					if (!response.ok) 
					{
						throw new Error('Failed to fetch ongoing tournaments');
					}
					return response.json();
				})
			.then(tournaments => 
				{
					return tournaments.some(tournament => !tournament.is_finished);
				});
	}
	
	
	_processFormSubmission()
	{
		// const name = this.form.elements['name'].value;
		// const date = this.form.elements['date'].value;
		// フォームからすべてのニックネーム入力フィールドを取得し、それらを配列に変換
		// .map(input => input.value.trim());: 各ニックネーム入力フィールドの値から前後の空白を取り除いた配列を作成
		const nicknames = Array.from(this.form.querySelectorAll('input[name="nickname"]'))
							.map(input => input.value.trim());

		if (!this.form.elements['name'].value) 
		{
			this.errorMessage.textContent = 'Tournament name is required.';
			return;
		}

		// ８箇所すべてのニックネームが入力されているかをチェック
		if (nicknames.length < 8 || nicknames.includes('')) 
		{
			this.errorMessage.textContent = 'All 8 nicknames are required.';
			return;
		}

		const formData = new FormData(this.form);
		// player_nicknamesという名前でニックネームの配列をFormDataに追加
		// ニックネームの配列はJSON形式に変換
		formData.append('player_nicknames', JSON.stringify(nicknames));
		// user.idをorganizerとして登録
		formData.append('organizer', this.userProfileId);
		console.log('formData',formData);
		fetch(this.form.action, {
			method: 'POST',
			body: formData,
		})
			.then(response => 
				{
					if (!response.ok) 
					{
						throw new Error('Network response was not ok');
					}
					return response.json();
				})
			.then(data => this.handleSuccess(
					data, 
					'Tournament successfully registered!',
					'/pong/')
				)
			.catch(error => 
				{
					console.error('Fetch error:', error);
					this.putError(error);
				});

	}

}

export default TournamentCreator;