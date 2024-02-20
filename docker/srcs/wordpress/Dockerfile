FROM debian:bullseye
# ---------------------------------------
# 必要なパッケージのインストール
# ---------------------------------------
RUN apt-get update && apt-get install -y \
	curl \
	unzip \
	mariadb-client \
	ca-certificates \
	php-fpm \
	sudo \
	php-imagick \
	php-gd  \
	php-mysql && \
	rm -rf /var/lib/apt/lists/* && \ 
    apt-get clean
# ---------------------------------------
# WordPressのテーマファイルのコピーと展開
# ---------------------------------------
COPY source/fukasawa.2.1.2.zip /var/www/
RUN unzip /var/www/fukasawa.2.1.2.zip -d /var/www/ && rm /var/www/fukasawa.2.1.2.zip
# ---------------------------------------
# mkdir
# ---------------------------------------
RUN	mkdir -p /var/www/html && chmod 755 /var/www/html
RUN chown -R www-data:www-data /var/www/html
RUN mkdir -p /run/php && chmod 755 /run/php
# ---------------------------------------
# WordPressのダウンロード
# ---------------------------------------
# -o ファイルを保存する際に新しいァイル名で作成
RUN curl -o latest.zip https://wordpress.org/latest.zip 
RUN unzip latest.zip -d /var/www && rm latest.zip
# ---------------------------------------
# config
# ---------------------------------------
COPY www.conf /etc/php/7.4/fpm/pool.d/www.conf
# ---------------------------------------
# entrypoint.sh && source file
# ---------------------------------------
COPY wp_docker-entrypoint.sh /
RUN chmod +x /wp_docker-entrypoint.sh
COPY source/ /var/www/source/
RUN find /var/www/source/ -type f -exec chmod 755 {} \;
# PHP-FPMを.sh内で実行
ENTRYPOINT ["/wp_docker-entrypoint.sh"]
