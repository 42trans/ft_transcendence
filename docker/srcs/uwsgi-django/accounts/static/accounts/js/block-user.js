// static/accounts/js/block-user.js

import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"


function blockUser(nickname) {
    fetch(`/accounts/api/block/${nickname}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);       // 結果をポップアップで表示
            const redirectTo = routeTable['userInfoBase'].path + nickname + '/'
            switchPage(redirectTo)
        })
        .catch(error => {
            console.error('hth: Error:', error);
            alert('Failed to block the user.');
        });
}


export function setupBlockUserEventListener() {
    console.log("Setup block event listeners");
    const blockUserButton = document.querySelector('.hth-btn.blockUserButton');
    if (blockUserButton) {
        blockUserButton.addEventListener('click', (event) => {
            event.preventDefault();

            const nickname = blockUserButton.dataset.nickname;
            console.log('blockUserButton clicked', nickname);
            blockUser(nickname);
        });
    }
}
