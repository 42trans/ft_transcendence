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
from accounts.forms import SignupForm, LoginForm, UserEditForm, CustomPasswordChangeForm
from accounts.models import CustomUser


logger = logging.getLogger(__name__)


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
