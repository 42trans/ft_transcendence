#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail


RED="\033[0;31m"
RESET="\033[0m"
EXIT_FAILURE=1

SSL_DIR=./docker/srcs/nginx/ssl

if [ ! -f $SSL_DIR/openssl.cnf ]; then
    echo -e "${RED}[Error] openssl.cnf not found${RESET}"
    exit EXIT_FAILURE
fi

if [ ! -f $SSL_DIR/nginx.key ] || [ ! -f $SSL_DIR/nginx.crt ]; then
  echo "generate nginx cert_key"

  mkdir -p $SSL_DIR/

  openssl req \
          -new \
          -x509 \
          -nodes \
          -days 365 \
          -config $SSL_DIR/openssl.cnf \
          -keyout $SSL_DIR/nginx.key \
          -out $SSL_DIR/nginx.crt > /dev/null 2>&1
else
  echo "nginx cert_key already exists"
fi

sudo chmod 600 $SSL_DIR/nginx.key
sudo chmod 644 $SSL_DIR/nginx.crt
