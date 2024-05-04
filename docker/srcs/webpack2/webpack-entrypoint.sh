#!/bin/sh

echo "src/からpublic/にimg,css,htmlを複製中..."
npm run build
echo "起動中..."
npm run dev
