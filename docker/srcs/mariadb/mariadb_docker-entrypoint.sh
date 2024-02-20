#!/bin/bash
# srcs/mariadb/mariadb_docker-entrypoint.sh
# -----------------------------------------------
# DEBUG
# -----------------------------------------------
# echo "mariadb_docker-entrypoint.sh start"
# echo $MARIADB_ROOT_PASSWORD
# -----------------------------------------------
# エラー時にスクリプトの実行を停止
set -e
# -------------------------------------
# notify.txtファイルが存在する場合、削除する
# -------------------------------------
NOTIFY_FILE="/container_output/fin_mariadb_entrypoint.txt"
if [ -f "$NOTIFY_FILE" ]; then
	echo "Removing existing $NOTIFY_FILE"
	rm -f "$NOTIFY_FILE"
fi
# -------------------------------------
# ソケットファイルの削除
# -------------------------------------
SOCKET_FILE="/run/mysqld/mysqld.sock"
if [ -e "$SOCKET_FILE" ]; then
	echo "Removing stale socket file $SOCKET_FILE"
	rm -f "$SOCKET_FILE"
fi
# -------------------------------------
# /run/mysqld ディレクトリの確認と作成
# -------------------------------------
if [ ! -d "/run/mysqld" ]; then
	mkdir -p /run/mysqld
	chown mysql:mysql /run/mysqld
	find /run/mysqld -type d -exec chmod 755 {} \;
fi
# -------------------------------------
# 初回の起動フラグ
mariadb_initialized=false
# -----------------------------------------------
# mariadb install
# -----------------------------------------------
# MariaDBが初めて実行される場合
if [ ! -d "/var/lib/mysql/mysql" ]; then
	# データベースを初期化
	mariadb-install-db 

	# set file & dir
	cp /50-server.cnf /etc/mysql/mariadb.conf.d/

	mkdir -p /var/lib/mysql
	chown -R mysql:mysql /var/lib/mysql
	find /var/lib/mysql -type d -exec chmod 755 {} \;

	mariadb_initialized=true
fi
# -----------------------------------------------
# start db background
# -----------------------------------------------
# MariaDBをバックグラウンドで起動
mariadbd --port=3306 --bind-address=0.0.0.0 --user=mysql &
pid="$!"
# -----------------------------------------------
# dbサーバーが起動するまで指定回数だけ試行
# -----------------------------------------------
max=30
num=1
# MariaDBサーバーが起動するまで待機
while (( num < max )); do
	if mysqladmin ping --host=127.0.0.1 --user=root --password="$MARIADB_ROOT_PASSWORD" --silent; then
		break
	fi
	echo "num = ${num}"
	sleep 1
	((num++))
done
if (( num == max )); then
	echo "error"
	exit 1
fi
# -----------------------------------------------
# setup mariadb
# -----------------------------------------------
# パスワードの設定と特権付与
# -u root: rootで実行
# --execute: SQLを実行
if [ "$mariadb_initialized" = true ]; then
	# root ユーザーの localhost からの接続用のパスワードを設定
	mysql -u root \
		--execute="SET PASSWORD FOR 'root'@'localhost' = PASSWORD('${MARIADB_ROOT_PASSWORD}');"
	# root ユーザーに全てのデータベースの全ての特権を付与 他のユーザーに特権を付与する権限も
	mysql -u root --password="${MARIADB_ROOT_PASSWORD}"\
		--execute="GRANT ALL ON *.* TO 'root'@'localhost' WITH GRANT OPTION;"
	# test という名前のデータベースが存在する場合、削除。特権テーブルを再読み込み
	mysql -u root --password="${MARIADB_ROOT_PASSWORD}" \
		--execute="DROP DATABASE IF EXISTS test; \
		FLUSH PRIVILEGES;"
fi
# -----------------------------------------------
# setup wp_db
# -----------------------------------------------
# mysql: MySQLのコマンドラインツール
# -uroot: ユーザー名 root
# -p: パスワード .envから環境変数による取得
# <<-: インデントが使えるヒアドキュメント
# 
# データベースが存在しない場合
if ! mysql -u root --password="$MARIADB_ROOT_PASSWORD" -e "SHOW DATABASES LIKE '$WORDPRESS_DB_NAME';" | grep "$WORDPRESS_DB_NAME"; then
	# WordPressデータベースを作成
	mysql -u root --password="${MARIADB_ROOT_PASSWORD}" <<-HEREDOC
		CREATE DATABASE IF NOT EXISTS $WORDPRESS_DB_NAME;
		CREATE USER IF NOT EXISTS '$WORDPRESS_DB_USER'@'%' IDENTIFIED BY '$WORDPRESS_DB_PASSWORD';
		GRANT ALL PRIVILEGES ON $WORDPRESS_DB_NAME.* TO '$WORDPRESS_DB_USER'@'%';
		FLUSH PRIVILEGES;
	HEREDOC
fi

# -----------------------------------------------
# setup strapi_db
# -----------------------------------------------
# echo "strapi db setup start"
# if ! mysql -u root --password="$MARIADB_ROOT_PASSWORD" -e "SHOW DATABASES LIKE '$STRAPI_DB_NAME';" | grep "$STRAPI_DB_NAME"; then
# 	mysql -u root --password="${MARIADB_ROOT_PASSWORD}" <<-HEREDOC
# 		CREATE DATABASE IF NOT EXISTS $STRAPI_DB_NAME;
# 		CREATE USER IF NOT EXISTS '$STRAPI_DB_USERNAME'@'%' IDENTIFIED BY '$STRAPI_DB_PASSWORD';
# 		GRANT ALL PRIVILEGES ON $STRAPI_DB_NAME.* TO '$STRAPI_DB_USERNAME'@'%';
# 		FLUSH PRIVILEGES;
# 	HEREDOC
# fi
# -----------------------------------------------
# start foreground
# -----------------------------------------------
# バックグラウンドのMariaDBをシャットダウン　10秒待機
timeout 10 mysqladmin -uroot -p"${MARIADB_ROOT_PASSWORD}" shutdown
for i in {1..10}; do
	# kill -0 PID: 指定したPIDのプロセスが存在するか
	if ! kill -0 $pid > /dev/null 2>&1; then
		echo "終了: MariaDB $pid"
		break
	fi
	echo "まだ実行中: MariaDB $pid"
	sleep 1
done
# 10秒後もプロセスが存在する場合、強制終了
if kill -0 $pid > /dev/null 2>&1; then
	echo "強制終了"
	kill -9 $pid
fi
# MariaDBをフォーワードで起動
echo "exec mariadb"
echo "wp_entrypoint.sh 終わり" > /container_output/fin_mariadb_entrypoint.txt
exec mariadbd --port=3306 --bind-address=0.0.0.0 --datadir=/var/lib/mysql --user=mysql --console
