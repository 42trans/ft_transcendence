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
    scriptElement.onload = () => {
      console.log(`Script loaded successfully: ${scriptElement.src}`);
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
export async function loadAndExecuteScript(path, isModule = false) {
  console.log("loadAndExecuteScript: path: " + path);

  // <script src="path"></script>
  const scriptElement = getScriptElement(path, isModule)
  document.body.appendChild(scriptElement);
  await loadScript(scriptElement)
}


// todo: setupEventListeners 使えないかも
/**
 * モジュールを非同期にインポートし、指定されたセットアップ関数を呼び出す
 *
 * @param {string} modulePath - モジュールのパス
 * @param {string} setupFunctionName - セットアップ関数の名前
 */
export async function setupEventListeners(modulePath, setupFunctionName) {
  console.log("setupEventListeners: modulePath: " + modulePath);
  try {
    const module = await import(modulePath);
    console.log(`setupEventListeners: Module loaded: ${module}`);
    if (setupFunctionName in module) {
      console.log(`setupEventListeners: Calling setup function: ${setupFunctionName}`);
      module[setupFunctionName]();
    } else {
      console.error(`setupEventListeners: Setup function ${setupFunctionName} not found in module ${modulePath}`);
    }
  } catch (error) {
    console.error(`setupEventListeners: Failed to import module: ${modulePath}`, error);
  }
}
