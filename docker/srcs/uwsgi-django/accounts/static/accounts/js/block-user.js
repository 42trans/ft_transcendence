// static/accounts/js/block-user.js

import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"


function blockUser(user_id) {
    fetch(`/accounts/api/block/${user_id}/`, {
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
            if (data.error) {
                alert('Failed to block the user. ' + data.error);
                switchPage(window.location.pathname)
            } else {
                alert(data.message);       // 結果をポップアップで表示
                const redirectTo = routeTable['userInfoBase'].path + user_id + '/'
                switchPage(redirectTo)
            }
        })
        .catch(error => {
            // console.error('hth: Error:', error);
            alert('Failed to block the user.');
            switchPage(window.location.pathname)
        });
}


export function setupBlockUserEventListener() {
    // console.log("Setup block event listeners");
    const blockUserButton = document.querySelector('.hth-btn.blockUserButton');
    if (blockUserButton) {
        blockUserButton.addEventListener('click', (event) => {
            event.preventDefault();

            const user_id = blockUserButton.dataset.user_id;
            // console.log('blockUserButton clicked', user_id);
            blockUser(user_id);
        });
    }
}
