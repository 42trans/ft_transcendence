# # docker/srcs/uwsgi-django/pong/tournament/tournament_forms.py
# from django import forms
# from ..models import Tournament

# from django import forms
# from ..models import Tournament

# class TournamentForm(forms.ModelForm):
# 	class Meta:
# 		model = Tournament
# 		fields = ['name', 'date', 'player_nicknames']

# 	def clean_player_nicknames(self):
# 		nicknames = self.cleaned_data.get('player_nicknames', [])
# 		if not nicknames or len(nicknames) != 8:
# 			raise forms.ValidationError("Exactly 8 nicknames are required.")
# 		return nicknames
