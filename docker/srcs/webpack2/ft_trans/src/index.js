// docker/srcs/webpack2/ft_trans/src/index.js

/**
 * @file エントリーポイント
 * 
 * @description 
 * - public/へのビルド方法: docker exec -it webpack2 bash -c "npm run build"
 * - buildにより、一つのjsファイル（public/bundle.js）にまとめて生成されます。　
 * - そのファイルと合わせて、public/内のファイルをすべて、django/static/share_webpack2などのディレクトリに保存してください。共有ボリュームを設定しているので、再起動時二回以内にマウントされる予定ですが、不安定な時は手動で行ってください。
 * 
 * ## 使い方
 * - ホスト開発用サーバーの起動 ※hotReload機能
 *   - cd docker/srcs/webpack2/ft_trans && npm run dev
 *   - コンテナの8181はwsが機能してません。が、一応動きます。けど、使わないよう。
 * - Django　static用のpublic
 *   - docker exec -it webpack2 bash -c "npm run build"
 *   - webpack2/public/に一式できます。マウント共有してるので二回再起動すればDjangoに認識されるはず
 *   - static/share_wabpack2/に自動で入ります。ホストマシンに保存されます。.gitignore済み
 * - main()の引数に文字列'dev'を渡すことでライトやカメラをコントロールするGUIを表示
 * 
 * ## ディレクトリ構成
 * - シーン（空間）毎にSceneConfig.jsに値を設定してください。scene設定はそこで全てです。
 * - Contorls.jsのパラメーターはスライダーの感度調整なので変更しなくても問題ないはずです。が、必要なら。
 * - 他の.jsファイルは js/ にまとめてます。 
 * - Pong.jsから全ての処理のフローが見通せるように書きたい。ファサードパターンで。
 * - 3Dmodel.gltfやtextureは assejs/にまとめてます。
*/

import PongApp from './js/PongApp'
import './css/3d.css';

// 'dev'= コントローラーGUI表示 
// PongApp.main('dev');
PongApp.main();