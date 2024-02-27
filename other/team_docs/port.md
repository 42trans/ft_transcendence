# ポート番号  

- 割り当て予定のリストです  
- 未使用の場合もあります
- 最終的に `.make_env` に設定し、 `set_env` で使用
- Docker側はデフォルトの値を採用してます

| type   | container_name    | mac  |Linux |Docker|   profile   |
| :----- | :---------------- | ---: | ---: | ---: | :---------- |
|        | nginx             |  443 |  443 |  443 |             |
|        | nginx stub_status |      |      | 8095 |             |
| Web    | frontend          | 3030 | 3030 | 3000 |             |
| Web    | ft_django         | 8086 | 8086 | 8080 |             |
| Web    | postgres          | 5433 | 5433 | 5432 |             |
| Web    | pgadmin           | 8087 | 8087 |   80 | Debug       |
| Web    | hardhat           | 3031 | 3031 | 3000 | Blockchain  |
|        |                   |      |      |      |             |
| Devops | elasticsearch     | 9201 | 9201 | 9200 | ELK         |
| Devops | kibana            | 5602 | 5602 | 5601 | ELK         |
| Devops | logstash          | 5045 | 5045 | 5044 | ELK         |
|        |                   |      |      |      |             |
| Devops | prometheus        | 9091 | 9091 | 9091 | Monitor     |
| Devops | grafana           | 3032 | 3032 | 3000 | Monitor     |
|        |                   |      |      |      |             |
|Exporter| nginx_exporter    | 9113 | 9113 | 9113 | Monitor     |
