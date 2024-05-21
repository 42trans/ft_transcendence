// UserProfile.js

import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";
import { loadAndExecuteScript } from "../utility/script.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("UserProfile");
    }

    async getHtml() {
        const uri = "/accounts/user/";
        const data = await fetchData(uri);
        return data;
    }

    async executeScript() {
        console.log('executeScript: Loading scripts...');
        await loadAndExecuteScript("/static/accounts/js/userProfile.js", true);
        await loadAndExecuteScript("/static/accounts/js/friend.js", true);
        await loadAndExecuteScript("/static/accounts/js/online-status.js", true);

        console.log('executeScript: Scripts loaded, setting up event listeners...');

        const userProfileModule = await import("/static/accounts/js/userProfile.js");
        userProfileModule.fetchUserProfile();
        userProfileModule.fetchFriendList();
        userProfileModule.fetchFriendRequestList();

        const disable2FAModule = await import("/static/accounts/js/disable_2fa.js");
        disable2FAModule.setupDisable2FAModuleEventListeners();

        const friendModule = await import("/static/accounts/js/friend.js");
        friendModule.setupFriendEventListeners();

        // const onlineStatusModule = await import("/static/accounts/js/online-status.js");
        // onlineStatusModule.setupDeleteFriendEventListeners();

        console.log('executeScript: Event listeners setup complete.');
    }
}
