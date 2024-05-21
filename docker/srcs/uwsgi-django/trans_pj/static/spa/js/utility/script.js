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
  scriptElement.onerror = function () {
    console.error('Failed to load script: ' + path);
  };

  scriptElement.onload = function () {
    console.log('Script loaded successfully: ' + path);
  };
}


/**
 * 指定されたパスからスクリプトを読み込み、実行する
 *
 * @param {string} path - スクリプトファイルのパス
 * @param {boolean} [isModule=false] - スクリプトをモジュールとして読み込むかどうか
 */
export function loadAndExecuteScript(path, isModule = false) {
  console.log("loadAndExecuteScript: path: " + path);

  // <script src="path"></script>
  const scriptElement = getScriptElement(path, isModule)
  loadScript(scriptElement)
  document.body.appendChild(scriptElement);
}
