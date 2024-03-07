# other/team_docs/k8s.md

## 方針

- まずはコンテナにkindを入れてplay
  - prometheusの状態だけ管理するシンプルなものを想定

## 使い方

- make kindup
  - 初回も再起動も同じ。クラスター内のサービスの再起動
- make kinddown
  - 終了。全てデータを失うので作業終了時に使う。make kindupだけ使う。

## tool

- k9s
  - ターミナルで `k9s`  

## DinD

- dind (Docker in Docker) setup
  - 参考:【kindind ~Kubernetes in Docker in Dockerでお手軽クラスタ構築~ | DevelopersIO】 https://dev.classmethod.jp/articles/kubernetes-in-docker-in-docker/
  - 参考:【kubernetes-sigs/kind: Kubernetes IN Docker - Kubernetes をテストするためのローカル クラスター】 https://github.com/kubernetes-sigs/kind
  - 参考:【種類 – クイックスタート】 https://kind.sigs.k8s.io/docs/user/quick-start/
  - 参考:【Prometheus サービスディスカバリ (Kubernetes編) | ネットワークチェンジニアとして】 https://changineer.info/server/monitoring/monitoring_prometheus_discovery_kubernetes.html
- kubectl ver
  - 参考:【Linux での kubectl のインストールとセットアップ | Kubernetes】 https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/
- prometheus
  - 参考:【kind 環境に Prometheus をデプロイする - yokaze.github.io】 https://yokaze.github.io/2021/03/07/

## 起動時自動セットアップ

- dashboard
  - 参考:【Provision Grafana | Grafana documentation】 https://grafana.com/docs/grafana/latest/administration/provisioning/#dashboards