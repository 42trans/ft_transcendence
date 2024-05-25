// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/TournamentCreator.js
import UIHelper		from '../UIHelper.js';
import { config }	from '../ConfigTournament.js';

class TournamentCreator 
{
	constructor() 
	{
		this.API_URLS			= config.API_URLS;
		this.tournamentForm		= document.getElementById(config.tournamentFormId);
		this.userInfoContainer	= document.getElementById(config.userInfoId);
		this.errorMessage		= document.getElementById(config.errorMessageId);
		this.submitMessage		= document.getElementById(config.submitMessageId);

	}

	/** Public method: トーナメントの新規作成用フォームを作成 */
	createForm(userProfile) 
	{
		UIHelper.displayUserInfo(userProfile, this.userInfoContainer);
		// フォーム要素を作成し、プロパティを設定
		this.form			= document.createElement('form');
		this.form.method	= 'post';
		this.form.action	= config.API_URLS.tournamentCreate;
		this.form.organizer	= userProfile.id;
		// フォームのHTML内容を生成して設定
		this.form.innerHTML	= this._generateFormHTML(UIHelper.getCSRFToken(), userProfile.nickname);
		// .htmlの<div>にフォームを追加
		this.tournamentForm.appendChild(this.form);
		// UTC ISO8601:"YYYY-MM-DDTHH:MM:SS.sssZ"
		this.form.elements['date'].value = new Date().toISOString();
		// ボタンクリックでhandleSubmit()を呼び出す
		this.form.addEventListener('submit', e => this._saveTournament(e));
	}

	/** form部分のhtml*/
	_generateFormHTML(csrfToken, organizerNickname)
	{
		return `
		<main class="form-sign m-auto" id="signup-form">
				<form class="hth-sign-form" onsubmit="signupUser(event)">
					<h2 class="slideup-text mb-3">Create Tournament</h2>
					
					<input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
					<input type="hidden" id="date" name="date" readonly>

					<div class="slideup-text form-floating">
						<input type="text" class="form-control" id="name" name="name" placeholder="Tournament Name" value="My Tournament">
						<label for="floatingInput">My Tournament</label>
	 				</div>
					
					<div class="slideup-text form-floating">
						<input type="text" class="form-control" id="nickname" name="nickname" placeholder="Nickname" value="${organizerNickname}" readonly>
						<label for="floatingInput">Nickname1</label>
	 				</div>
					<div class="slideup-text form-floating">
						<input type="text" class="form-control" id="nickname" name="nickname" placeholder="Nickname" value="Nickname2">
						<label for="floatingInput">Player2</label>
	 				</div>
					<div class="slideup-text form-floating">
						<input type="text" class="form-control" id="nickname" name="nickname" placeholder="Nickname" value="Nickname3">
						<label for="floatingInput">Player3</label>
	 				</div>
					<div class="slideup-text form-floating">
						<input type="text" class="form-control" id="nickname" name="nickname" placeholder="Nickname" value="Nickname4">
						<label for="floatingInput">Player4</label>
	 				</div>
					<div class="slideup-text form-floating">
						<input type="text" class="form-control" id="nickname" name="nickname" placeholder="Nickname" value="Nickname5">
						<label for="floatingInput">Player5</label>
	 				</div>
					<div class="slideup-text form-floating">
						<input type="text" class="form-control" id="nickname" name="nickname" placeholder="Nickname" value="Nickname6">
						<label for="floatingInput">Player6</label>
	 				</div>
					<div class="slideup-text form-floating">
						<input type="text" class="form-control" id="nickname" name="nickname" placeholder="Nickname" value="Nickname7">
						<label for="floatingInput">Player7</label>
	 				</div>
					<div class="slideup-text form-floating">
						<input type="text" class="form-control" id="nickname" name="nickname" placeholder="Nickname" value="Nickname8">
						<label for="floatingInput">Player8</label>
	 				</div>
					
					<button class="hth-btn my-4" type="submit">Submit</button>
			</form>
		</main>
		`;
	}
	/** トーナメントを保存する */
	async _saveTournament(event) 
	{
		// イベントのデフォルトの動作をキャンセル: フォームの送信によるページの再読み込みをキャンセルする
		event.preventDefault();
		// フォームに関連するメッセージをクリア
		UIHelper.clearContainer(this.errorMessage);
		UIHelper.clearContainer(this.submitMessage);

		const nicknames			= this._getNicknames();
		const validationResult	= this._validateFormInputs(nicknames);

		if (!validationResult.isValid) 
		{
			UIHelper.putError(validationResult.errorMessage, this.errorMessage);
			return;
		}

		try {
			// 進行中のトーナメントの判定を行い、なければ作成する。二重登録防止
			const isOngoing = await this._isOngoingTournaments();
			if (isOngoing) 
			{
				this.errorMessage.textContent = 'There is an ongoing tournament. You cannot create a new one.';
				return;
			} else {
				await this._processFormSubmission(nicknames);
				
			}
		} catch (error) {
			console.error('Error checking ongoing tournaments or processing form:', error);
			UIHelper.putError('Error processing your request. Please try again.', this.errorMessage);
		}
	}
	
	// フォームからすべてのニックネーム入力フィールドを取得し、それらを配列に変換
	// .map(input => input.value.trim());: 各ニックネーム入力フィールドの値から前後の空白を取り除いた配列を作成
	_getNicknames() 
	{
		return Array.from(this.form.querySelectorAll('input[name="nickname"]'))
					.map(input => input.value.trim());
	}
	
	_validateFormInputs(nicknames) 
	{
		// トーナメント名が未入力の場合
		if (!this.form.elements['name'].value) {
			return { isValid: false, errorMessage: 'Tournament name is required.' };
		}
		// ８箇所すべてのニックネームが入力されているかをチェック
		if (nicknames.length < 8 || nicknames.includes('')) {
			return { isValid: false, errorMessage: 'All 8 nicknames are required.' };
		}
		return { isValid: true };
	}

	// 進行中のトーナメントを確認する関数
	async _isOngoingTournaments() {
		try {
			const response = await fetch(this.API_URLS.ongoingLatestTour, {
				headers: {'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
			});

			// 見つからない場合でも、viewは204を返す。ここはそれ以外のエラーの場合の判定
			// 見つからない場合のviewの戻り値: return JsonResponse({'status': 'success', 'message': 'No ongoing tournaments found'}, status=200)
			if (!response.ok) {
				throw new Error(`Failed to fetch ongoing tournaments with status: ${response.status}`);
			}
			if (response.status === 204) {
				console.log('No ongoing tournaments found, received 204 No Content');
				return null;
			}
			const result = await response.json();
			// result.tournamentが存在する場合はtrueを、それ以外の場合はfalseを返す
			return !!result.tournament;
		} catch (error) {
			console.error('Error checking ongoing tournaments:', error);
			return false;
		}
	}
	
	/** 入力フォームの値をAPIにPOST */
	async _processFormSubmission(nicknames)
	{
		// player_nicknamesという名前でニックネームの配列をFormDataに追加
		// ニックネームの配列はJSON形式に変換
		const formData = new FormData(this.form);
		formData.append('player_nicknames', JSON.stringify(nicknames));
		try {
			const response = await fetch(this.form.action, {
				method: 'POST',
				body: formData,
			});
	
			const data = await response.json(); 
			if (!response.ok) {
				// APIの返すメッセージを使用する
				throw new Error(data.message);
			}
	
			UIHelper.handleSuccess('Tournament successfully', '/pong/', this.submitMessage)
			location.reload();
		} catch (error) {
			console.error('Fetch error:', error);
			UIHelper.putError(error, this.errorMessage);
		}
	}

}

export default TournamentCreator;
