# Tips

## ブックマークバーにタイトル付きでURLコピー機能を追加 

- リンクを貼る時に活用してます  
  
- やり方
  - テキトーなページをブックマークする  
  - そのブックマークを `編集` し、 `URL` を下記にして保存する。 `名前` は copy とかテキトーで。  
  ```javascript:function Debianorgdarakeclipboard(){    navigator.clipboard.writeText("参考:【"+document.title+"】 "+location.href);};Debianorgdarakeclipboard();```  
  - 登録したベージを呼び出すようにブックマークボタンをクリックするとクリップボードにコピーされる
- 参考:【開いているページのタイトルとURLをコピーするブックマークレット | Blue-Scre{7}n.net | よそいちのDTPメモ】 https://blue-screeeeeeen.net/utility/20190122.html 