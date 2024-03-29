#!/bin/bash
# test/grafana/sample_grafana.sh

# 参考:【API チュートリアル: 組織のサービス アカウント トークンとダッシュボードを作成する | Grafana のドキュメント】 <https://grafana.com/docs/grafana/latest/developers/http_api/create-api-tokens-for-org/>

# 組織名 apiorg を変える
curl -X POST -H "Content-Type: application/json" -d '{"name":"apiorg"}' http://adm:adm@localhost:3032/api/orgs
# expected:
# {"message":"Organization created","orgId":2}%    
# or
# {"message":"Organization name taken","traceID":""}%

curl -X POST -H "Content-Type: application/json" -d '{"name":"test", "role": "Admin"}' http://adm:adm@localhost:3032/api/serviceaccounts
# expected:
# {"id":2,"name":"test","login":"sa-test","orgId":1,"isDisabled":false,"role":"Admin","tokens":0,"avatarUrl":""}%      

curl -X POST -H "Content-Type: application/json" -d '{"name":"test", "role": "Admin"}' http://adm:adm@localhost:3032/api/serviceaccounts

# curl -X POST -H "Content-Type: application/json" -d '{"name":"test-token"}' http://admin:admin@localhost:3000/api/serviceaccounts/<service account id>/tokens
# <service account id>: 直前のレスポンスのid
curl -X POST -H "Content-Type: application/json" -d '{"name":"test-token"}' http://adm:adm@localhost:3032/api/serviceaccounts/2/tokens
# {"id":1,"name":"test-token","key":"glsa_TxhtHAo2iB1ZrrN0eMO3qX54zj8jLSKJ_43fa819e"}%                   