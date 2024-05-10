import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
//import getUrl from "../utility/url.js";
import { getUrl } from "../utility/url.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Test2");
  }

  async getHtml() {
    //const uri = "http://localhost:8002//pong/bootstrap_sign-in/";
    const uri = getUrl("/pong/bootstrap_sign-in/");
    const data = fetchData(uri);
    //const xhr = new XMLHttpRequest();
    //xhr.open("GET", uri);
    //xhr.addEventListener("load", (event) => console.log(xhr.responseText));
    //const tmp_html = await xhr.send();
    //console.log(tmp_html);
    //console.log(data);
    return data;
    //var data_url = new XMLHttpRequest();
    //data_url.open("GET", uri);
    //data_url.send();
    //console.log("GET:" + xhr.responseText);
    /*
    return `
            <h1>Test</h1>
            <p>Test SSR.</p>
        `;
        */
  }
}
