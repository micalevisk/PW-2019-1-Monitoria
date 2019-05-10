#!/bin/bash

show_help_and_exit() {
  printf "USAGE: $0 <target_dir> <task-id>\\n"
  exit 1
}

[ $# -ne 2 ] && show_help_and_exit

TARGET_DIR="${1%%/*}"
TASK_ID="${2%%/*}"

LOOKUP_DIR_PATH="${TARGET_DIR}/__meta__/.duis.lookup/"
[ -d "${LOOKUP_DIR_PATH}" ] || { printf "'${LOOKUP_DIR_PATH}' is not a directory.\\n" ; exit 2; }

files_to_commit="$(git ls-files -t --others --modified "${LOOKUP_DIR_PATH}" | cut -d' ' -f2)"
[ -z "${files_to_commit}" ] && { printf "Nothing to stage.\\n"; exit 0; }

mapfile -t arrfiles <<< "$files_to_commit" ## will logs the files

to_username() { printf "@%s\\n" $(basename "$2" ".json") ; }
COMMIT_DESCRIPTION="$(mapfile -c 1 -C 'to_username' -t <<< "$files_to_commit")"

printf "%s\\n" "${arrfiles[@]}"

COMMIT_MSG="correção-${TASK_ID}: ${#arrfiles[@]} aluno(s)"

read -rsn1 -p 'Can add & commit? (y/N) ' can_commit
[ "${can_commit,,}" == "y" ] && {
  printf "\\n"
  git add "${LOOKUP_DIR_PATH}"
  git commit -m "${COMMIT_MSG}" -m "${COMMIT_DESCRIPTION}"
}
