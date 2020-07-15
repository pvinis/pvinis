This needs a few components to work.

At a high level it's three components. First is a `pre-push` git hook, to grab all the commits we will push, then a bad word detector to go through the commit messages, and lastly a script to update this repo.

Details:

1. git hook
hooksPath

2. Bad word detector
This is a small nodejs script located [here](./detector/index.js)

3. Update script
