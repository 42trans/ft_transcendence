#!/bin/bash

# docker cp test/ELK/sample_logstash.sh elk-logstash-1:/sample_logstash.sh
# docker exec elk-logstash-1 bash /sample_logstash.sh



# docker exec -it elk-logstash-1 bash
#  lsof -i :5044


sh test/ELK/sample_logstash.sh