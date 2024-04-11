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
from pathlib import Path
from django.core.exceptions import ImproperlyConfigured

def get_env_variable(var_name):
	try:
		value = os.environ[var_name]
		if value == '':
			raise ValueError
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
SECRET_KEY = 'django-insecure-^u(k4_odzhvjof^yx-bauu&!6jv)^!5nt8c3p^g1!da3ro^cf6'

# SECURITY WARNING: don't run with debug turned on in production!
# DEBUG = false
DEBUG = True

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
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
	'django_otp.plugins.otp_hotp',  	# 2fa
	'django_otp.plugins.otp_static',  	# 2fa
	# 'django.contrib.sites',  # allauth
	# 'allauth',  # allauth
	# 'allauth.account',  # allauth
	# 'allauth.socialaccount',  # allauth
	# 'socialaccount.providers.ft',  # 42auth with allauth
]


# allauth
# SOCIALACCOUNT_PROVIDERS = {
# 	'ft': {
# 		'CLIENT_ID': get_env_variable('FT_UID'),
# 		'SECRET': get_env_variable('FT_SECRET'),
# 	}
# }
FT_CLIENT_ID = get_env_variable('FT_UID')
FT_SECRET = get_env_variable('FT_SECRET')


MIDDLEWARE = [
	# Prometheus----------
	'django_prometheus.middleware.PrometheusBeforeMiddleware',
	# --------------------
	'django.middleware.security.SecurityMiddleware',
	'django.contrib.sessions.middleware.SessionMiddleware',
	'django.middleware.common.CommonMiddleware',
	'django.middleware.csrf.CsrfViewMiddleware',
	'django.contrib.auth.middleware.AuthenticationMiddleware',
	'django.contrib.messages.middleware.MessageMiddleware',
	'django.middleware.clickjacking.XFrameOptionsMiddleware',
	# Prometheus----------
	'django_prometheus.middleware.PrometheusAfterMiddleware',
	# --------------------
	'django_otp.middleware.OTPMiddleware',  # 2fa
	# 'allauth.account.middleware.AccountMiddleware',  # allauth
	'accounts.middleware.JWTAuthenticationMiddleware',  # jwt
]


# AUTHENTICATION_BACKENDS = [
	# 'django_otp.backends.OTPAuthenticationBackend',  # 2fa
# 	'django.contrib.auth.backends.ModelBackend',  # allauth
# 	'allauth.account.auth_backends.AuthenticationBackend',  # allauth
# ]

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
				# 'django.template.context_processors.request',  # allauth
			],
		},
	},
]

WSGI_APPLICATION = 'trans_pj.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

# DATABASES = {
#     'default': {
# 		# -------------------------
# 		# Prometheus
# 		# -------------------------
# 		'ENGINE': 'django_prometheus.db.backends.sqlite3',
#         # 'ENGINE': 'django.db.backends.sqlite3',
# 		# -------------------------
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }



DATABASES = {
	'default': {
		# -------------------------
# 		# Prometheus
# 		# -------------------------
		"ENGINE": "django_prometheus.db.backends.postgresql",
		# 'ENGINE': 'django.db.backends.postgresql',
# 		# -------------------------
		'NAME': os.environ.get('POSTGRES_DB'),
		'USER': os.environ.get('POSTGRES_USER'),
		'PASSWORD': os.environ.get('POSTGRES_PASSWORD'),
		'HOST': 'postgres',  # Docker内のPostgreSQLサービス名
		'PORT': '5432',
	}
}


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

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'

# STATIC_ROOT = '/code/static/'
# BASE_DIR: プロジェクトのルート
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGGING = {
'version': 1,
'handlers': {
	'console': {
		'level': 'ERROR',  # 基礎的な全般設定 ※WARNINGにするとテスト時の意図的な操作も拾ってしまう
		'class': 'logging.StreamHandler',
	},
	'console_debug': {
		'level': 'DEBUG',
		'class': 'logging.StreamHandler',
	},
	'file': {
		'level': 'WARNING',
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
		'handlers': ['logstash'],
		'level': 'DEBUG',
		'propagate': True,
	},
	'django': { # Django's default logger
			'handlers': ['console', 'file'],
			'level': 'WARNING',
			'propagate': True,
	},
	'pong': {  # 'pong' はアプリケーション固有のロガーの名前 filterとして特定の場所のdebugに使用する
		'handlers': ['console'],
		'level': 'DEBUG',
		'propagate': False,
	},
	'pong.views': {
		'handlers': ['console_debug'],
		'level': 'DEBUG',
		'propagate': False,
	},
},
}


# # allauth setting --------------------------------------------------------------
# ## sitesフレームワーク用のサイトID
# SITE_ID = 1
#
# ## ログイン・ログアウト時のリダイレクト先
# LOGIN_REDIRECT_URL = '/pong/'
# ACCOUNT_LOGOUT_REDIRECT_URL = '/pong/'
#
# ## 認証方式を「メルアドとパスワード」に設定
# ACCOUNT_AUTHENTICATION_METHOD = 'email'
# ## ユーザ名は使用しない
# ACCOUNT_USERNAME_REQUIRED = False
#
# ## ユーザ登録時に確認メールを送信するか(none=送信しない, mandatory=送信する)
# ACCOUNT_EMAIL_VERIFICATION = 'none'
# ACCOUNT_EMAIL_REQUIRED = True   # ユーザ登録にメルアド必須にする
# # allauth setting --------------------------------------------------------------

# JWT
REST_FRAMEWORK = {
	'DEFAULT_AUTHENTICATION_CLASSES': [
		'rest_framework_simplejwt.authentication.JWTAuthentication',
	],
}

LOGIN_URL = '/accounts/login/'

AUTH_USER_MODEL = 'accounts.CustomUser'
