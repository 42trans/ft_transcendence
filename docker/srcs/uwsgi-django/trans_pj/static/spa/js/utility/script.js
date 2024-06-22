// script.js

function getScriptElement(path, isModule) {
  const scriptElement = document.createElement('script');
  scriptElement.src = path;
  if (isModule) {
    scriptElement.type = 'module';
  }
  return scriptElement
}


function loadScript(scriptElement) {
  return new Promise((resolve, reject) => {

    // DOM要素のscriptElementに対し、ブラウザが読み込んでonload, onerrorイベントを発生
    scriptElement.onload = () => {
      // console.log(`Script loaded successfully: ${scriptElement.src}`);
      resolve();
    };
    scriptElement.onerror = () => {
      console.error(`Failed to load script: ${scriptElement.src}`);
      reject(new Error(`Failed to load script: ${scriptElement.src}`));
    };
  });
}


/**
 * 指定されたパスからスクリプトを読み込み、実行する
 *
 * @param {string} path - スクリプトファイルのパス
 * @param {boolean} [isModule=false] - スクリプトをモジュールとして読み込むかどうか
 */
export async function loadAndExecuteScript(spaElement, path, isModule = false) {
  // console.log("loadAndExecuteScript: path: " + path);

  // <script src="path"></script>
  const scriptElement = getScriptElement(path, isModule)

  // DOMツリーに追加
  spaElement.appendChild(scriptElement);
  await loadScript(scriptElement)
}
