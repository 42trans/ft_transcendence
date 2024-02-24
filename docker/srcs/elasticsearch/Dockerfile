FROM docker.elastic.co/elasticsearch/elasticsearch:8.12.1
# docker/srcs/elasticsearch/Dockerfile
# -------------------------------
# 環境変数を.ymlのargsで明示的に渡す
# -------------------------------
ARG ELASTIC_PASSWORD
ARG KIBANA_PASSWORD
ENV ELASTIC_PASSWORD=${ELASTIC_PASSWORD}
ENV KIBANA_PASSWORD=${KIBANA_PASSWORD}
# -------------------------------
# setup, configのコピー をrootで実行
# -------------------------------
USER root
COPY setup.sh /tmp/
RUN chmod +x /tmp/setup.sh && \
    /tmp/setup.sh && \
    chown -R root:root /usr/share/elasticsearch/config/certs
    # chown -R elasticsearch:elasticsearch /usr/share/elasticsearch/config/certs
# -------------------------------
COPY elasticsearch.yml /usr/share/elasticsearch/config/
RUN chown elasticsearch:elasticsearch /usr/share/elasticsearch/config/elasticsearch.yml
# -------------------------------
# 権限を戻してentrypoint.sh実行
# -------------------------------
USER elasticsearch
COPY elasticsearch-docker-entrypoint.sh /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
# chown -R root:root config/certs;