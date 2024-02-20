#!/bin/bash
# srcs/wordpress/wp_docker-entrypoint.sh
# -----------------------------------------------
# DEBUG
# -----------------------------------------------
# echo "wp_docker-entrypoint.sh start"
# echo $WORDPRESS_PATH 
# -------------------------------------
# 異常終了回避
# -------------------------------------
# set -e: スクリプト内で終了ステータスが非ゼロを返した場合、実行を即座に終了
# set -u: 未定義の変数が使用された場合、実行を終了
# set -o pipefail: パイプラインの中のコマンドのうち、最後のコマンドがエラーを返した場合に、パイプライン全体の終了ステータスをその最後のエラーコードに設定
set -euo pipefail
# エラー時にスクリプトの実行を停止
set -x
# -------------------------------------
# notify.txtファイルが存在する場合、削除する
NOTIFY_FILE="/container_output/fin_wp_entrypoint.txt"
if [ -f "$NOTIFY_FILE" ]; then
	echo "Removing existing $NOTIFY_FILE"
	rm -f "$NOTIFY_FILE"
fi
# -------------------------------------
# /var/www/wordpressからファイルを移動する
# -------------------------------------
move_wordpress_files(){
	# WordPressファイルが/var/www/htmlに存在しない場合
	if [ ! -e "$WORDPRESS_PATH/wp-settings.php" ]; then
		mv /var/www/wordpress/* $WORDPRESS_PATH/
		chown -R www-data:www-data $WORDPRESS_PATH
	fi
	if [ -d "/var/www/wordpress" ] ; then
		rm -r /var/www/wordpress/
	fi
}
# -------------------------------------
# ファイルとディレクトリのパーミッションを修正
# -------------------------------------
set_permissions() {
	find $WORDPRESS_PATH/ -type d -exec chmod 755 {} \;
	find $WORDPRESS_PATH/ -type f -exec chmod 644 {} \;
}
# -------------------------------------
# wp-cliのインストール
# -------------------------------------
install_wp_cli(){
	# -------------------------------------
	# wp コマンドが機能しないため wp-cli.phar を用いる
	# -------------------------------------
	if [ ! -f wp-cli.phar ]; then
		curl -L -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar 
		chmod +x wp-cli.phar 
		chown www-data:www-data wp-cli.phar
	fi
	# -------------------------------------
	# Docker コンソール用に推奨される設定も行う
	# -------------------------------------
	if [ ! -f "/usr/local/bin/wp" ]; then
		cp wp-cli.phar /usr/local/bin/wp
		chmod +x /usr/local/bin/wp
		chown www-data:www-data /usr/local/bin/wp
	fi
}
# -------------------------------------
# DEBUG: wp-cliのインストールの確認
# /usr/local/bin/wp --info
# -------------------------------------
# mariadbの開始を待機
# -------------------------------------
wait_db(){
	count=0
	max_retries=90
	HOST="mariadb"
	DB_PORT=3306 
	while [ $count -lt $max_retries ]; do
	if mysqladmin ping -h"$HOST" -P"$DB_PORT" --silent; then
		echo "MariaDB ok"
		break
	fi
	echo "waiting"
	count=$((count+1))
	sleep 5
	#   sleep 30
	done
	if [ $count -eq $max_retries ]; then
	echo "failed"
	exit 1
	fi
}
# -------------------------------------
# configの設定
# -------------------------------------
config_wp_cli(){
# wp-config.php が存在しない場合
if [ ! -e "$WORDPRESS_PATH/wp-config.php" ]; then
	# php wp-cli.phar: WP-CLIのPHPアーカイブ（phar）ファイルをPHPで実行
	php wp-cli.phar core config \
		--dbname="${WORDPRESS_DB_NAME}" \
		--dbuser="${WORDPRESS_DB_USER}" \
		--dbpass="${WORDPRESS_DB_PASSWORD}" \
		--dbhost="${WORDPRESS_DB_HOST}" \
		--path="${WORDPRESS_PATH}" \
		--allow-root
	chown www-data:www-data $WORDPRESS_PATH/wp-config.php
	echo -e "wp-config fin"
fi
}
# -------------------------------------
# wordpressのインストール
# -------------------------------------
install_wordpress(){
	if ! $(php wp-cli.phar core is-installed --path="${WORDPRESS_PATH}" --allow-root); then
		php wp-cli.phar core install \
			--url="${WORDPRESS_URL}" \
			--title="${WORDPRESS_SITE_TITLE}" \
			--admin_user="${WORDPRESS_ADMIN_USER}" \
			--admin_password="${WORDPRESS_ADMIN_PASSWORD}" \
			--admin_email="${WORDPRESS_ADMIN_EMAIL}" \
			--path="${WORDPRESS_PATH}" \
			--allow-root
	fi
}
# -------------------------------------
# 初回起動時のセットアップ
# -------------------------------------
setup_word_press_init(){
	# ユーザーが存在しない場合にのみ実行
	if ! php wp-cli.phar user list --field=user_login --path="${WORDPRESS_PATH}" --allow-root | grep -q "${USER_NAME}"; then
		# -------------------------------------
		# ユーザーの作成
		# -------------------------------------
		php wp-cli.phar user create \
			"${USER_NAME}" \
			"${USER_EMAIL}" \
			--user_pass="${USER_PASSWORD}" \
			--role=editor \
			--path="${WORDPRESS_PATH}" \
			--allow-root
		# -------------------------------------
		# パーマリンク構造の更新
		# -------------------------------------
		php wp-cli.phar option update permalink_structure "/%postname%/" --allow-root --path=/var/www/html
		# # -------------------------------------
		# # theme変更
		# # -------------------------------------
		# source /var/www/source/theme.sh
		# rm /var/www/source/theme.sh
		# # -------------------------------------
		# # サンプル投稿を作成
		# # -------------------------------------
		# source /var/www/source/post.sh
		# rm /var/www/source/post.sh
		# # -------------------------------------
	fi
}
# -------------------------------------
# main 処理 上記関数を順に呼び出し
# -------------------------------------
move_wordpress_files
set_permissions
install_wp_cli
wait_db
config_wp_cli
install_wordpress
setup_word_press_init
# -------------------------------------
# PHPサーバーの起動
# -------------------------------------
echo "wp_entrypoint.sh 終わり" > /container_output/fin_wp_entrypoint.txt
exec php-fpm7.4 -F

