# docker/srcs/uwsgi_django/Dockerfile
FROM python:3.12-bullseye
RUN apt-get update && apt-get install -y \
	tzdata \
	curl \
	net-tools \
	postgresql-client \
	&& rm -rf /var/lib/apt/lists/*
# 環境変数を設定
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 作業ディレクトリを設定
WORKDIR /code

# 依存関係ファイルをコピーし、パッケージをインストール
COPY requirements.txt /code/
RUN pip install --no-cache-dir -r requirements.txt

# プロジェクトファイルをコピー
COPY . /code/

# uWSGIを設定
# CMD ["uwsgi", "--http", "0.0.0.0:8000", "--module", "uwsgi_django.wsgi:application", "--processes", "4", "--threads", "2"]
CMD ["uwsgi", "--ini", "/code/uwsgi.ini"]
