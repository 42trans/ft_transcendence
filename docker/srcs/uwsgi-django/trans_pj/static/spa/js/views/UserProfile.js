// UserProfile.js

import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";
import { loadAndExecuteScript, setupEventListeners } from "../utility/script.js";


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
        const userProfileModule = await import("/static/accounts/js/userProfile.js");
        userProfileModule.fetchUserProfile();
    }
}
