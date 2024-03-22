# Major module: Store the score of a tournament in the Blockchain.  

主要モジュール：トーナメントのスコアをブロックチェーンに保存する。

## This Major module focuses on implementing a feature within the Pong website to store tournament scores securely on a blockchain. It is essential to clarify that for development and testing purposes, we will utilize a testing blockchain environment.  

この主要モジュールは、Pongウェブサイト内にトーナメントスコアをブロックチェーン上に安全に保存する機能を実装することに焦点を当てています。開発およびテスト目的のために、テストブロックチェーン環境を利用することが重要です。

- テストブロックチェーン環境; Hardhat stand-alone, Ganache test-network

## The chosen blockchain for this implementation is Ethereum , and Solidity will be the programming language used for smart contract development.  

この実装に選ばれたブロックチェーンはEthereumであり、スマートコントラクト開発にはSolidityが使用されます。  

- Ethereum: Yes
  - Hardhat is a development environment for Ethereum software. It consists of different components for editing, compiling, debugging and deploying your smart contracts and dApps, all of which work together to create a complete development environment.  
  Hardhat はイーサリアム ソフトウェアの開発環境です。これは、スマート コントラクトと dApps を編集、コンパイル、デバッグ、デプロイするためのさまざまなコンポーネントで構成されており、すべてが連携して完全な開発環境を作成します。  
  参考:【Documentation | Ethereum development environment for professionals by Nomic Foundation】 https://hardhat.org/docs
  - Ganache is a personal blockchain for rapid Ethereum and Filecoin distributed application development. You can use Ganache across the entire development cycle; enabling you to develop, deploy, and test your dApps in a safe and deterministic environment.  
  Ganache は、イーサリアムとファイルコインの分散アプリケーションを迅速に開発するためのパーソナル ブロックチェーンです。Ganache は開発サイクル全体にわたって使用できます。これにより、安全かつ決定的な環境で dApp を開発、展開、テストできるようになります。  
  参考:【Ganache | Overview - Truffle Suite】 https://archive.trufflesuite.com/docs/ganache/

- Solidity: Hardhatで開発
  - Easily deploy your contracts, run tests and debug Solidity code without dealing with live environments. Hardhat Network is a local Ethereum network designed for development.  
  ライブ環境を扱うことなく、コントラクトのデプロイ、テストの実行、Solidity コードのデバッグが簡単に行えます。Hardhat Network は、開発用に設計されたローカル Ethereum ネットワークです。  
  参考:【Hardhat | Ethereum development environment for professionals by Nomic Foundation】 https://hardhat.org/

### ◦Blockchain Integration: The primary goal of this module is to seamlessly inte-grate blockchain technology, specifically Ethereum , into the Pong website.This integration ensures the secure and immutable storage of tournament scores, providing players with a transparent and tamper-proof record of their gaming achievements.  

ブロックチェーン統合：このモジュールの主な目的は、ブロックチェーン技術、特にEthereumをPongウェブサイトにシームレスに統合することです。この統合により、トーナメントスコアの安全かつ不変の保存が保証され、プレイヤーには透明で改ざんのできないゲーム成績の記録が提供されます。

- シームレス統合:
  - インターフェース: API, JSON形式
  - フレームワーク: Django + web3ライブラリ
    - Web3ライブラリ:EthereumベースのプロジェクトをPythonで扱うためのライブラリ

![alt text](<../img/スクリーンショット 2024-03-21 4.05.41.png>)

## ◦Solidity Smart Contracts: To interact with the blockchain, we will develop Solidity smart contracts. These contracts will be responsible for recording, managing, and retrieving tournament scores.  

Solidityスマートコントラクト：ブロックチェーンとのやり取りを行うために、Solidityスマートコントラクトを開発します。これらの契約は、トーナメントスコアの記録、管理、および取得を担当します。

- スマートコントラクト: Hardhatで開発、deploy
  - ファイル: docker/srcs/hardhat/hardhat_pj/contracts/PongGameResult.sol
  - Hardhat Runner は、Hardhat を使用するときに操作する主なコンポーネントです。これは、スマート コントラクトと dApps の開発に固有の繰り返しタスクの管理と自動化に役立つ、柔軟で拡張可能なタスク ランナーです。  
  参考:【Getting started with Hardhat | Ethereum development environment for professionals by Nomic Foundation】 https://hardhat.org/hardhat-runner/docs/getting-started#overview


## ◦Testing Blockchain: As mentioned earlier, a testing blockchain will be em-ployed for development and testing purposes. This ensures that all blockchain-related functionalities are thoroughly validated without any risks associated with a live blockchain.  

テストブロックチェーン：前述のように、開発およびテスト目的のためにテストブロックチェーンが使用されます。これにより、ライブブロックチェーンに関連するリスクなしに、すべてのブロックチェーン関連の機能が徹底的に検証されます。

- テストブロックチェーン:
  - ローカル: Hardhat, Ganache
    - 検証項目: 保存、取得
  - 公開テストネット: 未定

## ◦Interoperability: This module may have dependencies on other modules, par-ticularly the Backend Framework module. Integrating blockchain functional-ity might necessitate adjustments in the backend to accommodate interactions with the blockchain.  

相互運用性：このモジュールは他のモジュール、特にバックエンドフレームワークモジュールに依存する可能性があります。ブロックチェーン機能の統合は、ブロックチェーンとの相互作用を収容するためにバックエンドの調整を必要とするかもしれません。

- バックエンドフレームワーク: Django + web3パッケージ

## By implementing this module, we aim to enhance the Pong website by introducing a blockchain-based score storage system. Users will benefit from the added layer of security and transparency, ensuring the integrity of their gaming scores. The module emphasizes the use of a testing blockchain environment to minimize risks associated with blockchain development  

このモジュールを実装することで、ブロックチェーンベースのスコア保存システムを導入することにより、Pongウェブサイトを強化することを目指しています。ユーザーは、セキュリティと透明性の追加された層から利益を得ることができ、彼らのゲームスコアの整合性が保証されます。このモジュールは、ブロックチェーン開発に関連するリスクを最小限に抑えるために、テストブロックチェーン環境の使用を強調しています。

- テスト環境の安全性: ローカルマシン内で完結