# team_docs/Django

## 方針
- Docker hub公式イメージのソースをカスタマイズして使う
- uWSGIを選択
  - 多機能
  - CのOSS

## memo
- pythonのコンテナを立てる。django単体のimageはない

## 参考資料
- DL: dockerfile, entrypoint.sh 
  - ここからclone(DL)しました 
    - dockerhub
      - 参考:【python/3.12/bullseye/Dockerfile at eba24df439d48988302a60cf9ef5cddd5d49b51f · docker-library/python】 https://github.com/docker-library/python/blob/eba24df439d48988302a60cf9ef5cddd5d49b51f/3.12/bullseye/Dockerfile
    - bootstrap
      - 解凍して ft_django_pj/staticに保存しただけ
      - 参考:【Download · Bootstrap v5.3】 https://getbootstrap.com/docs/5.3/getting-started/download/
- tutorial
	- 参考:【クィックスタート: Compose と Django — Docker-docs-ja 24.0 ドキュメント】 https://docs.docker.jp/compose/django.html
- その他
  - 参考:【DockerでDjango + NGINX + PostgreSQL開発環境構築 #Python - Qiita】 https://qiita.com/ftoshiki/items/1cb250a27bbbbaa5c719
  - Django
    - 参考:【クイックインストールガイド | Django ドキュメント | Django】 https://docs.djangoproject.com/ja/5.0/intro/install/
  - uWSGI
    - 参考:【uWSGI プロジェクト — uWSGI 2.0 ドキュメント】 https://uwsgi-docs.readthedocs.io/en/latest/index.html
    - 参考:【skel.c — uwsgi — Visual Studio Code — github+7b2276223a312c22726566223a7b2274797065223a322c226964223a2233363765366335343765373331313438353736356466336661333136333034643966643261373333227d7d】 https://github.dev/unbit/uwsgi/blob/367e6c547e7311485765df3fa316304d9fd2a733/core/skel.c#L5
    - 参考:【Docker Composeを使った、Nginx+uWSGI+Djangoのデプロイ - Djangoroidの奮闘記】 https://pythonskywalker.hatenablog.com/entry/2016/11/17/152830

## カスタマイズ内容

- サーバー起動の完了を(logを見なくても一目で)ホストに伝えるためにファイルを出力
  - mount先にfin_django_entrypoint.shを出力する