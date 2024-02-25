FROM docker.elastic.co/logstash/logstash:8.12.1-amd64
# RUN yum install -y java-1.8.0-openjdk-devel
# RUN apt-get update && apt-get install -y openjdk-11-jdk
# RUN apt-get update && apt-get install -y openjdk-11-jdk
# RUN apt-get update && apt-get install -y gosu
# RUN apk add gosu
# RUN apk add jq

# RUN yum install -y gosu

# RUN rm -f /usr/share/logstash/pipeline/logstash.conf
# COPY pipeline/ /usr/share/logstash/pipeline/
COPY config/logstash.yml /usr/share/logstash/config/logstash.yml
# -------------------------------
# entrypoint.shの追加
# -------------------------------
COPY logstash-docker-entrypoint.sh /usr/share/logstash/entrypoint.sh
ENTRYPOINT ["/usr/share/logstash/entrypoint.sh"]