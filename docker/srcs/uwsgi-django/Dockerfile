# docker/srcs/uwsgi-django/Dockerfile
FROM python:3.12-slim-bullseye AS builder
#FROM python:3.12-slim-bullseye

RUN apt-get update && apt-get install -y \
#	net-tools \
#	iputils-ping \
#	telnet \
#	netcat \
#	lsof \
#	postgresql-client \
    gcc \
    libc6-dev \
    libpq-dev \
    python3-dev \
    libpcre3-dev \
	&& rm -rf /var/lib/apt/lists/*

# 環境変数を設定
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 作業ディレクトリを設定
WORKDIR /code

# 依存関係ファイルをコピーし、パッケージをインストール
COPY requirements.txt .

RUN pip install --upgrade pip && pip install --no-cache-dir -r /code/requirements.txt
# RUN pip install --no-cache-dir -r requirements.txt

# 不要なパッケージを削除
RUN apt-get purge -y --auto-remove gcc libc6-dev python3-dev

# プロジェクトファイルをコピー
COPY . .
RUN mv /code/django-entrypoint.sh /entrypoint.sh


# 実行ステージ
FROM python:3.12-slim-bullseye
RUN apt-get update && apt-get install -y \
	tzdata \
	curl \
    libpq5  \
	&& rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PATH="/usr/local/bin:${PATH}"

WORKDIR /code

# ビルドステージから必要なファイルをコピー
COPY --from=builder /usr/local /usr/local
COPY --from=builder /code /code
COPY --from=builder /entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh
ENTRYPOINT [ "/entrypoint.sh" ]

CMD ["uwsgi", "--ini", "/code/uwsgi.ini"]
