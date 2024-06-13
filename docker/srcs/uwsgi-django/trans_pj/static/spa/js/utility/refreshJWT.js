// spa/js/utility/refreshJWT.js

// APIでaccess-tokenを再発行しcookieに設定するため、APIを呼ぶだけ
export async function refreshJWT() {
    try {
        const response = await fetch('/accounts/api/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (response.ok) {
            console.log('[refreshJWT]Token refresh successful:', data.message);
        } else {
            console.log('[refreshJWT]Token refresh failed:', data.error);
        }
    } catch (error) {
        console.log('[refreshJWT]Error refreshing token:', error);
    }
}
