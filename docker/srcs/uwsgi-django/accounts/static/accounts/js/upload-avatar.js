// upload-avatar.js

import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"


function uploadAvatar() {
    const input = document.getElementById('avatar');
    const file = input.files[0];
    if (!file) {
        alert('Please select a file.');
        return;
    }

    // ファイル名の前処理と検証
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");  // 特殊文字をアンダースコアに置換

    const formData = new FormData();
    formData.append('avatar', file, cleanFileName);

    fetch('/accounts/api/change-avatar/', {
        method: 'POST',
        body: formData,
    }).then(handleResponse)
        .then(showSuccess)
        .catch(handleError);
}


function handleResponse(response) {
    if (response.ok) {
        return response.json();
    } else if (response.status === 400) {
        return response.json().then(data => {
            const errorMessage = data.message.match(/\['(.*?)'\]/)[1];
            throw new Error('Failed to update avatar: ' + errorMessage);  // BadRequestの内容を表示
        });
    } else {
        throw new Error('Error');
    }
}


function showSuccess(data) {
    console.log('Success:', data);
    alert('Avatar updated successfully');
    const redirectTo = routeTable['userProfile'].path;
    switchPage(redirectTo)
}


function handleError(error) {
    console.error('Error:', error);
    alert(error.message);
}


export function setupUploadAvatarEventListener() {
    const uploadButton = document.getElementById('uploadAvatarButton');
    if (uploadButton) {
        uploadButton.addEventListener('click', (event) => {
            event.preventDefault();
            uploadAvatar();
        });
    }
}
