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
			}
		})
		.catch(error => console.error('Error:', error));
}
