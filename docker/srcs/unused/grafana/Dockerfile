# docker/srcs/grafana/Dockerfile
# Grafanaの公式イメージをベースに使用
FROM grafana/grafana-oss:10.4.0
# FROM grafana/grafana-oss:latest

# ft_transcendence用に作成したダッシュボードのJSONファイルをイメージに追加
COPY dashboards/1860-node-exporter-full.json /var/lib/grafana/dashboards/ft_trans/1860-node-exporter-full.json

# ダッシュボードとデータソースのプロビジョニング設定を追加
COPY provisioning/alerting/alert-rules-1.yaml /etc/grafana/provisioning/alerting/alert-rules-1.yaml
COPY provisioning/dashboards/dashboards.yml /etc/grafana/provisioning/dashboards/dashboards.yml
COPY provisioning/datasources/datasources.yml /etc/grafana/provisioning/datasources/datasources.yml
COPY provisioning/alerting/contact-points.yaml /etc/grafana/provisioning/alerting/contact-points.yaml
COPY provisioning/alerting/notification-policies.yaml /etc/grafana/provisioning/alerting/notification-policies.yaml
# TODO-ft: 落ち着いたら　mount とどちらにするか判断する
COPY grafana.ini /etc/grafana/grafana.ini

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
