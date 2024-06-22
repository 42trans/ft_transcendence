// spa/js/utility/refreshJWT.js

// APIでaccess-tokenを再発行しcookieに設定するため、APIを呼ぶだけ
export function refreshJWT() {
    const DEBUG = 0;

    fetch('/accounts/api/token/refresh/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                if (DEBUG) {
                    console.log('[refreshJWT]Token refresh failed');
                }
                return null;
            }
        })
        .then(data => {
            if (data) {
                if (DEBUG) {
                    console.log('[refreshJWT]Token refresh successful:', data.message);
                }
            }
        })
        .catch(error => {
            if (DEBUG) {
                console.log('[refreshJWT]Error refreshing token:', error);
            }
        });
}
