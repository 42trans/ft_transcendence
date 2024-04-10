from base64 import b64encode, b32encode, b32decode, b64decode
from binascii import hexlify, unhexlify
from io import BytesIO
import pyotp
import qrcode

from django import forms
from django.contrib.auth import get_user_model, login
from django.contrib.auth.decorators import login_required
from django_otp import devices_for_user
from django_otp.oath import TOTP
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.util import random_hex
from django.shortcuts import render, redirect

from accounts.forms import Enable2FAForm, Verify2FAForm
from accounts.models import CustomUser, UserManager


@login_required
def enable_2fa(request):
    print('enable_2fa 1')
    user = request.user
    form = Verify2FAForm(request.POST or None)

    secret_key = request.session.get('enable_2fa_temp_secret')
    if secret_key is None:
        # 新しい秘密鍵を16進数形式で生成し、セッションに保存
        secret_key = random_hex(20)
        request.session['enable_2fa_temp_secret'] = secret_key

    # 生成した秘密キーをBase32エンコードしてQRコード生成に使用
    secret_key_base32 = b32encode(bytes.fromhex(secret_key)).decode('utf-8')


    # 秘密鍵からTOTPオブジェクトとQRコードを生成
    totp = pyotp.TOTP(secret_key_base32)
    uri = totp.provisioning_uri(user.get_username(), issuer_name="pong")
    qr = qrcode.make(uri)
    io = BytesIO()
    qr.save(io)
    qr_code_data = b64encode(io.getvalue()).decode('utf-8')

    if request.method == 'POST' and form.is_valid():
        print('enable_2fa 2')
        token = form.cleaned_data['token']
        device_name = form.cleaned_data.get('device_name', 'My Device')
        if not totp.verify(token):
            # 検証失敗時には、フォームにエラーを追加
            form.add_error(None, 'Invalid token.')
            print('enable_2fa 3')
        else:
            # TOTP検証成功、デバイスを保存
            device, created = TOTPDevice.objects.get_or_create(
                user=user,
                defaults={
                    'key': secret_key,
                    'step': totp.interval,
                    'name': device_name,
                    'confirmed': True}
            )
            print('enable_2fa 4')
            if not created:
                # すでにデバイスが存在する場合は、キーを更新する
                device.key = secret_key
                device.step = totp.interval
                device.name = device_name
                device.confirmed = True
                device.save()

            del request.session['enable_2fa_temp_secret']

            print(f"before: user.has_2fa: {user.has_2fa}")

            # has_2faをTrueに更新
            user.has_2fa = True
            user.save()  # ユーザーオブジェクトを保存して変更を適用

            print(f"after: user.has_2fa: {user.has_2fa}")
            return redirect(to='accounts:user')

    if not form.is_valid():
        print('enable_2fa 5')
        print(f"form_error:[{form.errors}]")

    print('enable_2fa 6')
    # GETリクエストまたはフォーム検証失敗時の処理
    return render(request, 'verify/enable_2fa.html', {
        'qr_code_data': qr_code_data,
        'form': form,
    })


def verify_2fa(request):
    print('verify_2fa 1')
    form = Verify2FAForm(request.POST or None)
    temp_user_id = request.session.get('temp_auth_user_id')

    if temp_user_id is not None:
        print('verify_2fa 2')
        # 一時セッションからユーザーIDを取得し、デバイスリストを取得
        User = get_user_model()
        try:
            print('verify_2fa 3')
            user = User.objects.get(id=temp_user_id)
            devices = list(devices_for_user(user, confirmed=True))
        except User.DoesNotExist:
            user = None
            devices = []
            print('verify_2fa 4')
    else:
        user = None
        devices = []
        print('verify_2fa 5')

    if request.method == 'POST' and form.is_valid():
        print('verify_2fa 6')
        token = form.cleaned_data['token']
        # デバイスリストからトークンを検証
        for device in devices:
            if device.verify_token(token):
                login(request, user)
                print('verify_2fa 7')

                del request.session['temp_auth_user_id']
                return redirect('/pong/')
        # トークン検証失敗
        form.add_error(None, 'Invalid token.')
    else:
        print('verify_2fa 8')
        print(form.errors)  # フォームのエラーを出力

    print('verify_2fa 9')
    # GETリクエストまたは検証失敗時
    return render(request, 'verify/verify_2fa.html', {
        'form': form,
        'devices': devices,
    })



@login_required
def disable_2fa(request):
    user = request.user

    devices = TOTPDevice.objects.filter(user=user, confirmed=True)
    for device in devices:
        device.delete()

    # has_2faをFalseに更新
    user.has_2fa = False
    user.save()  # ユーザーオブジェクトを保存して変更を適用

    return redirect(to='accounts:user')
