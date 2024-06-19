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
my_func_cmp() {
	if [ "$1" == "$2" ]; then
		echo -e "${ESC}${GREEN}"
		echo -e "OK"
		echo -e "${NC}"
	else
		echo -e "${ESC}${RED}"
		echo -e "NG"
		echo -e "${NC}"
	fi
}