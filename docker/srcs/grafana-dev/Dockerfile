# Grafanaの公式イメージをベースに使用
FROM grafana/grafana-oss:10.4.0
# FROM grafana/grafana-oss:latest

# ft_transcendence用に作成したダッシュボードのJSONファイルをイメージに追加
COPY dashboards/1860-node-exporter-full.json /var/lib/grafana/dashboards/ft_trans/1860-node-exporter-full.json

# ダッシュボードとデータソースのプロビジョニング設定を追加
COPY provisioning/alerting/alert-rules-1.yaml /etc/grafana/provisioning/alerting/alert-rules-1.yaml
COPY provisioning/dashboards/dashboards.yml /etc/grafana/provisioning/dashboards/dashboards.yml
COPY provisioning/datasources/datasources.yml /etc/grafana/provisioning/datasources/datasources.yml
