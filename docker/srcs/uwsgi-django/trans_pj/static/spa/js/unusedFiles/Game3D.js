// // Game3D.js

// import AbstractView from "../AbstractView.js";
// import fetchData from "../../utility/fetch.js";
// import { getUrl } from "../../utility/url.js";
// import { loadAndExecuteScript } from "../../utility/script.js";

// const DEBUG_FLOW = 0;

// export default class extends AbstractView {
//   constructor(params) {
//     super(params);
//     this.setTitle("Game3D");
//   }

//   async getHtml() {
//     const uri = "/pong/game/";
//     const data = await fetchData(uri);
//     //console.log("Pong:" + data);
//     return data;
//   }

//   async executeScript(spaElement) {
//     loadAndExecuteScript(spaElement, "/static/pong/three/assets/index.js", true);
//   }

//   // dispose() {
//   //         if (DEBUG_FLOW) {  console.log('Game3D: disopose(): start'); }
//   //   // Three.jsのインスタンスを破棄
//   //   if (window.pongApp) {
//   //           if (DEBUG_FLOW) {  console.log('Game3D: disopose(): window.pongApp is true'); }
//   //     window.pongApp.dispose();
//   //     window.pongApp = null;
//   //   }
//   // }
// }
