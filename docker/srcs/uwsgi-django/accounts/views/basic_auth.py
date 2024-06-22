# accounts/views/basic_auth.py

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.mixins import LoginRequiredMixin
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
from accounts.models import CustomUser, UserManager
from accounts.views.jwt import get_jwt_response

import logging
logger = logging.getLogger('accounts')


class SignupTemplateView(View):
    template_name = "accounts/signup.html"
    authenticated_redirect_to = "/pong/"  # djangoで/pong/にrender -> SPA /app/

    def get(self, request, *args, **kwargs):
        # logger.error("signup view called")
        if request.user.is_authenticated:
            return redirect(to=self.authenticated_redirect_to)

        context = {
            'login_url': settings.URL_CONFIG['kSpaAuthLoginUrl']
        }
        return render(request, self.template_name, context)


class SignupAPIView(APIView):
    permission_classes = [AllowAny]

    url_config = settings.URL_CONFIG
    # authenticated_redirect_to = url_config['kSpaPongTopUrl']  # SPA /app/にリダイレクト

    def post(self, request, *args, **kwargs):
        # logger.error("signup api called")
        if request.user.is_authenticated:
            data = {
                'message': "Already logged in",
                # 'redirect': self.authenticated_redirect_to
                'redirect': self.url_config['kSpaPongTopUrl']
            }
            return JsonResponse(data, status=200)

        email = request.data.get('email')
        nickname = request.data.get('nickname')
        password1 = request.data.get('password1')
        password2 = request.data.get('password2')

        if password1 != password2:
            data = {'error': "passwords don't match"}
            return JsonResponse(data, status=400)

        ok, err = CustomUser.objects._is_valid_user_field(email, nickname, password1)
        if not ok:
            data = {'error': err}
            return JsonResponse(data, status=400)

        try:
            user = CustomUser.objects.create_user(email=email,
                                                  password=password1,
                                                  nickname=nickname)
            # login(request, user)  # JWT: unuse login()
            data = {
                'message': "Signup successful",
                'redirect': self.url_config['kSpaPongTopUrl']
            }
            return get_jwt_response(user, data)
        except Exception as e:
            data = {'error': str(e)}
            return JsonResponse(data, status=500)


class LoginTemplateView(TemplateView):
    template_name = "accounts/login.html"

    def dispatch(self, request, *args, **kwargs):
        # print('loginView 1')
        if request.user.is_authenticated:
            return redirect('/pong/')  # djangoで/pong/にrender -> SPA /app/
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['signup_url'] = settings.URL_CONFIG['kSpaAuthSignupUrl']
        return context


class LoginAPIView(APIView):
    """
    returns JsonResponse(redirect or error)
    """
    permission_classes = [AllowAny]
    url_config = settings.URL_CONFIG

    def post(self, request, *args, **kwargs) -> JsonResponse:
        # print('loginAPI 1')
        if request.user.is_authenticated:
            data = {
                'message': 'already logged in',
                'redirect': self.url_config['kSpaPongTopUrl'],  # SPA /app/にリダイレクト
            }
            return JsonResponse(data, status=200)

        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(request, email=email, password=password)
        if user is None:
            data = {'error': 'Invalid credentials'}
            return JsonResponse(data, status=401)

        if user.enable_2fa:
            request.session['tmp_auth_user_id'] = user.id
            data = {
                'message': '2fa authentication needed',
                'redirect': self.url_config['kSpaAuthVerify2FaUrl']
            }
            return JsonResponse(data, status=200)
        else:
            # login(request, user)
            data = {
                'message'   : 'Basic authentication successful',
                'redirect'  : self.url_config['kSpaPongTopUrl'],     # SPA /app/にリダイレクト
            }
            return get_jwt_response(user, data)


class LogoutTemplateView(LoginRequiredMixin, TemplateView):
    template_name = "accounts/logout.html"


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]
    url_config = settings.URL_CONFIG

    def get(self, request, *args, **kwargs):
        data = {
            'message'   : 'You have been successfully logout',
            'redirect'  : self.url_config['kSpaPongTopUrl'],         # SPA /app/にリダイレクト
            'user_id'   : request.user.id,  # OnlineStatusWebSocketの切断に使用
        }
        response = JsonResponse(data, status=200)

        self._del_jwt(response)
        self._del_sesisons(request)
        return response

    def _del_jwt(self, response):
        response.delete_cookie('Access-Token')
        response.delete_cookie('Refresh-Token')

    def _del_sesisons(self, request):
        request.session.flush()
