import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
//import getUrl from "../utility/url.js";
import { getUrl } from "../utility/url.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Script");
  }

  async getHtml() {
    const uri = getUrl("/spa/test/");
    console.log("Lang getHtml:" + uri);
    const data = await fetchData(uri);
    return data;
  }
}
