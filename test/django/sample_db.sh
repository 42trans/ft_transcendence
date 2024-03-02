#!/bin/bash
#=======================================================
# include
#=======================================================
TEST_DIR="test/"
if [ -z "$COLOR_SH" ]; then
  source "${TEST_DIR}color.sh"
  COLOR_SH=true
fi
# --------------------------------
# memo : マイグレーションディレクトリ作成時のコマンド
# --------------------------------
# docker exec -it -w /code uwsgi-django python manage.py makemigrations trans_pj
# docker exec -it -w /code uwsgi-django python manage.py migrate
# コンテナに入ってサンプル作成
# docker exec -it -w /code uwsgi-django python manage.py shell
# from trans_pj.models import Sample
# Sample.objects.create(name='Test Sample', description='This is a test sample.')

# --------------------------------
# マイグレーションの適用
# --------------------------------
# -i: コマンドをインタラクティブモードで実行
# -w /code: コマンドを実行する際の作業ディレクトリを /code に設定
# python manage.py migrate: Django の manage.py スクリプトを使用して migrate コマンドを実行し、データベースに対してマイグレーションを適用
docker exec -i -w /code uwsgi-django python manage.py migrate > /dev/null 2>&1

# --------------------------------
# データベース接続テスト
# --------------------------------
# TEST_RESULT=$(...): コマンドの実行結果を変数 TEST_RESULT に格納
# docker exec -i -w /code uwsgi-django /bin/bash -c "...": uwsgi-django コンテナ内の /code ディレクトリで、/bin/bash -c "..." コマンドを実行します。
# export DJANGO_SETTINGS_MODULE=trans_pj.settings: Django 設定モジュールのパスを環境変数 DJANGO_SETTINGS_MODULE に設定
# python manage.py shell -c "...": Django のシェルを使用して、指定されたPythonコードを実行
# from django.db import connections: Django のデータベース接続をインポート
# connections['default'].cursor(): デフォルトのデータベース接続を取得し、カーソルを開く

# if [[ $TEST_RESULT == *"success"* ]]; then
TEST_RESULT=$(docker exec -i -w /code uwsgi-django /bin/bash -c \
"export DJANGO_SETTINGS_MODULE=trans_pj.settings && \
python manage.py shell -c \
\"from django.db import connections, transaction; \
from django.core.management import call_command; \
cursor = connections['default'].cursor(); \
cursor.execute('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\';'); \
tables = cursor.fetchall(); \
if ('trans_pj_sample',) not in tables: \
    cursor.execute('DROP TABLE IF EXISTS trans_pj_sample CASCADE'); \
    print('Previous table dropped.'); \
    call_command('makemigrations', 'trans_pj'); \
    call_command('migrate', 'trans_pj'); \
from trans_pj.models import Sample; \
Sample.objects.create(name='Test Sample', description='This is a test sample.'); \
print('New table created and sample data inserted.'); \
transaction.commit();\"" 2>&1)

if [[ $TEST_RESULT == *"New table created and sample data inserted."* ]]; then
    echo "${ESC}${GREEN}"
    echo "ok"
    echo "${ESC}${COLOR180}"

else
    echo "${ESC}${RED}"
    echo "ng: $TEST_RESULT"
    echo "${ESC}${COLOR180}"
fi


# for i in {1..2}
# do
#     docker exec -i -w /code uwsgi-django python /code/trans_pj/scripts/add_users.py
#     sleep 1
# done
