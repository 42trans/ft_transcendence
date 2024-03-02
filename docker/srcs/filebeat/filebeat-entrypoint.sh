#!/bin/bash
# --------------------------------
# Nginxモジュール
# --------------------------------
filebeat modules enable nginx
NGINX_MODULE_CONFIG_PATH="/usr/share/filebeat/modules.d/nginx.yml"
# Nginxのアクセスログとエラーログの収集を有効にし、カスタムパスsedで書き換え
sed -i 's/enabled: false/enabled: true/g' $NGINX_MODULE_CONFIG_PATH
sed -i 's|#var.paths:|var.paths: ["/var/log/nginx/*.log"]|g' $NGINX_MODULE_CONFIG_PATH
# --------------------------------
# Filebeatをexec
/usr/share/filebeat/filebeat -e -c /usr/share/filebeat/filebeat.yml
# --------------------------------
# -----------------
# debug　cmd memo コンテナ内で実行
# -----------------
# docker exec -it srcs-filebeat-1 bash
# filebeat modules list
