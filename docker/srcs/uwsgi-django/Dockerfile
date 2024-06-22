# docker/srcs/uwsgi-django/Dockerfile
FROM python:3.12-slim-bullseye AS builder

RUN apt-get update && apt-get install -y \
    gcc \
    libc6-dev \
    libpq-dev \
    python3-dev \
    libpcre3-dev \
    gettext \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# 環境変数を設定
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV UWSGI_PROFILE_OVERRIDE=ssl=true

# 作業ディレクトリを設定
WORKDIR /code

# 依存関係ファイルをコピーし、パッケージをインストール
COPY requirements.txt .

RUN pip install --upgrade pip && pip install --no-cache-dir -r /code/requirements.txt
RUN pip install django-cors-headers

# 不要なパッケージを削除
RUN apt-get purge -y --auto-remove gcc libc6-dev python3-dev

# プロジェクトファイルをコピー
COPY . .


# 実行ステージ ###################################################################
FROM python:3.12-slim-bullseye

RUN apt-get update && apt-get install -y \
	tzdata \
	curl \
    libpq5  \
    supervisor \
    chromium \
    chromium-driver \
    net-tools \
    postgresql-client \
	&& rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PATH="/usr/local/bin:${PATH}"

WORKDIR /code

# ビルドステージから必要なファイルをコピー
COPY --from=builder /usr/local /usr/local
COPY --from=builder /code /code

RUN mv /code/django-entrypoint.sh /entrypoint.sh
RUN mv /code/supervisord.conf /etc/supervisor/conf.d/

RUN chmod +x /entrypoint.sh
ENTRYPOINT [ "/entrypoint.sh" ]

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
