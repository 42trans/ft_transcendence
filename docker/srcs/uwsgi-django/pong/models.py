# docker/srcs/uwsgi-django/pong/models.py
import re
from django.db import models
from django.utils import timezone
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from accounts.models import CustomUser


class Tournament(models.Model):
	kTORNAMENT_NAME_MAX_LEN = 30

	name = models.CharField(max_length=kTORNAMENT_NAME_MAX_LEN)
	# settings.py で USE_TZ=True が設定されている。保存はUTC
	date = models.DateTimeField(default=timezone.now)
	# ニックネームを配列として保存
	player_nicknames = ArrayField(models.CharField(max_length=CustomUser.kNICKNAME_MAX_LENGTH), default=list)
	organizer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='tournaments')
	is_finished = models.BooleanField(default=False)
	# オブジェクトを人間が読める文字列形式で表現するために使用

	def __str__(self):
		return self.name

	def clean(self):
		# トーナメント名が空でないことを確認
		if not self.__is_valid_tournament_name():
			raise ValidationError('Invalid tournament name: non-empty alnum name required.')

		if not self.__is_valid_date():
			raise ValidationError('Invalid data: ISO 8601 format required.')

		if not self.__is_valid_player_nicknames():
			raise ValidationError('Invalid player nicknames: '
								  '8 unique, non-empty alnum nicknames required.')

	def __is_valid_tournament_name(self) -> bool:
		return (self.name is not None
				and 0 < len(self.name)
				and self.__is_valid_name(self.name))

	def __is_valid_date(self) -> bool:
		return self.date is not None and self.date.tzinfo

	def __is_valid_player_nicknames(self) -> bool:
		# すべてのニックネームが1文字以上の英数字であることを確認
		if not all(self.__is_valid_name(nickname) for nickname in self.player_nicknames):
			return False

		# ニックネームが8つで全てユニークであることを確認
		if len(self.player_nicknames) != 8 or len(set(self.player_nicknames)) != 8:
			return False
		return True

	def __is_valid_name(self, name) -> bool:
		"""
		文字列の開始、終了はalnum
		中間に任意の数のSP
		"""
		pattern = r'^[A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)*$'
		return bool(re.match(pattern, name))

	def save(self, *args, **kwargs):
		# モデルを保存する前にバリデーションを実行
		self.full_clean()
		super().save(*args, **kwargs)


class Match(models.Model):
	tournament = models.ForeignKey(Tournament, related_name='matches', on_delete=models.CASCADE)
	# トーナメントの1回線、準決勝などのラウンド番号
	round_number = models.IntegerField()
	# ラウンド内の試合番号
	match_number = models.IntegerField()
	# TounamentTableのニックネーム配列から文字列を直接保存
	player1 = models.CharField(max_length=CustomUser.kNICKNAME_MAX_LENGTH, blank=True)
	player2 = models.CharField(max_length=CustomUser.kNICKNAME_MAX_LENGTH, blank=True, )
	winner = models.CharField(max_length=CustomUser.kNICKNAME_MAX_LENGTH, blank=True, null=True)
	# settings.py で USE_TZ=True が設定されている。保存はUTC
	ended_at = models.DateTimeField(null=True, blank=True)
	player1_score = models.IntegerField(default=0)
	player2_score = models.IntegerField(default=0)
	is_finished = models.BooleanField(default=False)
	can_start = models.BooleanField(default=False)
	def __str__(self):
		return f"Round {self.round_number} Match {self.match_number}: {self.player1} vs {self.player2}"

class PongGameResult(models.Model):
	"""
	pongゲームの結果を保存するモデル。

	このクラスはデータベースのテーブル構造を定義。
	フィールド（カラム）の追加や変更は、このクラスの定義を変更することで反映。
	各インスタンスはデータベース内の「PongGameResult」テーブルのレコードに相当。

	DjangoのORM（Object-Relational Mapping）によって、このモデルから自動的に生成されるSQLクエリにより、データベースとの対話が可能。
	※データベースの種類に依らず、SQLを直接記述せずにデータを操作できる。ex. 開発環境ではSQLiteを使用し、本番環境ではPostgreSQLに切り替え

	Attributes:
		date (DateTimeField): 試合が行われた日時。Djangoの設定に依存するタイムゾーン。
		blockchain_tx_id (CharField): ブロックチェーンのトランザクションID。特定のトランザクションを識別。
		blockchain_block_number (IntegerField): ブロックチェーンのブロック番号。DB登録時刻とはズレる。
		blockchain_timestamp (DateTimeField): ブロックチェーンに記録されたタイムスタンプ。
		transaction_status (CharField): トランザクションの現在のステータス。

	Note:
		pending: トランザクションがブロックチェーンネットワークに送信されたが未確定。マイナーによって処理されるのを待っている状態
		confirmed: トランザクションがブロックに含まれ、ブロックチェーンに確定追加。
	"""
	# -------------------------------------------------------------------
	# 🎮ゲーム結果🎮のフィールド
	# -------------------------------------------------------------------
	match_id = models.IntegerField()
	player_1_score = models.IntegerField()
	player_2_score = models.IntegerField()
	name_winner = models.CharField(max_length=CustomUser.kNICKNAME_MAX_LENGTH)
	name_loser = models.CharField(max_length=CustomUser.kNICKNAME_MAX_LENGTH)
	date = models.DateTimeField(default=timezone.now)
	# 下記はレコード作成後に変更することができない場合の設定。タイムゾーンはサーバー依存
	# date = models.DateTimeField(auto_now_add=True)
	# -------------------------------------------------------------------
	# 🧱⛓️blockchain🧱⛓️関連
	# 初期状態ではトランザクションがまだ存在しない（登録に時間がかかる）ため、空またはNULLを許容。後から追加する項目
	# -------------------------------------------------------------------
	# blockchain_tx_id = models.CharField(max_length=255, blank=True, null=True)
	# blockchain_block_number = models.IntegerField(blank=True, null=True)
	# blockchain_timestamp = models.DateTimeField(blank=True, null=True)
	# transaction_status = models.CharField(max_length=100, default='pending')
	# -------------------------------------------------------------------
	# ## 関連:
	# - .urls.py: API URL設定 
	# - .views.py, .urls.pyで定義したファイル: API関数 
