// vite/ft_trans/vite.config.js
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'srcs/ball_aura/docs'), // プロジェクトのルートディレクトリ
  base: '/static/pong/gw/ball_aura/docs/', // DjangoのSTATIC_URLに合わせる
  build: {
    outDir: path.resolve(__dirname, '../../static/pong/gw/ball_aura/docs'), // Django staticディレクトリへの出力
    // outDirを調整して、Djangoの期待するパスに合うようにする
    emptyOutDir: true,
    // その他のビルド設定...
  },
  // プラグインやその他の設定...
});
