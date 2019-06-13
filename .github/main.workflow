workflow "Run ShellCheck, build and deploy report page to gh-pages" {
  on = "push"
  resolves = [
    "Run ShellCheck",
    "Deploy to gh-pages"
  ]
}


action "On master branch" {
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "Is valid commit" {
  uses = "./.github/actions/filter-commit-message"
  # This regex is run using "grep -P"
  args = "^(correção-|up:|fix:|add:)"
}


action "Run ShellCheck" {
  needs = ["On master branch"]
  uses = "ludeeus/action-shellcheck@master"
}


action "Install root dependencies" {
  uses = "actions/npm@master"
  args = "install"
}

action "Install and Build" {
  needs = ["Install root dependencies"]
  uses = "actions/npm@master"
  args = "run-script build-webpage"
}

action "Deploy to gh-pages" {
  needs = ["Is valid commit", "On master branch", "Install and Build"]
  uses = "JamesIves/github-pages-deploy-action@master"
  secrets = ["ACCESS_TOKEN"]
  env = {
    BASE_BRANCH = "master"
    BRANCH = "gh-pages"
    FOLDER = "webpage/dist"
  }
}

