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
  - 動きがなくなって寂しいので @keyframes でslidupする動き(css+vanilla js)を加えた。
  参考:【CSS アニメーションの使用 - CSS: カスケーディングスタイルシート | MDN】 <https://developer.mozilla.org/ja/docs/Web/CSS/CSS_animations/Using_CSS_animations#%E3%82%AD%E3%83%BC%E3%83%95%E3%83%AC%E3%83%BC%E3%83%A0%E3%82%92%E7%94%A8%E3%81%84%E3%81%9F%E3%82%A2%E3%83%8B%E3%83%A1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E6%B5%81%E3%82%8C%E3%81%AE%E5%AE%9A%E7%BE%A9>