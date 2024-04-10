# accounts/views/oauth.py

import json
import logging
import secrets
from typing import Tuple, Optional
import re
import requests

from django.contrib import messages
from django.contrib.auth import login, get_user_model
from django.conf import settings
from django.http import HttpRequest
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views import View


logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(levelname)s - %(message)s - [in %(funcName)s: %(lineno)d]',
)
logger = logging.getLogger(__name__)


class OAuthWith42(View):
    authenticated_redirect_to = "/pong/"
    error_page_path = "pong/error.html"
    callback_name = "accounts:oauth_ft_callback"
    api_path = "https://api.intra.42.fr"

    def get(self, request, *args, **kwargs):
        if 'callback' in request.path:
            return self.oauth_ft_callback(request)
        else:
            return self.oauth_ft(request)


    def oauth_ft(self, request: HttpRequest, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(to=self.authenticated_redirect_to)

        # CSRF対策のためのstateを生成
        state = secrets.token_urlsafe()
        request.session['oauth_state'] = state

        params = {
            'client_id': settings.FT_CLIENT_ID,
            'redirect_uri': request.build_absolute_uri(reverse(self.callback_name)),
            'response_type': 'code',
            'scope': 'public',
            'state': state,
        }
        auth_url = f"{self.api_path}/oauth/authorize?{requests.compat.urlencode(params)}"
        return redirect(to=auth_url)


    def oauth_ft_callback(self, request: HttpRequest, *args, **kwargs):
        if not self._is_valid_state(request):
            logger.error(f'error: {err}', exc_info=True)
            return render(request, self.error_page_path, {'message': 'Invalid state parameter'})

        err, email, nickname = self._get_email_and_nickname(request)
        if err is not None:
            logger.error(f'error: {err}', exc_info=True)
            return render(request,
                          self.error_page_path,
                          {'message': 'An error occurred during the authentication process'})

        User = get_user_model()
        user, new_user_created = User.objects.get_or_create(email=email,
                                                            defaults={'nickname': nickname})
        if new_user_created:
            user.set_unusable_password()
            user.save()

        if user.enable_2fa:
            request.session['temp_auth_user_id'] = user.id  # 一時的な認証情報をセッションに保存
            return redirect(to='accounts:verify_2fa')  # OTP検証ページへリダイレクト

        # login(request, user)  # 2FAが無効ならば、通常通りログイン
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        return redirect(to=self.authenticated_redirect_to)


    def _is_valid_state(self, request: HttpRequest) -> bool:
        saved_state = request.session.get('oauth_state')
        returned_state = request.GET.get('state')
        return saved_state == returned_state


    def _handle_auth_error(self, request: HttpRequest):
        error = request.GET.get('error', 'Unknown error')
        error_description = request.GET.get('error_description', 'No description provided.')
        logger.error(f'error: {error}: {error_description}', exc_info=True)
        messages.error(request, 'Authorization code is missing. Please try again.')


    def _get_email_and_nickname(self, request: HttpRequest) -> Tuple[Optional[str],
                                                                     Optional[str],
                                                                     Optional[str]]:
        code = request.GET.get('code')
        if not code:
            return 'Authorization code is missing', None, None

        token_url = f"{self.api_path}/oauth/token"
        token_data = {
            'grant_type': 'authorization_code',
            'client_id': settings.FT_CLIENT_ID,
            'client_secret': settings.FT_SECRET,
            'code': code,
            'redirect_uri': request.build_absolute_uri(reverse(self.callback_name)),
        }

        try:
            token_response = requests.post(token_url, data=token_data)
            token_response.raise_for_status()  # HTTP error -> exception
            access_token = token_response.json().get('access_token')

            if not access_token:
                return 'Failed to retrieve access token', None, None

            user_info_url = f"{self.api_path}/v2/me"
            user_info_response = requests.get(user_info_url,
                                              headers={'Authorization': f'Bearer {access_token}'})
            user_info = user_info_response.json()

            email = user_info.get('email')
            nickname = user_info.get('login')

            valid_result, err = self._validate_email_and_nickname(email, nickname)
            if not valid_result:
                return err, None, None
            return None, email, nickname

        except requests.exceptions.RequestException as e:
            return str(e), None, None


    def _validate_email_and_nickname(self, email: str, nickname: str) -> Tuple[bool,
                                                                               Optional[str]]:
        email_regex = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
        if not re.match(email_regex, email):
            return False, "Invalid email format"

        if not nickname:
            return False, "nickname cannot be empty"

        return True, None
