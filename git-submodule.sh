#!/bin/bash

show_help_and_exit() {
  echo "USAGE: $0 {add <turma> <username> | pull}"
  exit 1
}


[ $# -lt 1 ] && show_help_and_exit

command="${1,,}"

if [ $command == "add" ]; then
  [ $# -ne 3 ] && show_help_and_exit

  turma="${2%%/*}"
  username="${3,,}"

  [ -d "./${turma}" ] || { echo "'./${turma}/' is not a directory." ; exit 2; }

  git rm -rf --cached "./${turma}/${username}"
  rm -rf ".git/modules/${turma}/${username}"

  git submodule add -b master -- \
    "https://github.com/${username}/ProgWeb" \
    "./${turma}/${username}"
elif [ "$command" == "pull" ]; then
  git submodule update --recursive --remote
fi
