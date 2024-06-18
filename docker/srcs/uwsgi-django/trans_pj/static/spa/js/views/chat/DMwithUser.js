// DMwithUser.js

import AbstractView from "../AbstractView.js";
import fetchData from "../../utility/fetch.js";
import { getUrl } from "../../utility/url.js";
import { loadAndExecuteScript } from "../../utility/script.js";


export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.params = params
    this.setTitle("DMwith");
  }

  async getHtml() {
    const userId = this.params.dmUserId;
    const uri = `/chat/dm-with/${userId}/`;
    const data = await fetchData(uri);
    //console.log("Pong:" + data);
    return data;
  }

  async executeScript(spaElement) {
    const dmWithUserModule = await import("/static/chat/js/dm-with-user.js");
    dmWithUserModule.initDM();
  }

  async dispose() {
    const dmWithUserModule = await import("/static/chat/js/dm-with-user.js");
    dmWithUserModule.disposeDM();
  }
}
