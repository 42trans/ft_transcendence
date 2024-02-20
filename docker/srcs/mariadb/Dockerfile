FROM debian:bullseye
RUN apt-get update && \
	apt-get install -y mariadb-server mariadb-client && \
	rm -rf /var/lib/apt/lists/*
# ------------------------------------------------
COPY 50-server.cnf /
# ------------------------------------------------
COPY mariadb_docker-entrypoint.sh /
RUN chmod +x /mariadb_docker-entrypoint.sh
ENTRYPOINT ["/mariadb_docker-entrypoint.sh"]
CMD ["mariadbd"]


