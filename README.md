
# 使い方

- mdファイルは`⌘ + Shift + v`でプレビュー表示

## 初回環境設定 （cloneして最初に行うこと）

- Googleスライド:開発環境構築（更新中）
  - <https://docs.google.com/presentation/d/e/2PACX-1vR86i3_uPIhWcLQcEFGm5JJnqzDdYup139H0RDXCs5nosYX5talaHEqJKdTlpRRPwi7SZn6Je5fat37/pub?start=true&loop=false&delayms=3000&slide=id.g2c611bd27b0_0_0>

- `make init` をしてください。下記がまとめて実行されます。
  - `make key`
    - nginx sslに必要な .crt,keyを発行します
  - `make make_env`
    - Makefile用の `./.make_env` が(上書きで)作成されます。
      - set_env.sh で使用。LINUXに対応するため
      - 処理: init/.make_env_example を cp  
  - `make env`
    - 機能:Docker用の `./docker/srcs/.env` が(上書きで)作成されます。
    - 処理: docker/srcs/.env_example を cp  
- .gitignoreを手動でコピーして作成
  - init/.gitignore_sample に最新の見本を置いてます。
  - いつかmakeするたびに自動的に更新する設定にしたい（予定）

## 各自専用の makeターゲットの設定

- Make targetのカスタマイズ
  - 個人用にカスタマイズするには `additional.mk` という名前のファイルを Makefileの階層に作成してください。Makefileにincludeされる設定済み。.gitignore済み。
![alt](<other/team_docs/img/スクリーンショット 2024-03-21 4.08.06.png>)  

## ブラウザ用各コンテナへのURLリンク

- [testpageURL.md](other/team_docs/testpageURL.md)

## チーム内のドキュメント `other/team_docs/`

- [subject.pdf](other/subject/en.subject.pdf)  
  - PDF拡張でVSCODE上で読めます
  - [日本語訳](other/subject/subject.md)
- [Tips.md](other/team_docs/Tips.md)
- [port.md](other/team_docs/port.md)
- [プロジェクトマネジメント](other/team_docs/pm/pm_readme.md)
  - [Design](other/team_docs/pm/design.md)

### module

- [Blockchain.md](other/team_docs/Blockchain.md)
  - [Blockchain/ganache.md](other/team_docs/Blockchain/ganache.md)
  - [Blockchain/Hardhat.md](other/team_docs/Blockchain/Hardhat.md)
  - sepolia 追加予定
- [Django.md](other/team_docs/Django.md)
  - [memo.md](docker/srcs/uwsgi-django/sphinx/sphinx-memo.md)
- [PostgreSQL.md](other/team_docs/PostgreSQL.md)
- [nginx.md](other/team_docs/nginx.md)
- [frontend.md(Bootstrap, three.js)](other/team_docs/frontend.md)
- [pgadmin.md](other/team_docs/pgadmin.md)
- LogManagement
  - [LogManagement/ELK.md(Elastic Stack)](other/team_docs/LogManagement/ELK.md)
  - [LogManagement/filebeat.md](other/team_docs/LogManagement/filebeat.md)
- [MonitoringSystem.md](other/team_docs/MonitoringSystem.md)
  - [MonitoringSystem/Grafana.md](other/team_docs/MonitoringSystem/Grafana.md)
  - [MonitoringSystem/Prometheus.md](other/team_docs/MonitoringSystem/Prometheus.md)
- [minimal_requirement.md](other/team_docs/minimal_requirement.md)

## TEST CASE

- `make t`
  - `test/main_test.sh` にまとめていく予定

## 設定済みの make ターゲット 例  

- `make`  
  - 全てのコンテナを起動
  - 一部を起動したいときは、make build_up_* でmoduleごとに必要な分だけ起動するよう設定してます。
- `make t`
  - 全てのコンテナに対して簡単なsampleテストが走ります
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
- コンテナを選択して起動する(profile )
  - 参考:【Compose で プロフィール(profile) を使う — Docker-docs-ja 24.0 ドキュメント】 <https://docs.docker.jp/compose/profiles.html>
　- .ymlにprofilesで指定
    - 常時起動する基本のwebアプリ関連
      - make_build_up_default
    - blockchain
      - make_build_up_blockchain
    - 他、etk, monitorも同様に設定済み  
- Blockchain Module
  - `make hardhat_deploy_ganache`
    - ganache コンテナに deployする（データを永続化していないため）
