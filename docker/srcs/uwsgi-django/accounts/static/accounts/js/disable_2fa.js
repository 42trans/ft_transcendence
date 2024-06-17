// disable_2fa.js

import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"


export function disable2FA() {
	if (confirm('Are you sure you want to Disable2FA ?')) {
		fetch('/accounts/api/disable_2fa/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
			.then(data => {
				if (data.message) {
					alert(data.message);
					// console.log("redirect to " + data.redirect);
					switchPage(data.redirect)
				} else {
					throw new Error('No message in response');
				}
			})
			.catch(error => {
				console.error('hth: Disable token failed:', error);
				alert('Disable token failed. Please try again.');
			});
	} else {
		alert('2FA disable has been canceled');
	}
}

// window.disable2FA = disable2FA;
