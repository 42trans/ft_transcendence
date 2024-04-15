# accounts/views/oauth.py

import secrets
import requests
import json
import logging
from django.views import View
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login, get_user_model
from django.conf import settings
from django.urls import reverse
from django.utils.translation import get_language_from_request


logger = logging.getLogger(__name__)


class OAuthWith42(View):
    pong_top_url = "/pong/"
    error_page_path = "pong/error.html"
    callback_name = "accounts:oauth_ft_callback"
    api_path = "https://api.intra.42.fr/oauth"
    user_url = "https://api.intra.42.fr/v2/me"

    def get(self, request, *args, **kwargs):
        if 'callback' in request.path:
            return self.oauth_ft_callback(request)
        else:
            return self.oauth_ft(request)

    def remove_lang(self, request):
        uri = request.build_absolute_uri(reverse(self.callback_name))
        host = request.get_host()
        lang = "/" + get_language_from_request(request, True) + "/"

        lang_p = uri.find(host) + len(host)
        if lang in uri[lang_p:lang_p+4]:
            return uri[0:lang_p] + "/" + uri[lang_p+4:]
        return (uri)

    def oauth_ft(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(to=self.pong_top_url)  # ログイン済みの場合は/pong/にリダイレクトs

        # logger.debug('\noauth_with_42 1')

        # CSRF対策のためのstateを生成
        state = secrets.token_urlsafe()
        request.session['oauth_state'] = state
        uri = self.remove_lang(request)

        params = {
            'client_id': settings.FT_CLIENT_ID,
            'redirect_uri': uri,
            'response_type': 'code',
            'scope': 'public',
            'state': state,
        }
        auth_url = f"{self.api_path}/authorize?{requests.compat.urlencode(params)}"

        # logger.debug(f'oauth_with_42 2 client_id:{params['client_id']}')
        # logger.debug(f'oauth_with_42 3 redirect_uri:{params['redirect_uri']}')
        # logger.debug(f'oauth_with_42 4 state:{params['state']}')
        # logger.debug(f'oauth_with_42 5 auth_url:{auth_url}')
        return redirect(to=auth_url)


    def oauth_ft_callback(self, request, *args, **kwargs):
        # logger.debug('\noauth_with_42 redirect 1')

        if not self._is_valid_state(request):
            return render(request, self.error_page_path, {'message': 'Invalid state parameter'})

        code = request.GET.get('code')
        if not code:
            self._handle_auth_error(request)
            return render(request, self.error_page_path)

        token_url = f"{self.api_path}/token"
        token_data = {
            'grant_type': 'authorization_code',
            'client_id': settings.FT_CLIENT_ID,
            'client_secret': settings.FT_SECRET,
            'code': code,
            'redirect_uri': request.build_absolute_uri(reverse(self.callback_name)),
        }

        # logger.debug(f'oauth_with_42 redirect 2 url:{token_url}')
        # logger.debug(f'oauth_with_42 redirect 3 client_id:{token_data['client_id']}')
        # logger.debug(f'oauth_with_42 redirect 4 code:{token_data['code']}')
        # logger.debug(f'oauth_with_42 redirect 5 redirect_uri:{token_data['redirect_uri']}')

        try:
            token_response = requests.post(token_url, data=token_data)
            token_response.raise_for_status()
            access_token = token_response.json().get('access_token')

            user_info_url = self.user_url
            user_info_response = requests.get(user_info_url, headers={'Authorization': f'Bearer {access_token}'})
            user_info = user_info_response.json()
            formatted_user_info = json.dumps(user_info, indent=4)

            # logger.debug(f'oauth_with_42 redirect 6 user_info_url:{user_info_url}')
            # logger.debug(f'oauth_with_42 redirect 7 user_info_response:{user_info_response}')
            # logger.debug(f'oauth_with_42 redirect 8 user_info:{formatted_user_info}')

            # expires_in = token_response.json().get('expires_in')  # expires_inの値を取得
            # logger.debug(f'access token expires in: {expires_in} sec ({expires_in // 60} min)')

            email = user_info.get('email')
            nickname = user_info.get('login')

            User = get_user_model()
            user, new_user_created = User.objects.get_or_create(email=email, defaults={'nickname': nickname})

            if new_user_created:
                user.set_unusable_password()
                user.save()

            login(request, user, backend='django.contrib.auth.backends.ModelBackend')

            # ログイン後のリダイレクト先：相対パスだと sign-in-redirect/path/になる
            # return redirect('/pong/bootstrap_index/')
            return redirect(to=self.pong_top_url)

        except requests.exceptions.RequestException as e:
            messages.error(request,
                           'An error occurred during the authentication process.')
            return render(request,
                          self.error_page_path,
                          {'message': 'An error occurred during the authentication process.'})


    def _is_valid_state(self, request):
        saved_state = request.session.get('oauth_state')
        returned_state = request.GET.get('state')
        return saved_state == returned_state


    def _handle_auth_error(self, request):
        error = request.GET.get('error', 'Unknown error')
        error_description = request.GET.get('error_description', 'No description provided.')
        logger.error(f'OAuth error: {error}, Description: {error_description}')
        messages.error(request, 'Authorization code is missing. Please try again.')
