FROM debian:bullseye
RUN apt-get update && \
	apt-get install -y \
	nginx \
	gettext-base \
	&& \
	rm -rf /var/lib/apt/lists/*
# SSL用ディレクトリ
RUN mkdir -p /etc/nginx/ssl
# Nginxの設定ファイルを環境変数で設定するためのテンプレート
COPY ./nginx.conf /

COPY nginx_docker-entrypoint.sh /
RUN chmod +x /nginx_docker-entrypoint.sh
ENTRYPOINT ["/nginx_docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
