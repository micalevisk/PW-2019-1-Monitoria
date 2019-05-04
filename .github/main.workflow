workflow "Run shellcheck on all sh files" {
  on = "push"
  resolves = ["Shellcheck"]
}

action "Shellcheck" {
  uses = "ludeeus/action-shellcheck@master"
}
