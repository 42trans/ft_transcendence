#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail


RED="\033[0;31m"
RESET="\033[0m"
EXIT_FAILURE=1

NAME=grafana
SSL_DIR=./docker/srcs/${NAME}/ssl

if [ ! -f $SSL_DIR/openssl.cnf ]; then
    echo -e "${RED}[Error] openssl.cnf not found${RESET}"
    exit EXIT_FAILURE
fi

if [ ! -f $SSL_DIR/${NAME}.key ] || [ ! -f $SSL_DIR/${NAME}.crt ]; then
  echo "generate cert_key"

  mkdir -p $SSL_DIR/

  openssl req \
          -new \
          -x509 \
          -nodes \
          -days 365 \
          -config $SSL_DIR/openssl.cnf \
          -keyout $SSL_DIR/${NAME}.key \
          -out $SSL_DIR/${NAME}.crt > /dev/null 2>&1
else
  echo "cert_key already exists"
fi
