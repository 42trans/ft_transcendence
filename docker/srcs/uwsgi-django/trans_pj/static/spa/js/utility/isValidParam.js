
const DEBUG_LOG = 1;

async function isValidMatchId(matchId) {
    try {
        const response = await fetch(`/pong/api/is-valid-match-id/${matchId}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const data = await response.json();
        if (DEBUG_LOG) { console.log(`      isValidMatchId ->` + data.exists); }
        return data.exists;
    } catch (error) {
        if (DEBUG_LOG) { console.log(`      isValidMatchId -> error, false`); }
        console.error('hth: Error:', error);
        return false;
    }
}

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

async function isValidDmTargetId(dmTargetId) {
    try {
        const response = await fetch(`/chat/api/is-valid-dm-target-id/${dmTargetId}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const data = await response.json();
        if (DEBUG_LOG) { console.log(`      isValidDmTargetId ->` + data.exists); }
        return data.exists;
    } catch (error) {
        if (DEBUG_LOG) { console.log(`      isValidDmTargetId -> error, false`); }
        console.error('hth: Error:', error);
        return false;
    }
}


// URLパラメータの整合性を評価
// :matchId (タイミングにより使用不可となる可能性あり -> Django view関数のリダイレクトを使用)
// :userId
// :dmTargetId
export const isValidParam = async (paramName, paramValue) => {
    if (paramName === "matchId") {
        if (DEBUG_LOG) { console.log(`     isValidParam: paramName:${paramName}, paramValue:${paramValue}`); }
        return await isValidMatchId(paramValue)
    }
    if (paramName === "userId") {
        if (DEBUG_LOG) { console.log(`     isValidParam: paramName:${paramName}, paramValue:${paramValue}`); }
        return await isValidUserId(paramValue)
    }
    if (paramName === "dmTargetId") {
        if (DEBUG_LOG) { console.log(`     isValidParam: paramName:${paramName}, paramValue:${paramValue}`); }
        return await isValidDmTargetId(paramValue)
    }
    return false;
}
