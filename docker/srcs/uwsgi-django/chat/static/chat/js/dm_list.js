// dm_list.js
document.addEventListener('DOMContentLoaded', function() {
    fetchPartners();
});

function fetchPartners() {
    fetch('/dm/api/list/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => updateDOM(data))
        .catch(error => console.error('There has been a problem with your fetch operation:', error));
}

function updateDOM(partners) {
    const list = document.getElementById('dm-list');
    list.innerHTML = ''; // リストをクリア

    partners.forEach(partner => {
        const item = document.createElement('li');
        item.textContent = `${partner.partner_nickname} (Session ID: ${partner.session_id})`;
        list.appendChild(item);
    });
}
