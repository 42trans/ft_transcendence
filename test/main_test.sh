TEST_DIR="test/"
#=======================================================
# include
#=======================================================
if [ -z "$COLOR_SH" ]; then
  source "${TEST_DIR}color.sh"
  COLOR_SH=true
fi
#=======================================================
echo "${ESC}${BG_PINK}"
echo "start test"
echo "${ESC}[m"
echo "${ESC}${COLOR198}"
echo "=============="
echo "postgres test"
echo "=============="
bash ./test/postgres/sample.sh
echo "${ESC}${COLOR180}"
echo "=============="
echo "django test"
echo "=============="
bash ./test/django/sample_django.sh
echo "${ESC}${COLOR183}"
echo "=============="
echo "bootstrap test"
echo "=============="
bash ./test/bootstrap/sample_bootstrap.sh
echo "${ESC}${COLOR201}"
echo "=============="
echo "pgadmin test"
echo "=============="
bash ./test/pgadmin/sample.pgadmin.sh
echo "${ESC}${COLOR198}"
echo "=============="
echo "ELK test"
echo "=============="
bash ./test/ELK/sample_ELK.sh
echo "${ESC}[m"
