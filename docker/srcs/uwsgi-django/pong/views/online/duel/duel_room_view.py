# docker/srcs/uwsgi-django/pong/views/duel_api/duel_room_view.py
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views.generic import TemplateView

class DuelRoomView(LoginRequiredMixin, TemplateView):
    template_name = "pong/online/duel/duel-room.html"
    def get(self, request, room_name):
        return render(request, self.template_name, {'room_name': room_name})
