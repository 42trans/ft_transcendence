// docker/srcs/webpack2/ft_trans/src/index.ts

/**
 * @file エントリーポイント
 * 
 * @description 
 * - 同階層にあるSceneConfig.tsで初期値を指定してください
 * - 他はjs/に保存しています
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
 * 
 * ## ディレクトリ構成
 * - SceneConfig.tsに値を設定してください。scene設定はそこで全てです。
 * - Contorls.tsのパラメーターはスライダーの感度調整なので変更しなくても問題ないはずです。が、必要なら。
 * - 他の.js,.tsファイルは js/ にまとめてます。 
 * - 型情報は js/type.ts にまとめていきたい方針
 * - App.tsから全ての処理のフローが見通せるように書きたい。ファサードパターンで。
 * - 3Dmodel.gltfやtextureは assets/にまとめてます。
*/

import App from './js/App'

App.main();
