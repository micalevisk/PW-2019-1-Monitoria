#!/bin/bash

show_help_and_exit() {
  printf "USAGE: %s {add <target_dir> <username> [repo-name] | pull}\\n" "$0"
  exit 1
}


[ $# -lt 1 ] && show_help_and_exit

command="${1,,}"

if [ "$command" == "add" ]; then
  [ $# -lt 3 ] && show_help_and_exit

  TARGET_DIR="${2%%/*}"
  USERNAME="${3,,}"
  REPO_NAME="${4:-ProgWeb}"

  [ -d "${TARGET_DIR}" ] || { printf "'%s' is not a directory.\\n" "$TARGET_DIR" ; exit 2; }

  git rm -rf --cached "${TARGET_DIR}/${USERNAME}"
  rm -rf ".git/modules/${TARGET_DIR#*/}/${USERNAME}"

  git submodule add -b "master" -- \
    "https://github.com/${USERNAME}/${REPO_NAME}" \
    "${TARGET_DIR}/${USERNAME}"

  [ $? -ne 0 ] && exit 3

  read -rsn1 -p 'Can commit? (y/N) ' can_commit
  [ "${can_commit,,}" == "y" ] && {
    printf "\\n"
    COMMIT_MSG="add: submodule @${USERNAME}"
    git commit -m "${COMMIT_MSG}"
  }

elif [ "$command" == "pull" ]; then
  git submodule update --recursive --remote
fi
