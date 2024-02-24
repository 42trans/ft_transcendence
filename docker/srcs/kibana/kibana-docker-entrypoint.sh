#!/bin/bash
# docker/srcs/kibana/kibana-docker-entrypoint.sh
# -----------------------------------------------
# DEBUG
# -----------------------------------------------
echo "docker/srcs/kibana/kibana-docker-entrypoint.sh start"
echo $ELASTICSEARCH_PASSWORD
# -----------------------------------------------
# エラー時にスクリプトの実行を停止
set -e
# -----------------------------------------------
# notify.txtファイルが存在する場合、削除する
# -----------------------------------------------
NOTIFY_FILE="/container_output/kibana_entrypoint_sh_finished.txt"
if [ -f "$NOTIFY_FILE" ]; then
	echo "Removing existing $NOTIFY_FILE"
	rm -f "$NOTIFY_FILE"
fi

# kibana.ymlに環境変数の値を設定
if ! grep -q '^elasticsearch.username:' /usr/share/kibana/config/kibana.yml; then
    echo "elasticsearch.username: ${ELASTICSEARCH_USERNAME}" >> /usr/share/kibana/config/kibana.yml
fi
if ! grep -q '^elasticsearch.password:' /usr/share/kibana/config/kibana.yml; then
    echo "elasticsearch.password: ${ELASTICSEARCH_PASSWORD}" >> /usr/share/kibana/config/kibana.yml
fi
# echo "elasticsearch.username: ${ELASTICSEARCH_USERNAME}" >> /usr/share/kibana/config/kibana.yml
# echo "elasticsearch.password: ${ELASTICSEARCH_PASSWORD}" >> /usr/share/kibana/config/kibana.yml

# -----------------------------------------------
echo "exec kibana"
echo "kibana_entrypoint.sh 終わり" > /container_output/kibana_entrypoint_sh_finished.txt
exec /usr/local/bin/kibana-docker