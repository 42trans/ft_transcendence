import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";
import { loadAndExecuteScript } from "../utility/script.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Home");
  }

  async getHtml() {
    const uri = "/view/home/";
    const data = await fetchData(uri);
    return data;
  }
  async executeScript(spaElement) {
    //executeScriptTab("");
  }
}
