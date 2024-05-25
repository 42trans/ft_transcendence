# PongオンラインWebSocket APIドキュメント

このAPIは、ゲームの初期化、状態更新、および再接続を行います。
WebsocketでJSON形式で送受信を行います。

## WebSocketエンドポイント

`ws://localhost/ws/pong/online/`

## 認証

WebSocket接続を確立するためには、認証が必要です。
接続を試みる前に、ユーザーが認証されていることを確認してください。
JWTトークンを使用して認証を行います。

## 1. 接続

説明: WebSocketサーバーへの接続を確立します。

### レスポンス

- 成功: 接続を受け入れ、ゲームマネージャを初期化します。
- 失敗: 適切なエラーコードで接続を閉じます。

- エラーコード:
編集中

## 2. メッセージの受信

### 初期化

説明: クライアントがゲームの初期化を要求します。

#### リクエスト:

```json
{
  "action": "initialize"
}
```

#### レスポンス:

- 成功: ゲームの初期状態を含むJSONデータを返します。

```json
{
  "game_settings": {
      "max_score"       : 3,
      "init_ball_speed" : 2,
      "max_ball_speed"  : 9.9,
      "difficulty"      : 0.5,
      "field": {
        "width" : 400,
        "height": 300
      }
  },
  "objects": {
    "ball": {
      "radius"  : 5,
      "speed"   : 2,
      "position": {
        "x": 2,
        "y": 0.2
      },
      "direction": {
        "x": 1,
        "y": 0.1
      }
    },
    "paddle1": {
      "speed"   : 10,
      "dir_y"   : 0,
      "width"   : 10,
      "height"  : 30,
      "position": {
        "x": -140.0,
        "y": 0
      }
    },
    "paddle2": {
      "speed"   : 10,
      "dir_y"   : 0,
      "width"   : 10,
      "height"  : 30,
      "position": {
        "x": 140.0,
        "y": 0}
    }
  },
  "state": {
    "score1": 0,
    "score2": 0
  },
  "is_running": true
}
```

### 再接続

説明: クライアントがゲームへの再接続を要求します。

#### リクエスト:

```json
{
  "action": "reconnect",
  "game_settings": {
    "max_score"       : 3, 
    "init_ball_speed" : 2, 
    "max_ball_speed"  : 9.9, 
    "difficulty"      : 0.5, 
    "field": {
      "width" : 400, 
      "height": 300
    }
  },
  "objects": {
    "ball": {
      "radius"  : 5, 
      "speed"   : 2, 
      "position": {
        "x": 2, 
        "y": 0.2
      }, 
      "direction": {
        "x": 1, 
        "y": 0.1
      }
    }, 
    "paddle1": {
      "speed"   : 10, 
      "dir_y"   : 0, 
      "width"   : 10, 
      "height"  : 30, 
      "position": {
        "x": -140.0, 
        "y": 0
      }
    }, 
    "paddle2": {
      "speed"   : 10, 
      "dir_y"   : 0, 
      "width"   : 10, 
      "height"  : 30, 
      "position": {
        "x": 140.0, 
        "y": 0
      }
    }
  },
  "state": {
    "score1": 0, 
    "score2": 0
  }, 
  "is_running": true
}
```

#### レスポンス:

成功: 復元されたゲーム状態を含むJSONデータを返します。

```json
{
  "game_settings": {
    "max_score"       : 3, 
    "init_ball_speed" : 2, 
    "max_ball_speed"  : 9.9, 
    "difficulty"      : 0.5, 
    "field": {
      "width" : 400, 
      "height": 300
    }
  },
  "objects": {
    "ball": {
      "radius"  : 5, 
      "speed"   : 2, 
      "position": {
        "x": 2, 
        "y": 0.2
      }, 
      "direction": {
        "x": 1, 
        "y": 0.1
      }
    }, 
    "paddle1": {
      "speed"   : 10, 
      "dir_y"   : 0, 
      "width"   : 10, 
      "height"  : 30, 
      "position": {
        "x": -140.0, 
        "y": 0
      }
    }, 
    "paddle2": {
      "speed"   : 10, 
      "dir_y"   : 0, 
      "width"   : 10, 
      "height"  : 30, 
      "position": {
        "x": 140.0, 
        "y": 0
      }
    }
  },
  "state": {
    "score1": 0, 
    "score2": 0
  }, 
  "is_running": true
}
```

### 更新

説明: クライアントがゲームの状態を更新します。

#### リクエスト:

```json
{
  "action": "update",
  "game_settings": {
    "max_score"       : 3, 
    "init_ball_speed" : 2, 
    "max_ball_speed"  : 9.9, 
    "difficulty"      : 0.5, 
    "field": {
      "width" : 400, 
      "height": 300
    }
  },
  "objects": {
    "ball": {
      "radius"  : 5, 
      "speed"   : 2, 
      "position": {
        "x": 2, 
        "y": 0.2
      }, 
      "direction": {
        "x": 1, 
        "y": 0.1
      }
    }, 
    "paddle1": {
      "speed"   : 10, 
      "dir_y"   : 0, 
      "width"   : 10, 
      "height"  : 30, 
      "position": {
        "x": -140.0, 
        "y": 0
      }
    }, 
    "paddle2": {
      "speed"   : 10, 
      "dir_y"   : 0, 
      "width"   : 10, 
      "height"  : 30, 
      "position": {
        "x": 140.0, 
        "y": 0
      }
    }
  },
  "state": {
    "score1": 0, 
    "score2": 0
  }, 
  "is_running": true
}
```

#### レスポンス:

成功: 更新されたゲーム状態を含むJSONデータを返します。

```json
{
  "game_settings": {
    "max_score"         : 3, 
    "init_ball_speed"   : 2, 
    "max_ball_speed"    : 9.9, 
    "difficulty"        : 0.5, 
    "field": {
      "width": 400, 
      "height": 300
    }
  },
  "objects": {
    "ball": {
      "radius"  : 5, 
      "speed"   : 2, 
      "position": {
        "x": 2, 
        "y": 0.2
      }, 
      "direction": {
        "x": 1, 
        "y": 0.1
      }
    }, 
    "paddle1": {
      "speed"   : 10, 
      "dir_y"   : 0, 
      "width"   : 10, 
      "height"  : 30, 
      "position": {
        "x": -140.0, 
        "y": 0
      }
    }, 
    "paddle2": {
      "speed"   : 10, 
      "dir_y"   : 0, 
      "width"   : 10, 
      "height"  : 30, 
      "position": {
        "x": 140.0, 
        "y": 0
      }
    }
  },
  "state": {
    "score1": 0, 
    "score2": 0
  }, 
  "is_running": true
}
```

エラーコード:

4400: 無効なリクエスト形式。
4500: 内部サーバーエラー。

## 3. メッセージの送信

### データ送信

説明: グループ内の全クライアントにデータを送信します。

```json
{
  "game_settings": {
    "max_score"       : 3, 
    "init_ball_speed" : 2, 
    "max_ball_speed"  : 9.9, 
    "difficulty"      : 0.5, 
    "field": {
      "width" : 400, 
      "height": 300
    }
  },
  "objects": {
    "ball": {
      "radius"  : 5, 
      "speed"   : 2, 
      "position": {
        "x": 2, 
        "y": 0.2
      }, 
      "direction": {
        "x": 1, 
        "y": 0.1
      }
    }, 
    "paddle1": {
      "speed"   : 10, 
      "dir_y"   : 0, 
      "width"   : 10, 
      "height"  : 30,
      "position": {
        "x": -140.0,
        "y": 0
      }
    },
    "paddle2": {
      "speed"   : 10,
      "dir_y"   : 0,
      "width"   : 10,
      "height"  : 30,
      "position": {
        "x": 140.0,
        "y": 0}
    }
  },
  "state": {
    "score1": 0,
    "score2": 0
  },
  "is_running": true
}
```

## 4. 切断

説明: WebSocket接続を切断します。

- クライアントによる切断: 通常のWebSocket切断手順に従います。
- サーバーによる切断: ルームグループからクライアントを削除します。

```py
async def disconnect(self, close_code):
  await self.channel_layer.group_discard(
    self.room_group_name,
    self.channel_name
	)
```
