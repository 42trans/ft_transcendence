# Grafanaの公式イメージをベースに使用
# 公式ドキュメントと実際に乖離があり信頼できるリソースを探すためにバージョンを固定したい。
FROM grafana/grafana-oss:10.4.0
# FROM grafana/grafana-oss:latest

# ft_transcendence用に作成したダッシュボードのJSONファイルをイメージに追加
COPY 1860-node-exporter-full.json /var/lib/grafana/dashboards/1860-node-exporter-full.json

# ダッシュボードとデータソースのプロビジョニング設定を追加
COPY dashboards.yml /etc/grafana/provisioning/dashboards/dashboards.yml
COPY datasources.yml /etc/grafana/provisioning/datasources/datasources.yml
