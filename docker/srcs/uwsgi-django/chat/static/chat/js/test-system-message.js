// test-system-message.js

// unused
function sendSystemMessage(targetNickname) {
    const url = 'https://localhost/chat/api/system-message/';
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    const data = {
        target_nickname: targetNickname,
        message: `これはテストメッセージです...${timestamp}`
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response.ok) {
                console.log('システムメッセージが送信されました。');
            } else {
                throw new Error('システムメッセージの送信に失敗しました。');
            }
        })
        .catch(error => {
            console.error('hth: システムメッセージの送信に失敗しました。', error);
        });
}
