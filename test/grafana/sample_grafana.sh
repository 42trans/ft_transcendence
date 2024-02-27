#!/bin/sh
# test/grafana/sample_grafana.sh

curl http://localhost:${GRAFANA_PORT}/api/health
