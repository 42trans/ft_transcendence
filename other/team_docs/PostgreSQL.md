# team_docs/PostgreSQL

## TODO

- 本番環境では scram-sha-256
  - pg_hba.conf で設定する。entrypoint.shで追記の関数があるのでそこに記述するのが良さそう

## 方針

- Docker hub公式イメージのソース（カスタマイズ可能にするため）を、そのままして使う
- 視覚化のためにpgadminを別コンテナにセット（要件外）

## test

- `sh test/postgres/sample.sh`  

## 参考資料

- dockerfile, entrypoint.sh  は、ここからclone(DL)しました  
  - postgres/15/bullseye/
    - 参考:【postgres/15/bullseye at 34d4c14c235806e57fdd5eaf197f718fccee93b0 · docker-library/postgres】 <https://github.com/docker-library/postgres/tree/34d4c14c235806e57fdd5eaf197f718fccee93b0/15/bullseye>
      - dockerhub
        - 参考:【postgres - Official Image | Docker Hub】 <https://hub.docker.com/_/postgres>
- tutorial
  - 参考:【チュートリアル】 <https://www.postgresql.jp/docs/9.4/tutorial.html>

