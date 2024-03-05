#!/bin/bash
#=======================================================
# include
#=======================================================
TEST_DIR="test/"
if [ -z "$COLOR_SH" ]; then
  source "${TEST_DIR}color.sh"
  COLOR_SH=true
fi
#=======================================================
# kind-kind コンテキストに設定
kubectl config use-context kind-kind
#=======================================================
# クラスターがアクセス可能か確認
# echo "クラスターの状態"
# kubectl cluster-info --context kind-kind
# if kubectl cluster-info --context kind-kind; then
#     echo "${ESC}${GREEN}ok"
#     echo "${ESC}${COLOR198}"
# else
#     echo "${ESC}${RED}ng"
#     echo "${ESC}${COLOR198}"
# fi
#=======================================================
# すべてのノードが Ready 状態であるか確認
echo "ノードの状態"
NOT_READY=$(kubectl get nodes | grep -v 'Ready' | wc -l)
if [ "$NOT_READY" -eq "1" ]; then # "1" はヘッダ行を除外するため
    echo "${ESC}${GREEN}ok"
    echo "${ESC}${COLOR198}"
else
    echo "${ESC}${RED}ng"
    echo "${ESC}${COLOR198}"
fi
#=======================================================
# Prometheus ポッドが Running 状態であるか確認
echo "Prometheusの状態"
PROM_STATUS=$(kubectl get pods --namespace default -l "app.kubernetes.io/name=prometheus,app.kubernetes.io/instance=prometheus" -o jsonpath="{.items[*].status.phase}")
if [ "$PROM_STATUS" = "Running" ]; then
    echo "${ESC}${GREEN}ok"
    echo "${ESC}${COLOR198}"
else
    echo "${ESC}${RED}ng"
    echo "${ESC}${COLOR198}"
fi

# kubectl get svc | grep grafana

kubectl port-forward service/grafana 3000:80 &
#=======================================================
# ブラウザで確認
#=======================================================
PORT=9090
export POD_NAME=$(kubectl get pods --namespace default -l "app.kubernetes.io/name=prometheus,app.kubernetes.io/instance=prometheus" -o jsonpath="{.items[0].metadata.name}")
# 閲覧時間
TIME=1000
echo "port-forward 開始"
echo "${ESC}${GREEN}"
echo "${TIME}秒間prometheusにアクセス可能"
# port-forward バックグラウンドで実行
kubectl --namespace default port-forward $POD_NAME $PORT &
sleep 2
if [[ "$OSTYPE" == "darwin"* ]]; then
    # open: macは自動でブラウズ起動
    open http://localhost:$PORT
else
    echo "ブラウザを起動し、http://localhost:$PORT を開いてください。"
fi
sleep $TIME
echo "${ESC}${RED}"
echo "終了"
echo "${ESC}${COLOR198}"
echo "以降、prometheusにアクセスできなくなります"
pkill -f "kubectl --namespace default port-forward $POD_NAME $PORT"


# エンドポイントを探す
# kubectl get svc prometheus-server -n default
# kubectl describe svc prometheus-server -n default

