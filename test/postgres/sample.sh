#!/bin/bash

# PostgreSQLのコンテナ名
CONTAINER_NAME="postgres"
USER="user"
DB_NAME="ft_test"

# データベースの存在確認と削除
DATABASE_EXISTS=$(docker exec $CONTAINER_NAME psql -U $USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
if [ "$DATABASE_EXISTS" = "1" ]; then
    echo "Database $DB_NAME already exists. Deleting..."
    docker exec $CONTAINER_NAME psql -U $USER -d postgres -c "DROP DATABASE $DB_NAME;"
fi

# データベース作成
echo "Creating database $DB_NAME..."
docker exec $CONTAINER_NAME psql -U $USER -d postgres -c "CREATE DATABASE $DB_NAME;"

# テーブルの存在確認と削除
TABLE_EXISTS=$(docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -tAc "SELECT 1 FROM information_schema.tables WHERE table_name='users'")
if [ "$TABLE_EXISTS" = "1" ]; then
    echo "Table users already exists. Deleting..."
    docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "DROP TABLE users;"
fi

# テーブル作成
echo "Creating table users..."
docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(100) UNIQUE NOT NULL);"


# # PostgreSQLのコンテナ名
# CONTAINER_NAME="postgres"
# USER="user"
# DB_NAME="ft_test"

# # データベース作成
# docker exec -it $CONTAINER_NAME psql -U $USER -d postgres -c "CREATE DATABASE $DB_NAME;"

# # テーブル作成
# docker exec -it $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(100) UNIQUE NOT NULL);"

# # レコード挿入
# docker exec -it $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "INSERT INTO users (username, email) VALUES ('キュアブラック', '黒@トランプ王国.com');"
# docker exec -it $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "INSERT INTO users (username, email) VALUES ('キュアホワイト', '白@トランプ王国.com');"

# # データ表示
# docker exec -it $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "SELECT * FROM users;"

# # レコード削除
# docker exec -it $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "DELETE FROM users WHERE username = 'キュアブラック';"
# docker exec -it $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "DELETE FROM users WHERE username = 'キュアホワイト';"

# # データ表示（レコードが削除されたことを確認）
# docker exec -it $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "SELECT * FROM users;"