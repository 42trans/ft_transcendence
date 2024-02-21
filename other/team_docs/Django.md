# team_docs/Django

## 方針
- Docker hub公式イメージのソースをカスタマイズして使う

## 参考資料
- DL: dockerfile, entrypoint.sh 
  - ここからclone(DL)しました 
    - dockerhub
- tutorial
	- 参考:【クィックスタート: Compose と Django — Docker-docs-ja 24.0 ドキュメント】 https://docs.docker.jp/compose/django.html

## カスタマイズ内容

### commit
- サーバー起動の完了を(logを見なくても一目で)ホストに伝えるためにファイルを出力
  - mount先にfin_django_entrypoint.shを出力する