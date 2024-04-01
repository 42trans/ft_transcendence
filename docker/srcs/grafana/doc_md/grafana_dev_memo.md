# Grafana dev memo

## OAuth設定時メモはこちら

- [OAuth設定時メモ](grafana_Auth0_memo.md)

## UI状況

- SSL + OAuth2 認証 (Auth0)
  - 連携: github, discord, spotify
    - テスト時注意
      - 同一アドレスで登録できない(githubとdiscordで同じメアドの場合)。連続で挙動テストするときに発生するかも。adm:admで管理者でインして、emailが同一のuserを削除してテストしてください
  - TODO_ft：Basic認証の下にAuthボタン > Basic認証機能を削除するか検討中
  <img src="img/スクリーンショット 2024-03-31 21.45.44.png" width="450" alt="alt">
  <img src="img/スクリーンショット 2024-04-01 8.51.45.png" width="450" alt="alt">

- Alert (slack)  
  <img src="img/IMG_0824.png" width="250" alt="alt">

- Alert (Discord)  
  <img src="img/スクリーンショット 2024-03-30 13.59.14.png" width="450" alt="alt">

- dashbord

![alt text](<img/スクリーンショット 2024-03-28 21.11.28.png>)

- Dashboardの設定.json(手動コピペ)
  - Home > Dashboards > ft_trans > "name" > Settings

![alt text](<img/スクリーンショット 2024-03-30 8.03.02.png>)

## TODO_ft

- 優先
- Auth0
  - 初期adminにする設定がわからない
  - あらかじめ登録したユーザーに限定することはできないのか？誰でも追加できてしまう
  - basic認証機能を削除するか検討
  - 環境変数を.envに格納

- Auth0
  - 他モジュールでSSOするなら削除の判断を行う。 GitHub OAuth2 も良さそう  
  参考:【汎用 OAuth2 認証を構成する | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/setup-grafana/configure-security/configure-authentication/generic-oauth/#set-up-oauth2-with-auth0>
- グラフとメトリクスの設定
  - ホストマシン以外のメトリクスはPromtheusの設定後に
- アラートの設定
  - アラートメッセージにあるリンク先が切れているのはどうする？
- 要件外
  - バックアップ
    - 参考:【Grafana をバックアップする | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/administration/back-up-grafana/>
  - GrafanaをPrometheusでモニタリングする設定
    - 参考:【Grafana モニタリングをセットアップする | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/setup-grafana/set-up-grafana-monitoring/>
  - アラートにパネル画像を入れる
  - リバースプロキシの設定？　終盤のディテール詰めるとこで検討  
    - nginx以外のアクセスを制限、ポートのバインドを外す？ 

## 作業完了

- Dockerfile新規作成
  - dashbord
    - template(id 1860)をimportし、内容をjsonファイルにコピペ
      - docker/srcs/grafana/dashboards/1860-node-exporter-full.json
      - 参考:【Node Exporter Full | Grafana Labs】 <https://grafana.com/grafana/dashboards/1860-node-exporter-full/>
- index.htmlにリンク設定
  - <https://localhost/>
- API sample テスト
  - 参考:【HTTP API | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/developers/http_api/>
- プロビジョニング（entrypoint.sh的な起動時の設定）
  - 連絡
    - .iniで設定しても環境変数が優先(オーバーライド)されます。.iniから環境変数変換のルールは一定のルールあり（prefix:GF,カテゴリ_変数名）
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
  - 参考:【汎用 OAuth2 認証を構成する | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/setup-grafana/configure-security/configure-authentication/generic-oauth/>
  - Auth0
    - 個人アカウント作成  <https://manage.auth0.com/>
      - 参考:【ハウツー: Auth0 を使用して Grafana に認証を追加する - Cyral】 <https://cyral.com/blog/how-to-grafana-auth0/>
      - callback URLs <https://localhost:3032/login/generic_oauth>
        - 3032固定なので、ポート番号が変更されたら毎回修正が必要
      - github, discord, spotifyアカウントでの認証
    - テスト時注意
      - 同一アドレスで登録できない(githubとdiscordで同じメアドの場合)。連続で挙動テストするときに発生するかも
        - エラーメッセージ:Login failed:User sync failed の時は、emaiが同一の場合に起きる。adm:admで管理者でインして、emailが同一のuserを削除してテストしてください

- https  
  - 参考:【Set up Grafana HTTPS for secure web traffic | Grafana documentation】 <https://grafana.com/docs/grafana/latest/setup-grafana/set-up-https/>
  - 自己証明書
    - grafana専用証明書作成 .cnf から init/cert_key_grafana.sh で作成 ※nginxと同様
      - docker/srcs/grafana/ssl に関連ファイル
      - make cert_key　追加（初回設定用）
      - .gitignoreはずしているので、レビュー前にチェックする  
      - mountで設定 ※nginxと同様の設定

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
    - コマンドで実行できるようにした。make cert_key に追加 `@chmod +x init/cert_key_grafana.sh && init/cert_key_grafana.sh`
    - gita対象にした `git add -f docker/srcs/grafana/ssl/grafana.crt` .keyも
  - mount: nginxと同様に マウントした  

    ```yaml  
    volumes:
      ./grafana/ssl/grafana.crt:/etc/grafana/grafana.crt
      ./grafana/ssl/grafana.key:/etc/grafana/grafana.key
    ```

  - プロビジョニング
    - 参考:【Grafana のプロビジョニング | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/administration/provisioning/>
  - サービスアカウント
    - 参考:【サービスアカウント | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/administration/service-accounts/#create-a-service-account-in-grafana>
    - sample token
      - glsa_sBXdvnUw033H7IItLD6slELMdey2xXnK_5b9af582
- 認証
  - Basic認証では不足？削除すべき？
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

``` yaml
  "panels": [
    {
    "collapsed": false,
    "datasource": {
      "type": "prometheus",
      "uid": "000000001"
    },
    ...
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
