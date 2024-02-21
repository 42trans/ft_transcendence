
# 使い方
- `⌘ + Shift + v`でプレビュー表示

## チーム内のドキュメント `other/team_docs/`
- [subject.pdf](other/subject/en.subject.pdf) 
  - [日本語訳](other/subject/subject.md)
- [Tips.md](other/team_docs/Tips.md)
- [PostgreSQL.md](other/team_docs/PostgreSQL.md)
- [nginx.md](other/team_docs/nginx.md)


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
