FROM python:3.12-bullseye
RUN apt-get update && apt-get install -y tzdata && rm -rf /var/lib/apt/lists/*

ENV PYTHONBURRERED=1
RUN mkdir /code
WORKDIR /code
COPY requirements.txt /code/
RUN pip3 install -r requirements.txt
COPY . /code/
COPY django_entrypoint.sh /entrypoint.sh
COPY manage.py /manage.py
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["uwsgi","--ini","/etc/uwsgi/uwsgi.ini"]
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]