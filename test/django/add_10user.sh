#!/bin/bash
# test/django/add_10user.sh
#!/bin/bash

# docker exec -it -w /code uwsgi-django python manage.py makemigrations trans_pj
# docker exec -i -w /code uwsgi-django python manage.py migrate > /dev/null 2>&1

for i in {1..2}
do
    docker exec -i -w /code uwsgi-django python manage.py add_samples
    # docker exec -i -w /code uwsgi-django /bin/bash -c "export DJANGO_SETTINGS_MODULE=trans_pj.settings && python manage.py add_samples"
    
    sleep 1
done
