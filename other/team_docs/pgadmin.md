# team_docs/pgadmin.md

## 方針

- Docker hub公式イメージをそのまま使う

## memo

- 接続はコンテナ名で
  - ホスト名
    - postgres
  - ポート番号
    - 5432
  - 管理用データベース
    - $POSTGRES_DBの内容を記載 例:ft_trans_db
  - ユーザー名
    - POSTGRES_USERの内容を記載

## 参考資料

- その他
  - 参考:【コンテナのデプロイメント — pgAdmin 4 8.3 ドキュメント】 https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html

## カスタマイズ内容

