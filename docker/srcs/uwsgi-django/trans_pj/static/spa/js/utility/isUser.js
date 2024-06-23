// spa/js/utility/isUser.js

const DEBUG_LOG = 1;

export async function isUserLoggedIn() {
    try {
        const response = await fetch('/accounts/api/is-user-logged-in/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const data = await response.json();
        // alert(`isUserLoggedIn: ${data.is_logged_in}`)
        if (DEBUG_LOG) { console.log('isUserLoggedIn: ' + data.is_logged_in); }
        return data.is_logged_in;
    } catch (error) {
        console.error('Error:', error);
        if (DEBUG_LOG) { console.log('isUserLoggedIn: error: ' + error); }
        // alert(`isUserLoggedIn: error: ${error}`)
        return false;
    }
}


export async function isUserEnable2FA() {
    try {
        const response = await fetch('/accounts/api/is-user-enabled2fa/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
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
