// static/accounts/js/unblock-user.js

import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"


function unblockUser(user_id) {
    fetch(`/accounts/api/unblock/${user_id}/`, {
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
            const redirectTo = routeTable['userInfoBase'].path + user_id + '/'
            switchPage(redirectTo)
        })
        .catch(error => {
            console.error('hth: Error:', error);
            alert('Failed to unblock the user');
        });
}


export function setupUnBlockUserEventListener() {
    // console.log("Setup block event listeners");
    const unBlockUserButton = document.querySelector('.hth-btn.unBlockUserButton');
    if (unBlockUserButton) {
        unBlockUserButton.addEventListener('click', (event) => {
            event.preventDefault();

            const user_id = unBlockUserButton.dataset.user_id;
            // console.log('unblockUser clicked', user_id);
            unblockUser(user_id);
        });
    }
}
