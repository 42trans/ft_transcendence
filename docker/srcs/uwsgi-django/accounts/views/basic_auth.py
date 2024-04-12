# accounts/views/basic_auth.py

from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, JsonResponse
from django.views import View
from django.views.generic import TemplateView
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from django_otp.plugins.otp_totp.models import TOTPDevice
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView

from accounts.forms import SignupForm, LoginForm
from accounts.views.jwt import response_with_jwt, get_jwt_response

class SignupView(View):
    signup_url = "accounts/signup.html"
    authenticated_redirect_to = "/pong/"

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(to=self.authenticated_redirect_to)

        form = SignupForm()
        param = {'form': form}
        return render(request, self.signup_url, param)


    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(to=self.authenticated_redirect_to)

        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect(to=self.authenticated_redirect_to)

        param = {'form': form}
        return render(request, self.signup_url, param)


class LoginTemplateView(TemplateView):
    template_name = "accounts/login.html"

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('/pong/')
        return super().dispatch(request, *args, **kwargs)


class LoginAPIView(APIView):
    """
    returns JsonResponse(redirect or error)
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]

    # @csrf_exempt
    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            data = {
                'message': 'already logged in',
                'redirect': '/pong/'
            }
            return JsonResponse(data, status=200)

        email = request.data.get('email')
        password = request.data.get('password')

        # Djangoの認証システムを使用してユーザーを認証します。
        user = authenticate(request, email=email, password=password)
        if user is None:
            data = {'error': 'Invalid credentials'}
            return JsonResponse(data, status=401)

        if user.enable_2fa:
            request.session['tmp_auth_user_id'] = user.id
            data = {
                'message': '2fa authentication needed',
                'redirect': '/accounts/verify/verify_2fa/'
            }
            return JsonResponse(data, status=200)
        else:
            # login(request, user)
            data = {
                'message': 'Basic authentication successful',
                'redirect': '/accounts/user/'
            }
            return get_jwt_response(user, data)


# todo: rm, unused
class LoginView(View):
    login_url = "accounts/login.html"
    authenticated_redirect_to = "/pong/"

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(to=self.authenticated_redirect_to)

        form = LoginForm()
        param = {
            'form': form
        }
        return render(request, self.login_url, param)


    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(to=self.authenticated_redirect_to)

        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            if user:
                if user.enable_2fa:
                    request.session['tmp_auth_user_id'] = user.id  # 一時的な認証情報をセッションに保存
                    return redirect(to='accounts:verify_2fa')  # OTP検証ページへリダイレクト
                else:
                    login(request, user)  # 2FAが無効ならば、通常通りログイン
                    return response_with_jwt(user, self.authenticated_redirect_to)

        param = {
            'form': form
        }
        return render(request, self.login_url, param)


class LogoutTemplateView(TemplateView):
    template_name = "accounts/logout.html"


class LogoutAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        data = {
            'message': 'You have been successfully logout',
            'redirect': '/pong/'
        }
        response = JsonResponse(data, status=200)

        self._del_jwt(response)
        return response

    def _del_jwt(self, response):
        response.delete_cookie('Access-Token')
        response.delete_cookie('Refresh-Token')



# todo: rm
class LogoutView(View):
    logout_url = "accounts/logout.html"

    def get(self, request, *args, **kwargs):
        # logout(request)
        response = render(request, self.logout_url)

        response.delete_cookie('Access-Token')
        response.delete_cookie('Refresh-Token')
        return response
