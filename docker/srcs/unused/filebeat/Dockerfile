ARG ELASTIC_VERSION

FROM docker.elastic.co/beats/filebeat:${ELASTIC_VERSION}

USER root
RUN apt-get update && apt-get install -y netcat
USER filebeat

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
