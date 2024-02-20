#!/bin/sh
# srcs/nginx/nginx_docker-entrypoint.sh
# gatsby&nginx共用ボリューム
# if [ -d "/var/www/gatsby" ] ; then
# 	mkdir -p /var/www/gatsby
# 	mkdir -p /var/www/gatsby/upload
# 	chmod 755 /var/www/gatsby
# 	chmod 755 /var/www/gatsby/upload
# 	chown -R www-data:www-data /var/www/gatsby
# fi

exec "$@"
