# Grafana dev memo

## UI状況

- Alert (slack)  
  <img src="img/IMG_0824.png" width="250" alt="alt">

- Alert (Discord)  
  <img src="img/スクリーンショット 2024-03-30 13.59.14.png" width="450" alt="alt">

- dashbord

![alt text](<img/スクリーンショット 2024-03-28 21.11.28.png>)

- Dashboardの設定.json(手動コピペ)
  - Home > Dashboards > ft_trans > "name" > Settings

![alt text](<img/スクリーンショット 2024-03-30 8.03.02.png>)

## 留意事項

importしたdashboards/の.jsonファイルは、データソースのuidを自動調整してくれるのでそのままでも構わない（修正してももちろん動く）

```
  "panels": [
    {
    "collapsed": false,
    "datasource": {
      "type": "prometheus",
      "uid": "000000001"
    },
```

## TODO

- グラフとメトリクスの設定
  - 現在の出来合いのテンプレートで設定された監視対象で良いのか？
- アラートの設定
  - アラートメッセージにあるリンク先が切れている
- 認証の設定
- バックアップ
  - 参考:【Grafana をバックアップする | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/administration/back-up-grafana/>
- GrafanaをPrometheusでモニタリングする設定
  - 参考:【Grafana モニタリングをセットアップする | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/setup-grafana/set-up-grafana-monitoring/>

## 作業完了

- Dockerfile新規作成
  - dashbord
    - template(id 1860)をimportし、内容をjsonファイルにコピペ
      - docker/srcs/grafana/dashboards/1860-node-exporter-full.json
      - 参考:【Node Exporter Full | Grafana Labs】 <https://grafana.com/grafana/dashboards/1860-node-exporter-full/>
  - マウントボリュームを削除しても機能するか test
    - マウントボリュームのGrafana/を削除  
    - `make docker_rm`  
    - `make build_up_monitor`  
    - `http://localhost:3032/d/rYdddlPWk/node-exporter-full?orgId=1&refresh=1m`  
- index.htmlにリンク設定
  - <https://localhost/>
- API sample テスト
  - sh docker/srcs/grafana/grafana_dev_test.sh
  - 参考:【HTTP API | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/developers/http_api/>
- プロビジョニング（entrypoint.sh的な起動時の設定）
  - Dashboard(視覚化パネル)
    - docker/srcs/grafana/dashboards/dashboards.yml
    - 参考:【Grafana のプロビジョニング | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/administration/provisioning/#dashboards>
  - Datasource(Promtheus)
    - docker/srcs/grafana/provisioning/datasources/datasources.yml
    - 参考:【Grafana のプロビジョニング | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources>
    - 参考:【Prometheus data source | Grafana documentation】 <https://grafana.com/docs/grafana/latest/datasources/prometheus/>
  - Alert(CPU70%以上), 一つのファイルに複数アラート設定が可能なので、試みに例としてcpyしたものを記述
    - docker/srcs/grafana/provisioning/alerting/alert-rules-1.yaml
    - 参考:【構成ファイルを使用してアラート リソースをプロビジョニングする | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/alerting/set-up/provision-alerting-resources/file-provisioning/>
  - 通知先 contact point
    - docker/srcs/grafana/provisioning/alerting/contact-points.yaml
      - Slack webhook
      - Discord webhook
  - 通知ポリシー  
    - Discordをデフォルトに設定
      - docker/srcs/grafana/provisioning/alerting/notification-policies.yaml

### Alert機能　作業時memo

- Alertルールのエクスポート（プロビジョニング用）方法
  - Home > Alerting > Alert rules
    - UI右側の export rules から.yamlを選択。.yamlの理由:コメントを行内に行えるので
- alertmanager
  - 参考:【アラートマネージャー | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/alerting/fundamentals/alertmanager/>
- 通知先 webhook
  - 参考:【構成ファイルを使用してアラート リソースをプロビジョニングする | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/alerting/set-up/provision-alerting-resources/file-provisioning/>
  - 参考:【お問い合わせ先 | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/alerting/fundamentals/contact-points/>
- 作業の詳細:
  - webhookを用いてGrafanaのcontact point設定
  - contact pointをプロビジョニング設定
  - test:起動直後に通知テストを行った  
- slack webhook
  - Slack webhook url (Grafanaに設定するwebhook)
    - <https://hooks.slack.com/services/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>
  - slack Incoming Webhook 設定 url
    - <https://42-hioikawa-ft-trans.slack.com/services/B06S1SC7LQ2?added=1>  
- Discord webhook
  - 個人用サーバーに設定
  - webhook URL
    - <https://discord.com/api/webhooks/1223496487917584404/tVeUHpZRrW420zHkvnLcXB5R0OuQ_QY3v44jIkEZk5IkpAFYA42T32h3AVdjQCklS64B>  
    - test:  

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
