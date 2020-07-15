This needs a few components to work.

At a high level it's three components. First is a `pre-push` git hook, to grab all the commits we will push, then a bad word detector to go through the commit messages, and lastly a script to update this repo.

Details:

1. Git hook
This is a strange step here, but here's what I want it to do, and how it does it.

Every time I push, I want a hook to run and send all the new commit messages to a bad word detector. I want this to happen for every repo and every commit I push. For that I need a global git hook. Unfortunately git only supports having git hooks in your repo, which means I would need to add a hook in every repo ever, not my style. Git also supports having global hooks, which is great, but that makes every repo hook useless because it is never called.

What I ended up doing is I made a global hook that does what I want, and then, as its last command, checks if there is a repo hook and calls that too.

By adding
```
[core]
	hooksPath = /Users/pavlos/.config/git/hooks
```
I declare where git should look for hooks. Inside there I have the [`pre-push`](./hook/pre-push) hook, which grabs all the new commits to be pushed and with them it makes a new file `/tmp/pvinis-commits` in the form of
```
git@github.com:pvinis/some-repo.git
13b842thehash948c::::the message
74b821thehash68f6::::other message
```

Lastly, it checks and calls the `pre-push` hook of whatever repo I happen to be in when I run `git push`.


2. Bad word detector
This is a small nodejs script located [here](./detector/index.js).

Initially it grabs all the info from `/tmp/pvinis-commits` and extracts all the info, like `repo` is `pvinis/some-repo`, and `commits` is `[{ message: 'the message', hash: '13b842thehash948c' }, { message: '..', hash: '..' }, ..]`.
Then it goes through all the `commits` and finds if there is any bad word in the message. If there is any, it will create a new file `/tmp/pvinis-commits-data.json` and put the data of the naughty commit message, to be used by the updater script. It then calls the updater script. If there is no naughty commit then it will make sure to delete the json file.

3. Updater script
This is a very simple script located [here](./scripts/update.sh).

It takes the json file with the data of the naughty commit and uses the [`README.md.tmpl`](./README.md.tmpl) file to create a fresh [`README.md`](./README.md) file. It commits and pushs, and we are done 😄! Fresh bad words on my profile.
