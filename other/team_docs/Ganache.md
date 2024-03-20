# Ganache

![alt text](<img/スクリーンショット 2024-03-21 4.05.41.png>)
![alt text](<img/スクリーンショット 2024-03-21 6.35.40.png>)

## cmd

- ganache にデプロイ
  - make hardhat_deploy_ganache 
    - docker exec hardhat npx hardhat run scripts/deploy.ts --network ganache
  - build blockchain時に自動実行
- 再起動時に試合結果を20件登録
  - make test_ganache
  - build blockchain時に自動実行

- test
  - make test_ganache

## install
  
- host machineにインストール
  - npm install -g ganache-cli

## 参考

  - 参考:【Ethereum のローカル開発環境 Ganache を使ってみる #Blockchain - Qiita】 https://qiita.com/kyrieleison/items/8ef926faa4defa8fe930