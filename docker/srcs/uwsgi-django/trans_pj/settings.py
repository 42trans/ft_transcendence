# docker/srcs/uwsgi-django/trans_pj/settings.py
"""
Django settings for trans_pj project.

Generated by 'django-admin startproject' using Django 5.0.2.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

import os
import json
from datetime import timedelta
from pathlib import Path
from django.core.exceptions import ImproperlyConfigured
from django.utils.translation import gettext_lazy as _

def get_env_variable(var_name):
	try:
		value = os.environ[var_name]
		if value == '':
			raise ValueError
		# print(f"ov_env: {var_name} = {value}")
		return value
	except KeyError:
		raise ImproperlyConfigured(f'{var_name} undefined')
	except ValueError:
		raise ImproperlyConfigured(f'{var_name} empty')


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = get_env_variable('DJANGO_SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False
# DEBUG = True

# ALLOWED_HOSTS = ['*']
# ALLOWED_HOSTS = ['localhost']
ALLOWED_HOSTS = [
	'localhost',
	'127.0.0.1',
	'hioikawa.42.fr',
	'nginx',
	'postgres',
	'vite',
	'uwsgi-django'
]


# Application definition
INSTALLED_APPS = [
	'daphne',							# chat, listed before django.contrib.staticfiles
	'django.contrib.admin',
	'django.contrib.auth',
	'django.contrib.contenttypes',
	'django.contrib.sessions',
	'django.contrib.messages',
	'django.contrib.staticfiles',
	'pong',
	'django_prometheus',
	'accounts',  # user_accounts
	'django_otp',  						# 2fa
	'django_otp.plugins.otp_totp',  	# 2fa
	'django_otp.plugins.otp_static',  	# 2fa
	'channels',							# chat
	'chat',								# chat
  'trans_pj',
  'corsheaders', #CORS用
]


FT_CLIENT_ID = get_env_variable('FT_UID')
FT_SECRET = get_env_variable('FT_SECRET')


MIDDLEWARE = [
    # CORS用 ------------
	"corsheaders.middleware.CorsMiddleware",
	# Prometheus----------
	'django_prometheus.middleware.PrometheusBeforeMiddleware',
	# --------------------
	'django.middleware.security.SecurityMiddleware',
	'django.contrib.sessions.middleware.SessionMiddleware',
	"django.middleware.locale.LocaleMiddleware",
	'django.middleware.common.CommonMiddleware',
	'django.middleware.csrf.CsrfViewMiddleware',
	'django.contrib.auth.middleware.AuthenticationMiddleware',
	'django.contrib.messages.middleware.MessageMiddleware',
	'django.middleware.clickjacking.XFrameOptionsMiddleware',
	# Prometheus----------
	'django_prometheus.middleware.PrometheusAfterMiddleware',
	# --------------------
	'django_otp.middleware.OTPMiddleware',  # 2fa
	'accounts.middleware.JWTAuthenticationMiddleware',	# jwt
	'accounts.middleware.DisableCSRFForJWT',
]


AUTHENTICATION_BACKENDS = [
	'accounts.authentication_backend.JWTAuthenticationBackend',
	'django.contrib.auth.backends.ModelBackend',  # Optional
]


SIMPLE_JWT = {
	# 'ACCESS_TOKEN_LIFETIME': timedelta(seconds=10),  # テスト用
	# 'REFRESH_TOKEN_LIFETIME': timedelta(seconds=60),  # テスト用
	'ACCESS_TOKEN_LIFETIME': timedelta(hours=12),  # アクセストークンの有効期間
	'REFRESH_TOKEN_LIFETIME': timedelta(days=1),  # リフレッシュトークンの有効期間
	'ROTATE_REFRESH_TOKENS': True,
	'BLACKLIST_AFTER_ROTATION': True,
	'UPDATE_LAST_LOGIN': False,

	'ALGORITHM': 'HS256',
	'SIGNING_KEY': SECRET_KEY,
	'VERIFYING_KEY': None,
	'AUDIENCE': None,
	'ISSUER': None,
	'JWK_URL': None,
	'LEEWAY': 0,
}


OTP_TOTP_ISSUER = 'trans_pj'

ROOT_URLCONF = 'trans_pj.urls'

TEMPLATES = [
	{
		'BACKEND': 'django.template.backends.django.DjangoTemplates',
		'DIRS': [BASE_DIR / 'trans_pj/templates'],
		'APP_DIRS': True,
		'OPTIONS': {
			'context_processors': [
				'django.template.context_processors.debug',
				'django.template.context_processors.request',
				'django.contrib.auth.context_processors.auth',
				'django.contrib.messages.context_processors.messages',
			],
		},
	},
]

WSGI_APPLICATION = 'trans_pj.wsgi.application'
ASGI_APPLICATION = 'trans_pj.asgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases
DATABASES = {
	'default': {
		# -------------------------
# 		# Prometheus
# 		# -------------------------
# 		"ENGINE": "django_prometheus.db.backends.postgresql",
		'ENGINE': 'django.db.backends.postgresql',
# 		# -------------------------
		'NAME': get_env_variable('POSTGRES_DB'),
		'USER': get_env_variable('POSTGRES_USER'),
		'PASSWORD': get_env_variable('POSTGRES_PASSWORD'),
		'HOST': 'postgres',  # Docker内のPostgreSQLサービス名
		'PORT': '5432',
		'OPTIONS': {
			'sslmode': 'require',
			'sslcert': '/code/ssl/django.crt',  # Djangoクライアント用
			'sslkey' : '/code/ssl/django.key',   # Djangoクライアント用
		},
	}
}

# Django-Nginx SSL #############################################################
# セキュアなクッキー設定
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# SSLリダイレクト
SECURE_SSL_REDIRECT = True

# 安全な接続の設定
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
################################################################################


# ユーザー登録数の上限
MAX_USER_COUNT = 10000


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
	{
		'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
		'OPTIONS': {
			'user_attributes': ('email', 'nickname'),
			'max_similarity': 0.7,
		},
	},
	{
		'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
		'OPTIONS': {
			'min_length': 8,
		},
	},
	{
		'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
	},
	{
		'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
	},
]

# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

#LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# upload file
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGGING = {
'version': 1,
'handlers': {
	'console': {
		'level': 'DEBUG',  # 基礎的な全般設定 ※WARNINGにするとテスト時の意図的な操作も拾ってしまう
		# 'level': 'ERROR',  # 基礎的な全般設定 ※WARNINGにするとテスト時の意図的な操作も拾ってしまう
		'class': 'logging.StreamHandler',
	},
	'console_debug': {
		'level': 'DEBUG',
		'class': 'logging.StreamHandler',
	},
	'file': {
		# 'level': 'WARNING',
		'level': 'DEBUG',
		'class': 'logging.FileHandler',
		'filename': 'django_debug.log',
	},
	'logstash': {
		'level': 'DEBUG',
		'class': 'logstash.TCPLogstashHandler', # TCP
	#   'class': 'logstash.LogstashHandler',
		'host': 'logstash',
		'port': 50000, # TCP is 50000, Default value: 5959
		'version': 1, # Version of logstash event schema. Default value: 0 (for backward compatibility of the library)
		'message_type': 'logstash',  # 'type' field in logstash message. Default value: 'logstash'.
		'fqdn': False, # Fully qualified domain name. Default value: false.
		'tags': ['django.request'],# list of tags. Default: None.
	},
},
'loggers': {
	'': {  # 'root' ロガー
		'handlers': ['file'],
		'level': 'WARNING',
		'propagate': True,
	},
	'django.request': {
		'handlers': ['console'],
		# 'handlers': ['logstash'],
		'level': 'DEBUG',
		'propagate': False,
	},
	'django': { # Django's default logger
			'handlers': ['console', 'file'],
			# 'level': 'DEBUG',
			'level': 'WARNING',
			'propagate': True,
	},
	'pong': {  # 'pong' はアプリケーション固有のロガーの名前 filterとして特定の場所のdebugに使用する
		'handlers': ['console', 'file'],
		'level': 'DEBUG',
		'propagate': False,
	},
	'pong.views': {
		'handlers': ['console_debug', 'file'],
		'level': 'DEBUG',
		'propagate': False,
	},
	'chat': {
		'handlers': ['console_debug', 'file'],
		'level': 'DEBUG',
		'propagate': False,
	},
	'accounts': {
		'handlers': ['console_debug', 'file'],
		'level': 'DEBUG',
		'propagate': False,
	},
	'pong.online': { 
		'handlers': ['console'],
		'level': 'DEBUG',
		'propagate': False,
	},
	'PongOnlineConsumer': {
		'handlers': ['console', 'file'],
		'level': 'DEBUG',
		'propagate': False,
	},
},
}

# 全てのAPIエンドポイントのデフォルト認証をJWTに設定 -> CSRFトークンのチェックは不要
REST_FRAMEWORK = {
	'DEFAULT_AUTHENTICATION_CLASSES': [
		'rest_framework_simplejwt.authentication.JWTAuthentication',  # JWT
	],
}

LOGIN_URL = '/accounts/login/'

AUTH_USER_MODEL = 'accounts.CustomUser'


 # 多言語設定

LOCALE_PATHS = (
    os.path.join(BASE_DIR, 'locale'),
)

LANGUAGE_CODE = 'ja'
LANGUAGES = [
    ('ja', _('Japanese')),
    ('en', _('English')),
    ('fr', _('French')),
]


# CORS設定
CORS_ALLOWED_ORIGINS = [
    "https://localhost",
    "http://localhost:8002",
]

# chat
CHANNEL_LAYERS = {
    # 'default': {
    # 	'BACKEND':'channels_redis.core.RedisChannelLayer',
    # 	'CONFIG': {
    # 		"hosts": [('127.0.0.1', 6379)],
    # 	},
    # },
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"  # インメモリを使う場合
    },
}


def _load_url_config():
	try:
		base_dir = os.path.dirname(os.path.abspath(__file__))
		file_path = os.path.join(base_dir, 'static', 'spa', 'json', 'urlConfig.json')
		# print(f"base_dir: {base_dir}")

		# file_path = ('static/spa/json/urlConfig.json')
		with open(file_path) as f:
			url_config = json.load(f)
			# print(f'load_url_config: {url_config}')
			return url_config
	except Exception as e:
		print(f'load_url_config: Error: could not load urlConfig: {str(e)}')

URL_CONFIG = _load_url_config()
