# team_docs/ELK

## 方針

- Docker hub公式イメージをそのまま使ってみるところから開始。少しずつカスタムしていきたい。
  - 最新版を使う。
    - Elasticsearch 8.12
      - kibana 上記に付属

## elasticsearch, kibana

- .envでSTACK_VERSION=8.12.1を指定
- 公式ドキュメントにしたが、.env .ymlを DLしてベースに使用

### 作業MEMO

- インストールガイド　公式
  - 参考:【Install Elasticsearch with Docker | Elasticsearch Guide [8.12] | Elastic】 <https://www.elastic.co/guide/en/elasticsearch/reference/8.12/docker.html>

## 参考資料

- 初歩: ELK Stackとは
  - 参考:【【初心者向け】Elastic Stackについて知ろう | DevelopersIO】 <https://dev.classmethod.jp/articles/elastic-stack-for-beginners/>
- install, setup
  - 参考:【Install Elasticsearch with Docker | Elasticsearch Guide [8.12] | Elastic】 <https://www.elastic.co/guide/en/elasticsearch/reference/8.12/docker.html#_c_customized_image>
  - DL  
    - docker hub からclone(DL)しました  
      - .env
        - 参考:【elasticsearch/docs/reference/setup/install/docker/docker-compose.yml at 8.12 · elastic/elasticsearch】 <https://github.com/elastic/elasticsearch/blob/8.12/docs/reference/setup/install/docker/docker-compose.yml>
      - .yml
        - 参考:【elasticsearch/docs/reference/setup/install/docker/.env at 8.12 · elastic/elasticsearch】 <https://github.com/elastic/elasticsearch/blob/8.12/docs/reference/setup/install/docker/.env>
- tutorial
  - 参考:【エラスティックサーチとは何ですか? | Elasticsearch ガイド [8.12] | 弾性のある】 <https://www.elastic.co/guide/en/elasticsearch/reference/8.12/elasticsearch-intro.html>  
- その他

## カスタマイズ内容

- サーバー起動の完了を(logを見なくても一目で)ホストに伝えるためにファイルを出力
  - マウント先に `/txt` を出力したい