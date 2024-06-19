# Friend API

## 1. Send Friend Request API
- ユーザーIDを指定して友人申請を送信するAPIです
- 友人申請関係がなく友人関係にない場合、Friend object(status=PENDING)を作成

### Endpoint
- path: `/accounts/api/friend/send-request/<int:user_id>/`
- name: `api_accounts:send_friend_request`

### Permissions
- 認証されているユーザーのみアクセス可能（`IsAuthenticated`）

### POST
####  Responses
##### 200 OK
- 友人申請の送信に成功した場合に返されます

```json
{
  "status": "Friend request sent successfully"
}
```

##### 400 Bad Request
- 自分自身に友人申請を送信した場合、既に友人の場合、既に友人申請が送信済みの場合に返されます

```json
{
  "error": error_message
}
```

##### 401 Unauthorized
- 不正なログイン情報を送信された場合に返されます
```json
{
  "error": "Invalid credentials"
}
```

##### 500 Internal Server Error
- 予期せぬエラーが発生した場合に返されます

```json
{
  "error": error_message
}
```

<br>

## 2. Cancel Friend Request API
- 送信済みの友人申請をキャンセルするAPIです

### Endpoint
- path: `/accounts/api/friend/cancel-request/<int:user_id>/`
- name: `api_accounts:cancel_friend_request`

### Permissions
- 認証されているユーザーのみアクセス可能（`IsAuthenticated`）

### POST
#### Responses
##### 200 OK
- 友人申請のキャンセルに成功した場合に返されます

```json
{
  "status": "Friend request cancelled"
}
```

##### 400 Bad Request
- 指定したユーザーが存在しない場合、友人申請が見つからない場合、すでに友人関係の場合に返されます

```json
{
  "error": error_message
}
```

##### 401 Unauthorized
- 不正なログイン情報を送信された場合に返されます
```json
{
  "error": "Invalid credentials"
}
```

##### 500 Internal Server Error
- 予期せぬエラーが発生した場合に返されます

```json
{
  "error": error_message
}
```

<br>

## 3. Accept Friend Request API
- 受信した友人申請を承認するAPIです

### Endpoint
- path: `/accounst/api/friend/accept-request/<int:user_id>/`
- name: `api_accounts:accept_friend_request`

### Permissions
- 認証されているユーザーのみアクセス可能（`IsAuthenticated`）

### POST
#### Responses
##### 200 OK
- 友人申請の承認に成功した場合に返されます

```json
{
  "status": "Success: accept request"
}
```

##### 400 Bad Request
- 指定したユーザーが存在しない場合、友人申請が見つからない場合、すでに友人関係の場合に返されます

```json
{
  "error": error_message
}
```

##### 401 Unauthorized
- 不正なログイン情報を送信された場合に返されます
```json
{
  "error": "Invalid credentials"
}
```

##### 500 Internal Server Error
- 予期せぬエラーが発生した場合に返されます

```json
{
  "error": error_message
}
```

<br>

## 4. Reject Friend Request API
- 受信した友人申請を拒否するAPIです

### Endpoint
- path: `/accounts/api/friend/reject-request/<int:user_id>/`
- name: `api_accounts:reject_friend_request`

### Permissions
- 認証されているユーザーのみアクセス可能（`IsAuthenticated`）

### POST
#### Responses
##### 200 OK
- 友人申請の拒否に成功した場合に返されます

```json
{
  "status": "Success: reject request"
}
```

##### 400 Bad Request
- 指定したユーザーが存在しない場合、友人申請が見つからない場合、すでに友人関係の場合に返されます

```json
{
  "error": error_message
}
```

##### 401 Unauthorized
- 不正なログイン情報を送信された場合に返されます
```json
{
  "error": "Invalid credentials"
}
```

##### 500 Internal Server Error
- 予期せぬエラーが発生した場合に返されます

```json
{
  "error": error_message
}
```

<br>


## 5. Delete Friend API
- 友人関係を削除するAPIです

### Endpoint
- path: `/accounts/api/friend/delete/<int:user_id>/`
- name: `api_accounts:delete_friend`

### Permissions
- 認証されているユーザーのみアクセス可能（`IsAuthenticated`）

### POST
#### Responses
##### 200 OK
- 友人関係の削除に成功した場合に返されます

```json
{
  "status": "Success: delete friend"
}
```

##### 400 Bad Request
- 指定したユーザーが存在しない場合、友人関係が見つからない場合に返されます

```json
{
  "error": error_message
}
```

##### 401 Unauthorized
- 不正なログイン情報を送信された場合に返されます
```json
{
  "error": "Invalid credentials"
}
```

##### 500 Internal Server Error
- 予期せぬエラーが発生した場合に返されます

```json
{
  "error": error_message
}
```

<br>

## 6. Get Friend List API
- userの友人一覧を取得するAPIです

### Endpoint
- path: `/accounts/api/friend/list/`
- name: `api_accounts:friend_list`

### Permissions
- 認証されているユーザーのみアクセス可能（`IsAuthenticated`）

### GET
#### Responses
##### 200 OK
- 友人一覧の取得に成功した場合に返されます

| フィールド名 | 型       | 説明          |
|----------|--------|-------------|
| `friends` | array  | 友人情報の配列     |
| `id`      | integer | 友人のユーザーID   |
| `nickname` | string | 友人のニックネーム   |
| `status`  | boolean | 友人のオンライン状態  |

```json
{
  "friends": [
    {
      "id"      : friend_id,
      "nickname": friend_nickname,
      "status"  : friend_online_status
    },
    ...
  ]
}
```

##### 400 Bad Request
- ユーザーが見つからない場合、友人関係が見つからない場合に返されます

```json
{
  "error": error_message
}
```

##### 401 Unauthorized
- 不正なログイン情報を送信された場合に返されます
```json
{
  "error": "Invalid credentials"
}
```

##### 500 Internal Server Error
- 予期せぬエラーが発生した場合に返されます

```json
{
  "error": error_message
}
```

<br>

## 7. Get Friend Request List API
- 送信・受信したPending状態の友人申請一覧を取得するAPIです

### Endpoint
- path: `/accounts/api/friend/requests/`
- name: `api_accounts:friend_requests`

### Permissions
- 認証されているユーザーのみアクセス可能（`IsAuthenticated`）

### GET
#### Responses
##### 200 OK
- 友人申請一覧の取得に成功した場合に返されます

| フィールド名              | 型       | 説明          |
|---------------------|--------|-------------|
| `sent_requests`     | array  | 送信した友人申請の配列 |
| `received_requests` | array  | 受信した友人申請の配列 |
| `id`                | integer | 友人のユーザーID   |
| `nickname`          | string | 友人のニックネーム   |
| `status`            | boolean | 友人のオンライン状態  |

```json
{
  "sent_requests": [
    {
      "friend_id": friend_id, 
      "nickname" : friend_nickname
    },
    ...
  ],
  "received_requests": [
    {
      "friend_id": friend_id,
      "nickname" : friend_nickname
    },
    ...
  ]
}
```

##### 401 Unauthorized
- 不正なログイン情報を送信された場合に返されます
```json
{
  "error": "Invalid credentials"
}
```

##### 500 Internal Server Error
- 予期せぬエラーが発生した場合に返されます

```json
{
  "error": error_message
}
```
