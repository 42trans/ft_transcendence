import secrets
import requests
import json
import logging
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login, logout, update_session_auth_hash, get_user_model
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy
from django.conf import settings
from django.urls import reverse
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .forms import SignupForm, LoginForm, UserEditForm, CustomPasswordChangeForm
from .models import CustomUser

logger = logging.getLogger(__name__)


def signup_view(request):
    if request.user.is_authenticated:
        return redirect(to='/pong/')  # ログイン済みの場合は/pong/にリダイレクト

    if request.method == 'POST':

        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect(to='/pong/')
    else:
        form = SignupForm()

    param = {
        'form': form
    }

    return render(request, 'accounts/signup.html', param)


def login_view(request):
    if request.user.is_authenticated:
        return redirect(to='/pong/')  # ログイン済みの場合は/pong/にリダイレクト

    if request.method == 'POST':
        # next = request.POST.get('next')
        form = LoginForm(request, data=request.POST)

        if form.is_valid():
            user = form.get_user()

            if user:
                login(request, user)
                return redirect(to='/pong/')
    else:
        form = LoginForm()

    param = {
        'form': form,
    }

    return render(request, 'accounts/login.html', param)


def logout_view(request):
    logout(request)

    return render(request, 'accounts/logout.html')


@login_required
def user_view(request):
    user = request.user

    params = {
        'email': user.email,
        'nickname': user.nickname,
    }

    return render(request, 'accounts/user.html', params)


@login_required
def edit_profile(request):
    if request.method == 'POST':
        # OAuth経由のユーザー（パスワードが使用不可のユーザー）の場合、パスワードフォームをバリデーションしない
        if request.user.has_usable_password():
            password_form = CustomPasswordChangeForm(user=request.user, data=request.POST)
            password_form_is_valid = password_form.is_valid()
        else:
            # パスワードが設定されていない（OAuth経由）のユーザーは、パスワードフォームを無効化
            password_form = None
            password_form_is_valid = False  # パスワードフォームは無視

        old_nickname = request.user.nickname  # 変更前のニックネームを保存
        user_form = UserEditForm(request.POST, instance=request.user)

        if user_form.is_valid() and not password_form_is_valid:
            # user_form.save()
            # messages.success(request, 'Your profile was successfully updated!')
            # return redirect(reverse_lazy('accounts:edit'))

            user = user_form.save(commit=False)  # フォームの変更を保存せずにインスタンスを取得
            new_nickname = user_form.cleaned_data.get('nickname')  # 変更後のニックネームを取得

            if old_nickname == new_nickname:
                # ニックネームが変わらない場合
                messages.warning(request, 'Your nickname has not changed.')
            else:
                # ニックネームが変わる場合
                user.save()  # 変更をデータベースに保存
                messages.success(request, f'Your nickname was successfully updated from "{old_nickname}" to "{new_nickname}".')
                return redirect(reverse_lazy('accounts:edit'))  # 正しいリダイレクトを使用

        elif password_form_is_valid:
            user = password_form.save()
            update_session_auth_hash(request, user)  # セッションを更新
            messages.success(request, 'Your password was successfully updated!')
            return redirect(reverse_lazy('accounts:edit'))
    else:
        user_form = UserEditForm(instance=request.user)
        if request.user.has_usable_password():
            password_form = CustomPasswordChangeForm(user=request.user)
        else:
            password_form = None  # パスワードフォームを表示しない

    params = {
        'user_form': user_form,
        'password_form': password_form,  # パスワードフォームをテンプレートに渡す（Noneの場合は表示されない）
    }

    return render(request, 'accounts/edit_profile.html', params)


def oauth_ft(request):
    if request.user.is_authenticated:
        return redirect(to='/pong/')  # ログイン済みの場合は/pong/にリダイレクトs

    # logger.debug('\noauth_with_42 1')

    # CSRF対策のためのstateを生成
    state = secrets.token_urlsafe()
    # stateをセッションに保存
    request.session['oauth_state'] = state

    # 42authの認証ページへのリダイレクトURLを構築
    params = {
        'client_id': settings.FT_CLIENT_ID,
        'redirect_uri': request.build_absolute_uri(reverse('accounts:oauth_ft_callback')),
        'response_type': 'code',
        'scope': 'public',
        'state': state,
    }
    auth_url = f"https://api.intra.42.fr/oauth/authorize?{requests.compat.urlencode(params)}"

    # logger.debug(f'oauth_with_42 2 client_id:{params['client_id']}')
    # logger.debug(f'oauth_with_42 3 redirect_uri:{params['redirect_uri']}')
    # logger.debug(f'oauth_with_42 4 state:{params['state']}')
    # logger.debug(f'oauth_with_42 5 auth_url:{auth_url}')

    return redirect(to=auth_url)


def oauth_ft_callback(request):
    # logger.debug('\noauth_with_42 redirect 1')

    # セッションからstateを取得
    saved_state = request.session.get('oauth_state')
    # リクエストからstateを取得
    returned_state = request.GET.get('state')

    # stateが一致するか検証
    if saved_state != returned_state:
        # stateが一致しない場合はエラー処理
        return render(request, 'pong/error.html', {'message': 'Invalid state parameter'})


    # 42authから返されたコードを取得
    code = request.GET.get('code')
    if not code:
        error = request.GET.get('error', 'Unknown error')
        error_description = request.GET.get('error_description', 'No description provided.')

        # ログにエラーを記録するなどの処理を行う
        logger.error(f'OAuth error: {error}, Description: {error_description}')

        messages.error(request, 'Authorization code is missing. Please try again.')
        return render(request, 'pong/error.html')


    # アクセストークンを取得
    token_url = 'https://api.intra.42.fr/oauth/token'
    token_data = {
        'grant_type': 'authorization_code',
        'client_id': settings.FT_CLIENT_ID,
        'client_secret': settings.FT_SECRET,
        'code': code,
        'redirect_uri': request.build_absolute_uri(reverse('accounts:oauth_ft_callback')),
    }

    # logger.debug(f'oauth_with_42 redirect 2 url:{token_url}')
    # logger.debug(f'oauth_with_42 redirect 3 client_id:{token_data['client_id']}')
    # logger.debug(f'oauth_with_42 redirect 4 code:{token_data['code']}')
    # logger.debug(f'oauth_with_42 redirect 5 redirect_uri:{token_data['redirect_uri']}')

    try:
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()  # HTTPエラーをチェック
        token_json = token_response.json()
        access_token = token_json.get('access_token')

        # アクセストークンを使用してユーザー情報を取得
        user_info_url = 'https://api.intra.42.fr/v2/me'
        user_info_response = requests.get(user_info_url, headers={'Authorization': f'Bearer {access_token}'})
        user_info = user_info_response.json()
        formatted_user_info = json.dumps(user_info, indent=4)


        # logger.debug(f'oauth_with_42 redirect 6 user_info_url:{user_info_url}')
        # logger.debug(f'oauth_with_42 redirect 7 user_info_response:{user_info_response}')
        # logger.debug(f'oauth_with_42 redirect 8 user_info:{formatted_user_info}')

        expires_in = token_json.get('expires_in')  # expires_inの値を取得
        # logger.debug(f'access token expires in: {expires_in} sec ({expires_in // 60} min)')


        email = user_info.get('email')
        nickname = user_info.get('login')

        # ユーザー検索または作成
        User = get_user_model()
        user, created = User.objects.get_or_create(email=email, defaults={'nickname': nickname})

        if created:
            # 新規ユーザーの場合は、追加の初期設定をここで行う
            user.set_unusable_password()  # パスワードは外部サービスに依存しているため
            user.save()
            # 必要に応じて、ユーザーに関連する他のモデルやデータの初期設定を行う

        # ユーザーをログインさせる
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')

        # ログイン後のリダイレクト先：相対パスだと sign-in-redirect/path/になる
        # return redirect('/pong/bootstrap_index/')
        return redirect(to='/pong/')

    except requests.exceptions.RequestException as e:
        # エラーハンドリング
        messages.error(request, 'An error occurred during the authentication process.')
        return render(request, 'pong/error.html', {'message': 'An error occurred during the authentication process.'})
