# Git-push-all (gal)
`gal` is a small utility allowing you to quickly commit and push your entire git branch. Gal also automates setup of git credential storage with `libsecret` (works with Linux Arch-based distros only).

## Installation
```bash
$ npm install -g git-push-all
```
## Usage

### Key commands:

#### gal [-m | --message] [-r | --remote] [-b | --branch] [-a | --add-only] [-c | --commit-only] [-o | --add-commit-only] [-p | --push-only] [-l | --pull] [-v | --version] 

Running `gal` without options does the following:

```bash
$ git add -A
$ git commit -m <DEFAULT MESSAGE>
$ git push -u <DEFAULT REMOTE> <DEFAULT BRANCH>
```
The `<DEFAULT MESSAGE>` and `<DEFAULT REMOTE>` are saved in your `config.json` file. The `<DEFAULT BRANCH>` is your current branch. You can override the default settings with the `-m | --message`, `-r | remote` and `-b | --branch` options.

So:
```bash
$ gal -m My fancy commit message. -r some-remote -b some-branch
```
runs:
```bash
$ git add -A
$ git commit -m "My fancy commit message."
$ git push -u some-remote some-branch
```

#### gal M [-f | --from] [-t | --into] [-b | --branch] [-n | --no-push] 

Running `gal M` without options does the following:

```bash
$ git checkout <DEFAULT INTO BRANCH>
$ git merge <DEFAULT FROM BRANCH>
$ git push -u <DEFAULT REMOTE> <DEFAULT INTO BRANCH>
```
The `<DEFAULT INTO BRANCH>` is `master` and the `<DEFAULT FROM BRANCH>` is the current branch. The `<DEFAULT FROM BRANCH>` is saved in your `config.json` file.  You can override the default settings with the `-f | --from`, `-t | --into` and `-r | --remote` options.

So:
```bash
$ gal -f first-branch -t second-branch -r some-remote
```
runs:
```bash
$ git checkout second-branch
$ git merge first-branch
$ git push -u some-remote second-branch
```

The `[n | --no-push]` option will prevent the push at the end.

#### gal config [-m | --message] [-r | --remote] 
Running this command without options prints your `config.json` file, which contains your default remote and commit message. You can change the default settings with the `-m | --message` and `-r | remote` options.

So:
```bash
$ gal config -m My fancy new default commit message -r new-default-remote
$ gal config
{
  "remote": "new-default-remote",
  "message": "My fancy new default commit message"
}
```

#### gal store
 Automatically sets up git credential storage with `libsecret`. The latest `libsecret` dev files will be installed and the necessary files and folders will be donwloaded and made automatically if not already on your machine. Next time you enter some credentials using git (like your GitHub username and password when on your next push), they will be encrypted and saved on your machine. This will make your future pushes much quicker and easier, since you won't have to type your username and password anymore! For now, this feature konly works on Linux Debian-based distros.

### More features
Run `gal --help` for a full list of commands and `gal <command> --help` for a full list of options for the desired command.

### Thanks for reading, and hope you enjoy using gal!
