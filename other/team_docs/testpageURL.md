# team_docs/testpageURL.md

- [port.md](port.md)

## frontend: 3030:3000

- Node.js: three.js
  - <http://localhost:3030/three.html>  
  <img src="img/スクリーンショット 2024-03-01 11.45.21.png" width="200" alt="alt">　　

## Django: <https://localhost/>

- <https://localhost/>  
  <img src="img/スクリーンショット 2024-03-03 23.51.07.png" width="200" alt="alt">　　

## pgadmin: 8087:80

- <http://localhost:8087/>  
  <img src="img/スクリーンショット 2024-03-07 0.38.26.png" width="200" alt="alt">　　

## kibana 5602(or 5601):5601  

| HOME     | Dashbord NGINX, Django |  
| :------- | :-------------- |  
|<http://localhost:5601/>| <http://localhost:5601/s/ft/app/dashboards#/view/ca95a493-b3d0-403d-b265-c3d94fcdebd9?_g=(filters:!(),refreshInterval:(pause:!t,value:60000),time:(from:now-15m,to:now))> |
| <img src="img/スクリーンショット 2024-03-01 13.03.58.png" width="170" alt="alt text" > |    <img src="img/スクリーンショット 2024-03-02 15.18.25.png" width="170" alt="alt text" >　　|  

## kind Grafana: 3000
- 開発時: ポートフォーワードで一時的に接続( Ingressに変更予定)
  - 下記をホストマシンで実行してから、リンクをクリックしてください
```
kubectl port-forward service/grafana 3000:80 &
kubectl port-forward service/prometheus-server  9090:80 &
```
- <http://localhost:3000/d/rYdddlPWk/node-exporter-full-and-k8s-containers?orgId=1>  
  <img src="img/スクリーンショット 2024-03-07 1.02.19.png" width="200" alt="alt">　　

## kind Prometheus: 9090

- <http://localhost:9090/targets?search=>  
  <img src="img/スクリーンショット 2024-03-07 0.58.36.png" width="200" alt="alt">　　

## Docker Grafana: 3032:3000

- <http://localhost:3032/d/eb4247a4-92b0-49a0-ae9e-4c61257d88ad/new-dashboard?orgId=1>  
  <img src="img/スクリーンショット 2024-03-01 3.06.16.png" width="200" alt="alt">　　

## Docker Prometheus 9091:9090

- <http://localhost:9091/targets?search=#pool-node_exporter>  
  <img src="img/スクリーンショット 2024-03-01 3.43.25.png" width="170" alt="alt text" >

## Metrics/Exporter

- elk
  - <http://localhost:9114/metrics>
