FROM docker.elastic.co/logstash/logstash:8.12.1-amd64
RUN rm -f /usr/share/logstash/pipeline/logstash.conf
COPY pipeline/ /usr/share/logstash/pipeline/
# COPY config/ /usr/share/logstash/config/
COPY config/logstash.yml /usr/share/logstash/config/logstash.yml