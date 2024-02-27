# team_docs/Blockchain.md

## 方針

- subject バックエンドの解釈
  - バックエンドとはのフレームワークはHTTPリクエストの処理やルーティング、データベースとのやり取り、セキュリティ機能など、一般的なウェブアプリケーション開発の機能を提供」を指している。サーバーサイドフレームワーク。
  - Node.jsはJavascriptの実行環境であり、フレームワークに該当しない。（Express.jsがフレームワーク）
    - 例えばharadhatコンテナはウェブアプリケーションではない。Linux + Node.js上で動く。Express.jsなどのフレームワークは使用していない

- スマートコントラクトはローカルでコードを書く
- Dockerでは、EVMのテスト環境だけコンテナに用意する

## memo

## 作業
- haradhatのプロジェクトをローカルであらかじめ作成
  - yarn add --dev hardhat

## 参考資料

- 開発環境
  - ローカルの開発環境はFoundry VSCODE がRUSTで高速
    - 参考:【スマートコントラクト開発ツールの Hardhat と Foundry を実際に使って比較してみた - テコテック開発者ブログ】 https://tec.tecotec.co.jp/entry/2023/11/22/090000
  - Foundry
    - 参考:【インストール - ファウンドリブック】 https://book.getfoundry.sh/getting-started/installation
    - 参考:【EthereumのDapp開発環境のFoundryを使ってみる】 https://zenn.dev/razokulover/articles/574eb471e6db1c
- Docker
- tutorial
- その他

## カスタマイズ内容

