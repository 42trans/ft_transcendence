ARG ELASTIC_VERSION

# https://www.docker.elastic.co/
FROM docker.elastic.co/logstash/logstash:${ELASTIC_VERSION}

USER root
RUN apt-get update && apt-get install -y \
	iputils-ping \
	telnet \
	netcat \
	lsof
USER logstash
