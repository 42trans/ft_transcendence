# Kibanaのベースイメージ
FROM docker.elastic.co/kibana/kibana:8.12.1

# 環境変数を設定
# ARG ELASTICSEARCH_USERNAME
# ARG ELASTICSEARCH_PASSWORD
# ENV ELASTICSEARCH_USERNAME=${ELASTICSEARCH_USERNAME}
# ENV ELASTICSEARCH_PASSWORD=${ELASTICSEARCH_PASSWORD}

COPY kibana-docker-entrypoint.sh /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
