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

![alt text](<スクリーンショット 2024-03-28 21.11.28.png>)

## TODO

- グラフとメトリクスの設定
  - 現在の出来合いのテンプレートで設定された監視対象で良いのか？

## 作業完了

- Dockerfile新規作成
- 初期dashboadの設定
  - docker/srcs/grafana/dashboards.yml
- 初期データソース
  - docker/srcs/grafana/datasources.yml
- バージョン確認テスト expected:"10.4.0"
  - sh docker/srcs/grafana/grafana_dev_test.sh
- index.htmlにリンク設定
  - https://localhost/
  
## Grafanaのダッシュボードプロバイダー設定を定義

- Dashboard設定
  - プロビジョニング: 必要なものを準備する
    - docker/srcs/grafana/dashboards.yml
    - 参考:【Grafana のプロビジョニング | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/administration/provisioning/#dashboards>

## 参考

- install（導入）
  - 参考:【Grafana Docker イメージを構成する | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/setup-grafana/configure-docker/>
- config（構成）
  - 参考:【Grafana を構成する | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/>
- プロビジョニング（準備・設定。　起動直後にセットアップされた状態を作るために必要）
  - datasorce: prometheus
    - 参考:【プロメテウス データ ソース | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/datasources/prometheus/#provision-the-data-source>
  - dashbord:  
    - 参考:【Provision Grafana | Grafana documentation】 <https://grafana.com/docs/grafana/latest/administration/provisioning/#dashboards>
    - docker/srcs/grafana/1860-node-exporter-full.json に使用したdashboard
      - 参考:【ノード エクスポータ フル |グラファナ研究所】 <https://grafana.com/grafana/dashboards/1860-node-exporter-full/>
      - id: 1860 を、Grafanaの機能でimport  
