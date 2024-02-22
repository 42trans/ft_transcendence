# team_docs/Django

## 方針

- Docker hub公式イメージのソースをカスタマイズ余地を残しつつも、そのまま使いたい。
  - 最新版を使う。
    - Elasticsearch 8.12

## memo

-  

## 参考資料

- install, setup
  - 参考:【Install Elasticsearch with Docker | Elasticsearch Guide [8.12] | Elastic】 https://www.elastic.co/guide/en/elasticsearch/reference/8.12/docker.html#_c_customized_image
  - DL  
    - ここからclone(DL)しました  
      - dockerhub  
        -   
- tutorial
  - 参考:【エラスティックサーチとは何ですか? | Elasticsearch ガイド [8.12] | 弾性のある】 https://www.elastic.co/guide/en/elasticsearch/reference/8.12/elasticsearch-intro.html  
- その他

## カスタマイズ内容

- サーバー起動の完了を(logを見なくても一目で)ホストに伝えるためにファイルを出力
  - マウント先に `/txt` を出力したい