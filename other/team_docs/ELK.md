# team_docs/ELK

## 方針

- Docker hub公式イメージをそのまま使ってみるところから開始。少しずつカスタムしていきたい。
  - currentを使う。
    - Elasticsearch 8.12
      - kibana 上記に付属
    - Logstash 8.12.1

## elasticsearch, kibana

- .envでSTACK_VERSION=8.12.1を指定
- 公式ドキュメントにしたがって、.env .ymlを DLしてベースに使用してplay後に
  - コンテナが3つは多いので一つに減
  - 名称がわかりづらいので変更
  - entorypoint.shでsetupを行うことにした。(inceptionのように)が、どうあっても（何もしないentrypoint.shでも）バグる。
  - なので、Dockerfileだけでやれることに止めるべき。
    - 試行錯誤の結果、ここに近い感じになった
      - 参考:【[v8.6] Elasticsearch/Kibanaをdocker-composeでインストールする手順（試用用途） #docker-compose - Qiita】 https://qiita.com/takeo-furukubo/items/c2f194679afadc06a4e9

## Logstash
- install
  - 参考:【Running Logstash on Docker | Logstash Reference [8.12] | Elastic】 https://www.elastic.co/guide/en/logstash/current/docker.html
- config  
  - 参考:【Configuring Logstash for Docker | Logstash Reference [8.12] | Elastic】 https://www.elastic.co/guide/en/logstash/current/docker-config.html
  - 参考:【logstash.yml | Logstash Reference [8.12] | Elastic】 https://www.elastic.co/guide/en/logstash/8.12/logstash-settings-file.html 

## 参考資料

- 初歩: ELK Stackとは
  - 参考:【【初心者向け】Elastic Stackについて知ろう | DevelopersIO】 <https://dev.classmethod.jp/articles/elastic-stack-for-beginners/>
- install, setup
  - 参考:【Install Elasticsearch with Docker | Elasticsearch Guide [8.12] | Elastic】 <https://www.elastic.co/guide/en/elasticsearch/reference/8.12/docker.html>
  - 参考:【Running Logstash on Docker | Logstash Reference [8.12] | Elastic】 https://www.elastic.co/guide/en/logstash/8.12/docker.html
  - 参考:【Install Elasticsearch with Docker | Elasticsearch Guide [8.12] | Elastic】 <https://www.elastic.co/guide/en/elasticsearch/reference/8.12/docker.html#_c_customized_image>
  - DL  
    - docker hub からclone(DL)しました  
      - .yml
        - 参考:【elasticsearch/docs/reference/setup/install/docker/docker-compose.yml at 8.12 · elastic/elasticsearch】 <https://github.com/elastic/elasticsearch/blob/8.12/docs/reference/setup/install/docker/docker-compose.yml>
      - .env
        - 参考:【elasticsearch/docs/reference/setup/install/docker/.env at 8.12 · elastic/elasticsearch】 <https://github.com/elastic/elasticsearch/blob/8.12/docs/reference/setup/install/docker/.env>
- tutorial
  - 参考:【エラスティックサーチとは何ですか? | Elasticsearch ガイド [8.12] | 弾性のある】 <https://www.elastic.co/guide/en/elasticsearch/reference/8.12/elasticsearch-intro.html>  
- その他

## カスタマイズ内容
- 公式の.ymlからサーバー数を1に減
- kibana, logsteash
  - サーバー起動の完了を(logを見なくても一目で)ホストに伝えるためにファイルを出力
