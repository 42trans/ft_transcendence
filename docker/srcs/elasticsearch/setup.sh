#!/bin/bash
# docker/srcs/elasticsearch/setup.sh

CERTS_DIR="/usr/share/elasticsearch/config/certs"

# 環境変数をチェック
# -z: 空文字列であるかをチェック
if [ -z "${ELASTIC_PASSWORD}" ]; then
  echo "Set the ELASTIC_PASSWORD environment variable."
  exit 1
fi
if [ -z "${KIBANA_PASSWORD}" ]; then
  echo "Set the KIBANA_PASSWORD environment variable."
  exit 1
fi

# 証明書の保存ディレクトリを作成
if [ ! -d "${CERTS_DIR}" ]; then
  mkdir -p "${CERTS_DIR}"
fi

# CA 作成
if [ ! -f "${CERTS_DIR}/ca.zip" ]; then
  echo "Creating CA"
  elasticsearch-certutil ca --silent --pem -out "${CERTS_DIR}/ca.zip"
  unzip "${CERTS_DIR}/ca.zip" -d "${CERTS_DIR}"
fi

# 証明書作成
if [ ! -f "${CERTS_DIR}/certs.zip" ]; then
  echo "Creating Elasticsearch certificates"
  echo -ne "instances:\n  - name: elasticsearch\n    dns:\n      - elasticsearch\n      - localhost\n    ip:\n      - 127.0.0.1\n" > "${CERTS_DIR}/instances.yml"
  elasticsearch-certutil cert --silent --pem -out "${CERTS_DIR}/certs.zip" --in "${CERTS_DIR}/instances.yml" --ca-cert "${CERTS_DIR}/ca/ca.crt" --ca-key "${CERTS_DIR}/ca/ca.key"
  unzip "${CERTS_DIR}/certs.zip" -d "${CERTS_DIR}"
fi

# ファイルの権限設定
echo "Setting file permissions"
chown -R root:root "${CERTS_DIR}"
find "${CERTS_DIR}" -type d -exec chmod 750 {} \;
find "${CERTS_DIR}" -type f -exec chmod 640 {} \;

# Elasticsearch の準備ができるまで待機
echo "Waiting for Elasticsearch availability"
until curl -s --cacert "${CERTS_DIR}/ca/ca.crt" "https://elasticsearch:9200" | grep -q "missing authentication credentials"; do
  sleep 30
done

# Kibana のパスワード設定
echo "Setting kibana_system password"
until curl -s -X POST --cacert "${CERTS_DIR}/ca/ca.crt" -u "elastic:${ELASTIC_PASSWORD}" -H "Content-Type: application/json" "https://elasticsearch:9200/_security/user/kibana_system/_password" -d "{\"password\":\"${KIBANA_PASSWORD}\"}" | grep -q "^{}"; do
  sleep 10
done

echo "All done!"
