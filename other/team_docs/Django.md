# team_docs/Django

## 方針
- Docker hub公式イメージのソースをカスタマイズして使う

## memo
- pythonのコンテナを立てる。django単体のimageはない

## 参考資料
- DL: dockerfile, entrypoint.sh 
  - ここからclone(DL)しました 
    - dockerhub
      - 参考:【python/3.12/bullseye/Dockerfile at eba24df439d48988302a60cf9ef5cddd5d49b51f · docker-library/python】 https://github.com/docker-library/python/blob/eba24df439d48988302a60cf9ef5cddd5d49b51f/3.12/bullseye/Dockerfile
- tutorial
	- 参考:【クィックスタート: Compose と Django — Docker-docs-ja 24.0 ドキュメント】 https://docs.docker.jp/compose/django.html

## カスタマイズ内容

### commit
- サーバー起動の完了を(logを見なくても一目で)ホストに伝えるためにファイルを出力
  - mount先にfin_django_entrypoint.shを出力する