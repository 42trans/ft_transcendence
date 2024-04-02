#!/bin/bash
# docker/srcs/grafana/entrypoint.sh
OUTPUT_FILE="/etc/grafana/provisioning/alerting/contact-points.yaml"
# 環境変数でプレースホルダを置換
sed -i "s|\${GRAFANA_CONTACT_POINT_SLACK}|${GRAFANA_CONTACT_POINT_SLACK}|g" $OUTPUT_FILE
sed -i "s|\${GRAFANA_CONTACT_POINT_DISCORD}|${GRAFANA_CONTACT_POINT_DISCORD}|g" $OUTPUT_FILE
# Grafanaを起動
exec /run.sh
