#!/bin/bash

# PostgreSQLのコンテナ名
CONTAINER_NAME="postgres"
USER="user"
DB_NAME="ft_tc_test"

# データベース作成
docker exec -it $CONTAINER_NAME psql -U $USER -d postgres -c "CREATE DATABASE $DB_NAME;"

# テーブル作成
docker exec -it $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(100) UNIQUE NOT NULL);"

# レコード挿入
docker exec -it $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "INSERT INTO users (username, email) VALUES ('キュアブラック', '黒@トランプ王国.com');"
docker exec -it $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "INSERT INTO users (username, email) VALUES ('キュアホワイト', '白@トランプ王国.com');"

# データ表示
docker exec -it $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "SELECT * FROM users;"

# レコード削除
docker exec -it $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "DELETE FROM users WHERE username = 'キュアブラック';"
docker exec -it $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "DELETE FROM users WHERE username = 'キュアホワイト';"

# データ表示（レコードが削除されたことを確認）
docker exec -it $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "SELECT * FROM users;"