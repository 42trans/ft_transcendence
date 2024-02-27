# team_docs/Monitor.md (Prometheus,Grafana)

- Prometheus
- Grafana

## 方針

- Docker hub公式イメージをそのまま使ってみるところから開始。
- 　

## 作業

- exporter
  - nginx
    - 参考:【Ubuntu 18.04にPrometheusを導入してWebサーバー(nginx)の死活監視をしてみる #Ubuntu - Qiita】 <https://qiita.com/naga3/items/4dc7929521c859078e9f>
      - nginx.conf
        - stub_status on;のロケーションを追加
        - 参考:【nginx-prometheus-exporterをインストールする - kk_AtakaのScrapbox】 <https://scrapbox.io/gosyujin/nginx-prometheus-exporter%E3%82%92%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB%E3%81%99%E3%82%8B>
        - 参考:【Module ngx_http_stub_status_module】 <https://nginx.org/en/docs/http/ngx_http_stub_status_module.html#stub_status>

## 参考資料

- install, setup
  - Prometheus
    - 参考:【Ubuntu 18.04にPrometheusを導入してWebサーバー(nginx)の死活監視をしてみる #Ubuntu - Qiita】 <https://qiita.com/naga3/items/4dc7929521c859078e9f>
    - 参考:【nginxinc/nginx-prometheus-exporter: NGINX および NGINX Plus 用の NGINX Prometheus エクスポーター】 <https://github.com/nginxinc/nginx-prometheus-exporter>
    - 参考:【nginxinc/nginx-prometheus-exporter: NGINX Prometheus Exporter for NGINX and NGINX Plus】 <https://github.com/nginxinc/nginx-prometheus-exporter>
  - Grafana
    - 参考:【Configure a Grafana Docker image | Grafana documentation】 <https://grafana.com/docs/grafana/latest/setup-grafana/configure-docker/>

- PromQL
  - 参考:【Querying basics | Prometheus】 <https://prometheus.io/docs/prometheus/latest/querying/basics/>

## カスタマイズ内容
