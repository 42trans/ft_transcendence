# team_docs/Prometheus,Grafana

- Prometheus
- Grafana

## 方針

- Docker hub公式イメージをそのまま使ってみるところから開始。
- 

## 作業
- exporter
  - nginx
    - 参考:【Ubuntu 18.04にPrometheusを導入してWebサーバー(nginx)の死活監視をしてみる #Ubuntu - Qiita】 https://qiita.com/naga3/items/4dc7929521c859078e9f
      - nginx.conf
        - stub_status on;のロケーションを追加

## 参考資料

- install, setup
  - 参考:【Ubuntu 18.04にPrometheusを導入してWebサーバー(nginx)の死活監視をしてみる #Ubuntu - Qiita】 https://qiita.com/naga3/items/4dc7929521c859078e9f
  - 参考:【nginxinc/nginx-prometheus-exporter: NGINX および NGINX Plus 用の NGINX Prometheus エクスポーター】 https://github.com/nginxinc/nginx-prometheus-exporter
  - DL  
    - docker hub からclone(DL)しました  
- tutorial
- その他

## カスタマイズ内容

