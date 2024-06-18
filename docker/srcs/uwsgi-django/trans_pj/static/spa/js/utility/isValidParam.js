
const DEBUG_LOG = 1;

async function isValidUserId(userId) {
    try {
        const response = await fetch(`/accounts/api/is-valid-id/${userId}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const data = await response.json();
        if (DEBUG_LOG) { console.log(`      isValidUserId ->` + data.exists); }
        return data.exists;
    } catch (error) {
        if (DEBUG_LOG) { console.log(`      isValidUserId -> error, false`); }
        console.error('hth: Error:', error);
        return false;
    }
}
