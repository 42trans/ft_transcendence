#!/bin/sh

# `npm run build`:
#   - bindする: つまり、index.js,index.cssを作成
#   - ※ Dockerの他の箇所の設定により、Django dev server, nginx経由のhttpsアクセス両方のstaticに自動でマウント・保存される
#     - Djangoコンテナの、`code/pong/static/pong/three`にマウント
npm run build

# vite 起動
npm run dev
