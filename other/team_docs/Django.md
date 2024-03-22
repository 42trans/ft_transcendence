# team_docs/Django

## Blockchain

- [Blockchain.md](Blockchain.md)

- 表示が小さい場合は、文字を拡大する時と同じ方法で、`⌘ or Ctrl` + `+` で拡大してご覧ください。
  - もしくは編集画面で ⌘+クリック で画像ファイルを表示して　虫眼鏡で拡大

- 最新  
  - ローカルテストネットワークの関数を共通化したので、ディレクトリを変えて１箇所にまとめました。
![alt text](<img/スクリーンショット 2024-03-21 22.42.28.png>)

- 変更前  
![alt text](<img/スクリーンショット 2024-03-21 11.52.21.png>)

## 方針

- Docker hub公式イメージのソースをカスタマイズして使う
- uWSGIサーバー上で Django
  - 多機能
  - CのOSS
- 静的ページ作成(html,css), 3Dは別コンテナに
- ドキュメント作成は Gitbookに対応するものを使用する（mdを標準とするツール）
  - Sphinx
    - `make sphinx_make_html`でbuild/にhtmlファイルを作成
    - .gitignoreしてます

## 作業ログ

- inception基準でプロトタイプ作成
- 2/29 コンテナ間でcurlが通らなくて一日ハマり。
  - 1から別コンテナ作ってシンプルな構成でチェックした
  - socket,httpの両方を.initに記載することで解決
  - prometheusは別の.mdで
- python-logstash install
  - 'version': 1,　1行目にないと500出る
    - 参考:【django log を elasticsearch に入れる python-logstash 使い方 #Django - Qiita】 https://qiita.com/uturned0/items/87982e34b0de9cc9a774
  - 参考:【python-logstash · PyPI】 https://pypi.org/project/python-logstash/
- Hardhat経由でganacheのテストネットに保存
- gitbookに対応させるドキュメントを考慮
  - 参考:【ふだん Markdown を書く技術者のための reStructuredText 文法まとめ】 https://gotohayato.com/content/464/
  
## memo

- pythonのコンテナを立てる。django単体のimageはない。

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

## hardhat関連

- モデル
- シリアライザ
- ビュー
- API
- 認証
- log



