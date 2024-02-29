FROM python:3.12-bullseye
RUN apt-get update && apt-get install -y \
	tzdata \
	curl \
	net-tools \
	postgresql-client \
	&& rm -rf /var/lib/apt/lists/*
# 環境変数を設定（Pythonのバッファリングを無効化）
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED=1
RUN mkdir /code
WORKDIR /code
COPY requirements.txt /code/
RUN pip3 install -r requirements.txt

COPY . /tmp_ft_django
COPY static /tmp_static/
COPY uwsgi.ini /
COPY manage.py /

COPY django_entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["uwsgi","--ini","/etc/uwsgi/uwsgi.ini"]

