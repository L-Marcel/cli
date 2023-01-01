# l-marcel: cli

My own CLI to manage my projects.

[pt-br](https://github.com/L-Marcel/cli/blob/master/README.md) • [github](https://github.com/L-Marcel/cli) • [l-marcel](https://github.com/L-Marcel)

To use you need to install the [GitHub CLI](https://cli.github.com/)! After, you can install running:
```
npm i -g @lmarcel/cli
```

### Commands
```
login [options]                          | login with github, it's required
logout [hostname]                        | logged out of github account
status [hostname]                        | check your authentication state
create [options] [name] [formattedName]  | create a new project and clone the repository
clone <name> [path]                      | clone a github repository
push <message> [dir]                     | create a commit and push ALL changes
help [command]                           | display help for command
```
