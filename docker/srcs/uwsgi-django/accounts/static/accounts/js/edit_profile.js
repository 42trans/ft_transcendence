// document.addEventListener('DOMContentLoaded', function() {
// 	const is42AuthUser = "{{ is_42auth_user|yesno:'true,false' }}";  // Djangoのyesnoフィルターを使用
// 	if (is42AuthUser) {
// 		document.getElementById('password-form').style.display = 'none';  // パスワードフォームを非表示にする
// 	}
// });

function updateNickname(event) {
	event.preventDefault();
	const nickname = document.getElementById('nickname').value;

	fetch('/accounts/api/user/edit-profile/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('access_token')}`
		},
		body: JSON.stringify({
			nickname: nickname,
		})
	})
		.then(response => response.json())
		.then(data => {
			if (data.error) {
				document.getElementById('message-area').textContent = data.error;
			} else {
				document.getElementById('message-area').textContent = data.message;
				console.log('Success:', data.message);
				window.location.href = '/user-profile/';
			}
		})
		.catch(error => console.error('Error:', error));
}


function updatePassword(event) {
	event.preventDefault();
	const currentPassword = document.getElementById('current_password').value;
	const newPassword = document.getElementById('new_password').value;

	fetch('/accounts/api/user/edit-profile/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('access_token')}`
		},
		body: JSON.stringify({
			current_password: currentPassword,
			new_password: newPassword
		})
	})
		.then(response => response.json())
		.then(data => {
			if (data.error) {
				document.getElementById('message-area').textContent = data.error;
			} else {
				document.getElementById('message-area').textContent = data.message;
				console.log('Success:', data.message);
				window.location.href = '/user-profile/';
			}
		})
		.catch(error => console.error('Error:', error));
}
