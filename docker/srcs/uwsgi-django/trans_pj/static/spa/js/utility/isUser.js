// spa/js/utility/isUser.js

export async function isUserLoggedIn() {
    try {
        const response = await fetch('/accounts/api/is-user-logged-in/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
        });
        const data = await response.json();
        // alert(`isUserLoggedIn: ${data.is_logged_in}`)
        return data.is_logged_in;
    } catch (error) {
        console.error('Error:', error);
        // alert(`isUserLoggedIn: error: ${error}`)
        return false;
    }
}


export async function isUserEnable2FA() {
    try {
        const response = await fetch('/accounts/api/is-user-enabled2fa/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
        });
        const data = await response.json();
        // alert(`isUserEnable2FA: ${data.is_enable2fa}`)
        return data.is_enable2fa;
    } catch (error) {
        console.error('Error:', error);
        // alert(`isUserEnable2FA: error: ${error}`)
        return false;
    }
}
