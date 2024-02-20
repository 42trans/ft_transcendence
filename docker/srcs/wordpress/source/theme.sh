#!/bin/bash
# srcs/wordpress/source/theme.sh
# -----------------------------------------------
# DEBUG
# -----------------------------------------------
# echo "theme.sh start"
# -------------------------------------
# theme
# -------------------------------------
THEME_DIR="/var/www/html/wp-content/themes/fukasawa/"
FUKASAWA_DIR="/var/www/fukasawa/"
# テーマのindex.phpが存在しない場合、ファイル移動
if [ ! -e "${THEME_DIR}index.php" ]; then
    if [ -d "${FUKASAWA_DIR}" ]; then
        mkdir -p "${THEME_DIR}"
        mv "${FUKASAWA_DIR}"* "${THEME_DIR}"
        chown -R www-data:www-data "${THEME_DIR}"
        rm -r "${FUKASAWA_DIR}"
    fi
fi
# テーマ　"fukasawa" をアクティブ化
php wp-cli.phar theme activate fukasawa --path="/var/www/html" --allow-root
