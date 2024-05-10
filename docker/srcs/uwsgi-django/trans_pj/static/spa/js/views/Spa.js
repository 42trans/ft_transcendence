import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
//import getUrl from "../utility/url.js";
import { getUrl } from "../utility/url.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("SPA");
  }

  async getHtml() {
    ///const uri = window.location.protocol + window.location.host + "/pong/lang/";
    //const uri = getUrl("http://localhost:8002/spa/test/");
    const uri = getUrl("/spa/test/");
    console.log("Lang getHtml:" + uri);
    const data = await fetchData(uri);
    //console.log("Lang Data:" + data);
    //console.table("Lang Table:" + data);
    return data;
    return `
            <h1>Test</h1>
            <p>Test SSR.</p>
        `;
  }
}
