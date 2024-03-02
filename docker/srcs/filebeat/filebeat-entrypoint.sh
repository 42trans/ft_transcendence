#!/bin/bash

# Nginxモジュールを有効にする
filebeat modules enable nginx

#!/bin/bash

# Nginxモジュールの設定ファイルへのパス
NGINX_MODULE_CONFIG_PATH="/usr/share/filebeat/modules.d/nginx.yml"

# Nginxのアクセスログとエラーログの収集を有効にし、カスタムパスを設定
sed -i 's/enabled: false/enabled: true/g' $NGINX_MODULE_CONFIG_PATH
sed -i 's|#var.paths:|var.paths: ["/var/log/nginx/*.log"]|g' $NGINX_MODULE_CONFIG_PATH

# Filebeatを実行
/usr/share/filebeat/filebeat -e -c /usr/share/filebeat/filebeat.yml


# Filebeatを起動する
# exec /usr/share/filebeat/filebeat -e -c /usr/share/filebeat/filebeat.yml
# exec filebeat -e -c /usr/share/filebeat/filebeat.yml



# -----------------
# debug　cmd memo コンテナ内で実行
# -----------------
# filebeat modules list