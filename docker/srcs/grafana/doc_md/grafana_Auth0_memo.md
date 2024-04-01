
- github経由の登録　user画面  
![alt text](<img_auth/スクリーンショット 2024-04-01 8.04.40.png>)

- github Settings Developer settings ft_trans_grafana
  - 参考:【Developer applications】 <https://github.com/settings/developers>  
![alt text](<img_auth/スクリーンショット 2024-04-01 8.17.04.png>)

- Spotify 
  - 参考:【Dashboard | Spotify for Developers】 <https://developer.spotify.com/dashboard>  
![alt text](<img_auth/スクリーンショット 2024-04-01 8.41.25.png>)

- Discord
  - 参考:【Discord Developer Portal — My Applications】 <https://discord.com/developers/applications>  
  ![alt text](<img_auth/スクリーンショット 2024-04-01 9.06.24.png>)  
  ![alt text](<img_auth/スクリーンショット 2024-04-01 9.04.39.png>)  

### link

- Auth0
  - social
    - 参考:【Application Details】 <https://manage.auth0.com/dashboard/us/dev-jb2wfmp3mth8halz/applications/EZxGEXDXUNeZycoVUMQRBfleDL4AwRu4/connections>
    - 参考:【Social Connections】 <https://manage.auth0.com/dashboard/us/dev-jb2wfmp3mth8halz/connections/social>
  - outh2
    - 参考:【Application Details】 <https://manage.auth0.com/dashboard/us/dev-jb2wfmp3mth8halz/applications/EZxGEXDXUNeZycoVUMQRBfleDL4AwRu4/settings>
    - port番号ごとに作る
      - 主にcallback URLsを設定するだけ ex. `https://localhost:3032/login/generic_oauth`
      - Auth0のcallbackはlocalへ　`localhost/login/generic_oauth` ※連携するサービスはAuth0宛　下記参照
- github
  - app追加
    - 参考:【Developer applications】 <https://github.com/settings/developers>
    - Homepage URLはホストがブラウザアクセスする時のものを設定。多分なんでも良い？ ex.`https://localhost:3032/`
    - callbackはAuth0へ ex. `https://dev-jb2wfmp3mth8halz.us.auth0.com/login/callback`
- Discord
  - developersサイトへ行ってapp追加
    - 参考:【Discord Developer Portal — My Applications】 <https://discord.com/developers/applications>
  - OAuth2で設定
    - callbackはAuth0へ ex. `https://dev-jb2wfmp3mth8halz.us.auth0.com/login/callback`
- Spotify
  - developer.spotify.com/dashboard に行って設定する
    - 参考:【Dashboard | Spotify for Developers】 <https://developer.spotify.com/dashboard>  
  - create app で　githubと同様に
    - callbackはAuth0へ ex. `https://dev-jb2wfmp3mth8halz.us.auth0.com/login/callback`
    - APIs used:Web API