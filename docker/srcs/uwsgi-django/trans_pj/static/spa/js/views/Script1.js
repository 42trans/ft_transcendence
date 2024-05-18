import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";
import { executeScriptTab } from "../utility/script.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Script");
  }

  async getHtml() {
    // const uri = getUrl("/script1");
    const data = await fetchData("/spa/script1/");
    return data;
  }
  async executeScript() {
    executeScriptTab("/static/spa/js/script/test.js");
  }
}
