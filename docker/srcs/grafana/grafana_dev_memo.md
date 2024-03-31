# Grafana dev memo

## UI状況

- OAuth2認証 (Auth0)
  - 現状：Basic認証の下にボタン > Basic認証機能を削除するか検討中

  <img src="img/スクリーンショット 2024-03-31 15.15.38.png" width="450" alt="alt">
  <img src="img/スクリーンショット 2024-03-31 15.15.43.png" width="450" alt="alt">

- Alert (slack)  
  <img src="img/IMG_0824.png" width="250" alt="alt">

- Alert (Discord)  
  <img src="img/スクリーンショット 2024-03-30 13.59.14.png" width="450" alt="alt">

- dashbord

![alt text](<img/スクリーンショット 2024-03-28 21.11.28.png>)

- Dashboardの設定.json(手動コピペ)
  - Home > Dashboards > ft_trans > "name" > Settings

![alt text](<img/スクリーンショット 2024-03-30 8.03.02.png>)

## TODO

- グラフとメトリクスの設定
  - ホストマシン以外はPromtheusの設定後に
- アラートの設定
  - アラートメッセージにあるリンク先が切れているのはどうする？
- セキュリティ
  - HTTPS (auth0のcallbackも対応させる)
- Auth0
  - TODO
    - https対応後 Auth0 callback URLs 修正 <https://manage.auth0.com/>
    - 環境変数を.envに格納
    - 他モジュールでSSOするなら削除の判断を行う。 GitHub OAuth2 も良さそう  
    参考:【汎用 OAuth2 認証を構成する | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/setup-grafana/configure-security/configure-authentication/generic-oauth/#set-up-oauth2-with-auth0>
- 要件外
  - バックアップ
    - 参考:【Grafana をバックアップする | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/administration/back-up-grafana/>
  - GrafanaをPrometheusでモニタリングする設定
    - 参考:【Grafana モニタリングをセットアップする | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/setup-grafana/set-up-grafana-monitoring/>
  - アラートにパネル画像を入れる


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
  - Alert(ホストマシンのみ), 一つのファイルに複数アラート設定が可能
    - docker/srcs/grafana/provisioning/alerting/alert-rules-1.yaml
    - 参考:【構成ファイルを使用してアラート リソースをプロビジョニングする | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/alerting/set-up/provision-alerting-resources/file-provisioning/>
  - 通知先 contact point
    - docker/srcs/grafana/provisioning/alerting/contact-points.yaml
      - Slack webhook
      - Discord webhook
  - 通知ポリシー  
    - Discordをデフォルトに設定 labelsでSlackに振り分けの設定も
      - docker/srcs/grafana/provisioning/alerting/notification-policies.yaml
- Auth認証
  - 参考:【Configure generic OAuth2 authentication | Grafana documentation】 <https://grafana.com/docs/grafana/latest/setup-grafana/configure-security/configure-authentication/generic-oauth/#set-up-oauth2-with-auth0>
  - プロトタイプ http
    - Auth0
      - 個人アカウントで作成
        - <https://manage.auth0.com/>
        - 参考:【ハウツー: Auth0 を使用して Grafana に認証を追加する - Cyral】 <https://cyral.com/blog/how-to-grafana-auth0/>
      - ベタ書きで設定
        - callback URLs http://localhost:3032/login/generic_oauth
      - TODO
        - https対応後 Auth0 callback URLs 修正 <https://manage.auth0.com/>
        - 環境変数を.envに格納
        - 他モジュールでSSOするなら削除の判断を行う
          - 参考:【Configure generic OAuth2 authentication | Grafana documentation】 <https://grafana.com/docs/grafana/latest/setup-grafana/configure-security/configure-authentication/generic-oauth/#set-up-oauth2-with-auth0>
          


### 認証機能　作業時memo

- セキュリティ構成について　全般
  - データ ソース URL の IP アドレス/ホスト名を制限する
    - 参考:【Configure security | Grafana documentation】 <https://grafana.com/docs/grafana/latest/setup-grafana/configure-security/>
  - リクエスト セキュリティ構成オプション
    -参考:【リクエストのセキュリティを構成する | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/setup-grafana/configure-security/configure-request-security/>
  - プロキシサーバー

- HTTPS証明書
  - 方針:自己署名証明書を使用する
    参考:【安全な Web トラフィックのために Grafana HTTPS をセットアップする | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/setup-grafana/set-up-https/>
    - 方針: nginxのものをマウントで共有
  - プロビジョニング
    - 参考:【Grafana のプロビジョニング | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/administration/provisioning/>
  - サービスアカウント
    - 参考:【サービスアカウント | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/administration/service-accounts/#create-a-service-account-in-grafana>
    - sample token
      - glsa_sBXdvnUw033H7IItLD6slELMdey2xXnK_5b9af582
- 認証
  - BASE認証では不足？
  - SAMLはOSS未対応
  - OAuth2（セキュリティモジュールへの拡張も視野にするとこれが良さそう）
    - 参考:【汎用 OAuth2 認証を構成する | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/setup-grafana/configure-security/configure-authentication/generic-oauth/#examples-of-setting-up-generic-oauth2>
    - GitHub OAuth2も検討してみる
      - 参考:【GitHub OAuth2 認証を構成する | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/setup-grafana/configure-security/configure-authentication/github/>
    - 設定
      - 参考:【Database Access Management - Cyral】 <https://cyral.com/solutions/database-access-management/>
      
- role設定
  - adminとediterとviewerの管理方針決定

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
