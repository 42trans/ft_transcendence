#!/bin/bash
TEST_DIR="test/"
#=======================================================
# include
#=======================================================
if [ -z "$COLOR_SH" ]; then
  source "${TEST_DIR}color.sh"
  COLOR_SH=true
fi
#=======================================================
# PostgreSQLのコンテナ名
CONTAINER_NAME="postgres"
USER="postgres_user"
DB_NAME="ft_test"
TABLE_NAME="cures"

# データベースの存在確認と削除
DATABASE_EXISTS=$(docker exec $CONTAINER_NAME psql -U $USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
if [ "$DATABASE_EXISTS" = "1" ]; then
    # echo "DROP DATABASE $DB_NAME"
    docker exec $CONTAINER_NAME psql -U $USER -d postgres -c "DROP DATABASE $DB_NAME;"
fi

# データベース作成
# echo "CREATE DATABASE $DB_NAME"
docker exec $CONTAINER_NAME psql -U $USER -d postgres -c "CREATE DATABASE $DB_NAME;"

# テーブルの存在確認と削除
TABLE_EXISTS=$(docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -tAc "SELECT 1 FROM information_schema.tables WHERE table_name='users'")
if [ "$TABLE_EXISTS" = "1" ]; then
    # echo "DROP TABLE $TABLE_NAME"
    docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "DROP TABLE $TABLE_NAME;"
fi

# テーブル作成
# echo "CREATE TABLE $TABLE_NAME"
docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "CREATE TABLE $TABLE_NAME (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(100) UNIQUE NOT NULL);"

# レコード挿入
# echo "INSERT INTO $TABLE_NAME"
docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "INSERT INTO $TABLE_NAME (username, email) VALUES ('キュアブラック', '黒@トランプ王国.com');"
docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "INSERT INTO $TABLE_NAME (username, email) VALUES ('キュアホワイト', '白@トランプ王国.com');"

# データ表示
    echo "${ESC}${GREEN}"
# echo "SELECT * FROM $TABLE_NAME"
docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "SELECT * FROM $TABLE_NAME;"
    echo "${ESC}${COLOR198}"

# レコード削除
# echo "DELETE FROM $TABLE_NAME"
docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "DELETE FROM $TABLE_NAME WHERE username = 'キュアブラック';"
docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "DELETE FROM $TABLE_NAME WHERE username = 'キュアホワイト';"

# データ表示（レコードが削除されたことを確認）
    echo "${ESC}${GREEN}"

# echo "SELECT * FROM $TABLE_NAME"
docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "SELECT * FROM $TABLE_NAME;"
    echo "${ESC}${COLOR198}"
