from django.shortcuts import render


def index(request):
    return render(request, "chat/index.html")


def room(request, room_name):
    return render(request, "chat/room.html", {"room_name": room_name})


def dm_view(request, nickname):
    user = get_object_or_404(User, nickname=nickname)
    return render(request, 'dm/room.html', {'user': user})
