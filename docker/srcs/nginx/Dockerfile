FROM debian:bullseye
# install -y 自動的に全てyes
RUN apt-get update && \
	apt-get install -y nginx && \
	rm -rf /var/lib/apt/lists/*
# SSL用ディレクトリ
RUN mkdir -p /etc/nginx/ssl
# # Nginxの設定ファイルを追加
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY nginx_docker-entrypoint.sh /
RUN chmod +x /nginx_docker-entrypoint.sh
ENTRYPOINT ["/nginx_docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
