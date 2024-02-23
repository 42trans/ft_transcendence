#!/bin/bash

# 設定変数
CERTS_DIR="$(pwd)/docker/srcs/elasticsearch/cert"
OPENSSL_CNF="$(pwd)/docker/srcs/elasticsearch/cert/openssl.cnf" # opensslの設定ファイルへのパス
mkdir -p "${CERTS_DIR}"

CA_CERT="${CERTS_DIR}/ca.crt"
CA_KEY="${CERTS_DIR}/ca.key"
ES_CERT="${CERTS_DIR}/elasticsearch.crt"
ES_KEY="${CERTS_DIR}/elasticsearch.key"
DAYS=365

# CA証明書の生成
openssl req -x509 -new -nodes -keyout "${CA_KEY}" -out "${CA_CERT}" -days "${DAYS}" -config "${OPENSSL_CNF}" -extensions v3_ca -batch

# Elasticsearch インスタンスの秘密鍵とCSRの生成
openssl req -new -nodes -keyout "${ES_KEY}" -out "${ES_CERT}.csr" -config "${OPENSSL_CNF}" -extensions req_ext -batch

# CSRに基づいてElasticsearch インスタンスの証明書を生成（CAで署名）
openssl x509 -req -in "${ES_CERT}.csr" -CA "${CA_CERT}" -CAkey "${CA_KEY}" -CAcreateserial -out "${ES_CERT}" -days "${DAYS}" -extensions v3_ca -extfile "${OPENSSL_CNF}"


# CSRファイルの削除
rm "${ES_CERT}.csr"
