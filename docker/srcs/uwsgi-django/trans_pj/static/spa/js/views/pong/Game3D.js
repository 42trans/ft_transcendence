// Game3D.js

import AbstractView from "../AbstractView.js";
import fetchData from "../../utility/fetch.js";
import { getUrl } from "../../utility/url.js";
import { loadAndExecuteScript } from "../../utility/script.js";


export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Game3D");
  }

  async getHtml() {
    const uri = "/pong/game/";
    const data = await fetchData(uri);
    //console.log("Pong:" + data);
    return data;
  }

  async executeScript() {
    loadAndExecuteScript("/static/pong/three/assets/index.js", true);
  }

  dispose() {
    // Three.jsのインスタンスを破棄
    if (window.pongApp) {
      window.pongApp.dispose();
      window.pongApp = null;
    }
  }
}
