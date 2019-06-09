workflow "Run ShellCheck, build and deploy report page to gh-pages" {
  on = "push"
  resolves = [
    "Shellcheck",
    "Deploy"
  ]
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


action "Install and Build" {
  uses = "actions/npm@master"
  args = "build-webpage"
}

action "Deploy" {
  needs = ["Master", "Install and Build"]
  uses = "JamesIves/github-pages-deploy-action@master"
  secrets = ["ACCESS_TOKEN"]
  env = {
    BASE_BRANCH = "master"
    BRANCH = "gh-pages"
    FOLDER = "webpages/dist"
  }
}
