# UI/UX Pong Game app

## 重要

- pongアプリのcss,jsの自動認識する保存場所
  - pong/static/ 
- 開発時挙動確認用サーバー ホストから直接Djangoに接続（nginx, uwsgiサーバーを経由しない）
  - ファイル更新が即時反映されます
  - `make run_django_server` or
    - docker exec -it uwsgi-django bash -c "python manage.py runserver 0.0.0.0:8002"
  - http://localhost:8002/

## 作業メモ

- テンプレート拾ってきて、どういうものか勉強
  - それのCSS（色とかレイアウト）はそのまま活用し、jqueryをはずした