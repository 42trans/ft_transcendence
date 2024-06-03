import { defineConfig } from 'vite';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: '/static/pong/three/',
  // エントリーポイントのディレクトリを設定 
  root: path.join(__dirname, 'src'), 
  build: {
    manifest: true,
    rollupOptions: {
      input: path.join(__dirname, 'src', 'index.html') ,
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
        globals: {
          controlThreeAnimation: 'window.controlThreeAnimation',
        },
      },
    },
    outDir: path.resolve(__dirname, 'public/static/pong/three/'),
  },
  server: {
    // ローカルネットワーク上の他のデバイスからアクセス可能
    host: true  
  },
});
