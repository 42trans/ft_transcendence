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
 */
import App from './js/App'

App.main();
