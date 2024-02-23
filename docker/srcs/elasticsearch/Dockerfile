# Elasticsearchのベースイメージ
FROM docker.elastic.co/elasticsearch/elasticsearch:8.12.1

# # CAとElasticsearchノードの証明書を生成するスクリプトを追加
# COPY gen_cert.sh /tmp/

# # 一時的にrootユーザーに切り替える
# USER root

# # 証明書生成スクリプトの実行権限を設定
# RUN chmod +x /tmp/gen_cert.sh 

# # スクリプトを実行
# RUN /tmp/gen_cert.sh

# 元のelasticsearchユーザーに戻す
# USER elasticsearch
