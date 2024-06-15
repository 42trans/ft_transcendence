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
    const nickname = this.params.nickname;
    const uri = `/chat/dm-with/${nickname}/`;
    const data = await fetchData(uri);
    //console.log("Pong:" + data);
    return data;
  }

  async executeScript(spaElement) {
    // loadAndExecuteScript("/static/chat/js/dm-with-user.js", true);
    const dmWithUserModule = await import("/static/chat/js/dm-with-user.js");
    dmWithUserModule.initDM();
  }
}
