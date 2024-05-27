# docker/srcs/uwsgi-django/pong/views/duel_api/duel_sessions_view.py
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView

class DuelSessionsView(LoginRequiredMixin, TemplateView):
    template_name = "pong/online/duel/duel-session.html"
    def get(self, request):
        return render(request, self.template_name)
