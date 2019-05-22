workflow "Run shellcheck on all sh files" {
  on = "push"
  resolves = ["Shellcheck"]
}

# Filter for branch `master`
action "Master" {
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "Shellcheck" {
  needs = "Master"
  uses = "ludeeus/action-shellcheck@master"
}

