# API仕様書

## 1. Basic認証

### 1-1) ユーザー登録: Signup API
- ユーザー登録を行うためのAPI

### Endpoint
- path: `/accounts/api/signup/`
- name: `api_accounts:api_signup`

### Permissions
- 認証されていないユーザーもアクセス可能（`AllowAny`）

### POST

#### Request Parameters

| パラメータ    | 型     | 説明                   | 必須 |
|-----------|------|----------------------|--|
| `email`   | 文字列 | 登録に使用するメールアドレス    | Yes |
| `nickname`| 文字列 | ユーザーのニックネーム         | Yes |
| `password1`| 文字列 | パスワード                | Yes |
| `password2`| 文字列 | パスワード（確認用）          | Yes |

#### Responses
##### 200 OK
- ユーザー登録が成功した場合や、ユーザーが既にログインしている場合に返されます
```json
// 登録に成功した場合
{
    "message": "Signup successful",
    "redirect": "/pong/"
}

// 既にログインしている場合
{
    "message": "Already logged in",
    "redirect": "/pong/"
}
```

##### 400 Bad Request
- パスワードが一致しない場合、またはメールアドレス、ニックネーム、パスワードが無効な場合に返されます
```json
{
    "message": error_message
}
```

##### 500 Internal Server Error
- ユーザーの作成中に予期せぬエラーが発生した場合に返されます
```json
{
    "message": error_message
}
```

<br>

### 1-2) ログイン: Basic Login API
- ユーザーのログイン認証(Basic)を行うためのAPIです
- 認証完了すると、認証情報が`IsAuthenticated`になります

### Endpoint
- path: `/accounts/api/login/`
- name: `api_accounts:api_login`

### Permissions
- 認証されていないユーザーもアクセス可能（`AllowAny`）

### GET
#### Responses
##### 200 OK
- ログインが成功した場合や、ユーザーが既にログインしている場合に返されます
- ユーザーが2FAを有効にしている場合、2FAの認証が求められます
```json
// ログインに成功した場合（2FA無効ユーザー）
{
  "message": "Basic authentication successful",
  "redirect": "/accounts/user/"
}

// ログインに成功した場合（2FA有効ユーザー）
{
  "message": "2fa authentication needed",
  "redirect": "/accounts/verify/verify_2fa/"
}

// すでにログインしている場合
{
  "message": "Already logged in",
  "redirect": "/pong/"
}
```

##### 401 Unauthorized
- 不正なログイン情報を送信された場合に返されます
```json
{
  "error": "Invalid credentials"
}
```

<br>

### 1-3) ログアウト: Logout API
- ユーザーのログイン認証(Basic)をを解除するためのAPIです

### Endpoint
- path: `/accounts/api/logout/`
- name: `api_accounts:api_logout`
- 
### Permissions
- 認証されているユーザーのみアクセス可能（`IsAuthenticated`）

### POST
#### Request Parameters

| パラメータ   | 型     | 説明  | 必須 |
|---------|------|-----|--|
| -   | - | -  | -  |

#### Responses
##### 200 OK
- ログアウトが成功した場合に返されます
```json
{
  "message": "You have been successfully logout",
  "redirect": "/pong/"
}
```

##### 401 Unauthorized
- ログインしていないユーザーによるリクエストに対し返されます
```json
{
  "detail": "Authentication credentials were not provided."
}
```

<br>

## 2. 2段階認証
### 2-1) 登録: Enable 2FA
- 2FA登録用のAPI

### Endpoint
- path: `/accounts/api/enable_2fa/`
- name: `api_accounts:api_enable_2fa`

### Permissions
- 認証されているユーザーのみアクセス可能（`IsAuthenticated`）

### GET
#### Responses
##### 200 OK
- 2FA登録用のOTPデータの取得に成功した場合や、既に2FAが有効なユーザーに対して返されます
```json
// 2FA登録用のOTPデータの取得に成功
{
  "qr_code_data": qr_code_data,
  "setup_key": secret_key_base32
}

// 既に2FAが有効なユーザー
{
  "message": "Already enabled 2FA",
  "redirect": "/pong/"
}
```

##### 401 Unauthorized
- ログインしていないユーザーによるリクエストに対し返されます
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### POST
#### Request Parameters

| パラメータ   | 型     | 説明            | 必須 |
|---------|------|---------------|--|
| `token` | 文字列 | 認証用のOTP（6桁数字） | Yes |

#### Responses
##### 200 OK
- 2FA登録用のOTPデータの認証に成功した場合や、既に2FAが有効なユーザーに対して返されます
```json
// 2FA登録用のOTPデータの取得に成功
{
  "message": "2FA has been enabled successfully",
  "redirect": "/accounts/user/"
}

// 既に2FAが有効なユーザー
{
  "message": "Already enabled 2FA",
  "redirect": "/pong/"
}
```

##### 400 Bad Request
- 不正なOTPを送信した際に返されます
```json
{
  "error": "Invalid token provided"
}
```

##### 401 Unauthorized
- ログインしていないユーザーによるリクエストに対し返されます
```json
{
  "detail": "Authentication credentials were not provided."
}
```

<br>

### 2-2) 認証: Verify 2FA
- 2FA認証用のAPI
- 2FAを有効にしているユーザーは、Basicログイン後にこのAPIでOTPの認証が求められます

### Endpoint
- path: `/accounts/api/verify_2fa/`
- name: `api_accounts:api_verify_2fa`

### Permissions
- 認証されているユーザーのみアクセス可能（`IsAuthenticated`）

### POST
#### Request Parameters

| パラメータ   | 型     | 説明            | 必須 |
|---------|------|---------------|--|
| `token` | 文字列 | 認証用のOTP（6桁数字） | Yes |

#### Responses
##### 200 OK
- OTPが認証できた場合に返されます
```json
{
  "message": "2FA verification successful",
  "redirect": "/accounts/user/"
}
```

##### 400 Bad Request
- 不正なOTPを送信した際に返されます
```json
{
  "error": "Invalid token"
}
```

##### 401 Unauthorized
- ログインしている2FA無効ユーザーや、ログインしていないユーザーによるリクエストに対し返されます
```json
// ログインしている2FA無効ユーザー
{
  "error": "No valid session found",
  "redirect": "/accounts/login/"
}

// ログインしていないユーザー
{
  "detail": "Authentication credentials were not provided."
}
```

<br>


### 2-3) 登録解除: Disable 2FA
- 2FA登録解除用のAPI

### Endpoint
- path: `/accounts/api/disable_2fa/`
- name: `api_accounts:api_disable_2fa`

### Permissions
- 認証されているユーザーのみアクセス可能（`IsAuthenticated`）

### GET
### Redirects
- 2FAの無効化処理が完了した後、ユーザーはユーザーページ（`accounts:user`）にリダイレクトされます。

### Response
#### 302 Found
- ログイン済みの2FAを無効にしているユーザーの場合、ユーザーページにリダイレクトします
- 2FAが有効なユーザーは、2FAを無効化した後、ユーザーページにリダイレクトします

##### 401 Unauthorized
- ログインしていないユーザーによるリクエストに対し返されます


## 3. ユーザー情報
### 3-1) 情報取得: user
- ユーザー情報を取得するAPIです

### Endpoint
- path: `/accounts/api/user/profile/`
- name: `api_accounts:api_user_profile`

### Permissions
- 認証されているユーザーのみアクセス可能（`IsAuthenticated`）

### GET
#### Responses
##### 200 OK
- 正常にユーザー情報が取得でき場合に返されます
```json
{
  "email": user_email,
  "nickname": user_nickname,
  "enable_2fa": user_enable_2fa
}
```

##### 401 Unauthorized
- ログインしていないユーザーによるリクエストに対し返されます
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 3-2) 編集: edit
- ユーザー情報を編集するAPIです
- ニックネーム or パスワードを変更できます

### Endpoint
- path: `/accounts/api/user/edit-profile/`
- name: `api_accounts:api_edit_profile`

### Permissions
- 認証されているユーザーのみアクセス可能（`IsAuthenticated`）

### POST
#### Request Parameters
- `nickname` or (`new_password` and `current_password`) が必須です

| パラメータ               | 型     | 説明            | 必須 |
|---------------------|------|---------------|--|
| `nickname`          | 文字列 | 新しいニックネーム   | ニックネーム変更の場合に必須 |
| `new_password`     | 文字列 | 新しいパスワード      | パスワード変更の場合に必須 |
| `current_password` | 文字列 | 現在のパスワード      | パスワード変更の場合に必須 |

#### Responses
##### 200 OK
- ニックネーム or パスワードが正常に変更された場合に返されます
```json
{
  "message": message
}
```

##### 400 Bad Request
- 不正な入力値が送信された場合に返されます
```json
{
  "error": error_message
}
```

##### 401 Unauthorized
- ログインしていないユーザーによるリクエストに対し返されます
```json
{
  "detail": "Authentication credentials were not provided."
}
```

<br>

## 4. JWT
### 4-1) JWT Refresh
- Json Web Tokenの有効期限を更新するAPIです

### Endpoint
- path: `/accounts/api/token/refresh/`
- name: `api_accounts:api_token_refresh`

### Permissions
- 認証されていないユーザーもアクセス可能（`AllowAny`）

### POST
#### Responses
##### 200 OK
- JWTの更新が正常に完了した場合に返されます
- 更新したJWTはCookieにセットされます
```json
{
  "message": "Token refreshed successfully"
}
```

##### 401 Unauthorized
- JWTを保持していないユーザーや、RefreshTokenの有効期限切れのユーザーに対し返されます
```json
{
  "error": error_message
}
```
