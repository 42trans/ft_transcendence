// UserProfile.js

import AbstractView from "../AbstractView.js";
import fetchData from "../../utility/fetch.js";
import { loadAndExecuteScript } from "../../utility/script.js";


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

    async executeScript(spaElement) {
        const userProfileModule = await import("/static/accounts/js/userProfile.js");
        userProfileModule.fetchUserProfile();
    }
}
