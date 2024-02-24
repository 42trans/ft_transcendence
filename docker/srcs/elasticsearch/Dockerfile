FROM docker.elastic.co/elasticsearch/elasticsearch:8.12.1

COPY elasticsearch.yml /usr/share/elasticsearch/config/
# スクリプトをコンテナにコピー
COPY setup.sh /tmp/
COPY elasticsearch-docker-entrypoint.sh /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]