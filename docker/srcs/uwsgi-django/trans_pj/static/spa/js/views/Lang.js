import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";
import { executeScriptTab } from "../utility/script.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Lang");
  }

  async getHtml() {
    const uri = getUrl("/lang");
    const data = await fetchData(uri);
    return data;
  }
  async executeScript() {
    //executeScriptTab("");
  }
}
