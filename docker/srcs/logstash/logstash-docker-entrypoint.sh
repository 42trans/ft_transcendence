#!/bin/bash
# docker/srcs/kibana/kibana-docker-entrypoint.sh
# -----------------------------------------------
# DEBUG
# -----------------------------------------------
echo "docker/srcs/kibana/kibana-docker-entrypoint.sh start"
echo $ELASTICSEARCH_PASSWORD
# find / -name keytool
# java -version
# -----------------------------------------------
# エラー時にスクリプトの実行を停止
set -e
# -----------------------------------------------
# JAVA 環境変数
# -----------------------------------------------
export JAVA_HOME=/usr/share/logstash/jdk
export PATH=$JAVA_HOME/bin:$PATH
# -----------------------------------------------
# notify.txtファイルが存在する場合、削除する
# -----------------------------------------------
NAME="logstash"
NOTIFY_FILE="/container_output/${NAME}_entrypoint_sh_finished.txt"
if [ -f "$NOTIFY_FILE" ]; then
	echo "Removing existing $NOTIFY_FILE"
	rm -f "$NOTIFY_FILE"
fi


# 初回のみTruststoreへのElasticsearch証明書の追加
# if keytool -list -keystore $JAVA_HOME/lib/security/cacerts -storepass $TRUSTSTORE_PASSWORD -alias elasticsearch-cert > /dev/null 2>&1; then
#     echo "Alias elasticsearch-cert already exists, removing..."
#     keytool -delete -alias elasticsearch-cert -keystore $JAVA_HOME/lib/security/cacerts -storepass $TRUSTSTORE_PASSWORD
# fi
# keytool -importcert -noprompt -trustcacerts -file /usr/share/elasticsearch/config/certs/elasticsearch/elasticsearch.crt -keystore $JAVA_HOME/lib/security/cacerts -storepass $TRUSTSTORE_PASSWORD -alias elasticsearch-cert

# -----------------------------------------------
echo "exec ${NAME}"
echo "${NAME}_entrypoint.sh 終わり" > /container_output/${NAME}_entrypoint_sh_finished.txt
exec /usr/share/logstash/bin/logstash "$@"