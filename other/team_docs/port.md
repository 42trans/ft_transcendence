# ポート番号:  other/team_docs/port.md  

- 割り当て予定のリストです  
  - 未使用の場合もあります
- 設定ファイル
  - `init/.os_env_example` で編集してください
  - 最終的に `.env` に設定します。
- Docker側はデフォルトの値を採用してます

| type     | container_name        | mac  |Linux |Docker|   profile   |
| :------- | :-------------------- | ---: | ---: | ---: | :---------- |
|          | nginx                 |  443 |  443 |  443 |             |
|          | nginx stub_status     |      |      | 8095 |             |
| Web,3D   | frontend              | 3030 | 3030 | 3000 |             |
| 未 Web,3D| frontend/metrics      | 3091 | 3090 | 3001 |             |
| Web      | uwsgi-django/uWSGI    | 8086 | 8086 | 8000 |             |
| 未 Web   | uwsgi-django/http     | 8096 | 8096 | 8001 |             |
| Web      | postgres              | 5433 | 5433 | 5432 |             |
| Web      | pgadmin               | 8087 | 8087 |   80 |             |
| Web      | hardhat               | 3031 | 3031 | 8545 | Blockchain  |
| Web      | ganache               | 8555 | 8555 | 8545 | Blockchain  |
|          |                       |      |      |      |             |
| Devops   | elasticsearch         | 未9200 | 未9200 | 9200 | ELK      |
| Devops   | kibana                | 未5601 | 未5601 | 5601 | ELK      |
| Devops   | logstash              | 未5044 | 未5044 | 5044 | ELK      |
|          |                       |      |      |      |             |
| Devops   | prometheus            | 9091 | 9091 | 9090 | Monitor     |
| Devops   | grafana               | 3032 | 3032 | 3000 | Monitor     |
|          |                       |      |      |      |             |
|Exporter  | nginx_exporter        | 9113 | 9113 | 9113 | Monitor     |
|Exporter  | elasticsearch-exporter| 9114 | 9114 | 9114 | Monitor     |

## link

- [testpageURL.md](testpageURL.md)  
