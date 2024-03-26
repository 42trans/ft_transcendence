# team_docs/MonitoringSytem.md (Prometheus,Grafana)

## TODO 残作業

- 監視対象設定し内容、意味のあるものにする
  - インストールしただけ、の状態ではなく、課題趣旨に沿ったメトリクスを収集する。
- 全てのコンテナにエクスポーターが設定されているか検証する
- integrationsの設定
- アラートルールの設定
- ストレージ戦略の策定
  - mountするだけで良い？
- 安全な認証
- リアルタイム、積極的収集であることをチェック

## 詳細

- 各コンテナ・サービス特有のことはこちらに
  - [MonitoringSystem/Grafana.md](MonitoringSystem/Grafana.md)
  - [MonitoringSystem/Prometheus.md](MonitoringSystem/Prometheus.md)

## 概要

- Dockerコンテナを使用する(kindは使用しない)
  - Prometheus
  - Grafana

## 要件対応状況

- [subject/subject_MonitoringSystem.md](subject/subject_MonitoringSystem.md)

## kind不使用について

- Subjectに　単一のコマンドの例として docker-compose up --build とある  
  - kindを使用しようと思ってましたが、全てDockerで、となると厳密には違います。  
    - kind本体はホストで動き、kindがDoker engineを利用してコンテナを作ります。  
  - kind自体をDockerコンテナに格納することは可能性としてはありますが、DinDを試しましたが動きませんでした。  
  - また、docker-compose up --buildのようなコマンドに含めることはできません。
    - make ターゲットでコマンドをシンプルにすることは可能ですが。  
  - 厳密に解釈すればDokerで行うことがセーフティだと思います。  
    - したがって、再度方針変更し、kindを使わずにDevopsを構築します。  
