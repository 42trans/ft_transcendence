# team_docs/nginx

## 方針

- webserv,inceptionの使い回しからスタート

## memo

- log
  - 参考:【ロギングの構成 | NGINX ドキュメント】 https://docs.nginx.com/nginx/admin-guide/monitoring/logging/
- .make_env の SERVE_NAME を反映するために .conf.tpl を使用する(envsubst)