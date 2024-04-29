class TournamentCreator 
{
	constructor(containerId, errorMessageId, successMessageId, backHomeButtonId) 
	{
		this.container = document.getElementById(containerId);
		this.errorMessage = document.getElementById(errorMessageId);
		this.successMessage = document.getElementById(successMessageId);
		this.backHomeButton = document.getElementById(backHomeButtonId);
	}

	/** トーナメントの新規作成フォーム */
	createForm() 
	{
		// console.log("createForm()");
		
		// CSRFトークンを取得
		const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

		const form = document.createElement('form');
		form.id = 'tournamentForm';
		form.method = 'post';
		// 送信先URL
		form.action = '/pong/api/tournament/create/';
		form.innerHTML = `
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
			<input type="hidden" name="player_nicknames" id="playerNicknames">
			<button type="submit">Submit</button>
		`;
		this.container.appendChild(form);
		this.form = form;
		// ボタンクリックでhandleSubmit()を呼び出す
		this.form.addEventListener('submit', e => this.handleSubmit(e));
		// 日付フィールドを現在の日時に設定
		this.setDate();
	}

	/** */
	handleSubmit(event) 
	{
		// イベントのデフォルトの動作をキャンセル: フォームの送信によるページの再読み込みをキャンセルする
		event.preventDefault();
		// フォームに関連するメッセージをクリア
		this.clearMessages();
		const name = this.form.elements['name'].value;
		const date = this.form.elements['date'].value;
		// フォームからすべてのニックネーム入力フィールドを取得し、それらを配列に変換
		// .map(input => input.value.trim());: 各ニックネーム入力フィールドの値から前後の空白を取り除いた配列を作成
		const nicknames = Array.from(this.form.querySelectorAll('input[name="nickname"]'))
							.map(input => input.value.trim());

		if (!name) 
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
		fetch(this.form.action, 
		{
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
		.then(data => this.handleSuccess(data))
		.catch(error => 
		{
			console.error('Fetch error:', error);
			this.handleError(error);
		});
	}

	clearMessages() 
	{
		this.errorMessage.textContent = '';
		this.successMessage.textContent = '';
	}

	handleSuccess(data) 
	{
		if (data.status === 'success') {
			this.successMessage.textContent = 'Tournament successfully registered!';
			this.backHomeButton.style.display = 'block';
			this.backHomeButton.onclick = () => window.location.href = '/pong/';
		} else {
			this.errorMessage.textContent = 'Error registering tournament. Please try again.';
		}
	}

	handleError(error) 
	{
		this.errorMessage.textContent = 'Error processing your request. Please try again.';
	}

	setDate() 
	{
		const now = new Date().toISOString();
		const localDateTime = now.substring(0, now.length - 8);
		this.form.elements['date'].value = localDateTime;
	}
}

export default TournamentCreator;