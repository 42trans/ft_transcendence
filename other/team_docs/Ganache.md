# Ganache

## cmd

- ganache にデプロイ時
  - make hardhat_deploy_ganache 
    - docker exec hardhat npx hardhat run scripts/deploy.ts --network ganache
  - make Re-setup にまとめて行うように設定した

## install
  
- host machineにインストール
  - npm install -g ganache-cli

## 参考

  - 参考:【Ethereum のローカル開発環境 Ganache を使ってみる #Blockchain - Qiita】 https://qiita.com/kyrieleison/items/8ef926faa4defa8fe930