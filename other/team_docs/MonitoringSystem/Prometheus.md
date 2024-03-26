# other/team_docs/MonitoringSystem/Prometheus.md

## exporter

- Django
  - 設定はここの通りに
    - 参考:【korfuri/django-prometheus: Export Django monitoring metrics for Prometheus.io】 https://github.com/korfuri/django-prometheus
  - 参考にしたもの
    - 参考:【korfuri/django-prometheus: Prometheus.io の Django モニタリング メトリクスをエクスポートする】 https://github.com/korfuri/django-prometheus
    - 参考:【uwsgi を使用して Django で実行する · 問題 #35 · korfuri/django-prometheus】 https://github.com/korfuri/django-prometheus/issues/35
- nginx
  - 参考:【Ubuntu 18.04にPrometheusを導入してWebサーバー(nginx)の死活監視をしてみる #Ubuntu - Qiita】 <https://qiita.com/naga3/items/4dc7929521c859078e9f>
    - nginx.conf
      - stub_status on;のロケーションを追加
      - 参考:【nginx-prometheus-exporterをインストールする - kk_AtakaのScrapbox】 <https://scrapbox.io/gosyujin/nginx-prometheus-exporter%E3%82%92%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB%E3%81%99%E3%82%8B>
      - 参考:【Module ngx_http_stub_status_module】 <https://nginx.org/en/docs/http/ngx_http_stub_status_module.html#stub_status>

### 参考資料:install, setup

- install, setup
  - Prometheus
    - 参考:【Ubuntu 18.04にPrometheusを導入してWebサーバー(nginx)の死活監視をしてみる #Ubuntu - Qiita】 <https://qiita.com/naga3/items/4dc7929521c859078e9f>
    - 参考:【nginxinc/nginx-prometheus-exporter: NGINX および NGINX Plus 用の NGINX Prometheus エクスポーター】 <https://github.com/nginxinc/nginx-prometheus-exporter>
    - 参考:【nginxinc/nginx-prometheus-exporter: NGINX Prometheus Exporter for NGINX and NGINX Plus】 <https://github.com/nginxinc/nginx-prometheus-exporter>
    - 参考:【Configuration | Prometheus】 https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config
    - 参考:【リリース 2.50 の prometheus/config/testdata/conf.good.yml · prometheus/prometheus】 https://github.com/prometheus/prometheus/blob/release-2.50/config/testdata/conf.good.yml
    - 参考:【Prometheus.ymlの記述内容を解説する #初心者向け - Qiita】 https://qiita.com/mtsiga/items/f456721149f863ac0346

- PromQL
  - 参考:【Querying basics | Prometheus】 <https://prometheus.io/docs/prometheus/latest/querying/basics/>
