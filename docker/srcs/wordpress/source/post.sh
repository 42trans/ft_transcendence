#!/bin/bash
# srcs/wordpress/source/post.sh
# -----------------------------------------------
# DEBUG
# -----------------------------------------------
# echo "post.sh start"
# echo $WORDPRESS_PATH 
# --------------------------------
# 記事が既に存在するか確認
# --------------------------------
check_post_exists_by_image_number() {
	# basename = 用意した画像のファイル名は連番の数字にしている
	image_basename=$1
	# WordPressの投稿一覧を取得
		# メタキーに基づいて検索
		# 変数の値と一致するメタ値を検索
		# 取得するフィールド
	post_id=$(php wp-cli.phar post list \
		--meta_key="image_number" \
		--meta_value="$image_basename" \
		--field=ID \
		--format=ids \
		--path=$WORDPRESS_PATH \
		--allow-root)
	# DEBUG
	echo "$post_id"
}

# --------------------------------
# 記事を投稿
# --------------------------------
post_article() {
	# 画像ファイル名 = 番号
	image_basename=$1
	# タイトル
	title=$2
	# 記事内容１大きな文字列
	content=$3
	# 記事内容２普通サイズの文字列
	extra=$4

	# 画像番号で記事の存在をチェックする関数を呼び出しidを取得
	existing_post_id=$(check_post_exists_by_image_number "$image_basename")
	# すでに記事が存在する場合何もしない
	if [[ -n "$existing_post_id" ]]; then
		return
	fi

	# 内容を格納
	image_file="/var/www/source/img/${image_basename}.png"
	full_content="<h2>${content}</h2><p style='font-size: larger;'>${extra}</p>"

	# 記事を作成し、post_idを取得する
	# --post_status=publish:　公開
	# --porcelain: 作成された記事のIDのみを出力
	post_id=$(php wp-cli.phar post create \
		--post_title="${title}" \
		--post_content="${full_content}" \
		--post_status=publish \
		--porcelain \
		--path=$WORDPRESS_PATH \
		--allow-root)

	# 画像番号をカスタムフィールドとして設定 ※存在の判定に使う
	php wp-cli.phar post meta add $post_id "image_number" "$image_basename" \
		--path=$WORDPRESS_PATH \
		--allow-root

	# 画像ファイルが存在する場合
	if [[ -f "$image_file" ]]; then
		# featured_image に設定する
		php wp-cli.phar media import "$image_file" \
			--post_id="$post_id" \
			--featured_image \
			--porcelain \
			--path=$WORDPRESS_PATH \
			--allow-root
	fi
}

# --------------------------------
# ファイルから各行を読み込み実行
# --------------------------------
# ファイルから1行ずつ読み取り、タブ (\t) を区切り文字として行を分割
# IFS = 区切り文字
while IFS=$'\t' read -r func_name image_basename title content extra; do
	# 一列目に post という文字列が存在する場合
	if [ "$func_name" = "post" ]; then
		# 1行をタブ文字で分割した文字列を渡して実行
		post_article "$image_basename" "$title" "$content" "$extra"
	fi
done < "/var/www/source/articles.txt"
