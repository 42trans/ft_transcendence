# memo

## cmd

- 中にはいる
  - docker exec -it uwsgi-django bash  
- モデルの変更をデータベースに適用  
`python manage.py makemigrations`
`python manage.py migrate`
- 静的ファイルの生成  
`python manage.py collectstatic`  
