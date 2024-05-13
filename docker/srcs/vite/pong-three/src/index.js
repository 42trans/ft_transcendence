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
 * ### ホスト開発用サーバーの起動 ※hotReload機能
 * vite_npm_run_dev:
 * 	docker exec -it vite bash -c "npm run dev"
 * ### build
 * vite_npm_run_build:
 * 	docker exec -it vite bash -c "npm run build"
 * - Django　static用のpublic
 *   - vite/public/に一式できます。マウント共有してるので自動的にDjangoに認識されます。.gitignoreしてます
 *   - pong/static/pong/three/に自動で入ります。そこはホストマシンに保存されません。が、下記で対応
 *   - django/staticにcode/一式マウントされてるので逆流してホストに保存されます。.gitignore済み
 * 
 * ## ディレクトリ/ファイル
 * - シーン（空間）毎にSceneConfig.jsに値を設定してください。scene設定はそこで全てです。
 * - Contorls.jsのパラメーターはスライダーの感度調整なので変更しなくても問題ないはずです。が、必要なら。
 * - 他の.jsファイルは js/ にまとめてます。 
 * - Pong.jsから全ての処理のフローが見通せるように書いてます
 * - 3Dmodel.gltfやtextureは assejs/にまとめてます。
 * - 説明資料+4/8~22進捗日記 => 3️⃣ three.js △ https://docs.google.com/presentation/d/e/2PACX-1kFAEPPUCHrODmv94oPZiLU1zN8VEWBE-sCt5eYDm5i-fJpl221U1rc8G4w9BB3-V30bUuLVMXRSp/pub?start=false&loop =false&遅延=10000
*/

import PongApp from './js/PongApp'
import './css/3d.css';

// 'dev'= コントローラーGUI表示 
// PongApp.main('dev');
PongApp.main();
