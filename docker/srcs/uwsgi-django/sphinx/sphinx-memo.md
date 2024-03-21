# Sphinx

## VSCODE設定

- 拡張:ブラウザでプレビュー
  - Live Preview

## 作成の手順

- コンテナのルートで実行
- 初回のみ　.rstファイルを作成 pongを指定すれば再帰的にディレクトリを認識するが、__init__.pyが必要
sphinx-apidoc -o sphinx/source pong -f

-  make sphinx_make_html　で下記が実行され、build/にhtmlファイルが生成される
docker exec uwsgi-django /bin/sh -c "cd sphinx && make html"
