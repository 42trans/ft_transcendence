# team_docs/Docker.md

## 方針

- profileの活用を考える
  - 分類ごとに build & upする機能が欲しいかも。
    - 重いコンテナがある時とか
    - 参考:【Compose で プロフィール(profile) を使う — Docker-docs-ja 24.0 ドキュメント】 <https://docs.docker.jp/compose/profiles.html>
  - 環境変数を最初につけることでprofileを選ぶことができる
    - COMPOSE_PROFILES=elk,blockchain,monitor docker-compose up -d
    - make_build_up_* でターゲット登録済み ※Makefile参照

- Volumes は　コンテナ間で共有するディレクトリがある場合のみトップレベルで定義する
  - 基本的にserviceレベルでvolumesを定義する  
