# Sphinx

## VSCODE設定

- 拡張:ブラウザでプレビュー
  - Live Preview

## 作成の手順

- コンテナのルートで実行
- 初回のみ　.rstファイルを作成
sphinx-apidoc -o sphinx/source pong

- sphinxのルートに移動
cd sphinx/

- 全て削除してから作成
make clean
make html