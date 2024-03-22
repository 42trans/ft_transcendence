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
- 統合テスト
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

## MEMO

- assertNotEqual(a, b): a と b が等しくないことを確認します。
- assertTrue(x): x が True であることを確認します。
- assertFalse(x): x が False であることを確認します。
- assertIs(a, b): a が b と同じオブジェクト（is を使用して比較）であることを確認します。
- assertIsNone(x): x が None であることを確認します。
- assertIn(a, b): a が b の中に存在することを確認します（b はリストや辞書のキーなど、メンバシップをテストできるオブジェクト）。
- assertIsInstance(a, TYPE): a が TYPE 型であることを確認します。
- assertRaises(Error, func, *args, **kwargs): func を呼び出した際に特定のエラーが発生することを確認します。

## idea

```
### 1. スマートコントラクトのデプロイメント

- **デプロイメント成功**: スマートコントラクトがテストネットワークに正常にデプロイされるか。
- **デプロイメント失敗**: 不正なパラメータやコードによるデプロイメント失敗をシミュレートし、適切なエラー処理が行われるか。

### 2. スマートコントラクトとのインタラクション

- **関数呼び出し**: スマートコントラクトの公開関数や変数へのアクセスが正常に行えるか。
- **トランザクション実行**: スマートコントラクトの関数をトランザクションとして実行し、結果が正しく反映されるか。
- **イベントの監視**: スマートコントラクトから発生したイベントを適切にキャッチできるか。

### 3. ネットワークとの通信

- **接続の確立**: 指定したテストネットワークへの接続が正常に行われるか。
- **接続の断絶**: ネットワーク接続が不安定または中断した場合の処理が適切に行われるか。
- **ガス価格の推定**: トランザクション実行時のガス価格が正確に推定されるか。

### 4. ユーザーとのインタラクション

- **ユーザー入力の検証**: スマートコントラクト関数への不正な入力が適切にハンドルされるか。
- **UI/UX**: ユーザーがスマートコントラクトと対話するプロセスが直感的かつ安全であるか。

### 5. セキュリティとエラーハンドリング

- **リバートトランザクション**: トランザクションがリバートされた場合、それが適切にハンドルされ、ユーザーに通知されるか。
- **権限の検証**: 権限が必要なスマートコントラクトの関数が、不適切なアクセスから守られているか。

### 6. データの整合性と永続性

- **ブロックチェーンデータの取得**: スマートコントラクトから取得したデータが正確であり、アプリケーション内で適切に処理されるか。
- **データベースとの同期**: 必要に応じて、ブロックチェーンのデータとDjangoのデータベース間でデータが同期されるか。

これらのテストケースは、Djangoを使ったブロックチェーンアプリケーションの開発における一般的なシナリオをカバーしています。実際のプロジェクトにおいては、アプリケーションの具体的な機能やビジネスロジックに応じて、これらのシナリオをさらにカスタマイズし拡張することが必要になるでしょう。
```
