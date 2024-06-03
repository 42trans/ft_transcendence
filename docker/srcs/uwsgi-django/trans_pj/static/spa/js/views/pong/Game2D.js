// Game1vs1.js

import AbstractView from "../AbstractView.js";
import fetchData from "../../utility/fetch.js";
import { getUrl } from "../../utility/url.js";
import { loadAndExecuteScript } from "../../utility/script.js";


export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Game2D");
  }

  async getHtml() {
    const uri = "/pong/online/";
    const data = await fetchData(uri);
    //console.log("Pong:" + data);
    return data;
  }

  async executeScript() {
    loadAndExecuteScript("/static/pong/js/online/PongOnlineIndex.js", true);
  }

}
