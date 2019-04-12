#!/bin/bash
[ $# -lt 2 ] && { echo "USAGE: $0 <username> [turma]"; exit 1; }

username="${1,,}"
turma="${2%%/*}"

[ -d "./${turma}" ] || { echo "'./${turma}/' is not a directory." ; exit 2; }

git rm -rf --cached "./${turma}/${username}"
rm -rf ".git/modules/${turma}/${username}"

git submodule add -b master -- \
  "https://github.com/${username}/ProgWeb" \
  "./${turma}/${username}"
