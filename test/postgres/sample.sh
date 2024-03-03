#!/bin/bash
#=======================================================
TEST_DIR="test/"
# include
#=======================================================
if [ -z "$COLOR_SH" ]; then
  source "${TEST_DIR}color.sh"
  COLOR_SH=true
fi
#=======================================================
echo -e 'cmd: docker ps | grep " postgres "\n'
docker ps | grep " postgres "
echo ""
#=======================================================

# PostgreSQLのコンテナ名
CONTAINER_NAME="postgres"
USER="postgres_user"
DB_NAME="sample_test_cures"
TABLE_NAME="table_cures"

# データベースの存在確認と削除
DATABASE_EXISTS=$(docker exec $CONTAINER_NAME psql -U $USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
if [ "$DATABASE_EXISTS" = "1" ]; then
    # echo "DROP DATABASE $DB_NAME"
    docker exec $CONTAINER_NAME psql -U $USER -d postgres -c "DROP DATABASE $DB_NAME;" >/dev/null
fi

# データベース作成
# echo "CREATE DATABASE $DB_NAME"
docker exec $CONTAINER_NAME psql -U $USER -d postgres -c "CREATE DATABASE $DB_NAME;" >/dev/null

# テーブルの存在確認と削除
TABLE_EXISTS=$(docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -tAc "SELECT 1 FROM information_schema.tables WHERE table_name='users'" >/dev/null)
if [ "$TABLE_EXISTS" = "1" ]; then
    # echo "DROP TABLE $TABLE_NAME"
    docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "DROP TABLE $TABLE_NAME;" >/dev/null
fi

# テーブル作成
# echo "CREATE TABLE $TABLE_NAME"
docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "CREATE TABLE $TABLE_NAME (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(100) UNIQUE NOT NULL);" >/dev/null

# レコード挿入
# echo "INSERT INTO $TABLE_NAME"
docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "INSERT INTO $TABLE_NAME (username, email) VALUES ('キュアブラック', '黒@トランプ王国.com');" >/dev/null
docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "INSERT INTO $TABLE_NAME (username, email) VALUES ('キュアホワイト', '白@トランプ王国.com');" >/dev/null

# データ表示
    echo "${ESC}${GREEN}"
# echo "SELECT * FROM $TABLE_NAME"
docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "SELECT * FROM $TABLE_NAME;"
    echo "${ESC}${COLOR201}"

# レコード削除
# echo "DELETE FROM $TABLE_NAME"
docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "DELETE FROM $TABLE_NAME WHERE username = 'キュアブラック';"
docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "DELETE FROM $TABLE_NAME WHERE username = 'キュアホワイト';"

# データ表示（レコードが削除されたことを確認）
    echo "${ESC}${GREEN}"

# echo "SELECT * FROM $TABLE_NAME"
docker exec $CONTAINER_NAME psql -U $USER -d $DB_NAME -c "SELECT * FROM $TABLE_NAME;"
    echo "${ESC}${COLOR201}"
