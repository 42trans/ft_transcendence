
# 使い方

- `⌘ + Shift + v`でプレビュー表示

## test page

- [testpageURL.md](other/team_docs/testpageURL.md)

## チーム内のドキュメント `other/team_docs/`

- [subject.pdf](other/subject/en.subject.pdf)  
  - [日本語訳](other/subject/subject.md)
- [Tips.md](other/team_docs/Tips.md)
- [port.md](other/team_docs/port.md)
- [プロジェクトマネジメント](other/team_docs/pm/pm_readme.md)


### module

- [nginx.md](other/team_docs/nginx.md)
- [frontend.md(Bootstrap, three.js)](other/team_docs/frontend.md)
- [Django.md](other/team_docs/Django.md)
- [PostgreSQL.md](other/team_docs/PostgreSQL.md)
- [pgadmin.md](other/team_docs/pgadmin.md)
- [Blockchain.md](other/team_docs/Blockchain.md)
- [ELK.md(Elastic Stack)](other/team_docs/ELK.md)
- [Monitor.md(Prometheus,Grafana)](other/team_docs/Monitor.md)
- [minimal_requirement.md](other/team_docs/minimal_requirement.md)
- [ganache.md](other/team_docs/ganache.md)

## TEST CASE

- `make t`
  - `test/main_test.sh` にまとめていけたら。とりあえず

## Docker 初回のみ .env, ssl環境設定など

- `make init` をしてください。下記がまとめて実行されます。
  - `make key`
    - nginx sslに必要な .crt,keyを発行します
  - `make make_env`
    - Makefile用の `./.make_env` が(上書きで)作成されます。
  - `make env`
    - Docker用の `./docker/srcs/.env` が(上書きで)作成されます。
- `backup/` などの名称のディレクトリで、.env などの重要なファイルを保管してください。

## Makefile に関して 

- set_env
  - linux , mac を uname で判別し、port, mount先を切り替えます。
    - `make make_env`によって作成された `./.make_env` を編集してサーバー名やポートを設定してください。  
- docker-compose -f ./docker/srcs/docker-compose.yml コマンド
  - build & up
    - `make`  
  - stop  
    - `make s`  
  - up  
    - `make u`  
  - down  
    - `make d`  
      - etc/hosts からの削除も一緒に行われる  
- profile 
  - コンテナを選択して起動する
    - 参考:【Compose で プロフィール(profile) を使う — Docker-docs-ja 24.0 ドキュメント】 https://docs.docker.jp/compose/profiles.html
　- .ymlにprofilesで指定
    - 常時起動する基本のwebアプリ関連
      - make_build_up_default
    - blockchain
      - make_build_up_blockchain
    - 他、etk, monitorも同様に設定済み  