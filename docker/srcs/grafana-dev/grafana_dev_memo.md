# Grafana dev memo

## 目標: build + up直後に課題要件クリア状況を作る

- Dockerfile作成
  - dashbord
    - templateをimportし、内容をjsonファイルにコピペ
      - 参考:【Node Exporter Full | Grafana Labs】 <https://grafana.com/grafana/dashboards/1860-node-exporter-full/>
  - container test  
  `make docker_rm`  
  `make build_up_monitor`  
  `http://localhost:3032/d/rYdddlPWk/node-exporter-full?orgId=1&refresh=1m`  

![alt text](<img/スクリーンショット 2024-03-28 21.11.28.png>)

## TODO

- グラフとメトリクスの設定
  - 現在の出来合いのテンプレートで設定された監視対象で良いのか？
- アラートの設定
- 認証の設定
- バックアップ
  - 参考:【Grafana をバックアップする | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/administration/back-up-grafana/>

## 作業完了

- Dockerfile新規作成
- 初期dashboadの設定
  - docker/srcs/grafana/dashboards.yml
- 初期 Prometheus データソース
  - docker/srcs/grafana/datasources.yml
- index.htmlにリンク設定
  - https://localhost/
- API sample テスト
  - sh docker/srcs/grafana/grafana_dev_test.sh
  - 参考:【HTTP API | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/developers/http_api/>
- プロビジョニング（起動時の設定）
  - Dashboard
    - docker/srcs/grafana/dashboards.yml
    - 参考:【Grafana のプロビジョニング | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/administration/provisioning/#dashboards>
  - Datasource(Promtheus)
  - Alert(CPU70%)


## 参考

- install（導入）
  - 参考:【Grafana Docker イメージを構成する | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/setup-grafana/configure-docker/>
- config（構成）
  - 参考:【Grafana を構成する | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/>
- プロビジョニング（準備・設定。　起動直後にセットアップされた状態を作るために必要）
  - datasorce: prometheus
    - 参考:【プロメテウス データ ソース | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/datasources/prometheus/#provision-the-data-source>
  - PostgreSQL
    - 参考:【PostgreSQL データ ソース | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/datasources/postgres/>
  - dashbord:  
    - 参考:【Provision Grafana | Grafana documentation】 <https://grafana.com/docs/grafana/latest/administration/provisioning/#dashboards>
    - docker/srcs/grafana/1860-node-exporter-full.json に使用したdashboard
      - 参考:【ノード エクスポータ フル |グラファナ研究所】 <https://grafana.com/grafana/dashboards/1860-node-exporter-full/>
      - id: 1860 を、Grafanaの機能でimport  
  - アラート  
    - 参考:【アラート プロビジョニング HTTP API | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/developers/http_api/alerting_provisioning/>
    - 参考:【構成ファイルを使用してアラート リソースをプロビジョニングする | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/alerting/set-up/provision-alerting-resources/file-provisioning/>
- API
  - 参考:【HTTP API | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/developers/http_api/>
- アラート
  - 参考:【アラートの概要 | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/alerting/fundamentals/>
  - 参考:【アラートを設定する | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/alerting/set-up/>
  - 参考:【アラート プロビジョニング HTTP API | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/developers/http_api/alerting_provisioning/>
- デモンストレーション・プレゼンテーション用
  - エグザンプラ
    - 参考:【サンプルの紹介 | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/fundamentals/exemplars/>
- CLI
  - debug log
    - `grafana cli --insecure --pluginUrl https://company.com/grafana/plugins/<plugin-id>-<plugin-version>.zip plugins install <plugin-id>`
- node-exporter
  - 参考:【Grafana と Prometheus を始めましょう | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/getting-started/get-started-grafana-prometheus/>
