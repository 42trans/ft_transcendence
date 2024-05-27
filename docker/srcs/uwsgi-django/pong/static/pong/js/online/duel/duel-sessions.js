// docker/srcs/uwsgi-django/pong/static/pong/js/online/duel/duel-sessions.js

class DuelSeesionsManager 
{
	constructor() {
		document.addEventListener('DOMContentLoaded', () => {
			this.setupRequestButton();
			this.fetchDMList();
		});
	}

	setupRequestButton() {
		const input = document.querySelector('#nickname-input');
		const submitButton = document.querySelector('#nickname-submit');
		input.focus();

		submitButton.onclick = () => {
			const duelTargetNickname = input.value;
			this.createRoom(duelTargetNickname);
		};
	}

	// APIを呼び出してルームを作成する関数
	createRoom(duelTargetNickname) {
		console.log("createRoom():duelTargetNickname", duelTargetNickname);

		return fetch('/pong/api/online/duel/rooms/create/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
				'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
			},
			body: JSON.stringify({other_user_nickname: duelTargetNickname})
		})
		.then(async response => {
			if (response.ok) {
				const data = await response.json();
				console.log("Room created:", data);
				// ルーム作成成功時の処理 (画面遷移など)
				window.location.href = `/pong/online/duel/room/${data.room_name}/`;
			} else {
				const errorData = await response.json();
				// エラー処理 (errorData.errorなどを利用)
				console.error("Error creating room:", errorData); 
			}
		})
	}

	fetchDMList() {
		fetch('/chat/api/dm-sessions/', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${localStorage.getItem('access_token')}`
			}
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => this.createDMSessionLinks(data))
			.catch(error => console.error('There has been a problem with your fetch operation:', error));
	}

	createDMSessionLinks(data) 
	{
		const list = document.getElementById('duel-sessions');
		list.innerHTML = '';
	
		data.forEach(dmSession => 
		{
			const item = document.createElement('li');
			const link = document.createElement('a');
	
			link.href = `/pong/api/online/duel/rooms/create/`;
			link.textContent = `${dmSession.target_nickname}`;
			// リストアイテムにリンクを追加
			item.appendChild(link);
			list.appendChild(item);

			link.addEventListener('click', (event) => {
				event.preventDefault();
				this.createRoom(dmSession.target_nickname);
			});
		});
	}
}

new DuelSeesionsManager();