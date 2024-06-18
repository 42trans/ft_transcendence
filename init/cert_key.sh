#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail


RED="\033[0;31m"
RESET="\033[0m"
EXIT_FAILURE=1

SSL_DIR=./docker/srcs/nginx/ssl

# 同じ証明書を nginx-Django-postgre間の通信に用いる場合
# DJANGO_SSL_DIR=./docker/srcs/uwsgi-django/ssl
# POSTGRES_SSL_DIR=./docker/srcs/postgres/ssl

if [ ! -f $SSL_DIR/openssl.cnf ]; then
    echo -e "${RED}[Error] openssl.cnf not found${RESET}"
    exit EXIT_FAILURE
fi

if [ ! -f $SSL_DIR/nginx.key ] || [ ! -f $SSL_DIR/nginx.crt ]; then
  echo "generate cert_key"

  mkdir -p $SSL_DIR/

  # mkdir -p $DJANGO_SSL_DIR/

  openssl req \
          -new \
          -x509 \
          -nodes \
          -days 365 \
          -config $SSL_DIR/openssl.cnf \
          -keyout $SSL_DIR/nginx.key \
          -out $SSL_DIR/nginx.crt > /dev/null 2>&1
  
  # cp $SSL_DIR/nginx.key $DJANGO_SSL_DIR/django.key
  # cp $SSL_DIR/nginx.crt $DJANGO_SSL_DIR/django.crt
  # cp $SSL_DIR/nginx.key $POSTGRES_SSL_DIR/server.key
  # cp $SSL_DIR/nginx.crt $POSTGRES_SSL_DIR/server.crt

else
  echo "cert_key already exists"
fi
