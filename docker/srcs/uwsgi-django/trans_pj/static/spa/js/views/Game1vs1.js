import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";
import { loadAndExecuteScript } from "../utility/script.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Game1vs1");
  }

  async getHtml() {
    const uri = "/pong/game/";
    const data = await fetchData(uri);
    //console.log("Pong:" + data);
    return data;
  }
  async executeScript() {
    loadAndExecuteScript("/static/pong/three/assets/index.js");
  }
}
