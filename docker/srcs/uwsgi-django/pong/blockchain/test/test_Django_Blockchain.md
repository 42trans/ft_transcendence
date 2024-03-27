# test_Django_Blockchain

## rule

- test/にまとめる
  - from django.test import TestCase でDjangoの機能を使用する
    - Djangoに対して自動で行われる
    - `make test_django_test_py` or `docker exec uwsgi-django /bin/sh -c "python manage.py test" > test/result/test_py_results.txt`  

## case

- 単体テスト
  - save request  
    - docker/srcs/uwsgi-django/pong/blockchain/local_testnet/test/test_unit_save_validate_request.py
  - setup contract
    - docker/srcs/uwsgi-django/pong/blockchain/local_testnet/test/test_unit_setup_web3.py

- 統合テスト(local testnet)
  - Ganache
    - save
      - docker/srcs/uwsgi-django/pong/blockchain/local_testnet/test/test_ganash_save.py
    - fetch  
      - docker/srcs/uwsgi-django/pong/blockchain/local_testnet/test/test_ganache_fetch.py  
  - Hardhat  
    - save
      - docker/srcs/uwsgi-django/pong/blockchain/local_testnet/test/test_hardhat_save.py
    - fetch
      - docker/srcs/uwsgi-django/pong/blockchain/local_testnet/test/test_hardhat_fetch.py  

## URL link

- sepoliaに接続するAPIキーを見たい時 (INFURA)
  - 参考:【Ethereum API | IPFS API & Gateway | ETH Nodes as a Service | Infura】 https://app.infura.io/
- sepoliaに登録した公開データを見たい時
  - 参考:【TESTNET Sepolia (ETH) Blockchain Explorer】 https://sepolia.etherscan.io/
    - transactionHash の値で検索する
      - 'transactionHash': HexBytes('0x042613701edc90048198338b5b23a63c9adb35a8697362903096bc4b5891cd01')
    - logs タブをクリックする
    　-  reciept で受け取った 'data': HexBytes('0x00000000000000000 の箇所と同じデータが表示される

## MEMO

- assertNotEqual(a, b): a と b が等しくないことを確認します。
- assertTrue(x): x が True であることを確認します。
- assertFalse(x): x が False であることを確認します。
- assertIs(a, b): a が b と同じオブジェクト（is を使用して比較）であることを確認します。
- assertIsNone(x): x が None であることを確認します。
- assertIn(a, b): a が b の中に存在することを確認します（b はリストや辞書のキーなど、メンバシップをテストできるオブジェクト）。
- assertIsInstance(a, TYPE): a が TYPE 型であることを確認します。
- assertRaises(Error, func, *args, **kwargs): func を呼び出した際に特定のエラーが発生することを確認します。