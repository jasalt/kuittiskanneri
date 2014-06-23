See www.trello.com.

# Hooks that should work..
## .git/hooks/pre-push

#!/bin/sh
echo "notifying #koodianalyysiluola"

str=Kuittiskanneri updated: `git log --pretty=oneline --abbrev-commit -1`

curl -d str ec2-54-187-253-173.us-west-2.compute.amazonaws.com:8422/channels/koodianalyysiluola

exit 0

