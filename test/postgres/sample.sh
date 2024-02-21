#!/bin/bash

# PostgreSQLのコンテナ名
CONTAINER_NAME="postgres"
USER="user"

# データベース作成
echo "Creating database..."
docker exec -it $CONTAINER_NAME psql -U $USER -d postgres -c "CREATE DATABASE mydatabase;"

# テーブル作成
echo "Creating table..."
docker exec -it $CONTAINER_NAME psql -U $USER -d mydatabase -c "CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(100) UNIQUE NOT NULL);"

# レコード挿入
echo "Inserting records..."
docker exec -it $CONTAINER_NAME psql -U $USER -d mydatabase -c "INSERT INTO users (username, email) VALUES ('user1', 'user1@example.com');"
docker exec -it $CONTAINER_NAME psql -U $USER -d mydatabase -c "INSERT INTO users (username, email) VALUES ('user2', 'user2@example.com');"

# データ表示
echo "Displaying data..."
docker exec -it $CONTAINER_NAME psql -U $USER -d mydatabase -c "SELECT * FROM users;"
