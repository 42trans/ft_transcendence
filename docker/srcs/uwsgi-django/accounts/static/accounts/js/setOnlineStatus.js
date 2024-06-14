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
            // console.log('Error:', error);
            return null;
        });
}


function onPageLoad(userId) {
    connectOnlineStatusWebSocket(userId);
}

function isEventListenerRegistered(element, eventName, listener) {
    const eventListeners = getEventListeners(element);
    return eventListeners[eventName] && eventListeners[eventName].some(l => l.listener === listener);
}

function getEventListeners(element) {
    return element.eventListenerList || {};
}

function setOnlineStatusHandler(userId) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        onPageLoad(userId);
    } else {
        if (!isEventListenerRegistered(window, 'load', onPageLoad)) {
            window.addEventListener('load', onPageLoad, {
                once: true,
                passive: true
            });
        }
    }

    if (!isEventListenerRegistered(window, 'popstate', onPageLoad)) {
        window.addEventListener('popstate', onPageLoad, {
            passive: true
        });
    }
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
        setOnlineStatusHandler(userId);
    });
}
