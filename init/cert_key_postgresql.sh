#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail


RED="\033[0;31m"
RESET="\033[0m"
EXIT_FAILURE=1

SSL_DIR=./docker/srcs/postgres/ssl

if [ ! -f $SSL_DIR/openssl.cnf ]; then
    echo -e "${RED}[Error] openssl.cnf not found${RESET}"
    exit EXIT_FAILURE
fi

if [ ! -f $SSL_DIR/postgresql.key ] || [ ! -f $SSL_DIR/postgresql.crt ]; then
  echo "generate postgresql cert_key"

  mkdir -p $SSL_DIR/

  openssl req \
          -new \
          -x509 \
          -nodes \
          -days 365 \
          -config $SSL_DIR/openssl.cnf \
          -keyout $SSL_DIR/postgresql.key \
          -out $SSL_DIR/postgresql.crt > /dev/null 2>&1
else
  echo "postgresql cert_key already exists"
fi

chmod 600 $SSL_DIR/postgresql.key
chmod 644 $SSL_DIR/postgresql.crt
