# docker/srcs/uwsgi-django/Dockerfile
FROM python:3.12-bullseye
RUN apt-get update && apt-get install -y \
	tzdata \
	curl \
	net-tools \
	iputils-ping \
	telnet \
	netcat \
	lsof \
	postgresql-client \
	&& rm -rf /var/lib/apt/lists/*
# 環境変数を設定
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 作業ディレクトリを設定
# WORKDIR /code

# 依存関係ファイルをコピーし、パッケージをインストール
COPY requirements.txt /code/
RUN pip install -r /code/requirements.txt
# RUN pip install --no-cache-dir -r /code/requirements.txt

# プロジェクトファイルをコピー
COPY . /code/

COPY django-entrypoint.sh /entrypoint.sh
ENTRYPOINT [ "/entrypoint.sh" ]
CMD ["uwsgi", "--ini", "/code/uwsgi.ini"]
