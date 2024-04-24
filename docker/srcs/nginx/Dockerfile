FROM alpine:3.18
RUN apk update && apk add --no-cache \
    nginx \
    gettext \
    curl

# SSL用ディレクトリ
RUN mkdir -p /etc/nginx/ssl
# 静的ファイル
RUN mkdir -p /var/trans/static
# Nginxの設定ファイルを環境変数で設定するためのテンプレート
COPY ./nginx.conf /
COPY ./uwsgi_params /

COPY nginx_docker-entrypoint.sh /
RUN chmod +x /nginx_docker-entrypoint.sh
ENTRYPOINT ["/nginx_docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
