# team_docs/Blockchain.md

![alt text](<img/スクリーンショット 2024-03-24 12.27.24.png>)

## 説明資料

- 【Blockchain説明 - Google スライド】 <https://docs.google.com/presentation/d/e/2PACX-1vSgkqQfrCOV6_ktcMhGp51ziYKG60jQ8xh7o0xawXPBStN7YwQbaWxjA0P7y9qvBl72nLcrEat1-HKj/pub?start=true&loop=true&delayms=3000&slide=id.g2c513157d5a_1_17>

## 要件対応状況

- [subject_Blockchain.md](subject/subject_Blockchain.md)

## test

- [test_Django_Blockchain.md](../../docker/srcs/uwsgi-django/pong/blockchain/local_testnet/test/test_Django_Blockchain.md)  
  - from django.test import TestCase でDjangoの機能を使用する

## 各コンテナ・サービス特有のことはこちら

- [Blockchain/Hardhat.md](Blockchain/Hardhat.md)
- [Blockchain/Ganache.md](Blockchain/Ganache.md)

## 方針

- subject バックエンドの解釈
  - バックエンドのフレームワークはHTTPリクエストの処理やルーティング、データベースとのやり取り、セキュリティ機能など、一般的なウェブアプリケーション開発の機能を提供」を指している。サーバーサイドフレームワーク。
  - Node.jsはJavascriptの実行環境であり、フレームワークに該当しない。（Express.jsがフレームワーク）
    - 例えばharadhatコンテナはウェブアプリケーションではない。Linux + Node.js上で動く。Express.jsなどのフレームワークは使用していない
- スマートコントラクトはローカルでコードを書く
- EVMのテスト環境ごとにコンテナを用意する
- ローカル、コンテナともにNode.js 20.11.1
  - Dockerfile内
  - ローカルでのinit作業時
- テストネットワークは Ganache, Hardhat, Sepolia

## テストネットワーク

- ローカル
  - Hardhat
    - 永続化機能が弱い・使いこなせなかった
  - Ganache
    - 簡単に機能したので採用
- 公開
  - APIはINFRAを利用
    - INFURA API key
      - 9301610ed4c24693b985f80eda16eb67
  - alchemyの蛇口で Sepolia eth をもらう
    - 参考:【Ethereum Sepolia Faucet】 <https://www.alchemy.com/faucets/ethereum-sepolia>
  - 参考:【7. Deploying to a live network | Ethereum development environment for professionals by Nomic Foundation】 <https://hardhat.org/tutorial/deploying-to-a-live-network>

## 古い: 開始〜前半のメモ

### インストール＋α作業時MEMO

- haradhatのプロジェクトをローカルであらかじめ作成
  - ローカルにインストール
    - npm install --save-dev hardhat
  - Node.js 20で TypeScript で　init (公式の推奨)
    - 参考:【Getting started with Hardhat | Ethereum development environment for professionals by Nomic Foundation】 <https://hardhat.org/hardhat-runner/docs/getting-started#installation>
    - 参考:【TypeScript（タイプスクリプト）とは？JavaScriptとの違いやできること、メリットなど初心者にわかりやすく解説！】 <https://jitera.com/ja/insights/4795>
- test
  - 参考:【Getting started with Hardhat | Ethereum development environment for professionals by Nomic Foundation】 <https://hardhat.org/hardhat-runner/docs/getting-started#testing-your-contracts>

- setup
  - Django, Python, PostgreSQL,TypeScriptの基礎知識  
    - 参考:【9. クラス — Python 3.12.2 ドキュメント】 <https://docs.python.org/ja/3/tutorial/classes.html>
    - 参考:【テーブルダイアログ — pgAdmin 4 8.3 ドキュメント】 <https://www.pgadmin.org/docs/pgadmin4/8.3/table_dialog.html>

### 参考資料

- 開発環境
  - ローカルの開発環境はFoundry VSCODE がRUSTで高速
    - 参考:【スマートコントラクト開発ツールの Hardhat と Foundry を実際に使って比較してみた - テコテック開発者ブログ】 <https://tec.tecotec.co.jp/entry/2023/11/22/090000>
  - Foundry
    - 参考:【インストール - ファウンドリブック】 <https://book.getfoundry.sh/getting-started/installation>
    - 参考:【EthereumのDapp開発環境のFoundryを使ってみる】 <https://zenn.dev/razokulover/articles/574eb471e6db1c>
