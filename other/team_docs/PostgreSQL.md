# team_docs/PostgreSQL

## 方針
- Docker hub公式イメージのソースをカスタマイズして使う
  - 公式imageをそのまま利用するのが基本で、課題用に少し変える感じでいけたら

## 参考資料
- dockerfile, entrypoint.sh 
  - postgres/15/bullseye/
  - ここからclone(DL)しました 
    - 参考:【postgres/15/bullseye at 34d4c14c235806e57fdd5eaf197f718fccee93b0 · docker-library/postgres】 https://github.com/docker-library/postgres/tree/34d4c14c235806e57fdd5eaf197f718fccee93b0/15/bullseye
    - dockerhub
      - 参考:【postgres - Official Image | Docker Hub】 https://hub.docker.com/_/postgres
- tutorial
  - 参考:【チュートリアル】 https://www.postgresql.jp/docs/9.4/tutorial.html

## カスタマイズ内容
- コミット `abcd372e902c5ac9f0b6017f7a40a0947b8c7d19`
  - 環境変数 POSTGRES_HOST_AUTH_METHOD
    - pg_hba.conf を.envで指定した内容に切り替える
    - 理由
      - 開発時はorーカルからのアクセスをtrustにするため
      - 本番環境では scram-sha-256 想定（rtustではwarningが出る） 
  - サーバー起動の完了を(logを見なくても一目で)ホストに伝えるためにファイルを出力
    - mount先にfin_postgres_entrypoint.shを出力することにした  