# other/team_docs/MonitoringSystem/Grafana.md

## 開発時手元メモ

- [docker/srcs/grafana/grafana_memo.md](../../../docker/srcs/grafana/grafana_memo.md)

## TODO

- 本番環境への移行時に行う作業
  - docker/srcs/compose-yaml/compose-monitor.yaml
    - TODO:下記は自己証明書を無視する。本番環境で削除する。
      - GF_PLUGIN_GRAFANA_IMAGE_RENDERER_RENDERING_IGNORE_HTTPS_ERRORS=true

## 課題解釈・要件対応

- データの永続
  - デフォルトでは、Grafana は組み込み SQLite バージョン 3 データベースを使用して、構成、ユーザー、ダッシュボード、その他のデータを保存します。  
  参考:【Grafana Docker イメージを実行する | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/setup-grafana/installation/docker/>
- build+upで要件対応状態になるようにする
  - dashboadなど、要件に合わせてセットアップされた状態で起動するようにDockerfileを使用する

## 参考資料:install, setup

- install, setup
  - 参考:【Configure a Grafana Docker image | Grafana documentation】 <https://grafana.com/docs/grafana/latest/setup-grafana/configure-docker/>

## ドキュメント確認済み

- Docker
  - インストール  
    - 参考:【Grafana Docker イメージを実行する | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/setup-grafana/installation/docker/#run-grafana-via-docker-compose>
  - 保存
    - 参考:【Grafana Docker イメージを実行する | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/setup-grafana/installation/docker/#use-bind-mounts-1>
    - rootは使わず、事前に非rootユーザーを作成し、そのユーザーのIDを user パラメータに設定します。このIDは `id -u <username>` コマンドを使用して取得するのが望ましい？
- configure
  - 参考:【Grafana を構成する | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/>  

  ```export GF_DEFAULT_INSTANCE_NAME=ft_trans_pong
  export GF_SECURITY_ADMIN_USER=adm
  GF_SECURITY_ADMIN_PASSWORD=adm
  <!-- 自己証明書を無視する -->
  export GF_PLUGIN_GRAFANA_IMAGE_RENDERER_RENDERING_IGNORE_HTTPS_ERRORS=true
  <!-- 特定の機能をONにする -->
  export GF_FEATURE_TOGGLES_ENABLE=newNavigation```

- administration
  - 参考:【Grafana のプロビジョニング | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/administration/provisioning/>