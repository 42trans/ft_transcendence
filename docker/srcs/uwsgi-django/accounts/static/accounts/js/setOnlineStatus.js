// setOnlineStatusHandler.js

import { connectOnlineStatusWebSocket } from "./online-status.js"
import { isUserLoggedIn } from "/static/spa/js/utility/isUser.js"


function fetchUserId() {
    return fetch("/accounts/api/user/profile/")
        .then(response => {
            if (!response.ok) {
                // console.log('GuestUser? UserID not found');
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (!data.id) {
                // console.log('GuestUser? UserID not found');
                return null;
            }
            return data.id;
        })
        .catch(error => {
            console.log('hth: Error:', error);
            return null;
        });
}


export async function setOnlineStatus() {
    // console.log('setOnlineStatus called');
    const isLoggedIn = await isUserLoggedIn();
    if (!isLoggedIn) {
        // console.log('setOnlineStatus: isLogin: false');
        return;
    }
    // console.log('setOnlineStatus: isLogin: true');

    // login userの場合に onlineStatusを評価
    fetchUserId().then(userId => {
        if (!userId) {
            // console.log('GuestUser? UserID not found');
            return;
        }
        connectOnlineStatusWebSocket(userId);
    });
}
