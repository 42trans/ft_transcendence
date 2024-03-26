# other/team_docs/Blockchain/Hardhat.md

- [詳細Hardhat.md](../../docker/srcs/hardhat/hardhat_pj/memo.md)

## ディレクトリ構成・ファイルの内容

- 表示が小さい場合は、文字を拡大する時と同じ方法で、`⌘ or Ctrl` + `+` で拡大してご覧ください
  - もしくは編集画面で ⌘+クリック で画像ファイルを表示して　虫眼鏡で拡大
![alt text](<img/スクリーンショット 2024-03-21 6.18.24.png>)

## Contract

- solidityはコード説明が必要なのでコメントを多めに入れます。
  - 関数が何と連携するのか？がわかりづらい。
    - Django関数から呼び出されたり、別ディレクトリのファイルを参照しているため
  - せっかくなのでドキュメント自動作成できる形で。
  - `make hardhat_docgen` で docs/ に自動生成されます。
    - 場所: docker/srcs/hardhat/hardhat_pj/docs/index.html
    - Live Preview 拡張でvscodeで確認できます
      - ウィンドウ右上、エディター分割の隣に プレビュー表示ボタンが出ます(.mdのプレビューと同じ)

  ![alt text](<img/スクリーンショット 2024-03-21 9.50.17.png>)
