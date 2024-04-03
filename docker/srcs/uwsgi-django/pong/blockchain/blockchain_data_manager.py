# call method of smart contructor -> save or fetch data using blockchain

from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .contract_helpers.read_and_extract_contract_info import read_and_extract_contract_info
from .contract_helpers.setup_web3_and_contract import setup_web3_and_contract
from .contract_helpers.process_game_result import process_game_result
from .contract_helpers.execute_addGameResult import execute_addGameResult
from .contract_helpers.debug_save_testnet import debug_save_testnet
from .contract_helpers.validate_request_data import validate_request_data
from .contract_helpers.get_network_settings import get_network_settings

@method_decorator(csrf_exempt, name='dispatch')
class BlockchainDataManager(View):
    def get(self, request, *args, **kwargs):
        """
        GETリクエストを受け取り、Ethereumテストネットワークからすべてのゲーム結果を取得します。

        :機能・処理:
            - Hardhat, Ganacheなどのテストネットワークから記録を取得する共通の関数です。
            - APIのURLによって、使用するテストネットワークを判別します。
                - api/save_testnet/<str:testnet_name>
            - テストネットワークの設定を読み込み、Web3インスタンスとスマートコントラクトのインスタンスを初期化します。
            - スマートコントラクトからすべてのゲーム結果を読み取り、クライアントに返します。

        :Parameters:
            - request (HttpRequest): DjangoのHttpRequestオブジェクト。GETメソッドを受け取ります。

        :Returns:
            - JsonResponse: 取得したゲーム結果のリストを含むJSONレスポンス
        """
        testnet_name = kwargs.get('testnet_name', '')

        # リクエストにクエリパラメータが含まれている場合エラー(クエリ:method GETで?以降の文字列)
        if request.GET:
            return JsonResponse({'status': 'error', 'message': 'Query parameters are not supported'}, status=400)
        # 変数宣言（default値の設定）

        try:
            # print(f"Request to fetch_testnet with testnet_name: {testnet_name}")
            w3, contract, err, = self.setup_common_resources(testnet_name)
            if err is not None:
                return err

            # すべてのゲーム結果を取得
            game_results = contract.functions.getAllGameResults().call()
            print(f"Game Results: {game_results}")

            # 結果をフォーマットする
            formatted_results = [
                {
                    'matchId': result[0],
                    'player1Score': result[1],
                    'player2Score': result[2],
                    'timestamp': result[3]
                } for result in game_results
            ]
            response_data = {'status': 'success', 'timestamp': formatted_results}

        except Exception as e:
            print(f"DEBUG: {str(e)}")
            logger.error(f"Error: {str(e)}")
            response_data = {'status': 'error', 'message': str(e)}

        return JsonResponse(response_data, json_dumps_params={'ensure_ascii': False})


    def post(self, request, *args, **kwargs):
        """
        POSTリクエストを受け取り、Ethereumテストネットワークにゲームの結果を記録します。

        :機能・処理:
            - Hardhat, Ganacheなどのテストネットワークに記録する共通の関数です。
            - APIのURLによって、使用するテストネットワークを判別します。
                - api/save_testnet/<str:testnet_name>
            - テストネットワークの設定を読み込み、Web3インスタンスとスマートコントラクトのインスタンスを初期化します。
            - その後、受け取ったゲーム結果をスマートコントラクトに記録します。
            - 処理の結果として、トランザクションのレシートが返されます。

        :Parameters:
            - request (HttpRequest): DjangoのHttpRequestオブジェクト。POSTメソッドとJSONボディを受け取ります。

        :Returns:
            - JsonResponse: トランザクションのハッシュを含むJSONレスポンス

        .. Note::
            - CSRF検証はこのビューで無効化されています(`@csrf_exempt`)
            - デバッグ情報はコンテナ内のコンソールに出力されます。
        """
        testnet_name = kwargs.get('testnet_name', '')

        # データの読み込み・検証
        data, error_response = validate_request_data(request.body)
        if error_response:
            return error_response

        try:
            w3, contract, err, = self.setup_common_resources(testnet_name)
            if err is not None:
                return err

            # 記録する。Ethereumブロックチェーン(テストネット)に。
            txn_receipt = execute_addGameResult(w3=w3,
                                                contract=contract,
                                                data=data,
                                                private_key=private_key)

            # --------------------------------------
            # コンテナのコンソールにlog出力
            response_data = debug_save_testnet(contract_address,
                                               network_url,
                                               w3.eth.chain_id,
                                               contract,
                                               txn_receipt['transactionHash'],
                                               txn_receipt)

        except Exception as e:
            response_data = {'status': 'error', 'message': str(e)}

        return JsonResponse({"message": "Data for {} saved successfully".format(testnet_name)})


    def http_method_not_allowed(self, request, *args, **kwargs):
        return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


    def setup_common_resources(self, testnet_name):
        """共通リソースの設定を行う"""

        network_url, contract_info_path, private_key = get_network_settings(testnet_name)
        if network_url is None:
            # 例: エラー応答のための情報を返す
            return None, None, None, JsonResponse({'status': 'error', 'message': 'Invalid testnet name'}, status=404)
        # print(f"Network URL: {network_url}, Contract Info Path: {contract_info_path}")

        # 設定を読み込む
        contract_address, contract_abi = read_and_extract_contract_info(contract_info_path)

        # インスタンスを生成
        w3, contract = setup_web3_and_contract(network_url,
                                               contract_address,
                                               contract_abi,
                                               private_key)

        if w3 is None or contract is None:
            return None, None, None, JsonResponse({'status': 'error', 'message': 'Failed to set up web3 or contract'}, status=500)

        print(f"Contract Address: {contract_address}")
        return w3, contract, None  # 成功時はエラーメッセージとステータスコードをNoneに


    def validate_request_data(request_body):
        """
        リクエストボディのJSONデータを検証する。
        正しい場合はデータを返し、間違っている場合はエラーのJsonResponseを返す。
        """
        try:
            data = json.loads(request_body)
            if not data or 'match_id' not in data or 'player_1_score' not in data or 'player_2_score' not in data:
                return None, JsonResponse({'status': 'error', 'message': 'Invalid data'}, status=400)

            if data['match_id'] < 0 or data['player_1_score'] < 0 or data['player_2_score'] < 0:
                return None, JsonResponse({'status': 'error', 'message': 'Negative scores are not allowed'}, status=400)

            return data, None

        except json.JSONDecodeError:
            return None, JsonResponse({'status': 'error', 'message': 'Invalid JSON format'}, status=400)
