// docker/srcs/uwsgi-django/pong/static/pong/js/tournament/components/PongIndex.js
import UIHelper				from '../UIHelper.js';
import { config }			from '../ConfigTournament.js';

// TODO_ft: editでパスワードを変更できるようにする
/** 
 * 
 * */
class PongIndex 
{
	constructor(roundManager) 
	{
		this.roundManager			= roundManager;
		this.csrfToken				= UIHelper.getCSRFToken();

		this.userInfoContainer		= document.getElementById(config.userInfoId);
		this.tournamentContainer	= document.getElementById(config.tournamentContainerId);
		this.errorMessage			= document.getElementById(config.errorMessageId);
		this.submitMessage			= document.getElementById(config.submitMessageId);
		
	}

	/** 注意: appendChildの順番は上から順番で追加される。 */
	async display(ongoingTournament, userProfile) 
	{
		this.tournamentContainer.innerHTML = ''; 

		const serverLinks = [
			{ url: "https://localhost/pong", text: "Nginx https" },
			{ url: "http://localhost:8002/pong/", text: "Django dev-server" },
			{ url: "http://localhost:5184/pong/", text: "Vite dev-server" }
		];

		const incompleteLinks = [
			{ url: "/accounts/signup/", text: "accounts/signup/" },
			{ url: "/accounts/login/", text: "accounts/login/" },
			{ url: "/accounts/oauth-ft/", text: "accounts/oauth-ft/" },
			{ url: "/accounts/logout/", text: "accounts/logout/" },
			{ url: "/accounts/user/", text: "accounts/user/" },
			{ url: "/accounts/edit/", text: "accounts/edit/" },
			{ url: "/accounts/verify/disable_2fa/", text: "accounts/verify/disable_2fa/" },
			{ url: "/accounts/verify/enable_2fa/", text: "accounts/verify/enable_2fa/" },
			{ url: "/accounts/verify/verify_2fa/", text: "accounts/verify/verify_2fa/" },
			{ url: "/chat/dm_list/", text: "chat/dm_list/" },
		];
	
		const displayHeader		= await this.addDisplayHeader();
		const displayUser		= await this.addDisplayUser(userProfile);
		const freePlaybutton	= this.addNavigationLinks('div', 'round-navigation', 'Free Play', 0);
		this.tournamentContainer.appendChild(displayHeader);
		this.tournamentContainer.appendChild(displayUser);
		this.tournamentContainer.appendChild(freePlaybutton);
		
		this.tournamentContainer.appendChild(this.createLinkSection('Server/pong', serverLinks));
		this.tournamentContainer.appendChild(this.createLinkSection('Incomplete/test', incompleteLinks));
		
		if (userProfile)
		{
			const tourbutton		= this.addNavigationLinks('div', 'round-navigation', 'Tournament', 0);
			this.tournamentContainer.appendChild(tourbutton);
		}
	}

	async addDisplayHeader() 
	{
		const header = document.createElement('h2');
		header.id = 'index-header';
		header.textContent = 'Unrivaled hth Pong Experience';
		return header;
	}

	async addDisplayUser(userProfile) 
	{
		// UIHelper.displayUserInfo(userProfile, this.tournamentContainer);
		const header = document.createElement('p');
		header.id = 'index-login-user';
		header.textContent = userProfile ? `Welcome, ${userProfile.nickname}` : 'Welcome, Guest';
		return header;
	}

	/** ナビゲーションリンクの作成とイベントハンドラの設定 */
	addNavigationLinks(elem, id, textCont, sateNum) 
	{
		const naviButton = document.createElement(elem);
		naviButton.id = id;
		const tournamentButton = document.createElement('button');
		tournamentButton.textContent = textCont;
		tournamentButton.addEventListener('click', () => {
			this.roundManager.changeStateToRound(sateNum);
		});

		// ボタンをナビゲーションコンテナに追加
		naviButton.appendChild(tournamentButton);

		return naviButton;
	}

	createLinkSection(title, links) {
		const sectionContainer = document.createElement('div');
		const sectionTitle = document.createElement('h4');
		sectionTitle.textContent = title;
		sectionContainer.appendChild(sectionTitle);
	
		const linkList = document.createElement('ul');
		linkList.className = 'dev-link';
		links.forEach(link => {
			const listItem = document.createElement('li');
			const anchor = document.createElement('a');
			anchor.href = link.url;
			anchor.textContent = link.text;
			listItem.appendChild(anchor);
			linkList.appendChild(listItem);
		});
	
		sectionContainer.appendChild(linkList);
		return sectionContainer;
	}
	
}

export default PongIndex;
