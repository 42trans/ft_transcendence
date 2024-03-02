# team_docs/testpageURL.md

- [port.md](port.md)

## frontend: 3030:3000

  - Node.js: three.js 
    - <http://localhost:3030/three.html>  
  <img src="img/スクリーンショット 2024-03-01 11.45.21.png" width="200" alt="alt">　　

## Grafana: 3032:3000

  - <http://localhost:3032/d/eb4247a4-92b0-49a0-ae9e-4c61257d88ad/new-dashboard?orgId=1>  
  <img src="img/スクリーンショット 2024-03-01 3.06.16.png" width="200" alt="alt">　　

## Prometheus 9091:9090

  - <http://localhost:9091/targets?search=#pool-node_exporter>  
  <img src="img/スクリーンショット 2024-03-01 3.43.25.png" width="170" alt="alt text" >　 　

## kibana 5602(or 5601):5601  

| HOME     | Dashbord NGINX | 
| :------- | :-------------- | 
|http://localhost:5601/| http://localhost:5601/app/dashboards#/view/046212a0-a2a1-11e7-928f-5dbe6f6f5519-ecs?_g=(filters:!(),refreshInterval:(pause:!t,value:60000),time:(from:now-15m,to:now)) |
| <img src="img/スクリーンショット 2024-03-01 13.03.58.png" width="170" alt="alt text" > |    <img src="img/スクリーンショット 2024-03-02 15.18.25.png" width="170" alt="alt text" >　　|


- Metrics/Exporter
  - elk
    - http://localhost:9114/metrics